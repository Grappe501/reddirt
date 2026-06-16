#!/usr/bin/env node
/**
 * Advisory check: estimate runtime env vars that may reach ___netlify-server-handler.
 * AWS Lambda compatibility mode caps env at ~4096 bytes (Netlify removed this limit on
 * the modern Functions runtime — see netlify.com/changelog/2026-06-12).
 *
 * FEATURE_FLAGS is NOT a user env var — Netlify injects ~9 KB of internal platform JSON
 * during builds (Next runtime rollout flags). It is excluded from this estimate.
 */
const LAMBDA_ENV_LIMIT_BYTES = 4096;
const WARN_BYTES = 3500;

/** Scope to Builds only in Netlify UI (not Functions / All). */
const BUILD_ONLY_HINTS = [
  "PRISMA_MIGRATE_",
  "PRISMA_RESOLVE_",
  "ALLOW_PRISMA_",
  "SKIP_DB_SEED",
  "NPM_CONFIG_",
  "NETLIFY_DATABASE_URL",
  "NODE_OPTIONS",
];

/** Netlify-internal build injections — never user-configured site env vars. */
const NETLIFY_INTERNAL = new Set([
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
    k.startsWith("npm_") ||
    k.startsWith("_") ||
    k.startsWith("netlify_build_") ||
    k.startsWith("vscode_") ||
    k.startsWith("cursor_")
  );
}

function isExcludedFromLambdaBudget(key) {
  return NETLIFY_INTERNAL.has(key) || BUILD_ONLY_HINTS.some((p) => key.startsWith(p) || key === p);
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
    rows.push({ key, bytes, excluded });
  }
  rows.sort((a, b) => b.bytes - a.bytes);
  return { total, totalRaw, rows };
}

function main() {
  const { total, totalRaw, rows } = estimateLambdaEnvBytes();
  const featureFlags = rows.find((r) => r.key === "FEATURE_FLAGS");

  console.log(
    `>>> Lambda env advisory: ~${total} bytes (${(total / 1024).toFixed(2)} KB) estimated runtime vars (AWS Lambda compat limit ${LAMBDA_ENV_LIMIT_BYTES} bytes)`,
  );

  if (featureFlags) {
    console.log(
      `>>> FEATURE_FLAGS (${featureFlags.bytes} B) is Netlify-internal platform JSON — not in your site env; safe to ignore.`,
    );
  }

  const runtimeRows = rows.filter((r) => !r.excluded).slice(0, 10);
  if (runtimeRows.length > 0) {
    console.log(">>> Your runtime-scoped vars (estimate):");
    for (const r of runtimeRows) {
      console.log(`    ${r.key}: ${r.bytes} B`);
    }
  }

  if (total >= WARN_BYTES) {
    console.warn("");
    console.warn(">>> WARNING: runtime env estimate is near the 4 KB Lambda compat cap.");
    console.warn(">>> Netlify UI → Environment variables → scope PRISMA_*, ALLOW_*, SKIP_DB_SEED, NODE_OPTIONS to Builds only.");
    console.warn(">>> Also check Team settings → Environment variables for shared vars scoped to Functions.");
  }

  if (total >= LAMBDA_ENV_LIMIT_BYTES) {
    console.warn("");
    console.warn(">>> Deploy may fail on Lambda compatibility mode if these vars are scoped to Functions/All.");
    console.warn(">>> Netlify removed the 4 KB cap on the modern Functions runtime (June 2026) — contact support if deploy still fails.");
  }

  // Advisory only — never fail the build on this estimate.
  void totalRaw;
}

main();
