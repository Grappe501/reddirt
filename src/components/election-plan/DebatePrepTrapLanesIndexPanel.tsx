import Link from "next/link";

import { DebatePrepOperatorGuideCard } from "@/components/election-plan/DebatePrepOperatorGuideCard";
import {
  FIRST_DEBATE_MISTAKES,
  TRAP_LANE_SELECTION_GUIDE,
  TRAP_LANE_TECHNIQUE_STEPS,
} from "@/lib/election-plan/debate-prep-operator-guide";
import {
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { loadForumTranscriptIntel } from "@/lib/intelligence/v4/forumTranscriptIntel";
import { TRAP_LANE_FIRST_TIMER_NOTE, listTrapLaneSummaries } from "@/lib/intelligence/v4/trapLaneDrillDowns";

export function DebatePrepTrapLanesIndexPanel() {
  const guide = getSurfaceGuide("trap-lanes-index");
  const lanes = listTrapLaneSummaries();
  const forumIntel = loadForumTranscriptIntel();

  return (
    <section className="space-y-6">
      {forumIntel.hammerThemes.length ? (
        <article className="ep-card border-2 border-rose-200 bg-rose-50/40 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-rose-900">Hammer tells · from ACCA forum transcript</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {forumIntel.hammerThemes.map((t) => (
              <li key={t.slice(0, 48)}>{t}</li>
            ))}
          </ul>
          {forumIntel.watchForTells.length ? (
            <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
              <span className="font-bold text-violet-900">Watch:</span> {forumIntel.watchForTells.slice(0, 3).join(" · ")}
            </p>
          ) : null}
        </article>
      ) : null}
      <p className="text-sm text-[var(--ep-navy-muted)]">
        Position Hammer into your hand: setup questions, bait psychology, rebuttal scripts, and 45-second pivots.
        Verify act numbers in opposition research before any public line.
      </p>

      <article className="ep-card border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-950">
        {TRAP_LANE_FIRST_TIMER_NOTE}
      </article>

      {guide ? <DebatePrepOperatorGuideCard title="Trap lanes operator guide" guide={guide} /> : null}

      <article className="ep-card p-5">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Five-step trap workflow</h2>
        <ol className="mt-4 space-y-3 text-sm">
          {TRAP_LANE_TECHNIQUE_STEPS.map((item) => (
            <li key={item.step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-800 text-xs font-bold text-white">
                {item.step}
              </span>
              <div>
                <p className="font-semibold text-[var(--ep-navy)]">{item.title}</p>
                <p className="text-[var(--ep-navy-muted)]">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>

      <article className="ep-card p-5">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Which lane tonight?</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {TRAP_LANE_SELECTION_GUIDE.map((row) => (
            <li key={row.laneId}>
              <p className="font-semibold text-[var(--ep-navy)]">{row.when}</p>
              <Link href={epTrapLaneHref(row.laneId)} className="text-xs font-bold text-violet-800 underline">
                {row.laneId.replace(/-/g, " ")} →
              </Link>
              <p className="mt-1 text-[var(--ep-navy-muted)]">{row.note}</p>
            </li>
          ))}
        </ul>
      </article>

      <article className="ep-card border border-rose-200 bg-rose-50/40 p-4 text-sm text-rose-950">
        <p className="text-xs font-bold uppercase">Avoid on stage</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {FIRST_DEBATE_MISTAKES.map((m) => (
            <li key={m.slice(0, 40)}>{m}</li>
          ))}
        </ul>
      </article>

      <p className="text-sm">
        Plain-language depth guides:{" "}
        <Link href={`${EP_DEBATE_TECHNIQUES_HREF}/hammer-attacks`} className="font-semibold underline">
          How Hammer attacks
        </Link>
        {" · "}
        <Link href={`${EP_DEBATE_TECHNIQUES_HREF}/culture-war`} className="font-semibold underline">
          Culture-war defense
        </Link>
        {" · "}
        <Link href={`${EP_DEBATE_TECHNIQUES_HREF}/if-stuck`} className="font-semibold underline">
          If you get stuck
        </Link>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {lanes.map((lane, i) => (
          <Link key={lane.laneId} href={epTrapLaneHref(lane.laneId)} className="ep-card flex flex-col p-5 transition hover:border-[var(--ep-gold)]">
            <span className="text-[10px] font-bold uppercase text-violet-800">Trap lane {i + 1} of 6</span>
            <h2 className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{lane.title}</h2>
            <p className="mt-2 flex-1 text-sm text-[var(--ep-navy-muted)]">{lane.summary}</p>
            <p className="mt-4 text-xs font-bold text-[var(--ep-gold)]">Full drill-down →</p>
          </Link>
        ))}
      </div>

      <p className="text-sm text-[var(--ep-navy-muted)]">
        After reading lanes, run scripts in the{" "}
        <Link href={EP_DEBATE_PREP_REHEARSAL_HREF} className="font-semibold underline">
          rehearsal engine
        </Link>
        .
      </p>
    </section>
  );
}
