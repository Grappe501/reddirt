import type { buildCompletionContext } from "./build-completion-context";
import type { CriticalPathItem } from "./completion-engine-types";
import { ORCHESTRATOR_UNSAFE_SHORTCUTS } from "../orchestrator/orchestrator-types";

type Ctx = Awaited<ReturnType<typeof buildCompletionContext>>;

export function buildCriticalPath(ctx: Ctx): CriticalPathItem[] {
  const { orchestrator, inventory, recon, rules } = ctx;
  const items: CriticalPathItem[] = [];
  let rank = 1;

  const add = (partial: Omit<CriticalPathItem, "rank">) => {
    items.push({ rank: rank++, ...partial });
  };

  add({
    id: "audit-checklist",
    title: "Complete April audit checklist (checks + expenditures)",
    owner: "treasurer",
    href: "/admin/compliance/april26",
    command: "npm run compliance:april-audit-checklist",
    whyCritical: `${inventory.summary.unmatchedUploadedChecks} unmatched checks and ${inventory.summary.unmatchedLedgerExpenditures} unmatched ledger lines block honest expense documentation.`,
    unlocks: "Clear have/need list for every row; enables address and vendor pass",
    doNotAutomate: true,
    realisticProgressAfter: "+15–25% documentation clarity (human audit)",
  });

  if (recon.remainingReviewItems > 0) {
    add({
      id: "recon-treasurer",
      title: "Treasurer reconciliation decisions",
      owner: "treasurer",
      href: "/admin/compliance/reconciliation",
      command: "npm run compliance:reconciliation-review-report",
      whyCritical: `${recon.remainingReviewItems} bank credit(s) block reconciliation lock.`,
      unlocks: "Filing path after recon lock",
      doNotAutomate: true,
      realisticProgressAfter: "+10% toward filing if credits resolved",
    });
  }

  if (rules.topicsPendingReview > 0) {
    add({
      id: "rule-topics",
      title: "Verify rule review topics on Rules page",
      owner: "compliance_officer",
      href: "/admin/compliance/rules",
      command: "npm run compliance:rule-resolution-report",
      whyCritical: `${rules.topicsPendingReview} topics gate queue approvals.`,
      unlocks: "Individual rule_review items can move to needs_review",
      doNotAutomate: true,
      realisticProgressAfter: `Queue unlock for ${rules.totalQueueItems} items (not auto-approve)`,
    });
  }

  const nba = orchestrator.snapshot.nextBestAction;
  add({
    id: nba.action.id,
    title: nba.action.title,
    owner: nba.action.owner,
    href: nba.action.href ?? null,
    command: nba.action.command ?? null,
    whyCritical: nba.action.whyItMatters,
    unlocks: nba.action.estimatedImpact.summary,
    doNotAutomate: ORCHESTRATOR_UNSAFE_SHORTCUTS.includes("batch_rule_review" as never),
    realisticProgressAfter: nba.action.estimatedImpact.summary,
  });

  add({
    id: "production-bank-verify",
    title: "Verify production bank import on Netlify",
    owner: "treasurer",
    href: "/admin/compliance/imports/bank",
    command: "npm run compliance:source-truth-audit",
    whyCritical: "Local bank CSV does not prove production state.",
    unlocks: "Production reconciliation rehearsal",
    doNotAutomate: true,
    realisticProgressAfter: "Launch rehearsal complete on production",
  });

  add({
    id: "address-vendor-plan",
    title: "Execute vendor/address completion (after audit)",
    owner: "operator",
    href: "/admin/compliance/vendors",
    command: null,
    whyCritical: `${inventory.summary.missingAddressCount} address flags — collect only after payee confirmed.`,
    unlocks: "Disclosure-complete expenditures",
    doNotAutomate: true,
    realisticProgressAfter: "+20% filing readiness when addresses confirmed",
  });

  return items.slice(0, 10);
}
