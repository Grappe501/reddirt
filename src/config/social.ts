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

/**
 * Public Kelly Grappe SOS Facebook page.
 * Share link is the click-through Steve uses; numeric ID is what Facebook’s Page Plugin embeds.
 */
export const DEFAULT_SOCIAL_FACEBOOK_PAGE_ID = "61582696603861";
export const DEFAULT_SOCIAL_FACEBOOK_SHARE_URL = "https://www.facebook.com/share/1Nor8fqtmT/";
export const DEFAULT_SOCIAL_FACEBOOK_URL = DEFAULT_SOCIAL_FACEBOOK_SHARE_URL;
const RETIRED_SOCIAL_FACEBOOK_URLS = new Set([
  "https://www.facebook.com/Kelly-Grappe-SOS",
  "https://www.facebook.com/kelly-grappe-sos",
]);

function stripFacebookTracking(raw: string): string {
  try {
    const u = new URL(raw);
    u.searchParams.delete("mibextid");
    u.hash = "";
    return u.toString();
  } catch {
    return raw;
  }
}

/** True when the URL is this campaign page (share shortlink, people path, or numeric id). */
export function isKellyFacebookPageUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.hostname.replace(/^www\./, "") !== "facebook.com") return false;
    if (/^\/share\/1Nor8fqtmT\/?$/i.test(u.pathname)) return true;
    if (u.searchParams.get("id") === DEFAULT_SOCIAL_FACEBOOK_PAGE_ID) return true;
    if (u.pathname === `/${DEFAULT_SOCIAL_FACEBOOK_PAGE_ID}` || u.pathname === `/${DEFAULT_SOCIAL_FACEBOOK_PAGE_ID}/`) {
      return true;
    }
    return /^\/people\/Kelly-Grappe-SOS\/61582696603861\/?$/i.test(u.pathname);
  } catch {
    return false;
  }
}

function resolvePublicFacebookUrl(raw: string | undefined): string {
  if (!raw) return DEFAULT_SOCIAL_FACEBOOK_URL;
  const cleaned = stripFacebookTracking(raw).replace(/\/$/, "");
  if (RETIRED_SOCIAL_FACEBOOK_URLS.has(cleaned)) return DEFAULT_SOCIAL_FACEBOOK_URL;
  if (isKellyFacebookPageUrl(raw) || isKellyFacebookPageUrl(cleaned)) return DEFAULT_SOCIAL_FACEBOOK_URL;
  return raw;
}

export function facebookUrl(): string {
  return resolvePublicFacebookUrl(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL?.trim());
}

export function fromTheRoadFacebookUrl(): string {
  const raw = process.env.NEXT_PUBLIC_FTR_FACEBOOK_PAGE_URL?.trim();
  if (!raw) return facebookUrl();
  return resolvePublicFacebookUrl(raw);
}

/** Human-openable New Page profile (share shortlinks and the Page Plugin often fail). */
export function facebookPageProfileUrl(): string {
  return `https://www.facebook.com/people/Kelly-Grappe-SOS/${DEFAULT_SOCIAL_FACEBOOK_PAGE_ID}/`;
}

/** Page Plugin href — numeric New Pages IDs work; share shortlinks do not embed. */
export function facebookPagePluginHref(pageUrl: string): string {
  if (isKellyFacebookPageUrl(pageUrl) || pageUrl.includes("1Nor8fqtmT")) {
    return `https://www.facebook.com/${DEFAULT_SOCIAL_FACEBOOK_PAGE_ID}`;
  }
  try {
    const u = new URL(pageUrl);
    const queryId = u.searchParams.get("id");
    if (queryId && /^\d{10,}$/.test(queryId)) return `https://www.facebook.com/${queryId}`;
    const peopleId = u.pathname.match(/^\/people\/[^/]+\/(\d{10,})\/?$/i);
    if (peopleId) return `https://www.facebook.com/${peopleId[1]}`;
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
