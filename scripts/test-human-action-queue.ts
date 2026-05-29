import fs from "node:fs";
import path from "node:path";
import { runDeterministicCopilotTool } from "@/lib/intelligence/aiCopilotOrchestrator";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  generateHumanActionRecommendations,
  getEvidenceCommandActionQueueSection,
  getMorningBriefActionQueueSection,
  loadHumanActionQueue,
  rankHumanActions,
  summarizeHumanActionQueue,
  syncHumanActionQueue,
} from "@/lib/intelligence/strategicDecisionSupport";
import { HUMAN_ACTION_QUEUE_REL } from "@/lib/intelligence/types/humanActionQueue";
import {
  archiveHumanAction,
  loadHumanActionQueueAuditLog,
  updateHumanActionStatus,
} from "@/lib/intelligence/humanActionQueueWorkflow";
import { buildScenarioHumanActionHints, simulateAllStrategicScenarios } from "@/lib/intelligence/strategicScenarioSimulation";
import { summarizeDraftReviewQueue } from "@/lib/intelligence/llmDraftGateway";
import { summarizeMediaIntakeActionRecommendations } from "@/lib/intelligence/publicMediaIntake";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "data/intelligence/human-action-queue.json",
  "data/intelligence/human-action-queue-audit-log.json",
  "src/lib/intelligence/types/humanActionQueue.ts",
  "src/lib/intelligence/strategicDecisionSupport.ts",
  "src/lib/intelligence/humanActionQueueWorkflow.ts",
  "src/app/admin/(board)/intelligence/action-queue/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
  "src/app/admin/(board)/intelligence/morning-brief/page.tsx",
];

function main() {
  const cwd = process.cwd();
  for (const rel of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(cwd, rel)), `Missing NSI-15 artifact: ${rel}`);
  }

  const exportReadyBefore = loadKimHammerEvidenceIndex().metrics.exportReadyClaims;

  console.log("Generating recommendations (includes NSI-14 scenario pass — may take ~60s)...");
  const recommendations = generateHumanActionRecommendations();
  assert(recommendations.length > 0, "Decision support must generate recommendations.");
  console.log(`Generated ${recommendations.length} recommendations.`);

  assert(
    recommendations.some((row) => row.actionType === "REVIEW_CITATION"),
    "Expected REVIEW_CITATION from citation risks.",
  );
  assert(
    recommendations.some((row) => row.actionType === "REVIEW_LLM_DRAFT") ||
      summarizeDraftReviewQueue().pendingCount === 0,
    "Expected REVIEW_LLM_DRAFT when draft backlog exists.",
  );
  assert(
    recommendations.some(
      (row) =>
        row.actionType === "PREPARE_DEBATE_RESPONSE" || row.actionType === "REVIEW_EXPORT_RISK",
    ),
    "Expected debate/export action from scenario risks.",
  );
  assert(
    recommendations.some((row) => row.actionType === "REVIEW_MEDIA_FINDING") ||
      summarizeMediaIntakeActionRecommendations().length === 0,
    "Expected REVIEW_MEDIA_FINDING when media queue has pending items.",
  );
  assert(
    recommendations.some(
      (row) =>
        row.actionType === "VALIDATE_TARGET_PATHWAY" || row.actionType === "CHECK_REGISTRATION_GOAL",
    ),
    "Expected target pathway / registration goal actions.",
  );

  for (const row of recommendations) {
    assert(row.publicationSafety === "NON_PUBLISHABLE", "Actions must be NON_PUBLISHABLE.");
    assert(row.humanActionRequired === true, "Actions must require human action.");
    assert(row.governanceWarnings.length > 0, "Governance warnings required.");
  }

  const synced = syncHumanActionQueue();
  assert(synced.items.length > 0, "Synced queue must contain items.");
  console.log(`Synced queue: ${synced.items.length} items.`);
  assert(fs.existsSync(path.join(cwd, HUMAN_ACTION_QUEUE_REL)), "human-action-queue.json must exist.");

  const summary = summarizeHumanActionQueue();
  assert(summary.totalActions > 0, "Queue summary must report active actions.");
  assert(summary.queueHref === "/admin/intelligence/action-queue", "Queue href must match dashboard route.");

  const morning = getMorningBriefActionQueueSection();
  assert(morning.topFive.length <= 5, "Morning brief top five capped at 5.");

  const evidence = getEvidenceCommandActionQueueSection();
  assert(evidence.topUrgent.length <= 5, "Evidence command urgent cap.");

  const scenarios = simulateAllStrategicScenarios();
  const sample = scenarios[0];
  assert(sample, "Scenario simulation required.");
  const hints = buildScenarioHumanActionHints(sample);
  assert(hints.recommendedHumanAction.length > 0, "Scenario must expose recommendedHumanAction.");
  assert(hints.debatePrepAction.length > 0, "Scenario must expose debatePrepAction.");

  const llmSummary = summarizeDraftReviewQueue();
  assert(Array.isArray(llmSummary.actionRecommendationSummaries), "LLM summary must include action recommendations.");

  const mediaRecs = summarizeMediaIntakeActionRecommendations();
  assert(Array.isArray(mediaRecs), "Media intake action recommendations must be an array.");

  const copilot = runDeterministicCopilotTool("source-gap-finder");
  assert(copilot, "Copilot tool must return output.");
  assert(copilot.recommendedHumanActions.length >= 0, "Copilot must expose recommendedHumanActions.");
  assert(copilot.actionQueueRouting.includes("/admin/intelligence/action-queue"), "Copilot must route to action queue.");

  const first = rankHumanActions(synced.items)[0]!;
  const update = updateHumanActionStatus({
    actionId: first.actionId,
    operator: "nsi15-test",
    nextStatus: "ACCEPTED",
    changedByRoute: "scripts/test-human-action-queue",
    notes: "Test acceptance",
  });
  assert(update.ok, `Status update failed: ${!update.ok && "error" in update ? update.error : ""}`);

  const audit = loadHumanActionQueueAuditLog();
  assert(audit.entries.length > 0, "Audit log must record human action updates.");
  assert(
    audit.entries.some((row) => row.eventType === "HUMAN_ACTION_UPDATED"),
    "Audit must include HUMAN_ACTION_UPDATED.",
  );

  archiveHumanAction({
    actionId: first.actionId,
    operator: "nsi15-test",
    changedByRoute: "scripts/test-human-action-queue",
    notes: "Test archive",
  });

  const timeline = loadKimHammerUnifiedAuditTimeline();
  assert(
    timeline.entries.some((row) => row.kind === "HUMAN_ACTION_UPDATED" || row.kind === "HUMAN_ACTION_ARCHIVED"),
    "Unified audit browser must include human action events.",
  );

  const exportReadyAfter = loadKimHammerEvidenceIndex().metrics.exportReadyClaims;
  assert(
    exportReadyBefore === exportReadyAfter,
    "Action queue generation must not mutate export-ready claim count.",
  );

  const queueAfter = loadHumanActionQueue();
  assert(queueAfter.items.length > 0, "Queue must remain after workflow mutations.");

  console.log("NSI-15 human action queue tests passed.");
  console.log(`  recommendations generated: ${recommendations.length}`);
  console.log(`  synced queue items: ${synced.items.length}`);
  console.log(`  export-ready unchanged: ${exportReadyBefore}`);
}

main();
