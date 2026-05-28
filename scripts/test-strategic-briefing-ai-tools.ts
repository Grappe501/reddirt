import fs from "node:fs";
import path from "node:path";
import {
  draftCandidateTalkingPoints,
  draftDebatePrepBlocks,
  draftVolunteerTalkingPoints,
  INTERNAL_DRAFT_LABEL,
  listWritingToolboxCapabilities,
  summarizeWhatNotToSay,
} from "@/lib/intelligence/aiWritingToolbox";
import {
  recommendIntelligenceGatheringPriorities,
  summarizeBriefingPaperQueue,
  summarizeCampaignIntelligenceState,
  summarizeMediaMonitoringNeeds,
  summarizeWritingOpportunities,
} from "@/lib/intelligence/intelligenceBrainCoordinator";
import {
  loadMediaSourceRegistry,
  normalizeMediaFinding,
  routeFindingToIntelligenceSystem,
  summarizeMediaMonitoringReadiness,
} from "@/lib/intelligence/publicMediaMonitor";
import { buildMorningBriefingPaper, buildStrategicBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import {
  CAMPAIGN_VOTER_REGISTRATION_ASSUMPTIONS_REL,
  computeRegistrationExpectedVotes,
  computeRegistrationSupportYield,
  computeStatewideRegistrationRollup,
  loadVoterRegistrationAssumptions,
} from "@/lib/intelligence/voterRegistrationTargetModel";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "docs/intelligence/STRATEGIC_TARGET_PATHWAY_AUDIT.md",
  "docs/intelligence/ARKANSAS_MEDIA_INTELLIGENCE_INTAKE_PLAN.md",
  "docs/intelligence/API_AND_FEED_KEY_INVENTORY.md",
  CAMPAIGN_VOTER_REGISTRATION_ASSUMPTIONS_REL,
  "data/intelligence/arkansas-media-source-registry.json",
  "src/lib/intelligence/voterRegistrationTargetModel.ts",
  "src/lib/intelligence/strategicBriefingPaperEngine.ts",
  "src/lib/intelligence/aiWritingToolbox.ts",
  "src/lib/intelligence/publicMediaMonitor.ts",
  "src/lib/intelligence/intelligenceBrainCoordinator.ts",
  "src/app/admin/(board)/intelligence/StrategicBriefingDrilldownPanel.tsx",
  "src/app/admin/(board)/intelligence/strategic-target-pathway/page.tsx",
  "src/app/admin/(board)/intelligence/morning-brief/page.tsx",
  "src/app/admin/(board)/intelligence/writing-toolbox/page.tsx",
];

const FORBIDDEN_OUTPUT_PATTERNS = [
  /voterId/i,
  /householdId/i,
  /microtarget/i,
  /persuasionScore/i,
  /individual voter/i,
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-7 artifact: ${relPath}`);
  }

  const countyPanel = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCountyBriefingPanel.tsx"),
    "utf8",
  );
  assert(countyPanel.includes("NSI-7"), "County briefing panel must include NSI-7 links.");

  const debatePrep = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/debate-prep/page.tsx"),
    "utf8",
  );
  assert(debatePrep.includes("NSI-7"), "Debate prep must integrate NSI-7 sections.");

  const evidenceCommand = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx"),
    "utf8",
  );
  assert(evidenceCommand.includes("NSI-7"), "Evidence Command must show NSI-7 strategic intelligence panel.");

  const assumptions = loadVoterRegistrationAssumptions();
  assert(assumptions.registrationTurnoutAssumption === 0.3, "Turnout assumption must be 0.30.");
  assert(assumptions.supportCaptureAssumption === 0.75, "Support capture assumption must be 0.75.");

  const expectedVotes = computeRegistrationExpectedVotes(1000);
  assert(expectedVotes === 300, `Expected 300 votes from 1000 registrations; got ${expectedVotes}.`);

  const supportYield = computeRegistrationSupportYield(300);
  assert(supportYield === 225, `Expected 225 support votes from 300 expected votes; got ${supportYield}.`);

  const rollup = computeStatewideRegistrationRollup();
  assert(rollup.statewideRegistrationGoal > 0, "Statewide registration goal must be positive.");
  assert(rollup.expectedVotes === computeRegistrationExpectedVotes(rollup.statewideRegistrationGoal), "Rollup expected votes must match formula.");

  const registry = loadMediaSourceRegistry();
  assert(registry.sources.length >= 1, "Media source registry must have placeholder entries.");

  const mediaReadiness = summarizeMediaMonitoringReadiness();
  assert(mediaReadiness.sourceCount === registry.sources.length, "Media readiness must reflect registry count.");

  const finding = normalizeMediaFinding({
    sourceId: "arkansas-legislature-placeholder",
    title: "Test finding",
    summary: "Placeholder summary for routing test.",
    url: "https://example.com/test",
  });
  assert(finding.reviewStatus === "NEEDS_REVIEW", "Findings must default NEEDS_REVIEW.");
  assert(finding.publishability === "NON_PUBLISHABLE", "Findings must default NON_PUBLISHABLE.");

  const routed = routeFindingToIntelligenceSystem(finding);
  assert(routed.routes.length >= 5, "Finding must route to multiple intelligence systems.");

  const paper = buildStrategicBriefingPaper("test-paper");
  assert(paper.governanceLabel === "GOVERNED_COMPOSITION_ONLY", "Briefing must be governed composition.");
  assert(paper.publishability === "NON_PUBLISHABLE", "Briefing must be NON_PUBLISHABLE.");
  assert(paper.executiveSummary.length > 0, "Briefing must include executive summary.");
  assert(paper.drillDownLinks.length > 0, "Briefing must include drill-down links.");

  const morning = buildMorningBriefingPaper();
  assert(morning.paperId === "morning-intelligence", "Morning brief paper id must match.");

  const brain = summarizeCampaignIntelligenceState();
  assert(brain.topLeadershipItems.length <= 5, "Leadership items capped at 5.");
  assert(brain.generatedAt.length > 0, "Brain state must include timestamp.");

  assert(recommendIntelligenceGatheringPriorities().length > 0, "Must recommend gathering priorities.");
  assert(summarizeBriefingPaperQueue().length >= 1, "Must summarize briefing paper queue.");
  assert(summarizeWritingOpportunities().length > 0, "Must summarize writing opportunities.");
  assert(summarizeMediaMonitoringNeeds().length > 0, "Must summarize media monitoring needs.");

  const drafts = [
    draftCandidateTalkingPoints("trust"),
    draftDebatePrepBlocks("SB487"),
    draftVolunteerTalkingPoints("pulaski"),
    summarizeWhatNotToSay(),
  ];

  for (const draft of drafts) {
    assert(draft.draftStatus === INTERNAL_DRAFT_LABEL, "All drafts must be INTERNAL_DRAFT.");
    assert(draft.exportReady === false, "Drafts must not be export-ready.");
    assert(draft.safetyWarnings.length > 0, "Drafts must include safety warnings.");
    assert(draft.evidenceDependencies.length > 0, "Drafts must show evidence dependencies.");
  }

  assert(listWritingToolboxCapabilities().length >= 9, "Writing toolbox must expose 9+ capabilities.");

  const serialized = JSON.stringify({
    brain: {
      ...brain,
      whatNotToSayToday: brain.whatNotToSayToday,
      topLeadershipItems: brain.topLeadershipItems,
    },
    paper: {
      executiveSummary: paper.executiveSummary,
      countyImpact: paper.countyImpact,
    },
    rollup,
    draftBullets: drafts.flatMap((d) => d.sections.flatMap((s) => s.bullets)),
  });
  for (const pattern of FORBIDDEN_OUTPUT_PATTERNS) {
    assert(!pattern.test(serialized), `NSI-7 output must not include voter-level pattern: ${pattern}`);
  }

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-7 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  console.log("NSI-7 strategic briefing + AI tools: all checks passed.");
  console.log(`  Registration yield (50k anchor): ${rollup.expectedSupportVotes} expected support votes`);
  console.log(`  Media sources registered: ${registry.sources.length}`);
  console.log(`  Export-ready claims (unchanged): ${evidenceIndex.metrics.exportReadyClaims}`);
}

main();
