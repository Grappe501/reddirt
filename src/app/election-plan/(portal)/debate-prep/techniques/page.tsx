import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { DebatePrepTechniquesIndexPanel } from "@/components/election-plan/DebatePrepTechniquesIndexPanel";

import { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-links";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Debate Techniques | Debate Prep | Election Plan",
  description: "Hammer attack patterns, culture-war defense, adversity recovery, and three-way debate tactics.",
  robots: { index: false, follow: false },
};

export default function ElectionPlanDebateTechniquesPage() {
  return (
    <>
      <div className="ep-classification">Internal · Techniques library · {DEBATE_PREP_PACKAGE_LABEL}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />
          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">Debate prep · techniques</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Techniques &amp; recovery library</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              Plain-language guides for first-debate operators — attack patterns, culture-war pivots, brain-freeze recovery,
              and three-way ACCA dynamics.
            </p>
          </header>
          <DebatePrepTechniquesIndexPanel />
        </div>
      </div>
    </>
  );
}
