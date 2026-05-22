import type { ComplianceBrainSnapshot } from "../brain/compliance-brain-types";
import type { ImpactForecast, OrchestratorAction } from "./orchestrator-types";

function estimateImpact(
  actionId: string,
  snapshot: ComplianceBrainSnapshot,
  reconRemaining: number,
): OrchestratorAction["estimatedImpact"] {
  switch (actionId) {
    case "recon-ambiguous-unmatched":
      return {
        filingBlockersDelta: reconRemaining > 0 ? -1 : 0,
        queueItemsUnlocked: 0,
        reconciliationItemsResolved: Math.min(reconRemaining, 12),
        launchReadinessPoints: reconRemaining > 0 ? 8 : 2,
        confidence: "high",
        summary: `Up to ${Math.min(reconRemaining, 12)} rehearsal credit(s) move toward draft → approve → lock.`,
      };
    case "rule-topics-workflow":
      return {
        filingBlockersDelta: -1,
        queueItemsUnlocked: 0,
        reconciliationItemsResolved: 0,
        launchReadinessPoints: 10,
        confidence: "high",
        summary: `Clears Rules prerequisite for ${snapshot.rules.ruleReviewQueueItems} rule_review queue items (individual approve still required).`,
      };
    case "queue-next-best":
      return {
        filingBlockersDelta: 0,
        queueItemsUnlocked: 1,
        reconciliationItemsResolved: 0,
        launchReadinessPoints: 2,
        confidence: "medium",
        summary: "One approval item progressed when confidence and guards allow (not rule_review batch).",
      };
    case "bank-source-verify":
      return {
        filingBlockersDelta: snapshot.source.bankCsv === "missing" ? -1 : 0,
        queueItemsUnlocked: 0,
        reconciliationItemsResolved: 0,
        launchReadinessPoints: snapshot.source.bankCsv === "present" ? 0 : 15,
        confidence: "high",
        summary: "Unlocks reconciliation rehearsal when bank source validates on this host.",
      };
    case "storage-prod":
      return {
        filingBlockersDelta: -1,
        queueItemsUnlocked: 0,
        reconciliationItemsResolved: 0,
        launchReadinessPoints: 12,
        confidence: "medium",
        summary: "Removes storage blocker; requires Steve/ops configuration.",
      };
    default:
      return {
        filingBlockersDelta: 0,
        queueItemsUnlocked: 0,
        reconciliationItemsResolved: 0,
        launchReadinessPoints: 3,
        confidence: "low",
        summary: "Incremental progress on compliance program.",
      };
  }
}

export function attachImpactEstimates(
  actions: Omit<OrchestratorAction, "estimatedImpact" | "guardsPassed" | "guardNotes">[],
  snapshot: ComplianceBrainSnapshot,
  reconRemaining: number,
): OrchestratorAction[] {
  return actions.map((a) => {
    const estimatedImpact = estimateImpact(a.id, snapshot, reconRemaining);
    return { ...a, estimatedImpact, guardsPassed: true, guardNotes: [] };
  });
}

export function buildImpactForecast(input: {
  commitBase: string;
  snapshot: ComplianceBrainSnapshot;
  actions: OrchestratorAction[];
}): ImpactForecast {
  const top3 = input.actions.filter((a) => a.guardsPassed).slice(0, 3);
  const launchReadinessPointsMax = top3.reduce((s, a) => s + a.estimatedImpact.launchReadinessPoints, 0);

  return {
    generatedAt: new Date().toISOString(),
    commitBase: input.commitBase,
    filingOverall: input.snapshot.filing.overall,
    launchOverall: input.snapshot.launchReadiness.overall,
    actions: input.actions,
    cumulativeIfAllTop3: {
      launchReadinessPointsMax: Math.min(launchReadinessPointsMax, 25),
      filingBlockersRemovedMax: top3.reduce((s, a) => s + Math.max(0, -a.estimatedImpact.filingBlockersDelta), 0),
      honestNote:
        "Forecasts are heuristic — filing stays red until hard gates and human sign-off pass. No auto-approve.",
    },
  };
}
