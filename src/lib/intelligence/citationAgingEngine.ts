import { loadIntelligenceMemoryRegistry } from "@/lib/intelligence/intelligenceMemoryRegistry";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import type { CitationAgingSignal, MemorySignal } from "@/lib/intelligence/types/intelligenceMemory";

function mem(signal: CitationAgingSignal | string, entityId: string, entityLabel: string, reason: string): MemorySignal {
  return { signal, entityId, entityLabel, reason, publicationSafety: "NON_PUBLISHABLE", humanReviewRequired: true };
}

export function computeCitationAging(repoRoot?: string): MemorySignal[] {
  const registry = loadIntelligenceMemoryRegistry(repoRoot);
  const locker = loadKimHammerCitationLocker(repoRoot);
  const exportHistory = loadKimHammerExportHistory(repoRoot);
  const signals: MemorySignal[] = [];

  for (const card of locker.citations) {
    if (card.reviewStatus === "STALE" || card.sourceHealth === "STALE") {
      signals.push(mem("CITATION_STALE", card.id, card.summary.slice(0, 60), "Citation marked STALE — revalidation required."));
    }
    if (card.sourceHealth === "ARCHIVE_MISSING" || card.sourceHealth === "BROKEN") {
      signals.push(mem("ARCHIVE_AT_RISK", card.id, card.id, `Source health: ${card.sourceHealth}.`));
    }
    if (!card.archiveCaptured) {
      signals.push(mem("ARCHIVE_AT_RISK", card.id, card.id, "Archive not captured — durability risk."));
    }

    const exportUses = exportHistory.entries.filter((e) => e.citationIds.includes(card.id)).length;
    if (exportUses >= 2) {
      signals.push(mem("OVERUSED_CITATION", card.id, card.id, `Used in ${exportUses} governed export(s).`));
    }

    const linkedClaims = card.linkedClaimIds.length;
    if (linkedClaims > 0 && card.reviewStatus !== "VERIFIED") {
      signals.push(mem("WEAK_SUPPORT_CHAIN", card.id, card.id, `Supports ${linkedClaims} claim(s) but review status ${card.reviewStatus}.`));
    }
  }

  for (const entry of registry.citationMemory) {
    for (const stale of entry.staleSignals) {
      signals.push(mem("CITATION_STALE", entry.citationId, entry.citationId, stale));
    }
    if (entry.countyUsage.length >= 2) {
      signals.push(
        mem("COUNTY_OVEREXPOSED", entry.citationId, entry.citationId, `County usage: ${entry.countyUsage.join(", ")}.`),
      );
    }
  }

  return signals;
}

export function summarizeCitationAgingAlerts(repoRoot?: string): string[] {
  return computeCitationAging(repoRoot).map((row) => `${row.signal}: ${row.reason}`);
}
