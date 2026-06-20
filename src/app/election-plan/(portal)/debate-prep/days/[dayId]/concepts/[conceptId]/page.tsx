import { notFound } from "next/navigation";

import { ElectionPlanDay2SupplementFooter } from "@/components/election-plan/ElectionPlanDay2SupplementFooter";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { getDay2ConceptAnchor } from "@/lib/election-plan/day2-supplement-anchors";
import { DAY2_ID, getDayConcept } from "@/lib/election-plan/debatePrepDayDrillDown";
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

  const day2Anchor = dayId === DAY2_ID ? getDay2ConceptAnchor(conceptId) : undefined;
  const day2Audiences =
    dayId === DAY2_ID && conceptId === "three-way-geometry"
      ? resolveAudiencesForHooks(["three-way", "county-champion"])
      : dayId === DAY2_ID
        ? resolveAudiencesForHooks(["county-champion", "integrity"])
        : [];

  const dayLabel = dayId === DAY2_ID ? "Day 2" : "Day 1";

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow={`${dayLabel} · Command course · ${concept.label}`}
      title={concept.label}
      description={concept.summary}
    >
      {day2Audiences.length > 0 ? (
        <VoterAudienceSpeakToBanner profiles={day2Audiences} compact label="Picture in the room" />
      ) : null}

      <ElectionPlanDrillDownSections sections={concept.sections} />
      <ElectionPlanDrillDownSteps title="Practice steps" steps={concept.practiceSteps} />
      <ElectionPlanDrillDownRelated links={concept.relatedLinks} />
      {day2Anchor ? <ElectionPlanDay2SupplementFooter anchor={day2Anchor} /> : null}
    </ElectionPlanDrillDownShell>
  );
}
