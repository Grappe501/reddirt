import type { CampaignContact } from "@/lib/campaign-events/communications/communications-types";
import type { RelationshipKind } from "./relationship-graph-types";

export function mapContactRoleToKinds(tags: CampaignContact["roleTags"]): RelationshipKind[] {
  const kinds: RelationshipKind[] = [];
  if (tags.includes("volunteer")) kinds.push("volunteer");
  if (tags.includes("host")) kinds.push("host");
  if (tags.includes("county_lead")) kinds.push("county_leader");
  if (tags.includes("donor_prospect")) kinds.push("donor_supporter");
  if (tags.includes("campaign_team") || tags.includes("candidate")) kinds.push("campaign_team");
  if (!kinds.length) kinds.push("general");
  return kinds;
}

export function scoreContactEngagement(input: {
  contact: CampaignContact;
  sendCount: number;
  daysSinceTouch?: number;
}): number {
  let score = 40;
  if (input.contact.suppressed) return 0;
  if (input.contact.consent === "explicit") score += 15;
  if (input.contact.consent === "implied_event") score += 8;
  if (input.contact.notes?.trim()) score += 5;
  if (input.sendCount > 0) score += Math.min(20, input.sendCount * 4);
  if (input.contact.eventRecordId) score += 10;
  if (input.daysSinceTouch != null) {
    if (input.daysSinceTouch > 90) score -= 25;
    else if (input.daysSinceTouch > 45) score -= 12;
    else if (input.daysSinceTouch < 14) score += 8;
  }
  return Math.max(0, Math.min(100, score));
}

export function scoreBurnoutRisk(input: {
  kinds: RelationshipKind[];
  engagementScore: number;
  sendCount: number;
}): "low" | "medium" | "high" {
  if (input.kinds.includes("volunteer") && input.sendCount >= 4 && input.engagementScore < 50) {
    return "high";
  }
  if (input.sendCount >= 6) return "medium";
  return "low";
}
