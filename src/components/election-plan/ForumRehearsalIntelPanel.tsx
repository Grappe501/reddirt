import Link from "next/link";

import {
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { countForumDrillQueueCards } from "@/lib/intelligence/v4/forumTranscriptRehearsalCards";
import { loadForumTranscriptIntel } from "@/lib/intelligence/v4/forumTranscriptIntel";

export function ForumRehearsalIntelPanel() {
  const intel = loadForumTranscriptIntel();
  const forumCardCount = countForumDrillQueueCards();

  if (!intel.transcriptReady && !intel.ready) {
    return (
      <section className="ep-card border border-dashed border-[var(--ep-border)] p-5 text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">Forum rehearsal queue · awaiting transcript</p>
        <p className="mt-2 text-[var(--ep-navy-muted)]">
          After forum ingest, capitalize moves and moderator questions auto-build a{" "}
          <code className="rounded bg-[var(--ep-cream)] px-1 text-[11px]">forum-acca-tonight</code> drill queue for
          tutor and rehearsal.
        </p>
      </section>
    );
  }

  return (
    <section className="ep-card border-2 border-violet-300/60 bg-violet-50/40 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-violet-900">Forum intel · rehearsal integration</p>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
        {forumCardCount} forum-derived drill cards · {intel.transcriptChars.toLocaleString()} transcript chars · ACCA
        run-of-show enriched when you launch the ACCA panel encounter.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <Link
          href={`${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=forum-acca-tonight`}
          className="rounded-full border border-violet-400 bg-white px-3 py-1.5 text-violet-950"
        >
          Start forum-acca-tonight queue →
        </Link>
        <Link
          href={`${EP_DEBATE_PREP_TUTOR_HREF}?mode=three-way-panel`}
          className="rounded-full border border-[var(--ep-navy)] bg-[var(--ep-navy)] px-3 py-1.5 text-white"
        >
          Tutor · three-way panel →
        </Link>
        <Link
          href={`${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=world-class-dress&card=1`}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-indigo-950"
        >
          World-class dress →
        </Link>
        <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1.5">
          Forum lab →
        </Link>
      </div>

      {intel.predictedQuestions.length ? (
        <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-[var(--ep-navy-muted)]">
          {intel.predictedQuestions.slice(0, 3).map((q) => (
            <li key={q.slice(0, 48)}>{q}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
