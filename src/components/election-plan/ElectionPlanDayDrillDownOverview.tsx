import {
  ElectionPlanDay1PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay1PathwayPanel";
import { ElectionPlanDay1ContinueButton } from "@/components/election-plan/ElectionPlanDay1ContinueButton";
import {
  ElectionPlanDay2PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay2PathwayPanel";
import { ElectionPlanDay2ContinueButton } from "@/components/election-plan/ElectionPlanDay2ContinueButton";
import {
  ElectionPlanDay3PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay3PathwayPanel";
import { ElectionPlanDay3ContinueButton } from "@/components/election-plan/ElectionPlanDay3ContinueButton";
import {
  ElectionPlanDay4PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay4PathwayPanel";
import { ElectionPlanDay4ContinueButton } from "@/components/election-plan/ElectionPlanDay4ContinueButton";
import { ElectionPlanNorrisCoalitionDrillPanel } from "@/components/election-plan/ElectionPlanNorrisCoalitionDrillPanel";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import { DAY4_V3_KELLY_MINIMUM_SUMMARY } from "@/lib/election-plan/debate-prep-day4-forum-intelligence-copy";
import { isKellyDay1StreamlinedPath, isKellyDay2StreamlinedPath, isKellyDay3StreamlinedPath, isKellyDay4StreamlinedPath } from "@/lib/election-plan/kelly-facing-ui";
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
  const streamlinedDay3 = isKellyDay3StreamlinedPath() && dayId === DAY3_ID;
  const streamlinedDay4 = isKellyDay4StreamlinedPath() && dayId === DAY4_ID;
  const day1Audiences = dayId === DAY1_ID ? resolveAudiencesForHooks(["lane-2", "county-champion", "author-vs-administrator"]) : [];
  const day2Audiences =
    dayId === DAY2_ID ? resolveAudiencesForHooks(["county-champion", "integrity", "three-way"]) : [];
  const day3Audiences =
    dayId === DAY3_ID
      ? resolveAudiencesForHooks(["county-champion", "author-vs-administrator", "integrity"])
      : [];

  const day4Audiences =
    dayId === DAY4_ID
      ? resolveAudiencesForHooks(["integrity", "county-champion", "author-vs-administrator"])
      : [];

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
        <ElectionPlanNorrisCoalitionDrillPanel dayLabel="Day 2" accent="indigo" />
      </>
    );
  }

  if (streamlinedDay3) {
    return (
      <>
        <KellyPageSummary
          summary={`Stack three qualifications until the list feels boring — organization history beats bill lists. ${dayPageSummary(plan)} Minimum tonight: manual + claims gate if tired.`}
        />
        <VoterAudienceSpeakToBanner profiles={day3Audiences} compact label="Who needs to hear three beats" />
        <ElectionPlanDay3PathwayPanel showFullList showDay4Teaser />
        <ElectionPlanNorrisCoalitionDrillPanel dayLabel="Day 3" accent="emerald" />
      </>
    );
  }

  if (streamlinedDay4) {
    return (
      <>
        <KellyPageSummary
          summary={`Listen like an analyst first — the forum transcript is your Rosetta stone. ${dayPageSummary(plan)} ${DAY4_V3_KELLY_MINIMUM_SUMMARY}`}
        />
        <VoterAudienceSpeakToBanner profiles={day4Audiences} compact label="Who needs clerk-centered intel" />
        <ElectionPlanDay4PathwayPanel showFullList showDay5Teaser />
      </>
    );
  }

  if (dayId === DAY4_ID) {
    return (
      <>
        <KellyPageSummary
          summary={`Listen like an analyst first — the forum transcript is your Rosetta stone. ${dayPageSummary(plan)} Minimum tonight: forum lab ingest if tired.`}
        />
        <ElectionPlanDay4PathwayPanel showFullList showDay5Teaser />
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

/** Shown at bottom of Day 1 / Day 2 / Day 3 pathway step pages */
export function ElectionPlanDayStepFooter({
  dayId,
  currentStepId,
}: {
  dayId: DrillDownDayId;
  currentStepId: string;
}) {
  const hint =
    dayId === DAY4_ID
      ? "Forum lab only is enough for tonight — skip SOS and bios re-read if tired. Kelly's notecard gets claims-gated lines only."
      : dayId === DAY3_ID
        ? "Follow the steps in order — skip optional Hammer example if tired. Manual + claims gate is enough for tonight."
        : dayId === DAY2_ID
          ? "Follow the steps in order — skip optional examples if you are tired. Film + trap lane 1 is enough for tonight."
          : "Follow the steps in order — skip optional sections if you are tired. Posture + author/administrator is enough for tonight.";

  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      {dayId === DAY1_ID ? (
        <ElectionPlanDay1ContinueButton currentStepId={currentStepId} />
      ) : dayId === DAY2_ID ? (
        <ElectionPlanDay2ContinueButton currentStepId={currentStepId} />
      ) : dayId === DAY4_ID ? (
        <ElectionPlanDay4ContinueButton currentStepId={currentStepId} />
      ) : (
        <ElectionPlanDay3ContinueButton currentStepId={currentStepId} />
      )}
      <p className="text-xs text-[var(--ep-navy-muted)]">{hint}</p>
    </footer>
  );
}

/** @deprecated Use ElectionPlanDayStepFooter */
export function ElectionPlanDay1StepFooter({ currentStepId }: { currentStepId: string }) {
  return <ElectionPlanDayStepFooter dayId={DAY1_ID} currentStepId={currentStepId} />;
}
