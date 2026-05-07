/**
 * REDDIRT-GMAIL-CALENDAR-OAUTH-PROOF-1.0 — offline report from contract + repo paths.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-GMAIL-CALENDAR-OAUTH-PROOF-1.0";
const CONTRACT = path.join(ROOT, "data/gmail-calendar-oauth-proof-contract.json");
const OUT_REPORT = path.join(ROOT, "data/gmail-calendar-oauth-proof-report.json");
const OUT_STEPS = path.join(ROOT, "data/gmail-calendar-next-operator-steps.json");
const OUT_MD = path.join(ROOT, "develop_notes/REDDIRT_GMAIL_CALENDAR_OAUTH_PROOF_1_0_REPORT.md");

function main() {
  if (!fs.existsSync(CONTRACT)) {
    console.error("FAIL run validate-gmail-calendar-oauth-proof.mjs first");
    process.exit(1);
  }
  const contract = JSON.parse(fs.readFileSync(CONTRACT, "utf8"));
  const generatedAt = new Date().toISOString();
  const pass = contract.status === "pass";

  const report = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    contractStatus: contract.status,
    summary: pass
      ? "Gmail + Calendar OAuth proof layer present; static contract pass."
      : "Gmail + Calendar OAuth proof validation failed — see contract violations.",
    filesCreated: [
      "src/lib/communication-command-center/gmail-calendar-readiness.ts",
      "src/app/api/admin/communication-command-center/gmail-calendar-readiness/route.ts",
      "src/app/admin/(board)/workbench/communication-command-center/gmail-calendar/page.tsx",
      "scripts/validate-gmail-calendar-oauth-proof.mjs",
      "scripts/build-gmail-calendar-oauth-proof-report.mjs",
      "data/gmail-calendar-oauth-proof-contract.json",
      "data/gmail-calendar-oauth-proof-report.json",
      "data/gmail-calendar-next-operator-steps.json",
      "docs/gmail-calendar-oauth-proof.md",
      "develop_notes/REDDIRT_GMAIL_CALENDAR_OAUTH_PROOF_1_0_REPORT.md",
    ],
    filesModified: [
      "src/components/admin/email-command-center/EmailCommandCenterReadinessView.tsx",
      "src/app/admin/(board)/workbench/communication-command-center/readiness/page.tsx",
      "docs/gmail-calendar-oauth-proof.md",
      "docs/communication-command-center-readiness.md",
      "docs/email-command-center-launch-hardening.md",
      "docs/campaign-email-command-center-progress-ledger.md",
      "docs/PROJECT_MASTER_MAP.md",
      "docs/THREAD_HANDOFF_MASTER_MAP.md",
    ],
    checks: contract.checks ?? [],
    violations: contract.violations ?? [],
  };

  const steps = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    gmail: [
      "Open GET /api/gmail/oauth/start in the browser (same site).",
      "Complete Google consent for the campaign inbox.",
      "Confirm OAuth callback returns without error.",
      "Confirm token / readiness in admin tools (no test blast required).",
      "Confirm metadata-only posture; no sending occurred.",
    ],
    calendar: [
      "Open Workbench → Calendar and start Google connection.",
      "Complete consent so /api/calendar/google/callback stores tokens.",
      "Confirm calendar list or event read in staff UI (read-first).",
      "Do not rely on bulk event writes until explicitly approved later.",
    ],
    safety: [
      "Rotate ADMIN_DIAGNOSTIC_TOKEN in Netlify if it was ever pasted into chat; redeploy.",
      "Keep EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM false until headquarters approves live send.",
    ],
    nextRecommendedSlice: "REDDIRT-GMAIL-CALENDAR-OAUTH-OPERATOR-HOSTED-PROOF-1.0",
  };

  fs.mkdirSync(path.dirname(OUT_REPORT), { recursive: true });
  fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(OUT_STEPS, JSON.stringify(steps, null, 2), "utf8");

  const md = `# REDDIRT_GMAIL_CALENDAR_OAUTH_PROOF_1_0_REPORT

**Lane:** RedDirt only  
**Slice:** \`${SLICE}\`  
**Generated:** ${generatedAt}

## 1. Slice summary

Bearer-protected **Gmail + Calendar OAuth readiness** JSON plus a simple **admin page** and **readiness card**. Read-only static checks in the library; **no** live send, **no** Google API calls from the readiness API.

## 2. Files created

${report.filesCreated.map((f) => `- \\\`${f}\\\``).join("\n")}

## 3. Files modified

${report.filesModified.map((f) => `- \\\`${f}\\\``).join("\n")}

## 4. Gmail readiness

OAuth start/callback and Pub/Sub route files verified on disk. Send capability may exist in \`gmail-api.ts\`; queue send remains locked via governance constant.

## 5. Calendar readiness

Google Calendar callback, cron sync, and webhook route files verified. Operators use **Workbench → Calendar** to connect.

## 6. Safety posture

All \`safety.*Approved\` flags in the readiness payload are **false**; \`noSendPosture\` follows \`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM === false\`.

## 7. Operator OAuth test steps

See \`data/gmail-calendar-next-operator-steps.json\` and \`docs/gmail-calendar-oauth-proof.md\`.

## 8. What remains blocked

Live Gmail send, SendGrid delivery, Twilio SMS, contact import execution, automation workers — unchanged.

## 9. Checks

Contract status: **${contract.status}**. Run \`node scripts/validate-gmail-calendar-oauth-proof.mjs\`.

## 10. Next recommended slice

**${steps.nextRecommendedSlice}** — call hosted \`GET /api/admin/communication-command-center/gmail-calendar-readiness\` with a fresh bearer after Netlify token rotation + deploy.
`;

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, md, "utf8");

  console.log("PASS build-gmail-calendar-oauth-proof-report.mjs");
  console.log(" ", path.relative(ROOT, OUT_REPORT));
  process.exit(0);
}

main();
