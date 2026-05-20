import { buildApril26ImportStatus } from "../imports/april26-import-status";
import { buildBankReconciliationRehearsal } from "../imports/bank-reconciliation-rehearsal";
import { buildAprilExpenditureInventory } from "../inventory/build-april-expenditure-inventory";
import { loadApprovalItems } from "../approval/approval-storage";
import { loadOzarkForwardAuctionDonations } from "../in-kind/ozark-forward-auction-donations";
import { buildFilingBlockerBurnDown } from "../filing-readiness/filing-blocker-burn-down";
import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";
import { getAprilCheckSosWorkbookStats, getEntryMissingRequired } from "../checks/april-check-sos-workbook.shared";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AprilCheckSosWorkbook } from "../checks/april-check-sos-workbook.shared";

export type ErnieWorkflowSection = {
  step: number;
  title: string;
  status: "complete" | "in_progress" | "blocked" | "not_started";
  countRemaining: number;
  primaryAction: string;
  href: string;
  whatThisMeans: string;
  doneLooksLike: string;
};

export type ErnieWorkflowSnapshot = {
  generatedAt: string;
  sections: ErnieWorkflowSection[];
  avoidGenericQueue: { openItems: number; message: string };
  spreadsheetPath: string;
};

export async function buildErnieWorkflowSnapshot(): Promise<ErnieWorkflowSnapshot> {
  const [april26, inventory, rehearsal, items, inKind, filing, corpus, workbook] = await Promise.all([
    buildApril26ImportStatus(),
    buildAprilExpenditureInventory(),
    buildBankReconciliationRehearsal(),
    loadApprovalItems(),
    loadOzarkForwardAuctionDonations(),
    buildFilingBlockerBurnDown(),
    loadComplianceRuleCorpus(),
    (async (): Promise<AprilCheckSosWorkbook | null> => {
      try {
        const raw = await readFile(path.join(process.cwd(), "data", "compliance", "checks", "april-check-sos-entries.json"), "utf8");
        return JSON.parse(raw) as AprilCheckSosWorkbook;
      } catch {
        return null;
      }
    })(),
  ]);

  const ruleAudit = auditComplianceRuleCorpus(corpus);
  const unverifiedRules = ruleAudit.topicCoverage.filter((t) => !t.verified).length;
  const inKindPhotos = items.filter((i) => i.source === "in_kind_contribution" && i.subtitle?.startsWith("att."));
  const sosStats = workbook ? getAprilCheckSosWorkbookStats(workbook) : null;
  const sosMissing = workbook
    ? workbook.entries.filter((e) => getEntryMissingRequired(e).length > 0).length
    : 0;
  const openQueue = items.filter((i) => ["queued", "needs_review", "ready", "reopened"].includes(i.status)).length;

  const sections: ErnieWorkflowSection[] = [
    {
      step: 1,
      title: "Checks → SOS entry",
      status: sosStats && sosStats.readyForSos === sosStats.totalChecks && sosStats.totalChecks > 0 ? "complete" : "in_progress",
      countRemaining: sosStats ? sosStats.totalChecks - sosStats.readyForSos : inventory.summary.uploadedCheckCount,
      primaryAction: "Extract all donation photos; verify each physical check; copy to SOS",
      href: "/admin/compliance/checks/sos-entry",
      whatThisMeans: "Seven HEIC photos may contain multiple checks each. Use the SOS board, not the generic approval queue.",
      doneLooksLike: "Every physical check has amount, date, payee, and address verified; SOS entries submitted.",
    },
    {
      step: 2,
      title: "In-kind auction → Ozark spreadsheet",
      status: inKind.rows.length > 0 ? "in_progress" : "not_started",
      countRemaining: inKind.rows.length,
      primaryAction: "Work the 49 auction line items; download CSV for SOS",
      href: "/admin/compliance/in-kind/ozark-auction",
      whatThisMeans: "Three att.* photos are evidence only. Line items live on the Ozark auction page.",
      doneLooksLike: "All auction rows entered in SOS; three photos approved in in-kind queue.",
    },
    {
      step: 3,
      title: "Bank matching → reconciliation",
      status: rehearsal.unmatchedBank.length === 0 && rehearsal.ambiguous.length === 0 ? "complete" : "in_progress",
      countRemaining: rehearsal.unmatchedBank.length + rehearsal.ambiguous.length,
      primaryAction: "Resolve ambiguous and unmatched bank lines manually",
      href: "/admin/compliance/reconciliation",
      whatThisMeans: "No auto-match for uncertain entries. Treasurer confirms pairings.",
      doneLooksLike: "Ambiguous (14) and unmatched bank (10) documented or resolved.",
    },
    {
      step: 4,
      title: "Missing addresses → audit spreadsheet",
      status: inventory.summary.missingAddressCount === 0 ? "complete" : "in_progress",
      countRemaining: inventory.summary.missingAddressCount,
      primaryAction: "Fill address rows in audit CSV from source only",
      href: "/admin/compliance/ernie#spreadsheet",
      whatThisMeans: "Do not invent addresses. Use vendor docs or ask payee.",
      doneLooksLike: "Address gaps cleared or marked N/A with note in spreadsheet.",
    },
    {
      step: 5,
      title: "Rule review → rules workflow",
      status: unverifiedRules === 0 ? "complete" : "blocked",
      countRemaining: unverifiedRules,
      primaryAction: "Review rule topics on Rules page",
      href: "/admin/compliance/rules",
      whatThisMeans: "Campaign workflow review — not legal certification. Cannot batch approve.",
      doneLooksLike: "Each required topic marked reviewed with initials.",
    },
    {
      step: 6,
      title: "Filing readiness → final blockers",
      status: "blocked",
      countRemaining: filing.blockers.length,
      primaryAction: "Review filing readiness after steps 1–5",
      href: "/admin/compliance/filing-readiness",
      whatThisMeans: "Filing stays red until audit, reconciliation, rules, and treasurer sign-off.",
      doneLooksLike: "Treasurer confirms filing package; readiness moves toward yellow/green.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    sections,
    avoidGenericQueue: {
      openItems: openQueue,
      message: `The generic approval queue has ${openQueue} items. Complete the April audit spreadsheet and SOS/Ozark workflows first.`,
    },
    spreadsheetPath: "docs/compliance/audit/april-2026-compliance-audit.csv",
  };
}
