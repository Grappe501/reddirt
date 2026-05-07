/**
 * REDDIRT-EMAIL-SANDBOX-SEND-PROOF-1.0 — report from sandbox proof contract.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-EMAIL-SANDBOX-SEND-PROOF-1.0";
const CONTRACT = path.join(ROOT, "data/email-sandbox-send-proof-contract.json");
const OUT_REPORT = path.join(ROOT, "data/email-sandbox-send-proof-report.json");
const OUT_STEPS = path.join(ROOT, "data/email-sandbox-next-operator-steps.json");
const OUT_MD = path.join(ROOT, "develop_notes/REDDIRT_EMAIL_SANDBOX_SEND_PROOF_1_0_REPORT.md");

function main() {
  if (!fs.existsSync(CONTRACT)) {
    console.error("FAIL run node scripts/validate-email-sandbox-send-proof.mjs first (precondition + contract)");
    process.exit(1);
  }
  const contract = JSON.parse(fs.readFileSync(CONTRACT, "utf8"));
  if (contract.status !== "pass") {
    console.error("FAIL email-sandbox-send-proof-contract.json status is not pass");
    process.exit(1);
  }

  const generatedAt = new Date().toISOString();
  const report = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    contractStatus: contract.status,
    summary: "Email sandbox send proof readiness: preconditions include green Gmail/Calendar contract; read-only diagnostics API; admin checklist page; no live send enabled.",
    filesCreated: [
      "src/lib/communication-command-center/email-sandbox-readiness.ts",
      "src/app/api/admin/communication-command-center/email-sandbox-readiness/route.ts",
      "src/app/admin/(board)/workbench/communication-command-center/email-sandbox/page.tsx",
      "scripts/validate-email-sandbox-send-proof.mjs",
      "scripts/build-email-sandbox-send-proof-report.mjs",
      "data/email-sandbox-send-proof-contract.json",
      "data/email-sandbox-send-proof-report.json",
      "data/email-sandbox-next-operator-steps.json",
      "docs/email-sandbox-send-proof.md",
      "develop_notes/REDDIRT_EMAIL_SANDBOX_SEND_PROOF_1_0_REPORT.md",
    ],
    filesModified: [
      "src/components/admin/email-command-center/EmailCommandCenterReadinessView.tsx",
      "src/app/admin/(board)/workbench/communication-command-center/readiness/page.tsx",
      "docs/communication-command-center-readiness.md",
      "docs/email-command-center-launch-hardening.md",
      "docs/campaign-email-command-center-progress-ledger.md",
      "docs/PROJECT_MASTER_MAP.md",
      "docs/THREAD_HANDOFF_MASTER_MAP.md",
    ],
  };

  const steps = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    preconditions: [
      "Hosted DB proof green (reachable + production canonical).",
      "Communication Command Center readiness JSON green.",
      "data/gmail-calendar-oauth-proof-contract.json status pass.",
    ],
    operator: [
      "Confirm one internal staff recipient only.",
      "Confirm no public list or volunteer file.",
      "Use diagnostics bearer only over HTTPS; rotate token if ever pasted into chat.",
      "Run SendGrid auth check / sandbox diagnostic routes only with operator approval.",
      "Separate headquarters slice required before any real campaign send.",
    ],
    nextRecommendedSlice: "REDDIRT-EMAIL-SANDBOX-SEND-OPERATOR-HOSTED-PROOF-1.0",
  };

  fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(OUT_STEPS, JSON.stringify(steps, null, 2), "utf8");

  const md = `# REDDIRT_EMAIL_SANDBOX_SEND_PROOF_1_0_REPORT

**Lane:** RedDirt only · **Slice:** \`${SLICE}\` · **Generated:** ${generatedAt}

## 1. Slice summary

Read-only **email sandbox readiness** (hosted + comms + Gmail/Calendar artifact gate) with bearer **GET** API and admin checklist page. **Does not** authorize live email, list sends, Gmail send, or SendGrid broadcast.

## 2. Files created

${report.filesCreated.map((f) => `- \\\`${f}\\\``).join("\n")}

## 3. Files modified

${report.filesModified.map((f) => `- \\\`${f}\\\``).join("\n")}

## 4. Preconditions

Gmail/Calendar OAuth proof contract **pass** required. Hosted DB + Communication Command Center readiness computed at page/API request time.

## 5–6. Gmail / SendGrid

See \`src/lib/communication-command-center/email-sandbox-readiness.ts\` and \`docs/email-sandbox-send-proof.md\`.

## 7. Sandbox proof readiness

Contract status: **${contract.status}**.

## 8. Safety posture

All live-send approvals remain **false**; allowed recipient mode **internal admin test only** for future operator slice.

## 9. What remains blocked

Live campaign email, list sends, Gmail live send, SendGrid live send, Twilio SMS, imports, automation workers.

## 10. Operator next steps

See \`data/email-sandbox-next-operator-steps.json\`.

## 11. Checks

\`node scripts/validate-email-sandbox-send-proof.mjs\` → \`data/email-sandbox-send-proof-contract.json\`.

## 12. Next recommended slice

**${steps.nextRecommendedSlice}**
`;

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, md, "utf8");

  console.log("PASS build-email-sandbox-send-proof-report.mjs");
  console.log(" ", path.relative(ROOT, OUT_REPORT));
  process.exit(0);
}

main();
