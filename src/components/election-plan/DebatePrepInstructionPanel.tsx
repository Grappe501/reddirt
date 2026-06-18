import Link from "next/link";

import { DebatePrepOperatorGuideCard } from "@/components/election-plan/DebatePrepOperatorGuideCard";
import {
  DEBATE_CONTRAST_METHOD,
  DEBATE_PREP_ANSWER_ARCHITECTURE,
  DEBATE_PREP_WEEKLY_FLOW,
  DEBATE_REHEARSAL_TECHNIQUES,
  FIRST_DEBATE_MISTAKES,
  MODERATOR_INTERACTION_TECHNIQUES,
  STAGE_PRESENCE_CHECKLIST,
  TRAP_LANE_SELECTION_GUIDE,
  TRAP_LANE_TECHNIQUE_STEPS,
} from "@/lib/election-plan/debate-prep-operator-guide";
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  EP_TRAP_LANES_HREF,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { KELLY_MASTER_FRAME, getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { TRAP_LANE_FIRST_TIMER_NOTE, listTrapLaneSummaries } from "@/lib/intelligence/v4/trapLaneDrillDowns";

export function DebatePrepInstructionPanel() {
  const trapGuide = getSurfaceGuide("trap-lanes-index");
  const trapLanes = listTrapLaneSummaries();

  return (
    <section className="mb-10 space-y-6">
      <div className="ep-card border-2 border-[var(--ep-gold)]/30 bg-[var(--ep-cream)]/50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">Debate prep drill-down</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{KELLY_MASTER_FRAME.headline}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">{DEBATE_CONTRAST_METHOD}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={EP_TRAP_LANES_HREF} className="ep-card px-3 py-2 text-xs font-semibold hover:border-[var(--ep-gold)]">
            Trap lanes (6) →
          </Link>
          <Link href={EP_DEBATE_TECHNIQUES_HREF} className="ep-card px-3 py-2 text-xs font-semibold hover:border-[var(--ep-gold)]">
            Techniques library →
          </Link>
          <Link href={EP_DEBATE_PREP_COMMAND_HREF} className="ep-card px-3 py-2 text-xs font-semibold hover:border-[var(--ep-gold)]">
            Command home →
          </Link>
          <Link href={EP_DEBATE_PREP_REHEARSAL_HREF} className="ep-card px-3 py-2 text-xs font-semibold hover:border-[var(--ep-gold)]">
            Rehearsal engine →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Answer architecture</h3>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-[var(--ep-navy-muted)]">
            {DEBATE_PREP_ANSWER_ARCHITECTURE.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ol>
        </article>
        <article className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Master frame pillars</h3>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
            {KELLY_MASTER_FRAME.pillars.map((p) => (
              <li key={p.slice(0, 48)}>{p}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="ep-card border border-amber-200 bg-amber-50/50 p-5 text-sm text-amber-950">
        <p className="text-xs font-bold uppercase">Trap lanes — first debate note</p>
        <p className="mt-2">{TRAP_LANE_FIRST_TIMER_NOTE}</p>
      </article>

      {trapGuide ? <DebatePrepOperatorGuideCard title="How to use trap lanes" guide={trapGuide} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Trap lane workflow (5 steps)</h3>
          <ol className="mt-4 space-y-3 text-sm">
            {TRAP_LANE_TECHNIQUE_STEPS.map((item) => (
              <li key={item.step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ep-navy)] text-xs font-bold text-white">
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
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Core techniques</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {DEBATE_REHEARSAL_TECHNIQUES.map((t) => (
              <li key={t.id}>
                <p className="font-semibold text-[var(--ep-navy)]">{t.label}</p>
                <p className="text-[var(--ep-navy-muted)]">{t.detail}</p>
              </li>
            ))}
          </ul>
          <Link href={EP_DEBATE_TECHNIQUES_HREF} className="ep-chapter-link mt-4 inline-block text-sm font-semibold">
            Full techniques library →
          </Link>
        </article>
      </div>

      <article className="ep-card p-5">
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Six trap lanes — quick index</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trapLanes.map((lane, i) => (
            <Link key={lane.laneId} href={epTrapLaneHref(lane.laneId)} className="ep-card block p-4 transition hover:border-[var(--ep-gold)]">
              <p className="text-[10px] font-bold uppercase text-violet-800">Lane {i + 1}</p>
              <p className="mt-1 font-heading font-bold text-[var(--ep-navy)]">{lane.title}</p>
              <p className="mt-2 line-clamp-3 text-xs text-[var(--ep-navy-muted)]">{lane.summary}</p>
            </Link>
          ))}
        </div>
      </article>

      <article className="ep-card p-5">
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Which lane tonight?</h3>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          Match expected moderator themes — open one primary lane and one backup.
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {TRAP_LANE_SELECTION_GUIDE.map((row) => (
            <li key={row.laneId} className="flex flex-col gap-1 border-b border-[var(--ep-border)] pb-3 last:border-0">
              <p className="font-semibold text-[var(--ep-navy)]">{row.when}</p>
              <Link href={epTrapLaneHref(row.laneId)} className="text-xs font-bold text-violet-800 underline">
                Open lane →
              </Link>
              <p className="text-[var(--ep-navy-muted)]">{row.note}</p>
            </li>
          ))}
        </ul>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Moderator interaction</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {MODERATOR_INTERACTION_TECHNIQUES.map((t) => (
              <li key={t.id}>
                <p className="font-semibold text-[var(--ep-navy)]">{t.label}</p>
                <p className="text-[var(--ep-navy-muted)]">{t.detail}</p>
              </li>
            ))}
          </ul>
        </article>
        <article className="ep-card p-5">
          <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Stage presence checklist</h3>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-[var(--ep-navy-muted)]">
            {STAGE_PRESENCE_CHECKLIST.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="ep-card border border-rose-200 bg-rose-50/40 p-5">
        <h3 className="font-heading text-lg font-bold text-rose-950">First-debate mistakes to avoid</h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-rose-900">
          {FIRST_DEBATE_MISTAKES.map((m) => (
            <li key={m.slice(0, 40)}>{m}</li>
          ))}
        </ul>
      </article>

      <article className="ep-card p-5">
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Nightly prep sequence</h3>
        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-[var(--ep-navy-muted)]">
          {DEBATE_PREP_WEEKLY_FLOW.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ol>
      </article>
    </section>
  );
}
