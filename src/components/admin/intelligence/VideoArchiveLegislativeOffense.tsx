"use client";

import Link from "next/link";
import type { VideoArchiveRoomPacket } from "@/lib/legislature/videoArchiveRoom";
import { OFFENSIVE_DEBATE_PRINCIPLES } from "@/lib/intelligence/v4/kellyOffensivePrinciples";

export function VideoArchiveLegislativeOffense({ packet }: { packet: VideoArchiveRoomPacket }) {
  const record = packet.legislativeRecord;
  const stories = packet.roadStories;

  return (
    <div className="space-y-6">
      <article className="rounded-xl border border-kelly-navy/20 bg-kelly-page/30 p-4 text-xs">
        <p className="font-bold uppercase text-kelly-navy">{OFFENSIVE_DEBATE_PRINCIPLES.headline}</p>
        <p className="mt-2 text-kelly-muted">
          Principles P1–P8 and Hammer-line flips live on{" "}
          <Link href="/admin/intelligence/kelly-debate-coaching" className="font-bold underline">
            debate coaching
          </Link>
          . This tab is act cites and traps.
        </p>
      </article>

      <article className="rounded-xl border-2 border-rose-200 bg-rose-50/30 p-5 text-xs">
        <p className="text-[10px] font-bold uppercase tracking-wide text-rose-900">Offensive strategy — record not person</p>
        <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{record.clusterLabel}</h2>
        <p className="mt-3 leading-relaxed text-kelly-text">{record.thesis}</p>
        <p className="mt-3 font-semibold text-rose-950">Corner paint (verify before broadcast):</p>
        <p className="mt-1 text-kelly-muted">{record.hammerCornerPaint}</p>
        <p className="mt-3 font-semibold text-emerald-950">Kelly superiority exit:</p>
        <p className="mt-1 text-kelly-muted">{record.kellySuperiorityLine}</p>
        <p className="mt-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3 text-violet-950">
          <strong>Packo lane (phased):</strong> {record.packoAllianceNote}
        </p>
      </article>

      <section>
        <h3 className="text-sm font-bold uppercase text-kelly-navy">Debate sequence — direct democracy corner</h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-xs text-kelly-muted">
          {record.debateSequence.map((step) => (
            <li key={step.slice(0, 40)}>{step}</li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase text-kelly-navy">
          Bills & acts ({record.bills.length}) — quote on stage with Arkleg verification
        </h3>
        <div className="mt-3 space-y-3">
          {record.bills.map((b) => (
            <article key={b.billNumber} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-bold text-kelly-navy">{b.billNumber}</span>
                {b.actNumber ? (
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-950">
                    Act {b.actNumber}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-900">Act # — verify</span>
                )}
                <span className="text-kelly-subtle">{b.sessionYear} · {b.hammerRole}</span>
              </div>
              <p className="mt-2 text-kelly-muted line-clamp-2">{b.title}</p>
              <p className="mt-3 font-semibold text-rose-950">Kelly frame:</p>
              <p className="mt-1 text-kelly-text">{b.kellyOffensiveFrame}</p>
              <p className="mt-3 font-semibold text-violet-950">Trap question:</p>
              <p className="mt-1 italic text-kelly-muted">{b.trapQuestion}</p>
              <p className="mt-2 text-[10px] text-amber-900">{b.claimsNote}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a href={b.arklegUrl} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
                  Arkleg bill →
                </a>
                {b.actPdfUrl ? (
                  <a href={b.actPdfUrl} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
                    Enrolled act PDF →
                  </a>
                ) : null}
                <Link
                  href={`/admin/intelligence/kim-hammer/bills/${b.billNumber}`}
                  className="font-bold text-kelly-navy underline"
                >
                  Drill-down →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 text-xs">
        <h3 className="font-bold uppercase text-sky-950">Transcription pipeline</h3>
        <p className="mt-2 text-kelly-muted">
          Opponent media excerpts: <strong>{packet.transcripts.catalogCount}</strong> · Committee Whisper segments:{" "}
          <strong>{packet.transcripts.pipelineSegmentCount}</strong> · Provider:{" "}
          <strong>{packet.transcripts.transcriptionStatus}</strong>
        </p>
        {packet.committeeTranscriptExcerpts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {packet.committeeTranscriptExcerpts.map((ex) => (
              <li key={`${ex.videoCandidateId}-${ex.text.slice(0, 24)}`} className="rounded border border-sky-200 bg-white p-2">
                <span className="font-bold text-kelly-navy">{ex.billNumber}</span>
                <span className="ml-2 text-[10px] text-kelly-subtle">{ex.speakerLabel}</span>
                <p className="mt-1 text-kelly-muted">{ex.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-amber-900">
            No committee transcripts yet — set OPENAI_API_KEY and run legislative video pipeline, or register manual excerpts.
          </p>
        )}
        <Link href="/admin/intelligence/legislative-video" className="mt-3 inline-block font-bold text-kelly-navy underline">
          Legislative video pipeline →
        </Link>
      </section>
    </div>
  );
}

export function VideoArchiveRoadStories({ packet }: { packet: VideoArchiveRoomPacket }) {
  const stories = packet.roadStories;

  return (
    <div className="space-y-4">
      <p className="text-xs text-kelly-muted">{stories.instructions}</p>
      <p className="text-xs text-amber-900">{stories.candidateAddPrompt}</p>
      <div className="space-y-3">
        {stories.storySlots.map((s) => (
          <article key={s.id} className="rounded-xl border border-emerald-100 bg-white p-4 text-xs">
            <div className="flex flex-wrap gap-2">
              <span className="font-bold text-kelly-navy">{s.title}</span>
              <span className="rounded bg-kelly-page px-1.5 py-0.5 text-[10px] uppercase text-kelly-subtle">
                {s.claimsStatus}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-kelly-subtle">{s.county} · Use when: {s.whenToUse}</p>
            <p className="mt-3 leading-relaxed text-kelly-text">{s.story}</p>
          </article>
        ))}
      </div>
      <Link href="/admin/intelligence/kelly-debate-coaching" className="text-xs font-bold text-kelly-navy underline">
        Submit real stories on debate coaching →
      </Link>
    </div>
  );
}
