import { loadIntelligenceMemoryRegistry } from "@/lib/intelligence/intelligenceMemoryRegistry";
import { loadPublicMediaIntakeQueue } from "@/lib/intelligence/publicMediaIntake";
import { summarizeBorderMediaIntelligence } from "@/lib/intelligence/mediaMarketIntelligence";
import type { MemorySignal } from "@/lib/intelligence/types/intelligenceMemory";

function mem(signal: string, entityId: string, entityLabel: string, reason: string): MemorySignal {
  return { signal, entityId, entityLabel, reason, publicationSafety: "NON_PUBLISHABLE", humanReviewRequired: true };
}

const CYCLE_TOPICS = [
  { id: "election-integrity-wave", keywords: ["election integrity", "voter id", "ballot", "fraud"] },
  { id: "legislative-session", keywords: ["legislature", "sb", "hb", "committee", "bill"] },
  { id: "county-administration", keywords: ["county clerk", "quorum court", "election commission"] },
];

export function computeMediaCyclePatterns(repoRoot?: string): MemorySignal[] {
  const registry = loadIntelligenceMemoryRegistry(repoRoot);
  const media = loadPublicMediaIntakeQueue(repoRoot);
  const border = summarizeBorderMediaIntelligence(repoRoot);
  const signals: MemorySignal[] = [];

  for (const cycle of CYCLE_TOPICS) {
    const matches = media.findings.filter((f) => {
      const text = `${f.title} ${f.summary}`.toLowerCase();
      return cycle.keywords.some((kw) => text.includes(kw));
    });
    if (matches.length >= 1) {
      signals.push(
        mem(
          "MEDIA_CYCLE_RECURRENCE",
          cycle.id,
          cycle.id,
          `${matches.length} intake finding(s) match ${cycle.id} pattern — cyclical topic active.`,
        ),
      );
    }
  }

  for (const narrative of registry.narrativeMemory) {
    for (const link of narrative.mediaCycleLinks) {
      signals.push(
        mem("NARRATIVE_MEDIA_CYCLE", narrative.narrativeId, narrative.narrativeId, `Linked to media cycle: ${link}.`),
      );
    }
  }

  if (border.signals.length > 0) {
    signals.push(
      mem(
        "BORDER_MEDIA_SURGE",
        "border-markets",
        "Cross-state media",
        `${border.signals.length} border coverage signal(s) — timing pattern may recur near edge counties.`,
      ),
    );
  }

  const pending = media.findings.filter((f) => f.reviewStatus === "NEEDS_REVIEW");
  if (pending.length >= 2) {
    signals.push(
      mem(
        "MEDIA_INTAKE_WAVE",
        "media-queue",
        "Media intake backlog",
        `${pending.length} findings pending — possible surge requiring manual triage.`,
      ),
    );
  }

  return signals;
}

export function summarizeMediaCycleTrends(repoRoot?: string): string[] {
  return computeMediaCyclePatterns(repoRoot).map((row) => `${row.signal}: ${row.reason.slice(0, 100)}`);
}
