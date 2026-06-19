import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanDayDrillDownOverview } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { dayHasDrillDownPages } from "@/lib/election-plan/debatePrepDayDrillDown";
import { EP_DEBATE_PREP_HREF } from "@/lib/election-plan/debate-prep-links";
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

  return (
    <>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <ElectionPlanDebatePrepSubnav compact />

          <header className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">
              {plan.weekdayLabel}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{plan.title}</h1>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
            <Link href={EP_DEBATE_PREP_HREF} className="mt-4 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
              ← Debate prep hub
            </Link>
          </header>

          {dayHasDrillDownPages(dayId as IntensiveDayId) ? (
            <ElectionPlanDayDrillDownOverview dayId={dayId as IntensiveDayId} plan={plan} blockListMode="compact" />
          ) : (
            <>
              <section className="ep-card mb-6 grid gap-4 sm:grid-cols-2 p-5 text-sm">
                <div>
                  <p className="font-bold text-[var(--ep-navy)]">Command focus</p>
                  <p className="mt-2 text-[var(--ep-navy-muted)]">{plan.commandModeFocus}</p>
                </div>
                <div>
                  <p className="font-bold text-[var(--ep-navy)]">Psychology</p>
                  <p className="mt-2 text-[var(--ep-navy-muted)]">{plan.psychologyPrinciple}</p>
                </div>
              </section>

              <section className="ep-card mb-6 p-5 text-sm">
                <p className="text-[var(--ep-navy-muted)]">
                  <span className="font-bold text-[var(--ep-navy)]">Goal:</span> {plan.goalForKelly}
                </p>
                <p className="mt-2 text-emerald-900">
                  <span className="font-bold">Success:</span> {plan.successCheck}
                </p>
                <p className="mt-2 text-indigo-900">
                  <span className="font-bold">Newspaper:</span> {plan.newspaperAngle}
                </p>
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
                  </article>
                ))}
              </section>
            </>
          )}

        </div>
      </div>
    </>
  );
}
