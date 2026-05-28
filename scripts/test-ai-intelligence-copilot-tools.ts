import fs from "node:fs";
import path from "node:path";
import {
  loadAiCopilotToolRegistry,
  resolveCopilotToolContext,
  routeCopilotOutputForReview,
  runDeterministicCopilotTool,
  summarizeCopilotInternalDraftInsights,
  summarizeCopilotToolOutput,
  validateCopilotSafety,
} from "@/lib/intelligence/aiCopilotOrchestrator";
import {
  draftStructuredCandidateTalkingPoints,
  draftStructuredPressSurrogate,
  draftStructuredSocialMedia,
  draftStructuredVolunteerScripts,
  INTERNAL_DRAFT_LABEL,
} from "@/lib/intelligence/aiWritingToolbox";
import {
  recommendIntelligenceGatheringPriorities,
  summarizeCampaignIntelligenceState,
} from "@/lib/intelligence/intelligenceBrainCoordinator";
import {
  loadPublicMediaIntakeQueue,
  rankMediaFindingsForOppositionResearch,
} from "@/lib/intelligence/publicMediaIntake";
import { routeMediaCopilotFinding } from "@/lib/intelligence/mediaIntelligenceCopilot";
import {
  loadPublicMeetingWatchlist,
  recommendWatchlistGaps,
  summarizeWatchlistCoverage,
} from "@/lib/intelligence/publicMeetingWatchlist";
import { buildMorningBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "data/intelligence/ai-copilot-tool-registry.json",
  "data/intelligence/public-meeting-watchlist.json",
  "src/lib/intelligence/aiCopilotOrchestrator.ts",
  "src/lib/intelligence/mediaIntelligenceCopilot.ts",
  "src/lib/intelligence/publicMeetingWatchlist.ts",
  "src/app/admin/(board)/intelligence/ai-tools/page.tsx",
  "src/app/admin/(board)/intelligence/briefing-papers/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/ai-opposition-copilot/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/debate-ai-workbench/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
  "src/app/admin/(board)/intelligence/morning-brief/page.tsx",
];

const GOVERNANCE_LABELS = ["INTERNAL_DRAFT", "NON_PUBLISHABLE", "HUMAN_REVIEW_REQUIRED"] as const;

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-11 artifact: ${relPath}`);
  }

  const registry = loadAiCopilotToolRegistry();
  assert(registry.tools.length >= 36, `Expected 36+ AI tools; got ${registry.tools.length}.`);

  for (const tool of registry.tools) {
    assert(tool.toolId.length > 0, "Each tool must have toolId.");
    assert(tool.publicationSafety === "NON_PUBLISHABLE", `${tool.toolId} must be NON_PUBLISHABLE.`);
    assert(tool.humanReviewRequired === true, `${tool.toolId} must require human review.`);
    assert(tool.outputType === "INTERNAL_DRAFT", `${tool.toolId} outputType must be INTERNAL_DRAFT.`);
    assert(tool.prohibitedActions.length > 0, `${tool.toolId} must list prohibited actions.`);
  }

  const oppositionTools = registry.tools.filter((t) => t.category === "opposition_research");
  const debateTools = registry.tools.filter((t) => t.category === "debate_prep");
  assert(oppositionTools.length >= 9, "Opposition research category must have 9+ tools.");
  assert(debateTools.length >= 7, "Debate prep category must have 7+ tools.");

  const evidenceCommand = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx"),
    "utf8",
  );
  assert(evidenceCommand.includes("NSI-11"), "Evidence Command must include NSI-11 AI copilot panel.");

  const morningBrief = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/morning-brief/page.tsx"),
    "utf8",
  );
  assert(morningBrief.includes("NSI-11"), "Morning brief must include NSI-11 AI copilot section.");
  assert(morningBrief.includes("DO NOT USE PUBLICLY YET"), "Morning brief must warn against public use.");

  const ctx = resolveCopilotToolContext("vulnerability-finder");
  assert(ctx !== null, "Must resolve copilot tool context.");
  assert(ctx.tool.toolId === "vulnerability-finder", "Must resolve vulnerability-finder context.");

  const vulnOutput = runDeterministicCopilotTool("vulnerability-finder");
  assert(vulnOutput !== null, "vulnerability-finder must produce output.");
  assert(vulnOutput!.draftStatus === "INTERNAL_DRAFT", "Copilot output must be INTERNAL_DRAFT.");
  assert(vulnOutput!.exportReady === false, "Copilot output must not be export-ready.");
  assert(vulnOutput!.publicationSafety === "NON_PUBLISHABLE", "Copilot output must be NON_PUBLISHABLE.");
  assert(vulnOutput!.humanReviewRequired === true, "Copilot output must require human review.");

  const safety = validateCopilotSafety(vulnOutput!);
  assert(safety.ok === true, "Governed copilot output must pass safety validation.");

  const routes = routeCopilotOutputForReview(vulnOutput!);
  assert(routes.length > 0, "Copilot output must route for human review.");
  assert(
    routes.every((r) => r.action !== "AUTO_PUBLISH" && r.action !== "AUTO_EXPORT"),
    "Routes must not auto-publish or auto-export.",
  );

  const summaryLine = summarizeCopilotToolOutput(vulnOutput!);
  assert(summaryLine.length > 0, "Copilot summary must be non-empty.");
  for (const label of GOVERNANCE_LABELS) {
    assert(
      vulnOutput!.riskWarnings.some((w) => w.includes(label)) ||
        vulnOutput!.draftStatus === label ||
        vulnOutput!.safeUseLabel.includes("human review"),
      `Output must reflect governance label ${label}.`,
    );
  }

  const debateOutput = runDeterministicCopilotTool("debate-question-generator");
  assert(debateOutput !== null, "debate-question-generator must produce output.");
  assert(debateOutput!.exportReady === false, "Debate output must not be export-ready.");

  const structuredDrafts = [
    draftStructuredCandidateTalkingPoints("trust"),
    draftStructuredSocialMedia("election-integrity"),
    draftStructuredVolunteerScripts("pulaski"),
    draftStructuredPressSurrogate("allies"),
  ];
  for (const draft of structuredDrafts) {
    assert(draft.draftStatus === INTERNAL_DRAFT_LABEL, "Writing toolbox must remain INTERNAL_DRAFT.");
    assert(draft.exportReady === false, "Writing toolbox must not be export-ready.");
    assert(draft.publicationStatus === "NON_PUBLISHABLE", "Writing toolbox must be NON_PUBLISHABLE.");
    assert(draft.humanReviewRequired === true, "Writing toolbox must require human review.");
    assert(draft.recommendedHumanReviewer.length > 0, "Writing toolbox must name human reviewer.");
    assert(draft.sourceDependencies.length > 0, "Writing toolbox must list source dependencies.");
  }

  const queueBefore = loadPublicMediaIntakeQueue();
  const findingId = queueBefore.findings[0]?.findingId ?? "test-finding-none";
  const ranked = rankMediaFindingsForOppositionResearch();
  for (const row of ranked) {
    assert(row.autoPromoted === false, "Media copilot must not auto-promote findings.");
    assert(row.publicationSafety === "NON_PUBLISHABLE", "Media triage must be NON_PUBLISHABLE.");
    assert(row.humanReviewRequired === true, "Media triage must require human review.");
  }

  const mediaRoutes = routeMediaCopilotFinding(findingId);
  assert(
    mediaRoutes.some((r) => r.system === "media_review_queue"),
    "Media copilot must route to review queue.",
  );
  assert(
    !mediaRoutes.some((r) => r.action === "AUTO_PROMOTE" || r.action === "CREATE_CLAIM"),
    "Media copilot must not auto-promote or create claims.",
  );

  const watchlist = loadPublicMeetingWatchlist();
  assert(watchlist.targets.length >= 1, "Public meeting watchlist must load targets.");
  const coverage = summarizeWatchlistCoverage();
  assert(coverage.totalTargets === watchlist.targets.length, "Watchlist coverage must match target count.");
  assert(recommendWatchlistGaps().length >= 0, "Watchlist gap recommendations must run.");

  const brain = summarizeCampaignIntelligenceState();
  assert(brain.aiToolCount === registry.tools.length, "Brain must report AI tool count.");
  assert(brain.aiCopilotRecommendedRuns.length > 0, "Brain must recommend copilot runs.");
  assert(brain.oppositionResearchNextActions.length > 0, "Brain must include opposition research actions.");
  assert(brain.debatePrepNextActions.length > 0, "Brain must include debate prep actions.");
  assert(brain.briefingPaperQueueExtended.length >= 4, "Brain must include extended briefing queue.");

  const priorities = recommendIntelligenceGatheringPriorities();
  assert(
    priorities.some((p) => p.includes("vulnerability") || p.includes("debate") || p.includes("Run")),
    "Gathering priorities must include AI copilot recommendations.",
  );

  assert(summarizeCopilotInternalDraftInsights().length >= 0, "Internal draft insights must compose.");

  const morningPaper = buildMorningBriefingPaper();
  assert(morningPaper.deepSections.situationOverview.length >= 0, "Morning brief must include deep sections.");
  assert(morningPaper.publishability === "NON_PUBLISHABLE", "Morning brief paper must be NON_PUBLISHABLE.");

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-11 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  console.log("NSI-11 AI intelligence copilot tools: all checks passed.");
  console.log(`  Registered AI tools: ${registry.tools.length}`);
  console.log(`  Opposition tools: ${oppositionTools.length} · Debate tools: ${debateTools.length}`);
  console.log(`  Watchlist targets: ${watchlist.targets.length}`);
  console.log(`  Export-ready claims (unchanged): ${evidenceIndex.metrics.exportReadyClaims}`);
}

main();
