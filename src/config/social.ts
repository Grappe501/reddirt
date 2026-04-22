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
export const DEFAULT_SOCIAL_FACEBOOK_URL = "https://www.facebook.com/Kelly-Grappe-SOS";
export const DEFAULT_SOCIAL_INSTAGRAM_URL = "https://www.instagram.com/KellyGrappeSOS/";

/**
 * Public footer / “find us” links. Override any URL with NEXT_PUBLIC_SOCIAL_* in `.env`.
 * Defaults use known campaign handles where available; fix in env if a platform URL changes.
 */
export function getPublicSocialLinks(): PublicSocialLink[] {
  return [
    {
      id: "facebook",
      label: "Facebook",
      href: envUrl("NEXT_PUBLIC_SOCIAL_FACEBOOK_URL", DEFAULT_SOCIAL_FACEBOOK_URL),
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
      href: envUrl("NEXT_PUBLIC_SOCIAL_YOUTUBE_URL", "https://www.youtube.com/@kellygrappesos"),
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
}
