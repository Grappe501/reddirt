import Link from "next/link";
import { CalendarSyncDashboard } from "@/components/admin/campaign-events/CalendarSyncDashboard";
import {
  CampaignEventsNav,
  CampaignEventsPageHeader,
} from "@/app/admin/(board)/campaign-events/components";
import { loadCalendarSyncDashboard } from "@/lib/campaign-events/calendar-sync/load-calendar-sync-dashboard";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CampaignEventsCalendarSyncPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const snapshot = await loadCalendarSyncDashboard(month);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Campaign Event OS · calendar truth"
        title="Calendar sync dashboard"
        description="Read-only inventory of Google Calendar connection, normalized JSON freshness, and per-ledger-row sync truth. No Google writes from this page."
        actions={
          <Link
            href={`/admin/campaign-events/workbench?month=${month}`}
            className="inline-flex rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white"
          >
            Workbench ({month})
          </Link>
        }
      />
      <CampaignEventsNav />
      <CampaignEventsMonthNav activeMonth={month} basePath="workbench" />
      <CalendarSyncDashboard snapshot={snapshot} />
    </div>
  );
}
