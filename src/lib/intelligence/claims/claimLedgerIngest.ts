import type { GovernedBrief } from "@/lib/intelligence/briefs/governedBriefTypes";
import type { EvidencePacket } from "@/lib/intelligence/briefs/evidencePacketTypes";
import {
  classifyEvidencePacketClaims,
} from "@/lib/intelligence/briefs/claimClassification";
import {
  buildCountyEvidencePacket,
  buildDebateEvidencePacket,
  buildEvidencePacketByBriefId,
  buildEvidencePacketForBrief,
  buildOppositionEvidencePacket,
  buildRapidResponseEvidencePacket,
  buildWeeklyIntelligenceEvidencePacket,
} from "@/lib/intelligence/briefs/evidencePacketGenerator";
import { generateAllCountyBriefBundles } from "@/lib/intelligence/briefs/countyPublicBriefGenerator";
import type { LlmBriefDraftReviewItem } from "@/lib/intelligence/briefs/llmBriefReviewQueue";
import {
  appendCitationAnchor,
  appendCitationSource,
  appendClaimLedgerAuditEvent,
  loadCitationAnchors,
  loadCitationSources,
  loadClaimLedger,
  upsertClaimLedgerEntry,
  upsertClaimLedgerEntriesBatch,
} from "./claimLedgerStore";
import {
  detectDuplicateClaim,
  generateClaimFingerprint,
  mergeClaimEvidence,
  normalizeClaimText,
  updateClaimConfidenceFromEvidence,
} from "./claimNormalization";
import { scoreClaimEvidence } from "./evidenceDepthScoring";
import {
  CLAIM_LEDGER_DEFAULTS,
  type CitationAnchor,
  type CitationSource,
  type ClaimLedgerEntry,
  type ClaimClassification,
} from "./claimLedgerTypes";
import { defaultVerificationForClassification } from "./citationDepthPolicy";

function domainFromBriefType(briefType: string): ClaimLedgerEntry["domain"] {
  if (briefType.includes("county")) return "county";
  if (briefType === "opposition_research") return "opposition";
  if (briefType === "debate_prep") return "debate";
  if (briefType === "rapid_response_prep") return "rapid_response";
  if (briefType === "weekly_intelligence") return "weekly";
  return "general";
}

function sourceTypeFromAnchor(label: string): CitationSource["sourceType"] {
  if (label.startsWith("http")) return "url";
  if (label.includes(".json") || label.includes(".csv")) return "file";
  if (label.includes("CountyCampaignStats")) return "public_record";
  return "registry";
}

function ensureCitationFromPacket(
  packet: EvidencePacket,
  repoRoot: string,
): { sources: CitationSource[]; anchors: CitationAnchor[] } {
  const sources: CitationSource[] = [];
  const anchors: CitationAnchor[] = [];

  for (const anchor of packet.sourceAnchors) {
    const sourceId = `src-${anchor.anchorId}`;
    const source: CitationSource = {
      id: sourceId,
      title: anchor.label,
      sourceType: sourceTypeFromAnchor(anchor.label),
      urlOrPath: anchor.label.startsWith("http") ? anchor.label : null,
      publicationDate: null,
      retrievedAt: packet.generatedAt,
      author: null,
      publisher: packet.generatedBy,
      jurisdiction: packet.county ? "Arkansas" : null,
      countySlug: packet.county,
      opponentId: packet.opponent,
      reliabilityRating: anchor.requiredForPublicUse ? "MEDIUM" : "LOW",
      sourceConfidence: packet.confidenceScore,
      quoteOrExcerpt: null,
      summary: `Source from evidence packet ${packet.id}`,
      limitations: packet.generationContext.shellCounty ? ["Shell county context"] : [],
      createdAt: new Date().toISOString(),
    };
    sources.push(source);
    appendCitationSource(source, repoRoot);

    const citationAnchor: CitationAnchor = {
      id: anchor.anchorId,
      sourceId,
      anchorType: anchor.sourceSystem === "file" ? "file_path" : "registry_key",
      lineRange: null,
      pageNumber: null,
      section: null,
      claimSupportType: "DIRECT_SUPPORT",
      excerpt: null,
      notes: anchor.label,
    };
    anchors.push(citationAnchor);
    appendCitationAnchor(citationAnchor, repoRoot);
  }

  return { sources, anchors };
}

function buildEntryFromClassified(input: {
  claimText: string;
  classification: ClaimClassification;
  sourceAnchorIds: string[];
  supportingSourceIds: string[];
  publicUseRisk: ClaimLedgerEntry["publicUseRisk"];
  recommendedHumanAction: string;
  packet: EvidencePacket;
  briefId: string;
  actor: string;
}): ClaimLedgerEntry {
  const normalized = normalizeClaimText(input.claimText);
  const domain = domainFromBriefType(String(input.packet.briefType));
  const fingerprint = generateClaimFingerprint({
    normalizedClaimText: normalized,
    countySlug: input.packet.county,
    opponentId: input.packet.opponent,
    domain,
  });

  const now = new Date().toISOString();
  const verificationStatus = defaultVerificationForClassification(input.classification);

  let internalUseStatus = CLAIM_LEDGER_DEFAULTS.internalUseStatus;
  if (input.classification === "UNSUPPORTED") internalUseStatus = "DO_NOT_USE";
  else if (input.classification === "VERIFIED") internalUseStatus = "SAFE_FOR_DRAFTING_WITH_CITATION";

  const entry: ClaimLedgerEntry = {
    id: `claim-${fingerprint}-${Date.now().toString(36)}`,
    claimText: input.claimText,
    normalizedClaimText: normalized,
    claimFingerprint: fingerprint,
    claimType: input.classification === "INFERRED" ? "INTERNAL_INTERPRETATION" : "FACTUAL",
    domain,
    countySlug: input.packet.county,
    opponentId: input.packet.opponent,
    topicTags: input.packet.topicTags,
    sourceBriefIds: [input.briefId],
    sourceEvidencePacketIds: [input.packet.id],
    sourceReviewItemIds: [],
    citationAnchorIds: input.sourceAnchorIds,
    supportingSourceIds: input.supportingSourceIds,
    contradictingSourceIds: [],
    classification: input.classification,
    verificationStatus,
    publishabilityStatus: CLAIM_LEDGER_DEFAULTS.publishabilityStatus,
    evidenceDepthScore: 0,
    evidenceStrength: "NONE",
    confidenceScore: 0,
    publicUseRisk: input.publicUseRisk,
    internalUseStatus,
    recommendedHumanAction: input.recommendedHumanAction,
    humanReview: {
      reviewedBy: null,
      reviewedAt: null,
      decision: null,
      notes: "",
      requiredEdits: [],
      approvalScope: "NONE",
    },
    history: [
      {
        timestamp: now,
        eventType: "INGESTED",
        actor: input.actor,
        previousStatus: null,
        nextStatus: verificationStatus,
        notes: `Ingested from evidence packet ${input.packet.id}`,
      },
    ],
    createdAt: now,
    updatedAt: now,
    createdBy: input.actor,
    lastReviewedAt: null,
  };

  return entry;
}

export function ingestClaimsFromEvidencePacket(
  evidencePacket: EvidencePacket,
  repoRoot: string = process.cwd(),
): { ingested: number; merged: number; claimIds: string[] } {
  const { anchors } = ensureCitationFromPacket(evidencePacket, repoRoot);
  const sources = loadCitationSources(repoRoot).sources;
  const classified = classifyEvidencePacketClaims(evidencePacket);
  const ledger = loadClaimLedger(repoRoot);
  let ingested = 0;
  let merged = 0;
  const claimIds: string[] = [];
  const batchEntries: ClaimLedgerEntry[] = [];

  for (const c of classified) {
    const anchorIds = evidencePacket.sourceAnchors.map((a) => a.anchorId);
    const supportingSourceIds = anchors.map((a) => a.sourceId);

    const partial = buildEntryFromClassified({
      claimText: c.claimText,
      classification: c.classification,
      sourceAnchorIds: anchorIds,
      supportingSourceIds,
      publicUseRisk: c.publicUseRisk,
      recommendedHumanAction: c.recommendedHumanAction,
      packet: evidencePacket,
      briefId: evidencePacket.briefId,
      actor: "claimLedgerIngest.v1",
    });

    const duplicate =
      detectDuplicateClaim(partial.claimFingerprint, ledger.entries) ??
      batchEntries.find((e) => e.claimFingerprint === partial.claimFingerprint) ??
      null;
    let entry: ClaimLedgerEntry;

    if (duplicate) {
      entry = mergeClaimEvidence(duplicate, partial);
      merged++;
    } else {
      entry = partial;
      ingested++;
    }

    const depth = scoreClaimEvidence({
      claim: entry,
      anchors: loadCitationAnchors(repoRoot).anchors,
      sources,
      shellCounty: evidencePacket.generationContext.shellCounty,
    });
    entry.evidenceDepthScore = depth.evidenceDepthScore;
    entry.evidenceStrength = depth.evidenceStrength;
    entry.confidenceScore = depth.confidenceScore;
    entry = updateClaimConfidenceFromEvidence(entry);

    batchEntries.push(entry);
    claimIds.push(entry.id);
  }

  upsertClaimLedgerEntriesBatch(batchEntries, repoRoot);

  for (const entry of batchEntries) {
    appendClaimLedgerAuditEvent(
      {
        eventType: "CLAIM_INGESTED",
        claimId: entry.id,
        actor: "claimLedgerIngest.v1",
        details: `packet=${evidencePacket.id}`,
      },
      repoRoot,
    );
  }

  return { ingested, merged, claimIds };
}

export function ingestClaimsFromGovernedBrief(
  brief: GovernedBrief,
  repoRoot?: string,
): ReturnType<typeof ingestClaimsFromEvidencePacket> {
  const packet = buildEvidencePacketForBrief(brief);
  return ingestClaimsFromEvidencePacket(packet, repoRoot);
}

export function ingestClaimsFromLlmReviewItem(
  reviewItem: LlmBriefDraftReviewItem,
  repoRoot?: string,
): ReturnType<typeof ingestClaimsFromEvidencePacket> {
  const packet = buildEvidencePacketByBriefId(reviewItem.briefId, repoRoot);
  if (!packet) return { ingested: 0, merged: 0, claimIds: [] };

  const result = ingestClaimsFromEvidencePacket(packet, repoRoot);
  for (const claimId of result.claimIds) {
    const claim = loadClaimLedger(repoRoot).entries.find((e) => e.id === claimId);
    if (claim && reviewItem.reviewItemId) {
      claim.sourceReviewItemIds = [...new Set([...claim.sourceReviewItemIds, reviewItem.reviewItemId])];
      if (reviewItem.draftId) claim.sourceReviewItemIds.push(reviewItem.draftId);
      upsertClaimLedgerEntry(claim, repoRoot);
    }
  }
  return result;
}

export function ingestAllCurrentBriefClaims(repoRoot: string = process.cwd()): {
  totalIngested: number;
  totalMerged: number;
  byDomain: Record<string, number>;
} {
  let totalIngested = 0;
  let totalMerged = 0;
  const byDomain: Record<string, number> = {};

  const packets = [
    buildOppositionEvidencePacket(),
    buildDebateEvidencePacket(),
    buildRapidResponseEvidencePacket(),
    buildWeeklyIntelligenceEvidencePacket(repoRoot),
    ...generateAllCountyBriefBundles().map((b) => buildCountyEvidencePacket(b.countySlug)).filter(Boolean),
  ] as EvidencePacket[];

  for (const packet of packets) {
    const r = ingestClaimsFromEvidencePacket(packet, repoRoot);
    totalIngested += r.ingested;
    totalMerged += r.merged;
    const domain = domainFromBriefType(String(packet.briefType));
    byDomain[domain] = (byDomain[domain] ?? 0) + r.ingested + r.merged;
  }

  return { totalIngested, totalMerged, byDomain };
}
