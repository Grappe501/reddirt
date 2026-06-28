"use client";

import { CposChapterRenderer } from "@/components/cpos/CposChapterRenderer";
import { useCposSessionPoll } from "@/components/cpos/useCposSessionPoll";
import type { MeetingManifest } from "@/lib/cpos/schemas/meeting-manifest";

type Props = {
  manifest: MeetingManifest;
  meetingId: string;
  joinUrlDisplay: string;
};

export function CposAudienceApp({ manifest, meetingId, joinUrlDisplay }: Props) {
  const { session, loading, error } = useCposSessionPoll(meetingId, 2000);

  const chapters = [...manifest.chapters].sort((a, b) => a.index - b.index);
  const chapterIndex = session?.currentChapterIndex ?? 0;
  const chapter = chapters.find((c) => c.index === chapterIndex) ?? chapters[0];

  return (
    <div className="cpos-shell">
      <header className="cpos-banner">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ep-gold)]">Team Kickoff · Live</p>
        <h1 className="cpos-banner-title">{manifest.title}</h1>
        {manifest.subtitle && <p className="cpos-banner-sub">{manifest.subtitle}</p>}
        <div className="cpos-join-url" aria-label="Follow along URL">{joinUrlDisplay}</div>
        {manifest.openingDisclaimer && <p className="cpos-disclaimer">{manifest.openingDisclaimer}</p>}
        {manifest.promise && (
          <p className="mt-2 text-sm font-medium text-white/80">{manifest.promise}</p>
        )}
      </header>

      <main className="cpos-main">
        {loading && !session && <div className="cpos-loading">Connecting to meeting…</div>}
        {error && <div className="cpos-stay-flow">Sync issue: {error} — content below may lag; refresh if needed.</div>}

        <div className="cpos-progress" aria-label="Chapter progress">
          {chapters.map((ch) => (
            <span
              key={ch.id}
              className={`cpos-progress-dot ${ch.index === chapterIndex ? "is-active" : ""} ${ch.index < chapterIndex ? "is-done" : ""}`}
              title={ch.title}
            />
          ))}
        </div>

        <p className="cpos-chapter-label">
          Chapter {chapter.index + 1} of {chapters.length}
        </p>
        <h2 className="cpos-chapter-title">{chapter.title}</h2>

        <CposChapterRenderer chapter={chapter} manifest={manifest} meetingId={meetingId} />

        <div className="cpos-stay-flow">
          Stay with the meeting flow tonight. After we close, explore the Election Plan freely.
        </div>
      </main>

      {session?.activeDemoId && manifest.demos[session.activeDemoId] && (
        <div className="cpos-return-bar">
          <span className="text-sm">Now viewing: {manifest.demos[session.activeDemoId].label}</span>
          <a href={manifest.join.audiencePath}>Return to meeting</a>
        </div>
      )}
    </div>
  );
}
