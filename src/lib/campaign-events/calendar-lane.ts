import type { CampaignEventLedgerRecord } from "@prisma/client";
import type { CampaignEventLedgerCalendarStatus, CampaignEventLedgerEventStatus } from "@prisma/client";

/** Internal calendar lanes — Google IDs are placeholders until sync ships. */
export type CampaignCalendarLane = "tentative" | "official" | "personal_admin" | "imported_only";

export type CalendarLaneResolution = {
  sourceLane: CampaignCalendarLane;
  targetLane: CampaignCalendarLane;
  sourceLabel: string;
  targetLabel: string;
  promotionEligible: boolean;
  promotionBlockers: string[];
};

const LANE_LABELS: Record<CampaignCalendarLane, string> = {
  tentative: "Tentative calendar",
  official: "Official campaign calendar",
  personal_admin: "Personal / admin calendar",
  imported_only: "Imported only (not promoted)",
};

function laneFromCalendarStatus(status: CampaignEventLedgerCalendarStatus): CampaignCalendarLane {
  switch (status) {
    case "TENTATIVE_CALENDAR":
      return "tentative";
    case "OFFICIAL_CALENDAR":
      return "official";
    case "IMPORTED_ONLY":
    default:
      return "imported_only";
  }
}

function inferSourceLane(record: CampaignEventLedgerRecord): CampaignCalendarLane {
  if (record.entrySource === "WEBSITE_ENTRY" || record.calendarStatus === "TENTATIVE_CALENDAR") {
    return "tentative";
  }
  const name = (record.sourceCalendarName ?? "").toLowerCase();
  if (/personal|admin|private/i.test(name)) return "personal_admin";
  if (/tentative|hold|draft/i.test(name)) return "tentative";
  if (/official|public|campaign/i.test(name)) return "official";
  return laneFromCalendarStatus(record.calendarStatus);
}

function resolveTargetLane(
  source: CampaignCalendarLane,
  eventStatus: CampaignEventLedgerEventStatus,
): CampaignCalendarLane {
  if (eventStatus === "CANCELLED" || eventStatus === "TENTATIVE") return "tentative";
  if (source === "personal_admin") return "personal_admin";
  if (eventStatus === "CONFIRMED" || eventStatus === "COMPLETED") return "official";
  return source === "imported_only" ? "tentative" : source;
}

export function resolveCalendarLanes(record: CampaignEventLedgerRecord): CalendarLaneResolution {
  const sourceLane = inferSourceLane(record);
  const targetLane = resolveTargetLane(sourceLane, record.eventStatus);
  const promotionBlockers: string[] = [];

  if (record.reviewStatus === "NOT_STARTED" || record.reviewStatus === "IN_PROGRESS") {
    promotionBlockers.push("Review not complete");
  }
  if (record.eventStatus === "NEEDS_REVIEW" || record.eventStatus === "TENTATIVE") {
    promotionBlockers.push("Event status not confirmed");
  }
  if (sourceLane === "personal_admin") promotionBlockers.push("Personal/admin lane");
  if (record.googleSyncStatus === "NOT_LINKED") promotionBlockers.push("Google Calendar not linked (future)");

  const promotionEligible =
    targetLane === "official" &&
    sourceLane !== "personal_admin" &&
    promotionBlockers.filter((b) => !b.includes("Google")).length === 0;

  return {
    sourceLane,
    targetLane,
    sourceLabel: LANE_LABELS[sourceLane],
    targetLabel: LANE_LABELS[targetLane],
    promotionEligible,
    promotionBlockers,
  };
}

export function laneBadgeTone(lane: CampaignCalendarLane): "amber" | "green" | "neutral" | "slate" {
  switch (lane) {
    case "tentative":
      return "amber";
    case "official":
      return "green";
    case "personal_admin":
      return "slate";
    default:
      return "neutral";
  }
}
