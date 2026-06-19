import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { DebatePrepTrapLanesIndexPanel } from "@/components/election-plan/DebatePrepTrapLanesIndexPanel";

import { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-links";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trap Lanes | Debate Prep | Election Plan",
  description: "Six opponent trap lanes — setup, bait, pivot, rebuttals, and rehearsal scripts.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanTrapLanesPage() {
  return (
    <>
      <div className="ep-classification">Internal · Trap lanes · {DEBATE_PREP_PACKAGE_LABEL}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />
          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">Debate prep · trap lanes</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Trap lanes — full drill-down</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              Chess, not insults — fair setup questions, calm pivots, and scripts Kelly can rehearse standing.
            </p>
          </header>
          <DebatePrepTrapLanesIndexPanel />
        </div>
      </div>
    </>
  );
}
