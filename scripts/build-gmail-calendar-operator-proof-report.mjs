/**
 * REDDIRT-GMAIL-CALENDAR-OAUTH-OPERATOR-HOSTED-PROOF-1.0 — offline report from operator proof contract.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-GMAIL-CALENDAR-OAUTH-OPERATOR-HOSTED-PROOF-1.0";
const CONTRACT = path.join(ROOT, "data/gmail-calendar-operator-proof-contract.json");
const OUT_REPORT = path.join(ROOT, "data/gmail-calendar-operator-proof-report.json");
const OUT_STEPS = path.join(ROOT, "data/gmail-calendar-operator-next-steps.json");
const OUT_MD = path.join(ROOT, "develop_notes/REDDIRT_GMAIL_CALENDAR_OAUTH_OPERATOR_HOSTED_PROOF_1_0_REPORT.md");

function main() {
  if (!fs.existsSync(CONTRACT)) {
    console.error("FAIL run validate-gmail-calendar-operator-proof.mjs first");
    process.exit(1);
  }
  const contract = JSON.parse(fs.readFileSync(CONTRACT, "utf8"));
  const generatedAt = new Date().toISOString();
  const pass = contract.status === "pass";

  const filesCreated = [
    "src/lib/communication-command-center/gmail-calendar-operator-proof.ts",
    "src/app/api/admin/communication-command-center/gmail-calendar-operator-proof/route.ts",
    "src/app/admin/(board)/workbench/communication-command-center/gmail-calendar/operator-proof/page.tsx",
    "scripts/validate-gmail-calendar-operator-proof.mjs",
    "scripts/build-gmail-calendar-operator-proof-report.mjs",
    "data/gmail-calendar-operator-proof-contract.json",
    "data/gmail-calendar-operator-proof-report.json",
    "data/gmail-calendar-operator-next-steps.json",
    "docs/gmail-calendar-operator-proof.md",
    "develop_notes/REDDIRT_GMAIL_CALENDAR_OAUTH_OPERATOR_HOSTED_PROOF_1_0_REPORT.md",
  ];

  const filesModified = [
    "src/components/admin/email-command-center/EmailCommandCenterReadinessView.tsx",
    "src/app/admin/(board)/workbench/communication-command-center/readiness/page.tsx",
    "src/app/admin/(board)/workbench/communication-command-center/gmail-calendar/page.tsx",
    "docs/gmail-calendar-oauth-proof.md",
    "docs/communication-command-center-readiness.md",
    "docs/email-command-center-launch-hardening.md",
    "docs/campaign-email-command-center-progress-ledger.md",
    "docs/PROJECT_MASTER_MAP.md",
    "docs/THREAD_HANDOFF_MASTER_MAP.md",
  ];

  const report = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    contractStatus: contract.status,
    summary: pass
      ? "Operator-hosted Gmail + Calendar OAuth proof slice present; static contract pass."
      : "Operator proof validation failed — see contract violations.",
    filesCreated,
    filesModified,
    checks: contract.checks ?? [],
    violations: contract.violations ?? [],
  };

  const steps = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    preconditions: [
      "GET /api/admin/communication-command-center/readiness → ok true",
      "GET /api/admin/communication-command-center/gmail-calendar-readiness → ok true",
      "GET /api/admin/communication-command-center/email-sandbox-readiness → ok true",
    ],
    gmail: [
      "Open /admin/workbench/communication-command-center/gmail-calendar/operator-proof",
      "Use Connect Gmail → /api/gmail/oauth/start; complete Google consent.",
      "Confirm callback success; verify metadata read-only posture in Gmail monitor (no send).",
    ],
    calendar: [
      "From operator proof page, open Calendar workspace → connect Google.",
      "Confirm read/sync; do not rely on bulk event writes until separately approved.",
    ],
    safety: [
      "Rotate ADMIN_DIAGNOSTIC_TOKEN in Netlify if exposed; redeploy.",
      "This slice does not authorize email send, list send, SendGrid delivery, Twilio SMS, imports, workers, or calendar writes.",
    ],
    nextRecommendedSlice: "Operator runs hosted Gmail OAuth, then Calendar OAuth, with runbook notes (redacted).",
  };

  fs.mkdirSync(path.dirname(OUT_REPORT), { recursive: true });
  fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(OUT_STEPS, JSON.stringify(steps, null, 2), "utf8");

  const md = `# REDDIRT_GMAIL_CALENDAR_OAUTH_OPERATOR_HOSTED_PROOF_1_0_REPORT

**Lane:** RedDirt only  
**Slice:** \`${SLICE}\`  
**Generated:** ${generatedAt}

## 1. Slice summary

Operator-facing **connection proof** page and bearer **GET** JSON that gate on the three hosted readiness endpoints being green. Read-only: **no** Gmail send, **no** SendGrid, **no** Twilio, **no** imports, **no** workers, **no** calendar write activation.

## 2. Files created

${filesCreated.map((f) => `- \\\`${f}\\\``).join("\n")}

## 3. Files modified

${filesModified.map((f) => `- \\\`${f}\\\``).join("\n")}

## 4. Preconditions

Operator proof \`ok: true\` requires Communication Command Center readiness, Gmail + Calendar readiness, and email sandbox readiness all **ok**, plus **no-send** posture.

## 5. Gmail operator proof

OAuth start URL \`/api/gmail/oauth/start\`; metadata-first; send locked in safety payload.

## 6. Calendar operator proof

Workbench Calendar connect; read/sync first; **eventWritesLocked** true in JSON; separate approval for writes.

## 7. Safety posture

All \`safety.*Approved\` fields **false**; \`calendarEventWriteApproved\` **false**; \`noSendPosture\` from governance.

## 8. Operator hosted test steps

See \`data/gmail-calendar-operator-next-steps.json\` and \`docs/gmail-calendar-operator-proof.md\`.

## 9. What remains blocked

Live email, list sends, SendGrid delivery, Twilio SMS, contact import execution, automation workers, bulk calendar writes — unchanged until explicit headquarters slices.

## 10. Checks

Contract status: **${contract.status}**. Run \`node scripts/validate-gmail-calendar-operator-proof.mjs\`.

## 11. Next recommended slice

${steps.nextRecommendedSlice}
`;

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, md, "utf8");

  console.log("PASS build-gmail-calendar-operator-proof-report.mjs");
  console.log(" ", path.relative(ROOT, OUT_REPORT));
  process.exit(0);
}

main();
