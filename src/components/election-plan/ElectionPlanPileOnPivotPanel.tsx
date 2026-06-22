import Link from "next/link";

import {
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayBlockHref,
} from "@/lib/election-plan/debate-prep-links";
import { getDay5OpponentExampleStudy } from "@/lib/election-plan/debatePrepDay5OpponentExampleStudy";
import { getDayCommandDrillDrillDown, DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export function ElectionPlanPileOnPivotPanel() {
  const study = getDay5OpponentExampleStudy("ex5-pileon");
  const drill = getDayCommandDrillDrillDown(DAY5_ID, "d5-pileon-pivot");

  if (!study || !drill) return null;

  return (
    <section className="space-y-4">
      <article className="ep-card border-2 border-rose-200/80 bg-rose-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-rose-900">Optional · pile-on pivot</p>
        <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{study.drillDownTitle}</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">{study.overview}</p>
        <p className="mt-3 text-xs font-bold uppercase text-rose-800">Their move</p>
        <p className="mt-1 text-[var(--ep-navy-muted)]">{study.theirMove}</p>
        <p className="mt-3 text-xs font-bold uppercase text-emerald-900">Kelly bridge</p>
        <p className="mt-1 text-lg font-semibold leading-relaxed text-[var(--ep-navy)]">{study.kellyResponse}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{study.whyItWorks}</p>
        <p className="mt-2 text-xs font-bold text-amber-900">{study.sourceNote}</p>
      </article>

      <article className="ep-card border-indigo-200 bg-indigo-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-indigo-900">Command drill · d5-pileon-pivot</p>
        <p className="mt-2 font-bold text-[var(--ep-navy)]">If they say</p>
        <p className="mt-1 text-[var(--ep-navy-muted)]">{drill.ifTheySay}</p>
        <p className="mt-3 font-bold text-[var(--ep-navy)]">You say</p>
        <p className="mt-1 font-semibold text-[var(--ep-navy)]">{drill.youSay}</p>
        {drill.claimsNote ? <p className="mt-2 text-xs font-bold text-amber-900">{drill.claimsNote}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={epDebatePrepDayDrillHref(DAY5_ID, "d5-pileon-pivot")}
            className="ep-btn ep-btn-primary ep-btn-block-sm-auto inline-block"
          >
            Run pile-on command drill →
          </Link>
          <Link
            href={epDebatePrepDayExampleHref(DAY5_ID, "ex5-pileon")}
            className="inline-block rounded-full border border-[var(--ep-navy)] px-4 py-2 text-xs font-bold text-[var(--ep-navy)]"
          >
            Full example study →
          </Link>
        </div>
      </article>

      <Link
        href={epDebatePrepDayBlockHref(DAY5_ID, "b5-trap-all")}
        className="inline-block text-xs font-bold text-[var(--ep-navy)] underline"
      >
        ← Return to trap sprint block
      </Link>
    </section>
  );
}
