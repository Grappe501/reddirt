/**
 * Prints a full compliance sub-project handoff for a new AI thread.
 * Run: npm run compliance:ai-thread-handoff
 */
import { buildApril26ImportStatus } from "../../src/lib/compliance/imports/april26-import-status";
import { loadApprovalItems, loadApprovalQueues } from "../../src/lib/compliance/approval/approval-storage";
import { buildFilingReadinessReport } from "../../src/lib/compliance/filing-readiness/build-filing-readiness-report";
import { checkComplianceStorageHealth } from "../../src/lib/compliance/storage/storage-health";
import { buildBatchReadinessReport } from "../../src/lib/compliance/approval/batch-readiness";
import { getBatchEligibleItems, getQueueItems } from "../../src/lib/compliance/approval/load-approval-queue";
import { APRIL_2026_QUEUE_ID } from "../../src/lib/compliance/approval/build-approval-queue";
import {
  buildComplianceBrainSnapshot,
  buildComplianceNextActions,
  buildComplianceRiskReport,
} from "../../src/lib/compliance/ai/brain/build-compliance-brain";
import { UNSAFE_COMPLIANCE_ACTIONS } from "../../src/lib/compliance/ai/brain/compliance-brain-types";
import { execSync } from "node:child_process";

function gitShortHead(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function main() {
  const aprilItemsAll = await getQueueItems(APRIL_2026_QUEUE_ID);
  const [april26, readiness, storage, queues, items, eligible, batchReport, brain] = await Promise.all([
    buildApril26ImportStatus(),
    buildFilingReadinessReport(),
    checkComplianceStorageHealth(),
    loadApprovalQueues(),
    loadApprovalItems(),
    getBatchEligibleItems(APRIL_2026_QUEUE_ID),
    buildBatchReadinessReport(APRIL_2026_QUEUE_ID, aprilItemsAll),
    buildComplianceBrainSnapshot(),
  ]);
  const nextActions = buildComplianceNextActions(brain);
  const risks = buildComplianceRiskReport(brain);
  const aprilItems = items.filter((i) => i.queueId === APRIL_2026_QUEUE_ID);
  const open = aprilItems.filter((i) => ["queued", "needs_review", "ready", "reopened"].includes(i.status));
  const blocked = aprilItems.filter((i) => i.blockers.length > 0);
  const needsInfo = aprilItems.filter((i) => i.status === "needs_info");

  console.log(
    JSON.stringify(
      {
        activeLane: "H:\\SOSWebsite\\RedDirt",
        envFile: "H:\\SOSWebsite\\RedDirt\\.env",
        mainBaselineCommit: gitShortHead(),
        localDev: "http://localhost:3000",
        commandCenterUrl: "/admin/compliance/command-center",
        stateOfBuildDoc: "docs/compliance/COMPLIANCE_STATE_OF_BUILD.md",
        completionPlanDoc: "docs/compliance/COMPLIANCE_COMPLETION_PLAN.md",
        aiOperatingModelDoc: "docs/compliance/COMPLIANCE_AI_OPERATING_MODEL.md",
        aiBrainBriefDoc: "docs/compliance/COMPLIANCE_AI_BRAIN_BRIEF.md",
        brainSnapshotPath: "data/compliance/ai/brain-snapshot.json",
        april26,
        approval: {
          queues: queues.length,
          totalItems: items.length,
          aprilQueueItems: aprilItems.length,
          open: open.length,
          blocked: blocked.length,
          needsInfo: needsInfo.length,
          batchEligible: eligible.length,
          batchReport,
        },
        filingReadiness: {
          overall: readiness.overallStatus,
          blockers: readiness.blockers.length,
          humanReviewRequired: readiness.humanReviewRequired,
        },
        storage,
        aiBrain: {
          launchOverall: brain.launchReadiness.overall,
          launchReadinessScore: brain.launchReadiness.launchReadinessScore,
          recommendedNextHumanAction: brain.recommendedNextHumanAction,
          recommendedNextAiAction: brain.recommendedNextAiAction,
          topNextActions: nextActions.slice(0, 5).map((a) => ({ id: a.id, title: a.title, owner: a.owner, phase: a.phase })),
          topRisks: risks.filter((r) => r.severity === "critical" || r.severity === "high").slice(0, 5).map((r) => ({ id: r.id, severity: r.severity, title: r.title })),
          unsafeActions: UNSAFE_COMPLIANCE_ACTIONS,
        },
        keyRoutes: [
          "/admin/compliance",
          "/admin/compliance/command-center",
          "/admin/compliance/april26",
          "/admin/compliance/approval",
          `/admin/compliance/approval/${APRIL_2026_QUEUE_ID}`,
          "/admin/compliance/approval/batch",
          "/admin/compliance/filing-readiness",
          "/admin/compliance/reconciliation",
          "/admin/compliance/tasks",
          "/admin/compliance/rules",
        ],
        validationCommands: [
          "npm run compliance:ai-brain",
          "npm run compliance:ai-brain:qa",
          "npm run compliance:approval:build",
          "npm run compliance:qa-approval",
          "npm run compliance:qa-full",
          "npm run compliance:april26:qa",
          "npm run compliance:bank:qa",
          "npm run typecheck",
          "npm run lint",
          "npm run build",
        ],
        hardConstraints: [
          "RedDirt lane only; no cross-lane imports",
          "No PII in commits, docs, or chat",
          "Not legal certification — human review required",
          "bank-april-2026.csv required for reconciliation",
          "Never batch rule_review or fake filing green",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
