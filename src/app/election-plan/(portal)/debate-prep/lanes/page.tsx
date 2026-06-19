import { DebateWeekLanesHubClient } from "@/components/admin/intelligence/DebateWeekV3HubPanels";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-system-v8";
import { EP_DEBATE_PREP_PROGRESS_API } from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepDayHref, epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import { DEBATE_INTENSIVE_V3_LABEL, listAllDrillDownLanes } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { loadKellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Drill-Down Lanes | Debate Prep | Election Plan",
  description: "Optional intensive lanes across 8 days — essential, deeper, and stretch.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebatePrepLanesPage() {
  const progress = loadKellyDebateIntensiveProgress();
  const laneCount = listAllDrillDownLanes().length;

  return (
    <>
      <div className="ep-classification">Internal · Drill lanes · {DEBATE_PREP_PACKAGE_LABEL}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">{DEBATE_INTENSIVE_V3_LABEL}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Drill-down lanes</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              {laneCount} optional lanes across 8 days — essential first, then deeper, then stretch. Each lane explains
              theory, why Kelly, and what to watch for.
            </p>
          </header>

          <DebateWeekLanesHubClient
            initialProgress={progress}
            progressApiBase={EP_DEBATE_PREP_PROGRESS_API}
            laneHrefFn={epDebatePrepLaneHref}
            dayHrefFn={epDebatePrepDayHref}
          />
        </div>
      </div>
    </>
  );
}
