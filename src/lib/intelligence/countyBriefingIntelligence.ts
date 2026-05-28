import { computeCountyOperationalEnvironment } from "@/lib/intelligence/aggregateCampaignIntelligence";
import { resolveCountyGraphBundle } from "@/lib/intelligence/campaignIntelligenceGraph";
import { resolveNarrativeDoctrineAlignment } from "@/lib/intelligence/campaignStrategicAlignment";
import { computeKimHammerBillCivicIntelligence } from "@/lib/intelligence/kimHammerBillCivicIntelligence";
import type {
  CountyBriefingConfidenceBand,
  CountyBriefingIndexCard,
  CountyBriefingIntelligence,
  CountyBriefingIntelligenceIndex,
  CountyBriefingLocalRiskLevel,
  CountyBriefingSignalRow,
  CountyNarrativePriority,
  CountyOpponentBillPriority,
} from "@/lib/intelligence/types/countyBriefingIntelligence";
import { COUNTY_REGIONS as REGION_MAP } from "@/lib/intelligence/types/countyBriefingIntelligence";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerEvidenceIndex, resolveRetrievalTaskStatus } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import {
  computeGeographicNarrativeState,
  loadKimHammerGeographicNarrativeOverlays,
  resolveNarrativeCountyState,
} from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { resolveKimHammerNarrativeState } from "@/lib/opposition/kimHammerNarrativeState";
import { loadKimHammerAiSuggestionSandbox } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { findKimHammerBill, loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import type { KimHammerGeographicCountyState } from "@/lib/opposition/types/kimHammerGeographicNarrative";

function resolveConfidenceBand(
  countyState: KimHammerGeographicCountyState,
): CountyBriefingConfidenceBand {
  if (countyState.blockedNarrativeCount > 0 || countyState.dominantSignal === "COUNTY_BLOCKED") {
    return "BLOCKED";
  }
  if (countyState.dominantSignal === "COUNTY_STRONG" && countyState.averageScore >= 0.75) {
    return "STRONG";
  }
  if (
    countyState.dominantSignal === "COUNTY_WEAK" ||
    countyState.dominantSignal === "COUNTY_UNDERDEVELOPED"
  ) {
    return "WEAK";
  }
  return "MODERATE";
}

function resolveLocalRiskLevel(
  localMediaRisk: string,
  blockedCount: number,
): CountyBriefingLocalRiskLevel {
  if (localMediaRisk === "HIGH" || blockedCount >= 2) return "HIGH";
  if (localMediaRisk === "MEDIUM" || blockedCount >= 1) return "MEDIUM";
  return "LOW";
}

function narrativeToPriority(
  cell: NonNullable<ReturnType<typeof resolveNarrativeCountyState>>,
): CountyNarrativePriority {
  return {
    narrativeId: cell.narrativeId,
    narrativeTitle: cell.narrativeTitle,
    geographicSignal: cell.geographicSignal,
    geographicScore: cell.geographicScore,
    signalText: cell.signal,
  };
}

export function computeCountyNarrativePriorities(
  countyId: string,
  repoRoot: string = process.cwd(),
): {
  top: CountyNarrativePriority[];
  weak: CountyNarrativePriority[];
  blocked: CountyNarrativePriority[];
} {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);
  if (!overlay) return { top: [], weak: [], blocked: [] };

  const cells = overlay.narrativeIds
    .map((narrativeId) => resolveNarrativeCountyState(narrativeId, countyId, repoRoot))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map(narrativeToPriority);

  const blocked = cells.filter((row) => row.geographicSignal === "COUNTY_BLOCKED");
  const weak = cells
    .filter(
      (row) =>
        row.geographicSignal === "COUNTY_WEAK" ||
        row.geographicSignal === "COUNTY_UNDERDEVELOPED" ||
        row.geographicSignal === "COUNTY_OVEREXPOSED",
    )
    .sort((a, b) => a.geographicScore - b.geographicScore);
  const top = cells
    .filter(
      (row) =>
        row.geographicSignal === "COUNTY_STRONG" || row.geographicSignal === "COUNTY_MODERATE",
    )
    .sort((a, b) => b.geographicScore - a.geographicScore);

  return { top, weak, blocked };
}

export function computeCountyOppositionBillPriorities(
  countyId: string,
  repoRoot: string = process.cwd(),
): CountyOpponentBillPriority[] {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);
  if (!overlay) return [];

  const workbench = loadKimHammerWorkbench();
  const billNumbers = new Set<string>();

  for (const narrativeId of overlay.narrativeIds) {
    if (/^SB\d+/i.test(narrativeId)) billNumbers.add(narrativeId.toUpperCase());
    const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
    for (const bill of workbench.bills) {
      if (
        narrative?.linkedClaimIds.some((id) =>
          bill.sourceLinks.some((link) => link.includes(id)),
        ) ||
        overlay.unresolvedDependencies.some((dep) =>
          dep.toUpperCase().includes(bill.billNumber.toUpperCase()),
        ) ||
        overlay.countyBurdenSignals.some((sig) =>
          bill.billNumber.toUpperCase().includes(sig.toUpperCase()),
        )
      ) {
        billNumbers.add(bill.billNumber.toUpperCase());
      }
    }
  }

  for (const anchor of workbench.strongestDebateAnchors) {
    if (
      overlay.narrativeIds.some((id) => id.toUpperCase().includes(anchor.billNumber.toUpperCase()))
    ) {
      billNumbers.add(anchor.billNumber.toUpperCase());
    }
  }

  const graphBundle = resolveCountyGraphBundle(countyId, repoRoot);
  for (const billEntity of graphBundle.bills) {
    const match = billEntity.entityId.replace(/^bill-/, "");
    billNumbers.add(match);
  }

  const scored: CountyOpponentBillPriority[] = [];
  for (const billNumber of billNumbers) {
    const bill = findKimHammerBill(billNumber);
    if (!bill) continue;
    const civic = computeKimHammerBillCivicIntelligence(bill, repoRoot);
    let localRelevanceScore = 0.5;
    if (overlay.narrativeIds.includes(billNumber)) localRelevanceScore += 0.25;
    if (overlay.localDebateRelevance === "HIGH") localRelevanceScore += 0.15;
    if (overlay.countyBurdenSignals.some((sig) => civic.civicSignalText.toLowerCase().includes(sig.split("-")[0] ?? sig))) {
      localRelevanceScore += 0.1;
    }
    if (overlay.unresolvedDependencies.some((dep) => dep.includes(billNumber))) {
      localRelevanceScore -= 0.1;
    }

    scored.push({
      billNumber: bill.billNumber,
      actNumber: bill.actNumber,
      localRelevanceScore: Number(Math.min(1, localRelevanceScore).toFixed(2)),
      civicSignal: civic.civicSignal,
      civicSignalText: civic.civicSignalText,
      localReason:
        overlay.localOperationalImpact ||
        `Relevant to ${overlay.countyName} through ${overlay.narrativeIds.filter((id) => id.includes("SB") || id.includes("kh0b")).slice(0, 2).join(", ")}.`,
    });
  }

  return scored.sort((a, b) => b.localRelevanceScore - a.localRelevanceScore);
}

export function computeCountyResearchNeeds(
  countyId: string,
  repoRoot: string = process.cwd(),
): string[] {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);
  if (!overlay) return [];

  const index = loadKimHammerEvidenceIndex(repoRoot);
  const narrativeIds = new Set(overlay.narrativeIds);
  const taskNeeds = index.retrievalTasks
    .filter((task) => {
      if (resolveRetrievalTaskStatus(task) === "COMPLETE") return false;
      for (const narrativeId of overlay.narrativeIds) {
        const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
        if (narrative?.linkedTaskIds.includes(task.id)) return true;
      }
      return false;
    })
    .map((task) => `TASK: ${task.id} — ${task.description}`);

  const sandbox = loadKimHammerAiSuggestionSandbox(repoRoot);
  const suggestionNeeds = sandbox.suggestions
    .filter(
      (row) =>
        row.status === "PENDING" &&
        row.relatedNarrativeIds?.some((id) => narrativeIds.has(id)),
    )
    .map((row) => `AI_SUGGESTION: ${row.title}`);

  return [
    ...overlay.recommendedResearchNeeds,
    ...overlay.unresolvedDependencies.filter((dep) => !dep.startsWith("No ")),
    ...taskNeeds,
    ...suggestionNeeds,
  ];
}

export function computeCountyMessagingGuidance(
  countyId: string,
  repoRoot: string = process.cwd(),
): {
  recommendedMessagingFrames: string[];
  whatToAvoid: string[];
  volunteerSurrogateGuidance: string[];
} {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);
  const { top, blocked } = computeCountyNarrativePriorities(countyId, repoRoot);
  const graphBundle = resolveCountyGraphBundle(countyId, repoRoot);

  const recommendedMessagingFrames: string[] = [
    "Process clarity over polarization — balls-and-strikes SOS framing.",
    "County partnership and election-worker support before blame rhetoric.",
    overlay?.strategicNotes ?? "",
    ...graphBundle.philosophyNodes.flatMap((node) => node.messagingFrames).slice(0, 3),
  ].filter(Boolean);

  for (const narrative of top.slice(0, 2)) {
    const alignment = resolveNarrativeDoctrineAlignment(narrative.narrativeId, repoRoot);
    if (alignment?.alignmentSignal === "STRATEGICALLY_ALIGNED") {
      recommendedMessagingFrames.push(alignment.signal);
    }
    const base = resolveKimHammerNarrativeState(narrative.narrativeId, repoRoot);
    if (base?.signal) recommendedMessagingFrames.push(base.signal.slice(0, 120));
  }

  const whatToAvoid: string[] = [
    "Motive inference without statutory confirmation.",
    "County blame without offering SOS modernization support.",
    "Conspiratorial election rhetoric — stay with documented process impacts.",
  ];
  if (overlay?.localMediaRisk === "HIGH") {
    whatToAvoid.push("High-saturation media markets require tighter citation discipline before local deployment.");
  }
  for (const narrative of blocked) {
    whatToAvoid.push(`Blocked locally: ${narrative.narrativeTitle} — ${narrative.signalText.slice(0, 120)}`);
  }

  const volunteerSurrogateGuidance: string[] = [
    "Use export-ready talking points only — no improvisation on bill text.",
    "Lead with how the SOS office should help counties and voters, not opponent personality.",
    overlay?.localOperationalImpact ?? "Connect election-law changes to local clerk workload and voter access.",
    "If asked about a specific bill, bridge to verified process impacts and offer to follow up with sourced material.",
  ];

  return {
    recommendedMessagingFrames: [...new Set(recommendedMessagingFrames)].slice(0, 8),
    whatToAvoid: [...new Set(whatToAvoid)].slice(0, 8),
    volunteerSurrogateGuidance,
  };
}

export function computeCountyDebateGuidance(
  countyId: string,
  repoRoot: string = process.cwd(),
): string[] {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);
  const bills = computeCountyOppositionBillPriorities(countyId, repoRoot);
  const { top } = computeCountyNarrativePriorities(countyId, repoRoot);

  const guidance: string[] = [
    overlay?.localDebateRelevance === "HIGH"
      ? `${overlay.countyName}: high local debate relevance — prepare county-specific clerk/site examples.`
      : `${overlay?.countyName ?? countyId}: moderate/low local debate saturation — lead with statewide process-trust frame.`,
    "Answer the question first, then bridge to trust, transparency, and county support.",
  ];

  for (const bill of bills.slice(0, 3)) {
    const row = findKimHammerBill(bill.billNumber);
    if (!row) continue;
    const civic = computeKimHammerBillCivicIntelligence(row, repoRoot);
    guidance.push(
      `${bill.billNumber}: ${civic.publicExplanationLayer[0] ?? civic.civicSignalText}`,
    );
    guidance.push(...civic.debateFramingLayer.bridgeLines.slice(0, 1));
  }

  for (const narrative of top.slice(0, 2)) {
    guidance.push(`Strong local narrative: ${narrative.narrativeTitle} — ${narrative.signalText.slice(0, 140)}`);
  }

  return guidance;
}

function resolveCountyBriefingSignals(
  countyState: KimHammerGeographicCountyState,
  overlay: NonNullable<
    ReturnType<typeof loadKimHammerGeographicNarrativeOverlays>["overlays"][number]
  >,
  exportReadyCount: number,
  researchNeeds: string[],
  blockedCount: number,
): CountyBriefingSignalRow[] {
  const signals: CountyBriefingSignalRow[] = [];

  if (
    countyState.dominantSignal === "COUNTY_STRONG" &&
    blockedCount === 0 &&
    exportReadyCount > 0
  ) {
    signals.push({
      signal: "COUNTY_READY",
      text: `${overlay.countyName} has strong narrative cells, export-ready talking points, and doctrine-compatible framing for governed local use.`,
    });
  }

  if (researchNeeds.length > 0) {
    signals.push({
      signal: "COUNTY_NEEDS_RESEARCH",
      text: `${overlay.countyName} local intelligence incomplete — ${researchNeeds.length} open research item(s) including ${researchNeeds[0]?.slice(0, 100) ?? "county sourcing gaps"}.`,
    });
  }

  const citationWeak = overlay.unresolvedDependencies.some(
    (dep) =>
      dep.includes("NEEDS_REVIEW") ||
      dep.includes("PARTIAL") ||
      dep.includes("CITATION") ||
      dep.includes("cite-"),
  );
  if (citationWeak || blockedCount > 0) {
    signals.push({
      signal: "COUNTY_CITATION_WEAK",
      text: `${overlay.countyName} evidence chain too thin or stale for heavy local reliance — verify citations and clerk corroboration before field use.`,
    });
  }

  if (overlay.localMediaRisk === "HIGH" || countyState.dominantSignal === "COUNTY_OVEREXPOSED") {
    signals.push({
      signal: "COUNTY_MESSAGE_RISK",
      text: `${overlay.countyName} framing could backfire in ${overlay.localMediaRisk} media-risk environment — tighten doctrine-safe language and avoid overexposed narratives.`,
    });
  }

  if (countyState.dominantSignal === "COUNTY_STRONG" && overlay.localDebateRelevance !== "LOW") {
    signals.push({
      signal: "COUNTY_HIGH_OPPORTUNITY",
      text: `${overlay.countyName} shows strong strategic fit for process-trust and county-support messaging with local debate relevance.`,
    });
  }

  if (overlay.localDebateRelevance === "HIGH" || overlay.localDebateRelevance === "MEDIUM") {
    signals.push({
      signal: "COUNTY_DEBATE_RELEVANT",
      text: `${overlay.countyName} useful for forums/debates — ${overlay.localOperationalImpact.slice(0, 120)}.`,
    });
  }

  if (exportReadyCount > 0 && blockedCount === 0 && overlay.localMediaRisk !== "HIGH") {
    signals.push({
      signal: "COUNTY_VOLUNTEER_READY",
      text: `${overlay.countyName} has ${exportReadyCount} export-ready talking point(s) suitable for surrogate/field use with citation discipline.`,
    });
  }

  return signals;
}

export function resolveCountyBriefingIntelligence(
  countyId: string,
  repoRoot: string = process.cwd(),
): CountyBriefingIntelligence | undefined {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);
  if (!overlay) return undefined;

  const countyState = computeGeographicNarrativeState(overlay, repoRoot);
  const { top, weak, blocked } = computeCountyNarrativePriorities(countyId, repoRoot);
  const topOpponentBills = computeCountyOppositionBillPriorities(countyId, repoRoot);
  const messaging = computeCountyMessagingGuidance(countyId, repoRoot);
  const debatePrepGuidance = computeCountyDebateGuidance(countyId, repoRoot);
  const openResearchNeeds = computeCountyResearchNeeds(countyId, repoRoot);
  const graphBundle = resolveCountyGraphBundle(countyId, repoRoot);
  const index = loadKimHammerEvidenceIndex(repoRoot);

  const linkedClaimIds = new Set<string>();
  for (const narrativeId of overlay.narrativeIds) {
    const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
    for (const claimId of narrative?.linkedClaimIds ?? []) linkedClaimIds.add(claimId);
  }

  const exportReadyTalkingPoints = index.exportReadyClaims
    .filter((claim) => linkedClaimIds.has(claim.id) || countyId === "statewide")
    .map((claim) => `${claim.id}: ${claim.topic ?? claim.text?.slice(0, 80) ?? "export-ready claim"}`);

  const citations = loadKimHammerCitationLocker(repoRoot);
  const exportHistory = loadKimHammerExportHistory(repoRoot);
  const countyExports = exportHistory.entries.filter(
    (entry) =>
      entry.scope === "COUNTY" && entry.countyId?.toLowerCase() === countyId.toLowerCase(),
  );

  const strongestEvidence: string[] = [];
  const weakestEvidence: string[] = [];
  for (const narrativeId of overlay.narrativeIds) {
    const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
    if (!narrative) continue;
    if (narrative.readinessBand === "STRONG" || narrative.readinessBand === "MODERATE") {
      strongestEvidence.push(`${narrative.title}: ${narrative.readinessBand} readiness`);
    } else {
      weakestEvidence.push(`${narrative.title}: ${narrative.blockers[0] ?? narrative.readinessBand}`);
    }
    for (const citeId of narrative.linkedCitationIds) {
      const cite = citations.citations.find((row) => row.id === citeId);
      if (cite?.sourceHealth === "HEALTHY") strongestEvidence.push(`${citeId}: ${cite.summary.slice(0, 80)}`);
      else if (cite) weakestEvidence.push(`${citeId}: ${cite.sourceHealth ?? "NEEDS_REVIEW"}`);
    }
  }

  const doctrineAlignmentSummary: string[] = [];
  for (const narrativeId of overlay.narrativeIds.slice(0, 4)) {
    const alignment = resolveNarrativeDoctrineAlignment(narrativeId, repoRoot);
    if (alignment) {
      doctrineAlignmentSummary.push(`${alignment.narrativeTitle}: ${alignment.signal}`);
    }
  }
  for (const doctrine of graphBundle.doctrines.slice(0, 2)) {
    doctrineAlignmentSummary.push(`${doctrine.title}: linked via intelligence graph`);
  }

  const civicImpactSummary: string[] = [];
  const ballotInitiativeImpact: string[] = [];
  const electionIntegrityImpact: string[] = [];
  const transparencyAccountabilityImpact: string[] = [];
  const governmentAccessibilityImpact: string[] = [];
  const citizenEmpowermentImpact: string[] = [];

  for (const bill of topOpponentBills.slice(0, 4)) {
    const row = findKimHammerBill(bill.billNumber);
    if (!row) continue;
    const civic = computeKimHammerBillCivicIntelligence(row, repoRoot);
    civicImpactSummary.push(civic.civicSignalText);
    ballotInitiativeImpact.push(`${bill.billNumber}: ${row.directDemocracyImpact}`);
    electionIntegrityImpact.push(`${bill.billNumber}: ${row.enforcementImpact}`);
    transparencyAccountabilityImpact.push(...civic.transparencyAccountabilityAnalysis.slice(0, 1));
    governmentAccessibilityImpact.push(`${bill.billNumber}: ${row.voterAccessImpact}`);
    citizenEmpowermentImpact.push(
      civic.civicSignal === "CIVICALLY_EMPOWERING"
        ? `${bill.billNumber} may expand citizen access when implemented with support.`
        : `${bill.billNumber}: evaluate citizen vs. institutional empowerment in plain language.`,
    );
  }

  const briefingSignals = resolveCountyBriefingSignals(
    countyState,
    overlay,
    exportReadyTalkingPoints.length,
    openResearchNeeds,
    blocked.length,
  );

  const baseBriefing: CountyBriefingIntelligence = {
    countyId: overlay.countyId,
    countyName: overlay.countyName,
    region: REGION_MAP[overlay.countyId] ?? "Arkansas",
    topNarratives: top,
    weakNarratives: weak,
    blockedNarratives: blocked,
    topOpponentBills,
    civicImpactSummary,
    countyOperationsImpact: [
      overlay.localOperationalImpact,
      ...overlay.countyBurdenSignals,
      countyState.topRiskSignal,
    ],
    ballotInitiativeImpact,
    electionIntegrityImpact,
    transparencyAccountabilityImpact,
    governmentAccessibilityImpact,
    citizenEmpowermentImpact,
    recommendedMessagingFrames: messaging.recommendedMessagingFrames,
    debatePrepGuidance,
    volunteerSurrogateGuidance: messaging.volunteerSurrogateGuidance,
    whatToAvoid: messaging.whatToAvoid,
    strongestEvidence: [...new Set(strongestEvidence)].slice(0, 8),
    weakestEvidence: [...new Set(weakestEvidence)].slice(0, 8),
    openResearchNeeds,
    exportReadyTalkingPoints,
    doctrineAlignmentSummary,
    localRiskSummary: [
      `Local media risk: ${overlay.localMediaRisk}`,
      `Dominant geographic signal: ${countyState.dominantSignal}`,
      countyState.topRiskSignal,
      countyExports.length > 0
        ? `${countyExports.length} county-scoped export event(s) on record.`
        : "No county-scoped exports recorded yet.",
    ],
    countyStrategyNotes: [overlay.strategicNotes, ...graphBundle.graphNotes],
    confidenceBand: resolveConfidenceBand(countyState),
    localRiskLevel: resolveLocalRiskLevel(overlay.localMediaRisk, blocked.length),
    briefingSignals,
    graphEntityId: `county-${countyId}`,
    computedAt: new Date().toISOString(),
  };

  return {
    ...baseBriefing,
    operationalIntelligence: computeCountyOperationalEnvironment(countyId, repoRoot, baseBriefing),
  };
}

function toIndexCard(briefing: CountyBriefingIntelligence): CountyBriefingIndexCard {
  const primary = briefing.briefingSignals[0];
  return {
    countyId: briefing.countyId,
    countyName: briefing.countyName,
    region: briefing.region,
    confidenceBand: briefing.confidenceBand,
    localRiskLevel: briefing.localRiskLevel,
    topNarrativeTitle: briefing.topNarratives[0]?.narrativeTitle ?? "—",
    topOpponentBill: briefing.topOpponentBills[0]?.billNumber ?? null,
    openResearchCount: briefing.openResearchNeeds.length,
    exportReadyTalkingPointCount: briefing.exportReadyTalkingPoints.length,
    blockedNarrativeCount: briefing.blockedNarratives.length,
    primarySignal: primary?.signal ?? "COUNTY_NEEDS_RESEARCH",
    primarySignalText: primary?.text ?? briefing.countyStrategyNotes[0] ?? "",
  };
}

export function loadCountyBriefingIntelligenceIndex(
  repoRoot: string = process.cwd(),
): CountyBriefingIntelligenceIndex {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const counties = overlays.overlays
    .map((overlay) => resolveCountyBriefingIntelligence(overlay.countyId, repoRoot))
    .filter((row): row is CountyBriefingIntelligence => Boolean(row));

  return {
    generatedAt: new Date().toISOString(),
    countyCount: counties.length,
    cards: counties.map(toIndexCard),
    counties,
  };
}

export function summarizeCountyBriefingForEvidenceCommand(
  repoRoot?: string,
): {
  countyCount: number;
  highestRiskNarratives: Array<{ countyId: string; countyName: string; narrativeTitle: string; signal: string }>;
  blockedCountyBriefings: Array<{ countyId: string; countyName: string; blockedCount: number }>;
  strongestExportOpportunities: Array<{ countyId: string; countyName: string; exportReadyCount: number }>;
  countiesNeedingResearch: Array<{ countyId: string; countyName: string; openResearchCount: number }>;
} {
  const index = loadCountyBriefingIntelligenceIndex(repoRoot);

  const highestRiskNarratives = index.counties.flatMap((county) =>
    [...county.blockedNarratives, ...county.weakNarratives].slice(0, 2).map((row) => ({
      countyId: county.countyId,
      countyName: county.countyName,
      narrativeTitle: row.narrativeTitle,
      signal: row.signalText.slice(0, 140),
    })),
  ).slice(0, 5);

  const blockedCountyBriefings = index.counties
    .filter((row) => row.blockedNarratives.length > 0 || row.confidenceBand === "BLOCKED")
    .map((row) => ({
      countyId: row.countyId,
      countyName: row.countyName,
      blockedCount: row.blockedNarratives.length,
    }));

  const strongestExportOpportunities = index.counties
    .filter((row) => row.exportReadyTalkingPoints.length > 0 && row.confidenceBand !== "BLOCKED")
    .sort((a, b) => b.exportReadyTalkingPoints.length - a.exportReadyTalkingPoints.length)
    .slice(0, 5)
    .map((row) => ({
      countyId: row.countyId,
      countyName: row.countyName,
      exportReadyCount: row.exportReadyTalkingPoints.length,
    }));

  const countiesNeedingResearch = index.counties
    .filter((row) => row.openResearchNeeds.length > 0)
    .sort((a, b) => b.openResearchNeeds.length - a.openResearchNeeds.length)
    .slice(0, 6)
    .map((row) => ({
      countyId: row.countyId,
      countyName: row.countyName,
      openResearchCount: row.openResearchNeeds.length,
    }));

  return {
    countyCount: index.countyCount,
    highestRiskNarratives,
    blockedCountyBriefings,
    strongestExportOpportunities,
    countiesNeedingResearch,
  };
}
