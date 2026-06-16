#!/usr/bin/env node
/**
 * AWS Lambda allows ~4096 bytes total for environment variables (keys + values).
 * Netlify injects site env vars scoped to "Functions" or "All" into ___netlify-server-handler.
 * Build-only vars (Prisma retries, bypass flags) must be scoped to "Builds" in Netlify UI.
 */
const LAMBDA_ENV_LIMIT_BYTES = 4096;
const WARN_BYTES = 3800;
const FAIL_BYTES = 4050;

/** Vars that should be scoped to Builds only in Netlify UI (never Functions). */
const BUILD_ONLY_HINTS = [
  "PRISMA_MIGRATE_",
  "PRISMA_RESOLVE_",
  "ALLOW_PRISMA_",
  "SKIP_DB_SEED",
  "NPM_CONFIG_",
  "NETLIFY_DATABASE_URL",
  "NODE_OPTIONS",
];

/** Netlify build-time injections — not needed at Lambda runtime; exclude from budget estimate. */
const NETLIFY_BUILD_INJECTIONS = new Set([
  "FEATURE_FLAGS",
  "NETLIFY_SKEW_PROTECTION_TOKEN",
  "NETLIFY_BUILD_BASE",
  "NETLIFY_BUILD_ID",
  "NETLIFY_LOCAL",
]);

function isRuntimeNoiseKey(key) {
  const k = key.toLowerCase();
  return (
    k === "path" ||
    k === "home" ||
    k === "pwd" ||
    k === "shlvl" ||
    k === "shell" ||
    k === "term" ||
    k === "lang" ||
    k.startsWith("npm_") ||
    k.startsWith("_") ||
    k.startsWith("netlify_build_") ||
    k.startsWith("vscode_") ||
    k.startsWith("cursor_") ||
    k.startsWith("psmodulepath") ||
    k.startsWith("windir") ||
    k.startsWith("systemroot") ||
    k.startsWith("userprofile") ||
    k.startsWith("programfiles") ||
    k.startsWith("comspec") ||
    k.startsWith("chocolatey") ||
    k.startsWith("localappdata") ||
    k.startsWith("appdata")
  );
}

function isBuildOnlyKey(key) {
  return BUILD_ONLY_HINTS.some((p) => key.startsWith(p) || key === p);
}

function isExcludedFromLambdaBudget(key) {
  return NETLIFY_BUILD_INJECTIONS.has(key) || isBuildOnlyKey(key);
}

function estimateLambdaEnvBytes(env = process.env) {
  let total = 0;
  let totalRaw = 0;
  const rows = [];
  for (const [key, value] of Object.entries(env)) {
    if (isRuntimeNoiseKey(key)) continue;
    const val = value ?? "";
    const bytes = Buffer.byteLength(key, "utf8") + Buffer.byteLength(val, "utf8");
    totalRaw += bytes;
    const excluded = isExcludedFromLambdaBudget(key);
    if (!excluded) total += bytes;
    rows.push({ key, bytes, excluded, buildOnly: isBuildOnlyKey(key) });
  }
  rows.sort((a, b) => b.bytes - a.bytes);
  return { total, totalRaw, rows };
}

function main() {
  const { total, totalRaw, rows } = estimateLambdaEnvBytes();
  console.log(
    `>>> Lambda env budget estimate: ${total} bytes (${(total / 1024).toFixed(2)} KB) runtime vars — AWS limit ${LAMBDA_ENV_LIMIT_BYTES} bytes`,
  );
  if (totalRaw !== total) {
    console.log(`>>> (Build process total ${totalRaw} bytes — ${totalRaw - total} bytes excluded as build-only / Netlify injections)`);
  }

  const featureFlags = rows.find((r) => r.key === "FEATURE_FLAGS");
  if (featureFlags && featureFlags.bytes > 500) {
    console.warn("");
    console.warn(
      `>>> CRITICAL: FEATURE_FLAGS is ${featureFlags.bytes} bytes alone (limit ${LAMBDA_ENV_LIMIT_BYTES}).`,
    );
    console.warn(">>> Netlify → Environment variables → delete FEATURE_FLAGS or scope to Builds only.");
    console.warn(">>> If scoped to All or Functions, deploy fails with Invalid AWS Lambda parameters.");
  }

  const buildOnlyPresent = rows.filter((r) => r.buildOnly && r.bytes > 0);
  if (buildOnlyPresent.length > 0) {
    console.log(">>> Build-only vars (scope to Builds in Netlify UI, not Functions):");
    for (const r of buildOnlyPresent.slice(0, 8)) {
      console.log(`    ${r.key} (${r.bytes} B)`);
    }
  }

  const runtimeRows = rows.filter((r) => !r.excluded).slice(0, 8);
  if (runtimeRows.length > 0) {
    console.log(">>> Largest runtime env vars (estimated Lambda payload):");
    for (const r of runtimeRows) {
      console.log(`    ${r.key}: ${r.bytes} B`);
    }
  }

  if (featureFlags && featureFlags.bytes > LAMBDA_ENV_LIMIT_BYTES) {
    console.warn("");
    console.warn("========================================================================");
    console.warn(`  FEATURE_FLAGS is ${featureFlags.bytes} bytes — over the Lambda 4 KB cap.`);
    console.warn("  If scoped to All or Functions, deploy WILL fail.");
    console.warn("  Netlify → Environment variables → delete FEATURE_FLAGS");
    console.warn("  or set scope to Builds only, then redeploy.");
    console.warn("========================================================================");
  }

  if (total >= FAIL_BYTES) {
    console.error("");
    console.error("========================================================================");
    console.error("  Netlify deploy may fail: runtime Lambda env vars exceed ~4 KB.");
    console.error("  Netlify → Site configuration → Environment variables");
    console.error("  Scope PRISMA_*, ALLOW_*, SKIP_DB_SEED, NODE_OPTIONS to Builds only.");
    console.error("========================================================================");
    process.exit(1);
  }

  if (total >= WARN_BYTES) {
    console.warn("");
    console.warn(">>> WARNING: Lambda env budget is near the 4 KB cap. Review Netlify variable scoping.");
  }
}

main();
