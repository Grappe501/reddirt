import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
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

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day page"
      eyebrow={`Study block · ~${block.minutes} min`}
      title={block.title}
      description={block.why}
    >
      <ElectionPlanDrillDownSections sections={block.sections} />
      <ElectionPlanDrillDownSteps title="Practice steps — in order" steps={block.practiceSteps} />
      <ElectionPlanDrillDownRelated links={block.relatedLinks} />
    </ElectionPlanDrillDownShell>
  );
}
