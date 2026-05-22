import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import type { CampaignStrategicAssessment } from "./strategic-intelligence-engine";
import type { LearningIntelligenceV2 } from "./campaign-learning-loop-engine";

export type CampaignMemorySynthesis = {
  operatorMemoryLine: string;
  countyMemoryLine: string;
  campaignMemoryLine: string;
  strategicMemoryLine: string;
  workflowMemoryLine: string;
  eventMemoryLine: string;
  candidateStyleLine: string;
  communicationStyleLine: string;
  campaignInstinctLine: string;
};

export function synthesizeCampaignMemory(input: {
  tenantId: string;
  period: string;
  observations: UserObservationEntry[];
  strategic: CampaignStrategicAssessment;
  learning: LearningIntelligenceV2;
}): CampaignMemorySynthesis {
  const recent = input.observations.slice(-30);
  const followed = recent.filter((o) => o.event === "workflow_guidance_followed" || o.event === "agent_recommendation_followed").length;
  const ignored = recent.filter((o) => o.event === "workflow_guidance_ignored" || o.event === "agent_recommendation_ignored").length;
  const hotWash = recent.filter((o) => o.event === "hotwash_completed" || o.event === "county_memory_updated").length;

  return {
    operatorMemoryLine: `Operator accepted ${followed} guidance signals recently; ${ignored} dismissed (human-safe memory).`,
    countyMemoryLine: input.learning.eventPatterns.join(" · ") || "County memory building — complete hot wash per county.",
    campaignMemoryLine: `Tenant ${input.tenantId} · period ${input.period} · momentum ${input.strategic.momentumScore}.`,
    strategicMemoryLine: input.strategic.strategicGaps[0]?.title ?? "No open strategic gap recorded.",
    workflowMemoryLine: followed > ignored ? "Operator follows AI routing — keep briefings executive." : "Operator self-navigates — offer deeper detail on demand.",
    eventMemoryLine: `${input.learning.eventSuccessScore}/100 event success score from learning loop.`,
    candidateStyleLine: input.strategic.candidateOverloadRisk
      ? "Protect candidate bandwidth — fewer, higher-impact events."
      : "Candidate schedule sustainable — can pursue field intensity.",
    communicationStyleLine: "Authentic, local, press-forward (from tenant communication goals).",
    campaignInstinctLine: `Instinct: ${input.strategic.pacingHealth} pacing · ${input.strategic.scheduleSustainability} schedule · ${hotWash} recent learning signals.`,
  };
}
