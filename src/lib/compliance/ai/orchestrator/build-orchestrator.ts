import { execSync } from "node:child_process";
import {
  buildComplianceBrainSnapshot,
  buildComplianceNextActions,
} from "../brain/build-compliance-brain";
import { buildCompletionProgress } from "../expert/build-completion-progress";
import { buildReconciliationProgress } from "../../reconciliation/build-reconciliation-progress";
import { buildRuleReviewWorkflow } from "../../knowledge/build-rule-review-workflow";
import { resolveBankSource } from "../../april26/bank-source-adapter";
import { attachImpactEstimates } from "./build-impact-forecast";
import { buildDecisionGuard, guardOrchestratorAction } from "./build-decision-guard";
import { buildImpactForecast } from "./build-impact-forecast";
import { buildRolePlans } from "./build-role-plans";
import { buildAiDelta } from "./build-ai-delta";
import type {
  NextBestAction,
  OrchestratorAction,
  OrchestratorSnapshot,
} from "./orchestrator-types";
import { ORCHESTRATOR_UNSAFE_SHORTCUTS } from "./orchestrator-types";

function gitShortHead(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function mapOwner(o: string): OrchestratorAction["owner"] {
  if (o === "treasurer" || o === "operator" || o === "steve" || o === "ai_assist" || o === "engineer") return o;
  return "human";
}

export async function buildOrchestratorActionCandidates(
  snapshot: Awaited<ReturnType<typeof buildComplianceBrainSnapshot>>,
  reconProgress: Awaited<ReturnType<typeof buildReconciliationProgress>>,
  ruleWorkflow: Awaited<ReturnType<typeof buildRuleReviewWorkflow>>,
): Promise<Omit<OrchestratorAction, "estimatedImpact" | "guardsPassed" | "guardNotes">[]> {
  const brainActions = buildComplianceNextActions(snapshot);
  const candidates: Omit<OrchestratorAction, "estimatedImpact" | "guardsPassed" | "guardNotes">[] = [];

  if (reconProgress.readyForReview && reconProgress.remainingReviewItems > 0) {
    candidates.push({
      id: "recon-ambiguous-unmatched",
      priority: 1,
      title: "Resolve ambiguous and unmatched bank credits",
      whyItMatters: `${reconProgress.remainingReviewItems} rehearsal item(s) block honest reconciliation closure. Treasurer must pick payouts or create investigation drafts.`,
      owner: "treasurer",
      href: "/admin/compliance/reconciliation",
      command: "npm run compliance:reconciliation-review-report",
      phase: 2,
      blockedBy: [],
    });
  }

  if (ruleWorkflow.topicsPendingReview > 0) {
    candidates.push({
      id: "rule-topics-workflow",
      priority: 2,
      title: "Complete Rules page topic reviews",
      whyItMatters: `${ruleWorkflow.topicsPendingReview} rule topic(s) gate ${ruleWorkflow.totalQueueItems} rule_review queue items. Individual approve only after topic review.`,
      owner: "human",
      href: "/admin/compliance/rules",
      command: "npm run compliance:rule-resolution-report",
      phase: 3,
      blockedBy: [],
    });
  }

  if (snapshot.source.bankCsv === "missing" || snapshot.source.bankCsv === "invalid") {
    candidates.push({
      id: "bank-source-verify",
      priority: 1,
      title: snapshot.source.bankCsv === "invalid" ? "Validate bank import chunks" : "Add bank source",
      whyItMatters: "Reconciliation and filing paths require validated bank credits. Run source-truth audit; on Netlify re-import after deploy.",
      owner: "treasurer",
      href: "/admin/compliance/imports/bank",
      command: "npm run compliance:source-truth-audit",
      phase: 1,
      blockedBy: [],
    });
  }

  for (const ba of brainActions.slice(0, 6)) {
    candidates.push({
      id: ba.id,
      priority: ba.priority + 10,
      title: ba.title,
      whyItMatters: ba.description,
      owner: mapOwner(ba.owner),
      href: ba.href,
      command: ba.command,
      phase: ba.phase,
      blockedBy: ba.blockedBy,
    });
  }

  if (snapshot.queue.openItems > 0 && snapshot.queue.batchEligible > 0) {
    candidates.push({
      id: "queue-next-best",
      priority: 5,
      title: "Review next batch-eligible item",
      whyItMatters: `${snapshot.queue.batchEligible} item(s) meet confidence ≥98% and are not rule_review. One at a time.`,
      owner: "operator",
      href: "/admin/compliance/approval/april-2026-compliance-review",
      phase: 4,
      blockedBy: ruleWorkflow.topicsPendingReview > 0 ? ["rule-topics-workflow"] : [],
    });
  }

  return candidates.sort((a, b) => a.priority - b.priority);
}

export async function buildOrchestratorPackage(): Promise<{
  snapshot: OrchestratorSnapshot;
  impactForecast: Awaited<ReturnType<typeof buildImpactForecast>>;
  decisionGuard: Awaited<ReturnType<typeof buildDecisionGuard>>;
  rolePlans: Awaited<ReturnType<typeof buildRolePlans>>;
  delta: Awaited<ReturnType<typeof buildAiDelta>>;
}> {
  const brain = await buildComplianceBrainSnapshot();
  const [reconProgress, ruleWorkflow, bank, progress] = await Promise.all([
    buildReconciliationProgress(),
    buildRuleReviewWorkflow(),
    resolveBankSource(),
    buildCompletionProgress(brain),
  ]);

  const productionBankVerified =
    process.env.COMPLIANCE_BANK_PRODUCTION_VERIFIED === "true" ||
    (bank.canSatisfyBankRequirement && bank.databaseBatchCount > 0 && process.env.NETLIFY !== "true");

  const rawCandidates = await buildOrchestratorActionCandidates(brain, reconProgress, ruleWorkflow);
  let actions = attachImpactEstimates(rawCandidates, brain, reconProgress.remainingReviewItems);

  const guardContext = { productionBankVerified, filingOverall: brain.filing.overall };
  actions = actions.map((a) => {
    const g = guardOrchestratorAction(a, guardContext);
    return { ...a, guardsPassed: g.passed, guardNotes: g.notes };
  });

  const decisionGuard = buildDecisionGuard({
    commitBase: gitShortHead(),
    actions,
    productionBankVerified,
    filingOverall: brain.filing.overall,
  });

  const safeActions = actions.filter((a) => a.guardsPassed && !decisionGuard.blockedRecommendations.some((b) => b.actionId === a.id));
  const top = safeActions[0] ?? actions[0];

  const nextBestAction: NextBestAction = {
    action: top,
    rationale: top
      ? `Highest priority safe action: ${top.whyItMatters}`
      : "No safe actions — resolve decision guard blockers first.",
    alternativesConsidered: safeActions.slice(1, 4).map((a) => a.title),
  };

  const todayWorkPlan = safeActions.slice(0, 5).map((a, i) => ({
    order: i + 1,
    title: a.title,
    owner: a.owner,
    href: a.href,
  }));

  const impactForecast = buildImpactForecast({
    commitBase: gitShortHead(),
    snapshot: brain,
    actions: safeActions,
  });

  const orchestratorSnapshot: OrchestratorSnapshot = {
    generatedAt: new Date().toISOString(),
    commitBase: gitShortHead(),
    programSummary: `Filing ${brain.filing.overall}, launch ${brain.launchReadiness.overall}, ${progress.overallPercentComplete}% complete. ${brain.queue.openItems} open approvals; ${reconProgress.remainingReviewItems} recon items; ${ruleWorkflow.topicsPendingReview} rule topics pending.`,
    nextBestAction,
    todayWorkPlan,
    unsafeShortcuts: [...ORCHESTRATOR_UNSAFE_SHORTCUTS],
    changesSinceLastPass: [],
    filingStatus: brain.filing.overall,
    launchOverall: brain.launchReadiness.overall,
    overallPercentComplete: progress.overallPercentComplete,
    recommendedCommands: [
      "npm run compliance:ai-orchestrator",
      "npm run compliance:source-truth-audit",
      "npm run compliance:bank:qa",
      "npm run compliance:qa-full",
    ],
  };

  const delta = await buildAiDelta(orchestratorSnapshot);
  orchestratorSnapshot.changesSinceLastPass = delta.changes.map((c) => `${c.area}: ${c.before} → ${c.after} (${c.direction})`);

  const rolePlans = buildRolePlans({
    commitBase: orchestratorSnapshot.commitBase,
    snapshot: brain,
    reconProgress,
    topActions: safeActions,
  });

  return {
    snapshot: orchestratorSnapshot,
    impactForecast,
    decisionGuard,
    rolePlans,
    delta,
  };
}
