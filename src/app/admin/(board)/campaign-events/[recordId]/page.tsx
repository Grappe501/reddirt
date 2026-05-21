import { notFound } from "next/navigation";
import { EventDrilldownClient } from "@/components/admin/campaign-events/EventDrilldownClient";
import { loadHotWashNotes } from "@/lib/campaign-events/hot-wash-notes";
import { buildApprovalPackageWithLogs } from "@/lib/campaign-events/approval-package";
import {
  loadApprovalEmailContext,
  mapTokenLinksForPayload,
} from "@/lib/campaign-events/approval-email/load-approval-email-context";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";
import { loadEventMediaBundle } from "@/lib/campaign-events/media/media-storage";

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
  const [mediaBundle, hotWashNotes, emailCtx] = await Promise.all([
    loadEventMediaBundle(recordId),
    loadHotWashNotes(recordId),
    loadApprovalEmailContext(recordId),
  ]);
  const approvalPackage = buildApprovalPackageWithLogs(row, emailCtx.logs, mapTokenLinksForPayload(emailCtx));
  return (
    <EventDrilldownClient
      row={row}
      approvalPackage={approvalPackage}
      mediaItems={mediaBundle.items}
      mediaByUploader={mediaBundle.byUploader}
      hotWashNotes={hotWashNotes}
      fromTravel={sp.from === "travel"}
      returnMonth={sp.month ?? undefined}
    />
  );
}
