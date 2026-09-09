import type { DecisionSimulationActorModel } from "./actor-model";
import type { DecisionSimulationOpeningInput } from "./contracts";

export function buildGenericActorModel(input: DecisionSimulationOpeningInput): DecisionSimulationActorModel {
  const actorName = input.counterpartyActor?.name?.trim() || "Counterparty";
  return {
    actorName,
    version: "dashboard-generic-actor-1.0",
    effectiveAt: new Date().toISOString(),
    description:
      input.counterpartyActor?.description ||
      "Generic counterparty model created from dashboard input. Treat all behavioral details as hypotheses unless supported by supplied evidence.",
    primaryIncentives: [
      "Protect credibility",
      "Advance strategic objectives",
      "Avoid unnecessary political or reputational damage",
    ],
    strategicConstraints: ["Public scrutiny", "Incomplete information", "Need to maintain message discipline"],
    preferredFrames: [
      { label: "Defend current position", weight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Reframe the issue", weight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Question the operator's premise", weight: 0.8, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    attackLanes: [
      { label: "Credibility", weight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Motivation", weight: 0.8, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Record or consistency", weight: 0.8, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    defensiveFrames: [
      { label: "Stay on message", weight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Shift to favorable terrain", weight: 0.8, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    escalationTendencies: [
      { label: "Measured counter", probabilityWeight: 1, confidence: "LOW", sourceState: "HYPOTHESIS" },
      { label: "Aggressive counter", probabilityWeight: 0.6, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    deescalationTendencies: [
      { label: "Ignore or deprioritize", probabilityWeight: 0.4, confidence: "LOW", sourceState: "HYPOTHESIS" },
    ],
    communicationStyle: ["Adaptive", "Message disciplined"],
    likelyAudiences: ["General public", "Supporters", "Media"],
    uncertaintyNotes: ["No researched actor profile was supplied; this is a generic hypothesis model."],
  };
}
