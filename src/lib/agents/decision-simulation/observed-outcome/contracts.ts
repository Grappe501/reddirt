export const OBSERVED_OUTCOME_VERSION = "observed-outcome-1.0" as const;
export const OBSERVED_RESPONSE_EXCERPT_MAX = 280;

export type OutcomeBranchSample = {
  futureId: string;
  frame?: string | null;
  firstMessage?: string;
};

export type OutcomeCompareInput = {
  actualResponse: string;
  closestFuture: string;
  observedFrame?: string | null;
  notes?: string;
  actorId?: string;
  branches: OutcomeBranchSample[];
};

export type OutcomeComparison = {
  version: typeof OBSERVED_OUTCOME_VERSION;
  predictedFrame: string | null;
  observedFrame: string | null;
  predictedFirstMessage: string | null;
  suggestedFuture: string | null;
  operatorFutureAgreesWithGuess: boolean | null;
  frameMatch: boolean | null;
  contentOverlap: number | null;
  misses: string[];
  writeback: "FORBIDDEN";
};

export type ModelChangeProposal = {
  status: "PENDING_OPERATOR_APPROVAL";
  applied: false;
  writeback: "FORBIDDEN";
  actorId?: string;
  summary: string;
};
