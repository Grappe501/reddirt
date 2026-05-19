import { buildApril26ImportStatus } from "../imports/april26-import-status";
import { loadApprovalItems } from "../approval/approval-storage";
import { checkComplianceStorageHealth } from "../storage/storage-health";
import { buildFilingReadinessReport } from "./build-filing-readiness-report";
import { evaluateFilingHardGates } from "./hard-gates";
import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";

export type FilingBlockerCategory = "approval" | "reconciliation" | "source" | "storage" | "db" | "rules";

export type FilingBlockerTask = {
  id: string;
  label: string;
  count: number;
  role: string;
  nextAction: string;
  href: string;
  category: FilingBlockerCategory;
  leverage: "high" | "medium" | "low";
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

  if (ruleAudit.topicCoverage.some((t) => !t.verified)) {
    tasks.push({
      id: "rules",
      label: "Rule verification missing",
      count: ruleAudit.topicCoverage.filter((t) => !t.verified).length,
      role: "Compliance officer",
      nextAction: "Review each topic with official sources — source reviewed for campaign workflow, not legal certification.",
      href: "/admin/compliance/rules",
      category: "rules",
      leverage: "high",
    });
  }
  if (!april26.bankCsvFound) {
    tasks.push({
      id: "bank-csv",
      label: "Bank CSV missing",
      count: 1,
      role: "Treasurer",
      nextAction: `Add bank-april-2026.csv to ${april26.folderPath} (date, amount, memo; credits positive).`,
      href: "/admin/compliance/april26",
      category: "source",
      leverage: "high",
    });
  }
  if (unapproved > 0) {
    tasks.push({
      id: "approval",
      label: "Unapproved records",
      count: unapproved,
      role: "Compliance reviewer",
      nextAction: "Work Lightning Approval queue — high risk first, then ready items.",
      href: "/admin/compliance/approval/april-2026-compliance-review",
      category: "approval",
      leverage: "high",
    });
  }
  if (april26.stagedNeedingReconciliation > 0) {
    tasks.push({
      id: "recon",
      label: "Unreconciled records",
      count: april26.stagedNeedingReconciliation,
      role: "Treasurer",
      nextAction: "Approve or lock bank matches in reconciliation workbench.",
      href: "/admin/compliance/reconciliation",
      category: "reconciliation",
      leverage: "high",
    });
  }
  const docBlockers = report.blockers.filter((b) => /document|receipt|w-9|w9/i.test(b));
  if (docBlockers.length) {
    tasks.push({
      id: "docs",
      label: "Missing documentation",
      count: docBlockers.length,
      role: "Field staff / Treasurer",
      nextAction: "Complete receipts, W-9s, and vendor documentation.",
      href: "/admin/compliance/receipts",
      category: "source",
      leverage: "medium",
    });
  }
  if (!storage.ready) {
    tasks.push({
      id: "storage",
      label: "Storage not production-ready",
      count: 1,
      role: "Technical operator",
      nextAction: "Configure Supabase private bucket and verify RLS.",
      href: "/admin/compliance/settings#storage-setup",
      category: "storage",
      leverage: "medium",
    });
  }
  if (process.env.COMPLIANCE_DB_MIGRATED !== "true") {
    tasks.push({
      id: "db",
      label: "DB persistence not production-ready",
      count: 1,
      role: "Technical operator",
      nextAction: "Follow COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md before cutover.",
      href: "/admin/compliance/settings",
      category: "db",
      leverage: "low",
    });
  }

  for (const gate of hardGates.filter((g) => g.blocking && g.status !== "passed")) {
    tasks.push({
      id: `gate-${gate.id}`,
      label: gate.label,
      count: 1,
      role: "Compliance officer",
      nextAction: gate.explanation,
      href: "/admin/compliance/filing-readiness",
      category: "approval",
      leverage: "high",
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
