import Link from "next/link";
import { MonthReadinessDashboard } from "@/components/admin/campaign-events/month-readiness/MonthReadinessDashboard";
import { CampaignEventsMonthNav } from "@/components/admin/campaign-events/CampaignEventsMonthNav";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";
import { buildMonthReadinessSnapshot } from "@/lib/campaign-events/month-readiness/build-month-readiness";
import { buildMonthQuickActions } from "@/lib/campaign-events/month-readiness/month-readiness-quick-actions";
import { computeMonthReviewStats } from "@/lib/campaign-events/month-review/month-review-stats";
import { MonthReadinessQuickActions } from "@/components/admin/campaign-events/month-readiness/MonthReadinessQuickActions";
import { loadCampaignEventsWorkbench, serializeWorkbenchRows } from "@/lib/campaign-events/load-workbench-events";
import { parseReviewMonth } from "@/lib/campaign-events/month-review/month-review-types";
import { APRIL_2026_LEDGER_PERIOD } from "@/lib/campaign-events/constants";
import { MicrocopyHint } from "@/components/admin/campaign-events/MicrocopyHint";
import { loadNextActionsForPage } from "@/lib/agents/user-intelligence/load-next-actions";
import { AgentNextActionPanel } from "@/components/admin/campaign-events/AgentNextActionPanel";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function CampaignMonthReadinessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month, APRIL_2026_LEDGER_PERIOD);
  const { rows, period } = await loadCampaignEventsWorkbench({ period: month });
  const snapshot = await buildMonthReadinessSnapshot(rows, period);
  const quickActions = buildMonthQuickActions(period, rows, computeMonthReviewStats(rows));
  const nextActions = loadNextActionsForPage({
    role: "campaign_manager",
    pathname: "/admin/campaign-events/month-readiness",
    period,
  });

  return (
    <AgentObservationTracker role="campaign_manager" pathname="/admin/campaign-events/month-readiness" period={period}>
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Campaign operations · month close"
        title={`${snapshot.monthLabel} readiness`}
        description="Completion dashboard: what must be finished before this month is operationally closed. Click issue counts to open filtered Month Review queues. May seed is not enabled until April meets the readiness gate."
        actions={
          <>
            <Link
              href={`/admin/campaign-events/review?month=${period}&mode=chronological`}
              className="rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white"
            >
              Month review
            </Link>
            <Link href={`/admin/campaign-events/travel-report?month=${period}`} className="rounded-full border px-4 py-2 font-body text-sm font-bold">
              Travel report
            </Link>
          </>
        }
      />
      <CampaignEventsNav />
      <CampaignEventsMonthNav activeMonth={period} basePath="workbench" />
      <p className="font-body text-xs text-kelly-text/65">
        <MicrocopyHint term="readiness_score" role="campaign_manager" label="Readiness score" />
      </p>
      <AgentNextActionPanel actions={nextActions} compact />
      <nav className="flex flex-wrap gap-2 font-body text-sm">
        <Link href={`/admin/campaign-events/month-readiness?month=2026-03`} className="underline">
          March readiness
        </Link>
        <Link href={`/admin/campaign-events/month-readiness?month=2026-04`} className="font-semibold text-kelly-navy underline">
          April readiness
        </Link>
      </nav>
      <MonthReadinessQuickActions actions={quickActions} period={period} />
      <MonthReadinessDashboard snapshot={snapshot} />
    </div>
    </AgentObservationTracker>
  );
}
