import {
  DECISION_SIMULATION_ACTOR_MODEL_VERSION,
  buildActorModelPromptContext,
  planActorEnsembleVariations,
  summarizeActorVariationDiversity,
  validateActorModel,
  type DecisionSimulationActorModel,
} from "../src/lib/agents/decision-simulation";

const model: DecisionSimulationActorModel = {
  actorName: "Test Counterparty",
  version: DECISION_SIMULATION_ACTOR_MODEL_VERSION,
  effectiveAt: "2026-09-08T00:00:00.000Z",
  description: "Synthetic test actor only.",
  primaryIncentives: ["protect standing", "control framing"],
  strategicConstraints: ["limited time", "public record"],
  preferredFrames: [
    { label: "local-control", weight: 0.65, confidence: "HIGH", sourceState: "OBSERVED" },
    { label: "outsider-attack", weight: 0.35, confidence: "MEDIUM", sourceState: "INFERRED" },
  ],
  attackLanes: [
    { label: "credibility", weight: 0.5, confidence: "HIGH", sourceState: "OBSERVED" },
    { label: "ideology", weight: 0.3, confidence: "MEDIUM", sourceState: "INFERRED" },
    { label: "novel-attack", weight: 0.2, confidence: "LOW", sourceState: "HYPOTHESIS" },
  ],
  defensiveFrames: [
    { label: "record-defense", weight: 1, confidence: "HIGH", sourceState: "OBSERVED" },
  ],
  escalationTendencies: [
    { label: "counterattack", probabilityWeight: 0.7, confidence: "HIGH", sourceState: "OBSERVED" },
    { label: "surrogate-response", probabilityWeight: 0.3, confidence: "MEDIUM", sourceState: "INFERRED" },
  ],
  deescalationTendencies: [
    { label: "ignore", probabilityWeight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
  ],
  communicationStyle: ["concise", "contrast-oriented"],
  likelyAudiences: ["supporters", "press"],
  uncertaintyNotes: ["No private information used."],
};

function main() {
  const errors = validateActorModel(model);
  const plan = planActorEnsembleVariations(model, 1000, "phase4-test-seed");
  const repeat = planActorEnsembleVariations(model, 1000, "phase4-test-seed");
  const summary = summarizeActorVariationDiversity(plan);
  const prompt = buildActorModelPromptContext({ model, variation: plan.variations[0] });

  const valid = errors.length === 0;
  const thousand = plan.variations.length === 1000;
  const deterministic = JSON.stringify(plan.variations.slice(0, 20)) === JSON.stringify(repeat.variations.slice(0, 20));
  const variedFrames = summary.primaryFrames.length >= 2;
  const variedAttacks = summary.attackLanes.length >= 3;
  const bounded = plan.variations.every((v) =>
    v.aggressiveness >= 0 && v.aggressiveness <= 1 &&
    v.novelty >= 0 && v.novelty <= 1 &&
    v.modelConfidenceModifier >= 0.5 && v.modelConfidenceModifier <= 1.5,
  );
  const sourceHierarchyPresent = prompt.includes("OBSERVED") && prompt.includes("INFERRED") && prompt.includes("HYPOTHESIS");
  const noPrivateClaim = prompt.includes("No private information used.");

  console.log("Decision Simulation Phase 4 actor-model checks");
  console.log("  actor model valid:", valid);
  console.log("  1,000 deterministic variations generated:", thousand && deterministic);
  console.log("  multiple primary frames represented:", variedFrames);
  console.log("  multiple attack lanes represented:", variedAttacks);
  console.log("  variation controls bounded:", bounded);
  console.log("  observed/inferred/hypothesis hierarchy surfaced:", sourceHierarchyPresent);
  console.log("  uncertainty notes surfaced:", noPrivateClaim);

  if (!(valid && thousand && deterministic && variedFrames && variedAttacks && bounded && sourceHierarchyPresent && noPrivateClaim)) {
    process.exit(1);
  }
  console.log("OK — Decision Simulation Phase 4 actor-model checks passed");
}

main();
