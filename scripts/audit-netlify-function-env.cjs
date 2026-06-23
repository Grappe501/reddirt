#!/usr/bin/env node
/** Print Netlify function-scoped env byte budget (for deploy debugging). */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  estimateNetlifyApiFunctionEnvBytes,
  FEATURE_FLAGS_TYPICAL_BYTES,
  LAMBDA_ENV_LIMIT_BYTES,
  isBuildOnlyKey,
} = require("./verify-netlify-lambda-env-budget.cjs");

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
  console.error("Missing NETLIFY_AUTH_TOKEN");
  process.exit(1);
}

function resolveSiteId() {
  const fromEnv = process.env.NETLIFY_SITE_ID?.trim();
  if (fromEnv) return fromEnv;
  const siteId = readJson(path.join(process.cwd(), ".netlify", "state.json"))?.siteId?.trim();
  if (siteId) return siteId;
  console.error("Missing NETLIFY_SITE_ID");
  process.exit(1);
}

async function main() {
  const token = resolveAuthToken();
  const siteId = resolveSiteId();
  const site = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  const rows = await fetch(
    `https://api.netlify.com/api/v1/accounts/${site.account_id}/env?site_id=${siteId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  ).then((r) => r.json());

  const { runtime, rows: runtimeRows } = estimateNetlifyApiFunctionEnvBytes(rows);
  const withFlags = runtime + FEATURE_FLAGS_TYPICAL_BYTES;

  console.log(`Site: ${site.name}`);
  console.log(`Function-scoped env: ${runtime} B (${(runtime / 1024).toFixed(2)} KB)`);
  console.log(`+ FEATURE_FLAGS (compat mode): ~${FEATURE_FLAGS_TYPICAL_BYTES} B → ${withFlags} B`);
  console.log(`Lambda compat limit: ${LAMBDA_ENV_LIMIT_BYTES} B`);
  console.log(`Over compat cap: ${withFlags > LAMBDA_ENV_LIMIT_BYTES ? "YES — deploy will fail on compat mode" : "no (runtime alone)"}`);
  console.log("");
  console.log("Function-scoped vars:");
  for (const r of runtimeRows) {
    console.log(`  ${r.key}: ${r.bytes} B${r.optional ? " (optional)" : ""}${isBuildOnlyKey(r.key) ? " [should be builds-only!]" : ""}`);
  }

  const leakingBuildOnly = rows.filter((row) => {
    const reaches = (row.scopes ?? []).some((s) => s === "functions" || s === "all");
    return reaches && isBuildOnlyKey(row.key);
  });
  if (leakingBuildOnly.length) {
    console.log("");
    console.log("Build-only keys still scoped to Functions:");
    for (const row of leakingBuildOnly) {
      console.log(`  ${row.key} → scopes: ${(row.scopes ?? []).join(", ")}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
