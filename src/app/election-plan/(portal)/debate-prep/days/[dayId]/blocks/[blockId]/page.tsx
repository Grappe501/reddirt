import { notFound } from "next/navigation";

import { ElectionPlanBlockStudyPanel } from "@/components/election-plan/ElectionPlanBlockStudyPanel";
import { ElectionPlanDay1StepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDay1BlockStudy } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import { getDay1PathwayStep } from "@/lib/election-plan/day1-learning-pathway";
import { getDayBlockDrillDown, listDayBlocksDrillDown, DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listDayBlocksDrillDown(DAY1_ID).map((b) => ({ dayId: DAY1_ID, blockId: b.blockId }));
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

  const study = dayId === DAY1_ID ? getDay1BlockStudy(blockId) : undefined;
  const title = study?.studyGuideTitle ?? block.title;
  const eyebrow = study ? `Step · ~${block.minutes} min` : `Study block · ~${block.minutes} min`;
  const pathwayStep = dayId === DAY1_ID ? getDay1PathwayStep(blockId) : undefined;

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day 1 pathway"
      eyebrow={pathwayStep ? `Day 1 · ${eyebrow}` : eyebrow}
      title={title}
      description={study?.overview ?? block.why}
      pageSummary={study?.professorLead ?? study?.overview}
    >
      {study ? (
        <ElectionPlanBlockStudyPanel study={study} />
      ) : (
        <>
          <ElectionPlanDrillDownSections sections={block.sections} />
          <ElectionPlanDrillDownSteps title="Practice steps — in order" steps={block.practiceSteps} />
          <ElectionPlanDrillDownRelated links={block.relatedLinks} />
        </>
      )}

      {dayId === DAY1_ID ? <ElectionPlanDay1StepFooter currentStepId={blockId} /> : null}
    </ElectionPlanDrillDownShell>
  );
}
