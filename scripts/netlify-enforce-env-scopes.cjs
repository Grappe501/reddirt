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
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  isBuildOnlyKey,
  RUNTIME_ESSENTIAL,
  RUNTIME_OPTIONAL_FOR_LAUNCH,
} = require("./verify-netlify-lambda-env-budget.cjs");

const API = "https://api.netlify.com/api/v1";
const dryRun = process.argv.includes("--dry-run");
const triggerDeploy = process.argv.includes("--deploy");
const deployOnly = process.argv.includes("--deploy-only");
const launchMinimal = process.argv.includes("--launch-minimal");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function resolveAuthToken() {
  const fromEnv = process.env.NETLIFY_AUTH_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  const configPaths = [
    path.join(os.homedir(), ".config", "netlify", "config.json"),
    path.join(os.homedir(), ".netlify", "config.json"),
    path.join(process.env.APPDATA ?? "", "netlify", "Config", "config.json"),
  ].filter(Boolean);

  for (const configPath of configPaths) {
    const config = readJson(configPath);
    const users = config?.users;
    if (!users || typeof users !== "object") continue;
    for (const user of Object.values(users)) {
      const token = user?.auth?.token?.trim();
      if (token) return token;
    }
  }

  console.error("Missing NETLIFY_AUTH_TOKEN. Run `npx netlify login` or set a personal access token.");
  process.exit(1);
}

function resolveSiteId() {
  const fromEnv = process.env.NETLIFY_SITE_ID?.trim();
  if (fromEnv) return fromEnv;

  const statePaths = [
    path.join(process.cwd(), ".netlify", "state.json"),
    path.join(process.cwd(), "RedDirt", ".netlify", "state.json"),
  ];
  for (const statePath of statePaths) {
    const siteId = readJson(statePath)?.siteId?.trim();
    if (siteId) return siteId;
  }

  console.error("Missing NETLIFY_SITE_ID. Run `npx netlify link` from RedDirt/ or set the site ID.");
  process.exit(1);
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

function isRuntimeEssentialRequired(key) {
  return RUNTIME_ESSENTIAL.includes(key) && !RUNTIME_OPTIONAL_FOR_LAUNCH.has(key);
}

function desiredScopes(key) {
  if (isBuildOnlyKey(key)) return ["builds"];
  if (launchMinimal && RUNTIME_OPTIONAL_FOR_LAUNCH.has(key)) return ["builds"];
  if (isRuntimeEssentialRequired(key)) return ["builds", "functions"];
  // Unknown keys: keep builds + functions if used at build (e.g. DATABASE_URL already covered)
  return ["builds", "functions"];
}

function scopesEqual(a, b) {
  const sa = [...new Set(a)].sort().join(",");
  const sb = [...new Set(b)].sort().join(",");
  return sa === sb;
}

async function triggerClearCacheDeploy(token, siteId) {
  const recent = await api(token, `/sites/${siteId}/deploys?per_page=3`);
  if (Array.isArray(recent)) {
    const inFlight = recent.find(
      (d) =>
        d.state === "building" ||
        d.state === "uploading" ||
        d.state === "processing" ||
        d.state === "preparing",
    );
    const published = recent.find((d) => d.state === "ready" && d.published_at);
    if (inFlight) {
      console.log(
        `Skip clear-cache trigger — deploy already in progress: ${inFlight.id} (${inFlight.state})`,
      );
      return inFlight;
    }
    if (published && Date.now() - Date.parse(published.published_at) < 15 * 60 * 1000) {
      console.log(
        `Skip clear-cache trigger — production already published recently: ${published.id} at ${published.published_at}`,
      );
      return published;
    }
  }

  const build = await api(token, `/sites/${siteId}/builds?clear_cache=true`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  console.log(`Triggered clear-cache deploy: ${build.id ?? "(pending)"} — ${build.deploy_url ?? build.url ?? "watch Netlify UI"}`);
  return build;
}

async function main() {
  const token = resolveAuthToken();
  const siteId = resolveSiteId();

  if (deployOnly) {
    console.log(`Site: ${siteId} — clear-cache production deploy`);
    await triggerClearCacheDeploy(token, siteId);
    return;
  }

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
  let leaking = 0;

  for (const row of envVars) {
    const key = row.key;
    const current = row.scopes ?? [];
    const target = desiredScopes(key);
    const reachesFunctions = current.some((s) => s === "functions" || s === "all");

    if (isBuildOnlyKey(key) && reachesFunctions) {
      leaking += 1;
    }

    const needsRuntimeWiden = isRuntimeEssentialRequired(key) && !reachesFunctions;
    const needsNarrow =
      (isBuildOnlyKey(key) && reachesFunctions) ||
      (launchMinimal && RUNTIME_OPTIONAL_FOR_LAUNCH.has(key) && reachesFunctions);

    if (!needsRuntimeWiden && !needsNarrow) {
      skipped += 1;
      continue;
    }

    if (scopesEqual(current, target)) {
      skipped += 1;
      continue;
    }

    console.log(`${dryRun ? "[dry-run] " : ""}${key}: ${current.join(",") || "(none)"} → ${target.join(",")}${needsRuntimeWiden ? " (runtime essential)" : ""}`);

    if (key === "NODE_OPTIONS" && !dryRun) {
      console.log("  (Remove NODE_OPTIONS from Netlify UI entirely if possible — scripts/netlify-build.sh sets heap during next build only.)");
    }

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
  console.log(
    `Done. ${updated} env var(s) ${dryRun ? "would be" : ""} re-scoped (${leaking} build-only leak(s) remaining); ${skipped} unchanged.`,
  );
  if (leaking > 0 && updated === 0 && dryRun) {
    console.log(`${leaking} build-only var(s) still reach Functions — rerun without --dry-run to narrow scopes.`);
  }
  if (updated > 0 && !dryRun && !triggerDeploy) {
    console.log("Redeploy: Netlify UI → Deploys → Clear cache and deploy site, or rerun with --deploy.");
  }

  if (triggerDeploy && !dryRun) {
    console.log("");
    console.log(">>> Triggering clear-cache production deploy");
    await triggerClearCacheDeploy(token, siteId);
  } else if (triggerDeploy && dryRun) {
    console.log("[dry-run] Would trigger clear-cache deploy after scoping.");
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
