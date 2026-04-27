import { resolvePublicDonateHref } from "@/config/external-campaign";

const DEFAULT_SITE_URL = "https://kgrappe.netlify.app";

/** Netlify sometimes stores host-only; Next/metadata requires a full URL (new URL() must parse). */
function normalizePublicSiteUrl(raw: string | undefined): string {
  const trimmed = (raw ?? DEFAULT_SITE_URL).trim().replace(/\/$/, "");
  if (!trimmed) return DEFAULT_SITE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const siteConfig = {
  name: "Kelly Grappe for Arkansas Secretary of State",
  shortName: "Kelly Grappe",
  /** Brand position — headline-ready */
  brandLine: "The People Rule.",
  latinMotto: "Regnat Populus",
  tagline: "The People Rule. · Arkansas",
  description:
    "Kelly Grappe is running to serve every Arkansan as Secretary of State: fair elections, ballot access you can understand, and a front office that works for all 75 counties—not just the loudest voices.",
  /** Strip trailing slash; set NEXT_PUBLIC_SITE_URL in Netlify for accurate OG URLs. May be host-only (we prepend https://). Use `https://kgrappe.netlify.app` — not `www.…` (Netlify’s cert does not cover www on *.netlify.app). */
  url: normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  /**
   * Fundraising — defaults to GoodChange URL used on www.kellygrappe.com.
   * Override with NEXT_PUBLIC_DONATE_EXTERNAL_URL. Internal `/donate` page still explains the redirect.
   */
  donateHref: resolvePublicDonateHref(),
  /** Optional MP4/WebM background for hero (full URL). */
  heroVideoSrc: process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() || "",
  /** Optional YouTube embed URL (https://www.youtube.com/embed/...) for featured video block */
  featureVideoEmbedUrl: process.env.NEXT_PUBLIC_FEATURE_VIDEO_EMBED_URL?.trim() || "",
  /**
   * Sister app: county coordination hub (Pope-first portal, 75-county index). Separate Netlify deploy.
   * Set in env for footer / county-briefings hub; empty = show copy-only (no dead link).
   */
  countyWorkbenchUrl: (process.env.NEXT_PUBLIC_COUNTY_WORKBENCH_URL ?? "").replace(/\/$/, ""),
};
