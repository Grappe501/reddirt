/**
 * Centralized external URLs for the volunteer platform and cross-links to the **live** campaign site
 * (www.kellygrappe.com) until the RedDirt app replaces it at relaunch.
 *
 * Swap values here (or use env overrides below) during launch; do not scatter hardcoded kellygrappe.com
 * strings across onboarding components.
 *
 * ---------------------------------------------------------------------------
 * Email automation (Google Workspace)
 * ---------------------------------------------------------------------------
 * Campaign email and automation are being implemented through Google Workspace.
 * Once live, volunteer signup should trigger:
 * - Welcome email
 * - Role-specific onboarding sequence
 * - Team-building guidance
 * - Resource library links (/volunteer/resources + /field-playbook)
 * - Follow-up reminders
 *
 * No automation is wired in this repo yet; signup CTAs point at the live form so flows stay compatible
 * until RedDirt owns the form. Role is passed as `?role=` on the signup URL for future automation/handlers.
 */

const DEFAULT_SITE = "https://www.kellygrappe.com";

/** Canonical public campaign site (legacy Squarespace until relaunch). */
export const CAMPAIGN_WEBSITE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CAMPAIGN_WEBSITE_URL?.trim()) || DEFAULT_SITE;

/**
 * Volunteer signup — live site until relaunch.
 *
 * TODO: Confirm this is the exact volunteer form URL/anchor Squarespace uses today; update if the live
 * site uses a dedicated form path instead of get-involved#volunteer.
 *
 * Override without code edits: `NEXT_PUBLIC_VOLUNTEER_SIGNUP_EXTERNAL`
 */
export const VOLUNTEER_SIGNUP_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_VOLUNTEER_SIGNUP_EXTERNAL?.trim()) ||
  `${CAMPAIGN_WEBSITE_URL.replace(/\/$/, "")}/get-involved#volunteer`;

export const DONATE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DONATE_EXTERNAL_URL?.trim()) ||
  "https://www.kellygrappe.com/donate";

export const CONTACT_URL = `${CAMPAIGN_WEBSITE_URL.replace(/\/$/, "")}/contact`;

export const GET_INVOLVED_URL = `${CAMPAIGN_WEBSITE_URL.replace(/\/$/, "")}/get-involved`;

/** mailto for “request a resource” and similar; align with public contact page. */
export const CAMPAIGN_CONTACT_EMAIL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()) || "kelly@kellygrappe.com";

export function getResourceRequestMailtoHref(): string {
  const to = CAMPAIGN_CONTACT_EMAIL.replace(/^mailto:/i, "");
  const subject = encodeURIComponent("Volunteer resource request");
  return `mailto:${to}?subject=${subject}`;
}

export function buildAskCampaignMailto(teamDisplayName: string, teamSlug: string): string {
  const to = CAMPAIGN_CONTACT_EMAIL.replace(/^mailto:/i, "");
  const subject = encodeURIComponent(`Field support · ${teamDisplayName}`);
  const body = encodeURIComponent(
    `Team: ${teamDisplayName}\nDashboard slug: ${teamSlug}\n\nWhat we need (question, event approval, messaging, placement, conflict, tech):\n\n`,
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

export function buildKellyStudentVisitRequestMailto(teamDisplayName: string, geography: string): string {
  const to = CAMPAIGN_CONTACT_EMAIL.replace(/^mailto:/i, "");
  const subject = encodeURIComponent(`Request Kelly visit · student event · ${teamDisplayName}`);
  const body = encodeURIComponent(
    `Team: ${teamDisplayName}\nGeography: ${geography}\n\nStudent / school event request:\n- Host student:\n- School / org:\n- Date / time options:\n- Expected attendance:\n- Public vs closed event:\n- Parking / accessibility:\n`,
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

/** Query values appended to VOLUNTEER_SIGNUP_URL for future form handlers / automation. */
export const VOLUNTEER_ROLE_QUERY = {
  events: "events",
  socialMedia: "social-media",
  powerOf5: "power-of-5",
  notSure: "not-sure",
} as const;

export type VolunteerSignupRoleQuery = (typeof VOLUNTEER_ROLE_QUERY)[keyof typeof VOLUNTEER_ROLE_QUERY];

/**
 * Append `role` before URL hash so Squarespace anchors stay valid:
 * `https://example.com/path?role=events#volunteer`
 */
export function buildVolunteerSignupUrl(role?: VolunteerSignupRoleQuery | null): string {
  const base = VOLUNTEER_SIGNUP_URL;
  if (!role) return base;
  const hashIdx = base.indexOf("#");
  const pathAndQuery = hashIdx >= 0 ? base.slice(0, hashIdx) : base;
  const hash = hashIdx >= 0 ? base.slice(hashIdx) : "";
  const sep = pathAndQuery.includes("?") ? "&" : "?";
  return `${pathAndQuery}${sep}role=${encodeURIComponent(role)}${hash}`;
}

/** Maps onboarding lane picker values to `role` query params on the live signup URL. */
export function resolveRoleQueryFromOnboardingLane(
  lane: "events" | "social" | "relational" | "unsure" | null,
): VolunteerSignupRoleQuery | null {
  if (!lane) return null;
  const m: Record<"events" | "social" | "relational" | "unsure", VolunteerSignupRoleQuery> = {
    events: VOLUNTEER_ROLE_QUERY.events,
    social: VOLUNTEER_ROLE_QUERY.socialMedia,
    relational: VOLUNTEER_ROLE_QUERY.powerOf5,
    unsure: VOLUNTEER_ROLE_QUERY.notSure,
  };
  return m[lane];
}
