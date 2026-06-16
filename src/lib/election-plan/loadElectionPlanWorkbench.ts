/** Re-exports for backwards compatibility — prefer electionPlanSnapshot + electionPlanData. */
export {
  ELECTION_PLAN_SNAPSHOT_PATH,
  fallbackElectionPlanSnapshot,
  loadElectionPlanSnapshot,
  loadElectionPlanWorkbench,
} from "./electionPlanSnapshot";

export {
  ELECTION_PLAN_ARCHITECTURE,
  ELECTION_PLAN_BRAND,
  ELECTION_PLAN_CLASSIFICATION,
  formatCompactVotes,
  formatPct,
  formatPluralityRange,
  formatVotes,
} from "./electionPlanData";
