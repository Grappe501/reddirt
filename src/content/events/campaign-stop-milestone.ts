/**
 * Steve-locked running total of scheduled campaign stops (appearances).
 * This is not the 51/75 county map.
 *
 * Bump `count` and `asOfYmd` whenever a later confirmed stop is posted as completed
 * (or the as-of date moves). Increment `count` by the number of newly completed
 * confirmed trail stops since the previous as-of day.
 *
 * Last lock: Washington County Democrats meeting is scheduled stop 226.
 */
export const CAMPAIGN_STOP_MILESTONE = {
  count: 226,
  asOfYmd: "2026-08-17",
  asOfEventSlug: "washington-county-democrats-2026-08-17",
  asOfEventTitle: "Washington County Democrats meeting",
} as const;

export function formatCampaignStopAsOfDate(ymd: string = CAMPAIGN_STOP_MILESTONE.asOfYmd): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

export function campaignStopMilestoneLine(): string {
  return `${CAMPAIGN_STOP_MILESTONE.count} scheduled campaign stops as of ${formatCampaignStopAsOfDate()}`;
}

export function campaignStopMilestoneAsOfHref(): string {
  return `/events/${CAMPAIGN_STOP_MILESTONE.asOfEventSlug}`;
}
