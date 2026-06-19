/**
 * Estimate runtime env vars for ___netlify-server-handler.
 * AWS Lambda compatibility mode: 4096 byte cap on all env keys+values combined.
 * Modern Netlify Functions runtime (June 2026+): cap removed — see Netlify changelog.
 */
const LAMBDA_ENV_LIMIT_BYTES = 4096;
const WARN_BYTES = 3200;
const FEATURE_FLAGS_TYPICAL_BYTES = 9055;

/** Netlify UI → Scope → Builds only (never Functions / All). */
const BUILD_ONLY_EXACT = new Set([
  "SKIP_DB_SEED",
  "NPM_CONFIG_PRODUCTION",
  "NODE_OPTIONS",
  "NODE_VERSION",
  "NETLIFY_DATABASE_URL",
]);

const BUILD_ONLY_PREFIXES = [
  "PRISMA_MIGRATE_",
  "PRISMA_RESOLVE_",
  "ALLOW_PRISMA_",
  "NEXT_PUBLIC_",
];

const NETLIFY_INTERNAL = new Set([
  "FEATURE_FLAGS",
  "NETLIFY_SKEW_PROTECTION_TOKEN",
  "NETLIFY_BUILD_BASE",
  "NETLIFY_BUILD_ID",
  "NETLIFY_LOCAL",
  "CI",
  "NETLIFY",
  "NETLIFY_IMAGES_CDN_DOMAIN",
  "AWS_EXECUTION_ENV",
  "AWS_LAMBDA_JS_RUNTIME",
]);

/** Vars that must reach Functions at runtime (keep scoped to Functions or All). */
const RUNTIME_ESSENTIAL = [
  "DATABASE_URL",
  "DIRECT_URL",
  "ADMIN_SECRET",
  "ELECTION_PLAN_PASSWORD",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_EMBEDDING_MODEL",
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "GOOGLE_CALENDAR_CLIENT_ID",
  "GOOGLE_CALENDAR_CLIENT_SECRET",
  "GOOGLE_CALENDAR_REDIRECT_URI",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID",
  "ADMIN_DIAGNOSTIC_TOKEN",
];

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

function isBuildOnlyKey(key) {
  if (BUILD_ONLY_EXACT.has(key)) return true;
  return BUILD_ONLY_PREFIXES.some((p) => key.startsWith(p));
}

function isExcludedFromLambdaBudget(key) {
  return NETLIFY_INTERNAL.has(key) || isBuildOnlyKey(key);
}

function estimateLambdaEnvBytes(env = process.env) {
  let total = 0;
  let totalRaw = 0;
  let buildOnlyLeaked = 0;
  const rows = [];
  for (const [key, value] of Object.entries(env)) {
    if (isRuntimeNoiseKey(key)) continue;
    const val = value ?? "";
    const bytes = Buffer.byteLength(key, "utf8") + Buffer.byteLength(String(val), "utf8");
    totalRaw += bytes;
    const excluded = isExcludedFromLambdaBudget(key);
    if (!excluded) total += bytes;
    if (isBuildOnlyKey(key) && val) buildOnlyLeaked += bytes;
    rows.push({ key, bytes, excluded, buildOnly: isBuildOnlyKey(key) });
  }
  rows.sort((a, b) => b.bytes - a.bytes);
  const deployEstimate = total + buildOnlyLeaked;
  return { total, totalRaw, buildOnlyLeaked, deployEstimate, rows };
}

function printNetlifyEnvScopingChecklist(rows) {
  const present = rows.filter((r) => r.buildOnly && r.bytes > 0);
  if (present.length === 0) return;

  console.log("");
  console.log(">>> Netlify env scoping (Site configuration → Environment variables → each var → Scopes):");
  console.log(">>>   Builds only — do NOT use All or Functions:");
  for (const r of present) {
    console.log(`>>>     ${r.key}`);
  }
  console.log(">>>   Functions (runtime) — DATABASE_URL, DIRECT_URL, ADMIN_SECRET, ELECTION_PLAN_PASSWORD, API keys");
  console.log("");
}

function getDeployRiskMessage({ total, totalRaw, deployEstimate, featureFlags, rows, buildOnlyLeaked }) {
  const ffBytes = featureFlags?.bytes ?? 0;
  const worstCase = deployEstimate ?? total + (buildOnlyLeaked ?? 0);
  const compatRisk = total + (ffBytes || FEATURE_FLAGS_TYPICAL_BYTES);
  const nodeOptions = rows.find((r) => r.key === "NODE_OPTIONS");
  const onNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_BUILD_BASE);

  let fail = false;
  const lines = [];

  if (total >= LAMBDA_ENV_LIMIT_BYTES) {
    fail = true;
    lines.push(
      `Runtime env estimate ${total} B exceeds AWS Lambda 4 KB cap. Deploy will fail with Invalid AWS Lambda parameters.`,
    );
  }

  if (onNetlify && worstCase >= LAMBDA_ENV_LIMIT_BYTES) {
    fail = true;
    lines.push(
      `Worst-case function env ${worstCase} B (runtime ${total} B + ${buildOnlyLeaked ?? 0} B build-only keys if scoped to All/Functions). Scope every NEXT_PUBLIC_*, PRISMA_*, ALLOW_PRISMA_*, SKIP_DB_SEED, NODE_OPTIONS, NODE_VERSION, and NPM_CONFIG_PRODUCTION to Builds only — or run: npm run netlify:env:scopes`,
    );
  }

  if (nodeOptions && !nodeOptions.excluded && nodeOptions.bytes > 0) {
    fail = true;
    lines.push(
      `NODE_OPTIONS (${nodeOptions.bytes} B) must be Builds-only scope. Lambda rejects --max-old-space-size on the server handler.`,
    );
  }

  if (onNetlify && ffBytes > 0 && total + ffBytes > LAMBDA_ENV_LIMIT_BYTES) {
    if (worstCase >= LAMBDA_ENV_LIMIT_BYTES) {
      fail = true;
      lines.push(
        `FEATURE_FLAGS ${ffBytes} B plus runtime ${total} B exceeds the 4 KB Lambda compat cap. Scope build-only vars to Builds only (npm run netlify:env:scopes).`,
      );
    } else {
      lines.push(
        `FEATURE_FLAGS ${ffBytes} B is Netlify-internal. Runtime ${total} B looks OK, but deploy can still fail on Lambda compat mode after a green build. Run npm run netlify:env:scopes, then ask Netlify support to confirm modern Functions runtime if upload still fails.`,
      );
    }
  } else if (onNetlify && worstCase >= WARN_BYTES && worstCase + FEATURE_FLAGS_TYPICAL_BYTES > LAMBDA_ENV_LIMIT_BYTES) {
    lines.push(
      `Warning: worst-case env ${worstCase} B is high; on Lambda compatibility mode, platform FEATURE_FLAGS (~9 KB) can also break deploy after a green build.`,
    );
  }

  if (
    onNetlify &&
    !fail &&
    (buildOnlyLeaked ?? 0) > 400 &&
    worstCase >= LAMBDA_ENV_LIMIT_BYTES - 384
  ) {
    fail = true;
    lines.push(
      `${buildOnlyLeaked} B of build-only vars are in this build. If any are scoped to All or Functions in Netlify UI, deploy will exceed the 4 KB Lambda env cap. Run npm run netlify:env:scopes or fix scopes manually (docs/NETLIFY_FIRST_DEPLOY.md §6).`,
    );
  }

  if (!fail && (buildOnlyLeaked ?? 0) > 1500 && total > WARN_BYTES) {
    lines.push(
      `Warning: ${buildOnlyLeaked} B of build-only vars present — if any are scoped to All/Functions in Netlify UI, deploy may fail.`,
    );
  }

  if (!fail && ffBytes >= LAMBDA_ENV_LIMIT_BYTES) {
    lines.push(
      `FEATURE_FLAGS alone is ${ffBytes} B. On Lambda compatibility mode, deploy fails even with minimal user env. Contact Netlify support to confirm modern Functions runtime.`,
    );
  } else if (!fail && compatRisk > LAMBDA_ENV_LIMIT_BYTES && total > 2000) {
    lines.push(
      `Compat-mode risk: runtime ${total} B + platform flags ≈ ${compatRisk} B. Scope all NEXT_PUBLIC_* and PRISMA_* to Builds only.`,
    );
  }

  const summary = fail
    ? `FAIL worst-case ${worstCase} B function env — fix scoping before deploy`
    : `~${total} B runtime env (${(total / 1024).toFixed(1)} KB), worst-case ${worstCase} B, ${(totalRaw / 1024).toFixed(1)} KB total in build`;

  return {
    fail,
    summary,
    message: lines.length ? lines.join("\n\n") : summary,
  };
}

function main() {
  const { total, totalRaw, buildOnlyLeaked, deployEstimate, rows } = estimateLambdaEnvBytes();
  const featureFlags = rows.find((r) => r.key === "FEATURE_FLAGS");

  console.log(
    `>>> Lambda env check: ~${total} bytes (${(total / 1024).toFixed(2)} KB) runtime, worst-case ${deployEstimate} B if build-only vars leak to Functions (limit ${LAMBDA_ENV_LIMIT_BYTES} B on Lambda compat mode)`,
  );

  if (featureFlags) {
    console.log(`>>> FEATURE_FLAGS ${featureFlags.bytes} B (Netlify-internal; compat mode only)`);
  }

  const runtimeRows = rows.filter((r) => !r.excluded).slice(0, 12);
  if (runtimeRows.length > 0) {
    console.log(">>> Largest runtime-scoped vars (estimate):");
    for (const r of runtimeRows) {
      console.log(`    ${r.key}: ${r.bytes} B`);
    }
  }

  printNetlifyEnvScopingChecklist(rows);

  const risk = getDeployRiskMessage({
    total,
    totalRaw,
    deployEstimate,
    featureFlags,
    rows,
    buildOnlyLeaked,
  });
  if (risk.message && !risk.fail) {
    console.warn(`>>> ${risk.message}`);
  }

  if (risk.fail) {
    if (!process.env.NETLIFY && !process.env.NETLIFY_BUILD_BASE) {
      console.warn(">>> (Local machine — not failing; this gate runs on Netlify builds only.)");
      return;
    }
    console.error("");
    console.error(`>>> FAIL: ${risk.message}`);
    console.error(">>> Netlify UI → Environment variables → edit → Scopes (see docs/NETLIFY_FIRST_DEPLOY.md §6)");
    process.exit(1);
  }

  if (total >= WARN_BYTES) {
    console.warn(">>> WARNING: runtime env is near the 4 KB compat cap — scope build-only vars in Netlify UI.");
  }
}

module.exports = {
  estimateLambdaEnvBytes,
  printNetlifyEnvScopingChecklist,
  getDeployRiskMessage,
  isBuildOnlyKey,
  LAMBDA_ENV_LIMIT_BYTES,
  BUILD_ONLY_EXACT,
  BUILD_ONLY_PREFIXES,
  RUNTIME_ESSENTIAL,
};

if (require.main === module) {
  main();
}
