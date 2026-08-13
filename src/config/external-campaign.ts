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

/** On-site “stay connected” form (`JoinMovementForm` on get-involved). */
export const STAY_CONNECTED_HREF = "/get-involved#join" as const;

/** On-site volunteer intake (`VolunteerForm` on get-involved) — public marketing canon. */
export const VOLUNTEER_SIGNUP_HREF = "/get-involved#volunteer" as const;

/**
 * Field Team onboarding UI (`/volunteer`) — linked only when we mean that product,
 * not the header/Final Action “Volunteer” CTA.
 */
export const FIELD_TEAM_ONBOARDING_HREF = "/volunteer" as const;

/**
 * Public “Volunteer” CTA — always the get-involved volunteer form unless an external
 * signup URL is set. Field Team onboarding stays at `/volunteer` (explicit links only).
 */
export function getVolunteerSignupHref(): string {
  const o = process.env.NEXT_PUBLIC_VOLUNTEER_SIGNUP_URL?.trim();
  if (o) return o;
  return VOLUNTEER_SIGNUP_HREF;
}

/**
 * “Join the campaign” / Stay connected — lightest step on the participation ladder.
 * Override with `NEXT_PUBLIC_JOIN_CAMPAIGN_URL` only for a true external join page.
 */
export function getJoinCampaignHref(): string {
  const o = process.env.NEXT_PUBLIC_JOIN_CAMPAIGN_URL?.trim().replace(/\/$/, "");
  if (o) return o;
  return STAY_CONNECTED_HREF;
}

/**
 * Content-hub “Join” cards: same override as `getJoinCampaignHref`, defaults to Stay connected
 * so they do not duplicate the volunteer `#volunteer` target.
 */
export function getContentHubJoinHref(): string {
  return getJoinCampaignHref();
}

/** Use `target="_blank"` + rel only for off-site (or `mailto:`) links — not same-site app routes. */
export function isOffSitePublicHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href.trim());
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

/**
 * Recurring Wednesday campaign prayer Zoom. Public join URL only.
 * Per-event `rsvpHref` wins; otherwise `NEXT_PUBLIC_CAMPAIGN_PRAYER_ZOOM_URL`.
 */
export function getCampaignPrayerZoomHref(eventRsvpHref?: string | null): string | null {
  const fromEvent = eventRsvpHref?.trim() ?? "";
  if (/^https?:\/\//i.test(fromEvent)) return fromEvent;
  const fromEnv = process.env.NEXT_PUBLIC_CAMPAIGN_PRAYER_ZOOM_URL?.trim() ?? "";
  if (/^https?:\/\//i.test(fromEnv)) return fromEnv;
  return null;
}

/** Donate: env override, else GoodChange default from legacy site. */
export function resolvePublicDonateHref(): string {
  const ext = process.env.NEXT_PUBLIC_DONATE_EXTERNAL_URL?.trim().replace(/\/$/, "");
  if (ext) return ext;
  return DONATE_GOODCHANGE;
}
