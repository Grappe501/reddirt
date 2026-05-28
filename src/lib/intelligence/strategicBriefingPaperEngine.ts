import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { computeStatewideRegistrationRollup } from "@/lib/intelligence/voterRegistrationTargetModel";
import { summarizeMediaMonitoringReadiness } from "@/lib/intelligence/publicMediaMonitor";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import { buildAggregateCampaignIntelligenceIndex } from "@/lib/intelligence/aggregateCampaignIntelligence";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import { summarizeNarrativeUsageRisk } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

export type StrategicBriefingDrilldownLink = {
  label: string;
  href: string;
  category:
    | "citation"
    | "claim"
    | "bill"
    | "county"
    | "doctrine"
    | "export"
    | "audit"
    | "task"
    | "ai_suggestion"
    | "evidence"
    | "narrative"
    | "route";
};

export type StrategicBriefingPaper = {
  paperId: string;
  title: string;
  generatedAt: string;
  governanceLabel: "GOVERNED_COMPOSITION_ONLY";
  publishability: "NON_PUBLISHABLE";
  executiveSummary: string[];
  whatChanged: string[];
  whyItMatters: string[];
  evidenceStatus: string[];
  countyImpact: string[];
  voterImpact: string[];
  strategicDoctrineAlignment: string[];
  opponentRelevance: string[];
  debateRelevance: string[];
  fieldRelevance: string[];
  mediaRelevance: string[];
  risksAndBlockers: string[];
  recommendedNextResearch: string[];
  whatCandidateNeedsToKnow: string[];
  whatCommsNeedsToKnow: string[];
  whatFieldTeamNeedsToKnow: string[];
  whatVolunteersCanSafelySay: string[];
  whatNotToSay: string[];
  drillDownLinks: StrategicBriefingDrilldownLink[];
  readiness: {
    evidenceHealth: string;
    narrativeReadiness: string;
    countyReadiness: string;
    messagingReadiness: string;
  };
  deepSections: {
    situationOverview: string[];
    whyThisMattersToday: string[];
    whatChangedSinceLastBrief: string[];
    politicalImpact: string[];
    countyImpactDeep: string[];
    voterImpactDeep: string[];
    opponentOpportunity: string[];
    kellyOpportunity: string[];
    debateUse: string[];
    mediaUse: string[];
    volunteerUse: string[];
    citationDrilldown: string[];
    evidenceWeaknesses: string[];
    strategicRisks: string[];
    recommendedIntelligenceActions: string[];
    suggestedTalkingPointDrafts: string[];
    whatNotToSay: string[];
    openQuestions: string[];
  };
};

export function buildStrategicBriefingPaper(
  paperId: string,
  repoRoot: string = process.cwd(),
): StrategicBriefingPaper {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const narratives = loadKimHammerNarrativeStateIndex(repoRoot);
  const usage = summarizeNarrativeUsageRisk(repoRoot);
  const citations = loadKimHammerCitationLocker(repoRoot);
  const exports = loadKimHammerExportHistory(repoRoot);
  const countyIndex = loadCountyBriefingIntelligenceIndex(repoRoot);
  const aggregate = buildAggregateCampaignIntelligenceIndex(countyIndex.counties, repoRoot);
  const alignment = summarizeStrategicAlignmentRisk(repoRoot);
  const registration = computeStatewideRegistrationRollup(repoRoot);
  const media = summarizeMediaMonitoringReadiness(repoRoot);
  const winTarget = loadKellyWinTargetScenarioFile(repoRoot);
  const workbench = loadKimHammerWorkbench();

  const strongNarratives = narratives.narratives.filter((row) => row.readinessBand === "STRONG");
  const blockedNarratives = narratives.narratives.filter((row) => row.readinessBand === "BLOCKED");
  const weakNarratives = narratives.narratives.filter((row) => row.readinessBand === "WEAK");

  const executiveSummary = [
    `${strongNarratives.length} narratives STRONG; ${blockedNarratives.length} BLOCKED; ${weakNarratives.length} WEAK.`,
    `Export-ready claims: ${evidence.metrics.exportReadyClaims} (governed gate).`,
    winTarget
      ? `Statewide working target with cushion: ${winTarget.statewide.workingTargetWithCushion.toLocaleString()} votes.`
      : "Statewide win target scenario: MISSING.",
    `Registration yield model (anecdotal): ${registration.expectedSupportVotes.toLocaleString()} expected support votes from ${registration.statewideRegistrationGoal.toLocaleString()} registrations.`,
  ];

  const whatChanged = [
    `${usage.topFatigueWarnings?.length ?? 0} narrative fatigue warnings active.`,
    `${evidence.retrievalTasks.filter((t) => t.taskStatus !== "COMPLETE").length} open retrieval tasks.`,
    `${media.sourceCount} media sources registered (${media.rssReadyCount} RSS-ready).`,
  ];

  const whyItMatters = [
    "Morning intelligence composition for operator review — not autonomous publishing.",
    "County overlays and doctrine alignment inform where messaging is safe vs blocked.",
    "Registration pathway assumptions require field validation before strategic reliance.",
  ];

  const evidenceStatus = [
    `Total claims: ${evidence.metrics.totalClaims}; export-ready: ${evidence.metrics.exportReadyClaims}.`,
    `Review needed: ${evidence.metrics.reviewNeededClaims}; blocked: ${evidence.metrics.blockedClaims}.`,
    `Citation locker entries: ${citations.citations.length}.`,
    `Export history events: ${exports.entries.length}.`,
  ];

  const countyImpact = countyIndex.counties.map(
    (row) => `${row.countyName}: ${row.confidenceBand} confidence, ${row.localRiskLevel} local risk.`,
  );

  const voterImpact = aggregate.countyEnvironments.flatMap((env) =>
    env.operationalSignals.slice(0, 1).map((row) => `${env.countyName}: ${row.text.slice(0, 120)}`),
  );

  const strategicDoctrineAlignment =
    alignment.topStrategicTensions?.map((row) => `${row.narrativeTitle}: ${row.signal.slice(0, 100)}`) ?? [
      "No doctrine tensions flagged.",
    ];

  const opponentRelevance = workbench.strongestDebateAnchors
    .slice(0, 4)
    .map((bill) => `${bill.billNumber}: ${bill.topicCategory[0] ?? "election topic"}`);

  const debateRelevance = countyIndex.counties
    .filter((row) => row.briefingSignals.some((s) => s.signal === "COUNTY_DEBATE_RELEVANT"))
    .map((row) => `${row.countyName}: ${row.debatePrepGuidance[0] ?? "review debate guidance"}`);

  const fieldRelevance = countyIndex.counties.flatMap((row) =>
    row.volunteerSurrogateGuidance.slice(0, 1).map((line) => `${row.countyName}: ${line.slice(0, 100)}`),
  );

  const mediaRelevance = [
    ...media.gaps.slice(0, 2),
    "All media findings default NEEDS_REVIEW / NON_PUBLISHABLE until NSI-8 intake.",
  ];

  const risksAndBlockers = [
    ...blockedNarratives.slice(0, 3).map((row) => `Blocked narrative: ${row.title}`),
    ...registration.countyRows.filter((row) => row.dataStatus === "MISSING").slice(0, 2).map(
      (row) => `Registration goal missing: ${row.countyName}`,
    ),
    ...workbench.riskClaims.slice(0, 2),
  ];

  const recommendedNextResearch = evidence.retrievalTasks
    .filter((task) => task.taskStatus !== "COMPLETE")
    .slice(0, 5)
    .map((task) => task.description.slice(0, 120));

  const whatCandidateNeedsToKnow = [
    ...strongNarratives.slice(0, 2).map((row) => `Lead with: ${row.title}`),
    ...blockedNarratives.slice(0, 1).map((row) => `Avoid blocked frame: ${row.title}`),
    "Answer the question first; bridge to trust, transparency, and county support.",
  ];

  const whatCommsNeedsToKnow = [
    `${usage.overexposedCount} overused narrative signals — watch fatigue.`,
    "Social and surrogate copy requires human review — INTERNAL_DRAFT only.",
    ...media.gaps.slice(0, 1),
  ];

  const whatFieldTeamNeedsToKnow = countyIndex.counties
    .flatMap((row) => row.countyStrategyNotes.slice(0, 1).map((note) => `${row.countyName}: ${note.slice(0, 100)}`))
    .slice(0, 4);

  const whatVolunteersCanSafelySay = workbench.safeLanguage.slice(0, 5);

  const whatNotToSay = [
    ...workbench.riskClaims.slice(0, 4),
    ...blockedNarratives.slice(0, 2).map((row) => `Blocked narrative language: ${row.title}`),
  ];

  const drillDownLinks: StrategicBriefingDrilldownLink[] = [
    { label: "Evidence Command", href: "/admin/intelligence/kim-hammer/evidence-command", category: "evidence" },
    { label: "Citation locker", href: "/admin/intelligence/kim-hammer/citation-locker", category: "citation" },
    { label: "Claims review", href: "/admin/intelligence/kim-hammer/claims-review", category: "claim" },
    { label: "County briefings", href: "/admin/intelligence/kim-hammer/county-briefings", category: "county" },
    { label: "Strategy alignment", href: "/admin/intelligence/strategy-alignment", category: "doctrine" },
    { label: "Export control", href: "/admin/intelligence/kim-hammer/export-control-center", category: "export" },
    { label: "AI suggestion sandbox", href: "/admin/intelligence/kim-hammer/ai-suggestion-sandbox", category: "ai_suggestion" },
    { label: "Target pathway", href: "/admin/intelligence/strategic-target-pathway", category: "route" },
    { label: "Writing toolbox", href: "/admin/intelligence/writing-toolbox", category: "route" },
    { label: "AI tools dashboard", href: "/admin/intelligence/ai-tools", category: "route" },
    { label: "LLM review queue", href: "/admin/intelligence/llm-review-queue", category: "route" },
    { label: "Briefing papers", href: "/admin/intelligence/briefing-papers", category: "route" },
    { label: "Opposition AI copilot", href: "/admin/intelligence/kim-hammer/ai-opposition-copilot", category: "route" },
    { label: "Debate AI workbench", href: "/admin/intelligence/kim-hammer/debate-ai-workbench", category: "route" },
    ...workbench.strongestDebateAnchors.slice(0, 3).map((bill) => ({
      label: bill.billNumber,
      href: `/admin/intelligence/kim-hammer/bills/${encodeURIComponent(bill.billNumber)}`,
      category: "bill" as const,
    })),
    ...countyIndex.counties.slice(0, 3).map((row) => ({
      label: row.countyName,
      href: `/admin/intelligence/kim-hammer/counties/${row.countyId}`,
      category: "county" as const,
    })),
  ];

  const evidenceHealth =
    evidence.metrics.exportReadyClaims >= 1 && evidence.metrics.reviewNeededClaims <= evidence.metrics.totalClaims
      ? "MODERATE"
      : "NEEDS_ATTENTION";

  const narrativeReadiness =
    blockedNarratives.length === 0 ? "OPERATIONAL" : `${blockedNarratives.length} BLOCKED`;

  const countyReadiness = `${countyIndex.counties.filter((row) => row.confidenceBand === "STRONG").length}/${countyIndex.counties.length} counties STRONG`;

  const messagingReadiness =
    strongNarratives.length >= 2 ? "DRAFT_READY_WITH_REVIEW" : "LIMITED — strengthen narratives first";

  const deepSections = {
    situationOverview: executiveSummary,
    whyThisMattersToday: whyItMatters,
    whatChangedSinceLastBrief: whatChanged,
    politicalImpact: opponentRelevance,
    countyImpactDeep: countyImpact,
    voterImpactDeep: voterImpact,
    opponentOpportunity: workbench.strongestDebateAnchors.slice(0, 3).map((b) => `${b.billNumber}: opponent record anchor`),
    kellyOpportunity: strongNarratives.slice(0, 3).map((n) => `Kelly frame: ${n.title}`),
    debateUse: debateRelevance,
    mediaUse: mediaRelevance,
    volunteerUse: whatVolunteersCanSafelySay,
    citationDrilldown: evidenceStatus,
    evidenceWeaknesses: [
      `${evidence.metrics.reviewNeededClaims} claims need review.`,
      `${citations.citations.filter((c) => c.reviewStatus === "NEEDS_REVIEW").length} citations NEEDS_REVIEW.`,
    ],
    strategicRisks: risksAndBlockers,
    recommendedIntelligenceActions: recommendedNextResearch,
    suggestedTalkingPointDrafts: whatCandidateNeedsToKnow.map((line) => `[INTERNAL_DRAFT] ${line}`),
    whatNotToSay,
    openQuestions: [
      ...registration.countyRows.filter((r) => r.dataStatus === "MISSING").slice(0, 2).map((r) => `Registration goal: ${r.countyName}`),
      "Cross-state media robots review pending (NSI-12).",
    ],
  };

  return {
    paperId,
    title: `Strategic Intelligence Briefing — ${paperId}`,
    generatedAt: new Date().toISOString(),
    governanceLabel: "GOVERNED_COMPOSITION_ONLY",
    publishability: "NON_PUBLISHABLE",
    executiveSummary,
    whatChanged,
    whyItMatters,
    evidenceStatus,
    countyImpact,
    voterImpact,
    strategicDoctrineAlignment,
    opponentRelevance,
    debateRelevance,
    fieldRelevance,
    mediaRelevance,
    risksAndBlockers,
    recommendedNextResearch,
    whatCandidateNeedsToKnow,
    whatCommsNeedsToKnow,
    whatFieldTeamNeedsToKnow,
    whatVolunteersCanSafelySay,
    whatNotToSay,
    drillDownLinks,
    readiness: {
      evidenceHealth,
      narrativeReadiness,
      countyReadiness,
      messagingReadiness,
    },
    deepSections,
  };
}

export function buildMorningBriefingPaper(repoRoot?: string): StrategicBriefingPaper {
  return buildStrategicBriefingPaper("morning-intelligence", repoRoot);
}
