/**
 * Candidate coverage model — not every event requires Kelly.
 */

import type { RuralClass } from "./rural-classification";

export type CampaignAssignee = "Kelly" | "Congressional" | "Senate" | "County Team";

export type RoutingFlags = {
  clerkOpportunity: boolean;
  mediaOpportunity: boolean;
  faithOpportunity: boolean;
  registrationFocus: boolean;
  gopConversionFocus: boolean;
  volunteerActivation: boolean;
  regionalTurnout: boolean;
};

export type AssignmentResult = {
  assignment: CampaignAssignee;
  reason: string;
};

export function detectRoutingFlags(input: {
  eventType: string;
  title: string;
  county: string;
  ruralClass: RuralClass;
  tags: string[];
  tier?: string;
  registrationGoal: number;
  maxReg: number;
  gopPotential: number;
  maxGop: number;
  faithIndex: number;
  cityInfluence: number;
  clerkMeetings: number;
}): RoutingFlags {
  const title = input.title.toLowerCase();
  const tags = input.tags.map((t) => t.toLowerCase());

  return {
    clerkOpportunity:
      input.eventType === "county_fair" ||
      title.includes("clerk") ||
      input.clerkMeetings > 0,
    mediaOpportunity:
      input.tier === "A" ||
      input.cityInfluence >= 8000 ||
      tags.includes("persuasion") ||
      input.ruralClass === "urban",
    faithOpportunity:
      input.eventType === "faith" ||
      title.includes("church") ||
      title.includes("faith") ||
      input.faithIndex >= 45,
    registrationFocus:
      input.registrationGoal / input.maxReg >= 0.35 ||
      tags.includes("students") ||
      input.eventType === "campus_event" ||
      input.ruralClass === "urban",
    gopConversionFocus: input.gopPotential / input.maxGop >= 0.4,
    volunteerActivation:
      tags.includes("volunteers") ||
      title.includes("aea") ||
      title.includes("retired") ||
      input.eventType === "aea_meeting",
    regionalTurnout:
      input.eventType === "county_fair" ||
      input.eventType === "festival" ||
      tags.includes("families"),
  };
}

export function assignCandidate(
  campaignImpactScore: number,
  flags: RoutingFlags,
  ruralClass: RuralClass,
): AssignmentResult {
  const kellySignals =
    (flags.clerkOpportunity ? 1 : 0) +
    (flags.mediaOpportunity ? 1 : 0) +
    (flags.faithOpportunity ? 1 : 0) +
    (flags.gopConversionFocus ? 1 : 0);

  if (
    campaignImpactScore >= 78 ||
    (campaignImpactScore >= 65 && kellySignals >= 2) ||
    (flags.clerkOpportunity && campaignImpactScore >= 55) ||
    (flags.mediaOpportunity && flags.gopConversionFocus && campaignImpactScore >= 60)
  ) {
    const reasons = [
      flags.clerkOpportunity && "clerk opportunity",
      flags.mediaOpportunity && "media market",
      flags.faithOpportunity && "faith engagement",
      flags.gopConversionFocus && "GOP conversion",
      campaignImpactScore >= 78 && "high VCI impact",
    ].filter(Boolean);
    return { assignment: "Kelly", reason: reasons.join(" · ") || "high campaign impact" };
  }

  if (
    ruralClass === "urban" &&
    flags.registrationFocus &&
    campaignImpactScore >= 48
  ) {
    return {
      assignment: "Congressional",
      reason: "dense urban county · registration focus · shared media market",
    };
  }

  if (
    (flags.regionalTurnout || flags.volunteerActivation) &&
    campaignImpactScore >= 42 &&
    ruralClass !== "urban"
  ) {
    return {
      assignment: "Senate",
      reason: flags.volunteerActivation
        ? "volunteer activation · regional turnout"
        : "regional turnout event",
    };
  }

  if (campaignImpactScore >= 35) {
    return {
      assignment: "County Team",
      reason: "visibility · relationship maintenance · local presence",
    };
  }

  return {
    assignment: "County Team",
    reason: "low-impact visibility · county team or digital follow-up",
  };
}
