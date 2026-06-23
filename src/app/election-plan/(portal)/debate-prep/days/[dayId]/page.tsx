import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanDayDrillDownOverview } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { getFirstDay1PathwayStep } from "@/lib/election-plan/day1-learning-pathway";
import { getFirstDay2PathwayStep } from "@/lib/election-plan/day2-learning-pathway";
import { getFirstDay3PathwayStep } from "@/lib/election-plan/day3-learning-pathway";
import { getFirstDay4PathwayStep } from "@/lib/election-plan/day4-learning-pathway";
import { getFirstDay5PathwayStep } from "@/lib/election-plan/day5-learning-pathway";
import { getFirstDay6PathwayStep } from "@/lib/election-plan/day6-learning-pathway";
import { getFirstDay7PathwayStep } from "@/lib/election-plan/day7-learning-pathway";
import { DAY7_HUB_TONIGHT_SUMMARY } from "@/lib/election-plan/debate-prep-day7-polish-copy";
import { dayHasDrillDownPages, DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, DAY5_ID, DAY6_ID, DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { EP_DEBATE_PREP_HREF } from "@/lib/election-plan/debate-prep-links";
import { DAY5_HUB_TONIGHT_SUMMARY } from "@/lib/election-plan/debate-prep-day5-anticipate-copy";
import { DAY6_HUB_TONIGHT_SUMMARY } from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import { isKellyDay1StreamlinedPath, isKellyDay2StreamlinedPath, isKellyDay3StreamlinedPath, isKellyDay4StreamlinedPath, isKellyDay5StreamlinedPath, isKellyDay6StreamlinedPath, isKellyDay7StreamlinedPath } from "@/lib/election-plan/kelly-facing-ui";
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
  const streamlinedDay1 = isKellyDay1StreamlinedPath() && dayId === DAY1_ID;
  const streamlinedDay2 = isKellyDay2StreamlinedPath() && dayId === DAY2_ID;
  const streamlinedDay3 = isKellyDay3StreamlinedPath() && dayId === DAY3_ID;
  const streamlinedDay4 = isKellyDay4StreamlinedPath() && dayId === DAY4_ID;
  const streamlinedDay5 = isKellyDay5StreamlinedPath() && dayId === DAY5_ID;
  const streamlinedDay6 = isKellyDay6StreamlinedPath() && dayId === DAY6_ID;
  const streamlinedDay7 = isKellyDay7StreamlinedPath() && dayId === DAY7_ID;
  const firstStep =
    dayId === DAY1_ID
      ? getFirstDay1PathwayStep()
      : dayId === DAY2_ID
        ? getFirstDay2PathwayStep()
        : dayId === DAY3_ID
          ? getFirstDay3PathwayStep()
          : dayId === DAY4_ID
            ? getFirstDay4PathwayStep()
            : dayId === DAY5_ID
              ? getFirstDay5PathwayStep()
              : dayId === DAY6_ID
                ? getFirstDay6PathwayStep()
              : dayId === DAY7_ID
                ? getFirstDay7PathwayStep()
              : null;

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
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {streamlinedDay2 && firstStep ? (
          <>
            <KellyPageSummary summary={`${plan.goalForKelly} One pathway below — read forum tells first, then trap lanes until boring.`} />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {streamlinedDay3 && firstStep ? (
          <>
            <KellyPageSummary
              summary={`${plan.goalForKelly} Stack three qualifications until the list feels boring — one pathway below.`}
            />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {streamlinedDay4 && firstStep ? (
          <>
            <KellyPageSummary
              summary={`${plan.goalForKelly} Listen like an analyst first — forum lab ingest is the job tonight.`}
            />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {streamlinedDay5 && firstStep ? (
          <>
            <KellyPageSummary summary={DAY5_HUB_TONIGHT_SUMMARY} />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {!streamlinedDay5 && dayId === DAY5_ID && firstStep ? (
          <>
            <KellyPageSummary
              summary={`${plan.goalForKelly} Turn Day 4 forum intel into timed when-X-say-Y pairs — claims-green only.`}
            />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {streamlinedDay6 && firstStep ? (
          <>
            <KellyPageSummary summary={DAY6_HUB_TONIGHT_SUMMARY} />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {!streamlinedDay6 && dayId === DAY6_ID && firstStep ? (
          <>
            <KellyPageSummary
              summary={`${plan.goalForKelly} One pathway below — fail in the room with staff, not on the APA statewide broadcast.`}
            />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {streamlinedDay7 && firstStep ? (
          <>
            <KellyPageSummary summary={DAY7_HUB_TONIGHT_SUMMARY} />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
            >
              Start now · {firstStep.label} →
            </Link>
          </>
        ) : null}

        {!streamlinedDay7 && dayId === DAY7_ID && firstStep ? (
          <>
            <KellyPageSummary summary={DAY7_HUB_TONIGHT_SUMMARY} />
            <Link
              href={firstStep.href}
              className="mb-8 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white sm:w-auto"
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
