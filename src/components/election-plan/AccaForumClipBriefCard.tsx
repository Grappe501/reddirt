"use client";

import type { AccaForumClipBrief } from "@/lib/election-plan/load-acca-forum-clip-briefs";

const OPPONENT_TONE: Record<AccaForumClipBrief["opponent"], string> = {
  Hammer: "border-rose-200 bg-rose-50/30",
  Pakko: "border-violet-200 bg-violet-50/30",
  Kelly: "border-emerald-200 bg-emerald-50/30",
  Moderator: "border-slate-200 bg-slate-50/30",
};

export function AccaForumClipBriefCard({
  brief,
  reviewed,
  onToggleReviewed,
}: {
  brief: AccaForumClipBrief;
  reviewed?: boolean;
  onToggleReviewed?: () => void;
}) {
  const tone = OPPONENT_TONE[brief.opponent];

  return (
    <article className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">
            {brief.opponent} · ~{brief.timestampLabel} in forum
          </p>
          <h3 className="mt-1 font-heading text-base font-bold text-[var(--ep-navy)]">{brief.label}</h3>
        </div>
        {onToggleReviewed ? (
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--ep-navy)]">
            <input type="checkbox" checked={Boolean(reviewed)} onChange={onToggleReviewed} />
            Read + pivot rehearsed
          </label>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{brief.narrativeLead}</p>

      {brief.pullQuotes.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Pull quotes · read aloud</p>
          {brief.pullQuotes.map((q) => (
            <blockquote
              key={`${q.speaker}-${q.quote.slice(0, 32)}`}
              className="rounded-lg border border-[var(--ep-border)]/70 bg-white/90 p-3 text-sm"
            >
              <p className="text-xs font-bold text-[var(--ep-navy-muted)]">
                {q.speaker}
                {q.claimsGate ? ` · claims: ${q.claimsGate}` : ""}
              </p>
              <p className="mt-1 font-medium text-[var(--ep-navy)]">&ldquo;{q.quote}&rdquo;</p>
              {q.context ? <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{q.context}</p> : null}
            </blockquote>
          ))}
        </div>
      ) : null}

      <details className="mt-4 rounded-lg border border-[var(--ep-border)] bg-white/80">
        <summary className="cursor-pointer px-3 py-2 text-xs font-bold uppercase text-[var(--ep-navy)]">
          Forum transcript excerpt
        </summary>
        <p className="border-t border-[var(--ep-border)] px-3 py-3 text-xs leading-relaxed text-[var(--ep-navy-muted)] whitespace-pre-wrap">
          {brief.transcriptExcerpt}
        </p>
      </details>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--ep-border)]/60 bg-white/80 p-3 text-xs">
          <p className="font-bold uppercase text-[var(--ep-navy)]">Tells to track in text</p>
          <p className="mt-1 text-[var(--ep-navy-muted)]">{brief.tellsToTrack}</p>
        </div>
        <div className="rounded-lg border border-emerald-200/80 bg-white/80 p-3 text-xs">
          <p className="font-bold uppercase text-emerald-900">Kelly pivot</p>
          <p className="mt-1 text-[var(--ep-navy-muted)]">{brief.kellyPivotHint}</p>
        </div>
      </div>
      {brief.claimsNote ? (
        <p className="mt-2 text-xs font-semibold text-amber-900">{brief.claimsNote}</p>
      ) : null}
    </article>
  );
}
