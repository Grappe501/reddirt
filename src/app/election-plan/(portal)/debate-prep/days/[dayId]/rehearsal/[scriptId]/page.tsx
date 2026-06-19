import { notFound } from "next/navigation";

import {
  ElectionPlanDrillDownRelated,
  ElectionPlanDrillDownShell,
  ElectionPlanDrillDownSteps,
} from "@/components/election-plan/ElectionPlanDrillDownShell";
import { getDayRehearsalScript, listDayRehearsalScripts, DAY1_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { epDebatePrepDayHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listDayRehearsalScripts(DAY1_ID).map((s) => ({ dayId: DAY1_ID, scriptId: s.id }));
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
      backLabel="Day page"
      eyebrow={`Rehearse out loud · ${script.durationLabel}`}
      title={script.label}
    >
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
    </ElectionPlanDrillDownShell>
  );
}
