/**
 * Public campaign touchpoints — defaults mirror www.kellygrappe.com (Squarespace) as of build.
 * Override with NEXT_PUBLIC_* in .env when URLs change.
 */

const LEGACY_SITE = "https://www.kellygrappe.com";
/** GoodChange — donate CTA used on the public Squarespace site */
const DONATE_GOODCHANGE = "https://goodchange.app/donate/commi-h8";
const CAMPAIGN_BLOG = "https://kellygrappesos.substack.com";

export function getLegacyPublicSiteUrl(): string {
  return process.env.NEXT_PUBLIC_LEGACY_SITE_URL?.trim().replace(/\/$/, "") || LEGACY_SITE;
}

/** On-site volunteer intake (`VolunteerForm` on get-involved). */
export const VOLUNTEER_SIGNUP_HREF = "/get-involved#volunteer" as const;

export function getVolunteerSignupHref(): string {
  const o = process.env.NEXT_PUBLIC_VOLUNTEER_SIGNUP_URL?.trim();
  if (o) return o;
  return VOLUNTEER_SIGNUP_HREF;
}

/**
 * “Join the campaign” / primary volunteer CTA.
 * Defaults to the on-site volunteer form; set `NEXT_PUBLIC_JOIN_CAMPAIGN_URL` to use an external page instead.
 */
export function getJoinCampaignHref(): string {
  const o = process.env.NEXT_PUBLIC_JOIN_CAMPAIGN_URL?.trim().replace(/\/$/, "");
  if (o) return o;
  return getVolunteerSignupHref();
}

export function getCampaignBlogUrl(): string {
  return process.env.NEXT_PUBLIC_CAMPAIGN_BLOG_URL?.trim().replace(/\/$/, "") || CAMPAIGN_BLOG;
}

export function getContactMailto(): string {
  const raw = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (!raw) return "mailto:kelly@kellygrappe.com";
  if (raw.startsWith("mailto:")) return raw;
  return `mailto:${raw.replace(/^mailto:/i, "")}`;
}

/** Donate: env override, else GoodChange default from legacy site. */
export function resolvePublicDonateHref(): string {
  const ext = process.env.NEXT_PUBLIC_DONATE_EXTERNAL_URL?.trim().replace(/\/$/, "");
  if (ext) return ext;
  return DONATE_GOODCHANGE;
}
