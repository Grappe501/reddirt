import "server-only";

import type { WorkbenchEventRow } from "../merge-persisted-row";
import { buildOfficialReimbursementReport, type OfficialReimbursementReport } from "./reimbursement-report";
import {
  getReimbursementMonthRecord,
  saveReimbursementMonthRecord,
  type ReimbursementMonthStatusHistoryEntry,
  type ReimbursementMonthStatusRecord,
} from "./reimbursement-month-status-store";
import { verifyTravelReimbursementQueues, type TravelQueueVerification } from "./queue-verification";
import type {
  ReimbursementMonthStatusContext,
  ReimbursementMonthStatusValue,
} from "./reimbursement-month-status-shared";

export type {
  ReimbursementMonthStatusContext,
  ReimbursementMonthStatusValue,
  ReimbursementMonthStatusRecord,
  ReimbursementMonthStatusHistoryEntry,
} from "./reimbursement-month-status-shared";
export { REIMBURSEMENT_STATUS_LABELS } from "./reimbursement-month-status-shared";

function nowIso() {
  return new Date().toISOString();
}

export function computeComputedReimbursementStatus(
  queues: TravelQueueVerification,
  report: OfficialReimbursementReport,
): ReimbursementMonthStatusValue {
  if (report.derivedStatus === "empty") return "draft";
  if (
    queues.needsApproval > 0 ||
    queues.missingMileage > 0 ||
    queues.missingCityCounty > 0 ||
    queues.unreviewedTravel > 0
  ) {
    return "needs_review";
  }
  if (report.totals.approvedEventCount > 0 && report.pendingApprovalCount === 0) {
    return "ready";
  }
  return "draft";
}

export function effectiveReimbursementStatus(
  computed: ReimbursementMonthStatusValue,
  stored: ReimbursementMonthStatusRecord | null,
): ReimbursementMonthStatusValue {
  if (!stored) return computed;
  if (stored.status === "finalized") return "finalized";
  if (stored.status === "ready" && computed !== "needs_review") return "ready";
  if (stored.status === "ready" && computed === "needs_review") return "needs_review";
  return computed;
}

export function buildFinalizeBlockers(queues: TravelQueueVerification): string[] {
  const blockers: string[] = [];
  if (queues.needsApproval > 0) blockers.push(`${queues.needsApproval} travel row(s) still need approval`);
  if (queues.missingMileage > 0) blockers.push(`${queues.missingMileage} row(s) missing mileage`);
  if (queues.missingCityCounty > 0) blockers.push(`${queues.missingCityCounty} row(s) missing city or county`);
  if (queues.includedInReimbursement === 0) blockers.push("No approved reimbursable lines for this month");
  return blockers;
}

export async function loadReimbursementMonthStatusContext(
  rows: WorkbenchEventRow[],
  month: string,
): Promise<ReimbursementMonthStatusContext> {
  const queues = verifyTravelReimbursementQueues(rows, month);
  const report = buildOfficialReimbursementReport(rows, month);
  const stored = await getReimbursementMonthRecord(month);
  const computedStatus = computeComputedReimbursementStatus(queues, report);
  const effectiveStatus = effectiveReimbursementStatus(computedStatus, stored);
  const blockingFinalize = buildFinalizeBlockers(queues);

  return {
    month,
    computedStatus,
    effectiveStatus,
    stored,
    queues,
    report,
    blockingFinalize,
    canMarkReady: effectiveStatus !== "finalized" && computedStatus !== "ready",
    canFinalize: effectiveStatus !== "finalized" && report.totals.approvedEventCount > 0,
    canReopen: effectiveStatus === "finalized" || stored?.status === "ready",
  };
}

function appendHistory(
  record: ReimbursementMonthStatusRecord,
  entry: ReimbursementMonthStatusHistoryEntry,
): ReimbursementMonthStatusRecord {
  return {
    ...record,
    history: [entry, ...record.history].slice(0, 50),
    updatedAt: entry.at,
  };
}

export async function markReimbursementMonthReady(month: string, actor = "admin"): Promise<ReimbursementMonthStatusRecord> {
  const existing = (await getReimbursementMonthRecord(month)) ?? {
    status: "draft" as const,
    updatedAt: nowIso(),
    history: [],
  };
  const record = appendHistory(
    {
      ...existing,
      status: "ready",
      reviewedBy: actor,
      updatedAt: nowIso(),
    },
    { at: nowIso(), by: actor, action: "mark_ready", note: "Operator marked month ready for print/sign." },
  );
  await saveReimbursementMonthRecord(month, record);
  return record;
}

export async function finalizeReimbursementMonth(
  month: string,
  input: { actor?: string; reviewNotes?: string; force?: boolean },
  rows: WorkbenchEventRow[],
): Promise<{ ok: true; record: ReimbursementMonthStatusRecord } | { ok: false; blockers: string[] }> {
  const ctx = await loadReimbursementMonthStatusContext(rows, month);
  if (!input.force && ctx.blockingFinalize.length > 0) {
    return { ok: false, blockers: ctx.blockingFinalize };
  }
  const actor = input.actor?.trim() || "admin";
  const existing = ctx.stored ?? { status: "draft" as const, updatedAt: nowIso(), history: [] };
  const record = appendHistory(
    {
      ...existing,
      status: "finalized",
      finalizedAt: nowIso(),
      finalizedBy: actor,
      reviewedBy: existing.reviewedBy ?? actor,
      reviewNotes: input.reviewNotes?.trim() || existing.reviewNotes,
      updatedAt: nowIso(),
    },
    {
      at: nowIso(),
      by: actor,
      action: "finalize",
      note: input.force ? "Finalized with operator override (blockers acknowledged)." : "Month finalized for reimbursement packet.",
    },
  );
  await saveReimbursementMonthRecord(month, record);
  return { ok: true, record };
}

export async function reopenReimbursementMonthDraft(
  month: string,
  actor = "admin",
  note?: string,
): Promise<ReimbursementMonthStatusRecord> {
  const existing = (await getReimbursementMonthRecord(month)) ?? {
    status: "draft" as const,
    updatedAt: nowIso(),
    history: [],
  };
  const record = appendHistory(
    {
      ...existing,
      status: "draft",
      finalizedAt: undefined,
      finalizedBy: undefined,
      updatedAt: nowIso(),
    },
    {
      at: nowIso(),
      by: actor,
      action: "reopen_draft",
      note: note?.trim() || "Reopened to draft for corrections.",
    },
  );
  await saveReimbursementMonthRecord(month, record);
  return record;
}

