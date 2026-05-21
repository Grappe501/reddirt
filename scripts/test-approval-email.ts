/**
 * Sprint 4 — dry-run approval package email validation (no SendGrid; no server-only imports).
 * Run: npm run campaign-events:test-approval-email -- --dry-run
 * Optional period: npm run campaign-events:test-approval-email -- --dry-run 2026-04
 */
import { randomBytes } from "node:crypto";
import { prisma } from "../src/lib/db";
import { loadCampaignEventsWorkbench } from "../src/lib/campaign-events/load-workbench-events";
import { getCandidateApprovalRecipientList } from "../src/lib/campaign-events/approval-recipients";
import { buildApprovalEmailAssist } from "../src/lib/campaign-events/approval-email/approval-email-assist";
import { parseApprovalEmailLog } from "../src/lib/campaign-events/approval-email/approval-email-log";
import {
  parseFactCardEnvelope,
  serializeFactCardEnvelope,
  withPreservedFactCardExtensions,
} from "../src/lib/campaign-events/fact-card-envelope";

const dryRun = process.argv.includes("--dry-run");
const periodArg = process.argv.find((a) => /^\d{4}-\d{2}$/.test(a));

function envTruthy(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function scriptConfigSummary() {
  const sendEnabled = envTruthy(process.env.EMAIL_SEND_ENABLED);
  const baseUrl = (
    process.env.APPROVAL_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  const missing: string[] = [];
  if (!sendEnabled) missing.push("EMAIL_SEND_ENABLED is not true");
  if (!process.env.SENDGRID_API_KEY?.trim()) missing.push("SENDGRID_API_KEY");
  if (!process.env.SENDGRID_FROM_EMAIL?.trim() && !process.env.APPROVAL_EMAIL_FROM?.trim()) {
    missing.push("APPROVAL_EMAIL_FROM or SENDGRID_FROM_EMAIL");
  }
  return { sendEnabled, baseUrl, missing, readyToSend: sendEnabled && missing.length === 0 };
}

async function appendDryRunLog(recordId: string, subject: string, recipients: string[]) {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("record not found");
  const prev = parseApprovalEmailLog(record.factCard);
  const entry = {
    id: `ael_${randomBytes(10).toString("hex")}`,
    recordId,
    recipients,
    subject,
    provider: "none" as const,
    status: "drafted" as const,
    createdAt: new Date().toISOString(),
    createdBy: "dry-run-script",
    dryRun: true,
  };
  const envelope = parseFactCardEnvelope(record.factCard);
  const serialized = withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), {
    ...(record.factCard as object),
    _approvalEmailLog: [...prev, entry],
  });
  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: { factCard: serialized as object },
  });
  return entry.id;
}

async function main() {
  const config = scriptConfigSummary();
  const recipients = getCandidateApprovalRecipientList();

  console.log("Approval email config (script view)");
  console.log(`  EMAIL_SEND_ENABLED: ${config.sendEnabled}`);
  console.log(`  readyToSend: ${config.readyToSend}`);
  console.log(`  baseUrl: ${config.baseUrl}`);
  if (config.missing.length) console.log(`  missing: ${config.missing.join("; ")}`);
  console.log(`  recipients: ${recipients.join(", ")}`);
  console.log(`  sample token URL: ${config.baseUrl}/campaign-events/approval/apt_sample`);

  const { rows, period } = await loadCampaignEventsWorkbench({ period: periodArg ?? "2026-03" });
  const row = rows.find((r) => r.rawEventStatus !== "CANCELLED") ?? rows[0];
  if (!row) {
    console.error("No ledger rows for period");
    process.exit(1);
  }

  const assist = buildApprovalEmailAssist(row);
  console.log(`\nSample event: ${row.recordId} · ${row.calendar.title} (${period})`);
  console.log(`  subject: ${assist.subject}`);
  console.log(`  summary: ${assist.shortSummary.slice(0, 120)}…`);

  if (dryRun) {
    const logId = await appendDryRunLog(row.recordId, assist.subject, [...recipients]);
    console.log(`\nDry-run log appended: ${logId} (status=drafted, no email sent)`);
  } else {
    console.log("\nPass --dry-run to append a drafted log entry without sending.");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
