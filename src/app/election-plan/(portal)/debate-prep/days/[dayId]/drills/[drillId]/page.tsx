import { notFound } from "next/navigation";

import { ElectionPlanDay1StepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  getDayCommandDrillDrillDown,
  DAY1_ID,
} from "@/lib/election-plan/debatePrepDayDrillDown";
import { staticParamsForDayDrills } from "@/lib/election-plan/debatePrepDayStaticParams";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticParamsForDayDrills();
}

export default async function ElectionPlanDayCommandDrillPage({
  params,
}: {
  params: Promise<{ dayId: string; drillId: string }>;
}) {
  const { dayId, drillId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();
  const drill = getDayCommandDrillDrillDown(dayId as IntensiveDayId, drillId);
  if (!drill) notFound();

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day 1 pathway"
      eyebrow="Command drill · if / then / scan"
      title={drill.ifTheySay}
    >
      <article className="ep-card border-rose-200 bg-rose-50/40 p-5 text-sm">
        <p className="font-bold text-rose-950">If they say</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{drill.ifTheySay}</p>
        <p className="mt-4 font-bold text-[var(--ep-navy)]">You say</p>
        <p className="mt-2 font-semibold text-[var(--ep-navy)]">{drill.youSay}</p>
        <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
          <span className="font-bold">Then scan:</span> {drill.thenScan}
        </p>
        {drill.claimsNote ? <p className="mt-2 text-xs font-bold text-amber-900">{drill.claimsNote}</p> : null}
      </article>
      <ElectionPlanDrillDownSteps title="Rehearsal loop" steps={drill.practiceSteps} />
      <ElectionPlanDrillDownRelated links={drill.relatedLinks} />
      {dayId === DAY1_ID ? <ElectionPlanDay1StepFooter currentStepId={drillId} /> : null}
    </ElectionPlanDrillDownShell>
  );
}
