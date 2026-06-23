#!/usr/bin/env node
/**
 * Remove UI-pinned @netlify/plugin-nextjs so Netlify uses unpinned OpenNext (no 4 KB Lambda env cap).
 *
 * Symptom: build fails at lambda-env-guard with FEATURE_FLAGS ~9 KB on Lambda compatibility mode.
 *
 * After unpinning in UI, keep [[plugins]] package = "@netlify/plugin-nextjs" first in netlify.toml
 * (unversioned) — disabling UI-only without netlify.toml leaves no ___netlify-server-handler.
 *
 * Usage (from RedDirt/):
 *   NETLIFY_AUTH_TOKEN=... NETLIFY_SITE_ID=... node scripts/netlify-unpin-nextjs-runtime.cjs
 *   node scripts/netlify-unpin-nextjs-runtime.cjs --dry-run
 *
 * Manual fallback (no API token):
 *   Netlify UI → Site configuration → Build & deploy → Build plugins → Disable "@netlify/plugin-nextjs"
 *   OR Build settings → Runtime → Remove Next.js runtime, save, then re-add framework if needed.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const API = "https://api.netlify.com/api/v1";
const PLUGIN_PACKAGE = "@netlify/plugin-nextjs";
const dryRun = process.argv.includes("--dry-run");

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

async function api(token, method, apiPath, body) {
  const res = await fetch(`${API}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { ok: res.ok, status: res.status, json, text };
}

function printManualSteps(siteName) {
  console.log("");
  console.log(`Manual steps for ${siteName ?? "your site"} (required if API unpin fails):`);
  console.log("  1. Netlify UI → Site configuration → Build & deploy → Build plugins");
  console.log('  2. Find "@netlify/plugin-nextjs" → Disable');
  console.log("  3. Also check **Build settings → Runtime** → **Remove** pinned Next.js runtime, save, re-select Next.js, save");
  console.log("  4. Ensure netlify.toml does NOT declare [[plugins]] @netlify/plugin-nextjs");
  console.log("  5. Deploys → Clear cache and deploy site");
  console.log("");
}

async function main() {
  const token = resolveAuthToken();
  const siteId = resolveSiteId();

  const siteRes = await api(token, "GET", `/sites/${siteId}`);
  if (!siteRes.ok) {
    console.error(`Failed to load site ${siteId}: HTTP ${siteRes.status}`);
    process.exit(1);
  }
  const site = siteRes.json;
  console.log(`Site: ${site.name} (${siteId})`);
  const framework = site.build_settings?.framework ?? site.framework ?? "(unknown)";
  console.log(`Framework: ${framework}`);

  const pluginsRes = await api(token, "GET", `/sites/${siteId}/plugins`);
  if (pluginsRes.ok && Array.isArray(pluginsRes.json)) {
    const nextPlugins = pluginsRes.json.filter((p) =>
      String(p.package ?? p.name ?? "").includes("plugin-nextjs"),
    );
    if (pluginsRes.json.length === 0) {
      console.log("Installed plugins (API): none");
    } else {
      console.log("Installed plugins (API):");
      for (const p of pluginsRes.json) {
        console.log(`  - ${p.package ?? p.name ?? JSON.stringify(p)}`);
      }
    }
    if (nextPlugins.length === 0) {
      console.log(
        "No @netlify/plugin-nextjs via plugins API — if deploy still hits Lambda compat env cap, reset Runtime in Netlify UI (Build settings → Runtime → Remove, save, re-select Next.js, save).",
      );
    }
  } else if (!pluginsRes.ok) {
    console.warn(`Could not list plugins: HTTP ${pluginsRes.status}`);
  }

  const encoded = encodeURIComponent(PLUGIN_PACKAGE);
  if (dryRun) {
    console.log(`[dry-run] Would DELETE /sites/${siteId}/plugins/${encoded}`);
    printManualSteps(site.name);
    return;
  }

  const delRes = await api(token, "DELETE", `/sites/${siteId}/plugins/${encoded}`);
  if (delRes.ok || delRes.status === 204 || delRes.status === 404) {
    console.log(
      delRes.status === 404
        ? "Plugin not installed via API (may already be removed) — confirm in Netlify UI."
        : "Removed @netlify/plugin-nextjs via API. Next build should use auto OpenNext adapter.",
    );
    console.log("Trigger: Deploys → Clear cache and deploy site.");
    return;
  }

  console.warn(`DELETE plugin failed: HTTP ${delRes.status}`);
  if (delRes.text) console.warn(String(delRes.text).slice(0, 500));
  printManualSteps(site.name);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
