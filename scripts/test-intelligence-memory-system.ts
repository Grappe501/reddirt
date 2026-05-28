import fs from "node:fs";
import path from "node:path";
import { runDeterministicCopilotTool } from "@/lib/intelligence/aiCopilotOrchestrator";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import {
  computeCitationAging,
  computeExportFatigue,
  computeNarrativeEvolution,
  getCopilotMemoryHints,
  loadIntelligenceMemoryRegistry,
  summarizeLongitudinalIntelligence,
} from "@/lib/intelligence/intelligenceMemoryEngine";
import { computeMessagingDrift } from "@/lib/intelligence/opponentMessagingDrift";
import { computeDebateThemeRecurrence } from "@/lib/intelligence/debateMemorySystem";
import { computeCountyNarrativeShift } from "@/lib/intelligence/countyNarrativeShift";
import { computeDoctrineDrift } from "@/lib/intelligence/doctrineDriftTracker";
import { computeMediaCyclePatterns } from "@/lib/intelligence/mediaCycleMemory";
import { MEMORY_GOVERNANCE_LABEL } from "@/lib/intelligence/types/intelligenceMemory";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "data/intelligence/intelligence-memory-registry.json",
  "src/lib/intelligence/intelligenceMemoryEngine.ts",
  "src/lib/intelligence/intelligenceMemoryRegistry.ts",
  "src/lib/intelligence/narrativeEvolutionTracker.ts",
  "src/lib/intelligence/opponentMessagingDrift.ts",
  "src/lib/intelligence/debateMemorySystem.ts",
  "src/lib/intelligence/citationAgingEngine.ts",
  "src/lib/intelligence/countyNarrativeShift.ts",
  "src/lib/intelligence/doctrineDriftTracker.ts",
  "src/lib/intelligence/mediaCycleMemory.ts",
  "src/lib/intelligence/types/intelligenceMemory.ts",
  "src/app/admin/(board)/intelligence/intelligence-memory/page.tsx",
  "src/app/admin/(board)/intelligence/morning-brief/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-13 artifact: ${relPath}`);
  }

  const registryBefore = fs.readFileSync(
    path.join(process.cwd(), "data/intelligence/intelligence-memory-registry.json"),
    "utf8",
  );

  const registry = loadIntelligenceMemoryRegistry();
  assert(registry.narrativeMemory.length >= 1, "Narrative memory entries must load.");
  assert(registry.opponentMessagingMemory.length >= 1, "Opponent messaging memory entries must load.");
  assert(registry.debateMemory.length >= 1, "Debate memory entries must load.");
  assert(registry.citationMemory.length >= 1, "Citation memory entries must load.");
  assert(registry.countyNarrativeMemory.length >= 1, "County narrative memory entries must load.");

  const evolution = computeNarrativeEvolution();
  assert(evolution.length >= 1, "Narrative evolution must compute.");
  assert(evolution.every((row) => row.reasons.length > 0), "Evolution signals must explain WHY.");

  const messagingDrift = computeMessagingDrift();
  assert(Array.isArray(messagingDrift), "Messaging drift must compute.");

  const debateThemes = computeDebateThemeRecurrence();
  assert(Array.isArray(debateThemes), "Debate memory must compute.");

  const citationAging = computeCitationAging();
  assert(Array.isArray(citationAging), "Citation aging must compute.");

  const countyShifts = computeCountyNarrativeShift();
  assert(Array.isArray(countyShifts), "County shift signals must compute.");

  const doctrineDrift = computeDoctrineDrift();
  assert(Array.isArray(doctrineDrift), "Doctrine drift must compute.");

  const mediaCycles = computeMediaCyclePatterns();
  assert(Array.isArray(mediaCycles), "Media cycle patterns must compute.");

  const exportFatigue = computeExportFatigue();
  assert(Array.isArray(exportFatigue), "Export fatigue must compute.");

  const summary = summarizeLongitudinalIntelligence();
  assert(summary.publicationSafety === "NON_PUBLISHABLE", "Summary must be NON_PUBLISHABLE.");
  assert(summary.humanReviewRequired === true, "Summary must require human review.");
  assert(summary.topTrendSummaries.length >= 1, "Summary must include trend summaries.");

  const dashboardPage = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/intelligence-memory/page.tsx"),
    "utf8",
  );
  assert(dashboardPage.includes("Narrative evolution"), "Dashboard must include Narrative Evolution section.");
  assert(dashboardPage.includes("Opponent messaging drift"), "Dashboard must include Opponent Messaging Drift section.");
  assert(dashboardPage.includes("Doctrine drift"), "Dashboard must include Doctrine Drift section.");
  assert(dashboardPage.includes("Media cycle trends"), "Dashboard must include Media Cycle Trends section.");

  const morningBrief = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/morning-brief/page.tsx"),
    "utf8",
  );
  assert(morningBrief.includes("NSI-13"), "Morning brief must include NSI-13 longitudinal signals.");
  assert(morningBrief.includes("memoryStrengtheningNarratives"), "Morning brief must surface strengthening narratives.");

  const evidenceCommand = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx"),
    "utf8",
  );
  assert(evidenceCommand.includes("NSI-13"), "Evidence Command must include NSI-13 memory alerts.");
  assert(evidenceCommand.includes("nsi13Summary"), "Evidence Command must accept nsi13Summary prop.");

  const brain = summarizeCampaignIntelligenceState();
  assert(brain.longitudinalIntelligence !== undefined, "Brain must include longitudinalIntelligence.");
  assert(Array.isArray(brain.memoryStrengtheningNarratives), "Brain must include memoryStrengtheningNarratives.");
  assert(Array.isArray(brain.memoryWeakeningNarratives), "Brain must include memoryWeakeningNarratives.");
  assert(Array.isArray(brain.memoryOverusedArguments), "Brain must include memoryOverusedArguments.");

  const debateHints = getCopilotMemoryHints("debate_prep");
  assert(debateHints.some((line) => line.includes(MEMORY_GOVERNANCE_LABEL) || line.includes("INTERNAL")), "Debate hints must include governance label.");
  assert(debateHints.length >= 1, "Debate copilot must receive memory hints.");

  const writingHints = getCopilotMemoryHints("writing_tools");
  assert(writingHints.length >= 1, "Writing copilot must receive memory hints.");

  const oppositionHints = getCopilotMemoryHints("opposition_research");
  assert(oppositionHints.length >= 1, "Opposition copilot must receive memory hints.");

  const debateCopilot = runDeterministicCopilotTool("debate-question-generator");
  assert(debateCopilot !== null, "Debate copilot must run.");
  assert(
    debateCopilot!.sections.some((section) => section.heading.includes("Longitudinal memory")),
    "Debate copilot output must include longitudinal memory section.",
  );
  assert(debateCopilot!.publicationSafety === "NON_PUBLISHABLE", "Copilot output must remain NON_PUBLISHABLE.");
  assert(debateCopilot!.humanReviewRequired === true, "Copilot output must require human review.");

  const registryAfter = fs.readFileSync(
    path.join(process.cwd(), "data/intelligence/intelligence-memory-registry.json"),
    "utf8",
  );
  assert(registryBefore === registryAfter, "NSI-13 engine must not mutate intelligence memory registry.");

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-13 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );
  const claimCountBefore = evidenceIndex.claims.length;
  assert(
    loadKimHammerEvidenceIndex().claims.length === claimCountBefore,
    "No governed claims must be created automatically.",
  );

  console.log("NSI-13 Intelligence memory system: all checks passed.");
  console.log(`  Registry narratives: ${registry.narrativeMemory.length}`);
  console.log(`  Evolution rows: ${evolution.length}`);
  console.log(`  Messaging drift signals: ${messagingDrift.length}`);
  console.log(`  Debate theme signals: ${debateThemes.length}`);
  console.log(`  Citation aging signals: ${citationAging.length}`);
  console.log(`  County shift signals: ${countyShifts.length}`);
  console.log(`  Doctrine drift signals: ${doctrineDrift.length}`);
  console.log(`  Media cycle signals: ${mediaCycles.length}`);
  console.log(`  Export-ready claims (unchanged): ${evidenceIndex.metrics.exportReadyClaims}`);
}

main();
