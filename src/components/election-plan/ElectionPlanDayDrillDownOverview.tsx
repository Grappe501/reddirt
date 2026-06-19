import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { ElectionPlanDrillDownLink } from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  dayHasDrillDownPages,
  listDayCommandDrillsDrillDown,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
} from "@/lib/election-plan/debatePrepDayDrillDown";
import { getDay1BlockStudy } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import type { IntensiveDayId, IntensiveDayPlan } from "@/lib/intelligence/v4/debateWeekIntensive2026";

const CONCEPT_FIELD_MAP: Array<{
  conceptId: string;
  label: string;
  getValue: (plan: IntensiveDayPlan) => string;
}> = [
  { conceptId: "command-focus", label: "Command focus", getValue: (p) => p.commandModeFocus },
  { conceptId: "psychology-principle", label: "Psychology", getValue: (p) => p.psychologyPrinciple },
  { conceptId: "goal-for-kelly", label: "Goal", getValue: (p) => p.goalForKelly },
  { conceptId: "success-check", label: "Success", getValue: (p) => p.successCheck },
];

function dayPageSummary(plan: IntensiveDayPlan): string {
  return `${plan.goalForKelly} Success looks like: ${plan.successCheck}`;
}

export function ElectionPlanDayDrillDownOverview({
  dayId,
  plan,
  showFullBlockList = true,
  blockListMode = "full",
  nextBlockId,
}: {
  dayId: IntensiveDayId;
  plan: IntensiveDayPlan;
  /** @deprecated use blockListMode */
  showFullBlockList?: boolean;
  blockListMode?: "full" | "compact" | "none";
  nextBlockId?: string;
}) {
  if (!dayHasDrillDownPages(dayId)) return null;

  const listMode = showFullBlockList === false ? "none" : blockListMode;

  const rehearsalScripts = listDayRehearsalScripts(dayId);
  const microLessons = listDayMicroLessonsDrillDown(dayId);
  const drills = listDayCommandDrillsDrillDown(dayId);

  const nextBlock = nextBlockId
    ? plan.blocks.find((b) => b.id === nextBlockId)
    : plan.blocks[0];
  const nextStudy = nextBlock && dayId === "day-1-command-foundation" ? getDay1BlockStudy(nextBlock.id) : undefined;

  return (
    <>
      <KellyPageSummary summary={dayPageSummary(plan)} />

      {!showFullBlockList && nextBlock ? (
        <section className="ep-card mb-8 border-2 border-[var(--ep-gold)]/40 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Up next</p>
          <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">
            {nextStudy?.studyGuideTitle ?? nextBlock.title}
          </p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{nextBlock.activity}</p>
          <ElectionPlanDrillDownLink href={epDebatePrepDayBlockHref(dayId, nextBlock.id)}>
            Open study guide ({nextBlock.minutes} min) →
          </ElectionPlanDrillDownLink>
        </section>
      ) : null}

      {listMode !== "none" ? (
        <section className="ep-card mb-6 grid gap-4 sm:grid-cols-2 p-5 text-sm">
          {CONCEPT_FIELD_MAP.map((field) => (
            <div key={field.conceptId}>
              <p className="font-bold text-[var(--ep-navy)]">{field.label}</p>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{field.getValue(plan)}</p>
              <ElectionPlanDrillDownLink href={epDebatePrepDayConceptHref(dayId, field.conceptId)}>
                Deep dive →
              </ElectionPlanDrillDownLink>
            </div>
          ))}
        </section>
      ) : null}

      {listMode !== "none" && !nextBlockId ? (
        <section className="mb-8 space-y-4">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Study blocks</h2>
          {plan.blocks.map((block, idx) => {
            const study = dayId === "day-1-command-foundation" ? getDay1BlockStudy(block.id) : undefined;
            if (listMode === "compact") {
              return (
                <Link
                  key={block.id}
                  href={epDebatePrepDayBlockHref(dayId, block.id)}
                  className="ep-card flex items-center justify-between gap-3 p-4 text-sm transition hover:border-[var(--ep-gold)]"
                >
                  <span className="font-bold text-[var(--ep-navy)]">
                    {idx + 1}. {study?.studyGuideTitle ?? block.title}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-[var(--ep-navy-muted)]">{block.minutes} min →</span>
                </Link>
              );
            }
            return (
              <article key={block.id} className="ep-card p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-[var(--ep-navy)]">
                    {idx + 1}. {study?.studyGuideTitle ?? block.title}
                  </p>
                  <span className="font-mono text-xs text-[var(--ep-navy-muted)]">{block.minutes} min</span>
                </div>
                <p className="mt-2 text-[var(--ep-navy-muted)]">{block.activity}</p>
                <div className="mt-3">
                  <ElectionPlanDrillDownLink href={epDebatePrepDayBlockHref(dayId, block.id)}>
                    Full study guide ({block.minutes} min) →
                  </ElectionPlanDrillDownLink>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {listMode === "full" && plan.opponentExamples.length > 0 ? (
        <section className="mb-8 space-y-4">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Opponent examples</h2>
          {plan.opponentExamples.map((ex) => (
            <Link
              key={ex.id}
              href={epDebatePrepDayExampleHref(dayId, ex.id)}
              className="ep-card block border-rose-200 bg-rose-50/40 p-4 text-sm transition hover:border-rose-400"
            >
              <p className="font-bold text-rose-950">{ex.opponent}</p>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{ex.theirMove}</p>
              <p className="mt-2 font-semibold text-emerald-900">{ex.kellyResponse}</p>
              <p className="mt-3 text-xs font-bold uppercase text-rose-800">Full drill-down →</p>
            </Link>
          ))}
        </section>
      ) : null}

      {listMode === "full" && rehearsalScripts.length > 0 ? (
        <section className="ep-card mb-6 border-emerald-200 bg-emerald-50/50 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Rehearse out loud</h2>
          <ul className="mt-3 space-y-2">
            {rehearsalScripts.map((script, i) => (
              <li key={script.id}>
                <Link href={epDebatePrepDayRehearsalHref(dayId, script.id)} className="font-bold text-[var(--ep-navy)] underline">
                  {plan.rehearsalOutLoud[i] ?? script.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {listMode === "full" && microLessons.length > 0 ? (
        <section className="ep-card mb-6 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-indigo-900">Micro-lessons</h2>
          <ul className="mt-3 space-y-2">
            {microLessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={epDebatePrepDayMicroLessonHref(dayId, lesson.id)} className="font-bold text-[var(--ep-navy)] underline">
                  {lesson.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {listMode === "full" && drills.length > 0 ? (
        <section className="ep-card mb-6 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Command drills</h2>
          <ul className="mt-3 space-y-2">
            {drills.map((drill) => (
              <li key={drill.id}>
                <Link href={epDebatePrepDayDrillHref(dayId, drill.id)} className="font-bold text-[var(--ep-navy)] underline">
                  {drill.ifTheySay.slice(0, 56)}
                  {drill.ifTheySay.length > 56 ? "…" : ""} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
