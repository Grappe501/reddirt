import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanDayDrillDownOverview } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { getFirstDay1PathwayStep } from "@/lib/election-plan/day1-learning-pathway";
import { dayHasDrillDownPages, DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { EP_DEBATE_PREP_HREF } from "@/lib/election-plan/debate-prep-links";
import { useKellyDay1StreamlinedPath } from "@/lib/election-plan/kelly-facing-ui";
import {
  DEBATE_WEEK_INTENSIVE_DAY_IDS,
  getDebateWeekIntensiveDay,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return DEBATE_WEEK_INTENSIVE_DAY_IDS.map((dayId) => ({ dayId }));
}

export const metadata = {
  title: "Command Course Day | Debate Prep | Election Plan",
  robots: { index: false, follow: false },
};

export default async function ElectionPlanDebatePrepDayPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();

  const plan = getDebateWeekIntensiveDay(dayId as IntensiveDayId)!;
  const streamlinedDay1 = useKellyDay1StreamlinedPath() && dayId === DAY1_ID;
  const firstStep = dayId === DAY1_ID ? getFirstDay1PathwayStep() : null;

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <ElectionPlanDebatePrepSubnav compact />

        <header className="mb-6">
          <Link href={EP_DEBATE_PREP_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            ← Debate prep
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">{plan.weekdayLabel}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{plan.title}</h1>
          <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
        </header>

        {streamlinedDay1 && firstStep ? (
          <>
            <KellyPageSummary
              summary={`${plan.goalForKelly} One pathway below — start at the top and tap Continue on each page.`}
            />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block rounded-full bg-[var(--ep-navy)] px-6 py-3 text-sm font-bold text-white"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {dayHasDrillDownPages(dayId as IntensiveDayId) ? (
          <ElectionPlanDayDrillDownOverview dayId={dayId as IntensiveDayId} plan={plan} />
        ) : (
          <>
            <section className="ep-card mb-6 grid gap-4 p-5 text-sm sm:grid-cols-2">
              <div>
                <p className="font-bold text-[var(--ep-navy)]">Tonight&apos;s focus</p>
                <p className="mt-2 text-[var(--ep-navy-muted)]">{plan.commandModeFocus}</p>
              </div>
              <div>
                <p className="font-bold text-[var(--ep-navy)]">Success</p>
                <p className="mt-2 text-[var(--ep-navy-muted)]">{plan.successCheck}</p>
              </div>
            </section>
            <KellyPageSummary summary={plan.goalForKelly} />
          </>
        )}
      </div>
    </div>
  );
}
