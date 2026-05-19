import type { buildCompletionContext } from "./build-completion-context";
import type { BlockerNode } from "./completion-engine-types";

type Ctx = Awaited<ReturnType<typeof buildCompletionContext>>;

export function buildBlockerGraph(ctx: Ctx): { nodes: BlockerNode[]; edges: Array<{ from: string; to: string }> } {
  const { brain, inventory, recon, rules, orchestrator } = ctx;
  const inv = inventory.summary;

  const nodes: BlockerNode[] = [
    {
      id: "missing-address",
      label: "Missing vendor/payee addresses",
      status: inv.missingAddressCount > 0 ? "open" : "resolved",
      owner: "operator",
      blocks: ["disclosure-complete", "filing-green"],
      blockedBy: ["payee-identified", "human-audit"],
      relatedCount: inv.missingAddressCount,
      route: "/admin/compliance/vendors",
      command: null,
      safeNextAction: "Collect address from W-9/invoice after payee confirmed — never guess",
    },
    {
      id: "ambiguous-credit",
      label: "Unmatched/ambiguous bank credits",
      status: recon.remainingReviewItems > 0 ? "open" : "in_progress",
      owner: "treasurer",
      blocks: ["recon-locked", "filing-green"],
      blockedBy: ["bank-source-valid"],
      relatedCount: recon.remainingReviewItems,
      route: "/admin/compliance/reconciliation",
      command: "npm run compliance:reconciliation-review-report",
      safeNextAction: "Treasurer picks payout or creates investigation draft",
    },
    {
      id: "rule-topic-unverified",
      label: "Rule topics not verified",
      status: rules.topicsPendingReview > 0 ? "guarded" : "resolved",
      owner: "compliance_officer",
      blocks: ["batch-approve-rule-review"],
      blockedBy: [],
      relatedCount: rules.topicsPendingReview,
      route: "/admin/compliance/rules",
      command: "npm run compliance:rule-resolution-report",
      safeNextAction: "Mark topic reviewed → items become needs_review only (not auto-approve)",
    },
    {
      id: "production-bank",
      label: "Production bank not verified",
      status: orchestrator.decisionGuard.productionBankAssumption.verified ? "resolved" : "open",
      owner: "treasurer",
      blocks: ["netlify-rehearsal-complete"],
      blockedBy: ["netlify-deploy"],
      relatedCount: null,
      route: "/admin/compliance/imports/bank",
      command: "npm run compliance:source-truth-audit",
      safeNextAction: "Re-import bank on Netlify; verify chunks",
    },
    {
      id: "storage-rls",
      label: "Supabase storage/RLS incomplete",
      status: brain.storage.ready ? "resolved" : "open",
      owner: "steve",
      blocks: ["production-evidence-ready"],
      blockedBy: [],
      relatedCount: null,
      route: null,
      command: "npm run compliance:storage-preflight",
      safeNextAction: "Steve: complete storage policy before production evidence",
    },
    {
      id: "db-migration",
      label: "DB migration not approved",
      status: brain.dbMigration.migrated ? "resolved" : "guarded",
      owner: "steve",
      blocks: ["db-authoritative"],
      blockedBy: ["steve-approval"],
      relatedCount: null,
      route: null,
      command: null,
      safeNextAction: "Keep JSON authoritative until approved",
    },
    {
      id: "unmatched-expenditures",
      label: "Unmatched April expenditures",
      status: inv.unmatchedLedgerExpenditures > 0 ? "open" : "resolved",
      owner: "operator",
      blocks: ["expense-documentation-complete"],
      blockedBy: ["human-audit"],
      relatedCount: inv.unmatchedLedgerExpenditures,
      route: "/admin/compliance/april26",
      command: "npm run compliance:april-audit-checklist",
      safeNextAction: "Audit Part B; attach receipts",
    },
    {
      id: "filing-green",
      label: "Filing green",
      status: brain.filing.overall === "green" ? "resolved" : "open",
      owner: "compliance_officer",
      blocks: [],
      blockedBy: ["recon-locked", "disclosure-complete", "qa-filing"],
      relatedCount: brain.filing.blockerCount,
      route: "/admin/compliance/filing-readiness",
      command: "npm run compliance:qa-filing",
      safeNextAction: "Do not fake green — clear blockers first",
    },
  ];

  const edges = [
    { from: "missing-address", to: "disclosure-complete" },
    { from: "disclosure-complete", to: "filing-green" },
    { from: "ambiguous-credit", to: "recon-locked" },
    { from: "recon-locked", to: "filing-green" },
    { from: "rule-topic-unverified", to: "batch-approve-rule-review" },
    { from: "production-bank", to: "netlify-rehearsal-complete" },
    { from: "storage-rls", to: "production-evidence-ready" },
    { from: "unmatched-expenditures", to: "expense-documentation-complete" },
  ];

  return { nodes, edges };
}
