#!/usr/bin/env node
/**
 * AWS Lambda allows ~4096 bytes total for environment variables (keys + values).
 * Netlify injects site env vars scoped to "Functions" or "All" into ___netlify-server-handler.
 * Build-only vars (Prisma retries, bypass flags) must be scoped to "Builds" in Netlify UI.
 */
const LAMBDA_ENV_LIMIT_BYTES = 4096;
/** Safety margin — Netlify/AWS metadata overhead varies slightly. */
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
];

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

function estimateLambdaEnvBytes(env = process.env) {
  let total = 0;
  const rows = [];
  for (const [key, value] of Object.entries(env)) {
    if (isRuntimeNoiseKey(key)) continue;
    const val = value ?? "";
    const bytes = Buffer.byteLength(key, "utf8") + Buffer.byteLength(val, "utf8");
    total += bytes;
    rows.push({ key, bytes, buildOnly: BUILD_ONLY_HINTS.some((p) => key.startsWith(p) || key === p) });
  }
  rows.sort((a, b) => b.bytes - a.bytes);
  return { total, rows };
}

function main() {
  const { total, rows } = estimateLambdaEnvBytes();
  const kb = (total / 1024).toFixed(2);
  console.log(`>>> Lambda env budget estimate: ${total} bytes (${kb} KB) — AWS limit ${LAMBDA_ENV_LIMIT_BYTES} bytes`);

  const buildOnlyPresent = rows.filter((r) => r.buildOnly && r.bytes > 0);
  if (buildOnlyPresent.length > 0) {
    console.log(">>> Build-only vars present in this process (scope to Builds in Netlify UI, not Functions):");
    for (const r of buildOnlyPresent.slice(0, 12)) {
      console.log(`    ${r.key} (${r.bytes} B)`);
    }
  }

  const top = rows.slice(0, 8);
  if (top.length > 0) {
    console.log(">>> Largest env vars in this build environment:");
    for (const r of top) {
      console.log(`    ${r.key}: ${r.bytes} B`);
    }
  }

  if (total >= FAIL_BYTES) {
    console.error("");
    console.error("========================================================================");
    console.error("  Netlify deploy may fail: Lambda environment variables exceed ~4 KB.");
    console.error("  Fix: Netlify → Site configuration → Environment variables");
    console.error("  Scope build-only vars (PRISMA_*, ALLOW_*, SKIP_DB_SEED) to Builds only.");
    console.error("  Remove unused secrets from All/Functions scope.");
    console.error("========================================================================");
    process.exit(1);
  }

  if (total >= WARN_BYTES) {
    console.warn("");
    console.warn(">>> WARNING: Lambda env budget is near the 4 KB cap. Review Netlify variable scoping before deploy.");
  }
}

main();
