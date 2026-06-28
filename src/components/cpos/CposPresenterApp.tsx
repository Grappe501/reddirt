"use client";

import { useCallback, useEffect, useState } from "react";

import { buildDemoUrl } from "@/lib/cpos/meeting-engine";
import type { MeetingManifest } from "@/lib/cpos/schemas/meeting-manifest";
import { postSessionAdvance, useCposSessionPoll } from "@/components/cpos/useCposSessionPoll";

type Props = {
  manifest: MeetingManifest;
  meetingId: string;
};

function formatClock(): string {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function CposPresenterApp({ manifest, meetingId }: Props) {
  const { session, loading } = useCposSessionPoll(meetingId, 1500);
  const [clock, setClock] = useState(formatClock());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const chapters = [...manifest.chapters].sort((a, b) => a.index - b.index);
  const idx = session?.currentChapterIndex ?? 0;
  const chapter = chapters.find((c) => c.index === idx) ?? chapters[0];
  const nextChapter = chapters.find((c) => c.index === idx + 1);

  useEffect(() => {
    const t = setInterval(() => setClock(formatClock()), 1000);
    return () => clearInterval(t);
  }, []);

  const advance = useCallback(
    async (payload: import("@/lib/cpos/session-types").SessionAdvancePayload) => {
      setBusy(true);
      setErr(null);
      try {
        await postSessionAdvance(meetingId, payload);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Action failed");
      } finally {
        setBusy(false);
      }
    },
    [meetingId],
  );

  const activeCues = Object.entries(manifest.cues).filter(([, cue]) => cue.chapters.includes(chapter.id));

  return (
    <div className="cpos-presenter-shell">
      <div className="ep-classification">Presenter console · CPOS · {manifest.title}</div>
      <div className="cpos-presenter-grid">
        <section className="cpos-presenter-panel">
          <h2>Timing</h2>
          <div className="cpos-presenter-clock">{clock}</div>
          <p className="text-sm text-[var(--ep-navy-muted)] mt-1">Central Time</p>
          <p className="cpos-presenter-chapter-title mt-4">{chapter.title}</p>
          {chapter.scheduleStart && (
            <p className="text-xs text-[var(--ep-navy-muted)] mt-1">
              Scheduled {chapter.scheduleStart.slice(11, 16)} – {chapter.scheduleEnd?.slice(11, 16)}
            </p>
          )}
          {nextChapter && (
            <p className="text-sm mt-3">
              <span className="text-[var(--ep-navy-muted)]">Next: </span>
              <strong>{nextChapter.title}</strong>
            </p>
          )}
          {err && <p className="mt-3 text-sm text-[var(--ep-accent)]">{err}</p>}
          <div className="cpos-btn-row">
            <button
              type="button"
              className="cpos-btn"
              disabled={busy || idx <= 0}
              onClick={() => advance({ action: "back" })}
            >
              ← Back
            </button>
            <button
              type="button"
              className="cpos-btn cpos-btn-primary"
              disabled={busy || idx >= chapters.length - 1}
              onClick={() => advance({ action: "advance" })}
            >
              Next chapter →
            </button>
            <button type="button" className="cpos-btn" disabled={busy} onClick={() => advance({ action: "start" })}>
              Mark live
            </button>
            <button type="button" className="cpos-btn" disabled={busy} onClick={() => advance({ action: "end" })}>
              End meeting
            </button>
          </div>
        </section>

        <section className="cpos-presenter-panel">
          <h2>Private cues</h2>
          {activeCues.length === 0 ? (
            <p className="text-sm text-[var(--ep-navy-muted)]">No cues for this chapter.</p>
          ) : (
            activeCues.map(([id, cue]) => (
              <div key={id} className="cpos-cue-item">{cue.text}</div>
            ))
          )}
          <h2 className="mt-6">Presenter notes</h2>
          <p className="text-sm leading-relaxed text-[var(--ep-navy-muted)]">
            {chapter.storyBeat ? `Story beat: ${chapter.storyBeat}. ` : ""}
            Advance manually if timing slips — audience follows via polling.
          </p>
        </section>

        <section className="cpos-presenter-panel">
          <h2>Jump to chapter</h2>
          <div className="cpos-chapter-jump">
            {chapters.map((ch) => (
              <button
                key={ch.id}
                type="button"
                className={ch.index === idx ? "is-active" : ""}
                disabled={busy}
                onClick={() => advance({ action: "jump", chapterIndex: ch.index })}
              >
                {ch.index}
              </button>
            ))}
          </div>

          <h2 className="mt-6">Demos</h2>
          <div className="cpos-btn-row">
            {chapter.primaryDemo && manifest.demos[chapter.primaryDemo] && (
              <a
                className="cpos-btn cpos-btn-primary"
                href={buildDemoUrl(manifest.demos[chapter.primaryDemo], meetingId, manifest.join.audiencePath)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => advance({ action: "set_demo", demoId: chapter.primaryDemo })}
              >
                {manifest.demos[chapter.primaryDemo].label}
              </a>
            )}
            {(chapter.secondaryDemoCards ?? []).slice(0, 4).map((demoId) => {
              const demo = manifest.demos[demoId];
              if (!demo || demo.polishLevel === "placeholder") return null;
              return (
                <a
                  key={demoId}
                  className="cpos-btn"
                  href={buildDemoUrl(demo, meetingId, manifest.join.audiencePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {demo.label}
                </a>
              );
            })}
          </div>
          <button
            type="button"
            className="cpos-btn mt-2"
            disabled={busy}
            onClick={() => advance({ action: "clear_demo" })}
          >
            Clear active demo
          </button>

          <p className="text-xs text-[var(--ep-navy-muted)] mt-4">
            Session: {session?.status ?? "…"} · Polling sync · {loading ? "syncing" : "ok"}
          </p>
        </section>
      </div>
    </div>
  );
}
