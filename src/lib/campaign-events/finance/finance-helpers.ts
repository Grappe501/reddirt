import type { CalendarSurfaceRow } from "../load-campaign-calendar-events";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { verifyTravelReimbursementQueues } from "../travel-reimbursement/queue-verification";
import { buildOfficialReimbursementReport } from "../travel-reimbursement/reimbursement-report";
import type { ReimbursementMonthStatusContext } from "../travel-reimbursement/reimbursement-month-status-shared";
import { listFinanceDocumentsForEvent, listFinanceDocumentsForMonth } from "./finance-document-store";
import type { EventExpenseLine, EventFinanceData, ExpenseCategory } from "./finance-types";
import type { FinanceDocumentRecord } from "./finance-document-types";
import type { ReimbursementException, ReimbursementPacketDraft, ReimbursementPipelineStatus } from "./reimbursement-operations-types";
import { REIMBURSEMENT_PIPELINE_LABELS } from "./reimbursement-operations-types";
import type { ReimbursementMonthStatusValue } from "../travel-reimbursement/reimbursement-month-status-shared";

export function mapLegacyToPipelineStatus(legacy: ReimbursementMonthStatusValue): ReimbursementPipelineStatus {
  switch (legacy) {
    case "needs_review":
      return "pending_review";
    case "ready":
      return "ready_for_reimbursement";
    case "finalized":
      return "reimbursed";
    default:
      return "draft";
  }
}

export function derivePipelineStatus(
  ctx: ReimbursementMonthStatusContext,
  missingReceipts: number,
): ReimbursementPipelineStatus {
  if (ctx.effectiveStatus === "finalized") return "reimbursed";
  if (missingReceipts > 0 && ctx.report.totals.approvedEventCount > 0) return "awaiting_receipts";
  if (ctx.effectiveStatus === "ready") return "ready_for_reimbursement";
  if (ctx.effectiveStatus === "needs_review") return "pending_review";
  return mapLegacyToPipelineStatus(ctx.effectiveStatus);
}

export function seedExpensesFromRow(row: CalendarSurfaceRow): EventExpenseLine[] {
  const lines: EventExpenseLine[] = [];
  if (row.roundTripMiles != null && row.roundTripMiles > 0) {
    lines.push({
      id: `exp-mileage-${row.recordId}`,
      category: "mileage",
      description: `Travel — ${row.travelLine || row.calendar.title}`,
      amount: row.reimbursementDisplay ?? String(row.reimbursementAmount ?? ""),
      paid: false,
      reimbursementStatus: row.rawDecision === "approved" ? "approved" : "pending",
    });
  }
  return lines;
}

export function estimateEventBudget(row: CalendarSurfaceRow, finance: EventFinanceData): EventFinanceData["budget"] {
  const exposure =
    row.reimbursementAmount != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(row.reimbursementAmount)
      : finance.budget.reimbursementExposure;
  return {
    ...finance.budget,
    reimbursementExposure: exposure || finance.budget.reimbursementExposure,
    estimatedSpend: finance.budget.estimatedSpend || exposure || "",
    actualSpend: finance.budget.actualSpend || exposure || "",
  };
}

export function classifyExpenseCategory(text: string): ExpenseCategory {
  const t = text.toLowerCase();
  if (/mile|travel|drive/.test(t)) return "mileage";
  if (/food|cater|meal/.test(t)) return "food";
  if (/venue|rent|room/.test(t)) return "venue";
  if (/print|sign|banner/.test(t)) return "printing";
  if (/hotel|lodg/.test(t)) return "lodging";
  if (/fuel|gas/.test(t)) return "fuel";
  if (/digital|web|ads/.test(t)) return "digital";
  if (/suppl/.test(t)) return "supplies";
  return "miscellaneous";
}

export function detectReceiptGaps(row: CalendarSurfaceRow, docs: FinanceDocumentRecord[], finance: EventFinanceData): string[] {
  const gaps: string[] = [];
  const approvedTravel = row.rawDecision === "approved" && (row.roundTripMiles ?? 0) > 0;
  if (approvedTravel && docs.filter((d) => d.approvalStatus === "approved").length === 0) {
    gaps.push("Approved travel with no approved receipt on file");
  }
  for (const exp of finance.expenses) {
    if (exp.reimbursementStatus === "approved" && !exp.receiptDocumentId && !docs.some((d) => d.linkedExpenseId === exp.id)) {
      gaps.push(`Expense "${exp.description}" missing receipt link`);
    }
  }
  return gaps;
}

export function scoreFinancialReadiness(
  row: CalendarSurfaceRow,
  finance: EventFinanceData,
  docs: FinanceDocumentRecord[],
): { score: number; band: string; gaps: string[] } {
  const gaps = detectReceiptGaps(row, docs, finance);
  let score = 40;
  if (finance.budget.estimatedSpend.trim()) score += 10;
  if (finance.expenses.length) score += 15;
  if (docs.length) score += 15;
  if (gaps.length === 0) score += 20;
  if (row.rawDecision === "approved") score += 10;
  score = Math.min(100, score);
  const band = score >= 85 ? "Audit-ready" : score >= 65 ? "Nearly ready" : score >= 45 ? "In progress" : "Needs attention";
  return { score, band, gaps };
}

export function detectReimbursementExceptions(rows: WorkbenchEventRow[], month: string): ReimbursementException[] {
  const out: ReimbursementException[] = [];
  const mileageByDay = new Map<string, WorkbenchEventRow[]>();
  for (const row of rows) {
    if (row.roundTripMiles == null || row.roundTripMiles <= 0) continue;
    const key = row.dateYmd;
    const list = mileageByDay.get(key) ?? [];
    list.push(row);
    mileageByDay.set(key, list);
  }
  for (const [day, list] of mileageByDay) {
    if (list.length > 1) {
      out.push({
        code: "duplicate_mileage_day",
        severity: "medium",
        message: `${list.length} mileage events on ${day} — verify not duplicate claims`,
        recordId: list[0]!.recordId,
      });
    }
  }
  const amounts = rows.map((r) => r.reimbursementAmount ?? 0).filter((a) => a > 0);
  if (amounts.length >= 3) {
    const median = [...amounts].sort((a, b) => a - b)[Math.floor(amounts.length / 2)]!;
    for (const row of rows) {
      const amt = row.reimbursementAmount ?? 0;
      if (amt > median * 2.5 && amt > 80) {
        out.push({
          code: "reimbursement_spike",
          severity: "high",
          message: `Unusual reimbursement ${row.reimbursementDisplay ?? amt} vs month median`,
          recordId: row.recordId,
        });
      }
    }
  }
  const queues = verifyTravelReimbursementQueues(rows, month);
  if (queues.missingMileage > 0) {
    out.push({ code: "missing_mileage", severity: "medium", message: `${queues.missingMileage} row(s) missing mileage` });
  }
  return out.slice(0, 12);
}

export function buildReimbursementPacketDraft(
  month: string,
  ctx: ReimbursementMonthStatusContext,
  receiptCount: number,
): ReimbursementPacketDraft {
  return {
    month,
    generatedAt: new Date().toISOString(),
    travelLineCount: ctx.report.approvedLines.length,
    receiptCount,
    expenseNoteCount: ctx.report.excludedLines.length,
    auditNote: `Pipeline: ${REIMBURSEMENT_PIPELINE_LABELS[derivePipelineStatus(ctx, receiptCount > 0 ? 0 : 1)]}`,
    approvalHistorySummary: ctx.stored?.history?.[0]?.note ?? "No stored month actions yet",
  };
}

export function buildFinanceExecutiveSummary(row: CalendarSurfaceRow, finance: EventFinanceData, readiness: { band: string; gaps: string[] }): string {
  const parts = [
    `${row.calendar.title} (${row.dateYmd})`,
    `Financial readiness: ${readiness.band}`,
    finance.budget.reimbursementExposure ? `Exposure: ${finance.budget.reimbursementExposure}` : null,
    readiness.gaps.length ? `Gaps: ${readiness.gaps.slice(0, 2).join("; ")}` : "Documentation on track",
  ].filter(Boolean);
  return parts.join(" · ");
}

export async function buildCampaignFinanceSummary(rows: WorkbenchEventRow[], month: string) {
  const report = buildOfficialReimbursementReport(rows, month);
  const docs = await listFinanceDocumentsForMonth(month);
  return {
    month,
    approvedReimbursement: report.totals.totalReimbursement,
    pendingApprovals: report.pendingApprovalCount,
    missingMileage: report.missingMileageCount,
    receiptCount: docs.length,
    pendingReceipts: docs.filter((d) => d.approvalStatus === "pending").length,
  };
}

export async function enrichEventFinanceFromRow(row: CalendarSurfaceRow, finance: EventFinanceData): Promise<EventFinanceData> {
  const docs = await listFinanceDocumentsForEvent(row.recordId);
  const readiness = scoreFinancialReadiness(row, finance, docs);
  const timeline = row.approvalTimeline?.find((t) => t.status === "approved");
  return {
    ...finance,
    budget: estimateEventBudget(row, finance),
    expenses: finance.expenses.length ? finance.expenses : seedExpensesFromRow(row),
    linkedReceiptIds: docs.map((d) => d.id),
    compliance: {
      ...finance.compliance,
      warningLevel: readiness.gaps.length >= 2 ? "high" : readiness.gaps.length ? "medium" : "low",
      gaps: readiness.gaps,
      receiptCompleteness: docs.length ? `${docs.filter((d) => d.approvalStatus === "approved").length}/${docs.length} approved` : "No receipts uploaded",
      reimbursementCompleteness: row.reimbursementDisplay || "—",
      travelCompleteness: row.roundTripMiles != null ? `${row.roundTripMiles} mi` : "Missing mileage",
      documentationCompleteness: readiness.band,
      reportingCompleteness: row.rawDecision === "approved" ? "Event approved" : "Pending event approval",
    },
    approvalChain: {
      ...finance.approvalChain,
      eventApprovedBy: finance.approvalChain.eventApprovedBy || timeline?.actor || "",
      eventApprovedAt: finance.approvalChain.eventApprovedAt || timeline?.at || "",
    },
    executiveSummary: buildFinanceExecutiveSummary(row, finance, readiness),
  };
}
