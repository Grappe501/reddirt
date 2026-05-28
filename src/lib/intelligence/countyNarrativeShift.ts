import { loadIntelligenceMemoryRegistry } from "@/lib/intelligence/intelligenceMemoryRegistry";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { loadGeographicNarrativeIndex } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { computeStatewideRegistrationRollup } from "@/lib/intelligence/voterRegistrationTargetModel";
import type { MemorySignal } from "@/lib/intelligence/types/intelligenceMemory";

function mem(signal: string, entityId: string, entityLabel: string, reason: string): MemorySignal {
  return { signal, entityId, entityLabel, reason, publicationSafety: "NON_PUBLISHABLE", humanReviewRequired: true };
}

export function computeCountyNarrativeShift(repoRoot?: string): MemorySignal[] {
  const registry = loadIntelligenceMemoryRegistry(repoRoot);
  const counties = loadCountyBriefingIntelligenceIndex(repoRoot);
  const geo = loadGeographicNarrativeIndex(repoRoot);
  const registration = computeStatewideRegistrationRollup(repoRoot);
  const signals: MemorySignal[] = [];

  for (const memory of registry.countyNarrativeMemory) {
    const county = counties.counties.find((c) => c.countyId === memory.countyId);
    const countyName = county?.countyName ?? memory.countyId;

    if (memory.doctrineAlignmentShift.some((s) => s.direction === "TENSE")) {
      signals.push(
        mem("COUNTY_DOCTRINE_SHIFT", memory.countyId, countyName, "Doctrine alignment trending tense — adapt messaging."),
      );
    }
    if (memory.mediaMarketShift.length > 0) {
      signals.push(
        mem("COUNTY_MEDIA_SHIFT", memory.countyId, countyName, memory.mediaMarketShift[0]!),
      );
    }
    if (memory.registrationProgressSignals.length > 0) {
      signals.push(
        mem("COUNTY_REGISTRATION_GAP", memory.countyId, countyName, memory.registrationProgressSignals[0]!),
      );
    }
  }

  for (const risk of geo.topGeographicRisks.slice(0, 4)) {
    signals.push(
      mem("COUNTY_NARRATIVE_SHIFT", risk.countyId, risk.countyName, risk.signal.slice(0, 140)),
    );
  }

  if (registration.missingCountyGoalCount > 0) {
    signals.push(
      mem(
        "COUNTY_REGISTRATION_GAP",
        "statewide",
        "Statewide registration model",
        `${registration.missingCountyGoalCount} counties lack registration goals.`,
      ),
    );
  }

  return signals;
}

export function summarizeCountyShiftWarnings(repoRoot?: string): string[] {
  return computeCountyNarrativeShift(repoRoot).map((row) => `${row.entityLabel}: ${row.reason}`);
}
