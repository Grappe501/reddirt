/**
 * Phase 11 P4 — Seed philosophy graph principle claims into governed ledger.
 */
import path from "node:path";
import { loadCampaignPhilosophyGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import {
  appendClaimLedgerAuditEvent,
  findClaimById,
  loadClaimLedger,
  upsertClaimLedgerEntriesBatch,
} from "./claimLedgerStore";
import { generateClaimFingerprint, normalizeClaimText } from "./claimNormalization";
import type { ClaimLedgerEntry } from "./claimLedgerTypes";

const TAG_PHILOSOPHY_GRAPH = "philosophy-graph";

export function philosophyClaimId(philosophyId: string): string {
  return `claim-philosophy-${philosophyId}`;
}

function buildPhilosophyClaim(
  philosophyId: string,
  title: string,
  principle: string,
  messagingFrames: string[],
  repoRoot: string,
  now: string,
): ClaimLedgerEntry {
  const claimText = `${title}: ${principle}`;
  const normalizedClaimText = normalizeClaimText(claimText);
  const fingerprint = generateClaimFingerprint({
    normalizedClaimText,
    countySlug: null,
    opponentId: null,
    domain: "general",
  });
  const id = philosophyClaimId(philosophyId);

  return {
    id,
    claimText,
    normalizedClaimText,
    claimFingerprint: fingerprint,
    claimType: "philosophy_principle",
    domain: "general",
    countySlug: null,
    opponentId: null,
    topicTags: [TAG_PHILOSOPHY_GRAPH, philosophyId, "nsi-4", "phase-11-p4"],
    sourceBriefIds: [`philosophy-graph-${philosophyId}`],
    sourceEvidencePacketIds: [],
    sourceReviewItemIds: [],
    citationAnchorIds: [],
    supportingSourceIds: [],
    contradictingSourceIds: [],
    classification: "NEEDS_REVIEW",
    verificationStatus: "NEEDS_REVIEW",
    publishabilityStatus: "NOT_PUBLISHABLE",
    evidenceDepthScore: 45,
    evidenceStrength: "MODERATE",
    confidenceScore: 50,
    publicUseRisk: "MEDIUM",
    internalUseStatus: "RESEARCH_ONLY",
    recommendedHumanAction: `Review NSI-4 philosophy node ${philosophyId} — approve internal after doctrine/briefing crosswalk. Frames: ${messagingFrames.slice(0, 2).join("; ")}`,
    humanReview: {
      reviewedBy: null,
      reviewedAt: null,
      decision: null,
      notes: "Phase 11 P4 seed — graph node NEEDS_REVIEW until staff clears claims workflow.",
      requiredEdits: [],
      approvalScope: "NONE",
    },
    history: [
      {
        timestamp: now,
        eventType: "INGESTED",
        actor: "phase-11-p4-philosophy-graph-seed",
        previousStatus: null,
        nextStatus: "NEEDS_REVIEW",
        notes: `Seeded from campaign-philosophy-graph.json node ${philosophyId}`,
      },
    ],
    createdAt: now,
    updatedAt: now,
    createdBy: "phase-11-p4-philosophy-graph-seed",
    lastReviewedAt: null,
  };
}

export function seedPhilosophyGraphClaims(repoRoot: string = process.cwd()): {
  added: number;
  updated: number;
  totalPhilosophy: number;
} {
  const graph = loadCampaignPhilosophyGraph(repoRoot);
  const ledgerEntries = loadClaimLedger(repoRoot).entries;
  const now = new Date().toISOString();
  const entries: ClaimLedgerEntry[] = [];

  for (const node of graph.nodes) {
    const id = philosophyClaimId(node.philosophyId);
    const existing = findClaimById(id, repoRoot);
    const built = buildPhilosophyClaim(
      node.philosophyId,
      node.title,
      node.principle,
      node.messagingFrames,
      repoRoot,
      now,
    );
    if (existing) {
      entries.push({
        ...built,
        history: existing.history,
        verificationStatus: existing.verificationStatus,
        classification: existing.classification,
        publishabilityStatus: existing.publishabilityStatus,
        internalUseStatus: existing.internalUseStatus,
        humanReview: existing.humanReview,
        updatedAt: now,
      });
    } else {
      entries.push(built);
    }
  }

  upsertClaimLedgerEntriesBatch(entries, repoRoot);
  appendClaimLedgerAuditEvent(
    {
      eventType: "INGESTED",
      claimId: "batch-philosophy-graph",
      actor: "phase-11-p4-philosophy-graph-seed",
      details: `Philosophy graph claims seed — ${entries.length} nodes`,
    },
    repoRoot,
  );

  const after = loadClaimLedger(repoRoot).entries;
  const philosophy = after.filter((c) => c.topicTags.includes(TAG_PHILOSOPHY_GRAPH));
  const added = entries.filter((e) => !ledgerEntries.some((l) => l.id === e.id)).length;
  const updated = entries.length - added;

  return { added, updated, totalPhilosophy: philosophy.length };
}

export function listPhilosophyGraphClaims(repoRoot: string = process.cwd()): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.filter((c) => c.topicTags.includes(TAG_PHILOSOPHY_GRAPH));
}

export function resolvePhilosophyGraphClaim(
  philosophyId: string,
  repoRoot: string = process.cwd(),
): ClaimLedgerEntry | undefined {
  return findClaimById(philosophyClaimId(philosophyId), repoRoot) ?? undefined;
}
