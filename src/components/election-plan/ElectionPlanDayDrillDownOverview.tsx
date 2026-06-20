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
import { DAY1_ID, DAY2_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
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
        <KellyPageSummary summary="Watch before you counter. Three Hammer tells tonight — trap lanes 1–2 until boring." />
        <VoterAudienceSpeakToBanner profiles={day2Audiences} compact label="Who is watching your pivot" />
        <ElectionPlanDay2PathwayPanel showFullList showDay3Teaser />
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
