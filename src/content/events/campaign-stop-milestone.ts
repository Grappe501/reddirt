/**
 * Public campaign-stop total. Reads the live visit ledger so the homepage
 * and /events no longer freeze on a hand-locked number (was 227 as of Aug 18).
 */
import { getVisitSummary } from "@/data/kelly-county-visits";

const MILESTONE_AS_OF_YMD = "2026-09-02";

export function getCampaignStopMilestone() {
  const summary = getVisitSummary();
  return {
    count: summary.totalPublicStopCount,
    completedCount: summary.completedStopCount,
    upcomingCount: summary.scheduledStopCount,
    asOfYmd: MILESTONE_AS_OF_YMD,
    asOfEventSlug: "arkansas-visits",
    asOfEventTitle: "Kelly Across Arkansas visit ledger",
  };
}

/** Same shape existing homepage / events cards already read. */
export const CAMPAIGN_STOP_MILESTONE = {
  get count() {
    return getCampaignStopMilestone().count;
  },
  get asOfYmd() {
    return MILESTONE_AS_OF_YMD;
  },
  get asOfEventSlug() {
    return "arkansas-visits";
  },
  get asOfEventTitle() {
    return getCampaignStopMilestone().asOfEventTitle;
  },
};

export function formatCampaignStopAsOfDate(ymd: string = MILESTONE_AS_OF_YMD): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

export function campaignStopMilestoneLine(): string {
  const m = getCampaignStopMilestone();
  return `${m.count} campaign stops as of ${formatCampaignStopAsOfDate()} (${m.completedCount} completed, ${m.upcomingCount} upcoming)`;
}

export function campaignStopMilestoneAsOfHref(): string {
  return "/arkansas-visits";
}
