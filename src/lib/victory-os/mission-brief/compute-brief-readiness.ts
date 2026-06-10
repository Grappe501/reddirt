import type { CountyMissionsRegistryFile, WeeklyDecisionBrief } from "../types";

export type BriefReadiness = {
  totalDecisions: number;
  approved: number;
  pending: number;
  declined: number;
  modified: number;
  approvalPct: number;
  cmReadyToExecute: boolean;
  missionsSynced: boolean;
  pendingLabel: string;
};

export function computeBriefReadiness(
  brief: WeeklyDecisionBrief,
  missionRegistry: CountyMissionsRegistryFile | null,
): BriefReadiness {
  const decisions = brief.topDecisions;
  const approved = decisions.filter((d) => d.status === "approved").length;
  const pending = decisions.filter((d) => d.status === "pending").length;
  const declined = decisions.filter((d) => d.status === "declined").length;
  const modified = decisions.filter((d) => d.status === "modified").length;
  const totalDecisions = decisions.length;
  const approvalPct = totalDecisions > 0 ? Math.round((approved / totalDecisions) * 100) : 0;
  const missionsSynced =
    missionRegistry != null &&
    missionRegistry.syncedWeekKey === brief.weekKey &&
    missionRegistry.syncedFromBriefId === brief.briefId;

  let pendingLabel = "All decisions reviewed";
  if (pending > 0) pendingLabel = `${pending} decision${pending === 1 ? "" : "s"} awaiting CM approval`;
  else if (!missionsSynced) pendingLabel = "Decisions reviewed — sync county missions to execute";

  return {
    totalDecisions,
    approved,
    pending,
    declined,
    modified,
    approvalPct,
    cmReadyToExecute: pending === 0 && missionsSynced,
    missionsSynced,
    pendingLabel,
  };
}
