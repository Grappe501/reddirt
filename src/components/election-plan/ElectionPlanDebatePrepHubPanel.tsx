import Link from "next/link";

import { DebateWeekIntensivePanel } from "@/components/admin/intelligence/DebateWeekIntensivePanel";
import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import {
  EP_EXECUTIVE_BOOK_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { ACCA_2026_SOS_FORUM_DROP_REL, ACCA_2026_SOS_FORUM_EVENT } from "@/lib/intelligence/v4/forumVideoDropPath";
import { DEBATE_DATE, DEBATE_WEEK_INTENSIVE_PRIMER } from "@/lib/intelligence/v4/debateWeekIntensive2026";

export function ElectionPlanDebatePrepHubPanel() {
  const referenceDate = process.env.DEBATE_WEEK_TODAY ?? "2026-06-19";

  return (
    <>
      <ElectionPlanDebatePrepSubnav />

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--ep-gold)]">Debate prep · Election Plan</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">SOS debate command course</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          {DEBATE_WEEK_INTENSIVE_PRIMER.headline} — structured study through debate day ({DEBATE_DATE}). Staff and Kelly
          rehearse here; opposition contrast lives under{" "}
          <Link href={EP_OPPOSITION_RESEARCH_HREF} className="font-semibold text-[var(--ep-navy)] underline">
            Opposition Research
          </Link>
          . Leadership narrative ties to the{" "}
          <Link href={EP_EXECUTIVE_BOOK_HREF} className="font-semibold text-[var(--ep-navy)] underline">
            Executive Book
          </Link>
          .
        </p>
      </header>

      <section className="ep-card mb-8 border-2 border-[var(--ep-gold)]/40 bg-[var(--ep-cream)]/50 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">ACCA three-candidate forum · local drop</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {ACCA_2026_SOS_FORUM_EVENT.title} — {ACCA_2026_SOS_FORUM_EVENT.date} · {ACCA_2026_SOS_FORUM_EVENT.venue}
        </p>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          Candidates: {ACCA_2026_SOS_FORUM_EVENT.candidates.join(" · ")}
        </p>
        <div className="mt-4 rounded-lg border border-[var(--ep-border)] bg-white p-4">
          <p className="text-xs font-semibold text-[var(--ep-navy)]">Drop your MP4 here (7.5 GB OK on disk)</p>
          <code className="mt-2 block break-all text-[11px] text-[var(--ep-navy-muted)]">
            RedDirt/{ACCA_2026_SOS_FORUM_DROP_REL.replace(/\\/g, "/")}/
          </code>
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            Large files: run{" "}
            <code className="rounded bg-[var(--ep-cream)] px-1">npm run forum:ingest-acca-drop</code> from{" "}
            <code className="rounded bg-[var(--ep-cream)] px-1">RedDirt/</code> (requires ffmpeg + DATABASE_URL +
            OPENAI_API_KEY). Browser upload in{" "}
            <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="font-semibold underline">
              Forum transcript lab
            </Link>{" "}
            is for smaller files only.
          </p>
        </div>
      </section>

      <DebateWeekIntensivePanel
        linkOverrides={{
          forumLab: EP_FORUM_TRANSCRIPT_LAB_HREF,
        }}
        initialDay={1}
        todayDate={referenceDate}
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="ep-card block p-5 transition hover:border-[var(--ep-gold)]">
          <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Day 4 anchor</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">Forum transcript lab</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Watch, transcribe, and build Kelly&apos;s capitalize playbook from the three-way ACCA panel.
          </p>
        </Link>
        <Link href={EP_OPPOSITION_RESEARCH_HREF} className="ep-card block p-5 transition hover:border-[var(--ep-gold)]">
          <p className="text-xs font-bold uppercase text-rose-700">Staff lane</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-[var(--ep-navy)]">Opposition research</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Kim Hammer modules, dossiers, evidence command — claims-gated before any public line.
          </p>
        </Link>
      </section>
    </>
  );
}
