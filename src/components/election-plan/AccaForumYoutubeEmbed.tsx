import Link from "next/link";

import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/election-plan/acca-forum-event";
import { DAY2_FILM_ROOM_CLIP_IDS } from "@/lib/election-plan/acca-forum-study-clips";
import { EP_FORUM_TRANSCRIPT_LAB_HREF } from "@/lib/election-plan/debate-prep-links";
import { buildAccaClipBriefs, forumTranscriptReady } from "@/lib/election-plan/load-acca-forum-clip-briefs";

/** Kelly-facing ACCA forum intel — transcript excerpts at hand (no video embed). */
export function AccaForumYoutubeEmbed({ compact }: { compact?: boolean }) {
  const ready = forumTranscriptReady();
  const previewBriefs = ready ? buildAccaClipBriefs(DAY2_FILM_ROOM_CLIP_IDS.slice(0, 2)) : [];

  return (
    <section className={compact ? "mt-4" : "mb-6"}>
      {!compact ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">ACCA forum transcript · at hand</p>
      ) : null}
      <p className="text-sm text-[var(--ep-navy-muted)]">
        {ACCA_2026_SOS_FORUM_EVENT.title} — {ACCA_2026_SOS_FORUM_EVENT.date}. Read pull quotes and transcript excerpts below
        — staff already ingested the full forum text. No video required tonight.
      </p>
      {ready && previewBriefs.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {previewBriefs.map((brief) => (
            <li key={brief.clipId} className="rounded-lg border border-[var(--ep-border)] bg-white/90 p-3 text-xs">
              <p className="font-bold text-[var(--ep-navy)]">
                {brief.opponent} · {brief.label}
              </p>
              {brief.pullQuotes[0] ? (
                <blockquote className="mt-2 text-[var(--ep-navy-muted)]">
                  &ldquo;{brief.pullQuotes[0].quote.length > 160
                    ? `${brief.pullQuotes[0].quote.slice(0, 157)}…`
                    : brief.pullQuotes[0].quote}
                  &rdquo; — {brief.pullQuotes[0].speaker}
                </blockquote>
              ) : (
                <p className="mt-2 text-[var(--ep-navy-muted)]">{brief.narrativeLead}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-950">
          Full transcript loading — open forum lab for complete ACCA forum text and analysis.
        </p>
      )}
      <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
        Full forum transcript lab →
      </Link>
    </section>
  );
}
