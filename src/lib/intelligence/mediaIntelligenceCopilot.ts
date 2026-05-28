import { loadPublicMediaIntakeQueue, type PublicMediaIntakeFinding } from "@/lib/intelligence/publicMediaIntake";
import { generateGovernedDraft } from "@/lib/intelligence/llmDraftGateway";
import { loadKimHammerNarrativeRegistry } from "@/lib/opposition/kimHammerNarrativeState";

export type MediaFindingTriageResult = {
  findingId: string;
  title: string;
  relevanceScore: number;
  triageNote: string;
  opponentMention: boolean;
  billMentions: string[];
  countyMentions: string[];
  narrativeLinks: string[];
  suggestedFollowup: string;
  suggestedCitationCandidate: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  autoPromoted: false;
};

const BILL_PATTERN = /\b(SB|HB|HCR|SCR|SJR|HJR)\s?\d{1,4}\b/gi;

function findingText(finding: PublicMediaIntakeFinding): string {
  return `${finding.title} ${finding.summary} ${finding.rawTextExcerpt}`.toLowerCase();
}

export function detectPotentialOpponentMention(finding: PublicMediaIntakeFinding): boolean {
  const text = findingText(finding);
  return (
    text.includes("kim hammer") ||
    text.includes("hammer-authored") ||
    text.includes("secretary of state") ||
    finding.possibleOpponentLinks.length > 0
  );
}

export function detectBillOrLawMention(finding: PublicMediaIntakeFinding): string[] {
  const text = `${finding.title} ${finding.summary}`;
  return [...new Set((text.match(BILL_PATTERN) ?? []).map((b) => b.toUpperCase().replace(/\s+/g, "")))];
}

export function detectCountyRelevance(finding: PublicMediaIntakeFinding): string[] {
  return finding.possibleCountyLinks.length > 0 ? finding.possibleCountyLinks : finding.countiesMentioned;
}

export function detectNarrativeRelevance(finding: PublicMediaIntakeFinding, repoRoot?: string): string[] {
  const fromFinding = finding.possibleNarrativeLinks;
  if (fromFinding.length > 0) return fromFinding;
  const narratives = loadKimHammerNarrativeRegistry(repoRoot);
  const text = findingText(finding);
  return narratives.narratives
    .filter((row) => text.includes(row.narrativeId.replaceAll("-", " ")) || text.includes(row.title.toLowerCase().slice(0, 16)))
    .slice(0, 3)
    .map((row) => row.narrativeId);
}

export function rankMediaFindingForOppositionResearch(
  finding: PublicMediaIntakeFinding,
  repoRoot?: string,
): MediaFindingTriageResult {
  let score = finding.relevanceScore;
  const opponentMention = detectPotentialOpponentMention(finding);
  const bills = detectBillOrLawMention(finding);
  const counties = detectCountyRelevance(finding);
  const narratives = detectNarrativeRelevance(finding, repoRoot);

  if (opponentMention) score += 15;
  if (bills.length > 0) score += 10;
  if (counties.length > 0) score += 5;

  const triageNote =
    opponentMention && bills.length > 0
      ? "High opposition research relevance — opponent + bill mention."
      : opponentMention
        ? "Opponent mention — verify before any citation use."
        : "General civic relevance — manual review.";

  return {
    findingId: finding.findingId,
    title: finding.title,
    relevanceScore: score,
    triageNote,
    opponentMention,
    billMentions: bills,
    countyMentions: counties,
    narrativeLinks: narratives,
    suggestedFollowup: suggestMediaFollowupTask(finding),
    suggestedCitationCandidate: suggestCitationCandidateFromFinding(finding),
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    autoPromoted: false,
  };
}

export function rankMediaFindingsForOppositionResearch(repoRoot?: string): MediaFindingTriageResult[] {
  const queue = loadPublicMediaIntakeQueue(repoRoot);
  return queue.findings
    .map((finding) => rankMediaFindingForOppositionResearch(finding, repoRoot))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export function suggestMediaFollowupTask(finding: PublicMediaIntakeFinding): string {
  return `DRAFT retrieval suggestion: verify "${finding.title.slice(0, 60)}" at ${finding.canonicalUrl} — human must promote via NSI-10 workflow.`;
}

export function suggestCitationCandidateFromFinding(finding: PublicMediaIntakeFinding): string {
  return `DRAFT citation candidate: ${finding.sourceName} — "${finding.title.slice(0, 80)}" — NOT a governed citation until Citation Locker review.`;
}

export function summarizeFindingForMorningBrief(findingId: string, repoRoot?: string): string {
  const finding = loadPublicMediaIntakeQueue(repoRoot).findings.find((row) => row.findingId === findingId);
  if (!finding) return "Finding not found.";
  const triage = rankMediaFindingForOppositionResearch(finding, repoRoot);
  return `[INTERNAL_DRAFT] ${finding.title.slice(0, 80)} — ${triage.triageNote} (score ${triage.relevanceScore})`;
}

export function enqueueMediaIntelligenceLlmDraft(
  findingId: string,
  generatedForRoute: string,
  repoRoot?: string,
): string | null {
  const result = generateGovernedDraft({
    templateId: "media-finding-summary",
    generatedByTool: "media-intelligence-copilot",
    generatedForRoute,
    sourceContext: { findingId },
    repoRoot,
  });
  return result.draft.draftId;
}

export function routeMediaCopilotFinding(findingId: string, repoRoot?: string): Array<{ system: string; action: string }> {
  return [
    { system: "media_review_queue", action: "HOLD_FOR_REVIEW" },
    { system: "ai_suggestion_sandbox", action: "OPTIONAL_SUGGESTION" },
    { system: "llm_draft_review_queue", action: "OPTIONAL_DRAFT" },
    { system: "citation_candidate_draft", action: "HUMAN_PROMOTION_ONLY" },
    { system: "retrieval_task_draft", action: "HUMAN_PROMOTION_ONLY" },
  ];
}
