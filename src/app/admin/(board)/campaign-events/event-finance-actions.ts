"use server";

import { revalidatePath } from "next/cache";
import { appendGlobalUserObservation } from "@/lib/agents/user-intelligence/user-observations";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";
import { enrichEventFinanceFromRow, buildReimbursementPacketDraft, detectReimbursementExceptions } from "@/lib/campaign-events/finance/finance-helpers";
import { loadEventFinance, saveEventFinance } from "@/lib/campaign-events/finance/finance-persist";
import type { EventFinanceData } from "@/lib/campaign-events/finance/finance-types";
import { listFinanceDocumentsForEvent, listFinanceDocumentsForMonth } from "@/lib/campaign-events/finance/finance-document-store";
import { loadReimbursementMonthStatusContext } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";
import { loadCampaignEventsWorkbench } from "@/lib/campaign-events/load-workbench-events";
import { appendReimbursementAudit, saveReimbursementMonthOperations, loadReimbursementMonthOperations } from "@/lib/campaign-events/finance/reimbursement-operations-store";
import { derivePipelineStatus } from "@/lib/campaign-events/finance/finance-helpers";
import type { ReimbursementPipelineStatus } from "@/lib/campaign-events/finance/reimbursement-operations-types";

function revalidateFinance(recordId: string, month?: string) {
  revalidatePath(`/admin/campaign-events/${recordId}`);
  if (month) {
    revalidatePath("/admin/campaign-events/reimbursement");
    revalidatePath("/admin/candidate-dashboard");
    revalidatePath("/admin/campaign-manager-dashboard");
    revalidatePath("/admin/ai-command-center");
  }
}

async function loadRow(recordId: string) {
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) throw new Error("Event not found");
  return serializeCalendarRows([loaded.row])[0]!;
}

export async function saveEventFinanceAction(recordId: string, data: EventFinanceData) {
  const row = await loadRow(recordId);
  const enriched = await enrichEventFinanceFromRow(row, data);
  await saveEventFinance(recordId, enriched);
  revalidateFinance(recordId, row.dateYmd.slice(0, 7));
  return { ok: true as const, finance: enriched };
}

export async function refreshEventFinanceAction(recordId: string) {
  const row = await loadRow(recordId);
  const current = await loadEventFinance(recordId);
  const enriched = await enrichEventFinanceFromRow(row, current);
  await saveEventFinance(recordId, enriched);
  const gaps = enriched.compliance.gaps;
  if (gaps.length) {
    appendGlobalUserObservation({
      event: "financial_gap_detected",
      actor: "admin",
      role: "campaign_manager",
      recordId,
      pathname: `/admin/campaign-events/${recordId}`,
    });
  }
  if (enriched.compliance.warningLevel !== "low") {
    appendGlobalUserObservation({ event: "compliance_warning_detected", actor: "admin", role: "campaign_manager", recordId });
  }
  revalidateFinance(recordId, row.dateYmd.slice(0, 7));
  return { ok: true as const, finance: enriched };
}

export async function generateReimbursementPacketAction(month: string) {
  const { rows, period } = await loadCampaignEventsWorkbench({ period: month });
  const ctx = await loadReimbursementMonthStatusContext(rows, period);
  const docs = await listFinanceDocumentsForMonth(period);
  const packet = buildReimbursementPacketDraft(period, ctx, docs.length);
  const pipeline = derivePipelineStatus(ctx, docs.filter((d) => d.approvalStatus !== "approved").length);
  const exceptions = detectReimbursementExceptions(rows, period);
  const ops = await loadReimbursementMonthOperations(period);
  await saveReimbursementMonthOperations({
    month: period,
    pipelineStatus: pipeline,
    auditHistory: ops?.auditHistory ?? [],
    exceptions,
    lastPacket: packet,
    updatedAt: new Date().toISOString(),
  });
  await appendReimbursementAudit(period, { actor: "admin", action: "audit_packet_generated", note: "Reimbursement packet draft generated" });
  appendGlobalUserObservation({ event: "audit_packet_generated", actor: "admin", role: "treasurer", pathname: "/admin/campaign-events/reimbursement" });
  revalidatePath("/admin/campaign-events/reimbursement");
  return { ok: true as const, packet };
}

export async function setReimbursementPipelineAction(month: string, status: ReimbursementPipelineStatus) {
  const ops = await loadReimbursementMonthOperations(month);
  await saveReimbursementMonthOperations({
    month,
    pipelineStatus: status,
    auditHistory: ops?.auditHistory ?? [],
    exceptions: ops?.exceptions ?? [],
    lastPacket: ops?.lastPacket,
    updatedAt: new Date().toISOString(),
  });
  await appendReimbursementAudit(month, { actor: "admin", action: "pipeline_status_set", note: status });
  if (status === "reimbursed") {
    appendGlobalUserObservation({ event: "reimbursement_completed", actor: "admin", role: "treasurer" });
  }
  revalidatePath("/admin/campaign-events/reimbursement");
  return { ok: true as const };
}

export async function listEventFinanceDocumentsAction(recordId: string) {
  const docs = await listFinanceDocumentsForEvent(recordId);
  return { ok: true as const, documents: docs };
}
