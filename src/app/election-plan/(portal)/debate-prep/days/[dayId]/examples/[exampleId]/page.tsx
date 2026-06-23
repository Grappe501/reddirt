import { notFound } from "next/navigation";

import { ElectionPlanDayStepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import { ElectionPlanBlockStudyPanel } from "@/components/election-plan/ElectionPlanBlockStudyPanel";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDay1OpponentExampleStudy } from "@/lib/election-plan/debatePrepDay1OpponentExampleStudy";
import { getDay2OpponentExampleStudy } from "@/lib/election-plan/debatePrepDay2OpponentExampleStudy";
import { getDay3OpponentExampleStudy } from "@/lib/election-plan/debatePrepDay3OpponentExampleStudy";
import { getDay4OpponentExampleStudy } from "@/lib/election-plan/debatePrepDay4OpponentExampleStudy";
import { getDay5OpponentExampleStudy } from "@/lib/election-plan/debatePrepDay5OpponentExampleStudy";
import { getDayExampleDrillDown, DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, DAY5_ID, DAY7_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDay7PathwayStep } from "@/lib/election-plan/day7-learning-pathway";
import { staticParamsForDayExamples } from "@/lib/election-plan/debatePrepDayStaticParams";
import { getDay1PathwayStep } from "@/lib/election-plan/day1-learning-pathway";
import { getDay2PathwayStep } from "@/lib/election-plan/day2-learning-pathway";
import { getDay3PathwayStep } from "@/lib/election-plan/day3-learning-pathway";
import { getDay4PathwayStep } from "@/lib/election-plan/day4-learning-pathway";
import { getDay5PathwayStep } from "@/lib/election-plan/day5-learning-pathway";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticParamsForDayExamples();
}

export default async function ElectionPlanDayExamplePage({
  params,
}: {
  params: Promise<{ dayId: string; exampleId: string }>;
}) {
  const { dayId, exampleId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();
  const example = getDayExampleDrillDown(dayId as IntensiveDayId, exampleId);
  if (!example) notFound();

  const study =
    dayId === DAY1_ID
      ? getDay1OpponentExampleStudy(exampleId)
      : dayId === DAY2_ID
        ? getDay2OpponentExampleStudy(exampleId)
        : dayId === DAY3_ID
          ? getDay3OpponentExampleStudy(exampleId)
          : dayId === DAY4_ID
            ? getDay4OpponentExampleStudy(exampleId)
            : dayId === DAY5_ID
              ? getDay5OpponentExampleStudy(exampleId)
              : undefined;

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
              : dayId === DAY7_ID
                ? "Day 7"
              : "Day";
  const pathwayStep =
    dayId === DAY1_ID
      ? getDay1PathwayStep(exampleId)
      : dayId === DAY2_ID
        ? getDay2PathwayStep(exampleId)
        : dayId === DAY3_ID
          ? getDay3PathwayStep(exampleId)
          : dayId === DAY4_ID
            ? getDay4PathwayStep(exampleId)
            : dayId === DAY5_ID
              ? getDay5PathwayStep(exampleId)
              : dayId === DAY7_ID
                ? getDay7PathwayStep(exampleId)
              : undefined;
  const isOptional = pathwayStep?.kind === "example";
  const eyebrow = isOptional
    ? `${dayLabel} · Optional · opponent example`
    : `${dayLabel} · opponent example`;

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow={eyebrow}
      title={
        study?.drillDownTitle ??
        (example.opponent === "Hammer" ? "Hammer example pivot" : "Opponent example pivot")
      }
      description={example.theirMove}
    >
      <article className="ep-card border-rose-200 bg-rose-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-rose-900">{example.opponent}</p>
        <p className="mt-3 text-xs font-bold uppercase text-rose-800">Their move</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{example.theirMove}</p>
        <p className="mt-4 text-xs font-bold uppercase text-emerald-900">Kelly</p>
        <p className="mt-2 text-lg font-semibold leading-relaxed text-[var(--ep-navy)]">{example.kellyResponse}</p>
        <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
          <span className="font-bold text-emerald-900">Why it works:</span> {example.whyItWorks}
        </p>
        <p className="mt-2 text-xs font-bold text-amber-900">{example.sourceNote}</p>
      </article>

      {study ? (
        <div className="mt-6">
          <ElectionPlanBlockStudyPanel study={study} />
        </div>
      ) : (
        <>
          <ElectionPlanDrillDownSections sections={example.sections} />
          <article className="ep-card mt-6 p-5 text-sm">
            <h2 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Alternate Kelly lines</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-[var(--ep-navy-muted)]">
              {example.alternateLines.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
          </article>
          <ElectionPlanDrillDownSteps title="Rehearsal steps" steps={example.practiceSteps} />
          <ElectionPlanDrillDownRelated links={example.relatedLinks} />
        </>
      )}
      {dayId === DAY1_ID ||
      dayId === DAY2_ID ||
      dayId === DAY3_ID ||
      dayId === DAY4_ID ||
      dayId === DAY5_ID ||
      dayId === DAY7_ID ? (
        <ElectionPlanDayStepFooter dayId={dayId as DrillDownDayId} currentStepId={exampleId} />
      ) : null}
    </ElectionPlanDrillDownShell>
  );
}
