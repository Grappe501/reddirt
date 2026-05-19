import { buildApril26ImportStatus } from "../imports/april26-import-status";
import { loadApprovalItems } from "../approval/approval-storage";
import { checkComplianceStorageHealth } from "../storage/storage-health";
import { buildFilingReadinessReport } from "./build-filing-readiness-report";
import { evaluateFilingHardGates } from "./hard-gates";
import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";

export type FilingBlockerCategory = "approval" | "reconciliation" | "source" | "storage" | "db" | "rules";

export type FilingBlockerSeverity = "critical" | "high" | "medium" | "low";

export type FilingBlockerTask = {
  id: string;
  label: string;
  count: number;
  role: string;
  nextAction: string;
  href: string;
  category: FilingBlockerCategory;
  leverage: "high" | "medium" | "low";
  severity: FilingBlockerSeverity;
  operatorFixableToday: boolean;
  greenCondition: string;
  sourceDependency: boolean;
  queueDependency: boolean;
  reconciliationDependency: boolean;
  storageDependency: boolean;
  dbDependency: boolean;
};

export type FilingGreenPath = {
  blockers: FilingBlockerTask[];
  whatWouldMakeGreen: string[];
};

export async function buildFilingBlockerBurnDown(): Promise<FilingGreenPath> {
  const [report, hardGates, april26, storage, corpus, items] = await Promise.all([
    buildFilingReadinessReport(),
    evaluateFilingHardGates(),
    buildApril26ImportStatus(),
    checkComplianceStorageHealth(),
    loadComplianceRuleCorpus(),
    loadApprovalItems(),
  ]);
  const ruleAudit = auditComplianceRuleCorpus(corpus);
  const unapproved = items.filter((item) => ["queued", "needs_review", "ready", "reopened"].includes(item.status)).length;
  const tasks: FilingBlockerTask[] = [];

  const push = (task: Omit<FilingBlockerTask, "severity" | "operatorFixableToday" | "greenCondition" | "sourceDependency" | "queueDependency" | "reconciliationDependency" | "storageDependency" | "dbDependency"> & Partial<Pick<FilingBlockerTask, "severity" | "operatorFixableToday" | "greenCondition" | "sourceDependency" | "queueDependency" | "reconciliationDependency" | "storageDependency" | "dbDependency">>) => {
    tasks.push({
      severity: task.severity ?? "high",
      operatorFixableToday: task.operatorFixableToday ?? true,
      greenCondition: task.greenCondition ?? "Condition resolved in source-backed workflow.",
      sourceDependency: task.sourceDependency ?? false,
      queueDependency: task.queueDependency ?? false,
      reconciliationDependency: task.reconciliationDependency ?? false,
      storageDependency: task.storageDependency ?? false,
      dbDependency: task.dbDependency ?? false,
      ...task,
    });
  };

  if (ruleAudit.topicCoverage.some((t) => !t.verified)) {
    push({
      id: "rules",
      label: "Rule verification missing",
      count: ruleAudit.topicCoverage.filter((t) => !t.verified).length,
      role: "Compliance officer",
      nextAction: "Review each topic with official sources — source reviewed for campaign workflow, not legal certification.",
      href: "/admin/compliance/rules",
      category: "rules",
      leverage: "high",
      severity: "critical",
      operatorFixableToday: true,
      greenCondition: "All required rule topics marked reviewed with initials on Rules page.",
      queueDependency: true,
    });
  }
  if (!april26.bankCsvFound) {
    push({
      id: "bank-csv",
      label: "Bank CSV missing",
      count: 1,
      role: "Treasurer",
      nextAction: `Add bank-april-2026.csv to ${april26.folderPath} (date, amount, memo; credits positive).`,
      href: "/admin/compliance/april26",
      category: "source",
      leverage: "high",
      severity: "critical",
      operatorFixableToday: true,
      greenCondition: "bank-april-2026.csv validates and reconciliation rehearsal passes.",
      sourceDependency: true,
      reconciliationDependency: true,
    });
  }
  if (unapproved > 0) {
    push({
      id: "approval",
      label: "Unapproved records",
      count: unapproved,
      role: "Compliance reviewer",
      nextAction: "Work Lightning Approval queue — high risk first, then ready items.",
      href: "/admin/compliance/approval/april-2026-compliance-review",
      category: "approval",
      leverage: "high",
      severity: "high",
      operatorFixableToday: true,
      greenCondition: "Open approval items reach approved/needs-info/rejected terminal states.",
      queueDependency: true,
    });
  }
  if (april26.stagedNeedingReconciliation > 0) {
    push({
      id: "recon",
      label: "Unreconciled records",
      count: april26.stagedNeedingReconciliation,
      role: "Treasurer",
      nextAction: "Approve or lock bank matches in reconciliation workbench.",
      href: "/admin/compliance/reconciliation",
      category: "reconciliation",
      leverage: "high",
      severity: "high",
      operatorFixableToday: april26.bankCsvFound,
      greenCondition: "Matches approved or locked; unmatched bank/payout lists empty.",
      reconciliationDependency: true,
      sourceDependency: true,
    });
  }
  const docBlockers = report.blockers.filter((b) => /document|receipt|w-9|w9/i.test(b));
  if (docBlockers.length) {
    push({
      id: "docs",
      label: "Missing documentation",
      count: docBlockers.length,
      role: "Field staff / Treasurer",
      nextAction: "Complete receipts, W-9s, and vendor documentation.",
      href: "/admin/compliance/receipts",
      category: "source",
      leverage: "medium",
      severity: "medium",
      operatorFixableToday: true,
      greenCondition: "Documentation gaps cleared in staged records.",
      sourceDependency: true,
    });
  }
  if (!storage.ready) {
    push({
      id: "storage",
      label: "Storage not production-ready",
      count: 1,
      role: "Technical operator",
      nextAction: "Configure Supabase private bucket and verify RLS.",
      href: "/admin/compliance/settings#storage-setup",
      category: "storage",
      leverage: "medium",
      severity: "medium",
      operatorFixableToday: false,
      greenCondition: "Storage health probe reports ready with RLS verified flag.",
      storageDependency: true,
    });
  }
  if (process.env.COMPLIANCE_DB_MIGRATED !== "true") {
    push({
      id: "db",
      label: "DB persistence not production-ready",
      count: 1,
      role: "Technical operator",
      nextAction: "Follow COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md before cutover.",
      href: "/admin/compliance/settings",
      category: "db",
      leverage: "low",
      severity: "low",
      operatorFixableToday: false,
      greenCondition: "Steve-approved migration + COMPLIANCE_DB_MIGRATED=true after backfill.",
      dbDependency: true,
    });
  }

  for (const gate of hardGates.filter((g) => g.blocking && g.status !== "passed")) {
    push({
      id: `gate-${gate.id}`,
      label: gate.label,
      count: 1,
      role: "Compliance officer",
      nextAction: gate.explanation,
      href: "/admin/compliance/filing-readiness",
      category: "approval",
      leverage: "high",
      severity: "critical",
      operatorFixableToday: gate.id !== "storage",
      greenCondition: `Hard gate "${gate.label}" passes or authorized override with initials.`,
      queueDependency: true,
    });
  }

  const whatWouldMakeGreen = [
    "All hard gates pass or have authorized override with initials + reason.",
    "April26 bank CSV imported and reconciliation matches approved/locked.",
    "Approval queue reviewed for April 2026 staged records.",
    "Rule topics marked reviewed for campaign workflow (not legal certification).",
    "Supabase private storage configured with RLS verified.",
    "Human compliance officer signs off — system never auto-certifies filing.",
  ];

  return { blockers: tasks, whatWouldMakeGreen };
}
