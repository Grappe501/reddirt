import { buildCompletionContext } from "./build-completion-context";
import { buildWeaknessDiscovery } from "./build-weakness-discovery";
import { buildStateProgress } from "./build-state-progress";
import { buildBlockerGraph } from "./build-blocker-graph";
import { buildCriticalPath } from "./build-critical-path";
import { buildWorkSequencer } from "./build-work-sequencer";
import { buildCompletionForecast } from "./build-completion-forecast";
import { buildFocusBrief } from "./build-focus-brief";
import type { CompletionEngine } from "./completion-engine-types";
import { ORCHESTRATOR_UNSAFE_SHORTCUTS } from "../orchestrator/orchestrator-types";
import { buildHardeningAudit } from "./build-hardening-audit";

export async function buildCompletionEnginePackage() {
  const ctx = await buildCompletionContext();
  const hardening = await buildHardeningAudit();
  const weakness = buildWeaknessDiscovery(ctx);
  const stateProgress = buildStateProgress(ctx);
  const blockerGraph = buildBlockerGraph(ctx);
  const criticalPath = buildCriticalPath(ctx);
  const workSequencer = buildWorkSequencer(ctx);
  const forecast = buildCompletionForecast(ctx);
  const focus = buildFocusBrief(ctx);
  const nba = ctx.orchestrator.snapshot.nextBestAction;

  const topBlocker =
    blockerGraph.nodes.find((n) => n.status === "open" && n.blocks.includes("filing-green")) ??
    blockerGraph.nodes.find((n) => n.status === "open") ??
    blockerGraph.nodes[0];

  const engine: CompletionEngine = {
    generatedAt: new Date().toISOString(),
    commitBase: ctx.brain.commitBase,
    overallPercentComplete: ctx.progress.overallPercentComplete,
    filingStatus: stateProgress.filingStatus,
    qaFullStatus: stateProgress.qaFullStatus,
    nextBestAction: {
      title: criticalPath[0]?.title ?? nba.action.title,
      owner: criticalPath[0]?.owner ?? nba.action.owner,
      href: criticalPath[0]?.href ?? nba.action.href ?? null,
      command: criticalPath[0]?.command ?? nba.action.command ?? null,
      plainEnglish: focus.plainEnglish,
      expectedImpact: criticalPath[0]?.unlocks ?? nba.action.estimatedImpact.summary,
    },
    topBlocker: {
      id: topBlocker.id,
      label: topBlocker.label,
      owner: topBlocker.owner,
    },
    criticalPath,
    weaknessSummary: {
      critical: weakness.bySeverity.critical ?? 0,
      high: weakness.bySeverity.high ?? 0,
      medium: weakness.bySeverity.medium ?? 0,
      low: weakness.bySeverity.low ?? 0,
      info: weakness.bySeverity.info ?? 0,
    },
    hardeningStatus: hardening.status,
    mustNotAutomate: [...ORCHESTRATOR_UNSAFE_SHORTCUTS],
    humanSourceReviewBlocked: [
      `April audit: ${ctx.inventory.summary.unmatchedUploadedChecks} checks + ${ctx.inventory.summary.unmatchedLedgerExpenditures} ledger lines`,
      "Check images need vision/manual entry",
    ],
    treasurerBlocked: ctx.recon.remainingReviewItems > 0 ? [`${ctx.recon.remainingReviewItems} reconciliation items`] : ["Production bank verify"],
    steveBlocked: !ctx.brain.storage.ready ? ["Storage/RLS"] : [],
    engineeringBlocked: stateProgress.qaFullStatus !== "green" ? ["qa-full yellow"] : [],
    lowImpactHighEffort: ["Re-read all MD reports without using audit checklist", "Manual re-key all GoodChange rows"],
  };

  return { ctx, engine, weakness, stateProgress, blockerGraph, criticalPath, workSequencer, forecast, focus };
}
