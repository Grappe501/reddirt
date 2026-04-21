import { resolvePublicDonateHref } from "@/config/external-campaign";

export const siteConfig = {
  name: "Kelly Grappe for Arkansas Secretary of State",
  shortName: "Kelly Grappe",
  /** Brand position — headline-ready */
  brandLine: "The People Rule.",
  latinMotto: "Regnat Populus",
  tagline: "The People Rule. · Arkansas",
  description:
    "Kelly Grappe is running to serve every Arkansan as Secretary of State: fair elections, ballot access you can understand, and a front office that works for all 75 counties—not just the loudest voices.",
  /** Strip trailing slash; set NEXT_PUBLIC_SITE_URL in deploy for accurate OG URLs. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kellygrappe.com").replace(/\/$/, ""),
  /**
   * Fundraising — defaults to GoodChange URL used on www.kellygrappe.com.
   * Override with NEXT_PUBLIC_DONATE_EXTERNAL_URL. Internal `/donate` page still explains the redirect.
   */
  donateHref: resolvePublicDonateHref(),
  /** Optional MP4/WebM background for hero (full URL). */
  heroVideoSrc: process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() || "",
  /** Optional YouTube embed URL (https://www.youtube.com/embed/...) for featured video block */
  featureVideoEmbedUrl: process.env.NEXT_PUBLIC_FEATURE_VIDEO_EMBED_URL?.trim() || "",
};
