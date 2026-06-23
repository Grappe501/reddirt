import { notFound } from "next/navigation";

import { ElectionPlanDayStepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import { ElectionPlanForumPredictedLinePicker } from "@/components/election-plan/ElectionPlanForumPredictedLinePicker";
import { ElectionPlanDay4PathwayReturnLink, ElectionPlanDay4HandoffBanner } from "@/components/election-plan/ElectionPlanDay4ForumPanels";
import { ElectionPlanDay5RehearsalEmbed } from "@/components/election-plan/ElectionPlanDay5Panels";
import { ElectionPlanDay6RehearsalEmbed } from "@/components/election-plan/ElectionPlanDay6Panels";
import { ElectionPlanDay7RehearsalEmbed } from "@/components/election-plan/ElectionPlanDay7Panels";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { getDayRehearsalScript, DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, DAY5_ID, DAY6_ID, DAY7_ID, DAY8_ID, type DrillDownDayId } from "@/lib/election-plan/debatePrepDayDrillDown";
import { staticParamsForDayRehearsals } from "@/lib/election-plan/debatePrepDayStaticParams";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { resolveAudiencesForHooks } from "@/lib/election-plan/voter-audience-models/resolve-audiences";
import { buildDay4ForumPipelineSurface } from "@/lib/election-plan/load-day4-forum-pipeline-surface";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticParamsForDayRehearsals();
}

export default async function ElectionPlanDayRehearsalPage({
  params,
}: {
  params: Promise<{ dayId: string; scriptId: string }>;
}) {
  const { dayId, scriptId } = await params;
  if (!DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(dayId as IntensiveDayId)) notFound();
  const script = getDayRehearsalScript(dayId as IntensiveDayId, scriptId);
  if (!script) notFound();

  const dayLabel =
    dayId === DAY1_ID
      ? "Day 1"
      : dayId === DAY2_ID
        ? "Day 2"
        : dayId === DAY3_ID
          ? "Day 3"
          : dayId === DAY4_ID
            ? "Day 4"
            : dayId === DAY5_ID
              ? "Day 5"
              : dayId === DAY6_ID
                ? "Day 6"
              : dayId === DAY7_ID
                ? "Day 7"
              : dayId === DAY8_ID
                ? "Day 8"
              : "Day";
  const audienceHooks =
    dayId === DAY4_ID
      ? (["integrity", "county-champion", "author-vs-administrator"] as const)
      : dayId === DAY3_ID
      ? (["county-champion", "author-vs-administrator", "integrity"] as const)
      : dayId === DAY2_ID
        ? (["county-champion", "integrity", "three-way"] as const)
        : (["county-champion", "author-vs-administrator"] as const);

  const forumSurface = dayId === DAY4_ID ? buildDay4ForumPipelineSurface() : null;

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel={`${dayLabel} pathway`}
      eyebrow={`Say aloud · ${script.durationLabel}`}
      title={script.label}
    >
      <VoterAudienceSpeakToBanner profiles={resolveAudiencesForHooks([...audienceHooks])} compact />
      {dayId === DAY4_ID ? (
        <>
          <ElectionPlanDay4PathwayReturnLink />
          <ElectionPlanForumPredictedLinePicker lines={forumSurface!.verifiedHammerLines} scriptId={scriptId} />
        </>
      ) : null}
      {dayId === DAY5_ID ? <ElectionPlanDay5RehearsalEmbed /> : null}
      {dayId === DAY6_ID && scriptId === "rehearse-open-close-sim" ? <ElectionPlanDay6RehearsalEmbed /> : null}
      {dayId === DAY7_ID ? <ElectionPlanDay7RehearsalEmbed scriptId={scriptId} /> : null}
      <article className="ep-card border-2 border-emerald-300/50 bg-emerald-50/40 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-emerald-900">Script</p>
        <p className="mt-3 leading-relaxed text-[var(--ep-navy)]">{script.script}</p>
      </article>
      <article className="ep-card mt-6 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Presence notes</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {script.presenceNotes.map((n) => (
            <li key={n.slice(0, 48)}>{n}</li>
          ))}
        </ul>
      </article>
      <article className="ep-card mt-6 p-5 text-sm">
        <h2 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Success check</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {script.successCheck.map((n) => (
            <li key={n.slice(0, 48)}>{n}</li>
          ))}
        </ul>
      </article>
      <ElectionPlanDrillDownRelated links={script.relatedLinks} />
      {dayId === DAY4_ID ? <ElectionPlanDay4HandoffBanner /> : null}
      {dayId === DAY1_ID || dayId === DAY2_ID || dayId === DAY3_ID || dayId === DAY4_ID || dayId === DAY5_ID || dayId === DAY6_ID || dayId === DAY7_ID || dayId === DAY8_ID ? (
        <ElectionPlanDayStepFooter dayId={dayId as DrillDownDayId} currentStepId={scriptId} />
      ) : null}
    </ElectionPlanDrillDownShell>
  );
}
