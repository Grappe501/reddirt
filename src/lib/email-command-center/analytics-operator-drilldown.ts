/**
 * EMAIL-ANALYTICS-DRILLDOWN-1.0 — read-only row samples for Analytics & Deliverability operator drilldowns.
 * No provider calls; no sends; bounded queries only.
 */

import { prisma } from "@/lib/db";
import { getReconciliationMeta } from "@/lib/email-command-center/sendgrid-event-reconciliation";

const ECC = "/admin/workbench/email-command-center";
const QUEUE_BASE = "/admin/workbench/email-queue";

export type AnalyticsDrilldownTableRow = {
  id: string;
  label: string;
  status: string;
  updatedAtIso: string;
  href: string;
};

export type EmailAnalyticsOperatorDrilldown = {
  dbReachable: boolean;
  latestFailedSendExecutions: AnalyticsDrilldownTableRow[];
  staleQueueItems: AnalyticsDrilldownTableRow[];
  pendingFinalApprovalExecutions: AnalyticsDrilldownTableRow[];
  pendingImportApprovals: AnalyticsDrilldownTableRow[];
  failedContactSyncRuns: AnalyticsDrilldownTableRow[];
  unreconciledSendGridEvents: AnalyticsDrilldownTableRow[];
};

function row(
  id: string,
  label: string,
  status: string,
  updatedAt: Date,
  href: string,
): AnalyticsDrilldownTableRow {
  return {
    id,
    label: label.slice(0, 120) || id.slice(0, 12),
    status,
    updatedAtIso: updatedAt.toISOString(),
    href,
  };
}

export async function buildEmailAnalyticsOperatorDrilldown(): Promise<EmailAnalyticsOperatorDrilldown> {
  const empty: EmailAnalyticsOperatorDrilldown = {
    dbReachable: false,
    latestFailedSendExecutions: [],
    staleQueueItems: [],
    pendingFinalApprovalExecutions: [],
    pendingImportApprovals: [],
    failedContactSyncRuns: [],
    unreconciledSendGridEvents: [],
  };
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      latestFailedSendExecutions,
      staleQueueItems,
      pendingFinalApprovalExecutions,
      pendingImportApprovals,
      failedContactSyncRuns,
      unreconciledCandidates,
    ] = await Promise.all([
      prisma.emailSendExecution.findMany({
        where: { status: { in: ["FAILED", "PREFLIGHT_FAILED", "PARTIAL_FAILURE"] } },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, status: true, updatedAt: true, subject: true },
      }),
      prisma.emailWorkflowItem.findMany({
        where: {
          status: { notIn: ["CLOSED", "ARCHIVED"] },
          updatedAt: { lt: sevenDaysAgo },
        },
        orderBy: { updatedAt: "asc" },
        take: 8,
        select: { id: true, title: true, status: true, updatedAt: true },
      }),
      prisma.emailSendExecution.findMany({
        where: { status: "READY_FOR_FINAL_APPROVAL" },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, status: true, updatedAt: true, subject: true },
      }),
      prisma.emailContactImportBatch.findMany({
        where: { status: { in: ["VALIDATED", "READY_FOR_APPROVAL"] } },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, name: true, status: true, updatedAt: true },
      }),
      prisma.sendGridContactSyncRun.findMany({
        where: { status: "FAILED" },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, status: true, updatedAt: true, candidateCount: true },
      }),
      prisma.sendGridEvent.findMany({
        orderBy: { occurredAt: "desc" },
        take: 80,
        select: { id: true, eventType: true, email: true, occurredAt: true, metadataJson: true },
      }),
    ]);

    const unreconciledSendGridEvents = unreconciledCandidates
      .filter((e) => !getReconciliationMeta(e.metadataJson))
      .slice(0, 8)
      .map((e) =>
        row(
          e.id,
          `${e.eventType}${e.email ? ` · ${e.email}` : ""}`,
          "unreconciled",
          e.occurredAt,
          `${ECC}/analytics#reconciliation`,
        ),
      );

    return {
      dbReachable: true,
      latestFailedSendExecutions: latestFailedSendExecutions.map((r) =>
        row(r.id, r.subject || "(no subject)", r.status, r.updatedAt, `${ECC}/send-execution#ops`),
      ),
      staleQueueItems: staleQueueItems.map((r) =>
        row(r.id, r.title ?? "(no title)", r.status, r.updatedAt, `${QUEUE_BASE}/${r.id}`),
      ),
      pendingFinalApprovalExecutions: pendingFinalApprovalExecutions.map((r) =>
        row(r.id, r.subject || "(no subject)", r.status, r.updatedAt, `${ECC}/send-execution#ops`),
      ),
      pendingImportApprovals: pendingImportApprovals.map((r) =>
        row(r.id, r.name ?? r.id, r.status, r.updatedAt, `${ECC}/imports/${r.id}`),
      ),
      failedContactSyncRuns: failedContactSyncRuns.map((r) =>
        row(
          r.id,
          `candidates ${r.candidateCount}`,
          r.status,
          r.updatedAt,
          `${ECC}/sendgrid#contact-sync`,
        ),
      ),
      unreconciledSendGridEvents,
    };
  } catch {
    return empty;
  }
}
