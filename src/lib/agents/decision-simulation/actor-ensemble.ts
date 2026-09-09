import type { DecisionSimulationActorModel, DecisionSimulationActorVariation } from "./actor-model";
import { buildActorVariation, validateActorModel } from "./actor-model";
import { isSupportedDecisionSimulationRunCount } from "./scale";

export interface DecisionSimulationActorEnsemblePlan {
  actorName: string;
  actorModelVersion: string;
  requestedRuns: number;
  ensembleSeed: string;
  variations: DecisionSimulationActorVariation[];
}

export function planActorEnsembleVariations(
  model: DecisionSimulationActorModel,
  requestedRuns: number,
  ensembleSeed = "decision-simulation",
): DecisionSimulationActorEnsemblePlan {
  const errors = validateActorModel(model);
  if (errors.length) throw new Error(`Invalid actor model: ${errors.join("; ")}`);
  if (!isSupportedDecisionSimulationRunCount(requestedRuns)) {
    throw new Error("requestedRuns must be an integer between 1 and 1,000,000");
  }

  return {
    actorName: model.actorName,
    actorModelVersion: model.version,
    requestedRuns,
    ensembleSeed,
    variations: Array.from({ length: requestedRuns }, (_, index) =>
      buildActorVariation(model, index + 1, ensembleSeed),
    ),
  };
}

export function summarizeActorVariationDiversity(plan: DecisionSimulationActorEnsemblePlan) {
  const count = (selector: (variation: DecisionSimulationActorVariation) => string | undefined) => {
    const result = new Map<string, number>();
    for (const variation of plan.variations) {
      const key = selector(variation) ?? "UNSET";
      result.set(key, (result.get(key) ?? 0) + 1);
    }
    return [...result.entries()]
      .map(([label, runs]) => ({ label, runs, share: runs / plan.requestedRuns }))
      .sort((a, b) => b.runs - a.runs);
  };

  return {
    primaryFrames: count((v) => v.selectedPrimaryFrame),
    attackLanes: count((v) => v.selectedAttackLane),
    escalationTendencies: count((v) => v.selectedEscalationTendency),
    meanAggressiveness:
      plan.variations.reduce((sum, v) => sum + v.aggressiveness, 0) / plan.requestedRuns,
    meanNovelty: plan.variations.reduce((sum, v) => sum + v.novelty, 0) / plan.requestedRuns,
  };
}
