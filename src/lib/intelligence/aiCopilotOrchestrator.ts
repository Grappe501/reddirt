import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildStrategicBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import { loadPublicMediaIntakeQueue } from "@/lib/intelligence/publicMediaIntake";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import { generateKimHammerLiveSuggestionCandidates } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import { recommendWatchlistGaps } from "@/lib/intelligence/publicMeetingWatchlist";
import {
  rankMediaFindingsForOppositionResearch,
  summarizeFindingForMorningBrief,
} from "@/lib/intelligence/mediaIntelligenceCopilot";
import { generateGovernedDraftForCopilotTool } from "@/lib/intelligence/llmDraftGateway";
import { getCopilotMemoryHints } from "@/lib/intelligence/intelligenceMemoryEngine";
import { getCopilotScenarioHints } from "@/lib/intelligence/strategicScenarioSimulation";
import { getCopilotActionQueueRouting } from "@/lib/intelligence/strategicDecisionSupport";
import { listSosDebateQuestionSummaries } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { OPPONENT_TRAP_LANES } from "@/lib/intelligence/v4/kellyOpponentContrastPlaybook";
import { listTrapLaneSummaries } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { CHECK_MY_RECORD_PLAYBOOK } from "@/lib/intelligence/v4/kellyOffensiveNarrativeControl";
import { PACKO_IN_DEBATE_PREP } from "@/lib/intelligence/v4/kellyDebateCoaching";
import { buildHammerDirectDemocracyPacket } from "@/lib/intelligence/v4/hammerDirectDemocracyOffensive";

export const AI_COPILOT_TOOL_REGISTRY_REL = "data/intelligence/ai-copilot-tool-registry.json";

export type AiCopilotToolEntry = {
  toolId: string;
  name: string;
  category: string;
  purpose: string;
  allowedInputs: string[];
  outputType: "INTERNAL_DRAFT";
  governanceStatus: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  prohibitedActions: string[];
  routedSystems: string[];
  operatorNextAction: string;
};

export type AiCopilotToolRegistry = {
  version: number;
  generatedAt: string;
  purpose: string;
  governanceDefaults: Record<string, unknown>;
  tools: AiCopilotToolEntry[];
};

export type CopilotToolOutput = {
  toolId: string;
  toolName: string;
  draftStatus: "INTERNAL_DRAFT";
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  title: string;
  sections: Array<{ heading: string; bullets: string[] }>;
  evidenceDependencies: string[];
  claimCitationStatus: string[];
  doctrineAlignment: string[];
  countyRelevance: string[];
  riskWarnings: string[];
  safeUseLabel: string;
  routedSystems: string[];
  operatorNextAction: string;
  exportReady: false;
  recommendedHumanActions: string[];
  suggestedOwnerRole: string;
  actionQueueRouting: string;
  actionWarnings: string[];
};

export type CopilotToolContext = {
  tool: AiCopilotToolEntry;
  evidenceExportReadyCount: number;
  narrativeBlockedCount: number;
  openRetrievalTasks: number;
  mediaPendingReview: number;
};

const SAFETY_WARNINGS = [
  "INTERNAL_DRAFT — NON_PUBLISHABLE — HUMAN_REVIEW_REQUIRED",
  "No autonomous claim, citation, task, or export creation.",
  "No individual voter targeting or microtargeted persuasion.",
];

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

export function loadAiCopilotToolRegistry(repoRoot: string = process.cwd()): AiCopilotToolRegistry {
  const abs = absPath(repoRoot, AI_COPILOT_TOOL_REGISTRY_REL);
  if (!existsSync(abs)) {
    return { version: 1, generatedAt: new Date().toISOString(), purpose: "Not initialized", governanceDefaults: {}, tools: [] };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as AiCopilotToolRegistry;
}

export function resolveCopilotToolContext(toolId: string, repoRoot?: string): CopilotToolContext | null {
  const registry = loadAiCopilotToolRegistry(repoRoot);
  const tool = registry.tools.find((row) => row.toolId === toolId);
  if (!tool) return null;
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const narratives = loadKimHammerNarrativeStateIndex(repoRoot);
  const media = loadPublicMediaIntakeQueue(repoRoot);
  return {
    tool,
    evidenceExportReadyCount: evidence.metrics.exportReadyClaims,
    narrativeBlockedCount: narratives.narratives.filter((row) => row.readinessBand === "BLOCKED").length,
    openRetrievalTasks: evidence.retrievalTasks.filter((t) => t.taskStatus !== "COMPLETE").length,
    mediaPendingReview: media.findings.filter((f) => f.reviewStatus === "NEEDS_REVIEW").length,
  };
}

function baseOutput(
  tool: AiCopilotToolEntry,
  title: string,
  sections: CopilotToolOutput["sections"],
  repoRoot?: string,
  extras?: Partial<CopilotToolOutput>,
): CopilotToolOutput {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const exportReady = evidence.claims.filter((row) => row.exportReady);
  const category = tool.category as "opposition_research" | "debate_prep" | "writing_tools" | "briefing_papers" | "intelligence_gathering";
  const memoryHints = getCopilotMemoryHints(
    ["opposition_research", "debate_prep", "writing_tools", "briefing_papers", "intelligence_gathering"].includes(category)
      ? category
      : "general",
    repoRoot,
  );
  const memorySection = { heading: "Longitudinal memory (NSI-13 · internal)", bullets: memoryHints };
  const scenarioHints = getCopilotScenarioHints(
    ["opposition_research", "debate_prep", "writing_tools", "briefing_papers", "intelligence_gathering"].includes(category)
      ? category
      : "general",
    repoRoot,
  );
  const scenarioSection = { heading: "Scenario context (NSI-14 · internal)", bullets: scenarioHints };
  const actionRouting = getCopilotActionQueueRouting(tool.category, repoRoot);

  return {
    toolId: tool.toolId,
    toolName: tool.name,
    draftStatus: "INTERNAL_DRAFT",
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    title,
    sections: [
      ...sections,
      memorySection,
      scenarioSection,
      {
        heading: "Human action queue routing (NSI-15 · recommendation only)",
        bullets: [
          ...actionRouting.recommendedHumanActions,
          `Suggested owner: ${actionRouting.suggestedOwnerRole}`,
          `Queue: ${actionRouting.actionQueueRouting}`,
        ],
      },
    ],
    evidenceDependencies: exportReady.map((row) => `${row.id}: ${row.text.slice(0, 100)}`),
    claimCitationStatus: evidence.claims.slice(0, 5).map((row) => `${row.id}: ${row.citationStatus ?? "unknown"} / exportReady=${row.exportReady}`),
    doctrineAlignment: summarizeStrategicAlignmentRisk(repoRoot).topStrategicTensions?.slice(0, 3).map((t) => t.signal) ?? [],
    countyRelevance: loadCountyBriefingIntelligenceIndex(repoRoot).counties.slice(0, 3).map((c) => c.countyName),
    riskWarnings: [...SAFETY_WARNINGS, ...actionRouting.actionWarnings, ...(extras?.riskWarnings ?? [])],
    safeUseLabel: "Internal prep only — not export-ready without human review.",
    routedSystems: tool.routedSystems,
    operatorNextAction: tool.operatorNextAction,
    exportReady: false,
    recommendedHumanActions: actionRouting.recommendedHumanActions,
    suggestedOwnerRole: actionRouting.suggestedOwnerRole,
    actionQueueRouting: actionRouting.actionQueueRouting,
    actionWarnings: actionRouting.actionWarnings,
    ...extras,
  };
}

function runVulnerabilityFinder(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const narratives = loadKimHammerNarrativeStateIndex(repoRoot);
  const citations = loadKimHammerCitationLocker(repoRoot);
  const ranked = [
    ...narratives.narratives
      .filter((row) => row.readinessBand === "WEAK" || row.readinessBand === "BLOCKED")
      .map((row) => ({
        score: row.readinessBand === "BLOCKED" ? 90 : 70,
        line: `${row.title}: ${row.readinessBand} — ${row.signal.slice(0, 100)}`,
      })),
    ...citations.citations
      .filter((row) => row.reviewStatus === "NEEDS_REVIEW" || row.reviewStatus === "DRAFT" || row.reviewStatus === "STALE")
      .slice(0, 4)
      .map((row) => ({
        score: 60,
        line: `Citation ${row.id}: ${row.reviewStatus} — debate usefulness uncertain`,
      })),
  ].sort((a, b) => b.score - a.score);

  return baseOutput(tool, "Opposition vulnerability ranking", [
    { heading: "Ranked weaknesses (internal)", bullets: ranked.map((r) => r.line) },
    { heading: "Publication risk", bullets: ["Blocked/weak narratives must not deploy externally.", "Partial citations block export-ready debate use."] },
  ], repoRoot);
}

function runContradictionScout(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const suggestions = generateKimHammerLiveSuggestionCandidates(repoRoot);
  const contradictions = suggestions.filter((row) => row.suggestionType === "CONTRADICTION_FLAG");
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const partial = evidence.claims.filter((row) => row.citationStatus === "PARTIAL");

  return baseOutput(tool, "Contradiction scout report", [
    { heading: "Contradiction flags", bullets: contradictions.length ? contradictions.map((c) => `${c.title}: ${c.body.slice(0, 120)}`) : ["No live contradiction candidates — continue monitoring."] },
    { heading: "Partial citation conflicts", bullets: partial.map((c) => `${c.id}: partial citation may conflict with field messaging`) },
    { heading: "Timeline / messaging drift", bullets: ["Review legislative chronology vs public statements manually.", "Check narrative usage fatigue in NSI-3 analytics."] },
  ], repoRoot);
}

function runSourceGapFinder(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const media = loadPublicMediaIntakeQueue(repoRoot);
  const openTasks = evidence.retrievalTasks.filter((t) => t.taskStatus !== "COMPLETE");

  return baseOutput(tool, "Source gap analysis", [
    { heading: "Missing / weak citations", bullets: evidence.claims.filter((c) => !c.exportReady).slice(0, 5).map((c) => `${c.id}: not export-ready`) },
    { heading: "Unresolved retrieval tasks", bullets: openTasks.slice(0, 5).map((t) => `#${t.rank ?? "?"}: ${t.description.slice(0, 100)}`) },
    { heading: "Media intake leads", bullets: media.findings.filter((f) => f.reviewStatus === "NEEDS_REVIEW").slice(0, 4).map((f) => `${f.findingId}: ${f.title.slice(0, 80)}`) },
  ], repoRoot);
}

function runBillImpactAnalyzer(tool: AiCopilotToolEntry, billNumber: string, repoRoot?: string): CopilotToolOutput {
  const workbench = loadKimHammerWorkbench();
  const bill = workbench.strongestDebateAnchors.find((b) => b.billNumber === billNumber) ?? workbench.strongestDebateAnchors[0];
  const paper = buildStrategicBriefingPaper("debate-prep", repoRoot);

  return baseOutput(tool, `Bill impact — ${bill?.billNumber ?? billNumber}`, [
    { heading: "Voter impact", bullets: [`Bill ${bill?.billNumber ?? billNumber}: election administration / access framing — verify statutory text.`] },
    { heading: "Democracy / transparency impact", bullets: paper.strategicDoctrineAlignment.slice(0, 2) },
    { heading: "County burden", bullets: paper.countyImpact.slice(0, 3) },
    { heading: "Debate use / messaging risk", bullets: [...paper.debateRelevance.slice(0, 2), ...paper.whatNotToSay.slice(0, 1)] },
  ], repoRoot);
}

function runDebateQuestionGenerator(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const workbench = loadKimHammerWorkbench();
  const billQuestions = workbench.strongestDebateAnchors.flatMap((bill) => [
    `On ${bill.billNumber}: What problem did this solve for Arkansas voters?`,
    `On ${bill.billNumber}: Who bears the county implementation burden?`,
    `On ${bill.billNumber}: What transparency safeguards exist?`,
  ]);
  const sosHigh = listSosDebateQuestionSummaries()
    .filter((q) => q.probability === "HIGH")
    .slice(0, 6)
    .map((q) => `[${q.probability}] ${q.title} — /admin/intelligence/sos-debate-questions/${q.questionId}`);

  return baseOutput(tool, "Debate question bank (internal)", [
    { heading: "Bill-anchored questions", bullets: billQuestions.slice(0, 9) },
    { heading: "SOS moderator bank (HIGH)", bullets: sosHigh.length ? sosHigh : ["Open SOS question bank for speak-order drills."] },
    { heading: "Evidence dependencies", bullets: ["Anchor answers to export-ready claims only.", "Mark speculative follow-ups as NEEDS_RESEARCH.", "Never close on agree-only — add fresh county or unity line."] },
  ], repoRoot);
}

function runTrapQuestionDetector(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const traps = OPPONENT_TRAP_LANES.map((t) => `${t.name}: ${t.moderatorOrKellySetupQuestion.slice(0, 100)}`);
  const lanes = listTrapLaneSummaries().map((l) => `${l.title} — /admin/intelligence/trap-lanes/${l.laneId}`);
  const paper = buildStrategicBriefingPaper("what-not-to-say", repoRoot);

  return baseOutput(tool, "Trap question warnings", [
    { heading: "Opponent trap setups", bullets: traps },
    { heading: "Trap lane drill-downs", bullets: lanes },
    { heading: "Risky answer paths", bullets: [...paper.whatNotToSay.slice(0, 4), "Hypothetical felony/motive — redirect to statutory record.", "Unsourced opponent intent — prohibited on stage."] },
  ], repoRoot, { riskWarnings: ["INTERNAL ONLY — verify pivots in Claims before any public adaptation."] });
}

function runRebuttalBuilder(tool: AiCopilotToolEntry, topic: string, repoRoot?: string): CopilotToolOutput {
  const paper = buildStrategicBriefingPaper("debate-prep", repoRoot);
  const workbench = loadKimHammerWorkbench();
  const blocks = workbench.strongestDebateAnchors.slice(0, 3).map(
    (bill) =>
      `If attacked on ${bill.billNumber}: Agree on voter access frame → contrast implementation → county clerk burden — cite export-ready claim only.`,
  );

  return baseOutput(tool, `Rebuttal blocks — ${topic}`, [
    { heading: "Agree + fresh add (required)", bullets: ["Never end on I agree alone.", "Add one sourced fact or county example after any agreement.", ...paper.debateRelevance.slice(0, 2)] },
    { heading: "Bill-anchored rebuttal skeletons", bullets: blocks },
    { heading: "Three-way note", bullets: ["When Packo agrees first, take position-2 or -3 close from SOS bank.", "Pivot to unity spine: transparency, accountability, non-partisan SOS service."] },
  ], repoRoot);
}

function runCounterargumentPredictor(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const workbench = loadKimHammerWorkbench();
  const narratives = loadKimHammerNarrativeStateIndex(repoRoot);
  const likely = [
    ...workbench.topQuestions.slice(0, 3),
    ...(workbench.reportQuestions ?? []).slice(0, 3),
    ...(workbench.supporterRationale ?? []).slice(0, 2),
  ];
  const weakNarratives = narratives.narratives
    .filter((n) => n.readinessBand === "STRONG")
    .slice(0, 4)
    .map((n) => `Hammer may push: ${n.title.slice(0, 80)}`);

  return baseOutput(tool, "Counterargument predictor", [
    { heading: "Likely opponent lines (internal)", bullets: likely.length ? likely.map((l) => l.slice(0, 120)) : ["Check workbench likely-args and film room transcripts."] },
    { heading: "Narrative pressure", bullets: weakNarratives.length ? weakNarratives : ["No strong narrative flags — monitor live drift in spin room."] },
    { heading: "Kelly response discipline", bullets: ["Sourced contrast only — no motive claims.", "Bridge to counties and transparency after rebuttal point."] },
  ], repoRoot);
}

function runCheckMyRecordResponder(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const beats = CHECK_MY_RECORD_PLAYBOOK.deliveryWalkthrough.map(
    (b) => `Step ${b.step} — ${b.label}: ${b.sayThis.slice(0, 160)}`,
  );
  return baseOutput(tool, "Check My Record — six-beat tutor", [
    { heading: "When it comes", bullets: CHECK_MY_RECORD_PLAYBOOK.whenItComes },
    { heading: "Mental model", bullets: [CHECK_MY_RECORD_PLAYBOOK.mentalModel] },
    { heading: "Six-beat walkthrough", bullets: beats },
    { heading: "Index card", bullets: [CHECK_MY_RECORD_PLAYBOOK.indexCardVersion] },
    {
      heading: "If he says check yours",
      bullets: [CHECK_MY_RECORD_PLAYBOOK.ifHeSaysCheckYours.sayThis],
    },
  ], repoRoot, {
    riskWarnings: ["Verify act list with staff night-before — NEEDS_REVIEW on full script."],
  });
}

function runPackoLaneAdvisor(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  return baseOutput(tool, "Packo lane advisor — three-way panel", [
    { heading: "Kelly bridges", bullets: PACKO_IN_DEBATE_PREP.kellyBridges },
    { heading: "Do not on stage", bullets: PACKO_IN_DEBATE_PREP.doNotSay },
    { heading: "Hammer/Packo overlap", bullets: [PACKO_IN_DEBATE_PREP.hammerPackoOverlap] },
    { heading: "Speak-order note", bullets: ["When Packo agrees first, Kelly takes position 2 or 3 with fresh county add.", "Never join a smear — 'I am running to administer, not score points.'"] },
  ], repoRoot);
}

function runDirectDemocracyExplainer(tool: AiCopilotToolEntry, topic: string, repoRoot?: string): CopilotToolOutput {
  const packet = buildHammerDirectDemocracyPacket();
  const anchors = packet.bills.slice(0, 5).map(
    (a) => `${a.billNumber} Act ${a.actNumber}: ${a.plainEnglish.slice(0, 100)}`,
  );
  const traps = packet.bills.slice(0, 3).map((a) => a.trapQuestion);

  return baseOutput(tool, `Direct democracy explainer — ${topic}`, [
    { heading: "2025 petition cluster", bullets: [packet.thesis] },
    { heading: "Bill anchors (verify on Arkleg)", bullets: anchors },
    { heading: "Debate trap questions (one at a time)", bullets: traps },
    { heading: "Kelly frame", bullets: [packet.kellySuperiorityLine, ...packet.debateSequence.slice(0, 3)] },
  ], repoRoot);
}

function runBridgeLineBuilder(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const paper = buildStrategicBriefingPaper("debate-prep", repoRoot);
  const bridges = [
    "Record fight → 'What matters is whether Arkansas voters can trust the process county clerks run every day.'",
    "Partisan attack → 'Secretary of State is a service job — I work with clerks of both parties.'",
    "Fraud dare → 'Show me the statute and the implementation cost to counties — then we can talk solutions.'",
    "Experience trap → 'Experience running elections is different from experience serving all 75 counties.'",
  ];

  return baseOutput(tool, "Bridge lines (doctrine-safe)", [
    { heading: "Pivot bridges", bullets: bridges },
    { heading: "Doctrine alignment", bullets: paper.strategicDoctrineAlignment.slice(0, 3) },
    { heading: "Operator check", bullets: ["Validate each bridge in Claims before stage.", "Pair with SOS question speak-order drills when moderator changes topic."] },
  ], repoRoot);
}

function runAnswerBuilder(tool: AiCopilotToolEntry, topic: string, repoRoot?: string): CopilotToolOutput {
  const paper = buildStrategicBriefingPaper("debate-prep", repoRoot);
  return baseOutput(tool, `30/60/90 answers — ${topic}`, [
    { heading: "30-second", bullets: ["Direct answer → one sourced fact → values bridge.", ...paper.whatCandidateNeedsToKnow.slice(0, 1)] },
    { heading: "60-second", bullets: ["Direct answer → two facts → county example → contrast.", ...paper.debateRelevance.slice(0, 1)] },
    { heading: "90-second", bullets: ["Full structure with accountability frame and what-not-to-say guardrail.", ...paper.whatNotToSay.slice(0, 1).map((l) => `Avoid: ${l}`)] },
  ], repoRoot);
}

function runWhatNotToSayDetector(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const paper = buildStrategicBriefingPaper("what-not-to-say", repoRoot);
  const brain = summarizeCampaignIntelligenceState(repoRoot);
  return baseOutput(tool, "What not to say — debate context", [
    { heading: "Blocked / risky language", bullets: [...paper.whatNotToSay, ...brain.whatNotToSayToday] },
    { heading: "Trap question warnings", bullets: ["Hypothetical felony/motive questions — redirect to statutory record.", "Unsourced opponent intent claims — prohibited."] },
  ], repoRoot);
}

function runMediaFindingTriage(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const ranked = rankMediaFindingsForOppositionResearch(repoRoot);
  return baseOutput(tool, "Media finding triage", [
    { heading: "Ranked findings", bullets: ranked.slice(0, 8).map((r) => `[${r.relevanceScore}] ${r.findingId}: ${r.title.slice(0, 80)} — ${r.triageNote}`) },
    { heading: "Routing", bullets: ["All findings remain in media review queue.", "Promotion to task/citation drafts requires human action in NSI-10 workflow."] },
  ], repoRoot);
}

function runPublicMeetingWatchlistBuilder(tool: AiCopilotToolEntry, repoRoot?: string): CopilotToolOutput {
  const gaps = recommendWatchlistGaps(repoRoot);
  return baseOutput(tool, "Public meeting watchlist gaps", [
    { heading: "Coverage gaps", bullets: gaps },
    { heading: "Monitoring method", bullets: ["Manual review only until URLs verified.", "No automated scraping of meeting portals."] },
  ], repoRoot);
}

function runGenericBriefingTool(tool: AiCopilotToolEntry, paperId: string, repoRoot?: string): CopilotToolOutput {
  const paper = buildStrategicBriefingPaper(paperId, repoRoot);
  const deep = paper.deepSections;
  return baseOutput(tool, tool.name, [
    { heading: "Situation overview", bullets: deep?.situationOverview ?? paper.executiveSummary },
    { heading: "Why this matters today", bullets: deep?.whyThisMattersToday ?? paper.whyItMatters },
    { heading: "Recommended actions", bullets: deep?.recommendedIntelligenceActions ?? paper.recommendedNextResearch },
    { heading: "What not to say", bullets: deep?.whatNotToSay ?? paper.whatNotToSay },
  ], repoRoot);
}

export function validateCopilotSafety(output: CopilotToolOutput): { ok: true; warnings: string[] } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (output.draftStatus !== "INTERNAL_DRAFT") errors.push("Output must be INTERNAL_DRAFT.");
  if (output.publicationSafety !== "NON_PUBLISHABLE") errors.push("Output must be NON_PUBLISHABLE.");
  if (output.humanReviewRequired !== true) errors.push("humanReviewRequired must be true.");
  if (output.exportReady !== false) errors.push("exportReady must be false.");
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, warnings: output.riskWarnings };
}

export function routeCopilotOutputForReview(output: CopilotToolOutput): Array<{ system: string; action: string; reason: string }> {
  return [
    ...output.routedSystems.map((system) => ({
      system,
      action: "SUGGESTION_ONLY",
      reason: `${output.toolName} output requires human review before downstream use.`,
    })),
    { system: "ai_suggestion_sandbox", action: "OPTIONAL_HOLD", reason: "Operator may log copilot insight as sandbox suggestion." },
  ];
}

export function summarizeCopilotToolOutput(output: CopilotToolOutput): string {
  const bulletCount = output.sections.reduce((sum, s) => sum + s.bullets.length, 0);
  return `${output.toolName}: ${bulletCount} draft bullets · ${output.evidenceDependencies.length} export-ready deps · ${output.safeUseLabel}`;
}

export function runDeterministicCopilotTool(
  toolId: string,
  options: { repoRoot?: string; billNumber?: string; topic?: string; paperId?: string; countyId?: string } = {},
): CopilotToolOutput | null {
  const ctx = resolveCopilotToolContext(toolId, options.repoRoot);
  if (!ctx) return null;
  const { tool } = ctx;
  const repoRoot = options.repoRoot;

  switch (toolId) {
    case "vulnerability-finder":
      return runVulnerabilityFinder(tool, repoRoot);
    case "contradiction-scout":
      return runContradictionScout(tool, repoRoot);
    case "source-gap-finder":
      return runSourceGapFinder(tool, repoRoot);
    case "bill-impact-analyzer":
      return runBillImpactAnalyzer(tool, options.billNumber ?? "SB487", repoRoot);
    case "debate-question-generator":
      return runDebateQuestionGenerator(tool, repoRoot);
    case "trap-question-detector":
      return runTrapQuestionDetector(tool, repoRoot);
    case "rebuttal-builder":
      return runRebuttalBuilder(tool, options.topic ?? "check my record / direct democracy", repoRoot);
    case "counterargument-predictor":
      return runCounterargumentPredictor(tool, repoRoot);
    case "bridge-line-builder":
      return runBridgeLineBuilder(tool, repoRoot);
    case "check-my-record-responder":
      return runCheckMyRecordResponder(tool, repoRoot);
    case "packo-lane-advisor":
      return runPackoLaneAdvisor(tool, repoRoot);
    case "direct-democracy-explainer":
      return runDirectDemocracyExplainer(tool, options.topic ?? "petition acts 2025", repoRoot);
    case "answer-builder-30-60-90":
      return runAnswerBuilder(tool, options.topic ?? "election integrity", repoRoot);
    case "what-not-to-say-detector":
      return runWhatNotToSayDetector(tool, repoRoot);
    case "media-finding-triage":
      return runMediaFindingTriage(tool, repoRoot);
    case "public-meeting-watchlist-builder":
      return runPublicMeetingWatchlistBuilder(tool, repoRoot);
    case "morning-brief-synthesizer":
      return runGenericBriefingTool(tool, "morning-intelligence", repoRoot);
    case "executive-summary-builder":
      return runGenericBriefingTool(tool, options.paperId ?? "morning-intelligence", repoRoot);
    case "county-brief-expander":
      return runGenericBriefingTool(tool, `county-${options.countyId ?? "pulaski"}`, repoRoot);
    case "bill-brief-expander":
      return runGenericBriefingTool(tool, "debate-prep", repoRoot);
    case "candidate-talking-point-builder":
    case "volunteer-script-builder":
    case "social-media-draft-builder":
    case "surrogate-memo-builder":
    case "press-statement-draft-builder":
    case "plain-english-translator":
    case "keywords-phrase-extractor":
      return runGenericBriefingTool(tool, options.paperId ?? "candidate-talking-points", repoRoot);
    default: {
      const paper = buildStrategicBriefingPaper("morning-intelligence", repoRoot);
      return baseOutput(tool, tool.name, [
        { heading: "Deterministic composition", bullets: [tool.purpose, ...paper.executiveSummary.slice(0, 2)] },
        { heading: "Operator next action", bullets: [tool.operatorNextAction] },
      ], repoRoot);
    }
  }
}

export function listCopilotToolsByCategory(category?: string, repoRoot?: string): AiCopilotToolEntry[] {
  const registry = loadAiCopilotToolRegistry(repoRoot);
  if (!category) return registry.tools;
  return registry.tools.filter((row) => row.category === category);
}

export function recommendCopilotRuns(repoRoot?: string): string[] {
  const narratives = loadKimHammerNarrativeStateIndex(repoRoot);
  const media = loadPublicMediaIntakeQueue(repoRoot);
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const runs: string[] = [];
  if (narratives.narratives.some((row) => row.readinessBand === "WEAK" || row.readinessBand === "BLOCKED")) {
    runs.push("Run vulnerability-finder for weak narrative review.");
  }
  if (media.findings.some((f) => f.reviewStatus === "NEEDS_REVIEW")) {
    runs.push("Run media-finding-triage for intake backlog.");
  }
  if (evidence.retrievalTasks.some((t) => t.taskStatus !== "COMPLETE" && t.taskStatus !== "ARCHIVED")) {
    runs.push("Run source-gap-finder before debate prep.");
  }
  runs.push("Run what-not-to-say-detector before any debate rehearsal.");
  runs.push("Run public-meeting-watchlist-builder for county coverage gaps.");
  return runs.slice(0, 6);
}

export function summarizeCopilotInternalDraftInsights(repoRoot?: string): string[] {
  const media = loadPublicMediaIntakeQueue(repoRoot);
  const insights: string[] = [];
  for (const finding of media.findings.slice(0, 2)) {
    insights.push(summarizeFindingForMorningBrief(finding.findingId, repoRoot));
  }
  const vuln = runDeterministicCopilotTool("vulnerability-finder", { repoRoot });
  if (vuln) insights.push(summarizeCopilotToolOutput(vuln));
  return insights;
}

export type CopilotWithLlmQueueResult = {
  deterministic: CopilotToolOutput;
  llmDraftId: string | null;
  generationMode: string | null;
};

export function runCopilotWithLlmDraftQueue(
  toolId: string,
  options: {
    repoRoot?: string;
    billNumber?: string;
    topic?: string;
    paperId?: string;
    countyId?: string;
    generatedForRoute: string;
    attemptLlm?: boolean;
  },
): CopilotWithLlmQueueResult | null {
  const deterministic = runDeterministicCopilotTool(toolId, options);
  if (!deterministic) return null;

  const llmResult = generateGovernedDraftForCopilotTool(toolId, {
    generatedForRoute: options.generatedForRoute,
    billNumber: options.billNumber,
    countyId: options.countyId,
    narrativeId: options.paperId,
    attemptLlm: options.attemptLlm,
    repoRoot: options.repoRoot,
  });

  return {
    deterministic,
    llmDraftId: llmResult?.draft.draftId ?? null,
    generationMode: llmResult?.generationMode ?? null,
  };
}
