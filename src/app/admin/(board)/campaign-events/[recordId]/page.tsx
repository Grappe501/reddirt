import { notFound } from "next/navigation";
import { EventDrilldownClient } from "@/components/admin/campaign-events/EventDrilldownClient";
import { loadHotWashNotes } from "@/lib/campaign-events/hot-wash-notes";
import { loadHotWashIntelligence } from "@/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-persist";
import { buildApprovalPackageWithLogs } from "@/lib/campaign-events/approval-package";
import {
  loadApprovalEmailContext,
  mapTokenLinksForPayload,
} from "@/lib/campaign-events/approval-email/load-approval-email-context";
import { loadAiObservationsForRecord } from "@/lib/campaign-events/ai-tools/observations-persist";
import { parsePromotionAuditLog } from "@/lib/campaign-events/calendar-promotion/promotion-audit";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";
import { loadEventPlanning } from "@/lib/campaign-events/event-planning/event-planning-persist";
import { mergePlanningFromRow } from "@/lib/campaign-events/event-planning/event-planning-helpers";
import { loadEventMediaBundle } from "@/lib/campaign-events/media/media-storage";
import { loadEventFinance } from "@/lib/campaign-events/finance/finance-persist";
import { enrichEventFinanceFromRow } from "@/lib/campaign-events/finance/finance-helpers";
import { listFinanceDocumentsForEvent } from "@/lib/campaign-events/finance/finance-document-store";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { AgentCommandPalette } from "@/components/agents/AgentCommandPalette";

export const dynamic = "force-dynamic";

export default async function CampaignEventDrilldownPage({
  params,
  searchParams,
}: {
  params: Promise<{ recordId: string }>;
  searchParams: Promise<{ from?: string; month?: string }>;
}) {
  const { recordId } = await params;
  const sp = await searchParams;
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) notFound();
  const [row] = serializeCalendarRows([loaded.row]);
  const [mediaBundle, hotWashNotes, hotWashIntelligence, emailCtx, observations] = await Promise.all([
    loadEventMediaBundle(recordId),
    loadHotWashNotes(recordId),
    loadHotWashIntelligence(recordId),
    loadApprovalEmailContext(recordId),
    loadAiObservationsForRecord(recordId),
  ]);
  const approvalPackage = buildApprovalPackageWithLogs(row, emailCtx.logs, mapTokenLinksForPayload(emailCtx));
  const promotionAudit = parsePromotionAuditLog(loaded.record.factCard);
  const planningRaw = await loadEventPlanning(recordId);
  const initialPlanning = mergePlanningFromRow(loaded.row, planningRaw);
  const financeRaw = await loadEventFinance(recordId);
  const initialFinance = await enrichEventFinanceFromRow(row, financeRaw);
  const financeDocuments = await listFinanceDocumentsForEvent(recordId);
  return (
    <AgentObservationTracker
      role="campaign_manager"
      pathname={`/admin/campaign-events/${recordId}`}
      period={sp.month ?? loaded.record.period}
      recordId={recordId}
    >
    <div className="mx-auto max-w-[1100px] px-4 pt-4">
      <AgentCommandPalette
        role="campaign_manager"
        pathname={`/admin/campaign-events/${recordId}`}
        period={sp.month ?? loaded.record.period}
        eventRecordId={recordId}
        compact
      />
    </div>
    <EventDrilldownClient
      row={row}
      initialPlanning={JSON.parse(JSON.stringify(initialPlanning))}
      approvalPackage={approvalPackage}
      approvalObservations={observations}
      promotionAuditEntries={promotionAudit}
      mediaItems={mediaBundle.items}
      mediaByUploader={mediaBundle.byUploader}
      hotWashNotes={hotWashNotes}
      hotWashIntelligence={JSON.parse(JSON.stringify(hotWashIntelligence))}
      initialFinance={JSON.parse(JSON.stringify(initialFinance))}
      financeDocuments={JSON.parse(JSON.stringify(financeDocuments))}
      fromTravel={sp.from === "travel"}
      returnMonth={sp.month ?? undefined}
    />
    </AgentObservationTracker>
  );
}
