import { notFound } from "next/navigation";

import { ElectionPlanDay2SupplementFooter } from "@/components/election-plan/ElectionPlanDay2SupplementFooter";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { getDay2MicroLessonAnchor } from "@/lib/election-plan/day2-supplement-anchors";
import { DAY2_ID, getDayMicroLessonDrillDown } from "@/lib/election-plan/debatePrepDayDrillDown";
import { staticParamsForDayMicroLessons } from "@/lib/election-plan/debatePrepDayStaticParams";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { resolveAudiencesForHooks } from "@/lib/election-plan/voter-audience-models/resolve-audiences";
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

  const day2Anchor = dayId === DAY2_ID ? getDay2MicroLessonAnchor(lessonId) : undefined;
  const day2Audiences =
    dayId === DAY2_ID && lessonId === "d2-three-way"
      ? resolveAudiencesForHooks(["three-way", "county-champion"])
      : dayId === DAY2_ID
        ? resolveAudiencesForHooks(["county-champion", "integrity"])
        : [];

  const dayLabel = dayId === DAY2_ID ? "Day 2" : "Day 1";

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow={`${dayLabel} · Micro-lesson · ~${lesson.readMinutes} min`}
      title={lesson.title}
    >
      {day2Audiences.length > 0 ? (
        <VoterAudienceSpeakToBanner profiles={day2Audiences} compact label="Who this lesson is for" />
      ) : null}

      <article className="ep-card p-5 text-sm">
        <p className="whitespace-pre-wrap leading-relaxed text-[var(--ep-navy-muted)]">{lesson.body}</p>
      </article>
      <ElectionPlanDrillDownSteps title="Practice steps" steps={lesson.practiceSteps} />
      <ElectionPlanDrillDownRelated links={lesson.relatedLinks} />
      {day2Anchor ? <ElectionPlanDay2SupplementFooter anchor={day2Anchor} /> : null}
    </ElectionPlanDrillDownShell>
  );
}
