export const DECISION_SIMULATION_DOCTRINE_VERSION = "1.0" as const;

export const DECISION_SIMULATION_DOCTRINE = {
  name: "RedDirt Decision Simulation Engine",
  version: DECISION_SIMULATION_DOCTRINE_VERSION,
  advisoryOnly: true,
  autonomousSendEnabled: false,
  autonomousPostingEnabled: false,
  storesHiddenChainOfThought: false,
  principles: [
    "Forecasts are scenarios, not facts.",
    "Multiple plausible futures should be modeled when uncertainty is material.",
    "Assumptions must be visible.",
    "Evidence must remain distinguishable from inference.",
    "Actor models are versioned and evidence-backed where possible.",
    "Observed outcomes may be compared against predictions.",
    "The operator retains final authority over every recommendation.",
    "The simulation engine never sends correspondence or publishes content autonomously.",
  ] as const,
  requiredMoveCountAfterOpening: 6,
  totalCanonicalNodeCount: 7,
} as const;

export const DECISION_SIMULATION_SEQUENCE = [
  { moveNumber: 0, side: "OPERATOR", kind: "OPENING" },
  { moveNumber: 1, side: "COUNTERPARTY", kind: "PREDICTED_RESPONSE" },
  { moveNumber: 2, side: "OPERATOR", kind: "RECOMMENDED_RESPONSE" },
  { moveNumber: 3, side: "COUNTERPARTY", kind: "PREDICTED_RESPONSE" },
  { moveNumber: 4, side: "OPERATOR", kind: "RECOMMENDED_RESPONSE" },
  { moveNumber: 5, side: "COUNTERPARTY", kind: "PREDICTED_RESPONSE" },
  { moveNumber: 6, side: "OPERATOR", kind: "RECOMMENDED_RESPONSE" },
] as const;
