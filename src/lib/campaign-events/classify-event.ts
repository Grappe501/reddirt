import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { CampaignEventClassification } from "./types";

const HOUSE_MEET_GREET_PATTERNS = [
  /\bhouse\s+meet\b/i,
  /\bhouse\s+meeting\b/i,
  /\bhouse\s+party\b/i,
  /\bmeet\s*&\s*greet\b/i,
  /\bmeet\s+and\s+greet\b/i,
  /\bhouse\s+gathering\b/i,
  /\bbackyard\s+(bbq|barbecue)\b/i,
  /\bhost(ed)?\s+by\b/i,
  /\bsupporter\s+host\b/i,
];

export function classifyCampaignEvent(item: CampaignCalendarItem): {
  classification: CampaignEventClassification;
  label: string;
  reason: string;
} {
  if (item.eventType === "house_meet_greet") {
    return {
      classification: "house_meet_greet",
      label: "House Meet & Greet Party",
      reason: "Calendar event type is house_meet_greet.",
    };
  }

  const haystack = [item.title, item.notes, item.drillDown?.anchorClassification, item.drillDown?.host]
    .filter(Boolean)
    .join(" ");

  if (HOUSE_MEET_GREET_PATTERNS.some((re) => re.test(haystack))) {
    return {
      classification: "house_meet_greet",
      label: "House Meet & Greet Party",
      reason: "Title or notes match supporter-hosted gathering patterns.",
    };
  }

  const typeLabels: Record<string, string> = {
    county_party_meeting: "County party meeting",
    fair_festival: "Fair / festival",
    campaign_event: "Campaign event",
    community_event: "Community event",
    fundraiser: "Fundraiser",
    media: "Media",
    travel: "Travel",
    overnight: "Overnight",
    personal_admin: "Personal / admin",
    virtual_statewide: "Virtual / statewide",
  };

  return {
    classification: item.eventType,
    label: typeLabels[item.eventType] ?? "Needs classification",
    reason: `Imported calendar type: ${item.eventType}.`,
  };
}
