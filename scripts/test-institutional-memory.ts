import fs from "node:fs";
import path from "node:path";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  summarizeInstitutionalMemory,
  syncRecommendationLedgerFromActionQueue,
} from "@/lib/intelligence/institutionalMemory/institutionalMemoryEngine";
import {
  createDecisionEntry,
  createLessonEntry,
  saveWeeklyReflectionEntry,
} from "@/lib/intelligence/institutionalMemory/institutionalMemoryWorkflow";
import {
  loadDecisionLedger,
  loadRecommendationLedger,
} from "@/lib/intelligence/institutionalMemory/institutionalMemoryStore";
import {
  confidenceAdjustmentFromDisposition,
  formatConfidenceAdjustment,
} from "@/lib/intelligence/institutionalMemory/recommendationConfidenceFramework";
import { composeIntelligenceCommandCenter } from "@/lib/intelligence/commandCenter/intelligenceCommandCenter";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED = [
  "src/lib/intelligence/institutionalMemory/types.ts",
  "src/lib/intelligence/institutionalMemory/institutionalMemoryEngine.ts",
  "src/lib/intelligence/institutionalMemory/institutionalMemoryWorkflow.ts",
  "src/lib/intelligence/institutionalMemory/recommendationConfidenceFramework.ts",
  "src/app/admin/(board)/intelligence/memory/page.tsx",
  "src/app/admin/(board)/intelligence/memory/CampaignMemoryDashboard.tsx",
  "src/app/admin/(board)/intelligence/memory/memory-actions.ts",
];

function main() {
  const cwd = process.cwd();
  for (const rel of REQUIRED) {
    assert(fs.existsSync(path.join(cwd, rel)), `Missing NSI-17 artifact: ${rel}`);
  }

  const exportReadyBefore = loadKimHammerEvidenceIndex().metrics.exportReadyClaims;

  const dir = formatConfidenceAdjustment(confidenceAdjustmentFromDisposition("Accepted"));
  assert(dir.includes("Increasing"), "Confidence framework must label Accepted as increasing.");

  const decision = createDecisionEntry({
    operator: "test-script",
    changedByRoute: "scripts/test-institutional-memory",
    title: "NSI-17 validation decision (remove if undesired)",
    decisionDate: new Date().toISOString().slice(0, 10),
    category: "Other",
    summary: "Automated test entry for institutional memory validation.",
    reasoning: "Verify write path.",
    expectedOutcome: "Ledger persists entry.",
    resultStatus: "Unknown",
    lessonLearned: "Test harness wrote a decision — operators may archive or delete in a later pass.",
  });
  assert(decision.ok, "Decision create must succeed.");

  const lesson = createLessonEntry({
    operator: "test-script",
    changedByRoute: "scripts/test-institutional-memory",
    kind: "pattern",
    title: "NSI-17 test pattern",
    body: "Validation pattern entry for institutional memory engine.",
    tags: "test,nsi-17",
  });
  assert(lesson.ok, "Lesson create must succeed.");

  const reflection = saveWeeklyReflectionEntry({
    operator: "test-script",
    changedByRoute: "scripts/test-institutional-memory",
    weekLabel: `TEST-${new Date().toISOString().slice(0, 10)}`,
    whatWorked: "Memory engine write paths.",
    whatFailed: "N/A",
    whatSurprised: "N/A",
    whatToStop: "N/A",
    whatToDoMore: "Record real campaign decisions weekly.",
    whatWeAreLearning: "Outcome memory complements information hubs.",
  });
  assert(reflection.ok, "Weekly reflection must save.");

  syncRecommendationLedgerFromActionQueue();
  const summary = summarizeInstitutionalMemory();
  assert(summary.decisionCount >= 1, "Decision ledger must have entries.");
  assert(summary.lessonCount >= 1, "Lesson registry must have entries.");
  assert(summary.reflectionCount >= 1, "Weekly reflections must persist.");
  assert(summary.memoryHealthScore >= 15, "Memory health score required.");

  const snapshot = composeIntelligenceCommandCenter();
  assert(snapshot.institutionalMemory.memoryHealthScore >= 15, "Command center memory strip required.");
  assert(snapshot.sourceLinks.campaignMemory === "/admin/intelligence/memory", "Campaign memory link required.");

  const exportReadyAfter = loadKimHammerEvidenceIndex().metrics.exportReadyClaims;
  assert(
    exportReadyBefore === exportReadyAfter,
    `Export-ready must not change: ${exportReadyBefore} vs ${exportReadyAfter}`,
  );

  const decisions = loadDecisionLedger();
  const recs = loadRecommendationLedger();
  console.log("NSI-17 institutional memory: OK");
  console.log(`  decisions: ${decisions.entries.length}`);
  console.log(`  recommendations: ${recs.entries.length}`);
  console.log(`  memory health: ${summary.memoryHealthScore}%`);
  console.log(`  export-ready claims: ${exportReadyAfter} (unchanged)`);
}

main();
