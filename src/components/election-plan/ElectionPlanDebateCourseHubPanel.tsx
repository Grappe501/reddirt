import Link from "next/link";

import { ElectionPlanCourseProgressDashboard } from "@/components/election-plan/ElectionPlanCourseProgressDashboard";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import {
  EP_DEBATE_PREP_ANATOMY_HREF,
  EP_DEBATE_PREP_RESPONSES_HREF,
} from "@/lib/election-plan/debate-prep-links";
import {
  DEBATE_COMMAND_COURSE_TAGLINE,
  DEBATE_COMMAND_COURSE_TITLE,
  DEBATE_COURSE_MODULES,
  DEBATE_COURSE_TOTAL_HOURS,
} from "@/lib/election-plan/debate-prep-course-catalog-v9";
import { DEBATE_PREP_CHECKLIST } from "@/lib/election-plan/debate-prep-debate-anatomy-v9";

export function ElectionPlanDebateCourseHubPanel() {
  return (
    <>
      <ElectionPlanDebatePrepSubnav />

      <header className="mb-8 border-b border-slate-200 pb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Professional certificate track</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900">
          {DEBATE_COMMAND_COURSE_TITLE}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">{DEBATE_COMMAND_COURSE_TAGLINE}</p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link
          href={EP_DEBATE_PREP_ANATOMY_HREF}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Structure</p>
          <p className="mt-2 font-heading text-lg font-bold text-slate-900">Debate anatomy</p>
          <p className="mt-1 text-sm text-slate-600">Stage order, timing, and what to prepare in each module</p>
        </Link>
        <Link
          href={EP_DEBATE_PREP_RESPONSES_HREF}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Answer bank</p>
          <p className="mt-2 font-heading text-lg font-bold text-slate-900">Extended responses</p>
          <p className="mt-1 text-sm text-slate-600">30s, 90s, and 180s narratives for every major lane</p>
        </Link>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog</p>
          <p className="mt-2 font-heading text-lg font-bold text-slate-900">
            {DEBATE_COURSE_MODULES.length} modules
          </p>
          <p className="mt-1 text-sm text-slate-600">{DEBATE_COURSE_TOTAL_HOURS} hours · Module 8 = 3-hour replay</p>
        </div>
      </div>

      <ElectionPlanCourseProgressDashboard />

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Before every stage appearance</p>
        <ul className="mt-4 space-y-2">
          {DEBATE_PREP_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-700">
              <span className="text-slate-400">□</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
