import { execSync } from "node:child_process";
import { buildApril26ImportStatus } from "../../imports/april26-import-status";
import { buildBankReconciliationRehearsal } from "../../imports/bank-reconciliation-rehearsal";
import { loadApprovalItems, loadApprovalQueues } from "../../approval/approval-storage";
import { buildBatchReadinessReport } from "../../approval/batch-readiness";
import { getBatchEligibleItems, getQueueItems } from "../../approval/load-approval-queue";
import { APRIL_2026_QUEUE_ID } from "../../approval/build-approval-queue";
import { buildOperatorReviewRowsV2, summarizeBurnDownV2, BURN_DOWN_START_ORDER } from "../../approval/approval-burn-down-v2";
import { buildFilingBlockerBurnDown } from "../../filing-readiness/filing-blocker-burn-down";
import { buildFilingReadinessReport } from "../../filing-readiness/build-filing-readiness-report";
import { buildComplianceExecutiveScore } from "../../scoring/compliance-score";
import { checkComplianceStorageHealth } from "../../storage/storage-health";
import { buildRuleTopicReviewPacket } from "../../knowledge/rule-topic-review-packet";
import {
  type ComplianceBrainSnapshot,
  type ComplianceLaunchReadiness,
  type ComplianceNextAction,
  type ComplianceRisk,
  UNSAFE_COMPLIANCE_ACTIONS,
} from "./compliance-brain-types";

function gitShortHead(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

export async function buildComplianceBrainSnapshot(): Promise<ComplianceBrainSnapshot> {
  const aprilItemsAll = await getQueueItems(APRIL_2026_QUEUE_ID);
  const [
    april26,
    rehearsal,
    items,
    queues,
    eligible,
    batchReport,
    filingReport,
    filingBurnDown,
    storage,
    rulePacket,
    score,
    rowsV2,
  ] = await Promise.all([
    buildApril26ImportStatus(),
    buildBankReconciliationRehearsal(),
    loadApprovalItems(),
    loadApprovalQueues(),
    getBatchEligibleItems(APRIL_2026_QUEUE_ID),
    buildBatchReadinessReport(APRIL_2026_QUEUE_ID, aprilItemsAll),
    buildFilingReadinessReport(),
    buildFilingBlockerBurnDown(),
    checkComplianceStorageHealth(),
    buildRuleTopicReviewPacket(),
    buildComplianceExecutiveScore(),
    buildOperatorReviewRowsV2(aprilItemsAll, APRIL_2026_QUEUE_ID),
  ]);

  const aprilItems = items.filter((i) => i.queueId === APRIL_2026_QUEUE_ID);
  const open = aprilItems.filter((i) => ["queued", "needs_review", "ready", "reopened"].includes(i.status));
  const ruleReviewItems = aprilItems.filter((i) => i.source === "rule_review").length;
  const summaryV2 = summarizeBurnDownV2(rowsV2);
  const bank = april26.bankReadiness;

  const bankCsvStatus = !bank.found ? "missing" : bank.readyForReconciliation ? "present" : "invalid";

  const launchReadiness = buildLaunchReadiness({
    filingOverall: filingReport.overallStatus,
    bankReady: bank.readyForReconciliation,
    openItems: open.length,
    batchEligible: eligible.length,
    storageReady: storage.ready,
    ruleTopicsUnverified: rulePacket.unverifiedCount,
    executiveScore: score.score,
  });

  const snapshot: ComplianceBrainSnapshot = {
    generatedAt: new Date().toISOString(),
    commitBase: gitShortHead(),
    commandCenterUrl: "/admin/compliance/command-center",
    architecture: {
      dataAuthority: "json_local",
      persistence: process.env.COMPLIANCE_DB_MIGRATED === "true" ? "db_optional" : "json_authoritative",
      aiRole: "recommend_and_inspect_never_bypass_gates",
    },
    source: {
      april26FolderExists: april26.folderExists,
      goodChangeCsv: april26.goodChangeCsvFound ? "present" : "missing",
      bankCsv: bankCsvStatus,
      bankCsvExpectedPath: bank.expectedPath,
      ethicsWorkbook: april26.ethicsWorkbookFound ? "present" : "missing",
      receiptImages: april26.receiptImagesFound,
      checkImages: april26.checkImagesFound,
      inKindPages: april26.inKindPagesFound,
      reconciliationBlockers: april26.reconciliationBlockers,
    },
    queue: {
      totalItems: items.length,
      openItems: open.length,
      batchEligible: eligible.length,
      ruleReviewItems,
      needsInfo: aprilItems.filter((i) => i.status === "needs_info").length,
      summaryByCategory: summaryV2,
      startOrder: BURN_DOWN_START_ORDER.filter((k) => (summaryV2[k] ?? 0) > 0),
    },
    filing: {
      overall: filingReport.overallStatus,
      blockerCount: filingBurnDown.blockers.length,
      blockers: filingBurnDown.blockers.map((b) => ({
        id: b.id,
        label: b.label,
        category: b.category,
        severity: b.severity,
        count: b.count,
        operatorFixableToday: b.operatorFixableToday,
        greenCondition: b.greenCondition,
        href: b.href,
      })),
    },
    reconciliation: {
      readyForRehearsal: rehearsal.readyForRehearsal,
      highConfidenceMatches: rehearsal.highConfidence.length,
      unmatchedBank: rehearsal.unmatchedBank.length,
      unmatchedPayouts: rehearsal.unmatchedPayouts.length,
    },
    rules: {
      unverifiedTopicCount: rulePacket.unverifiedCount,
      ruleReviewQueueItems: ruleReviewItems,
      topics: rulePacket.topics
        .filter((t) => !t.verified)
        .slice(0, 30)
        .map((t) => ({
          topicId: t.topicId,
          label: t.label,
          verified: t.verified,
          approvalItemsAffected: t.approvalItemsAffected,
        })),
    },
    storage: {
      mode: storage.localFallbackActive ? "local_private" : storage.envPresent ? "supabase" : "unknown",
      envPresent: storage.envPresent,
      bucketReachable: storage.bucketReachable,
      rlsConfiguredManual: storage.rlsConfiguredManual,
      ready: storage.ready,
      summary: storage.summary,
    },
    dbMigration: {
      migrated: process.env.COMPLIANCE_DB_MIGRATED === "true",
      planDoc: "docs/compliance/COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md",
      operatorAction: "Steve approval + backup + rehearsal before cutover",
      steveApprovalRequired: true,
    },
    deployment: {
      netlifyChecklistDoc: "docs/compliance/COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md",
      productionVerified: false,
      note: "Operator must verify deploy — never assume green deploy.",
    },
    qa: {
      lastCommandsRecommended: [
        "compliance:ai-brain",
        "compliance:ai-brain:qa",
        "compliance:qa-full",
        "compliance:bank:qa",
      ],
      acceptableHonestState: "filing red, qa-full yellow, batch 0, bank missing ok",
    },
    launchReadiness,
    recommendedNextHumanAction: !bank.found
      ? `Add bank CSV at ${bank.expectedPath}`
      : open.length > 0
        ? `Work approval queue (${open.length} open) starting with: ${BURN_DOWN_START_ORDER.filter((k) => (summaryV2[k] ?? 0) > 0).join(", ") || "near_eligible"}`
        : "Run launch rehearsal checklist and Netlify verify",
    recommendedNextAiAction:
      "Run compliance:ai-brain and compliance:ai-daily-brief; surface next-actions and risks; never auto-approve or fake green.",
    unsafeActions: [...UNSAFE_COMPLIANCE_ACTIONS],
  };

  void queues;
  void batchReport;
  return snapshot;
}

function buildLaunchReadiness(input: {
  filingOverall: "red" | "yellow" | "green";
  bankReady: boolean;
  openItems: number;
  batchEligible: number;
  storageReady: boolean;
  ruleTopicsUnverified: number;
  executiveScore: number;
}): ComplianceLaunchReadiness {
  const checks = [
    { id: "sources_april26", label: "April26 folder + GoodChange CSV", passed: true, requiredForLaunch: true },
    { id: "bank_csv", label: "Bank CSV validated", passed: input.bankReady, requiredForLaunch: true },
    { id: "filing_green", label: "Filing readiness green (source-backed)", passed: input.filingOverall === "green", requiredForLaunch: true },
    { id: "queue_clear", label: "Approval queue reviewed", passed: input.openItems === 0, requiredForLaunch: true },
    { id: "rules_topics", label: "Rule topics reviewed", passed: input.ruleTopicsUnverified === 0, requiredForLaunch: true },
    { id: "storage_prod", label: "Production storage + RLS", passed: input.storageReady, requiredForLaunch: true },
    { id: "netlify_verify", label: "Netlify production verified", passed: false, requiredForLaunch: true },
    { id: "human_signoff", label: "Treasurer/compliance officer sign-off", passed: false, requiredForLaunch: true },
  ];
  const requiredPassed = checks.filter((c) => c.requiredForLaunch && c.passed).length;
  const requiredTotal = checks.filter((c) => c.requiredForLaunch).length;
  const launchReadinessScore = Math.round((requiredPassed / requiredTotal) * 100);
  const overall =
    launchReadinessScore >= 95 && input.filingOverall === "green"
      ? "launch_ready"
      : launchReadinessScore >= 40 || input.bankReady
        ? "rehearsal_ready"
        : "not_ready";

  return {
    overall,
    launchReadinessScore,
    filingStatus: input.filingOverall,
    qaFullScore: input.executiveScore,
    qaFullStatus: input.executiveScore >= 85 ? "green" : input.executiveScore >= 60 ? "yellow" : "red",
    checklist: checks,
  };
}

export function buildComplianceNextActions(snapshot: ComplianceBrainSnapshot): ComplianceNextAction[] {
  const actions: ComplianceNextAction[] = [];

  if (snapshot.source.bankCsv === "missing") {
    actions.push({
      id: "add-bank-csv",
      priority: 1,
      title: "Add bank-april-2026.csv",
      description: `Treasurer export at ${snapshot.source.bankCsvExpectedPath}. Then npm run compliance:bank:qa`,
      href: "/admin/compliance/april26",
      command: "npm run compliance:bank:qa",
      owner: "treasurer",
      phase: 1,
      blockedBy: [],
    });
  }

  if (snapshot.reconciliation.readyForRehearsal && snapshot.reconciliation.unmatchedBank > 0) {
    actions.push({
      id: "recon-unmatched",
      priority: 2,
      title: "Review unmatched bank lines",
      description: `${snapshot.reconciliation.unmatchedBank} unmatched bank transaction(s).`,
      href: "/admin/compliance/reconciliation",
      owner: "operator",
      phase: 2,
      blockedBy: snapshot.source.bankCsv === "missing" ? ["add-bank-csv"] : [],
    });
  }

  if (snapshot.rules.unverifiedTopicCount > 0) {
    actions.push({
      id: "rule-topics",
      priority: 3,
      title: "Review unverified rule topics",
      description: `${snapshot.rules.unverifiedTopicCount} topic(s) on Rules page — not legal certification.`,
      href: "/admin/compliance/rules",
      command: "npm run compliance:rule-topic-packet",
      owner: "human",
      phase: 3,
      blockedBy: [],
    });
  }

  if (snapshot.queue.openItems > 0) {
    actions.push({
      id: "queue-burndown",
      priority: 4,
      title: "Burn down approval queue",
      description: `${snapshot.queue.openItems} open; start: ${snapshot.queue.startOrder.join(", ") || "export v2"}`,
      href: "/admin/compliance/approval/april-2026-compliance-review",
      command: "npm run compliance:operator-review-export-v2",
      owner: "operator",
      phase: 4,
      blockedBy: [],
    });
  }

  if (!snapshot.storage.ready) {
    actions.push({
      id: "storage-prod",
      priority: 6,
      title: "Configure production storage",
      description: snapshot.storage.summary,
      href: "/admin/compliance/settings#storage-setup",
      command: "npm run compliance:storage-preflight",
      owner: "steve",
      phase: 6,
      blockedBy: [],
    });
  }

  if (!snapshot.dbMigration.migrated) {
    actions.push({
      id: "db-migration",
      priority: 7,
      title: "DB migration (Steve approval)",
      description: snapshot.dbMigration.operatorAction,
      href: "/admin/compliance/settings",
      owner: "steve",
      phase: 7,
      blockedBy: ["storage-prod"],
    });
  }

  actions.push({
    id: "launch-rehearsal",
    priority: 8,
    title: "Operator launch rehearsal",
    description: "Browser checklist + Netlify verify when sources ready.",
    href: "/admin/compliance/command-center",
    owner: "operator",
    phase: 8,
    blockedBy: snapshot.source.bankCsv === "missing" ? ["add-bank-csv"] : [],
  });

  return actions.sort((a, b) => a.priority - b.priority);
}

export function buildComplianceRiskReport(snapshot: ComplianceBrainSnapshot): ComplianceRisk[] {
  const risks: ComplianceRisk[] = [
    {
      id: "bank-missing",
      severity: snapshot.source.bankCsv === "missing" ? "critical" : "low",
      title: "Bank CSV missing",
      description: "Cannot complete source-backed bank reconciliation rehearsal.",
      mitigation: "Add real treasurer export; run compliance:bank:qa",
      owner: "treasurer",
    },
    {
      id: "filing-red",
      severity: snapshot.filing.overall === "red" ? "critical" : "medium",
      title: "Filing readiness red",
      description: `${snapshot.filing.blockerCount} blocker(s) — do not file.`,
      mitigation: "Resolve blockers on filing readiness page; source-backed only",
      owner: "human",
    },
    {
      id: "batch-zero",
      severity: snapshot.queue.batchEligible === 0 ? "high" : "low",
      title: "Zero batch-eligible items",
      description: "Confidence <98% and rule_review guard — intentional safety.",
      mitigation: "Fix fields/evidence; never batch rule_review",
      owner: "operator",
    },
    {
      id: "rule-review-guard",
      severity: snapshot.queue.ruleReviewItems > 0 ? "high" : "low",
      title: "Rule review items require human topic review",
      description: `${snapshot.queue.ruleReviewItems} rule_review queue items.`,
      mitigation: "Rules page review + per-item override if approving",
      owner: "human",
    },
    {
      id: "storage-local",
      severity: !snapshot.storage.ready ? "high" : "low",
      title: "Storage not production-ready",
      description: snapshot.storage.summary,
      mitigation: "Supabase private bucket + RLS checklist",
      owner: "steve",
    },
    {
      id: "pii-leak",
      severity: "critical",
      title: "PII in git or exports",
      description: "Donor names in commits or public exports.",
      mitigation: "Redacted exports only; gitignore tasks JSON",
      owner: "human",
    },
    {
      id: "fake-green",
      severity: "critical",
      title: "Automated fake compliance green",
      description: "AI or scripts marking filing/batch green without sources.",
      mitigation: "Use AI brain; never bypass gates",
      owner: "ai_assist",
    },
    {
      id: "db-cutover",
      severity: !snapshot.dbMigration.migrated ? "medium" : "low",
      title: "JSON authority vs DB migration",
      description: "Cutover requires Steve-approved migration plan.",
      mitigation: "Follow COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md",
      owner: "steve",
    },
    {
      id: "deploy-unverified",
      severity: "high",
      title: "Production deploy unverified",
      description: "Netlify deploy not confirmed by operator checklist.",
      mitigation: "COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md",
      owner: "operator",
    },
    {
      id: "open-queue-volume",
      severity: snapshot.queue.openItems > 100 ? "high" : "medium",
      title: "Large open approval queue",
      description: `${snapshot.queue.openItems} items need human decisions.`,
      mitigation: "Burn-down v2 export + next-best-item flow",
      owner: "operator",
    },
  ];

  return risks.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });
}
