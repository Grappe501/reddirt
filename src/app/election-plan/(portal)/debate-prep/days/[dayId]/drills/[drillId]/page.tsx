import { notFound } from "next/navigation";

import { ElectionPlanDayStepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  getDayCommandDrillDrillDown,
  DAY1_ID,
  DAY2_ID,
  DAY3_ID,
  DAY4_ID,
  DAY5_ID,
  DAY6_ID,
  type DrillDownDayId,
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

  const dayLabel =
    dayId === DAY1_ID
      ? "Day 1"
      : dayId === DAY2_ID
        ? "Day 2"
        : dayId === DAY3_ID
          ? "Day 3"
          : dayId === DAY4_ID
            ? "Day 4"
            : dayId === DAY5_ID
              ? "Day 5"
              : dayId === DAY6_ID
                ? "Day 6"
              : "Day";

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow="Command drill · if / then / scan"
      title={drill.ifTheySay}
    >
      <article className="ep-card border-rose-200 bg-rose-50/40 p-5 text-sm">
        <p className="font-bold text-rose-950">If they say</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{drill.ifTheySay}</p>
        <p className="mt-4 font-bold text-[var(--ep-navy)]">You say</p>
        <p className="mt-2 font-semibold text-[var(--ep-navy)]">{drill.youSay}</p>
        {drill.claimsNote ? <p className="mt-4 text-xs font-bold text-amber-900">{drill.claimsNote}</p> : null}
      </article>

      {(dayId === DAY1_ID || dayId === DAY2_ID || dayId === DAY3_ID) && (
        <article
          className={`ep-card mt-4 p-5 text-sm ${
            dayId === DAY2_ID
              ? "border-indigo-300 bg-indigo-50/50"
              : dayId === DAY3_ID
                ? "border-emerald-300 bg-emerald-50/50"
                : "border-[var(--ep-gold)]/50 bg-[var(--ep-cream)]/50"
          }`}
        >
          <h2
            className={`text-xs font-bold uppercase ${
              dayId === DAY2_ID ? "text-indigo-900" : dayId === DAY3_ID ? "text-emerald-900" : "text-[var(--ep-gold)]"
            }`}
          >
            Then scan — presence
          </h2>
          <p className="mt-3 text-base font-semibold leading-relaxed text-[var(--ep-navy)]">{drill.thenScan}</p>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            Pause after your line — eyes and still hands matter as much as the words.
          </p>
        </article>
      )}
      <ElectionPlanDrillDownSteps title="Rehearsal loop" steps={drill.practiceSteps} />
      <ElectionPlanDrillDownRelated links={drill.relatedLinks} />
      {dayId === DAY1_ID || dayId === DAY2_ID || dayId === DAY3_ID || dayId === DAY4_ID || dayId === DAY5_ID || dayId === DAY6_ID ? (
        <ElectionPlanDayStepFooter dayId={dayId as DrillDownDayId} currentStepId={drillId} />
      ) : null}
    </ElectionPlanDrillDownShell>
  );
}
