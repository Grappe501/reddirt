import Link from "next/link";

import { ElectionPlanPsychologyManualHub } from "@/components/election-plan/ElectionPlanPsychologyManualPanels";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import {
  EP_DEBATE_PREP_BRIEFINGS_HREF,
  EP_DEBATE_PREP_HREF,
  epDebatePrepDayHref,
  epDebatePrepPsychologySectionHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { DEBATE_PSYCHOLOGY_MANUAL_TITLE } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";

export const metadata = {
  title: "Psychology Manual | Debate Prep | Election Plan",
  robots: { index: false, follow: false },
};

const DAY1_PSYCH_SECTIONS = [
  "advanced-candidate-manual-intro",
  "atmosphere-management-overview",
  "when-audience-anxious",
] as const;

export default function ElectionPlanPsychologyManualPage() {
  return (
    <>
      <div className="ep-classification">Internal · Psychology manual · Debate prep</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav />
          <header className="mb-8">
            <Link href={EP_DEBATE_PREP_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] underline">
              ← Debate prep hub
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-bold text-[var(--ep-navy)]">{DEBATE_PSYCHOLOGY_MANUAL_TITLE}</h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              Philosophy before policy detail; atmosphere before argument. Every section is a full drill-down page.
            </p>
          </header>

          <section className="ep-card mb-8 border-2 border-[var(--ep-gold)]/30 p-5 text-sm">
            <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Day 1 reading path</p>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-[var(--ep-navy-muted)]">
              {DAY1_PSYCH_SECTIONS.map((id, i) => (
                <li key={id}>
                  <Link href={epDebatePrepPsychologySectionHref(id)} className="font-bold text-[var(--ep-navy)] underline">
                    Section {i + 1} →
                  </Link>
                </li>
              ))}
            </ol>
            <Link href={epDebatePrepDayHref(DAY1_ID)} className="mt-4 inline-block text-xs font-bold underline">
              Back to Day 1 page
            </Link>
          </section>

          <ElectionPlanPsychologyManualHub />

          <p className="mt-8 text-sm">
            <Link href={EP_DEBATE_PREP_BRIEFINGS_HREF} className="font-bold text-[var(--ep-navy)] underline">
              Philosophy briefings
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
