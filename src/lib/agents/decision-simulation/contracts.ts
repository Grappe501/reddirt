export type DecisionSimulationSide = "OPERATOR" | "COUNTERPARTY";

export type DecisionSimulationMoveKind =
  | "OPENING"
  | "PREDICTED_RESPONSE"
  | "RECOMMENDED_RESPONSE";

export type DecisionSimulationChannel =
  | "EMAIL"
  | "SOCIAL"
  | "SMS"
  | "PRESS_STATEMENT"
  | "PUBLIC_STATEMENT"
  | "FUNDRAISING"
  | "DEBATE"
  | "SPEECH"
  | "MEMO"
  | "STRATEGIC_DECISION"
  | "CUSTOM";

export type DecisionSimulationConfidenceLabel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "UNSET";

export interface DecisionSimulationActorSnapshot {
  actorId?: string;
  name: string;
  actorType?:
    | "PERSON"
    | "CAMPAIGN"
    | "ORGANIZATION"
    | "MEDIA_OUTLET"
    | "STAKEHOLDER_GROUP"
    | "GENERIC_AUDIENCE"
    | "OTHER";
  description?: string;
  sourceVersion?: string;
}

export interface DecisionSimulationEvidenceRef {
  id: string;
  label: string;
  sourceType?: string;
  sourceUri?: string;
  observedAt?: string;
}

export interface DecisionSimulationConfidence {
  label: DecisionSimulationConfidenceLabel;
  /**
   * Optional model-estimated probability, expressed from 0 to 1.
   * This is never presented as an objective real-world probability.
   */
  estimatedProbability?: number;
  explanation?: string;
}

export interface DecisionSimulationMove {
  moveNumber: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  side: DecisionSimulationSide;
  kind: DecisionSimulationMoveKind;
  actor?: DecisionSimulationActorSnapshot;
  message: string;
  objective?: string;
  predictedFrame?: string;
  rationaleSummary?: string;
  risks: string[];
  opportunities: string[];
  assumptions: string[];
  evidenceRefs: DecisionSimulationEvidenceRef[];
  confidence: DecisionSimulationConfidence;
}

export interface DecisionSimulationOpeningInput {
  message: string;
  channel: DecisionSimulationChannel;
  objective?: string;
  operatorActor?: DecisionSimulationActorSnapshot;
  counterpartyActor?: DecisionSimulationActorSnapshot;
  stakes?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  urgency?: "LOW" | "MEDIUM" | "HIGH";
  context?: string;
}

export interface DecisionSimulationRun {
  id?: string;
  title?: string;
  channel: DecisionSimulationChannel;
  objective?: string;
  openingInput: DecisionSimulationOpeningInput;
  moves: DecisionSimulationMove[];
  assumptions: string[];
  evidenceRefs: DecisionSimulationEvidenceRef[];
  modelVersion?: string;
  promptVersion?: string;
  createdAt?: string;
}

export interface DecisionSimulationValidationResult {
  ok: boolean;
  errors: string[];
}
