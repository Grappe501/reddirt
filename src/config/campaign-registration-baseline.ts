/**
 * Single source of truth for the **campaign voter registration metrics baseline** date
 * (“new registrations since …”). County pages, `CountyVoterMetrics`, seed, and ETL should
 * align to this value.
 *
 * Configure with `CAMPAIGN_REGISTRATION_BASELINE` (YYYY-MM-DD or full ISO). Defaults to
 * `2025-11-25`. Public client components that need the label should receive it from a
 * server parent or use `NEXT_PUBLIC_CAMPAIGN_REGISTRATION_BASELINE` (same format) for
 * display-only copy—**metrics computation** must use the server env or this module on the
 * server.
 */

const DEFAULT_DATE = "2025-11-25";

function readRawServer(): string {
  return (process.env.CAMPAIGN_REGISTRATION_BASELINE ?? process.env.NEXT_PUBLIC_CAMPAIGN_REGISTRATION_BASELINE ?? DEFAULT_DATE).trim();
}

/** YYYY-MM-DD or any string `Date` can parse. Date-only is anchored at 06:00 UTC (matches prior Central alignment). */
export function getCampaignRegistrationBaselineRaw(): string {
  return readRawServer();
}

export function getCampaignRegistrationBaselineUtc(): Date {
  const raw = readRawServer();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T06:00:00.000Z`);
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    return new Date(`${DEFAULT_DATE}T06:00:00.000Z`);
  }
  return d;
}

export function getCampaignRegistrationBaselineDisplayCentral(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(getCampaignRegistrationBaselineUtc());
}

export function getCampaignRegistrationBaselineIsoDateOnly(): string {
  const d = getCampaignRegistrationBaselineUtc();
  return d.toISOString().slice(0, 10);
}
