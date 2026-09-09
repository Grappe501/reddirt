export const DECISION_SIMULATION_ACTOR_MODEL_VERSION = "actor-model-1.0" as const;

export type ActorModelConfidence = "LOW" | "MEDIUM" | "HIGH";
export type ActorModelSourceState = "OBSERVED" | "INFERRED" | "HYPOTHESIS";

export interface ActorModelWeightedFrame {
  label: string;
  weight: number;
  confidence: ActorModelConfidence;
  sourceState: ActorModelSourceState;
  notes?: string;
}

export interface ActorModelBehaviorTendency {
  label: string;
  probabilityWeight: number;
  confidence: ActorModelConfidence;
  sourceState: ActorModelSourceState;
  trigger?: string;
  notes?: string;
}

export interface DecisionSimulationActorModel {
  actorId?: string;
  actorName: string;
  version: string;
  effectiveAt: string;
  description?: string;
  primaryIncentives: string[];
  strategicConstraints: string[];
  preferredFrames: ActorModelWeightedFrame[];
  attackLanes: ActorModelWeightedFrame[];
  defensiveFrames: ActorModelWeightedFrame[];
  escalationTendencies: ActorModelBehaviorTendency[];
  deescalationTendencies: ActorModelBehaviorTendency[];
  communicationStyle: string[];
  likelyAudiences: string[];
  uncertaintyNotes: string[];
}

export interface DecisionSimulationActorVariation {
  runOrdinal: number;
  seed: number;
  selectedPrimaryFrame?: string;
  selectedAttackLane?: string;
  selectedEscalationTendency?: string;
  aggressiveness: number;
  novelty: number;
  modelConfidenceModifier: number;
}

function normalizeWeight(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function hash32(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function unit(seed: number, salt: number): number {
  let x = (seed + salt * 0x9e3779b9) >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967296;
}

function chooseWeighted<T extends { label: string; weight?: number; probabilityWeight?: number }>(
  values: T[],
  draw: number,
): T | undefined {
  if (values.length === 0) return undefined;
  const weights = values.map((value) => normalizeWeight(value.weight ?? value.probabilityWeight ?? 0));
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values[Math.min(values.length - 1, Math.floor(draw * values.length))];
  let cursor = draw * total;
  for (let i = 0; i < values.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return values[i];
  }
  return values[values.length - 1];
}

export function buildActorVariation(
  model: DecisionSimulationActorModel,
  runOrdinal: number,
  ensembleSeed = "decision-simulation",
): DecisionSimulationActorVariation {
  const seed = hash32(`${ensembleSeed}|${model.actorName}|${model.version}|${runOrdinal}`);
  const primaryFrame = chooseWeighted(model.preferredFrames, unit(seed, 1));
  const attackLane = chooseWeighted(model.attackLanes, unit(seed, 2));
  const escalation = chooseWeighted(model.escalationTendencies, unit(seed, 3));

  return {
    runOrdinal,
    seed,
    selectedPrimaryFrame: primaryFrame?.label,
    selectedAttackLane: attackLane?.label,
    selectedEscalationTendency: escalation?.label,
    aggressiveness: Number((0.2 + unit(seed, 4) * 0.75).toFixed(4)),
    novelty: Number((0.05 + unit(seed, 5) * 0.65).toFixed(4)),
    modelConfidenceModifier: Number((0.85 + unit(seed, 6) * 0.3).toFixed(4)),
  };
}

export function validateActorModel(model: DecisionSimulationActorModel): string[] {
  const errors: string[] = [];
  if (!model.actorName.trim()) errors.push("actorName is required");
  if (!model.version.trim()) errors.push("version is required");
  const weighted = [...model.preferredFrames, ...model.attackLanes, ...model.defensiveFrames];
  if (weighted.some((item) => !Number.isFinite(item.weight) || item.weight < 0)) {
    errors.push("frame weights must be finite and >= 0");
  }
  const tendencies = [...model.escalationTendencies, ...model.deescalationTendencies];
  if (tendencies.some((item) => !Number.isFinite(item.probabilityWeight) || item.probabilityWeight < 0)) {
    errors.push("behavior probability weights must be finite and >= 0");
  }
  return errors;
}
