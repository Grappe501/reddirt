import { identifyWeakCounties } from "@/lib/agents/county-intelligence/county-intelligence-engine";
import { buildCountyActionPackage } from "@/lib/agents/county-intelligence/county-action-package-builder";
import { adaptCountyMessaging, buildCountyIssueSummary } from "./writing-orchestration/county-message-adapter";

export type CountyCommunicationsBrief = {
  countySlug: string;
  countyName: string;
  issueSummary: string;
  messagingAngle: string;
  powerOfFiveLanguage: string;
  volunteerAsk: string;
  eventPromotionIdea: string;
  followUpPlan: string;
};

export function buildCountyCommunicationsBrief(countySlug: string): CountyCommunicationsBrief | null {
  const pkg = buildCountyActionPackage(countySlug, "county_growth");
  const adapted = adaptCountyMessaging(countySlug);
  if (!pkg || !adapted) return null;
  return {
    countySlug,
    countyName: pkg.countyName,
    issueSummary: buildCountyIssueSummary(countySlug),
    messagingAngle: adapted.angle,
    powerOfFiveLanguage: adapted.powerOfFiveAsk,
    volunteerAsk: adapted.volunteerAsk,
    eventPromotionIdea: pkg.eventRecommendation,
    followUpPlan: adapted.followUp,
  };
}

export function listCountyCommunicationsGaps(limit = 8): CountyCommunicationsBrief[] {
  return identifyWeakCounties(limit)
    .map((c) => buildCountyCommunicationsBrief(c.countySlug))
    .filter((b): b is CountyCommunicationsBrief => !!b);
}
