import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDayExampleDrillDown, DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ dayId: DAY1_ID, exampleId: "ex1-hammer-open" }];
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

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day page"
      eyebrow={`Opponent example · ${example.opponent}`}
      title="Hammer opening — authorship pivot"
      description={example.theirMove}
    >
      <article className="ep-card border-rose-200 bg-rose-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-rose-900">Their move</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{example.theirMove}</p>
        <p className="mt-4 text-xs font-bold uppercase text-emerald-900">Kelly response</p>
        <p className="mt-2 font-semibold text-[var(--ep-navy)]">{example.kellyResponse}</p>
        <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">{example.whyItWorks}</p>
        <p className="mt-2 text-xs font-bold text-amber-900">{example.sourceNote}</p>
      </article>
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
    </ElectionPlanDrillDownShell>
  );
}
