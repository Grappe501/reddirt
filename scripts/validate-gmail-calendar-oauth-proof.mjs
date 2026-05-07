/**
 * REDDIRT-GMAIL-CALENDAR-OAUTH-PROOF-1.0 — static repo validation (no network, no secrets).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-GMAIL-CALENDAR-OAUTH-PROOF-1.0";

const ROUTES = {
  gmailOauthStart: ["src", "app", "api", "gmail", "oauth", "start", "route.ts"],
  gmailOauthCallback: ["src", "app", "api", "gmail", "oauth", "callback", "route.ts"],
  gmailPubsub: ["src", "app", "api", "gmail", "pubsub", "route.ts"],
  calendarCallback: ["src", "app", "api", "calendar", "google", "callback", "route.ts"],
  calendarCronSync: ["src", "app", "api", "calendar", "google", "cron-sync", "route.ts"],
  calendarWebhook: ["src", "app", "api", "calendar", "google", "webhook", "route.ts"],
  readinessApi: ["src", "app", "api", "admin", "communication-command-center", "gmail-calendar-readiness", "route.ts"],
};

const READINESS_LIB = ["src", "lib", "communication-command-center", "gmail-calendar-readiness.ts"];
const READINESS_CORE = ["src", "lib", "communication-command-center", "readiness.ts"];
const ADMIN_PAGE = ["src", "app", "admin", "(board)", "workbench", "communication-command-center", "gmail-calendar", "page.tsx"];

const READINESS_FILES_TO_SCAN_FOR_SEND = [
  ["src", "lib", "communication-command-center", "gmail-calendar-readiness.ts"],
  ["src", "app", "api", "admin", "communication-command-center", "gmail-calendar-readiness", "route.ts"],
  ["src", "app", "admin", "(board)", "workbench", "communication-command-center", "gmail-calendar", "page.tsx"],
];

function exists(rel) {
  return fs.existsSync(path.join(ROOT, ...rel));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, ...rel), "utf8");
}

/** Static checks: hosted runtime route readiness must not rely only on existsSync(route.ts); readiness.ts holds bundle fallback. */
function assertReadinessHostedRouteContract(readinessSrc, push) {
  push(
    "readiness_exports_resolveApiRouteHandlerPresent",
    /export\s+function\s+resolveApiRouteHandlerPresent/.test(readinessSrc),
    "readiness.ts must export resolveApiRouteHandlerPresent (hosted static route contract)",
  );
  push(
    "readiness_bundle_fallback_when_api_root_missing",
    /\bapiRoot\b/.test(readinessSrc) &&
      readinessSrc.includes("!existsSync(apiRoot)") &&
      /return\s+true/.test(readinessSrc),
    "readiness.ts must treat routes present when src/app/api is missing from the bundle (return true)",
  );
  push(
    "readiness_not_route_exists_only",
    readinessSrc.includes("resolveApiRouteHandlerPresent") && readinessSrc.includes("existsSync(base)"),
    "readiness.ts must resolve routes via helper with on-disk existsSync(base), not only a single join to route.ts",
  );
}

function assertBearerDiagnosticsOrder(apiSrc, push, idPrefix) {
  const emailNeedle = "process.env.EMAIL_DIAGNOSTICS_TOKEN?.trim()";
  const adminNeedle = "process.env.ADMIN_DIAGNOSTIC_TOKEN?.trim()";
  const iEmail = apiSrc.indexOf(emailNeedle);
  const iAdmin = apiSrc.indexOf(adminNeedle);
  push(
    `${idPrefix}_bearer_email_diag_before_admin_diag`,
    iEmail !== -1 && iAdmin !== -1 && iEmail < iAdmin,
    "EMAIL_DIAGNOSTICS_TOKEN must be read before ADMIN_DIAGNOSTIC_TOKEN (precedence unchanged)",
  );
  push(`${idPrefix}_bearer_primary_return_first`, /if\s*\(\s*primary\s*\)\s*return/.test(apiSrc), "primary token branch must return before fallback");
}

function main() {
  const checks = [];
  const violations = [];
  const push = (id, ok, detail) => {
    checks.push({ id, ok, detail: ok ? "ok" : detail });
    if (!ok) violations.push(`${id}: ${detail}`);
  };

  for (const [id, segs] of Object.entries(ROUTES)) {
    push(`file:${id}`, exists(segs), `missing ${segs.join("/")}`);
  }
  push("lib_readiness", exists(READINESS_LIB), "missing gmail-calendar-readiness.ts");
  push("readiness_core_lib", exists(READINESS_CORE), "missing readiness.ts");
  push("admin_page", exists(ADMIN_PAGE), "missing gmail-calendar page");

  const readinessCoreSrc = read(READINESS_CORE);
  assertReadinessHostedRouteContract(readinessCoreSrc, push);

  const apiSrc = read(ROUTES.readinessApi);
  push("api_get_only", /export\s+async\s+function\s+GET\s*\(/.test(apiSrc) && !/export\s+async\s+function\s+POST\s*\(/.test(apiSrc), "readiness API must export GET only (no POST)");
  push("api_email_diag_token", apiSrc.includes("EMAIL_DIAGNOSTICS_TOKEN"), "EMAIL_DIAGNOSTICS_TOKEN must appear in API route");
  push("api_admin_diag_token", apiSrc.includes("ADMIN_DIAGNOSTIC_TOKEN"), "ADMIN_DIAGNOSTIC_TOKEN fallback must appear");
  push("no_typo_admin_diagnostics_token", !apiSrc.includes("ADMIN_DIAGNOSTICS_TOKEN"), "typo ADMIN_DIAGNOSTICS_TOKEN must not be used");
  push("api_timing_safe", apiSrc.includes("timingSafeEqual"), "timing-safe bearer compare required");
  assertBearerDiagnosticsOrder(apiSrc, push, "gmail_cal_api");

  const libSrc = read(READINESS_LIB);
  push(
    "lib_uses_bundle_safe_route_helper",
    libSrc.includes("resolveApiRouteHandlerPresent") && libSrc.includes("@/lib/communication-command-center/readiness"),
    "gmail-calendar-readiness must import resolveApiRouteHandlerPresent from readiness (hosted bundle contract)",
  );
  push(
    "gmail_lib_no_direct_src_app_api_route_exists_sync",
    !libSrc.includes('path.join(process.cwd(), "src", "app", "api"') &&
      !libSrc.includes("path.join(process.cwd(), 'src', 'app', 'api'"),
    "gmail-calendar-readiness must not use direct cwd+src/app/api+route.ts existsSync for OAuth routes (use helper only)",
  );
  push("lib_gmail_safety_all_false", /gmailSendApproved:\s*false/.test(libSrc), "gmailSendApproved must remain false");
  push("lib_sendgrid_live_safety_false", /sendgridLiveSendApproved:\s*false/.test(libSrc), "sendgridLiveSendApproved must remain false");
  push("lib_twilio_safety_false", /twilioSmsApproved:\s*false/.test(libSrc), "twilioSmsApproved must remain false");
  push("lib_contact_import_safety_false", /contactImportApproved:\s*false/.test(libSrc), "contactImportApproved must remain false");
  push("lib_automation_workers_safety_false", /automationWorkersApproved:\s*false/.test(libSrc), "automationWorkersApproved must remain false");
  push("lib_no_google_api_calls_obvious", !/\bgmail\./.test(libSrc) && !/googleapis/.test(libSrc), "library must not call Google client APIs");

  for (const segs of READINESS_FILES_TO_SCAN_FOR_SEND) {
    const s = read(segs);
    const label = segs.join("/");
    push(`no_gmail_send_in:${label}`, !s.includes("users.messages.send"), `must not introduce users.messages.send in ${label}`);
    push(`no_twilio_send_in:${label}`, !/twilio\.messages\.create/.test(s), `must not introduce Twilio send in ${label}`);
    push(`no_sendgrid_send_in:${label}`, !/sendgrid\.send\s*\(/.test(s), `must not introduce sendgrid.send in ${label}`);
  }

  const allOk = checks.every((c) => c.ok);
  const contract = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status: allOk ? "pass" : "fail",
    checks,
    violations,
    routePathsVerified: Object.fromEntries(Object.entries(ROUTES).map(([k, v]) => [k, exists(v)])),
    safetyFieldsExpectedFalse: [
      "gmailSendApproved",
      "sendgridLiveSendApproved",
      "twilioSmsApproved",
      "contactImportApproved",
      "automationWorkersApproved",
    ],
  };

  const outPath = path.join(ROOT, "data/gmail-calendar-oauth-proof-contract.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(contract, null, 2), "utf8");

  console.log(allOk ? "PASS validate-gmail-calendar-oauth-proof.mjs" : "FAIL validate-gmail-calendar-oauth-proof.mjs");
  console.log(" ", path.relative(ROOT, outPath));
  if (violations.length) console.error(violations.join("\n"));
  process.exit(allOk ? 0 : 1);
}

main();
