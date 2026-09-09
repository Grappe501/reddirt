import type { DecisionSimulationConfidenceLabel } from "./contracts";

export const DECISION_SIMULATION_PROMPT_VERSION = "decision-simulation-openai-1.0" as const;
export const DECISION_SIMULATION_SCHEMA_VERSION = "decision-simulation-schema-1.0" as const;

export interface DecisionSimulationAiMove {
  moveNumber: 1 | 2 | 3 | 4 | 5 | 6;
  side: "COUNTERPARTY" | "OPERATOR";
  kind: "PREDICTED_RESPONSE" | "RECOMMENDED_RESPONSE";
  message: string;
  objective: string;
  predictedFrame: string;
  rationaleSummary: string;
  risks: string[];
  opportunities: string[];
  assumptions: string[];
  confidence: {
    label: Exclude<DecisionSimulationConfidenceLabel, "UNSET">;
    estimatedProbability: number;
    explanation: string;
  };
}

export interface DecisionSimulationAiPayload {
  executiveSummary: string;
  strongestRisk: string;
  strongestOpportunity: string;
  assumptions: string[];
  moves: DecisionSimulationAiMove[];
}

const stringArray = {
  type: "array",
  items: { type: "string" },
} as const;

const confidenceSchema = {
  type: "object",
  additionalProperties: false,
  required: ["label", "estimatedProbability", "explanation"],
  properties: {
    label: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
    estimatedProbability: { type: "number", minimum: 0, maximum: 1 },
    explanation: { type: "string" },
  },
} as const;

const moveSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "moveNumber",
    "side",
    "kind",
    "message",
    "objective",
    "predictedFrame",
    "rationaleSummary",
    "risks",
    "opportunities",
    "assumptions",
    "confidence",
  ],
  properties: {
    moveNumber: { type: "integer", minimum: 1, maximum: 6 },
    side: { type: "string", enum: ["COUNTERPARTY", "OPERATOR"] },
    kind: { type: "string", enum: ["PREDICTED_RESPONSE", "RECOMMENDED_RESPONSE"] },
    message: { type: "string" },
    objective: { type: "string" },
    predictedFrame: { type: "string" },
    rationaleSummary: { type: "string" },
    risks: stringArray,
    opportunities: stringArray,
    assumptions: stringArray,
    confidence: confidenceSchema,
  },
} as const;

export const DECISION_SIMULATION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["executiveSummary", "strongestRisk", "strongestOpportunity", "assumptions", "moves"],
  properties: {
    executiveSummary: { type: "string" },
    strongestRisk: { type: "string" },
    strongestOpportunity: { type: "string" },
    assumptions: stringArray,
    moves: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: moveSchema,
    },
  },
} as const;
