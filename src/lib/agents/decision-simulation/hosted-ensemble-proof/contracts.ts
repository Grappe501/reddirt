export const HOSTED_ENSEMBLE_PROOF_VERSION = "hosted-ensemble-proof-1.0" as const;
export const HOSTED_ENSEMBLE_MIN_RUNS = 100;

export type HostedProofStatus = "NOT_STARTED" | "IN_PROGRESS" | "FAILED" | "PROVEN";

export type HostedProofCheckId =
  | "QUEUED_DEPTH"
  | "FINISHED"
  | "SIX_FUTURES"
  | "WITHIN_LANE_N"
  | "TYPICAL_SAMPLE"
  | "DASHBOARD_BRANCHES"
  | "WORKER_CONTINUITY";

export type HostedProofCheck = {
  id: HostedProofCheckId;
  label: string;
  pass: boolean;
  detail: string;
};

export type HostedEnsembleProof = {
  version: typeof HOSTED_ENSEMBLE_PROOF_VERSION;
  status: HostedProofStatus;
  requested: number;
  minLaneN: number;
  futuresWithRuns: number;
  checks: HostedProofCheck[];
  summary: string;
};
