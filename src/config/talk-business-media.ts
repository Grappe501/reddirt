/**
 * Talk Business & Politics embed on `/about`.
 *
 * Resolution order for the iframe `src`:
 * 1. `NEXT_PUBLIC_TALK_BUSINESS_IFRAME_SRC` (exact `src` from their embed snippet, https only)
 * 2. `NEXT_PUBLIC_TALK_BUSINESS_KELLY_YOUTUBE_VIDEO_ID` → youtube-nocookie embed URL
 * 3. `NEXT_PUBLIC_FEATURE_VIDEO_EMBED_URL` if it is a `/embed/` URL
 * 4. `fallbackYoutubeVideoId` (e.g. Admin featured / inbound YouTube when env is unset)
 */
export function getTalkBusinessIframeSrc(): string | null {
  const raw = process.env.NEXT_PUBLIC_TALK_BUSINESS_IFRAME_SRC?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function getTalkBusinessKellyInterviewVideoId(): string | null {
  if (getTalkBusinessIframeSrc()) return null;
  const raw = process.env.NEXT_PUBLIC_TALK_BUSINESS_KELLY_YOUTUBE_VIDEO_ID?.trim();
  if (!raw) return null;
  return /^[a-zA-Z0-9_-]{11}$/.test(raw) ? raw : null;
}

export function getTalkBusinessIframeTitle(): string {
  return (
    process.env.NEXT_PUBLIC_TALK_BUSINESS_IFRAME_TITLE?.trim() ||
    "Kelly Grappe — Talk Business & Politics interview"
  );
}

function youtubeNocookieEmbed(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`;
}

export function resolveTalkBusinessEmbedSrc(options?: {
  fallbackYoutubeVideoId?: string | null;
}): { src: string | null; title: string } {
  const title = getTalkBusinessIframeTitle();

  const envIframe = getTalkBusinessIframeSrc();
  if (envIframe) return { src: envIframe, title };

  const envId = process.env.NEXT_PUBLIC_TALK_BUSINESS_KELLY_YOUTUBE_VIDEO_ID?.trim();
  if (envId && /^[a-zA-Z0-9_-]{11}$/.test(envId)) {
    return { src: youtubeNocookieEmbed(envId), title };
  }

  const feature = process.env.NEXT_PUBLIC_FEATURE_VIDEO_EMBED_URL?.trim();
  if (feature) {
    try {
      const u = new URL(feature);
      if (u.protocol === "https:" && u.pathname.includes("embed")) {
        return { src: u.toString(), title };
      }
    } catch {
      /* noop */
    }
  }

  const fb = options?.fallbackYoutubeVideoId?.trim();
  if (fb && /^[a-zA-Z0-9_-]{11}$/.test(fb)) {
    return { src: youtubeNocookieEmbed(fb), title };
  }

  return { src: null, title };
}
