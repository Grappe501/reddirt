export type DecisionSimulationChannel =
  | "EMAIL"
  | "SOCIAL"
  | "TEXT"
  | "PRESS"
  | "MEMO"
  | "SPEECH"
  | "DEBATE"
  | "FUNDRAISING"
  | "INTERNAL"
  | "OTHER";

export type DecisionSimulationStatus =
  | "DRAFT"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETE"
  | "FAILED"
  | "ARCHIVED";

export type DecisionSimulationActorType =
  | "PERSON"
  | "CAMPAIGN"
  | "ORGANIZATION"
  | "MEDIA"
  | "AUDIENCE"
  | "ALLY"
  | "CRITIC"
  | "OTHER";

export type DecisionSimulationSide = "OPERATOR" | "COUNTERPART";

export type DecisionSimulationMoveKind =
  | "INITIAL_MOVE"
  | "PREDICTED_RESPONSE"
  | "RECOMMENDED_RESPONSE"
  | "ACTUAL_RESPONSE";

export type DecisionSimulationBranchType =
  | "EXPECTED"
  | "HOSTILE"
  | "BEST_CASE"
  | "OPPORTUNITY"
  | "ESCALATION"
  | "SURPRISE"
  | "SILENCE"
  | "ALTERNATIVE";

export type DecisionSimulationThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DecisionSimulationOpportunityLevel = "LOW" | "MEDIUM" | "HIGH";
export type DecisionSimulationAssumptionStatus = "UNVERIFIED" | "SUPPORTED" | "CONTRADICTED" | "SUPERSEDED";

export interface DecisionSimulationRunRecord {
  id: string;
  title: string;
  channel: DecisionSimulationChannel;
  status: DecisionSimulationStatus;
  initialMove: string;
  objective?: string | null;
  primaryCounterpartActorId?: string | null;
  createdByUserId?: string | null;
  modelProvider?: string | null;
  modelName?: string | null;
  promptVersion?: string | null;
  doctrineVersion: string;
}

export interface DecisionSimulationMoveRecord {
  id: string;
  simulationId: string;
  parentMoveId?: string | null;
  ply: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  side: DecisionSimulationSide;
  moveKind: DecisionSimulationMoveKind;
  content: string;
  frame?: string | null;
  probability?: number | null;
  confidence?: number | null;
  threatLevel?: DecisionSimulationThreatLevel | null;
  opportunityLevel?: DecisionSimulationOpportunityLevel | null;
  isRecommendedPath: boolean;
}

export interface DecisionSimulationEvidenceRecord {
  id: string;
  simulationId: string;
  moveId?: string | null;
  actorId?: string | null;
  sourceType: string;
  sourceRef?: string | null;
  title?: string | null;
  excerpt?: string | null;
  sourceUrl?: string | null;
  reliability?: number | null;
}

export interface DecisionSimulationOutcomeRecord {
  id: string;
  simulationId: string;
  predictedMoveId?: string | null;
  actualContent: string;
  actualActorId?: string | null;
  semanticMatchScore?: number | null;
  frameMatchScore?: number | null;
  overallAccuracyScore?: number | null;
  learningNotes?: string | null;
}

export interface DecisionSimulationRepository {
  createRun(input: DecisionSimulationRunRecord): Promise<void>;
  appendMove(input: DecisionSimulationMoveRecord): Promise<void>;
  addEvidence(input: DecisionSimulationEvidenceRecord): Promise<void>;
  recordOutcome(input: DecisionSimulationOutcomeRecord): Promise<void>;
}

export const DECISION_SIMULATION_TABLES = Object.freeze([
  "decision_simulation_actor",
  "decision_simulation_run",
  "decision_simulation_move",
  "decision_simulation_branch",
  "decision_simulation_evidence",
  "decision_simulation_assumption",
  "decision_simulation_outcome",
] as const);

export const DECISION_SIMULATION_PERSISTENCE_VERSION = "decision-simulation-persistence-1.0";
