import { notFound } from "next/navigation";

import { ElectionPlanDay1StepFooter } from "@/components/election-plan/ElectionPlanDayDrillDownOverview";
import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { VoterAudienceSpeakToBanner } from "@/components/election-plan/voter-audience/VoterAudienceSpeakToBanner";
import { getDayRehearsalScript, DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { staticParamsForDayRehearsals } from "@/lib/election-plan/debatePrepDayStaticParams";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { resolveAudiencesForHooks } from "@/lib/election-plan/voter-audience-models/resolve-audiences";
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

  return (
    <ElectionPlanDrillDownShell
      backHref={epDebatePrepDayHref(dayId)}
      backLabel="Day 1 pathway"
      eyebrow={`Say aloud · ${script.durationLabel}`}
      title={script.label}
    >
      <VoterAudienceSpeakToBanner
        profiles={resolveAudiencesForHooks(["county-champion", "author-vs-administrator"])}
        compact
      />
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
      {dayId === DAY1_ID ? <ElectionPlanDay1StepFooter currentStepId={scriptId} /> : null}
    </ElectionPlanDrillDownShell>
  );
}
