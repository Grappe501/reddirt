import type { CampaignLearningSnapshot } from "@/lib/campaign-events/hot-wash-intelligence/load-campaign-learning-snapshot";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";

export type LearningIntelligenceV2 = {
  eventSuccessScore: number;
  turnoutQuality: "strong" | "mixed" | "weak" | "unknown";
  persuasionIndicators: string[];
  coalitionIndicators: string[];
  organizerEffectivenessNotes: string[];
  volunteerReliabilityNotes: string[];
  audienceEnergyScore: number;
  followUpRecommendations: string[];
  recurringSupporterSignals: string[];
  eventPatterns: string[];
};

export function buildCampaignLearningLoopIntelligence(
  learning: CampaignLearningSnapshot | null,
  snapshot?: CampaignEventsDashboardSnapshot | null,
): LearningIntelligenceV2 {
  const blueprints = learning?.blueprintCount ?? 0;
  const counties = learning?.countyCount ?? 0;
  const signals = (learning?.volunteerSignals ?? 0) + (learning?.donorSignals ?? 0);

  const eventSuccessScore = Math.min(100, 40 + blueprints * 8 + signals * 3);
  const turnoutQuality: LearningIntelligenceV2["turnoutQuality"] =
    blueprints >= 3 ? "strong" : blueprints >= 1 ? "mixed" : "unknown";

  const persuasionIndicators: string[] = [];
  if (counties >= 2) persuasionIndicators.push("Multi-county memory — compare messaging by geography");
  if (signals > 0) persuasionIndicators.push("Recent hot wash signals available for briefings");

  const coalitionIndicators: string[] = [];
  if ((snapshot?.needsIntakeReviewCount ?? 0) > 0) {
    coalitionIndicators.push("Website intake queue — potential coalition/host leads awaiting review");
  }

  const followUpRecommendations: string[] = [];
  if (blueprints < 2) followUpRecommendations.push("Complete hot wash on high-attendance events to build blueprint library");
  if (counties < 3) followUpRecommendations.push("Enrich county memory after each approved event");

  return {
    eventSuccessScore,
    turnoutQuality,
    persuasionIndicators,
    coalitionIndicators,
    organizerEffectivenessNotes: signals ? ["Review media approval queue for organizer-upload quality"] : [],
    volunteerReliabilityNotes: [],
    audienceEnergyScore: Math.min(100, 50 + signals * 5),
    followUpRecommendations,
    recurringSupporterSignals: blueprints > 0 ? ["Blueprint library suggests repeatable event formats"] : [],
    eventPatterns: [
      `${blueprints} blueprint(s)`,
      `${counties} county memory file(s)`,
      snapshot ? `${snapshot.officialCount} official / ${snapshot.tentativeCount} tentative events` : "snapshot n/a",
    ],
  };
}
