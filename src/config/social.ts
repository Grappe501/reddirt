import { getCampaignBlogUrl, getContactMailto } from "@/config/external-campaign";

export type PublicSocialId =
  | "facebook"
  | "instagram"
  | "x"
  | "youtube"
  | "substack"
  | "tiktok"
  | "email";

export type PublicSocialLink = {
  id: PublicSocialId;
  label: string;
  href: string;
};

function envUrl(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v || fallback;
}

/** Public page handles (override with NEXT_PUBLIC_SOCIAL_* in deploy). */
export const DEFAULT_SOCIAL_FACEBOOK_PAGE_ID = "61582696603861";
export const DEFAULT_SOCIAL_FACEBOOK_URL = `https://www.facebook.com/${DEFAULT_SOCIAL_FACEBOOK_PAGE_ID}`;
const RETIRED_SOCIAL_FACEBOOK_URLS = new Set([
  "https://www.facebook.com/Kelly-Grappe-SOS",
  "https://www.facebook.com/kelly-grappe-sos",
]);

export function facebookUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL?.trim();
  if (!raw) return DEFAULT_SOCIAL_FACEBOOK_URL;
  const normalized = raw.replace(/\/$/, "");
  if (RETIRED_SOCIAL_FACEBOOK_URLS.has(normalized)) return DEFAULT_SOCIAL_FACEBOOK_URL;
  return raw;
}

export function fromTheRoadFacebookUrl(): string {
  const raw = process.env.NEXT_PUBLIC_FTR_FACEBOOK_PAGE_URL?.trim();
  if (raw) {
    const normalized = raw.replace(/\/$/, "");
    if (!RETIRED_SOCIAL_FACEBOOK_URLS.has(normalized)) return raw;
  }
  return facebookUrl();
}

/** Page Plugin href — numeric New Pages IDs work more reliably than vanity slugs. */
export function facebookPagePluginHref(pageUrl: string): string {
  try {
    const u = new URL(pageUrl);
    const queryId = u.searchParams.get("id");
    if (queryId && /^\d{10,}$/.test(queryId)) return `https://www.facebook.com/${queryId}`;
    const pathId = u.pathname.match(/^\/(\d{10,})\/?$/);
    if (pathId) return `https://www.facebook.com/${pathId[1]}`;
    return pageUrl.replace(/\/$/, "");
  } catch {
    return pageUrl;
  }
}

export const DEFAULT_SOCIAL_INSTAGRAM_URL = "https://www.instagram.com/KellyGrappeSOS/";
export const DEFAULT_SOCIAL_YOUTUBE_URL = "https://www.youtube.com/@KellyGrappe";
export const DEFAULT_SOCIAL_TIKTOK_HANDLE = "kellygrappeforarsos";
export const DEFAULT_SOCIAL_TIKTOK_URL = `https://www.tiktok.com/@${DEFAULT_SOCIAL_TIKTOK_HANDLE}`;
const RETIRED_SOCIAL_TIKTOK_URLS = new Set([
  "https://www.tiktok.com/@kellygrappesos",
]);

function tiktokUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_URL?.trim();
  if (!raw) return DEFAULT_SOCIAL_TIKTOK_URL;
  const normalized = raw.replace(/\/$/, "").toLowerCase();
  if (RETIRED_SOCIAL_TIKTOK_URLS.has(normalized)) return DEFAULT_SOCIAL_TIKTOK_URL;
  return raw;
}

/**
 * Public footer / “find us” links. Override any URL with NEXT_PUBLIC_SOCIAL_* in `.env`.
 * Defaults use known campaign handles where available; fix in env if a platform URL changes.
 */
export function getPublicSocialLinks(): PublicSocialLink[] {
  const out: PublicSocialLink[] = [
    {
      id: "facebook",
      label: "Facebook",
      href: facebookUrl(),
    },
    {
      id: "instagram",
      label: "Instagram",
      href: envUrl("NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL", DEFAULT_SOCIAL_INSTAGRAM_URL),
    },
    {
      id: "x",
      label: "X (Twitter)",
      href: envUrl("NEXT_PUBLIC_SOCIAL_X_URL", "https://x.com/kellygrappesos"),
    },
    {
      id: "youtube",
      label: "YouTube",
      href: envUrl("NEXT_PUBLIC_SOCIAL_YOUTUBE_URL", DEFAULT_SOCIAL_YOUTUBE_URL),
    },
    {
      id: "substack",
      label: "Substack",
      href: getCampaignBlogUrl(),
    },
    {
      id: "tiktok",
      label: "TikTok",
      href: tiktokUrl(),
    },
    {
      id: "email",
      label: "Email",
      href: getContactMailto(),
    },
  ];
  return out.filter((l) => typeof l.href === "string" && l.href.trim().length > 1);
}
