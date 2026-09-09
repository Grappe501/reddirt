import type {
  DecisionSimulationActorModel,
  DecisionSimulationActorVariation,
} from "./actor-model";
import type { AlternativeFutureAssignment } from "./alternative-futures/contracts";
import { formatAlternativeFuturePrompt } from "./alternative-futures/prompt";
import { legislativePlausibilityNotes } from "./alternative-futures/legislative-plausibility";
import { formatLegislativePromptPacket } from "./vote-intelligence/prompt-packet";
import { formatWritingIntelligencePromptPacket } from "./writing-intelligence/prompt-packet";

export interface DecisionSimulationActorContext {
  model: DecisionSimulationActorModel;
  variation?: DecisionSimulationActorVariation;
  future?: AlternativeFutureAssignment;
  openingMessage?: string;
}

function compact(items: string[]): string {
  return items.length ? items.join("; ") : "None supplied";
}

function weighted(items: Array<{ label: string; weight: number; confidence: string; sourceState: string }>): string {
  if (!items.length) return "None supplied";
  return items
    .map((item) => `${item.label} [weight=${item.weight}; confidence=${item.confidence}; source=${item.sourceState}]`)
    .join("; ");
}

function tendencies(items: Array<{ label: string; probabilityWeight: number; confidence: string; sourceState: string; trigger?: string }>): string {
  if (!items.length) return "None supplied";
  return items
    .map((item) => `${item.label} [weight=${item.probabilityWeight}; confidence=${item.confidence}; source=${item.sourceState}${item.trigger ? `; trigger=${item.trigger}` : ""}]`)
    .join("; ");
}

export function buildActorContextForPrompt(
  model: DecisionSimulationActorModel,
  variation?: DecisionSimulationActorVariation,
  extras?: { future?: AlternativeFutureAssignment; openingMessage?: string },
): string {
  return buildActorModelPromptContext({ model, variation, ...extras });
}

export function buildActorModelPromptContext(context?: DecisionSimulationActorContext): string {
  if (!context) return "ACTOR MODEL: Not supplied.";
  const { model, variation, future, openingMessage } = context;
  const writingPacket = formatWritingIntelligencePromptPacket(model.actorId);
  const legislativePacket = formatLegislativePromptPacket(model.actorId);
  const futurePacket = future ? formatAlternativeFuturePrompt(future) : "";
  const plausibility = future
    ? legislativePlausibilityNotes(model.actorId, openingMessage ?? "", future.futureId).join(" ")
    : "";

  return [
    "ACTOR MODEL",
    `Actor: ${model.actorName}`,
    `Version: ${model.version}`,
    `Effective at: ${model.effectiveAt}`,
    `Description: ${model.description ?? "Not supplied"}`,
    `Primary incentives: ${compact(model.primaryIncentives)}`,
    `Strategic constraints: ${compact(model.strategicConstraints)}`,
    `Preferred frames: ${weighted(model.preferredFrames)}`,
    `Attack lanes: ${weighted(model.attackLanes)}`,
    `Defensive frames: ${weighted(model.defensiveFrames)}`,
    `Escalation tendencies: ${tendencies(model.escalationTendencies)}`,
    `Deescalation tendencies: ${tendencies(model.deescalationTendencies)}`,
    `Communication style: ${compact(model.communicationStyle)}`,
    `Likely audiences: ${compact(model.likelyAudiences)}`,
    `Uncertainty notes: ${compact(model.uncertaintyNotes)}`,
    variation
      ? `ENSEMBLE VARIATION: run=${variation.runOrdinal}; primaryFrame=${variation.selectedPrimaryFrame ?? "none"}; attackLane=${variation.selectedAttackLane ?? "none"}; escalation=${variation.selectedEscalationTendency ?? "none"}; aggressiveness=${variation.aggressiveness}; novelty=${variation.novelty}; confidenceModifier=${variation.modelConfidenceModifier}`
      : "ENSEMBLE VARIATION: Not supplied.",
    "Treat OBSERVED signals as stronger than INFERRED signals, and INFERRED signals as stronger than HYPOTHESIS signals. A hypothesis is not a fact.",
    writingPacket,
    legislativePacket,
    futurePacket,
    plausibility,
  ]
    .filter(Boolean)
    .join("\n");
}
