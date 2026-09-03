/**
 * Estimate runtime env vars for ___netlify-server-handler.
 * AWS Lambda compatibility mode: 4096 byte cap on all env keys+values combined.
 * Modern Netlify Functions runtime (June 2026+): cap removed — see Netlify changelog.
 */
const fs = require("node:fs");
const path = require("node:path");

const LAMBDA_ENV_LIMIT_BYTES = 4096;
const WARN_BYTES = 3200;
const FEATURE_FLAGS_TYPICAL_BYTES = 9055;

/** Netlify UI → Scope → Builds only (never Functions / All). */
const BUILD_ONLY_EXACT = new Set([
  "SKIP_DB_SEED",
  "NPM_CONFIG_PRODUCTION",
  "NODE_VERSION",
  "PRISMA_MIGRATE_RETRIES",
  "PRISMA_MIGRATE_RETRY_DELAY_SECONDS",
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
  "VOLUNTEER_HUB_PASSWORD",
  "SCHEDULER_OPERATOR_EMAIL",
  "SCHEDULER_OPERATOR_PASSWORD",
  "SCHEDULER_OPERATOR_NAME",
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

/** Kelly SOS opposition launch — not required on every ___netlify-server-handler request. */
const RUNTIME_OPTIONAL_FOR_LAUNCH = new Set([
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_EMBEDDING_MODEL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL",
  "GOOGLE_CALENDAR_CLIENT_ID",
  "GOOGLE_CALENDAR_CLIENT_SECRET",
  "GOOGLE_CALENDAR_REDIRECT_URI",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID",
  "ADMIN_DIAGNOSTIC_TOKEN",
]);

function isLambdaCompatMode() {
  return Boolean(process.env.AWS_LAMBDA_JS_RUNTIME);
}

const SERVER_HANDLER_DIRS = [
  ".netlify/functions-internal/___netlify-server-handler",
  ".netlify/functions/___netlify-server-handler",
];

/** OpenNext v5+ .mjs entry — sufficient for modern Functions runtime (no 4 KB env cap). */
const OPENNEXT_MJS_HANDLER_MARKERS = [
  ".netlify/functions-internal/___netlify-server-handler/___netlify-server-handler.mjs",
  ".netlify/functions/___netlify-server-handler/___netlify-server-handler.mjs",
];

/** Secondary layout hints (run-config alone is not enough — see readPackagedHandlerRuntime). */
const OPENNEXT_HANDLER_MARKERS = [
  ...OPENNEXT_MJS_HANDLER_MARKERS,
  ".netlify/functions-internal/___netlify-server-handler/run-config.json",
  ".netlify/functions-internal/___netlify-server-handler/.netlify/dist/run/handlers/server.js",
];

function hasOpenNextMjsHandler(cwd = process.cwd()) {
  return OPENNEXT_MJS_HANDLER_MARKERS.some((rel) => fs.existsSync(path.join(cwd, rel)));
}

function readHandlerDirEntries(cwd = process.cwd()) {
  for (const rel of SERVER_HANDLER_DIRS) {
    const abs = path.join(cwd, rel);
    try {
      if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) continue;
      return { abs, rel, entries: fs.readdirSync(abs) };
    } catch {
      /* skip unreadable handler dir */
    }
  }
  return null;
}

/** Read packaged handler metadata after @netlify/plugin-nextjs onBuild (postBuild plugins). */
function readPackagedHandlerRuntime(cwd = process.cwd()) {
  const handler = readHandlerDirEntries(cwd);
  if (handler) {
    const hasModernEntry = handler.entries.some(
      (name) => name === "___netlify-server-handler.mjs" || name.endsWith(".mjs"),
    );
    const hasRunConfig = handler.entries.includes("run-config.json");
    const hasLegacyOnly =
      handler.entries.includes("___netlify-server-handler.js") && !hasModernEntry;
    if (hasLegacyOnly) {
      return { modern: false, runtimeAPIVersion: null, invocationMode: null, source: "legacy-js-entry" };
    }
    // @netlify/plugin-nextjs v5+ packages OpenNext as ___netlify-server-handler.mjs — run-config.json
    // may be absent on Netlify's layout; .mjs alone is sufficient for modern Functions runtime.
    if (hasModernEntry) {
      return {
        modern: true,
        runtimeAPIVersion: 2,
        invocationMode: hasRunConfig ? "stream" : null,
        source: hasRunConfig ? "handler-layout" : "handler-mjs",
      };
    }
  }

  const manifestPath = path.join(cwd, ".netlify/functions-internal/___netlify-server-handler.json");
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const candidates = [
        manifest,
        manifest.config,
        manifest.bootstrapData,
        manifest.config?.bootstrapData,
      ].filter(Boolean);
      for (const node of candidates) {
        const runtimeAPIVersion =
          node.runtimeAPIVersion ?? node.bd?.runtimeAPIVersion ?? node.bootstrapData?.runtimeAPIVersion;
        const invocationMode = node.invocationMode ?? node.im;
        if (typeof runtimeAPIVersion === "number" && runtimeAPIVersion >= 2) {
          return { modern: true, runtimeAPIVersion, invocationMode: invocationMode ?? null, source: "manifest" };
        }
        if (invocationMode === "stream") {
          return { modern: true, runtimeAPIVersion: runtimeAPIVersion ?? null, invocationMode, source: "manifest" };
        }
      }
    } catch {
      /* skip malformed manifest */
    }
  }

  return { modern: false, runtimeAPIVersion: null, invocationMode: null, source: null };
}

function detectOpenNextModernHandler(cwd = process.cwd()) {
  if (hasOpenNextMjsHandler(cwd)) return true;
  const packaged = readPackagedHandlerRuntime(cwd);
  if (packaged.modern) return true;
  const handler = readHandlerDirEntries(cwd);
  if (handler) {
    const hasMjs = handler.entries.some(
      (name) => name === "___netlify-server-handler.mjs" || name.endsWith(".mjs"),
    );
    if (hasMjs) return true;
    // Handler dir may exist before .mjs is listed (empty/staging) — fall through to existsSync markers.
  }
  return hasOpenNextMjsHandler(cwd);
}

/** Legacy Lambda adapter — .js entry without OpenNext .mjs markers. */
function detectLegacyLambdaHandler(cwd = process.cwd()) {
  if (detectOpenNextModernHandler(cwd)) return false;
  if (isLambdaCompatMode()) return true;
  const handler = readHandlerDirEntries(cwd);
  if (!handler) return false;
  return handler.entries.some(
    (name) =>
      name === "___netlify-server-handler.js" ||
      (name.endsWith(".js") && !name.endsWith(".mjs")),
  );
}

/**
 * Netlify injects FEATURE_FLAGS (~9 KB) in every build env — modern and legacy.
 * Only count toward the compat deploy budget when legacy Lambda mode is confirmed
 * or the packaged handler does not report runtimeAPIVersion >= 2.
 */
function estimateCompatFeatureFlagsBytes(
  featureFlags,
  { modernHandler = false, legacyHandler = false, handlerPackaged = false, worstCase = 0 } = {},
) {
  if (modernHandler) return 0;
  // Function-scoped runtime env under the cap — deploy won't fail on env size (OpenNext or small legacy).
  if (worstCase <= LAMBDA_ENV_LIMIT_BYTES) return 0;
  const ffBytes = featureFlags?.bytes ?? 0;
  const onNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_BUILD_BASE);
  if (handlerPackaged && onNetlify && !modernHandler && legacyHandler) {
    return ffBytes || FEATURE_FLAGS_TYPICAL_BYTES;
  }
  if (!legacyHandler) return 0;
  return ffBytes || FEATURE_FLAGS_TYPICAL_BYTES;
}

function estimateCompatDeployBytes({
  total,
  deployEstimate,
  buildOnlyLeaked,
  featureFlags,
  apiRuntimeBytes,
  handlerPackaged = false,
  modernHandler = false,
  legacyHandler = false,
}) {
  // Build container env includes Builds-scoped vars — only count confirmed function-scope bytes.
  const worstCase = apiRuntimeBytes ?? total;
  const onNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_BUILD_BASE);
  const compatPadding = onNetlify
    ? estimateCompatFeatureFlagsBytes(featureFlags, {
        modernHandler,
        legacyHandler,
        handlerPackaged,
        worstCase,
      })
    : 0;
  return {
    worstCase,
    compatPadding,
    lambdaDeployBytes: worstCase + compatPadding,
    modernHandler,
    legacyHandler,
  };
}

function getDeployRiskMessage({
  total,
  totalRaw,
  deployEstimate,
  featureFlags,
  rows,
  buildOnlyLeaked,
  apiRuntimeBytes,
  handlerPackaged = false,
  modernHandler = detectOpenNextModernHandler(),
  legacyHandler = detectLegacyLambdaHandler(),
}) {
  const onNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_BUILD_BASE);

  const { worstCase, compatPadding, lambdaDeployBytes } = estimateCompatDeployBytes({
    total,
    deployEstimate,
    buildOnlyLeaked,
    featureFlags,
    apiRuntimeBytes,
    handlerPackaged,
    modernHandler,
    legacyHandler,
  });

  // OpenNext modern handler (runtimeAPIVersion >= 2) — no Lambda compat env cap; FEATURE_FLAGS ignored.
  if (onNetlify && handlerPackaged && modernHandler) {
    const runtimeBytes = apiRuntimeBytes ?? total;
    const summary = `OpenNext modern handler — function env ${runtimeBytes} B; no Lambda compat env cap`;
    return {
      fail: false,
      summary,
      message: `${summary}. Deploy upload should not fail on env size alone.`,
    };
  }

  // Netlify env API (Functions scope only) is authoritative — when function env is under cap,
  // deploy will not fail on env size (FEATURE_FLAGS compat padding is advisory only).
  if (
    onNetlify &&
    apiRuntimeBytes != null &&
    apiRuntimeBytes <= LAMBDA_ENV_LIMIT_BYTES &&
    !legacyHandler
  ) {
    const summary = `Function-scoped env ${apiRuntimeBytes} B (${(apiRuntimeBytes / 1024).toFixed(1)} KB) within Lambda budget`;
    return {
      fail: false,
      summary,
      message: `${summary} — verified via Netlify env API (build-container estimate ${total} B is advisory).`,
    };
  }
  const nodeOptions = rows.find((r) => r.key === "NODE_OPTIONS");

  let fail = false;
  const lines = [];

  if (onNetlify && worstCase > LAMBDA_ENV_LIMIT_BYTES) {
    fail = true;
    lines.push(
      `Estimated runtime Lambda env ${worstCase} B exceeds ${LAMBDA_ENV_LIMIT_BYTES} B (runtime ${total} B + ${buildOnlyLeaked ?? 0} B build-only leak risk). Scope build-only vars with npm run netlify:env:scopes or Netlify UI (docs/NETLIFY_FIRST_DEPLOY.md §6).`,
    );
  }

  if (total >= LAMBDA_ENV_LIMIT_BYTES) {
    fail = true;
    lines.push(
      `Runtime env estimate ${total} B exceeds AWS Lambda 4 KB cap. Deploy will fail with Invalid AWS Lambda parameters.`,
    );
  }

  if (onNetlify && (buildOnlyLeaked ?? 0) > 0 && apiRuntimeBytes == null) {
    lines.push(
      `Advisory: build env includes ~${buildOnlyLeaked} B of Builds-scoped vars (expected during build). Confirm Netlify UI scopes for ALLOW_PRISMA_*, SKIP_DB_SEED, PRISMA_MIGRATE_*, NEXT_PUBLIC_* are Builds only — not Functions/All.`,
    );
  }

  if (nodeOptions && nodeOptions.bytes > 0 && onNetlify) {
    fail = true;
    lines.push(
      `NODE_OPTIONS (${nodeOptions.bytes} B) must not reach Functions — remove from Netlify UI entirely (heap is set in scripts/netlify-build.sh only). Scoped to All/Functions this causes Invalid AWS Lambda parameters at deploy upload.`,
    );
  }

  if (
    onNetlify &&
    compatPadding > 0 &&
    worstCase > LAMBDA_ENV_LIMIT_BYTES &&
    lambdaDeployBytes > LAMBDA_ENV_LIMIT_BYTES
  ) {
    fail = true;
    lines.push(
      `Deploy env budget ${lambdaDeployBytes} B (runtime ${worstCase} B + compat FEATURE_FLAGS ~${compatPadding} B) exceeds AWS ${LAMBDA_ENV_LIMIT_BYTES} B. Legacy Lambda handler suspected. Fix: Netlify UI → Build & deploy → Build plugins → disable any UI-pinned old @netlify/plugin-nextjs; Build settings → Runtime → remove pinned Next.js runtime, save, re-select Next.js, save. Keep [[plugins]] package = "@netlify/plugin-nextjs" (unpinned) first in netlify.toml. Or run: NETLIFY_AUTH_TOKEN=... NETLIFY_SITE_ID=... npm run netlify:unpin-nextjs-runtime`,
    );
  }

  if (!fail && onNetlify && handlerPackaged && modernHandler) {
    lines.push(
      `OpenNext modern server handler detected — FEATURE_FLAGS (${featureFlags?.bytes ?? 0} B in build env) does not count toward the Lambda compat env cap.`,
    );
  }

  if (onNetlify && lambdaDeployBytes > LAMBDA_ENV_LIMIT_BYTES && !fail) {
    fail = true;
    lines.push(
      `Deploy env budget ${lambdaDeployBytes} B exceeds AWS ${LAMBDA_ENV_LIMIT_BYTES} B. Run npm run netlify:env:scopes:launch-minimal and confirm modern Functions runtime.`,
    );
  }

  if (!fail && onNetlify && worstCase >= WARN_BYTES) {
    lines.push(
      `Warning: worst-case ${worstCase} B. If deploy fails at upload with Invalid AWS Lambda parameters, run npm run netlify:env:scopes:launch-minimal and confirm modern Functions runtime with Netlify support.`,
    );
  }

  const summary = fail
    ? `FAIL deploy est. ${lambdaDeployBytes} B — fix env scoping before deploy`
    : `~${total} B runtime env (${(total / 1024).toFixed(1)} KB), deploy est. ${lambdaDeployBytes} B, ${(totalRaw / 1024).toFixed(1)} KB total in build`;

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
    const modern = detectOpenNextModernHandler();
    console.log(
      `>>> FEATURE_FLAGS ${featureFlags.bytes} B (Netlify-internal${modern ? "; OpenNext handler — not compat cap" : "; compat risk only if legacy runtime"})`,
    );
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
    // During `build.command`, Netlify injects the full build-container env — not function scope.
    // lambda-env-guard (onPostBuild) re-checks with Netlify API + packaged handler metadata.
    console.warn("");
    console.warn(`>>> ADVISORY (build.command): ${risk.message}`);
    console.warn(">>> Post-build lambda-env-guard plugin is authoritative for deploy blocking.");
    return;
  }

  if (total >= WARN_BYTES) {
    console.warn(">>> WARNING: runtime env is near the 4 KB compat cap — scope build-only vars in Netlify UI.");
  }
}

function envRowReachesFunctions(scopes) {
  const s = scopes ?? [];
  return s.some((scope) => scope === "functions" || scope === "all" || scope === "runtime");
}

function estimateNetlifyApiFunctionEnvBytes(envRows) {
  let runtime = 0;
  const rows = [];
  for (const row of envRows) {
    if (!envRowReachesFunctions(row.scopes) || isBuildOnlyKey(row.key)) continue;
    const prod =
      row.values?.find((v) => v.context === "production" || v.context === "all") ?? row.values?.[0];
    const val = prod?.value ?? "";
    const bytes = Buffer.byteLength(row.key, "utf8") + Buffer.byteLength(String(val), "utf8");
    runtime += bytes;
    rows.push({ key: row.key, bytes, optional: RUNTIME_OPTIONAL_FOR_LAUNCH.has(row.key) });
  }
  rows.sort((a, b) => b.bytes - a.bytes);
  return { runtime, rows };
}

module.exports = {
  estimateLambdaEnvBytes,
  estimateNetlifyApiFunctionEnvBytes,
  estimateCompatDeployBytes,
  detectOpenNextModernHandler,
  detectLegacyLambdaHandler,
  hasOpenNextMjsHandler,
  readHandlerDirEntries,
  readPackagedHandlerRuntime,
  printNetlifyEnvScopingChecklist,
  getDeployRiskMessage,
  isBuildOnlyKey,
  isLambdaCompatMode,
  envRowReachesFunctions,
  LAMBDA_ENV_LIMIT_BYTES,
  BUILD_ONLY_EXACT,
  BUILD_ONLY_PREFIXES,
  RUNTIME_ESSENTIAL,
  RUNTIME_OPTIONAL_FOR_LAUNCH,
  FEATURE_FLAGS_TYPICAL_BYTES,
};

if (require.main === module) {
  main();
}
