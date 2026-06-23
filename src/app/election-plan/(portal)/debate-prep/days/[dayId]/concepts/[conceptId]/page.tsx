import { notFound } from "next/navigation";

import { ElectionPlanDay1SupplementFooter } from "@/components/election-plan/ElectionPlanDay1SupplementFooter";
import { ElectionPlanDay2SupplementFooter } from "@/components/election-plan/ElectionPlanDay2SupplementFooter";
import { ElectionPlanDay3SupplementFooter } from "@/components/election-plan/ElectionPlanDay3SupplementFooter";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { getDay1ConceptAnchor } from "@/lib/election-plan/day1-supplement-anchors";
import { getDay2ConceptAnchor } from "@/lib/election-plan/day2-supplement-anchors";
import { getDay3ConceptAnchor } from "@/lib/election-plan/day3-supplement-anchors";
import { ElectionPlanDay4SupplementFooter } from "@/components/election-plan/ElectionPlanDay4SupplementFooter";
import { ElectionPlanDay5SupplementFooter } from "@/components/election-plan/ElectionPlanDay5SupplementFooter";
import { ElectionPlanDay6SupplementFooter } from "@/components/election-plan/ElectionPlanDay6SupplementFooter";
import { ElectionPlanDayStepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import { getDay4ConceptAnchor } from "@/lib/election-plan/day4-supplement-anchors";
import { getDay5ConceptAnchor } from "@/lib/election-plan/day5-supplement-anchors";
import { getDay6ConceptAnchor } from "@/lib/election-plan/day6-supplement-anchors";
import { DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, DAY5_ID, DAY6_ID, DAY7_ID, getDayConcept, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import { staticParamsForDayConcepts } from "@/lib/election-plan/debatePrepDayStaticParams";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { resolveAudiencesForHooks } from "@/lib/election-plan/voter-audience-models/resolve-audiences";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticParamsForDayConcepts();
}

export default async function ElectionPlanDayConceptPage({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}) {
  const { dayId, conceptId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();
  const concept = getDayConcept(dayId as IntensiveDayId, conceptId);
  if (!concept) notFound();

  const day1Anchor = dayId === DAY1_ID ? getDay1ConceptAnchor(conceptId) : undefined;
  const day2Anchor = dayId === DAY2_ID ? getDay2ConceptAnchor(conceptId) : undefined;
  const day3Anchor = dayId === DAY3_ID ? getDay3ConceptAnchor(conceptId) : undefined;
  const day4Anchor = dayId === DAY4_ID ? getDay4ConceptAnchor(conceptId) : undefined;
  const day5Anchor = dayId === DAY5_ID ? getDay5ConceptAnchor(conceptId) : undefined;
  const day6Anchor = dayId === DAY6_ID ? getDay6ConceptAnchor(conceptId) : undefined;
  const dayLabel =
    dayId === DAY7_ID
      ? "Day 7"
      : dayId === DAY6_ID
      ? "Day 6"
      : dayId === DAY5_ID
      ? "Day 5"
      : dayId === DAY4_ID
        ? "Day 4"
        : dayId === DAY3_ID
          ? "Day 3"
          : dayId === DAY2_ID
            ? "Day 2"
            : dayId === DAY1_ID
              ? "Day 1"
              : "Day";

  const audiences =
    dayId === DAY7_ID
      ? resolveAudiencesForHooks(["integrity", "county-champion", "author-vs-administrator"])
      : dayId === DAY6_ID
      ? resolveAudiencesForHooks(["integrity", "county-champion", "author-vs-administrator"])
      : dayId === DAY5_ID
      ? resolveAudiencesForHooks(["integrity", "county-champion", "author-vs-administrator"])
      : dayId === DAY4_ID
      ? resolveAudiencesForHooks(["integrity", "county-champion"])
      : dayId === DAY3_ID
      ? resolveAudiencesForHooks(["county-champion", "author-vs-administrator", "lane-2"])
      : dayId === DAY2_ID && conceptId === "three-way-geometry"
        ? resolveAudiencesForHooks(["three-way", "county-champion"])
        : dayId === DAY2_ID
          ? resolveAudiencesForHooks(["county-champion", "integrity"])
          : dayId === DAY1_ID
            ? resolveAudiencesForHooks(["lane-2", "county-champion", "author-vs-administrator"])
            : [];

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow={`${dayLabel} · Command course · ${concept.label}`}
      title={concept.label}
      description={concept.summary}
    >
      {audiences.length > 0 ? (
        <VoterAudienceSpeakToBanner profiles={audiences} compact label="Picture in the room" />
      ) : null}

      <ElectionPlanDrillDownSections sections={concept.sections} />
      <ElectionPlanDrillDownSteps title="Practice steps" steps={concept.practiceSteps} />
      <ElectionPlanDrillDownRelated links={concept.relatedLinks} />
      {day6Anchor ? (
        <ElectionPlanDay6SupplementFooter anchor={day6Anchor} />
      ) : day5Anchor ? (
        <ElectionPlanDay5SupplementFooter anchor={day5Anchor} />
      ) : day4Anchor ? (
        <ElectionPlanDay4SupplementFooter anchor={day4Anchor} />
      ) : dayId === DAY4_ID || dayId === DAY5_ID || dayId === DAY6_ID || dayId === DAY7_ID ? (
        <ElectionPlanDayStepFooter dayId={dayId as DrillDownDayId} currentStepId={conceptId} />
      ) : null}
      {day1Anchor ? <ElectionPlanDay1SupplementFooter anchor={day1Anchor} /> : null}
      {day2Anchor ? <ElectionPlanDay2SupplementFooter anchor={day2Anchor} /> : null}
      {day3Anchor ? <ElectionPlanDay3SupplementFooter anchor={day3Anchor} /> : null}
    </ElectionPlanDrillDownShell>
  );
}
