import { loadCitationAnchors, loadCitationSources, loadClaimLedger } from "@/lib/intelligence/claims/claimLedgerStore";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import type { OppositionArchiveRollup } from "./oppositionArchiveTypes";
import { OPPOSITION_ARCHIVE_GOVERNANCE } from "./oppositionArchiveTypes";
import type { OppositionArchiveBundle } from "./oppositionArchiveStore";
import { loadOppositionArchive } from "./oppositionArchiveStore";

export type OppositionConfidenceInputs = {
  sourceCount: number;
  directQuoteCount: number;
  usableQuoteCount: number;
  directClipCount: number;
  authoredWritingCount: number;
  billRecordCount: number;
  retrievalTasksTotal: number;
  retrievalTasksComplete: number;
  retrievalTasksPartial: number;
  claimLedgerLinkedCount: number;
  citationSourceCount: number;
  citationAnchorCount: number;
  exportReadyClaims: number;
  blockedClaims: number;
  unsupportedClaimCount: number;
  openGapCount: number;
};

export function computeOppositionBriefConfidence(inputs: OppositionConfidenceInputs): {
  score: number;
  basis: string;
} {
  let score = 40;

  score += Math.min(inputs.sourceCount * 1.5, 12);
  score += Math.min(inputs.usableQuoteCount * 4, 12);
  score += Math.min(inputs.directClipCount * 6, 12);
  score += Math.min(inputs.authoredWritingCount * 3, 9);
  score += Math.min(inputs.billRecordCount * 0.15, 8);
  score += Math.min(inputs.exportReadyClaims * 3, 9);
  score += Math.min(inputs.claimLedgerLinkedCount * 0.8, 8);
  score += Math.min(inputs.citationAnchorCount * 0.5, 6);

  if (inputs.retrievalTasksTotal > 0) {
    const closureRate = inputs.retrievalTasksComplete / inputs.retrievalTasksTotal;
    score += closureRate * 15;
    const partialRate = inputs.retrievalTasksPartial / inputs.retrievalTasksTotal;
    score += partialRate * 5;
  }

  score -= Math.min(inputs.blockedClaims * 2, 10);
  score -= Math.min(inputs.unsupportedClaimCount * 3, 12);
  score -= Math.min(inputs.openGapCount * 1.5, 10);

  if (inputs.directClipCount < 2) score -= 5;
  if (inputs.retrievalTasksComplete === 0 && inputs.retrievalTasksTotal >= 5) score -= 4;

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  const parts = [
    `sources=${inputs.sourceCount}`,
    `usableQuotes=${inputs.usableQuoteCount}/${inputs.directQuoteCount}`,
    `directClips=${inputs.directClipCount}`,
    `writings=${inputs.authoredWritingCount}`,
    `bills=${inputs.billRecordCount}`,
    `retrieval=${inputs.retrievalTasksComplete}/${inputs.retrievalTasksTotal} closed, ${inputs.retrievalTasksPartial} partial`,
    `claimLinks=${inputs.claimLedgerLinkedCount}`,
    `citationAnchors=${inputs.citationAnchorCount}`,
    `exportReady=${inputs.exportReadyClaims}`,
  ];

  return {
    score: clamped,
    basis: `Archive-driven confidence (not hardcoded): ${parts.join("; ")}`,
  };
}

export function summarizeOppositionArchive(
  bundle: OppositionArchiveBundle,
  repoRoot: string = process.cwd(),
): OppositionArchiveRollup {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const ledger = loadClaimLedger(repoRoot);
  const citationSources = loadCitationSources(repoRoot);
  const citationAnchors = loadCitationAnchors(repoRoot);

  const kimClaims = ledger.entries.filter((e) => e.opponentId === "kim-hammer");
  const claimLedgerLinkedCount = bundle.items.items.filter((i) => i.claimIds.length > 0).length;

  const directClipCount = bundle.clips.records.filter((c) => c.clipType === "DIRECT_OPPONENT").length;
  const referenceClipCount = bundle.clips.records.filter((c) => c.clipType !== "DIRECT_OPPONENT").length;
  const billRecordCount = bundle.items.items.filter((i) => i.itemType === "BILL_RECORD").length;

  const retrievalTasksTotal = bundle.retrievalTasks.tasks.length;
  const retrievalTasksComplete = bundle.retrievalTasks.tasks.filter((t) => t.closureStatus === "CLOSED").length;
  const retrievalTasksPartial = bundle.retrievalTasks.tasks.filter((t) => t.closureStatus === "PARTIAL").length;

  const unsupportedClaimCount = kimClaims.filter((c) => c.classification === "UNSUPPORTED").length;

  const confidence = computeOppositionBriefConfidence({
    sourceCount: bundle.sources.records.length,
    directQuoteCount: bundle.quotes.records.length,
    usableQuoteCount: bundle.quotes.records.filter((q) => q.usable).length,
    directClipCount,
    authoredWritingCount: bundle.writings.records.length,
    billRecordCount,
    retrievalTasksTotal,
    retrievalTasksComplete,
    retrievalTasksPartial,
    claimLedgerLinkedCount,
    citationSourceCount: citationSources.sources.length,
    citationAnchorCount: citationAnchors.anchors.length,
    exportReadyClaims: evidence.metrics.exportReadyClaims,
    blockedClaims: evidence.metrics.blockedClaims,
    unsupportedClaimCount,
    openGapCount: evidence.metrics.retrievalTasks - (evidence.metrics.taskStatusCounts.COMPLETE ?? 0),
  });

  const topUsableEvidence = bundle.items.items
    .filter((i) => i.researchStatus === "VERIFIED_SOURCE" || i.researchStatus === "PARTIAL_SOURCE")
    .slice(0, 5)
    .map((i) => `${i.title} (${i.itemType})`);

  const topUnusableClaims = kimClaims
    .filter((c) => c.classification === "UNSUPPORTED" || c.classification === "NEEDS_REVIEW")
    .slice(0, 5)
    .map((c) => c.claimText.slice(0, 100));

  const nextHumanRetrievalActions = bundle.retrievalTasks.tasks
    .filter((t) => t.closureStatus !== "CLOSED")
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)
    .map((t) => `[${t.priority}] ${t.id}: ${t.nextRetrievalStep}`);

  return {
    opponentId: "kim-hammer",
    generatedAt: new Date().toISOString(),
    sourceCount: bundle.sources.records.length,
    archiveItemCount: bundle.items.items.length,
    directQuoteCount: bundle.quotes.records.length,
    usableQuoteCount: bundle.quotes.records.filter((q) => q.usable).length,
    directClipCount,
    referenceClipCount,
    authoredWritingCount: bundle.writings.records.length,
    billRecordCount,
    retrievalTasksTotal,
    retrievalTasksComplete,
    retrievalTasksPartial,
    claimLedgerLinkedCount,
    citationSourceCount: citationSources.sources.length,
    citationAnchorCount: citationAnchors.anchors.length,
    oppositionBriefConfidenceEstimate: confidence.score,
    confidenceBasis: confidence.basis,
    topUsableEvidence,
    topUnusableClaims,
    nextHumanRetrievalActions,
    filmRoomGapNote:
      directClipCount <= 1
        ? `Only ${directClipCount} direct Kim Hammer clip indexed — film room remains evidence-thin`
        : `${directClipCount} direct clips indexed`,
    governance: OPPOSITION_ARCHIVE_GOVERNANCE,
  };
}

export function loadOppositionArchiveRollup(repoRoot: string = process.cwd()): OppositionArchiveRollup {
  return summarizeOppositionArchive(loadOppositionArchive(repoRoot), repoRoot);
}
