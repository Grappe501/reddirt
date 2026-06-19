import Link from "next/link";

import {
  ElectionPlanDay1ContinueButton,
  ElectionPlanDay1PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay1PathwayPanel";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { useKellyDay1StreamlinedPath } from "@/lib/election-plan/kelly-facing-ui";
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

  const streamlined = useKellyDay1StreamlinedPath() && dayId === DAY1_ID;
  const day1Audiences = dayId === DAY1_ID ? resolveAudiencesForHooks(["lane-2", "county-champion", "author-vs-administrator"]) : [];

  if (streamlined) {
    return (
      <>
        <KellyPageSummary summary={dayPageSummary(plan)} />
        <VoterAudienceSpeakToBanner profiles={day1Audiences} compact label="Picture in the room" />
        <ElectionPlanDay1PathwayPanel showFullList showDay2Teaser />
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

/** Shown at bottom of Day 1 block / rehearsal pages */
export function ElectionPlanDay1StepFooter({ currentStepId }: { currentStepId: string }) {
  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      <ElectionPlanDay1ContinueButton currentStepId={currentStepId} />
      <p className="text-xs text-[var(--ep-navy-muted)]">
        Follow the steps in order — skip optional sections if you are tired. Posture + author/administrator is enough for tonight.
      </p>
    </footer>
  );
}
