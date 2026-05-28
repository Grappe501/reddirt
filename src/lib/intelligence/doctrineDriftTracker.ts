import { loadCampaignStrategicDoctrineRegistry } from "@/lib/intelligence/campaignStrategicAlignment";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import { loadIntelligenceMemoryRegistry } from "@/lib/intelligence/intelligenceMemoryRegistry";
import type { MemorySignal } from "@/lib/intelligence/types/intelligenceMemory";

function mem(signal: string, entityId: string, entityLabel: string, reason: string): MemorySignal {
  return { signal, entityId, entityLabel, reason, publicationSafety: "NON_PUBLISHABLE", humanReviewRequired: true };
}

export function computeDoctrineDrift(repoRoot?: string): MemorySignal[] {
  const alignment = summarizeStrategicAlignmentRisk(repoRoot);
  const doctrine = loadCampaignStrategicDoctrineRegistry(repoRoot);
  const registry = loadIntelligenceMemoryRegistry(repoRoot);
  const signals: MemorySignal[] = [];

  for (const tension of alignment.topStrategicTensions ?? []) {
    signals.push(
      mem("DOCTRINE_TENSION_GROWTH", tension.narrativeId, tension.narrativeTitle, tension.signal.slice(0, 140)),
    );
  }

  for (const alert of alignment.philosophyAlerts ?? []) {
    signals.push(
      mem("DOCTRINE_WEAKENING", alert.doctrineId, alert.doctrineTitle, `${alert.severity}: ${alert.signal.slice(0, 100)}`),
    );
  }

  if ((alignment.fragileCount ?? 0) >= 2) {
    signals.push(
      mem(
        "DOCTRINE_FRAGMENTATION",
        "alignment-index",
        "Strategic alignment",
        `${alignment.fragileCount} fragile doctrine alignment(s) — messaging may over-fragment.`,
      ),
    );
  }

  for (const narrative of registry.narrativeMemory) {
    const latest = narrative.doctrineAlignmentHistory[narrative.doctrineAlignmentHistory.length - 1];
    if (latest?.alignment === "CONFLICT" || latest?.alignment === "TENSE") {
      signals.push(
        mem(
          "DOCTRINE_CONFLICT",
          narrative.narrativeId,
          narrative.narrativeId,
          `Registry shows ${latest.alignment} alignment — ${narrative.evolutionSummary.slice(0, 80)}`,
        ),
      );
    }
  }

  const peopleVsGov = doctrine.doctrines.find(
    (d) => d.title.toLowerCase().includes("strategy") || d.category === "VALUES" || d.category === "MESSAGING",
  );
  if (peopleVsGov) {
    signals.push(
      mem(
        "DOCTRINE_EMPHASIS",
        peopleVsGov.doctrineId,
        peopleVsGov.title,
        "People-vs-government framing remains primary — avoid generic partisan copy drift.",
      ),
    );
  }

  return signals;
}

export function summarizeDoctrineDriftWarnings(repoRoot?: string): string[] {
  return computeDoctrineDrift(repoRoot).map((row) => `${row.signal}: ${row.reason.slice(0, 100)}`);
}
