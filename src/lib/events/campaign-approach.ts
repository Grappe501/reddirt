import type { ArchiveReason, CampaignApproach, EventItem } from "@/content/types";
import type { KellyCampaignStop } from "@/data/kelly-county-visits/types";

export type CampaignApproachDecision = {
  approach: CampaignApproach;
  reason?: ArchiveReason;
  note: string;
  ledgerIds?: string[];
};

/** First Steve pass — numbered against the 2026-09-06 upcoming list. */
export const CAMPAIGN_APPROACH_BY_SLUG: Record<string, CampaignApproachDecision> = {
  "washington-county-labor-event-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Remove completely.",
    ledgerIds: ["manual-2026-09-07-washington-county-labor-event"],
  },
  "howard-county-nashville-sep-8-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-08-howard-county-nashville"],
  },
  "aac-county-clerks-fall-meeting-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-09-aac-county-clerks"],
  },
  "sherwood-chamber-military-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-10-sherwood-chamber-military"],
  },
  "ame-west-conference-magnolia-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-10-ame-west-conference"],
  },
  "lafayette-county-sep-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Redundant.",
    ledgerIds: ["manual-2026-09-11-lafayette-county"],
  },
  "sharp-county-hq-highland-2026": {
    approach: "archive",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-09-11-sharp-county-hq-highland"],
  },
  "dallas-county-fair-fordyce-2026-09-11": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-11-fordyce-dallas-county-fair-6pm"],
  },
  "conway-county-fair-2026-09-12": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["locked-2026-09-12-conway-county-fair"],
  },
  "harrison-hot-air-balloon-festival-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-12-harrison-hot-air-balloon-festival"],
  },
  "baxter-county-candidate-forum-2026-09-14": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-14-mt-home-candidate-forum"],
  },
  "dunbar-gardens-garden-party-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-15-garden-party-dunbar"],
  },
  "pope-county-fair-russellville-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Redundant with Dreami Tea / Count Me In the same week.",
    ledgerIds: ["locked-2026-09-15-pope-county-fair"],
  },
  "rogers-roundabout-crew-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-16-rogers-roundabout-crew"],
  },
  "karaoke-sep-16-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-16-karaoke"],
  },
  "camden-meet-the-candidates-forum-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-17-camden-meet-the-candidates"],
  },
  "calhoun-county-fair-2026-09-18": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-18-calhoun-county-fair-evening"],
  },
  "baxter-fair-sep-18-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-18-baxter-fair"],
  },
  "cynthia-nations-fundraiser-sept-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-18-cynthia-nations-fundraiser"],
  },
  "little-rock-comic-con-2026-09-19": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["locked-2026-09-18-arkansas-comic-con"],
  },
  "klek-jonesboro-candidate-interview-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-19-klek-jonesboro-interview"],
  },
  "rally-for-hallie-jonesboro-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-19-rally-for-hallie-jonesboro"],
  },
  "arkadelphia-sep-20-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Redundant with the Clark County Multi-Church Tour.",
    ledgerIds: ["manual-2026-09-20-arkadelphia"],
  },
};

export function campaignApproachForSlug(slug: string): CampaignApproachDecision | undefined {
  return CAMPAIGN_APPROACH_BY_SLUG[slug];
}

const DATE_LOCKS: Record<string, { startsAt: string; endsAt: string }> = {
  "grassroots-guitar-strings-2026": {
    startsAt: "2026-09-17T18:30:00",
    endsAt: "2026-09-17T21:30:00",
  },
};

export function applyCampaignApproach(event: EventItem): EventItem {
  const locked = DATE_LOCKS[event.slug];
  const next = locked ? { ...event, startsAt: locked.startsAt, endsAt: locked.endsAt } : event;
  const decision = CAMPAIGN_APPROACH_BY_SLUG[next.slug];
  if (!decision) return next;
  if (decision.approach === "removed") {
    return {
      ...next,
      campaignApproach: "removed",
      archiveReason: decision.reason,
      fieldAttendance: "unscheduled",
      organizerNote: `${next.organizerNote}\n\nSteve pass 2026-09-07: removed from the public calendar. ${decision.note}`,
    };
  }
  if (decision.approach === "archive") {
    return {
      ...next,
      campaignApproach: "archive",
      archiveReason: decision.reason,
      fieldAttendance: "unscheduled",
      organizerNote: `${next.organizerNote}\n\nSteve pass 2026-09-07: archived. ${decision.note}`,
    };
  }
  return { ...next, campaignApproach: decision.approach };
}

export function isPublicCalendarEvent(event: EventItem): boolean {
  if (event.campaignApproach === "removed" || event.campaignApproach === "archive") return false;
  if (event.fieldAttendance === "suggested" || event.fieldAttendance === "unscheduled") return false;
  return true;
}

export function hideLedgerRowsForCampaignApproach(rows: KellyCampaignStop[]): KellyCampaignStop[] {
  const hide = new Set<string>();
  for (const decision of Object.values(CAMPAIGN_APPROACH_BY_SLUG)) {
    for (const id of decision.ledgerIds ?? []) hide.add(id);
  }
  return rows.map((row) => (hide.has(row.id) ? { ...row, includeOnPublicPage: false } : row));
}
