import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanDayStepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import { ElectionPlanDrillDownShell, ElectionPlanDrillDownSteps } from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDayBlockPhaseContext } from "@/lib/election-plan/debatePrepBlockPhase";
import { staticParamsForDayBlockPhases } from "@/lib/election-plan/debatePrepDayStaticParams";
import { DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayBlockPhaseHref,
  epDebatePrepDayHref,
} from "@/lib/election-plan/debate-prep-links";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticParamsForDayBlockPhases();
}

export default async function ElectionPlanDayBlockPhasePage({
  params,
}: {
  params: Promise<{ dayId: string; blockId: string; phaseIndex: string }>;
}) {
  const { dayId, blockId, phaseIndex: phaseIndexRaw } = await params;
  if (dayId !== DAY1_ID && dayId !== DAY2_ID && dayId !== DAY3_ID && dayId !== DAY4_ID) notFound();

  const phaseIndex = Number.parseInt(phaseIndexRaw, 10);
  if (!Number.isFinite(phaseIndex)) notFound();

  const drillDayId = dayId as DrillDownDayId;
  const ctx = getDayBlockPhaseContext(drillDayId, blockId, phaseIndex);
  if (!ctx) notFound();

  const dayLabel =
    dayId === DAY1_ID ? "Day 1" : dayId === DAY2_ID ? "Day 2" : dayId === DAY3_ID ? "Day 3" : dayId === DAY4_ID ? "Day 4" : "Day";
  const prevIndex = phaseIndex > 1 ? phaseIndex - 1 : null;
  const nextIndex = phaseIndex < ctx.totalPhases ? phaseIndex + 1 : null;

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayBlockHref(dayId, blockId)}
      backLabel={`${ctx.study.studyGuideTitle}`}
      eyebrow={`${dayLabel} · Timed phase ${phaseIndex} of ${ctx.totalPhases}`}
      title={ctx.phase.title}
      description={ctx.study.overview}
      pageSummary={ctx.study.professorLead}
    >
      <article className="ep-card border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/50 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Time box</p>
        <p className="mt-2 font-mono text-lg font-bold text-[var(--ep-navy)]">{ctx.phase.minutesLabel}</p>
        <p className="mt-3 text-[var(--ep-navy-muted)]">
          Phase {phaseIndex} of {ctx.totalPhases} — complete these steps in order before advancing. Timer ends when the
          block time box ends, not when steps feel done.
        </p>
      </article>

      <ElectionPlanDrillDownSteps title="Steps — follow in order" steps={ctx.phase.steps} />

      {ctx.study.keyTakeaways.length > 0 ? (
        <article className="ep-card mt-6 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Block success check (end state)</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {ctx.study.keyTakeaways.map((t) => (
              <li key={t.slice(0, 48)}>{t}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <nav className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
        {prevIndex ? (
          <Link
            href={epDebatePrepDayBlockPhaseHref(dayId, blockId, prevIndex)}
            className="rounded-full border border-[var(--ep-navy)] px-4 py-2 text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            ← Phase {prevIndex}
          </Link>
        ) : null}
        {nextIndex ? (
          <Link
            href={epDebatePrepDayBlockPhaseHref(dayId, blockId, nextIndex)}
            className="rounded-full border border-[var(--ep-gold)] bg-[var(--ep-cream)] px-4 py-2 text-[var(--ep-navy)]"
          >
            Phase {nextIndex} →
          </Link>
        ) : (
          <Link
            href={epDebatePrepDayHref(dayId)}
            className="rounded-full border border-[var(--ep-gold)] bg-[var(--ep-cream)] px-4 py-2 text-[var(--ep-navy)]"
          >
            Back to {dayLabel} pathway →
          </Link>
        )}
      </nav>

      {dayId === DAY1_ID || dayId === DAY2_ID || dayId === DAY3_ID || dayId === DAY4_ID ? (
        <ElectionPlanDayStepFooter dayId={dayId as DrillDownDayId} currentStepId={blockId} />
      ) : null}
    </ElectionPlanDrillDownShell>
  );
}
