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

/** Canonical Kelly Grappe SOS Facebook page (numeric id). Do not use kelly.grappe.sos. */
export const DEFAULT_SOCIAL_FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61582696603861";
export const DEFAULT_SOCIAL_INSTAGRAM_URL = "https://www.instagram.com/KellyGrappeSOS/";

/** Canonical Kelly Grappe SOS YouTube channel. */
export const DEFAULT_SOCIAL_YOUTUBE_CHANNEL_ID = "UCVjTINJvRs0dHea2StyAROg";
export const DEFAULT_SOCIAL_YOUTUBE_URL = `https://www.youtube.com/channel/${DEFAULT_SOCIAL_YOUTUBE_CHANNEL_ID}`;
/** YouTube “Uploads” playlist is UU + the rest of the UC channel id. */
export const DEFAULT_SOCIAL_YOUTUBE_UPLOADS_PLAYLIST_ID = `UU${DEFAULT_SOCIAL_YOUTUBE_CHANNEL_ID.slice(2)}`;

function isDeprecatedFacebookUrl(href: string): boolean {
  const lower = href.toLowerCase();
  return lower.includes("kelly.grappe.sos") || lower.includes("kelly-grappe-sos");
}

function isDeprecatedYoutubeUrl(href: string): boolean {
  const lower = href.toLowerCase();
  return lower.includes("@kellygrappesos") || /youtube\.com\/kellygrappesos\/?$/i.test(lower);
}

/** Footer, From the Road, and any public Facebook CTA. Ignores the old vanity URL if still in env. */
export function getPublicFacebookUrl(override?: string | null): string {
  for (const raw of [override, process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL]) {
    const candidate = raw?.trim();
    if (candidate && !isDeprecatedFacebookUrl(candidate)) return candidate;
  }
  return DEFAULT_SOCIAL_FACEBOOK_URL;
}

/** Footer and From the Road YouTube CTA. Ignores the old @kellygrappesos handle if still in env. */
export function getPublicYoutubeUrl(override?: string | null): string {
  for (const raw of [override, process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL]) {
    const candidate = raw?.trim();
    if (candidate && !isDeprecatedYoutubeUrl(candidate)) return candidate;
  }
  return DEFAULT_SOCIAL_YOUTUBE_URL;
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
      href: getPublicFacebookUrl(),
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
      href: getPublicYoutubeUrl(),
    },
    {
      id: "substack",
      label: "Substack",
      href: getCampaignBlogUrl(),
    },
    {
      id: "tiktok",
      label: "TikTok",
      href: envUrl("NEXT_PUBLIC_SOCIAL_TIKTOK_URL", "https://www.tiktok.com/@kellygrappesos"),
    },
    {
      id: "email",
      label: "Email",
      href: getContactMailto(),
    },
  ];
  return out.filter((l) => typeof l.href === "string" && l.href.trim().length > 1);
}
