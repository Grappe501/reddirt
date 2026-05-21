/**
 * Sprint 5 — calendar promotion dry-run (no Google API; no server-only imports).
 * Run: npm run campaign-events:test-calendar-promotion -- --dry-run
 * Optional period: npm run campaign-events:test-calendar-promotion -- --dry-run 2026-03
 *
 * Full payload preview + promoteLedgerEventToGoogle dry-run run inside Next server actions / workbench.
 */
import { randomBytes } from "node:crypto";
import { prisma } from "../src/lib/db";
import { loadCampaignEventsWorkbench } from "../src/lib/campaign-events/load-workbench-events";
import { parsePromotionAuditLog } from "../src/lib/campaign-events/calendar-promotion/promotion-audit";
import { derivePromotionStatus, parsePromotionMeta } from "../src/lib/campaign-events/calendar-promotion/promotion-meta";
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
  const writeEnabled = envTruthy(process.env.GOOGLE_CALENDAR_WRITE_ENABLED);
  const missing: string[] = [];
  if (!writeEnabled) missing.push("GOOGLE_CALENDAR_WRITE_ENABLED is not true");
  if (!process.env.GOOGLE_CLIENT_ID?.trim() && !process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim()) {
    missing.push("Google OAuth client env");
  }
  return { writeEnabled, missing, readyToWrite: writeEnabled && missing.length === 0 };
}

function basicReadiness(
  record: { factCard: unknown; entrySource: string },
  row: {
    rawDecision: string | null;
    likelyCity: string | null;
    county: string | null;
    hasConflictWarning: boolean;
    duplicateRisk: boolean;
  },
): { level: string; blockers: string[] } {
  const blockers: string[] = [];
  const decision = parseFactCardEnvelope(record.factCard).review.decision;
  if (decision !== "approved") blockers.push("Event not approved");
  if (!row.likelyCity?.trim()) blockers.push("City required");
  if (!row.county?.trim()) blockers.push("County required");
  if (row.hasConflictWarning) blockers.push("Unresolved schedule conflict");
  if (row.duplicateRisk) blockers.push("Duplicate risk flagged");
  return { level: blockers.length ? "BLOCKED" : "READY", blockers };
}

async function appendDryRunAudit(recordId: string) {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("record not found");
  const prev = parsePromotionAuditLog(record.factCard);
  const entry = {
    id: `cpl_${randomBytes(8).toString("hex")}`,
    recordId,
    at: new Date().toISOString(),
    actor: "dry-run-script",
    action: "dry_run" as const,
    targetLane: "tentative" as const,
    message: "Script dry-run — no Google write",
  };
  const envelope = parseFactCardEnvelope(record.factCard);
  const serialized = withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), {
    ...(record.factCard as object),
    _calendarPromotionLog: [...prev, entry].slice(-100),
  });
  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: { factCard: serialized as object },
  });
  return entry.id;
}

async function main() {
  const config = scriptConfigSummary();
  console.log("Calendar promotion config (script view)");
  console.log(`  GOOGLE_CALENDAR_WRITE_ENABLED: ${config.writeEnabled}`);
  console.log(`  readyToWrite: ${config.readyToWrite}`);
  if (config.missing.length) console.log(`  missing: ${config.missing.join("; ")}`);

  const { rows, period } = await loadCampaignEventsWorkbench({ period: periodArg ?? "2026-03" });
  const row =
    rows.find((r) => r.rawDecision === "approved" && r.rawEventStatus !== "CANCELLED") ??
    rows.find((r) => r.rawEventStatus !== "CANCELLED") ??
    rows[0];
  if (!row) {
    console.error("No ledger rows for period");
    process.exit(1);
  }

  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: row.recordId } });
  if (!record) {
    console.error("Record not found");
    process.exit(1);
  }

  const meta = parsePromotionMeta(record.factCard);
  const promotionStatus = derivePromotionStatus(record, row, meta);
  const readiness = basicReadiness(record, row);

  console.log(`\nSample: ${row.recordId} · ${row.calendar.title} (${period})`);
  console.log(`  promotionStatus: ${promotionStatus}`);
  console.log(`  readiness (basic): ${readiness.level} · blockers: ${readiness.blockers.join("; ") || "none"}`);

  if (dryRun) {
    const auditId = await appendDryRunAudit(row.recordId);
    console.log(`\nDry-run audit appended: ${auditId}`);
    console.log("Open /admin/campaign-events/calendar-promotion for full payload preview + promote actions.");
  } else {
    console.log("\nPass --dry-run to append audit entry without Google write.");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
