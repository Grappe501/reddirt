import Link from "next/link";

import { ElectionPlanDrillDownLink } from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  dayHasDrillDownPages,
  DAY1_CONCEPT_LINKS,
  listDayCommandDrillsDrillDown,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
} from "@/lib/election-plan/debatePrepDayDrillDown";
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
} from "@/lib/election-plan/debate-prep-links";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
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
  { conceptId: "newspaper-angle", label: "Newspaper", getValue: (p) => p.newspaperAngle },
];

export function ElectionPlanDayDrillDownOverview({
  dayId,
  plan,
}: {
  dayId: IntensiveDayId;
  plan: IntensiveDayPlan;
}) {
  if (!dayHasDrillDownPages(dayId)) return null;

  const rehearsalScripts = listDayRehearsalScripts(dayId);
  const microLessons = listDayMicroLessonsDrillDown(dayId);
  const drills = listDayCommandDrillsDrillDown(dayId);

  return (
    <>
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

      <section className="mb-8 space-y-4">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Study blocks</h2>
        {plan.blocks.map((block, idx) => (
          <article key={block.id} className="ep-card p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-[var(--ep-navy)]">
                {idx + 1}. {block.title}
              </p>
              <span className="font-mono text-xs text-[var(--ep-navy-muted)]">{block.minutes} min</span>
            </div>
            <p className="mt-2 text-[var(--ep-navy-muted)]">{block.activity}</p>
            <p className="mt-1 text-xs italic text-indigo-800">{block.why}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <ElectionPlanDrillDownLink href={epDebatePrepDayBlockHref(dayId, block.id)}>
                Block deep dive →
              </ElectionPlanDrillDownLink>
              {block.href ? (
                <Link
                  href={mapAdminHrefToElectionPlan(block.href)}
                  className="text-xs font-bold text-[var(--ep-navy)] underline"
                >
                  Open linked tool →
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      {plan.opponentExamples.length > 0 ? (
        <section className="mb-8 space-y-4">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Opponent examples</h2>
          {plan.opponentExamples.map((ex) => (
            <article key={ex.id} className="ep-card border-rose-200 bg-rose-50/40 p-4 text-sm">
              <p className="font-bold text-rose-950">{ex.opponent}</p>
              <p className="mt-2 text-[var(--ep-navy-muted)]">{ex.theirMove}</p>
              <p className="mt-3 font-bold text-emerald-900">Kelly</p>
              <p>{ex.kellyResponse}</p>
              <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{ex.sourceNote}</p>
              <ElectionPlanDrillDownLink href={epDebatePrepDayExampleHref(dayId, ex.id)}>
                Full example drill →
              </ElectionPlanDrillDownLink>
            </article>
          ))}
        </section>
      ) : null}

      {rehearsalScripts.length > 0 ? (
        <section className="ep-card mb-6 border-emerald-200 bg-emerald-50/50 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Rehearse out loud</h2>
          <ul className="mt-3 space-y-3">
            {rehearsalScripts.map((script, i) => (
              <li key={script.id} className="text-[var(--ep-navy-muted)]">
                <span>{plan.rehearsalOutLoud[i] ?? script.label}</span>
                <ElectionPlanDrillDownLink href={epDebatePrepDayRehearsalHref(dayId, script.id)}>
                  Script &amp; presence notes →
                </ElectionPlanDrillDownLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {microLessons.length > 0 ? (
        <section className="ep-card mb-6 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-indigo-900">Micro-lessons (v2)</h2>
          <ul className="mt-3 space-y-2">
            {microLessons.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={epDebatePrepDayMicroLessonHref(dayId, lesson.id)}
                  className="font-bold text-[var(--ep-navy)] underline"
                >
                  {lesson.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {drills.length > 0 ? (
        <section className="ep-card mb-6 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Command drills — launch</h2>
          <ul className="mt-3 space-y-2">
            {drills.map((drill) => (
              <li key={drill.id}>
                <Link
                  href={epDebatePrepDayDrillHref(dayId, drill.id)}
                  className="font-bold text-[var(--ep-navy)] underline"
                >
                  {drill.ifTheySay.slice(0, 56)}
                  {drill.ifTheySay.length > 56 ? "…" : ""} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="ep-card mb-8 p-4 text-xs">
        <p className="font-bold uppercase text-[var(--ep-navy-muted)]">Day 1 concept index</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {DAY1_CONCEPT_LINKS.map((c) => (
            <li key={c.id}>
              <Link href={c.href} className="rounded-full border border-[var(--ep-border)] px-2 py-1 font-bold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
