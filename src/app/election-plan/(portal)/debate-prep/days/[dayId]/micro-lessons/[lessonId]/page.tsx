import { notFound } from "next/navigation";

import { ElectionPlanDay1SupplementFooter } from "@/components/election-plan/ElectionPlanDay1SupplementFooter";
import { ElectionPlanDay2SupplementFooter } from "@/components/election-plan/ElectionPlanDay2SupplementFooter";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { getDay1MicroLessonAnchor } from "@/lib/election-plan/day1-supplement-anchors";
import { getDay2MicroLessonAnchor } from "@/lib/election-plan/day2-supplement-anchors";
import { DAY1_ID, DAY2_ID, getDayMicroLessonDrillDown } from "@/lib/election-plan/debatePrepDayDrillDown";
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

  const day1Anchor = dayId === DAY1_ID ? getDay1MicroLessonAnchor(lessonId) : undefined;
  const day2Anchor = dayId === DAY2_ID ? getDay2MicroLessonAnchor(lessonId) : undefined;
  const dayLabel = dayId === DAY2_ID ? "Day 2" : "Day 1";

  const audiences =
    dayId === DAY2_ID && lessonId === "d2-three-way"
      ? resolveAudiencesForHooks(["three-way", "county-champion"])
      : dayId === DAY2_ID
        ? resolveAudiencesForHooks(["county-champion", "integrity"])
        : dayId === DAY1_ID
          ? resolveAudiencesForHooks(["lane-2", "county-champion"])
          : [];

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow={`${dayLabel} · Micro-lesson · ~${lesson.readMinutes} min`}
      title={lesson.title}
    >
      {audiences.length > 0 ? (
        <VoterAudienceSpeakToBanner profiles={audiences} compact label="Who this lesson is for" />
      ) : null}

      <article className="ep-card p-5 text-sm">
        <p className="whitespace-pre-wrap leading-relaxed text-[var(--ep-navy-muted)]">{lesson.body}</p>
      </article>
      <ElectionPlanDrillDownSteps title="Practice steps" steps={lesson.practiceSteps} />
      <ElectionPlanDrillDownRelated links={lesson.relatedLinks} />
      {day1Anchor ? <ElectionPlanDay1SupplementFooter anchor={day1Anchor} /> : null}
      {day2Anchor ? <ElectionPlanDay2SupplementFooter anchor={day2Anchor} /> : null}
    </ElectionPlanDrillDownShell>
  );
}
