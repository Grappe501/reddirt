import Link from "next/link";
import { notFound } from "next/navigation";
import { ApprovalPackagePreviewPanel } from "@/components/admin/campaign-events/ApprovalPackagePreviewPanel";
import { buildApprovalPackageWithLogs } from "@/lib/campaign-events/approval-package";
import {
  loadApprovalEmailContext,
  mapTokenLinksForPayload,
} from "@/lib/campaign-events/approval-email/load-approval-email-context";
import { loadAiObservationsForRecord } from "@/lib/campaign-events/ai-tools/observations-persist";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";

export const dynamic = "force-dynamic";

export default async function ApprovalPackagePreviewPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) notFound();
  const [row] = serializeCalendarRows([loaded.row]);
  const [ctx, observations] = await Promise.all([
    loadApprovalEmailContext(recordId),
    loadAiObservationsForRecord(recordId),
  ]);
  const payload = buildApprovalPackageWithLogs(row, ctx.logs, mapTokenLinksForPayload(ctx));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={`/admin/campaign-events/${recordId}`} className="font-body text-sm font-bold text-kelly-navy underline">
          ← Event drilldown
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">Approval package preview</h1>
        <p className="font-body text-sm text-kelly-text/65">
          Gated email send — disabled until EMAIL_SEND_ENABLED and provider env are set.
        </p>
      </div>
      <ApprovalPackagePreviewPanel payload={payload} recordId={recordId} observations={observations} />
    </div>
  );
}
