import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownSections,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDayConcept } from "@/lib/election-plan/debatePrepDayDrillDown";
import { staticParamsForDayConcepts } from "@/lib/election-plan/debatePrepDayStaticParams";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
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

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day page"
      eyebrow={`Command course · ${concept.label}`}
      title={concept.label}
      description={concept.summary}
    >
      <ElectionPlanDrillDownSections sections={concept.sections} />
      <ElectionPlanDrillDownSteps title="Practice steps" steps={concept.practiceSteps} />
      <ElectionPlanDrillDownRelated links={concept.relatedLinks} />
    </ElectionPlanDrillDownShell>
  );
}
