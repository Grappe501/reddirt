import { notFound } from "next/navigation";

import { ElectionPlanBlockStudyPanel } from "@/components/election-plan/ElectionPlanBlockStudyPanel";
import { ElectionPlanFilmTellWorksheetPanel } from "@/components/election-plan/ElectionPlanFilmTellWorksheetPanel";
import { ElectionPlanDayStepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDay1BlockStudy } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import { getDay2BlockStudy } from "@/lib/election-plan/debatePrepDay2BlockStudy";
import { staticParamsForDayBlocks } from "@/lib/election-plan/debatePrepDayStaticParams";
import { getDay1PathwayStep } from "@/lib/election-plan/day1-learning-pathway";
import { getDay2PathwayStep } from "@/lib/election-plan/day2-learning-pathway";
import { getDayBlockDrillDown, DAY1_ID, DAY2_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
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
    dayId === DAY1_ID ? getDay1BlockStudy(blockId) : dayId === DAY2_ID ? getDay2BlockStudy(blockId) : undefined;
  const title = study?.studyGuideTitle ?? block.title;
  const eyebrow = study ? `Step · ~${block.minutes} min` : `Study block · ~${block.minutes} min`;
  const pathwayStep =
    dayId === DAY1_ID ? getDay1PathwayStep(blockId) : dayId === DAY2_ID ? getDay2PathwayStep(blockId) : undefined;
  const dayLabel = dayId === DAY1_ID ? "Day 1" : dayId === DAY2_ID ? "Day 2" : "Day";

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow={pathwayStep ? `${dayLabel} · ${eyebrow}` : eyebrow}
      title={title}
      description={study?.overview ?? block.why}
      pageSummary={study?.professorLead ?? study?.overview}
    >
      {dayId === DAY2_ID && blockId === "b2-film" ? <ElectionPlanFilmTellWorksheetPanel /> : null}

      {study ? (
        <ElectionPlanBlockStudyPanel study={study} dayId={dayId} blockId={blockId} />
      ) : (
        <>
          <ElectionPlanDrillDownSections sections={block.sections} />
          <ElectionPlanDrillDownSteps title="Practice steps — in order" steps={block.practiceSteps} />
          <ElectionPlanDrillDownRelated links={block.relatedLinks} />
        </>
      )}

      {dayId === DAY1_ID || dayId === DAY2_ID ? (
        <ElectionPlanDayStepFooter dayId={dayId as typeof DAY1_ID | typeof DAY2_ID} currentStepId={blockId} />
      ) : null}
    </ElectionPlanDrillDownShell>
  );
}
