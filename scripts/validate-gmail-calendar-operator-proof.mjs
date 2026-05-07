/**
 * REDDIRT-GMAIL-CALENDAR-OAUTH-OPERATOR-HOSTED-PROOF-1.0 — static repo validation (no network, no secrets).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-GMAIL-CALENDAR-OAUTH-OPERATOR-HOSTED-PROOF-1.0";

const OPERATOR_API = ["src", "app", "api", "admin", "communication-command-center", "gmail-calendar-operator-proof", "route.ts"];
const OPERATOR_LIB = ["src", "lib", "communication-command-center", "gmail-calendar-operator-proof.ts"];
const OPERATOR_PAGE = [
  "src",
  "app",
  "admin",
  "(board)",
  "workbench",
  "communication-command-center",
  "gmail-calendar",
  "operator-proof",
  "page.tsx",
];

const ROUTES_REQUIRED = {
  gmailOauthStart: ["src", "app", "api", "gmail", "oauth", "start", "route.ts"],
  gmailOauthCallback: ["src", "app", "api", "gmail", "oauth", "callback", "route.ts"],
  calendarCallback: ["src", "app", "api", "calendar", "google", "callback", "route.ts"],
};

const SCAN_FOR_SEND = [OPERATOR_LIB, OPERATOR_API, OPERATOR_PAGE];

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

  push("file:operator_api", exists(OPERATOR_API), `missing ${OPERATOR_API.join("/")}`);
  push("file:operator_lib", exists(OPERATOR_LIB), `missing ${OPERATOR_LIB.join("/")}`);
  push("file:operator_page", exists(OPERATOR_PAGE), `missing ${OPERATOR_PAGE.join("/")}`);

  for (const [id, segs] of Object.entries(ROUTES_REQUIRED)) {
    push(`file:${id}`, exists(segs), `missing ${segs.join("/")}`);
  }

  const apiSrc = read(OPERATOR_API);
  push("api_get_only", /export\s+async\s+function\s+GET\s*\(/.test(apiSrc) && !/export\s+async\s+function\s+POST\s*\(/.test(apiSrc), "operator proof API must export GET only");
  push("api_email_diag_token", apiSrc.includes("EMAIL_DIAGNOSTICS_TOKEN"), "EMAIL_DIAGNOSTICS_TOKEN must appear");
  push("api_admin_diag_token", apiSrc.includes("ADMIN_DIAGNOSTIC_TOKEN"), "ADMIN_DIAGNOSTIC_TOKEN fallback must appear");
  push("no_typo_admin_diagnostics_token", !apiSrc.includes("ADMIN_DIAGNOSTICS_TOKEN"), "typo ADMIN_DIAGNOSTICS_TOKEN must not be used");
  push("api_timing_safe", apiSrc.includes("timingSafeEqual"), "timing-safe bearer compare required");
  const iEmail = apiSrc.indexOf("process.env.EMAIL_DIAGNOSTICS_TOKEN?.trim()");
  const iAdmin = apiSrc.indexOf("process.env.ADMIN_DIAGNOSTIC_TOKEN?.trim()");
  push(
    "api_bearer_email_before_admin",
    iEmail !== -1 && iAdmin !== -1 && iEmail < iAdmin,
    "EMAIL_DIAGNOSTICS_TOKEN must be read before ADMIN_DIAGNOSTIC_TOKEN",
  );
  push("api_bearer_primary_return_first", /if\s*\(\s*primary\s*\)\s*return/.test(apiSrc), "primary branch must return before fallback");

  const libSrc = read(OPERATOR_LIB);
  push("lib_mode_constant", libSrc.includes("gmail_calendar_operator_proof"), "operator proof mode string");
  push("lib_imports_readiness_stack", libSrc.includes("getCommunicationCommandCenterReadiness"), "must aggregate CCC readiness");
  push("lib_imports_gmail_cal", libSrc.includes("getGmailCalendarOAuthReadiness"), "must aggregate gmail-calendar readiness");
  push("lib_imports_email_sandbox", libSrc.includes("getEmailSandboxReadiness"), "must aggregate email sandbox readiness");
  push("lib_safety_calendar_event_write_false", /calendarEventWriteApproved:\s*false/.test(libSrc), "calendarEventWriteApproved must be false");
  push("lib_safety_gmail_send_false", /gmailSendApproved:\s*false/.test(libSrc), "gmailSendApproved must be false");
  push("lib_safety_sendgrid_false", /sendgridLiveSendApproved:\s*false/.test(libSrc), "sendgridLiveSendApproved must be false");

  const sendNeedle = ["users", "messages", "send"].join(".");
  const sgNeedle = ["sendgrid", "send"].join(".");
  for (const segs of SCAN_FOR_SEND) {
    const s = read(segs);
    const label = segs.join("/");
    push(`no_gmail_send:${label}`, !s.includes(sendNeedle), `must not contain ${sendNeedle}`);
    push(`no_sendgrid_send_fn:${label}`, !s.includes(`${sgNeedle}(`), `must not contain ${sgNeedle}(`);
    push(`no_twilio:${label}`, !/twilio\.messages\.create/.test(s), "no Twilio SMS send");
    push(`no_contact_import_activation:${label}`, !/contactImportApproved:\s*true/.test(s), "no contact import approval");
    push(`no_automation_workers_activation:${label}`, !/automationWorkersApproved:\s*true/.test(s), "no automation workers approval");
    push(`no_calendar_event_write_activation:${label}`, !/calendarEventWriteApproved:\s*true/.test(s), "no calendar event write approval");
  }

  const pageSrc = read(OPERATOR_PAGE);
  push(
    "page_links_oauth_start",
    pageSrc.includes("/api/gmail/oauth/start") || pageSrc.includes("p.gmail.oauthStartUrl"),
    "page must link Gmail OAuth start (href or oauthStartUrl field)",
  );
  push("page_links_calendar_workbench", pageSrc.includes("/admin/workbench/calendar"), "page must link Calendar workspace");

  const allOk = checks.every((c) => c.ok);
  const contract = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status: allOk ? "pass" : "fail",
    checks,
    violations,
  };

  const outPath = path.join(ROOT, "data/gmail-calendar-operator-proof-contract.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(contract, null, 2), "utf8");

  console.log(allOk ? "PASS validate-gmail-calendar-operator-proof.mjs" : "FAIL validate-gmail-calendar-operator-proof.mjs");
  console.log(" ", path.relative(ROOT, outPath));
  if (violations.length) console.error(violations.join("\n"));
  process.exit(allOk ? 0 : 1);
}

main();
