import { readFile } from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { buildCompletionContext } from "../completion-engine/build-completion-context";
import { buildCompletionEnginePackage } from "../completion-engine/build-completion-engine";
import { buildApril26ImportStatus } from "../../imports/april26-import-status";
import { buildBankReconciliationRehearsal } from "../../imports/bank-reconciliation-rehearsal";
import { loadApprovalItems } from "../../approval/approval-storage";
import { loadOzarkForwardAuctionDonations } from "../../in-kind/ozark-forward-auction-donations";
import { buildFilingBlockerBurnDown } from "../../filing-readiness/filing-blocker-burn-down";
import { buildFilingBlockerNavigator } from "../../audit/build-filing-blocker-navigator";
import { buildAprilAuditImportPreview } from "../../audit/build-april-audit-import-preview";
import { getAprilCheckSosWorkbookStats, getEntryMissingRequired } from "../../checks/april-check-sos-workbook.shared";
import type { AprilCheckSosWorkbook } from "../../checks/april-check-sos-workbook.shared";
import { buildDeployReadinessReport } from "../expert/build-deploy-readiness";
import { checkComplianceStorageHealth } from "../../storage/storage-health";

export function gitShortHead(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function loadSosWorkbook(): Promise<AprilCheckSosWorkbook | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "compliance", "checks", "april-check-sos-entries.json"), "utf8");
    const w = JSON.parse(raw) as AprilCheckSosWorkbook;
    if (!Array.isArray(w.entries)) return null;
    return {
      ...w,
      sourceImages: Array.isArray(w.sourceImages) ? w.sourceImages : [],
      entries: w.entries,
    };
  } catch {
    return null;
  }
}

async function auditSpreadsheetRowCount(): Promise<{ rows: number; present: boolean }> {
  const p = path.join(process.cwd(), "docs", "compliance", "audit", "april-2026-compliance-audit.csv");
  try {
    const text = await readFile(p, "utf8");
    const lines = text.trim().split(/\r?\n/).length - 1;
    return { rows: Math.max(0, lines), present: true };
  } catch {
    return { rows: 0, present: false };
  }
}

export async function gatherIntelligenceContext() {
  const [
    completionCtx,
    enginePkg,
    april26,
    rehearsal,
    approvalItems,
    inKind,
    filingBurnDown,
    filingNav,
    importPreview,
    deploy,
    storage,
    workbook,
    auditCsv,
  ] = await Promise.all([
    buildCompletionContext(),
    buildCompletionEnginePackage(),
    buildApril26ImportStatus(),
    buildBankReconciliationRehearsal(),
    loadApprovalItems(),
    loadOzarkForwardAuctionDonations(),
    buildFilingBlockerBurnDown(),
    buildFilingBlockerNavigator(),
    buildAprilAuditImportPreview(),
    buildDeployReadinessReport(),
    checkComplianceStorageHealth(),
    loadSosWorkbook(),
    auditSpreadsheetRowCount(),
  ]);

  const openItems = approvalItems.filter((i) =>
    ["queued", "needs_review", "ready", "reopened"].includes(i.status),
  );
  const ruleReview = approvalItems.filter((i) => i.source === "rule_review");
  const batchEligible = approvalItems.filter(
    (i) =>
      i.confidenceScore >= 98 &&
      !i.blockers.length &&
      i.evidence.length > 0 &&
      i.source !== "rule_review" &&
      ["queued", "needs_review", "ready"].includes(i.status),
  );
  const inKindPhotos = approvalItems.filter(
    (i) => i.source === "in_kind_contribution" && i.subtitle?.startsWith("att."),
  );
  const sosStats = workbook ? getAprilCheckSosWorkbookStats(workbook) : null;
  const sosMissing = workbook
    ? workbook.entries.filter((e) => getEntryMissingRequired(e).length > 0).length
    : 0;

  return {
    commitBase: gitShortHead(),
    completionCtx,
    enginePkg,
    april26,
    rehearsal,
    approvalItems,
    openItems,
    ruleReview,
    batchEligible,
    inKindPhotos,
    filingBurnDown,
    filingNav,
    importPreview,
    deploy,
    storage,
    workbook,
    sosStats,
    sosMissing,
    inKind,
    auditCsv,
  };
}

export type IntelligenceContext = Awaited<ReturnType<typeof gatherIntelligenceContext>>;
