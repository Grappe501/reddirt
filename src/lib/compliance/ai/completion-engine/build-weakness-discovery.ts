import type { buildCompletionContext } from "./build-completion-context";
import type { Weakness } from "./completion-engine-types";

type Ctx = Awaited<ReturnType<typeof buildCompletionContext>>;

function w(partial: Weakness): Weakness {
  return partial;
}

export function buildWeaknessDiscovery(ctx: Ctx): { generatedAt: string; commitBase: string; weaknesses: Weakness[]; bySeverity: Record<string, number> } {
  const { brain, expert, inventory, recon, rules, deploy, bank, orchestrator } = ctx;
  const inv = inventory.summary;
  const weaknesses: Weakness[] = [];

  const push = (items: Weakness[]) => weaknesses.push(...items);

  push([
    w({
      id: "filing-red",
      area: "Filing readiness",
      title: "Filing status remains red",
      severity: "critical",
      evidence: `${brain.filing.blockerCount} blocker(s); overall ${brain.filing.overall}`,
      affectedCount: brain.filing.blockerCount,
      whyItMatters: "Cannot represent filing-ready until gates clear.",
      whatIsBlocked: "Final filing export and green status",
      owner: "compliance_officer",
      fastestFix: "Clear reconciliation + documentation blockers",
      permanentFix: "All hard gates pass qa-filing",
      route: "/admin/compliance/filing-readiness",
      command: "npm run compliance:qa-filing",
      doc: "COMPLIANCE_FILING_READINESS.md",
      riskIfIgnored: "Premature or inaccurate filing",
    }),
    w({
      id: "qa-full-yellow",
      area: "QA coverage",
      title: "qa-full not fully green",
      severity: "high",
      evidence: `Launch QA score ${brain.launchReadiness.qaFullScore ?? "—"} (${brain.launchReadiness.qaFullStatus ?? "unknown"})`,
      affectedCount: null,
      whyItMatters: "Yellow QA means some compliance scripts still warn or fail soft gates.",
      whatIsBlocked: "Launch confidence",
      owner: "engineer",
      fastestFix: "npm run compliance:qa-full and fix failing slice",
      permanentFix: "All qa-* scripts green in CI",
      route: "/admin/compliance/command-center",
      command: "npm run compliance:qa-full",
      doc: "COMPLIANCE_PROGRESS_MATRIX.md",
      riskIfIgnored: "Regressions ship to Netlify",
    }),
  ]);

  push([
    w({
      id: "unmatched-checks",
      area: "Checks",
      title: "Uploaded checks without ledger expenditure match",
      severity: "high",
      evidence: `${inv.unmatchedUploadedChecks} of ${inv.uploadedCheckCount} uploaded check records unmatched`,
      affectedCount: inv.unmatchedUploadedChecks,
      whyItMatters: "Cannot prove check cleared bank or tie to expense without pairing.",
      whatIsBlocked: "Expenditure reconciliation closure",
      owner: "treasurer",
      fastestFix: "Run april-audit-checklist Part A vs physical checks",
      permanentFix: "Enter fields + match or mark contribution-only",
      route: "/admin/compliance/april26",
      command: "npm run compliance:april-audit-checklist",
      doc: "COMPLIANCE_APRIL_AUDIT_CHECKLIST.md",
      riskIfIgnored: "Missing or duplicate disclosures",
    }),
    w({
      id: "unmatched-ledger",
      area: "Ledger expenditures",
      title: "Bank debits without check/receipt pairing",
      severity: "high",
      evidence: `${inv.unmatchedLedgerExpenditures} of ${inv.ledgerExpenditureCount} April expenditures unmatched`,
      affectedCount: inv.unmatchedLedgerExpenditures,
      whyItMatters: "Card/POS and fees need receipts; check payments need images.",
      whatIsBlocked: "Expense documentation completeness",
      owner: "operator",
      fastestFix: "Run april-audit-checklist Part B vs bank CSV",
      permanentFix: "Receipt intake + approval for each debit",
      route: "/admin/compliance/receipts",
      command: "npm run compliance:april-expenditure-inventory",
      doc: "COMPLIANCE_APRIL_EXPENDITURE_INVENTORY.md",
      riskIfIgnored: "Unsupported expenditures in filing",
    }),
    w({
      id: "low-exact-matches",
      area: "Checks",
      title: "Few exact check-to-ledger matches",
      severity: "medium",
      evidence: `${inv.exactMatchCount} exact of ${inv.uploadedCheckCount} checks vs ${inv.ledgerExpenditureCount} expenditures`,
      affectedCount: inv.exactMatchCount,
      whyItMatters: "Most work still requires human pairing.",
      whatIsBlocked: "Automated reconciliation confidence",
      owner: "treasurer",
      fastestFix: "Manual audit — do not auto-match uncertain items",
      permanentFix: "Vision extract + treasurer confirm matches",
      route: "/admin/compliance/reconciliation",
      command: null,
      doc: "COMPLIANCE_APRIL_AUDIT_CHECKLIST.md",
      riskIfIgnored: "Wrong payee or amount on report",
    }),
    w({
      id: "missing-addresses",
      area: "Missing addresses",
      title: "Vendor/payee addresses not on file",
      severity: "high",
      evidence: `${inv.missingAddressCount} address gap flags`,
      affectedCount: inv.missingAddressCount,
      whyItMatters: "Arkansas disclosure may require vendor addresses when identified.",
      whatIsBlocked: "Address-complete filing dataset",
      owner: "operator",
      fastestFix: "Collect from W-9/invoice after payee confirmed",
      permanentFix: "Vendor memory model + /admin/compliance/vendors",
      route: "/admin/compliance/vendors",
      command: null,
      doc: "COMPLIANCE_VENDOR_ADDRESS_COMPLETION_PLAN.md",
      riskIfIgnored: "Incomplete expenditure disclosures",
    }),
  ]);

  if (recon.remainingReviewItems > 0) {
    push([
      w({
        id: "recon-treasurer",
        area: "Reconciliation",
        title: "Treasurer reconciliation decisions pending",
        severity: "critical",
        evidence: `${recon.remainingReviewItems} item(s) need treasurer draft or decision`,
        affectedCount: recon.remainingReviewItems,
        whyItMatters: "Bank credits must match GoodChange payouts before filing lock.",
        whatIsBlocked: "Reconciliation lock → filing green",
        owner: "treasurer",
        fastestFix: "Open reconciliation workbench; pick payout or investigation draft",
        permanentFix: "All credits matched or ignored with note",
        route: "/admin/compliance/reconciliation",
        command: "npm run compliance:reconciliation-review-report",
        doc: "COMPLIANCE_RECONCILIATION_REVIEW_PASS.md",
        riskIfIgnored: "Deposit totals disagree with bank",
      }),
    ]);
  }

  if (rules.topicsPendingReview > 0) {
    push([
      w({
        id: "rule-review-topics",
        area: "Rule review",
        title: "Rule topics pending verification",
        severity: "high",
        evidence: `${rules.topicsPendingReview} topics; ${rules.totalQueueItems} queue items gated`,
        affectedCount: rules.topicsPendingReview,
        whyItMatters: "rule_review items cannot batch-approve until topic reviewed.",
        whatIsBlocked: "Queue batch eligibility",
        owner: "compliance_officer",
        fastestFix: "Rules page → review each topic; sync to needs_review only",
        permanentFix: "All topics verified; individual approve with notes",
        route: "/admin/compliance/rules",
        command: "npm run compliance:rule-resolution-report",
        doc: "COMPLIANCE_RULE_RESOLUTION_PASS.md",
        riskIfIgnored: "Approving without rule basis",
      }),
    ]);
  }

  if (!orchestrator.decisionGuard.productionBankAssumption.verified) {
    push([
      w({
        id: "production-bank-unverified",
        area: "Netlify production readiness",
        title: "Production bank source not verified on Netlify",
        severity: "critical",
        evidence: orchestrator.decisionGuard.productionBankAssumption.note,
        affectedCount: null,
        whyItMatters: "Rehearsal on laptop ≠ production bank import.",
        whatIsBlocked: "Netlify reconciliation rehearsal",
        owner: "treasurer",
        fastestFix: "Re-import bank on production after deploy; run source-truth-audit",
        permanentFix: "COMPLIANCE_BANK_PRODUCTION_VERIFIED=true only after verify",
        route: "/admin/compliance/imports/bank",
        command: "npm run compliance:source-truth-audit",
        doc: "COMPLIANCE_NETLIFY_BANK_IMPORT.md",
        riskIfIgnored: "Production shows missing bank",
      }),
    ]);
  }

  if (!brain.storage.ready) {
    push([
      w({
        id: "storage-not-ready",
        area: "Storage/evidence protection",
        title: "Production storage / evidence path not ready",
        severity: "high",
        evidence: `Mode ${brain.storage.mode}; ready=${brain.storage.ready}`,
        affectedCount: null,
        whyItMatters: "Evidence must be protected in production.",
        whatIsBlocked: "Production evidence upload",
        owner: "steve",
        fastestFix: "Complete Supabase storage + RLS plan",
        permanentFix: "Storage preflight green",
        route: "/admin/compliance/command-center",
        command: "npm run compliance:storage-preflight",
        doc: "COMPLIANCE_STORAGE.md",
        riskIfIgnored: "Evidence loss or exposure",
      }),
    ]);
  }

  if (!brain.dbMigration.migrated) {
    push([
      w({
        id: "db-migration-pending",
        area: "DB migration",
        title: "DB migration not applied (JSON authoritative)",
        severity: "medium",
        evidence: brain.dbMigration.operatorAction,
        affectedCount: null,
        whyItMatters: "Prisma path blocked until Steve approves.",
        whatIsBlocked: "DB-backed compliance records",
        owner: "steve",
        fastestFix: "Continue JSON workflow; do not apply migration without approval",
        permanentFix: "Approved migration + deploy",
        route: null,
        command: null,
        doc: "COMPLIANCE_DB_MIGRATION.md",
        riskIfIgnored: "Split brain between JSON and DB",
      }),
    ]);
  }

  push([
    w({
      id: "open-queue-volume",
      area: "Approval queue",
      title: "Large open approval queue",
      severity: "high",
      evidence: `${brain.queue.openItems} open of ${brain.queue.totalItems}`,
      affectedCount: brain.queue.openItems,
      whyItMatters: "Throughput blocks launch and filing.",
      whatIsBlocked: "Batch approval and filing package",
      owner: "operator",
      fastestFix: "queue-burndown + category filters",
      permanentFix: "Category-by-category approval with evidence",
      route: "/admin/compliance/approval/april-2026-compliance-review",
      command: "npm run compliance:queue-burndown",
      doc: "COMPLIANCE_QUEUE_BURNDOWN_PLAN.md",
      riskIfIgnored: "Stale items hide real blockers",
    }),
    w({
      id: "operator-ux-fragmented",
      area: "UX/operator clarity",
      title: "Progress spread across many reports",
      severity: "medium",
      evidence: "Multiple MD/JSON outputs without single completion command",
      affectedCount: null,
      whyItMatters: "Operators lose time finding next step.",
      whatIsBlocked: "30-second clarity",
      owner: "engineer",
      fastestFix: "Use command center Completion Engine panel",
      permanentFix: "completion-engine + audit checklist as home",
      route: "/admin/compliance/command-center",
      command: "npm run compliance:ai-completion-engine",
      doc: "COMPLIANCE_AI_COMPLETION_ENGINE_BRIEF.md",
      riskIfIgnored: "Wrong priority work",
    }),
    w({
      id: "bank-source-local-only",
      area: "Bank data",
      title: "Bank CSV may exist only on local April26 folder",
      severity: "medium",
      evidence: `Primary ${bank.primarySource}; file ${bank.fileFound}; chunks ${bank.databaseBatchCount}`,
      affectedCount: bank.validTransactionCount,
      whyItMatters: "Netlify build does not include Compliance/April26 unless imported.",
      whatIsBlocked: "Production parity",
      owner: "treasurer",
      fastestFix: "Admin bank import on target environment",
      permanentFix: "Verified production chunks",
      route: "/admin/compliance/imports/bank",
      command: "npm run compliance:bank:qa",
      doc: "COMPLIANCE_SOURCE_TRUTH_UNLOCK_PASS.md",
      riskIfIgnored: "Empty bank on production",
    }),
  ]);

  const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const item of weaknesses) bySeverity[item.severity] = (bySeverity[item.severity] ?? 0) + 1;

  return {
    generatedAt: new Date().toISOString(),
    commitBase: brain.commitBase,
    weaknesses,
    bySeverity,
  };
}

export function renderWeaknessReportMd(report: ReturnType<typeof buildWeaknessDiscovery>): string {
  const lines = [
    "# Compliance weakness discovery report",
    "",
    `Generated: ${report.generatedAt} · Commit: \`${report.commitBase}\``,
    "",
    "## Severity summary",
    "",
    `| Critical | High | Medium | Low | Info |`,
    `| ---: | ---: | ---: | ---: | ---: |`,
    `| ${report.bySeverity.critical ?? 0} | ${report.bySeverity.high ?? 0} | ${report.bySeverity.medium ?? 0} | ${report.bySeverity.low ?? 0} | ${report.bySeverity.info ?? 0} |`,
    "",
    "## All weaknesses",
    "",
  ];
  for (const area of [...new Set(report.weaknesses.map((w) => w.area))]) {
    lines.push(`### ${area}`, "");
    for (const w of report.weaknesses.filter((x) => x.area === area)) {
      lines.push(
        `#### ${w.title} (${w.severity})`,
        "",
        `- Evidence: ${w.evidence}`,
        w.affectedCount != null ? `- Affected: ${w.affectedCount}` : "",
        `- Why: ${w.whyItMatters}`,
        `- Blocked: ${w.whatIsBlocked}`,
        `- Owner: ${w.owner}`,
        `- Fastest fix: ${w.fastestFix}`,
        `- Permanent fix: ${w.permanentFix}`,
        w.route ? `- Route: ${w.route}` : "",
        w.command ? `- Command: \`${w.command}\`` : "",
        w.doc ? `- Doc: ${w.doc}` : "",
        `- Risk if ignored: ${w.riskIfIgnored}`,
        "",
      );
    }
  }
  lines.push("Regenerate: `npm run compliance:weakness-discovery`");
  return lines.filter(Boolean).join("\n");
}
