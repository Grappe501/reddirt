import Link from "next/link";
import { CalendarSyncDashboard } from "@/components/admin/campaign-events/CalendarSyncDashboard";
import {
  CampaignEventsNav,
  CampaignEventsPageHeader,
} from "@/app/admin/(board)/campaign-events/components";
import { loadCalendarSyncDashboard } from "@/lib/campaign-events/calendar-sync/load-calendar-sync-dashboard";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";
import { MicrocopyHint } from "@/components/admin/campaign-events/MicrocopyHint";
import { loadNextActionsForPage } from "@/lib/agents/user-intelligence/load-next-actions";
import { AgentNextActionPanel } from "@/components/admin/campaign-events/AgentNextActionPanel";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";
import { AgentCommandPalette } from "@/components/agents/AgentCommandPalette";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CampaignEventsCalendarSyncPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const snapshot = await loadCalendarSyncDashboard(month);
  const { snapshot: dashSnap } = await loadCampaignEventsDashboard(month);
  const nextActions = loadNextActionsForPage({
    role: "campaign_manager",
    pathname: "/admin/campaign-events/calendar-sync",
    period: month,
    snapshot: dashSnap,
  });

  return (
    <AgentObservationTracker role="campaign_manager" pathname="/admin/campaign-events/calendar-sync" period={month}>
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Campaign Event OS · calendar truth"
        title="Calendar sync dashboard"
        description="Read-only inventory of Google Calendar connection, normalized JSON freshness, and per-ledger-row sync truth. No Google writes from this page."
        actions={
          <>
            <Link
              href={`/admin/campaign-events/calendar-promotion?month=${month}`}
              className="inline-flex rounded-full border border-kelly-navy/30 px-4 py-2 font-body text-sm font-bold text-kelly-navy"
            >
              Promotion workbench
            </Link>
            <Link
              href={`/admin/campaign-events/workbench?month=${month}`}
              className="inline-flex rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white"
            >
              Workbench ({month})
            </Link>
          </>
        }
      />
      <CampaignEventsNav />
      <CampaignEventsMonthNav activeMonth={month} basePath="workbench" />
      <p className="font-body text-xs">
        <MicrocopyHint term="sync_stale" role="campaign_manager" />
        {" · "}
        <MicrocopyHint term="calendar_promotion" role="campaign_manager" />
      </p>
      <AgentCommandPalette role="campaign_manager" pathname="/admin/campaign-events/calendar-sync" period={month} compact />
      <AgentNextActionPanel actions={nextActions} compact />
      <CalendarSyncDashboard snapshot={snapshot} />
    </div>
    </AgentObservationTracker>
  );
}
