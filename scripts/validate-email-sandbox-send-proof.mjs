/**
 * REDDIRT-EMAIL-SANDBOX-SEND-PROOF-1.0 — static validation; Gmail/Calendar proof precondition required.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-EMAIL-SANDBOX-SEND-PROOF-1.0";
const GMAIL_CAL_CONTRACT = path.join(ROOT, "data/gmail-calendar-oauth-proof-contract.json");
const BLOCKED_JSON = path.join(ROOT, "data/email-sandbox-send-proof-blocked.json");
const BLOCKED_MD = path.join(ROOT, "develop_notes/REDDIRT_EMAIL_SANDBOX_SEND_PROOF_1_0_BLOCKED_REPORT.md");
const OUT_CONTRACT = path.join(ROOT, "data/email-sandbox-send-proof-contract.json");

const SANDBOX_LIB = ["src", "lib", "communication-command-center", "email-sandbox-readiness.ts"];
const READINESS_CORE = ["src", "lib", "communication-command-center", "readiness.ts"];
const SANDBOX_API = ["src", "app", "api", "admin", "communication-command-center", "email-sandbox-readiness", "route.ts"];
const SANDBOX_PAGE = ["src", "app", "admin", "(board)", "workbench", "communication-command-center", "email-sandbox", "page.tsx"];

const SANDBOX_SCAN_FILES = [SANDBOX_LIB, SANDBOX_API, SANDBOX_PAGE];

function existsAt(rel) {
  return fs.existsSync(path.join(ROOT, ...rel));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, ...rel), "utf8");
}

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

function writeBlocked(reason, detail) {
  const generatedAt = new Date().toISOString();
  const blocked = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    blocked: true,
    reason,
    detail,
    liveSendRemainsBlocked: true,
    sandboxSendProofBuilt: false,
    nextStep: "Finish REDDIRT-GMAIL-CALENDAR-OAUTH-PROOF-1.0 (validator pass + artifacts) before REDDIRT-EMAIL-SANDBOX-SEND-PROOF-1.0.",
  };
  fs.mkdirSync(path.dirname(BLOCKED_JSON), { recursive: true });
  fs.writeFileSync(BLOCKED_JSON, JSON.stringify(blocked, null, 2), "utf8");
  const md = `# REDDIRT_EMAIL_SANDBOX_SEND_PROOF_1_0_BLOCKED_REPORT

**Lane:** RedDirt only  
**Slice:** \`${SLICE}\`  
**Generated:** ${generatedAt}

## Status: BLOCKED

**Reason:** ${reason}

**Detail:** ${detail}

## Policy

- Gmail/Calendar proof is **not** complete or **not** green.
- **No** email sandbox send proof layer was validated as complete.
- **Live send** remains **blocked**.
- **Next step:** Complete **REDDIRT-GMAIL-CALENDAR-OAUTH-PROOF-1.0** (\`node scripts/validate-gmail-calendar-oauth-proof.mjs\` must **PASS**; artifacts present under \`data/gmail-calendar-*\`).
`;
  fs.mkdirSync(path.dirname(BLOCKED_MD), { recursive: true });
  fs.writeFileSync(BLOCKED_MD, md, "utf8");
}

function checkGmailCalendarPrecondition() {
  if (!fs.existsSync(GMAIL_CAL_CONTRACT)) {
    return { ok: false, reason: "missing_contract", detail: "data/gmail-calendar-oauth-proof-contract.json not found" };
  }
  let j;
  try {
    j = JSON.parse(fs.readFileSync(GMAIL_CAL_CONTRACT, "utf8"));
  } catch {
    return { ok: false, reason: "invalid_contract", detail: "gmail-calendar contract JSON invalid" };
  }
  if (j?.status !== "pass") {
    return {
      ok: false,
      reason: "gmail_calendar_proof_failed",
      detail: `gmail-calendar-oauth-proof-contract.json status is ${JSON.stringify(j?.status)} (expected "pass")`,
    };
  }
  return { ok: true, reason: "", detail: "" };
}

function main() {
  const pre = checkGmailCalendarPrecondition();
  if (!pre.ok) {
    writeBlocked(pre.reason, pre.detail);
    console.error("BLOCKED validate-email-sandbox-send-proof.mjs —", pre.reason, pre.detail);
    console.error(" ", path.relative(ROOT, BLOCKED_JSON));
    process.exit(1);
  }

  if (fs.existsSync(BLOCKED_JSON)) {
    try {
      fs.unlinkSync(BLOCKED_JSON);
    } catch {
      /* ignore */
    }
  }
  if (fs.existsSync(BLOCKED_MD)) {
    try {
      fs.unlinkSync(BLOCKED_MD);
    } catch {
      /* ignore */
    }
  }

  const checks = [];
  const violations = [];
  const push = (id, ok, detail) => {
    checks.push({ id, ok, detail: ok ? "ok" : detail });
    if (!ok) violations.push(`${id}: ${detail}`);
  };

  push("file:sandbox_lib", existsAt(SANDBOX_LIB), "missing email-sandbox-readiness.ts");
  push("file:sandbox_api", existsAt(SANDBOX_API), "missing email-sandbox-readiness route");
  push("file:sandbox_page", existsAt(SANDBOX_PAGE), "missing email-sandbox page");
  push("readiness_core_lib", existsAt(READINESS_CORE), "missing readiness.ts");

  const readinessCoreSrc = read(READINESS_CORE);
  assertReadinessHostedRouteContract(readinessCoreSrc, push);

  const apiSrc = read(SANDBOX_API);
  push("api_get_only", /export\s+async\s+function\s+GET\s*\(/.test(apiSrc) && !/export\s+async\s+function\s+POST\s*\(/.test(apiSrc), "API must export GET only");
  push("api_email_diag", apiSrc.includes("EMAIL_DIAGNOSTICS_TOKEN"), "EMAIL_DIAGNOSTICS_TOKEN");
  push("api_admin_diag", apiSrc.includes("ADMIN_DIAGNOSTIC_TOKEN"), "ADMIN_DIAGNOSTIC_TOKEN fallback");
  push("no_typo_admin_diagnostics", !apiSrc.includes("ADMIN_DIAGNOSTICS_TOKEN"), "typo ADMIN_DIAGNOSTICS_TOKEN");
  push("api_timing_safe", apiSrc.includes("timingSafeEqual"), "timing-safe bearer");
  assertBearerDiagnosticsOrder(apiSrc, push, "email_sandbox_api");

  const sendNeedle = ["users", "messages", "send"].join(".");
  const sgNeedle = ["sendgrid", "send"].join(".");
  for (const segs of SANDBOX_SCAN_FILES) {
    const s = read(segs);
    const label = segs.join("/");
    push(`no_gmail_send:${label}`, !s.includes(sendNeedle), `must not contain ${sendNeedle}`);
    push(`no_sendgrid_send:${label}`, !s.includes(`${sgNeedle}(`), `must not contain ${sgNeedle}(`);
    push(`no_twilio:${label}`, !/twilio\.messages\.create/.test(s), "no Twilio send");
    push(`no_contact_import_activation:${label}`, !/contactImportApproved:\s*true/.test(s), "no contact import approval");
    push(`no_bulk_send:${label}`, !/bulkSendApproved:\s*true/.test(s), "no bulk send approval");
  }

  const libSrc = read(SANDBOX_LIB);
  push(
    "lib_uses_bundle_safe_route_helper",
    libSrc.includes("resolveApiRouteHandlerPresent") && libSrc.includes("@/lib/communication-command-center/readiness"),
    "email-sandbox-readiness must import resolveApiRouteHandlerPresent from readiness (hosted bundle contract)",
  );
  push(
    "sandbox_lib_no_direct_src_app_api_route_exists_sync",
    !libSrc.includes('path.join(process.cwd(), "src", "app", "api"') &&
      !libSrc.includes("path.join(process.cwd(), 'src', 'app', 'api'"),
    "email-sandbox-readiness must not use direct cwd+src/app/api existsSync for SendGrid route detection (use helper only)",
  );
  push("safety_false_bulk", /bulkSendApproved:\s*false/.test(libSrc), "bulkSendApproved must stay false");
  push("safety_false_gmail", /gmailLiveSendApproved:\s*false/.test(libSrc), "gmailLiveSendApproved must stay false");
  push("safety_false_sendgrid", /sendgridLiveSendApproved:\s*false/.test(libSrc), "sendgridLiveSendApproved must stay false");
  push("safety_false_twilio", /twilioSmsApproved:\s*false/.test(libSrc), "twilioSmsApproved must stay false");
  push("safety_false_contact_import", /contactImportApproved:\s*false/.test(libSrc), "contactImportApproved must stay false");
  push("safety_false_automation_workers", /automationWorkersApproved:\s*false/.test(libSrc), "automationWorkersApproved must stay false");

  const allOk = checks.every((c) => c.ok);
  const contract = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status: allOk ? "pass" : "fail",
    precondition: { gmailCalendarProofPassed: true, source: "data/gmail-calendar-oauth-proof-contract.json" },
    checks,
    violations,
  };

  fs.mkdirSync(path.dirname(OUT_CONTRACT), { recursive: true });
  fs.writeFileSync(OUT_CONTRACT, JSON.stringify(contract, null, 2), "utf8");

  console.log(allOk ? "PASS validate-email-sandbox-send-proof.mjs" : "FAIL validate-email-sandbox-send-proof.mjs");
  console.log(" ", path.relative(ROOT, OUT_CONTRACT));
  if (violations.length) console.error(violations.join("\n"));
  process.exit(allOk ? 0 : 1);
}

main();
