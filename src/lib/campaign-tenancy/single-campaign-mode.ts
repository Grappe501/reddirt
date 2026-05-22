/** Kelly SOS is the primary single-campaign operating mode (Sprint 10.5 hardening). */

export const KELLY_SOS_TENANT_ID = "kelly-sos-2026";
export const KELLY_SOS_DISPLAY_NAME = "Kelly Grappe for SOS";
export const KELLY_CAMPAIGN_OS_TAGLINE = "Kelly Campaign OS — statewide Secretary of State operations";

/** Show multi-tenant switcher only when explicitly enabled (local dev). */
export function showDevTenancyUi(): boolean {
  return process.env.NEXT_PUBLIC_CAMPAIGN_OS_DEV_TENANCY === "true";
}

export function isKellySingleCampaignMode(tenantId?: string | null): boolean {
  return !tenantId || tenantId === KELLY_SOS_TENANT_ID;
}
