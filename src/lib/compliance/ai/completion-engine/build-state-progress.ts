import type { buildCompletionContext } from "./build-completion-context";
import type { StateProgressArea } from "./completion-engine-types";

type Ctx = Awaited<ReturnType<typeof buildCompletionContext>>;

export function buildStateProgress(ctx: Ctx): {
  generatedAt: string;
  commitBase: string;
  overallPercentComplete: number;
  filingStatus: string;
  qaFullStatus: string;
  productionBankVerified: boolean;
  metrics: Record<string, number | string | boolean>;
  areas: StateProgressArea[];
} {
  const { brain, expert, inventory, recon, rules, deploy, orchestrator, progress } = ctx;
  const inv = inventory.summary;

  const metrics = {
    uploadedChecks: inv.uploadedCheckCount,
    ledgerExpenditures: inv.ledgerExpenditureCount,
    exactMatches: inv.exactMatchCount,
    unmatchedChecks: inv.unmatchedUploadedChecks,
    unmatchedLedger: inv.unmatchedLedgerExpenditures,
    missingAddressFlags: inv.missingAddressCount,
    ruleReviewTopics: rules.topicsPendingReview,
    filingBlockers: brain.filing.blockerCount,
    reconciliationReviewItems: recon.remainingReviewItems,
    openQueueItems: brain.queue.openItems,
    qaScore: brain.launchReadiness.qaFullScore ?? "—",
    deployReady: deploy.readyForNetlifyDeploy,
    productionBankVerified: orchestrator.decisionGuard.productionBankAssumption.verified,
  };

  const areas: StateProgressArea[] = progress.areas.map((a) => ({
    area: a.area,
    percentComplete: a.percentComplete,
    status: a.status,
    whatIsComplete: a.percentComplete >= 80 ? [a.completionActions[0] ?? "Major milestones met"].filter(Boolean) : [],
    whatIsStartedIncomplete: a.blockers.length ? [`In progress — ${a.immediateActions[0] ?? ""}`] : [a.immediateActions[0] ?? ""].filter(Boolean),
    whatIsMissing: a.blockers,
    whatIsBlocked: a.status === "blocked" ? a.blockers : [],
    immediateNextAction: a.immediateActions[0] ?? "See command center",
    completionAction: a.completionActions[0] ?? "Area green in expert progress",
    owner: a.owner,
    expectedImpact: a.launchCriticality === "critical" ? "Unlocks launch/filing path" : "Reduces queue risk",
  }));

  areas.push({
    area: "April check/expenditure audit",
    percentComplete: inv.ledgerExpenditureCount
      ? Math.round((inv.exactMatchCount / Math.max(inv.uploadedCheckCount + inv.ledgerExpenditureCount, 1)) * 100)
      : 10,
    status: inv.unmatchedLedgerExpenditures > 20 ? "blocked" : "in_progress",
    whatIsComplete: [`${inv.exactMatchCount} exact system matches`, "Inventory + audit checklist generated"],
    whatIsStartedIncomplete: [`${inv.uploadedCheckCount} check records cataloged`, `${inv.ledgerExpenditureCount} ledger lines cataloged`],
    whatIsMissing: [
      `${inv.unmatchedUploadedChecks} unmatched checks`,
      `${inv.unmatchedLedgerExpenditures} unmatched ledger lines`,
      `${inv.missingAddressCount} address flags`,
    ],
    whatIsBlocked: ["Human audit against physical checks and bank CSV required"],
    immediateNextAction: "Run compliance:april-audit-checklist and audit Part A + B",
    completionAction: "All rows audited; fields entered; matches treasurer-confirmed",
    owner: "treasurer",
    expectedImpact: "Unlocks expenditure documentation and address pass",
  });

  return {
    generatedAt: new Date().toISOString(),
    commitBase: brain.commitBase,
    overallPercentComplete: progress.overallPercentComplete,
    filingStatus: brain.filing.overall,
    qaFullStatus: brain.launchReadiness.qaFullStatus ?? "unknown",
    productionBankVerified: orchestrator.decisionGuard.productionBankAssumption.verified,
    metrics,
    areas,
  };
}

export function renderStateProgressMd(report: ReturnType<typeof buildStateProgress>): string {
  const lines = [
    "# Compliance current state and progress",
    "",
    `Generated: ${report.generatedAt} · Commit: \`${report.commitBase}\``,
    "",
    `**Overall completion:** ${report.overallPercentComplete}% · **Filing:** ${report.filingStatus} · **QA full:** ${report.qaFullStatus}`,
    "",
    "## Live metrics",
    "",
    "| Metric | Value |",
    "| --- | --- |",
    ...Object.entries(report.metrics).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Progress by area",
    "",
    "| Area | % | Status | Immediate next | Owner |",
    "| --- | ---: | --- | --- | --- |",
    ...report.areas.map(
      (a) => `| ${a.area} | ${a.percentComplete} | ${a.status} | ${a.immediateNextAction.slice(0, 60)} | ${a.owner} |`,
    ),
    "",
  ];
  for (const a of report.areas) {
    lines.push(`### ${a.area} (${a.percentComplete}%)`, "", `**Complete:** ${a.whatIsComplete.join("; ") || "—"}`, `**Incomplete:** ${a.whatIsStartedIncomplete.join("; ")}`, `**Missing:** ${a.whatIsMissing.join("; ") || "—"}`, `**Blocked:** ${a.whatIsBlocked.join("; ") || "—"}`, `**Done when:** ${a.completionAction}`, "", "");
  }
  lines.push("Regenerate: `npm run compliance:state-progress`");
  return lines.join("\n");
}
