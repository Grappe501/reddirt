import {
  appendCitationAnchor,
  appendCitationSource,
  findClaimsByOpponent,
  linkClaimToCitationAnchor,
  loadCitationAnchors,
  loadCitationSources,
} from "@/lib/intelligence/claims/claimLedgerStore";
import type {
  OppositionArchiveItem,
  OppositionClipRecord,
  OppositionQuoteRecord,
  OppositionWritingRecord,
} from "./oppositionArchiveTypes";
import { loadOppositionArchive, saveOppositionArchive } from "./oppositionArchiveStore";

function nowIso(): string {
  return new Date().toISOString();
}

export function bindQuoteToCitationSource(
  quoteRecord: OppositionQuoteRecord,
  repoRoot: string = process.cwd(),
): { citationSourceId: string | null; usable: boolean; reason: string | null } {
  if (!quoteRecord.sourceUrlOrPath) {
    return { citationSourceId: null, usable: false, reason: "Missing source URL/path — flagged unusable" };
  }

  const sourceId = `cit-src-quote-${quoteRecord.id}`;
  const existing = loadCitationSources(repoRoot).sources.find((s) => s.id === sourceId);
  if (!existing) {
    appendCitationSource(
      {
        id: sourceId,
        title: `Opposition quote: ${quoteRecord.id}`,
        sourceType: quoteRecord.sourceUrlOrPath.startsWith("http") ? "url" : "file",
        urlOrPath: quoteRecord.sourceUrlOrPath,
        publicationDate: quoteRecord.date,
        retrievedAt: nowIso(),
        author: null,
        publisher: null,
        jurisdiction: "Arkansas",
        countySlug: null,
        opponentId: quoteRecord.opponentId,
        reliabilityRating: "MEDIUM",
        sourceConfidence: 60,
        quoteOrExcerpt: quoteRecord.quoteText,
        summary: quoteRecord.context,
        limitations: quoteRecord.usable ? [] : ["Requires human verification"],
        createdAt: nowIso(),
      },
      repoRoot,
    );
  }

  return { citationSourceId: sourceId, usable: true, reason: null };
}

export function bindClipToCitationSource(
  clipRecord: OppositionClipRecord,
  repoRoot: string = process.cwd(),
): { citationSourceId: string | null; retrievalNeeded: boolean } {
  if (!clipRecord.url) {
    return { citationSourceId: null, retrievalNeeded: true };
  }

  const sourceId = `cit-src-clip-${clipRecord.id}`;
  const existing = loadCitationSources(repoRoot).sources.find((s) => s.id === sourceId);
  if (!existing) {
    appendCitationSource(
      {
        id: sourceId,
        title: clipRecord.title,
        sourceType: "media",
        urlOrPath: clipRecord.url,
        publicationDate: null,
        retrievedAt: nowIso(),
        author: null,
        publisher: null,
        jurisdiction: "Arkansas",
        countySlug: null,
        opponentId: clipRecord.opponentId,
        reliabilityRating: clipRecord.clipType === "DIRECT_OPPONENT" ? "MEDIUM" : "HIGH",
        sourceConfidence: clipRecord.clipType === "DIRECT_OPPONENT" ? 70 : 85,
        quoteOrExcerpt: null,
        summary: `${clipRecord.clipType} clip archive reference`,
        limitations:
          clipRecord.clipType === "DIRECT_OPPONENT"
            ? ["Only direct opponent clip — archive thin"]
            : ["Reference SOS debate — not Kim Hammer"],
        createdAt: nowIso(),
      },
      repoRoot,
    );

    appendCitationAnchor(
      {
        id: `cit-anchor-clip-${clipRecord.id}`,
        sourceId,
        anchorType: "url",
        lineRange: null,
        pageNumber: null,
        section: clipRecord.timestamp,
        claimSupportType: "CONTEXT_ONLY",
        excerpt: null,
        notes: `Opposition archive clip: ${clipRecord.title}`,
      },
      repoRoot,
    );
  }

  return { citationSourceId: sourceId, retrievalNeeded: false };
}

export function bindWritingToCitationSource(
  writingRecord: OppositionWritingRecord,
  repoRoot: string = process.cwd(),
): { citationSourceId: string | null; retrievalNeeded: boolean } {
  if (!writingRecord.url) {
    return { citationSourceId: null, retrievalNeeded: true };
  }

  const sourceId = `cit-src-writing-${writingRecord.id}`;
  const existing = loadCitationSources(repoRoot).sources.find((s) => s.id === sourceId);
  if (!existing) {
    appendCitationSource(
      {
        id: sourceId,
        title: writingRecord.title,
        sourceType: "url",
        urlOrPath: writingRecord.url,
        publicationDate: writingRecord.date,
        retrievedAt: nowIso(),
        author: "Kim Hammer",
        publisher: writingRecord.publisher,
        jurisdiction: "Arkansas",
        countySlug: null,
        opponentId: writingRecord.opponentId,
        reliabilityRating: "MEDIUM",
        sourceConfidence: 75,
        quoteOrExcerpt: null,
        summary: writingRecord.summary,
        limitations: ["Summary only — retrieve full text for direct quotes"],
        createdAt: nowIso(),
      },
      repoRoot,
    );

    appendCitationAnchor(
      {
        id: `cit-anchor-writing-${writingRecord.id}`,
        sourceId,
        anchorType: "url",
        lineRange: null,
        pageNumber: null,
        section: writingRecord.writingType,
        claimSupportType: "INDIRECT_SUPPORT",
        excerpt: writingRecord.summary.slice(0, 200),
        notes: `Authored writing archive: ${writingRecord.title}`,
      },
      repoRoot,
    );
  }

  return { citationSourceId: sourceId, retrievalNeeded: false };
}

export function bindArchiveItemToClaimLedger(
  item: OppositionArchiveItem,
  repoRoot: string = process.cwd(),
): string[] {
  const linked: string[] = [];
  for (const claimId of item.claimIds) {
    const anchorId = `cit-anchor-archive-${item.id}-${claimId}`;
    const anchors = loadCitationAnchors(repoRoot);
    if (!anchors.anchors.some((a) => a.id === anchorId) && item.citationSourceIds.length > 0) {
      appendCitationAnchor(
        {
          id: anchorId,
          sourceId: item.citationSourceIds[0],
          anchorType: item.sourceUrlOrPath.startsWith("http") ? "url" : "file_path",
          lineRange: null,
          pageNumber: null,
          section: item.itemType,
          claimSupportType: "DIRECT_SUPPORT",
          excerpt: item.summary.slice(0, 200),
          notes: `Archive item ${item.id} linked to claim ${claimId}`,
        },
        repoRoot,
      );
    }
    if (linkClaimToCitationAnchor(claimId, anchorId, repoRoot)) {
      linked.push(claimId);
    }
  }
  return linked;
}

export type OppositionCitationCoverageReport = {
  generatedAt: string;
  quotesTotal: number;
  quotesUsable: number;
  quotesUnusable: number;
  clipsTotal: number;
  clipsWithSource: number;
  clipsRetrievalNeeded: number;
  writingsTotal: number;
  writingsWithSource: number;
  writingsRetrievalNeeded: number;
  archiveItemsWithCitation: number;
  archiveItemsWithClaimLink: number;
  kimHammerClaimsInLedger: number;
};

export function generateOppositionCitationCoverageReport(
  repoRoot: string = process.cwd(),
): OppositionCitationCoverageReport {
  const bundle = loadOppositionArchive(repoRoot);
  const kimClaims = findClaimsByOpponent("kim-hammer", repoRoot);

  return {
    generatedAt: nowIso(),
    quotesTotal: bundle.quotes.records.length,
    quotesUsable: bundle.quotes.records.filter((q) => q.usable).length,
    quotesUnusable: bundle.quotes.records.filter((q) => !q.usable).length,
    clipsTotal: bundle.clips.records.length,
    clipsWithSource: bundle.clips.records.filter((c) => c.url && !c.retrievalNeeded).length,
    clipsRetrievalNeeded: bundle.clips.records.filter((c) => c.retrievalNeeded).length,
    writingsTotal: bundle.writings.records.length,
    writingsWithSource: bundle.writings.records.filter((w) => w.url && !w.retrievalNeeded).length,
    writingsRetrievalNeeded: bundle.writings.records.filter((w) => w.retrievalNeeded).length,
    archiveItemsWithCitation: bundle.items.items.filter((i) => i.citationSourceIds.length > 0).length,
    archiveItemsWithClaimLink: bundle.items.items.filter((i) => i.claimIds.length > 0).length,
    kimHammerClaimsInLedger: kimClaims.length,
  };
}

export function bindAllOppositionArchiveCitations(repoRoot: string = process.cwd()): OppositionCitationCoverageReport {
  const bundle = loadOppositionArchive(repoRoot);

  for (const writing of bundle.writings.records) {
    const result = bindWritingToCitationSource(writing, repoRoot);
    const idx = bundle.writings.records.findIndex((w) => w.id === writing.id);
    if (idx >= 0) {
      bundle.writings.records[idx] = {
        ...bundle.writings.records[idx],
        citationSourceId: result.citationSourceId,
        retrievalNeeded: result.retrievalNeeded,
      };
    }

    const itemId = `archive-writing-${writing.id}`;
    const itemIdx = bundle.items.items.findIndex((i) => i.id === itemId);
    if (itemIdx >= 0 && result.citationSourceId) {
      const item = bundle.items.items[itemIdx];
      if (!item.citationSourceIds.includes(result.citationSourceId)) {
        item.citationSourceIds.push(result.citationSourceId);
        item.citationAnchorIds.push(`cit-anchor-writing-${writing.id}`);
      }
    }
  }

  for (const clip of bundle.clips.records) {
    const result = bindClipToCitationSource(clip, repoRoot);
    const idx = bundle.clips.records.findIndex((c) => c.id === clip.id);
    if (idx >= 0) {
      bundle.clips.records[idx] = {
        ...bundle.clips.records[idx],
        citationSourceId: result.citationSourceId,
        retrievalNeeded: result.retrievalNeeded,
      };
    }

    const itemId = clip.clipType === "DIRECT_OPPONENT" ? `archive-clip-${clip.id}` : `archive-ref-clip-${clip.id}`;
    const itemIdx = bundle.items.items.findIndex((i) => i.id === itemId);
    if (itemIdx >= 0 && result.citationSourceId) {
      const item = bundle.items.items[itemIdx];
      if (!item.citationSourceIds.includes(result.citationSourceId)) {
        item.citationSourceIds.push(result.citationSourceId);
        item.citationAnchorIds.push(`cit-anchor-clip-${clip.id}`);
      }
    }
  }

  for (const item of bundle.items.items) {
    if (item.claimIds.length > 0) {
      bindArchiveItemToClaimLedger(item, repoRoot);
    }
  }

  saveOppositionArchive(bundle, repoRoot);
  return generateOppositionCitationCoverageReport(repoRoot);
}
