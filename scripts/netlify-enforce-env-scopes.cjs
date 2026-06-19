#!/usr/bin/env node
/**
 * Enforce Netlify env var scopes so build-only keys never reach ___netlify-server-handler.
 * Fixes deploy failure: Invalid AWS Lambda parameters (4 KB Lambda env cap on compat mode).
 *
 * Usage (from RedDirt/):
 *   NETLIFY_AUTH_TOKEN=... NETLIFY_SITE_ID=... node scripts/netlify-enforce-env-scopes.cjs
 *   node scripts/netlify-enforce-env-scopes.cjs --dry-run
 *
 * Get a token: Netlify UI → User settings → Applications → Personal access tokens.
 * Site ID: Site configuration → General → Site details → Site ID.
 */
const {
  isBuildOnlyKey,
  RUNTIME_ESSENTIAL,
} = require("./verify-netlify-lambda-env-budget.cjs");

const API = "https://api.netlify.com/api/v1";
const dryRun = process.argv.includes("--dry-run");

function required(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing ${name}. See docs/NETLIFY_FIRST_DEPLOY.md §6.`);
    process.exit(1);
  }
  return v;
}

async function api(token, path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} → ${res.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body;
}

function desiredScopes(key) {
  if (isBuildOnlyKey(key)) return ["builds"];
  if (RUNTIME_ESSENTIAL.includes(key)) return ["builds", "functions"];
  // Unknown keys: keep builds + functions if used at build (e.g. DATABASE_URL already covered)
  return ["builds", "functions"];
}

function scopesEqual(a, b) {
  const sa = [...new Set(a)].sort().join(",");
  const sb = [...new Set(b)].sort().join(",");
  return sa === sb;
}

async function main() {
  const token = required("NETLIFY_AUTH_TOKEN");
  const siteId = required("NETLIFY_SITE_ID");

  const site = await api(token, `/sites/${siteId}`);
  const accountId = site.account_id;
  console.log(`Site: ${site.name} (${siteId}) account: ${accountId}`);

  const envVars = await api(token, `/accounts/${accountId}/env?site_id=${siteId}`);
  if (!Array.isArray(envVars) || envVars.length === 0) {
    console.log("No account env vars for this site (check team-level shared vars in Netlify UI).");
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const row of envVars) {
    const key = row.key;
    const current = row.scopes ?? [];
    const target = desiredScopes(key);

    if (scopesEqual(current, target)) {
      skipped += 1;
      continue;
    }

    // Only auto-narrow build-only keys; never strip functions from runtime essentials.
    if (!isBuildOnlyKey(key)) {
      skipped += 1;
      continue;
    }

    console.log(`${dryRun ? "[dry-run] " : ""}${key}: ${current.join(",") || "(none)"} → ${target.join(",")}`);

    if (!dryRun) {
      await api(token, `/accounts/${accountId}/env/${encodeURIComponent(key)}?site_id=${siteId}`, {
        method: "PUT",
        body: JSON.stringify({
          key,
          scopes: target,
          values: row.values,
          is_secret: row.is_secret,
        }),
      });
    }
    updated += 1;
  }

  console.log("");
  console.log(`Done. ${updated} build-only var(s) ${dryRun ? "would be" : ""} scoped to Builds only; ${skipped} unchanged.`);
  if (updated > 0 && !dryRun) {
    console.log("Redeploy: Netlify UI → Deploys → Clear cache and deploy site.");
  }
  if (updated === 0) {
    console.log("If deploy still fails with Invalid AWS Lambda parameters:");
    console.log("  1. Check Team settings → Environment variables (shared All/Functions scope).");
    console.log("  2. Confirm NODE_OPTIONS is not set in Netlify UI (heap is set in netlify-build.sh only).");
    console.log("  3. Ask Netlify support to confirm modern Functions runtime (not Lambda compat mode).");
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
