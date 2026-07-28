"use client";

import { useCallback, useState } from "react";
import { youtubeNocookieEmbedUrl } from "@/lib/media/campaign-transcript";
import { cn } from "@/lib/utils";

export type LazyShortYouTubeEmbedProps = {
  videoId: string;
  title: string;
  posterUrl: string;
  className?: string;
};

export function LazyShortYouTubeEmbed({ videoId, title, posterUrl, className }: LazyShortYouTubeEmbedProps) {
  const [active, setActive] = useState(false);
  const onActivate = useCallback(() => setActive(true), []);
  const src = `${youtubeNocookieEmbedUrl(videoId)}?autoplay=1&rel=0`;

  return (
    <div className={cn("relative aspect-[9/16] w-full overflow-hidden rounded-card bg-black", className)}>
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden />
          <button
            type="button"
            onClick={onActivate}
            className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-gold"
            aria-label={`Play short: ${title}`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-kelly-gold/80 bg-kelly-navy/55 text-xl text-kelly-gold">
              ▶
            </span>
          </button>
        </>
      )}
    </div>
  );
}
