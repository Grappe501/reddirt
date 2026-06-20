import Link from "next/link";
import {
  ElectionPlanDay1PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay1PathwayPanel";
import { ElectionPlanDay1ContinueButton } from "@/components/election-plan/ElectionPlanDay1ContinueButton";
import {
  ElectionPlanDay2PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay2PathwayPanel";
import { ElectionPlanDay2ContinueButton } from "@/components/election-plan/ElectionPlanDay2ContinueButton";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { DAY1_ID, DAY2_ID, DAY3_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import { buildDay3PathwaySteps, getFirstDay3PathwayStep } from "@/lib/election-plan/day3-learning-pathway";
import { isKellyDay1StreamlinedPath, isKellyDay2StreamlinedPath } from "@/lib/election-plan/kelly-facing-ui";
import { resolveAudiencesForHooks } from "@/lib/election-plan/voter-audience-models/resolve-audiences";
import type { IntensiveDayId, IntensiveDayPlan } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { dayHasDrillDownPages } from "@/lib/election-plan/debatePrepDayDrillDown";

function dayPageSummary(plan: IntensiveDayPlan): string {
  return `${plan.goalForKelly} Success tonight: ${plan.successCheck}`;
}

export function ElectionPlanDayDrillDownOverview({
  dayId,
  plan,
}: {
  dayId: IntensiveDayId;
  plan: IntensiveDayPlan;
}) {
  if (!dayHasDrillDownPages(dayId)) return null;

  const streamlinedDay1 = isKellyDay1StreamlinedPath() && dayId === DAY1_ID;
  const streamlinedDay2 = isKellyDay2StreamlinedPath() && dayId === DAY2_ID;
  const day1Audiences = dayId === DAY1_ID ? resolveAudiencesForHooks(["lane-2", "county-champion", "author-vs-administrator"]) : [];
  const day2Audiences =
    dayId === DAY2_ID ? resolveAudiencesForHooks(["county-champion", "integrity", "three-way"]) : [];

  if (streamlinedDay1) {
    return (
      <>
        <KellyPageSummary summary={dayPageSummary(plan)} />
        <VoterAudienceSpeakToBanner profiles={day1Audiences} compact label="Picture in the room" />
        <ElectionPlanDay1PathwayPanel showFullList showDay2Teaser />
      </>
    );
  }

  if (streamlinedDay2) {
    return (
      <>
        <KellyPageSummary
          summary={`Watch before you counter. ${dayPageSummary(plan)} Trap lanes 1–2 until boring — film worksheet + trap lane 1 minimum if tired.`}
        />
        <VoterAudienceSpeakToBanner profiles={day2Audiences} compact label="Who is watching your pivot" />
        <ElectionPlanDay2PathwayPanel showFullList showDay3Teaser />
      </>
    );
  }

  if (dayId === DAY3_ID) {
    const first = getFirstDay3PathwayStep();
    const steps = buildDay3PathwaySteps();
    return (
      <>
        <KellyPageSummary
          summary={`Stack three operational beats — slower and specific beats fast and abstract. ${dayPageSummary(plan)} Minimum tonight: manual + claims gate if tired.`}
        />
        <section className="ep-card mb-8 border-2 border-emerald-300 bg-emerald-50/20 p-6">
          <p className="text-xs font-bold uppercase text-emerald-900">Day 3 · superiority map</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{plan.title}</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
          <Link
            href={first.href}
            className="mt-4 inline-block w-full rounded-full bg-[var(--ep-navy)] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--ep-navy)]/90 sm:w-auto"
          >
            Start block 1 · {first.minutes} min →
          </Link>
          <ol className="mt-6 space-y-2 text-sm">
            {steps.map((step) => (
              <li key={step.id}>
                <Link href={step.href} className="font-medium text-[var(--ep-navy)] underline-offset-2 hover:underline">
                  {step.label}
                </Link>
                <span className="text-[var(--ep-navy-muted)]"> · {step.minutes} min</span>
              </li>
            ))}
          </ol>
        </section>
      </>
    );
  }

  return (
    <>
      <KellyPageSummary summary={dayPageSummary(plan)} />
      <ElectionPlanDay1PathwayPanel showFullList={dayId === DAY1_ID} />
    </>
  );
}

/** Shown at bottom of Day 1 / Day 2 pathway step pages */
export function ElectionPlanDayStepFooter({
  dayId,
  currentStepId,
}: {
  dayId: DrillDownDayId;
  currentStepId: string;
}) {
  const hint =
    dayId === DAY2_ID
      ? "Follow the steps in order — skip optional examples if you are tired. Film + trap lane 1 is enough for tonight."
      : "Follow the steps in order — skip optional sections if you are tired. Posture + author/administrator is enough for tonight.";

  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      {dayId === DAY1_ID ? (
        <ElectionPlanDay1ContinueButton currentStepId={currentStepId} />
      ) : (
        <ElectionPlanDay2ContinueButton currentStepId={currentStepId} />
      )}
      <p className="text-xs text-[var(--ep-navy-muted)]">{hint}</p>
    </footer>
  );
}

/** @deprecated Use ElectionPlanDayStepFooter */
export function ElectionPlanDay1StepFooter({ currentStepId }: { currentStepId: string }) {
  return <ElectionPlanDayStepFooter dayId={DAY1_ID} currentStepId={currentStepId} />;
}
