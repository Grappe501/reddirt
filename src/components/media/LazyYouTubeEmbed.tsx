"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

export type LazyYouTubeEmbedProps = {
  videoId: string;
  title: string;
  posterUrl: string | null;
  className?: string;
};

/**
 * Thumbnail-first YouTube embed: iframe loads only after explicit user activation (performance + brand control).
 */
export function LazyYouTubeEmbed({ videoId, title, posterUrl, className }: LazyYouTubeEmbedProps) {
  const [active, setActive] = useState(false);
  const onActivate = useCallback(() => setActive(true), []);
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;

  return (
    <div
      className={cn("relative aspect-video w-full overflow-hidden rounded-card bg-black", className)}
      data-lazy-youtube={videoId}
    >
      {active ? (
        <iframe
          title={title}
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <>
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external YouTube CDN; avoids image remote config churn
            <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-civic-midnight via-civic-deep to-civic-blue"
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" aria-hidden />
          <button
            type="button"
            onClick={onActivate}
            className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-gold focus-visible:ring-offset-2 focus-visible:ring-offset-civic-midnight"
            aria-label={`Play video: ${title}`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-civic-gold/80 bg-civic-midnight/55 text-2xl text-civic-gold shadow-lg backdrop-blur-sm transition hover:scale-105">
              ▶
            </span>
          </button>
        </>
      )}
    </div>
  );
}
