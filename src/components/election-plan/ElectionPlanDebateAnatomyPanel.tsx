import Link from "next/link";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import {
  DEBATE_ANATOMY_OVERVIEW,
  DEBATE_ANATOMY_SEGMENTS,
  DEBATE_PREP_CHECKLIST,
} from "@/lib/election-plan/debate-prep-debate-anatomy-v9";
import { epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";
import { DAY8_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

export function ElectionPlanDebateAnatomyPanel() {
  return (
    <>
      <ElectionPlanDebatePrepSubnav />

      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Course reference</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-slate-900">Debate anatomy</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{DEBATE_ANATOMY_OVERVIEW}</p>
      </header>

      <ol className="space-y-4">
        {DEBATE_ANATOMY_SEGMENTS.map((seg) => (
          <li key={seg.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {seg.order}. {seg.label}
              </p>
              <span className="text-xs font-semibold text-slate-500">{seg.duration}</span>
            </div>
            <p className="mt-2 text-sm text-slate-800">{seg.objective}</p>
            <p className="mt-2 text-xs text-slate-500">Prepare in {seg.prepareInModule}</p>
            {seg.day8SectionHref ? (
              <Link href={seg.day8SectionHref} className="mt-3 inline-block text-xs font-bold text-slate-900 underline">
                Module 8 · rehearse this segment →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>

      <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Stage-day checklist</p>
        <ul className="mt-4 space-y-2">
          {DEBATE_PREP_CHECKLIST.map((item) => (
            <li key={item} className="text-sm text-slate-700">
              {item}
            </li>
          ))}
        </ul>
        <Link
          href={epDebatePrepDayBlockHref(DAY8_ID, "s8-lock-sheet")}
          className="mt-4 inline-block text-sm font-bold text-slate-900 underline"
        >
          Module 8 · export lock sheet →
        </Link>
      </section>
    </>
  );
}
