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
import { ElectionPlanDay5ContinueButton } from "@/components/election-plan/ElectionPlanDay5ContinueButton";
import {
  ElectionPlanDay5PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay5PathwayPanel";
import { ElectionPlanDay6ContinueButton } from "@/components/election-plan/ElectionPlanDay6ContinueButton";
import {
  ElectionPlanDay6PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay6PathwayPanel";
import { ElectionPlanDay7ContinueButton } from "@/components/election-plan/ElectionPlanDay7ContinueButton";
import {
  ElectionPlanDay7PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay7PathwayPanel";
import { ElectionPlanDay8ContinueButton } from "@/components/election-plan/ElectionPlanDay8ContinueButton";
import { ElectionPlanDay8PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay8PathwayProgressBar";
import {
  ElectionPlanDay8PathwayPanel,
} from "@/components/election-plan/ElectionPlanDay8PathwayPanel";
import { ElectionPlanNorrisCoalitionDrillPanel } from "@/components/election-plan/ElectionPlanNorrisCoalitionDrillPanel";
import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, DAY5_ID, DAY6_ID, DAY7_ID, DAY8_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import { DAY7_HUB_TONIGHT_SUMMARY, DAY7_PEAK_END_FRAME, DAY7_V3_KELLY_MINIMUM_SUMMARY } from "@/lib/election-plan/debate-prep-day7-polish-copy";
import { DAY8_ARKANSAS_PEOPLE_FRAME, DAY8_V3_KELLY_MINIMUM_SUMMARY } from "@/lib/election-plan/debate-prep-day8-crash-copy";
import { DAY8_SOS_THREE_DOMAINS_FRAME } from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import { DAY6_APA_SIM_FRAME, DAY6_V3_KELLY_MINIMUM_SUMMARY } from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import { DAY4_V3_KELLY_MINIMUM_SUMMARY } from "@/lib/election-plan/debate-prep-day4-forum-intelligence-copy";
import { DAY5_APA_STATEWIDE_BROADCAST_FRAME, DAY5_V3_KELLY_MINIMUM_SUMMARY } from "@/lib/election-plan/debate-prep-day5-anticipate-copy";
import { isKellyDay1StreamlinedPath, isKellyDay2StreamlinedPath, isKellyDay3StreamlinedPath, isKellyDay4StreamlinedPath, isKellyDay5StreamlinedPath, isKellyDay6StreamlinedPath, isKellyDay7StreamlinedPath, isKellyDay8CrashCoursePath, isKellyDay8StreamlinedPath } from "@/lib/election-plan/kelly-facing-ui";
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
  const streamlinedDay5 = isKellyDay5StreamlinedPath() && dayId === DAY5_ID;
  const streamlinedDay6 = isKellyDay6StreamlinedPath() && dayId === DAY6_ID;
  const streamlinedDay7 = isKellyDay7StreamlinedPath() && dayId === DAY7_ID;
  const streamlinedDay8 = isKellyDay8StreamlinedPath() && dayId === DAY8_ID;
  const crashCourseDay8 = isKellyDay8CrashCoursePath() && dayId === DAY8_ID;
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
          summary={`Read forum tells before you counter. ${dayPageSummary(plan)} Trap lanes 1–2 until boring — tell worksheet + trap lane 1 minimum if tired.`}
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

  if (streamlinedDay5) {
    return (
      <>
        <KellyPageSummary
          summary={`Pre-load when-X-say-Y pairs from Day 4 green lines — timed drills until muscle memory. ${dayPageSummary(plan)} ${DAY5_V3_KELLY_MINIMUM_SUMMARY}`}
        />
        <p className="mb-4 rounded-lg border border-violet-300/60 bg-violet-50/40 px-3 py-2 text-xs text-violet-950">
          {DAY5_APA_STATEWIDE_BROADCAST_FRAME}
        </p>
        <ElectionPlanDay5PathwayPanel showFullList showDay4Review showDay6Teaser />
      </>
    );
  }

  if (streamlinedDay8 || crashCourseDay8) {
    return (
      <>
        <KellyPageSummary
          summary={`One morning, one path — compact the whole week into debate order. ${dayPageSummary(plan)} ${DAY8_V3_KELLY_MINIMUM_SUMMARY}`}
        />
        <p className="mb-4 rounded-lg border border-emerald-300/60 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-950">
          {DAY8_SOS_THREE_DOMAINS_FRAME}
        </p>
        <p className="mb-4 rounded-lg border border-emerald-300/60 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-950">
          {DAY8_ARKANSAS_PEOPLE_FRAME}
        </p>
        <ElectionPlanDay8PathwayPanel showFullList showDay7Review />
      </>
    );
  }

  if (dayId === DAY8_ID) {
    return (
      <>
        <KellyPageSummary summary={`${plan.goalForKelly} ${DAY8_V3_KELLY_MINIMUM_SUMMARY}`} />
        <ElectionPlanDay8PathwayPanel showFullList showDay7Review />
      </>
    );
  }

  if (streamlinedDay7) {
    return (
      <>
        <KellyPageSummary
          summary={`Polish bookends and lock one quotable line — ${dayPageSummary(plan)} ${DAY7_V3_KELLY_MINIMUM_SUMMARY}`}
        />
        <p className="mb-4 rounded-lg border border-rose-300/60 bg-rose-50/40 px-3 py-2 text-xs text-rose-950">
          {DAY7_PEAK_END_FRAME}
        </p>
        <ElectionPlanDay7PathwayPanel showFullList showDay6Review showDay8Teaser />
      </>
    );
  }

  if (dayId === DAY7_ID) {
    return (
      <>
        <KellyPageSummary summary={`${plan.goalForKelly} ${DAY7_HUB_TONIGHT_SUMMARY}`} />
        <ElectionPlanDay7PathwayPanel showFullList showDay6Review showDay8Teaser />
      </>
    );
  }

  if (streamlinedDay6) {
    return (
      <>
        <KellyPageSummary
          summary={`Run the dress rehearsal under fatigue — ${dayPageSummary(plan)} ${DAY6_V3_KELLY_MINIMUM_SUMMARY}`}
        />
        <p className="mb-4 rounded-lg border border-violet-300/60 bg-violet-50/40 px-3 py-2 text-xs text-violet-950">
          {DAY6_APA_SIM_FRAME}
        </p>
        <ElectionPlanDay6PathwayPanel showFullList showDay5Review showDay7Teaser />
      </>
    );
  }

  if (dayId === DAY6_ID) {
    return (
      <>
        <KellyPageSummary summary={`${plan.goalForKelly} Fail in the room with staff — simulation integrates Days 2–5 under fatigue.`} />
        <ElectionPlanDay6PathwayPanel showFullList showDay5Review showDay7Teaser />
      </>
    );
  }

  if (dayId === DAY5_ID) {
    return (
      <>
        <KellyPageSummary
          summary={`${plan.goalForKelly} Pre-load when-X-say-Y pairs from Day 4 green lines — timed drills until muscle memory.`}
        />
        <ElectionPlanDay5PathwayPanel showFullList showDay4Review showDay6Teaser />
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
    dayId === DAY8_ID
      ? "Minimum path is enough if tired — full run-through rolls to car rehearsal. No new research after lock sheet."
      : dayId === DAY7_ID
      ? "Bookends polish block only is enough for tonight — claims scan and psych refresh roll to debate-eve AM if tired."
      : dayId === DAY6_ID
      ? "Full simulation block only is enough for tonight — bios lock-in and debrief roll to Wednesday AM if tired."
      : dayId === DAY5_ID
      ? "Capitalize sheet only is enough for tonight — eight timed pairs from Day 4 green lines. Trap sprint and SOS timer roll to Tuesday AM if tired."
      : dayId === DAY4_ID
        ? "Forum lab only is enough for tonight — skip SOS and bios re-read if tired. Kelly's notecard gets claims-gated lines only."
        : dayId === DAY3_ID
          ? "Follow the steps in order — skip optional Hammer example if tired. Manual + claims gate is enough for tonight."
          : dayId === DAY2_ID
            ? "Follow the steps in order — skip optional examples if you are tired. Film + trap lane 1 is enough for tonight."
            : "Follow the steps in order — skip optional sections if you are tired. Posture + author/administrator is enough for tonight.";

  return (
    <footer className="mt-10 space-y-4 border-t border-[var(--ep-border)] pt-8">
      {dayId === DAY8_ID ? (
        <ElectionPlanDay8PathwayProgressBar activeStepId={currentStepId} compact />
      ) : null}
      {dayId === DAY1_ID ? (
        <ElectionPlanDay1ContinueButton currentStepId={currentStepId} />
      ) : dayId === DAY2_ID ? (
        <ElectionPlanDay2ContinueButton currentStepId={currentStepId} />
      ) : dayId === DAY4_ID ? (
        <ElectionPlanDay4ContinueButton currentStepId={currentStepId} />
      ) : dayId === DAY5_ID ? (
        <ElectionPlanDay5ContinueButton currentStepId={currentStepId} />
      ) : dayId === DAY6_ID ? (
        <ElectionPlanDay6ContinueButton currentStepId={currentStepId} />
      ) : dayId === DAY7_ID ? (
        <ElectionPlanDay7ContinueButton currentStepId={currentStepId} />
      ) : dayId === DAY8_ID ? (
        <ElectionPlanDay8ContinueButton currentStepId={currentStepId} />
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
