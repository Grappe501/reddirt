"use client";

import {
  accaForumClipEmbedSrc,
  accaForumClipYoutubeWatchUrl,
  formatAccaClipTimestamp,
  type AccaForumStudyClip,
} from "@/lib/election-plan/acca-forum-study-clips";

const OPPONENT_TONE: Record<AccaForumStudyClip["opponent"], string> = {
  Hammer: "border-rose-200 bg-rose-50/30",
  Pakko: "border-violet-200 bg-violet-50/30",
  Kelly: "border-emerald-200 bg-emerald-50/30",
  Moderator: "border-slate-200 bg-slate-50/30",
};

export function AccaForumClipEmbed({
  clip,
  compact,
  watched,
  onToggleWatched,
}: {
  clip: AccaForumStudyClip;
  compact?: boolean;
  watched?: boolean;
  onToggleWatched?: () => void;
}) {
  const tone = OPPONENT_TONE[clip.opponent];

  return (
    <article className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">
            {clip.opponent} · {formatAccaClipTimestamp(clip.startSeconds)} · ~{clip.durationSeconds}s
          </p>
          <h3 className="mt-1 font-heading text-base font-bold text-[var(--ep-navy)]">{clip.label}</h3>
        </div>
        {onToggleWatched ? (
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--ep-navy)]">
            <input type="checkbox" checked={Boolean(watched)} onChange={onToggleWatched} />
            Watched + paused at tells
          </label>
        ) : null}
      </div>

      <div className={`${compact ? "mt-3" : "mt-4"} aspect-video w-full overflow-hidden rounded-lg border border-[var(--ep-border)] bg-black`}>
        <iframe
          className="h-full w-full"
          src={accaForumClipEmbedSrc(clip)}
          title={clip.label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
        <a href={accaForumClipYoutubeWatchUrl(clip)} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
          Open clip on YouTube ↗
        </a>
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--ep-border)]/60 bg-white/80 p-3 text-xs">
          <p className="font-bold uppercase text-[var(--ep-navy)]">Watch for</p>
          <p className="mt-1 text-[var(--ep-navy-muted)]">{clip.watchFor}</p>
        </div>
        <div className="rounded-lg border border-emerald-200/80 bg-white/80 p-3 text-xs">
          <p className="font-bold uppercase text-emerald-900">Kelly pivot hint</p>
          <p className="mt-1 text-[var(--ep-navy-muted)]">{clip.kellyPivotHint}</p>
        </div>
      </div>
      {clip.claimsNote ? (
        <p className="mt-2 text-xs font-semibold text-amber-900">{clip.claimsNote}</p>
      ) : null}
    </article>
  );
}
