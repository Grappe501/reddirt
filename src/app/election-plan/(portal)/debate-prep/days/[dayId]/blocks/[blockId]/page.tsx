import { notFound } from "next/navigation";

import { ElectionPlanBlockStudyPanel } from "@/components/election-plan/ElectionPlanBlockStudyPanel";
import { ElectionPlanClaimsSuperiorityChecklist } from "@/components/election-plan/ElectionPlanClaimsSuperiorityChecklist";
import {
  ElectionPlanFundingResearchFramePanel,
  ElectionPlanHammerEnrolledContrastPanel,
} from "@/components/election-plan/ElectionPlanDay3BlockPanels";
import { ElectionPlanDay3SuperiorityClipPanel } from "@/components/election-plan/ElectionPlanDay3SuperiorityClipPanel";
import { ElectionPlanDay2FilmClipPanel } from "@/components/election-plan/ElectionPlanDay2FilmClipPanel";
import { ElectionPlanFilmTellWorksheetPanel } from "@/components/election-plan/ElectionPlanFilmTellWorksheetPanel";
import { ElectionPlanQualificationStackPanel } from "@/components/election-plan/ElectionPlanQualificationStackPanel";
import { ElectionPlanDayStepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import { ElectionPlanDay4BlockEmbed } from "@/components/election-plan/ElectionPlanDay4ForumPanels";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDay1BlockStudy } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import { getDay2BlockStudy } from "@/lib/election-plan/debatePrepDay2BlockStudy";
import { getDay3BlockStudy } from "@/lib/election-plan/debatePrepDay3BlockStudy";
import { getDay4BlockStudy } from "@/lib/election-plan/debatePrepDay4BlockStudy";
import { staticParamsForDayBlocks } from "@/lib/election-plan/debatePrepDayStaticParams";
import { getDay1PathwayStep } from "@/lib/election-plan/day1-learning-pathway";
import { getDay2PathwayStep } from "@/lib/election-plan/day2-learning-pathway";
import { getDay3PathwayStep } from "@/lib/election-plan/day3-learning-pathway";
import { getDay4PathwayStep } from "@/lib/election-plan/day4-learning-pathway";
import { getDayBlockDrillDown, DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import { buildElectionPlanClaimsSuperioritySummary } from "@/lib/election-plan/debate-prep-claims-superiority-summary";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticParamsForDayBlocks();
}

export default async function ElectionPlanDayBlockPage({
  params,
}: {
  params: Promise<{ dayId: string; blockId: string }>;
}) {
  const { dayId, blockId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();
  const block = getDayBlockDrillDown(dayId as IntensiveDayId, blockId);
  if (!block) notFound();

  const study =
    dayId === DAY1_ID
      ? getDay1BlockStudy(blockId)
      : dayId === DAY2_ID
        ? getDay2BlockStudy(blockId)
        : dayId === DAY3_ID
          ? getDay3BlockStudy(blockId)
          : dayId === DAY4_ID
            ? getDay4BlockStudy(blockId)
            : undefined;
  const title = study?.studyGuideTitle ?? block.title;
  const eyebrow = study ? `Step · ~${block.minutes} min` : `Study block · ~${block.minutes} min`;
  const pathwayStep =
    dayId === DAY1_ID
      ? getDay1PathwayStep(blockId)
      : dayId === DAY2_ID
        ? getDay2PathwayStep(blockId)
        : dayId === DAY3_ID
          ? getDay3PathwayStep(blockId)
          : dayId === DAY4_ID
            ? getDay4PathwayStep(blockId)
            : undefined;
  const dayLabel =
    dayId === DAY1_ID ? "Day 1" : dayId === DAY2_ID ? "Day 2" : dayId === DAY3_ID ? "Day 3" : dayId === DAY4_ID ? "Day 4" : "Day";
  const claimsSuperioritySummary =
    dayId === DAY3_ID && blockId === "b3-claims" ? buildElectionPlanClaimsSuperioritySummary() : null;

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow={pathwayStep ? `${dayLabel} · ${eyebrow}` : eyebrow}
      title={title}
      description={study?.overview ?? block.why}
      pageSummary={study?.professorLead ?? study?.overview}
    >
      {dayId === DAY2_ID && blockId === "b2-film" ? (
        <>
          <ElectionPlanDay2FilmClipPanel />
          <div className="mt-6">
            <ElectionPlanFilmTellWorksheetPanel />
          </div>
        </>
      ) : null}
      {dayId === DAY3_ID && blockId === "b3-manual" ? (
        <>
          <ElectionPlanDay3SuperiorityClipPanel variant="manual" />
          <div className="mt-6">
            <ElectionPlanQualificationStackPanel />
          </div>
        </>
      ) : null}
      {dayId === DAY3_ID && blockId === "b3-opposition" ? (
        <div className="mb-6">
          <ElectionPlanDay3SuperiorityClipPanel variant="opposition" />
          <div className="mt-6">
            <ElectionPlanHammerEnrolledContrastPanel />
          </div>
        </div>
      ) : null}
      {dayId === DAY3_ID && blockId === "b3-funding" ? (
        <div className="mb-6">
          <ElectionPlanFundingResearchFramePanel />
        </div>
      ) : null}
      {claimsSuperioritySummary ? (
        <ElectionPlanClaimsSuperiorityChecklist summary={claimsSuperioritySummary} />
      ) : null}

      {dayId === DAY4_ID ? <ElectionPlanDay4BlockEmbed blockId={blockId} /> : null}

      {study ? (
        <ElectionPlanBlockStudyPanel study={study} dayId={dayId} blockId={blockId} />
      ) : (
        <>
          <ElectionPlanDrillDownSections sections={block.sections} />
          <ElectionPlanDrillDownSteps title="Practice steps — in order" steps={block.practiceSteps} />
          <ElectionPlanDrillDownRelated links={block.relatedLinks} />
        </>
      )}

      {dayId === DAY1_ID || dayId === DAY2_ID || dayId === DAY3_ID || dayId === DAY4_ID ? (
        <ElectionPlanDayStepFooter dayId={dayId as DrillDownDayId} currentStepId={blockId} />
      ) : null}
    </ElectionPlanDrillDownShell>
  );
}
