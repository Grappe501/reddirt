import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import { computeNarrativeUsageAnalytics } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import { loadIntelligenceMemoryRegistry } from "@/lib/intelligence/intelligenceMemoryRegistry";
import { computeMessagingDrift } from "@/lib/intelligence/opponentMessagingDrift";
import { computeDebateThemeRecurrence } from "@/lib/intelligence/debateMemorySystem";
import { computeCitationAging } from "@/lib/intelligence/citationAgingEngine";
import { computeCountyNarrativeShift } from "@/lib/intelligence/countyNarrativeShift";
import { computeDoctrineDrift } from "@/lib/intelligence/doctrineDriftTracker";
import { computeMediaCyclePatterns } from "@/lib/intelligence/mediaCycleMemory";
export { computeMessagingDrift } from "@/lib/intelligence/opponentMessagingDrift";
export { computeDebateThemeRecurrence } from "@/lib/intelligence/debateMemorySystem";
export { computeCitationAging } from "@/lib/intelligence/citationAgingEngine";
export { computeCountyNarrativeShift } from "@/lib/intelligence/countyNarrativeShift";
export { computeDoctrineDrift } from "@/lib/intelligence/doctrineDriftTracker";
export { computeMediaCyclePatterns } from "@/lib/intelligence/mediaCycleMemory";
import type {
  LongitudinalIntelligenceSummary,
  MemorySignal,
  NarrativeEvolutionResult,
  NarrativeEvolutionSignal,
} from "@/lib/intelligence/types/intelligenceMemory";
import { MEMORY_GOVERNANCE_LABEL } from "@/lib/intelligence/types/intelligenceMemory";

export { loadIntelligenceMemoryRegistry, INTELLIGENCE_MEMORY_REGISTRY_REL } from "@/lib/intelligence/intelligenceMemoryRegistry";
export type {
  IntelligenceMemoryRegistry,
  NarrativeMemoryEntry,
  OpponentMessagingMemoryEntry,
  DebateMemoryEntry,
  CitationMemoryEntry,
  CountyNarrativeMemoryEntry,
} from "@/lib/intelligence/intelligenceMemoryRegistry";

function mem(signal: string, entityId: string, entityLabel: string, reason: string): MemorySignal {
  return { signal, entityId, entityLabel, reason, publicationSafety: "NON_PUBLISHABLE", humanReviewRequired: true };
}

export function computeNarrativeEvolution(repoRoot?: string): NarrativeEvolutionResult[] {
  const registry = loadIntelligenceMemoryRegistry(repoRoot);
  const narratives = loadKimHammerNarrativeStateIndex(repoRoot);
  const usage = computeNarrativeUsageAnalytics(repoRoot ?? process.cwd());
  const exportHistory = loadKimHammerExportHistory(repoRoot);
  const alignment = summarizeStrategicAlignmentRisk(repoRoot);

  return narratives.narratives.map((row) => {
    const memory = registry.narrativeMemory.find((m) => m.narrativeId === row.narrativeId);
    const usageRecord = usage.narratives.find((r) => r.narrativeId === row.narrativeId);
    const signals: NarrativeEvolutionSignal[] = [];
    const reasons: string[] = [];

    const priorBand = memory?.readinessHistory?.[0]?.band;
    if (priorBand && priorBand !== row.readinessBand) {
      if (row.readinessBand === "WEAK" || row.readinessBand === "BLOCKED") {
        signals.push("WEAKENING");
        reasons.push(`Readiness shifted from ${priorBand} to ${row.readinessBand}.`);
      } else if (row.readinessBand === "STRONG") {
        signals.push("STRENGTHENING");
        reasons.push(`Readiness improved from ${priorBand} to ${row.readinessBand}.`);
      }
    } else {
      signals.push("STABLE");
      reasons.push(`Readiness band ${row.readinessBand} unchanged from registry snapshot.`);
    }

    if (usageRecord?.usageSignal === "USAGE_OVEREXPOSED") {
      signals.push("FATIGUED", "OVERUSED");
      reasons.push(usageRecord.signal || "Usage analytics flag narrative fatigue.");
    }
    if (usageRecord?.usageSignal === "USAGE_UNDERUTILIZED") {
      signals.push("UNDERDEVELOPED");
      reasons.push("Narrative under-deployed relative to evidence strength.");
    }
    if ((memory?.countyShiftSignals.length ?? 0) > 0) {
      signals.push("COUNTY_SHIFTING");
      reasons.push(`County shift signals: ${memory!.countyShiftSignals.join(", ")}.`);
    }

    const doctrineConflict = alignment.topStrategicTensions?.find((t) => t.narrativeId === row.narrativeId);
    if (doctrineConflict || row.readinessBand === "BLOCKED") {
      signals.push("DOCTRINE_CONFLICT");
      reasons.push(doctrineConflict?.signal ?? "Blocked narrative conflicts with doctrine-safe deployment.");
    }

    const exportCount = exportHistory.entries.filter((e) => e.narrativeIds.includes(row.narrativeId)).length;
    if (exportCount > 0 && row.claimReviewSummary.exportReady === 0) {
      signals.push("WEAKENING");
      reasons.push("Historical exports exist but export-ready claims now zero — dependency collapse.");
    }

    const primarySignal = signals.find((s) => s !== "STABLE") ?? "STABLE";
    return { narrativeId: row.narrativeId, title: row.title, primarySignal, signals: [...new Set(signals)], reasons };
  });
}

export function computeExportFatigue(repoRoot?: string): MemorySignal[] {
  const usage = computeNarrativeUsageAnalytics(repoRoot ?? process.cwd());
  const warnings: MemorySignal[] = [];
  for (const record of usage.narratives) {
    if (record.usageSignal === "USAGE_OVEREXPOSED" || record.deploymentCount >= 3) {
      warnings.push(
        mem(
          "EXPORT_FATIGUE",
          record.narrativeId,
          record.narrativeTitle,
          `${record.deploymentCount} governed export(s) — ${record.usageSignal}.`,
        ),
      );
    }
  }
  return warnings.slice(0, 8);
}

export function summarizeLongitudinalIntelligence(repoRoot?: string): LongitudinalIntelligenceSummary {
  const evolution = computeNarrativeEvolution(repoRoot);
  const messagingDrift = computeMessagingDrift(repoRoot);
  const debateThemes = computeDebateThemeRecurrence(repoRoot);
  const citationAging = computeCitationAging(repoRoot);
  const countyShifts = computeCountyNarrativeShift(repoRoot);
  const doctrineDrift = computeDoctrineDrift(repoRoot);
  const mediaCycles = computeMediaCyclePatterns(repoRoot);
  const exportFatigue = computeExportFatigue(repoRoot);

  const strengtheningNarratives = evolution
    .filter((row) => row.signals.includes("STRENGTHENING"))
    .map((row) => mem("STRENGTHENING", row.narrativeId, row.title, row.reasons[0] ?? "Evidence improving."));
  const weakeningNarratives = evolution
    .filter((row) => row.signals.includes("WEAKENING") || row.signals.includes("DOCTRINE_CONFLICT"))
    .map((row) => mem(row.primarySignal, row.narrativeId, row.title, row.reasons[0] ?? "Readiness declining."));
  const overusedArguments = evolution
    .filter((row) => row.signals.includes("OVERUSED") || row.signals.includes("FATIGUED"))
    .map((row) => mem("OVERUSED", row.narrativeId, row.title, row.reasons.find((r) => r.includes("fatigue") || r.includes("Usage")) ?? "Overexposed frame."));

  return {
    generatedAt: new Date().toISOString(),
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    strengtheningNarratives,
    weakeningNarratives,
    overusedArguments,
    staleCitations: citationAging.filter((row) =>
      ["CITATION_STALE", "ARCHIVE_AT_RISK", "OVERUSED_CITATION", "WEAK_SUPPORT_CHAIN", "COUNTY_OVEREXPOSED"].includes(row.signal),
    ),
    countyDriftWarnings: countyShifts,
    doctrineDriftWarnings: doctrineDrift,
    recurringDebateTraps: debateThemes.filter((row) => row.signal.includes("TRAP") || row.signal.includes("DEBATE")),
    opponentMessageEscalation: messagingDrift.filter((row) =>
      ["MESSAGING_DRIFT", "MEDIA_ESCALATION", "CONTRADICTION_GROWTH", "CONTRADICTION_EMERGENCE"].includes(row.signal),
    ),
    mediaCycleChanges: mediaCycles,
    exportFatigueWarnings: exportFatigue,
    narrativeEvolution: evolution,
    topTrendSummaries: [
      `${strengtheningNarratives.length} strengthening · ${weakeningNarratives.length} weakening narratives`,
      `${messagingDrift.length} opponent messaging drift signal(s)`,
      `${debateThemes.length} debate recurrence pattern(s)`,
      `${citationAging.length} citation aging signal(s)`,
      `${doctrineDrift.length} doctrine drift warning(s)`,
    ],
  };
}

export function getCopilotMemoryHints(
  toolCategory: "opposition_research" | "debate_prep" | "writing_tools" | "briefing_papers" | "intelligence_gathering" | "general",
  repoRoot?: string,
): string[] {
  const summary = summarizeLongitudinalIntelligence(repoRoot);
  const hints: string[] = [MEMORY_GOVERNANCE_LABEL];

  switch (toolCategory) {
    case "debate_prep":
      hints.push(
        ...summary.recurringDebateTraps.slice(0, 2).map((row) => `Debate memory: ${row.reason}`),
        ...summary.overusedArguments.slice(0, 1).map((row) => `Stale rebuttal risk: ${row.reason}`),
      );
      break;
    case "writing_tools":
      hints.push(
        ...summary.overusedArguments.slice(0, 2).map((row) => `Overused phrase risk: ${row.reason}`),
        ...summary.doctrineDriftWarnings.slice(0, 1).map((row) => `Doctrine drift: ${row.reason}`),
      );
      break;
    case "opposition_research":
      hints.push(
        ...summary.opponentMessageEscalation.slice(0, 2).map((row) => `Messaging drift: ${row.reason}`),
        ...summary.weakeningNarratives.slice(0, 1).map((row) => `Collapsing narrative: ${row.reason}`),
      );
      break;
    default:
      hints.push(...summary.topTrendSummaries.slice(0, 2));
  }
  return hints.filter(Boolean);
}
