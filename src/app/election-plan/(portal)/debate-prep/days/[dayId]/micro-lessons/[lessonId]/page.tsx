import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import {
  getDayMicroLessonDrillDown,
} from "@/lib/election-plan/debatePrepDayDrillDown";
import { staticParamsForDayMicroLessons } from "@/lib/election-plan/debatePrepDayStaticParams";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticParamsForDayMicroLessons();
}

export default async function ElectionPlanDayMicroLessonPage({
  params,
}: {
  params: Promise<{ dayId: string; lessonId: string }>;
}) {
  const { dayId, lessonId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();
  const lesson = getDayMicroLessonDrillDown(dayId as IntensiveDayId, lessonId);
  if (!lesson) notFound();

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day page"
      eyebrow={`Micro-lesson · ~${lesson.readMinutes} min`}
      title={lesson.title}
    >
      <article className="ep-card p-5 text-sm">
        <p className="whitespace-pre-wrap leading-relaxed text-[var(--ep-navy-muted)]">{lesson.body}</p>
      </article>
      <ElectionPlanDrillDownSteps title="Practice steps" steps={lesson.practiceSteps} />
      <ElectionPlanDrillDownRelated links={lesson.relatedLinks} />
    </ElectionPlanDrillDownShell>
  );
}
