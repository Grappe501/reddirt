"use client";

import { useMemo } from "react";
import type { FromTheRoadEmbedsConfig } from "@/config/from-the-road-embeds";

const FB_W = 500;
const FB_H = 720;

type Props = {
  config: FromTheRoadEmbedsConfig;
};

/**
 * In-page “windows” for people who are not on Facebook/TikTok: scrollable iframes (official embeds only).
 */
export function FromTheRoadLiveEmbeds({ config }: Props) {
  const fbSrc = useMemo(() => {
    if (!config.facebookPageUrl) return null;
    const p = new URL("https://www.facebook.com/plugins/page.php");
    p.searchParams.set("href", config.facebookPageUrl);
    p.searchParams.set("tabs", "timeline");
    p.searchParams.set("width", String(FB_W));
    p.searchParams.set("height", String(FB_H));
    p.searchParams.set("small_header", "false");
    p.searchParams.set("adapt_container_width", "true");
    p.searchParams.set("hide_cover", "false");
    p.searchParams.set("show_facepile", "true");
    return p.toString();
  }, [config.facebookPageUrl]);

  if (
    !config.facebookPageUrl &&
    config.tiktokVideoIds.length === 0 &&
    !config.youtubePlaylistId &&
    config.instagramEmbedShortcodes.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-2 space-y-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {fbSrc ? (
          <div className="flex min-h-0 flex-col">
            <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-slate/60">
              Facebook — live page
            </div>
            <div
              className="relative w-full max-h-[min(80vh,820px)] overflow-auto rounded-card border border-kelly-ink/12 bg-white shadow-inner shadow-kelly-ink/5"
              role="region"
              aria-label="Facebook page"
            >
              <iframe
                title="Campaign Facebook page"
                src={fbSrc}
                width={FB_W}
                height={FB_H}
                className="w-full min-w-0"
                style={{ minHeight: FB_H }}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}
        {config.tiktokVideoIds.length > 0 ? (
          <div className="flex min-h-0 flex-col">
            <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-slate/60">
              TikTok — selected clips
            </div>
            <ul className="max-h-[min(80vh,900px)] space-y-6 overflow-y-auto rounded-card border border-kelly-ink/12 bg-kelly-navy/5 p-3 pr-2 shadow-inner sm:p-4">
              {config.tiktokVideoIds.map((id) => (
                <li key={id} className="mx-auto w-full max-w-md overflow-hidden rounded-lg bg-black/80 shadow-lg">
                  <iframe
                    title={`TikTok video ${id}`}
                    src={`https://www.tiktok.com/embed/v2/${encodeURIComponent(id)}`}
                    className="aspect-[9/16] w-full min-h-[420px] border-0 sm:min-h-[480px]"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {config.youtubePlaylistId ? (
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-slate/60">
            YouTube — latest uploads (playlist)
          </div>
          <div
            className="overflow-hidden rounded-card border border-kelly-ink/12 bg-kelly-navy/5 shadow-inner"
            role="region"
            aria-label="YouTube uploads playlist"
          >
            <iframe
              title="Campaign YouTube uploads"
              src={`https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(config.youtubePlaylistId)}`}
              className="aspect-video w-full min-h-[240px] border-0 sm:min-h-[360px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      ) : null}

      {config.instagramEmbedShortcodes.length > 0 ? (
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-slate/60">
            Instagram — featured posts
          </div>
          <ul className="grid gap-6 md:grid-cols-2">
            {config.instagramEmbedShortcodes.map((code) => (
              <li
                key={code}
                className="overflow-hidden rounded-card border border-kelly-ink/12 bg-white shadow-sm shadow-kelly-ink/5"
              >
                <iframe
                  title={`Instagram post ${code}`}
                  src={`https://www.instagram.com/p/${encodeURIComponent(code)}/embed/?caption=0`}
                  className="h-[min(540px,80vh)] w-full min-h-[420px] border-0"
                  allow="encrypted-media; fullscreen"
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
