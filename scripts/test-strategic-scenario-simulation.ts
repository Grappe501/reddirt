import fs from "node:fs";
import path from "node:path";
import { runDeterministicCopilotTool } from "@/lib/intelligence/aiCopilotOrchestrator";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  getCopilotScenarioHints,
  loadStrategicScenarioRegistry,
  resolveCountyScenarioWatch,
  simulateAllStrategicScenarios,
  simulateStrategicScenario,
  summarizeDebateScenarioPrep,
  summarizeStrategicScenarioSimulation,
} from "@/lib/intelligence/strategicScenarioSimulation";
import { SCENARIO_GOVERNANCE_LABEL } from "@/lib/intelligence/types/strategicScenarioSimulation";
import { loadVoterRegistrationAssumptions } from "@/lib/intelligence/voterRegistrationTargetModel";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "data/intelligence/strategic-scenario-registry.json",
  "src/lib/intelligence/strategicScenarioSimulation.ts",
  "src/lib/intelligence/strategicScenarioRegistry.ts",
  "src/lib/intelligence/types/strategicScenarioSimulation.ts",
  "src/app/admin/(board)/intelligence/scenario-simulation/page.tsx",
  "src/app/admin/(board)/intelligence/morning-brief/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
  "src/app/admin/(board)/intelligence/debate-command/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/debate-prep/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/debate-ai-workbench/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCountyBriefingPanel.tsx",
];

const SCENARIO_FAMILIES = [
  "OPPONENT_RESPONSE",
  "NARRATIVE_COLLISION",
  "DEBATE",
  "MEDIA_ESCALATION",
  "COUNTY_REACTION",
  "TURNOUT_REGISTRATION",
] as const;

const SCENARIO_SIGNALS = [
  "SCENARIO_LOW_RISK",
  "SCENARIO_MODERATE_RISK",
  "SCENARIO_HIGH_RISK",
  "SCENARIO_OPPORTUNITY",
  "SCENARIO_FRAGILE",
  "SCENARIO_OVEREXPOSED",
  "SCENARIO_UNDERDEVELOPED",
  "SCENARIO_COLLISION",
  "SCENARIO_MEDIA_AMPLIFICATION",
  "SCENARIO_DEBATE_TRAP",
  "SCENARIO_FIELD_CAPACITY_RISK",
] as const;

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-14 artifact: ${relPath}`);
  }

  const registryBefore = fs.readFileSync(
    path.join(process.cwd(), "data/intelligence/strategic-scenario-registry.json"),
    "utf8",
  );

  const registry = loadStrategicScenarioRegistry();
  assert(registry.scenarios.length >= 30, "Registry must include at least 30 seeded scenarios.");

  for (const family of SCENARIO_FAMILIES) {
    const count = registry.scenarios.filter((row) => row.scenarioType === family).length;
    assert(count >= 5, `Scenario family ${family} must have at least 5 entries; got ${count}.`);
  }

  const allResults = simulateAllStrategicScenarios();
  assert(allResults.length === registry.scenarios.length, "All scenarios must simulate.");
  assert(
    allResults.every((row) => row.reasons.length > 0),
    "Every scenario result must include WHY reasons.",
  );
  assert(
    allResults.every((row) => row.scenarioModelLabel === SCENARIO_GOVERNANCE_LABEL),
    "All results must carry governance label.",
  );
  assert(
    allResults.every((row) => row.humanReviewRequired === true),
    "All results must require human review.",
  );

  const signalSet = new Set(allResults.flatMap((row) => row.signals));
  for (const signal of SCENARIO_SIGNALS) {
    assert(signalSet.has(signal), `Signal ${signal} must appear in at least one scenario result.`);
  }

  const opponent = registry.scenarios.find((row) => row.scenarioType === "OPPONENT_RESPONSE");
  assert(opponent !== undefined, "Opponent response scenario must exist.");
  const opponentResult = simulateStrategicScenario(opponent!.scenarioId);
  assert(opponentResult !== null, "Opponent scenario must simulate.");
  assert(opponentResult!.scenarioType === "OPPONENT_RESPONSE", "Opponent simulator must preserve type.");

  const summary = summarizeStrategicScenarioSimulation();
  assert(summary.publicationSafety === "NON_PUBLISHABLE", "Summary must be NON_PUBLISHABLE.");
  assert(summary.highestRisk.length >= 1, "Summary must include highest-risk scenarios.");
  assert(summary.strongestOpportunity.length >= 1, "Summary must include opportunity scenarios.");
  assert(summary.registrationAssumptionNotes.some((line) => line.includes("30%")), "Registration turnout assumption must be included.");

  const assumptions = loadVoterRegistrationAssumptions();
  assert(assumptions.registrationTurnoutAssumption === 0.3, "registrationTurnoutAssumption must be 30%.");
  assert(assumptions.supportCaptureAssumption === 0.75, "supportCaptureAssumption must be 75%.");

  const debatePrep = summarizeDebateScenarioPrep();
  assert(debatePrep.likelyOpponentAttacks.length >= 1, "Debate prep must include likely opponent attacks.");
  assert(debatePrep.whatNotToSay.length >= 1, "Debate prep must include what-not-to-say guidance.");

  const countyWatch = resolveCountyScenarioWatch("pulaski");
  assert(countyWatch.countyId === "pulaski", "County scenario watch must resolve county id.");

  const dashboardPage = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/scenario-simulation/page.tsx"),
    "utf8",
  );
  assert(dashboardPage.includes("Highest-risk scenarios"), "Dashboard must include highest-risk section.");
  assert(dashboardPage.includes("Debate traps"), "Dashboard must include debate traps section.");
  assert(dashboardPage.includes("NSI-14"), "Dashboard must identify NSI-14.");

  const morningBrief = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/morning-brief/page.tsx"),
    "utf8",
  );
  assert(morningBrief.includes("Scenario watchlist"), "Morning brief must include scenario watchlist.");
  assert(morningBrief.includes("scenarioTopRisks"), "Morning brief must surface scenario top risks.");

  const evidenceCommand = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx"),
    "utf8",
  );
  assert(evidenceCommand.includes("NSI-14"), "Evidence Command must include NSI-14 scenario alerts.");
  assert(evidenceCommand.includes("nsi14Summary"), "Evidence Command must accept nsi14Summary prop.");

  const debateCommand = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/debate-command/page.tsx"),
    "utf8",
  );
  assert(debateCommand.includes("Scenario-based debate prep"), "Debate command must include scenario prep.");

  const debatePrepPage = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/debate-prep/page.tsx"),
    "utf8",
  );
  assert(debatePrepPage.includes("Scenario-based debate prep"), "Debate prep must include scenario section.");

  const countyPanel = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCountyBriefingPanel.tsx"),
    "utf8",
  );
  assert(countyPanel.includes("Scenario watch"), "County briefing must include Scenario Watch section.");

  const brain = summarizeCampaignIntelligenceState();
  assert(brain.strategicScenarioSimulation !== undefined, "Brain must include strategicScenarioSimulation.");
  assert(Array.isArray(brain.scenarioTopRisks), "Brain must include scenarioTopRisks.");
  assert(Array.isArray(brain.scenarioTopOpportunities), "Brain must include scenarioTopOpportunities.");

  const debateHints = getCopilotScenarioHints("debate_prep");
  assert(debateHints.some((line) => line.includes("SCENARIO_MODEL")), "Debate hints must include governance label.");
  assert(debateHints.length >= 1, "Debate copilot must receive scenario hints.");

  const debateCopilot = runDeterministicCopilotTool("debate-question-generator");
  assert(debateCopilot !== null, "Debate copilot must run.");
  assert(
    debateCopilot!.sections.some((section) => section.heading.includes("Scenario context")),
    "Debate copilot output must include scenario context section.",
  );
  assert(debateCopilot!.publicationSafety === "NON_PUBLISHABLE", "Copilot output must remain NON_PUBLISHABLE.");

  const engineSource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/intelligence/strategicScenarioSimulation.ts"),
    "utf8",
  );
  assert(!engineSource.includes("voterScore"), "No voter-level scoring in scenario engine.");
  assert(!engineSource.includes("microtarget"), "No microtargeting in scenario engine.");

  const registryAfter = fs.readFileSync(
    path.join(process.cwd(), "data/intelligence/strategic-scenario-registry.json"),
    "utf8",
  );
  assert(registryBefore === registryAfter, "NSI-14 engine must not mutate scenario registry at runtime.");

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-14 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  console.log("NSI-14 Strategic scenario simulation: all checks passed.");
  console.log(`  Registry scenarios: ${registry.scenarios.length}`);
  console.log(`  Simulated results: ${allResults.length}`);
  console.log(`  Unique signals emitted: ${signalSet.size}`);
  console.log(`  Top risk scenarios: ${summary.highestRisk.length}`);
  console.log(`  Export-ready claims (unchanged): ${evidenceIndex.metrics.exportReadyClaims}`);
}

main();
