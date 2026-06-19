import Link from "next/link";

import { EP_FORUM_TRANSCRIPT_LAB_HREF } from "@/lib/election-plan/debate-prep-links";
import type { ForumTranscriptIntelSlice } from "@/lib/intelligence/v4/forumTranscriptIntel";

type Props = {
  intel: ForumTranscriptIntelSlice;
  compact?: boolean;
};

export function ForumTranscriptIntelHubPanel({ intel, compact }: Props) {
  if (!intel.transcriptReady && !intel.ready) {
    return (
      <section className="ep-card mb-8 border border-dashed border-[var(--ep-border)] p-5 text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">Forum transcript intelligence · not started</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          Drop the ACCA MP4 or run YouTube ingest — analysis will auto-merge into Days 4–5, trap lanes, and techniques.
        </p>
        <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="mt-3 inline-block text-xs font-bold underline">
          Open forum transcript lab →
        </Link>
      </section>
    );
  }

  return (
    <section className="ep-card mb-8 border-2 border-[var(--ep-gold)]/50 bg-[var(--ep-cream)]/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">
            Forum transcript intelligence · v6 wired
          </p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
            {intel.transcriptChars.toLocaleString()} chars · source: {intel.transcriptSource.replace(/_/g, " ")}
            {intel.deepAnalysisReady ? " · deep v2" : intel.analysisReady ? " · analysis v1" : ""}
          </p>
        </div>
        <Link
          href={EP_FORUM_TRANSCRIPT_LAB_HREF}
          className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-xs font-bold text-[var(--ep-navy)]"
        >
          Full lab →
        </Link>
      </div>

      {intel.executiveBrief && !compact ? (
        <p className="mt-4 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{intel.executiveBrief}</p>
      ) : null}

      {!compact ? (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-2 text-sm">
            {intel.predictedQuestions.length ? (
              <article>
                <p className="text-xs font-bold uppercase text-indigo-900">Predicted debate questions (forum)</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
                  {intel.predictedQuestions.slice(0, 5).map((q) => (
                    <li key={q.slice(0, 48)}>{q}</li>
                  ))}
                </ul>
              </article>
            ) : null}
            {intel.watchForTells.length ? (
              <article>
                <p className="text-xs font-bold uppercase text-violet-900">Watch for tells</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
                  {intel.watchForTells.slice(0, 5).map((t) => (
                    <li key={t.slice(0, 48)}>{t}</li>
                  ))}
                </ul>
              </article>
            ) : null}
          </div>

          {intel.capitalizeMoves.length ? (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase text-emerald-900">Top capitalize moves (→ Day 5 drills)</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {intel.capitalizeMoves.slice(0, 4).map((m, i) => (
                  <div
                    key={`${m.trigger.slice(0, 16)}-${i}`}
                    className="rounded-lg border border-emerald-200 bg-white p-3 text-xs"
                  >
                    <p className="font-bold text-rose-950">If: {m.trigger}</p>
                    <p className="mt-1 font-bold text-[var(--ep-navy)]">Kelly: {m.kellyLine}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <details className="mt-5 text-xs text-[var(--ep-navy-muted)]">
            <summary className="cursor-pointer font-bold text-[var(--ep-navy)]">
              Wired surfaces ({intel.wiredSurfaces.length})
            </summary>
            <ul className="mt-2 list-inside list-disc space-y-0.5">
              {intel.wiredSurfaces.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </details>
        </>
      ) : (
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Three-way panel mode uses forum-acca cards — coach and critique include ACCA intel context.
        </p>
      )}
    </section>
  );
}
