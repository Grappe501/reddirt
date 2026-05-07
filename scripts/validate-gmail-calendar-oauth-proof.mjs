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
  push("admin_page", exists(ADMIN_PAGE), "missing gmail-calendar page");

  const apiSrc = read(ROUTES.readinessApi);
  push("api_get_only", /export\s+async\s+function\s+GET\s*\(/.test(apiSrc) && !/export\s+async\s+function\s+POST\s*\(/.test(apiSrc), "readiness API must export GET only (no POST)");
  push("api_email_diag_token", apiSrc.includes("EMAIL_DIAGNOSTICS_TOKEN"), "EMAIL_DIAGNOSTICS_TOKEN must appear in API route");
  push("api_admin_diag_token", apiSrc.includes("ADMIN_DIAGNOSTIC_TOKEN"), "ADMIN_DIAGNOSTIC_TOKEN fallback must appear");
  push("no_typo_admin_diagnostics_token", !apiSrc.includes("ADMIN_DIAGNOSTICS_TOKEN"), "typo ADMIN_DIAGNOSTICS_TOKEN must not be used");
  push("api_timing_safe", apiSrc.includes("timingSafeEqual"), "timing-safe bearer compare required");

  const libSrc = read(READINESS_LIB);
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
