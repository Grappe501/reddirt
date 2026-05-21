import Link from "next/link";
import { CampaignEventsWorkbench } from "@/components/admin/campaign-events/CampaignEventsWorkbench";
import {
  CampaignEventsNav,
  CampaignEventsPageHeader,
  InfoBanner,
} from "@/app/admin/(board)/campaign-events/components";
import { loadCampaignEventsWorkbench, serializeWorkbenchRows } from "@/lib/campaign-events/load-workbench-events";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string; sync?: string }> };

export default async function CampaignEventsWorkbenchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const { period, rows, seed, jsonFreshness } = await loadCampaignEventsWorkbench({ period: month });
  const serialized = serializeWorkbenchRows(rows);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Campaign operations · batch review"
        title="Campaign Events Workbench"
        description="Sortable, filterable review queue for campaign calendar entries. Future approval-email links land here. Review one event at a time via the same AI modal — not bulk approve yet."
        actions={
          <>
            <Link
              href={`/admin/campaign-events/review?month=${period}&mode=chronological`}
              className="inline-flex rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white"
            >
              Start Month Review
            </Link>
            <Link
              href={`/admin/campaign-events/month-readiness?month=${period}`}
              className="inline-flex rounded-full border border-amber-700/30 bg-amber-50 px-4 py-2 font-body text-sm font-bold text-amber-950"
            >
              Month readiness
            </Link>
            <Link
              href={`/admin/campaign-events/travel-report?month=${period}`}
              className="inline-flex rounded-full border border-kelly-navy/25 px-4 py-2 font-body text-sm font-bold text-kelly-navy"
            >
              Travel report
            </Link>
            <Link
              href="/admin/candidate-dashboard"
              className="inline-flex rounded-full border border-kelly-text/15 px-4 py-2 font-body text-sm font-bold text-kelly-text/75"
            >
              Candidate dashboard
            </Link>
            <Link
              href="/admin/campaign-manager-dashboard"
              className="inline-flex rounded-full border border-kelly-text/15 px-4 py-2 font-body text-sm font-bold text-kelly-text/75"
            >
              CM dashboard
            </Link>
            <Link
              href="/admin/campaign-events/march-2026"
              className="inline-flex rounded-full border border-kelly-text/15 px-4 py-2 font-body text-sm font-bold text-kelly-text/75"
            >
              March ledger view
            </Link>
            <Link
              href={`/admin/campaign-events/calendar-sync?month=${period}`}
              className="inline-flex rounded-full border border-amber-700/30 bg-amber-50 px-4 py-2 font-body text-sm font-bold text-amber-950"
            >
              Calendar sync truth
            </Link>
            <Link
              href="/admin/calendar-command-center"
              className="inline-flex rounded-full border border-kelly-navy/25 bg-kelly-page px-4 py-2 font-body text-sm font-bold text-kelly-navy"
            >
              Calendar command center
            </Link>
          </>
        }
      />
      <CampaignEventsNav />
      <CampaignEventsMonthNav activeMonth={period} basePath="workbench" />

      <InfoBanner tone={jsonFreshness.isStale ? "amber" : "default"}>
        <strong>CE-LEDGER-3 workbench.</strong> Period {period}: {rows.length} records ({seed.updated} synced on load). Normalized JSON:{" "}
        {jsonFreshness.totalRows} rows
        {jsonFreshness.lastModifiedAt ? ` · file ${new Date(jsonFreshness.lastModifiedAt).toLocaleDateString()}` : ""}
        {jsonFreshness.isStale ? ` · ${jsonFreshness.staleReason}` : ""}.{" "}
        <Link href={`/admin/campaign-events/calendar-sync?month=${period}`} className="font-bold underline">
          Calendar sync dashboard →
        </Link>
      </InfoBanner>

      <CampaignEventsWorkbench initialRows={serialized} period={period} initialSyncFilter={sp.sync} />
    </div>
  );
}
