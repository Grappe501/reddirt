import { notFound } from "next/navigation";

import { ElectionPlanBlockStudyPanel } from "@/components/election-plan/ElectionPlanBlockStudyPanel";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDay1BlockStudy } from "@/lib/election-plan/debatePrepDay1BlockStudy";
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
  const eyebrow = study ? `Study guide · ~${block.minutes} min` : `Study block · ~${block.minutes} min`;

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day 1 command foundation"
      eyebrow={eyebrow}
      title={title}
      description={study?.overview ?? block.why}
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
    </ElectionPlanDrillDownShell>
  );
}
