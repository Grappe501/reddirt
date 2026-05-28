import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const INTELLIGENCE_MEMORY_REGISTRY_REL = "data/intelligence/intelligence-memory-registry.json";

export type NarrativeMemoryEntry = {
  narrativeId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  evolutionSummary: string;
  readinessHistory: Array<{ at: string; band: string }>;
  dependencyHistory: Array<{ at: string; exportReadyClaims: number; partialClaims: number }>;
  exportHistory: Array<{ exportId: string; at: string; scope: string }>;
  fatigueSignals: string[];
  doctrineAlignmentHistory: Array<{ at: string; alignment: string }>;
  countyShiftSignals: string[];
  mediaCycleLinks: string[];
};

export type OpponentMessagingMemoryEntry = {
  messageId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  recurrenceCount: number;
  countiesObserved: string[];
  sourceOrigins: string[];
  framingChanges: Array<{ at: string; note: string }>;
  contradictionHistory: string[];
  debateUsage: string[];
  mediaAmplification: string[];
};

export type DebateMemoryEntry = {
  themeId: string;
  recurringQuestions: string[];
  recurringAttacks: string[];
  rebuttalHistory: Array<{ at: string; pattern: string; status: string }>;
  successfulBridgePatterns: string[];
  riskyResponses: string[];
  fatigueSignals: string[];
};

export type CitationMemoryEntry = {
  citationId: string;
  firstUsedAt: string;
  lastUsedAt: string;
  citationHealthHistory: Array<{ at: string; health: string }>;
  archiveFailures: number;
  exportUsage: number;
  countyUsage: string[];
  staleSignals: string[];
};

export type CountyNarrativeMemoryEntry = {
  countyId: string;
  narrativeHistory: Array<{ narrativeId: string; at: string; readiness: string }>;
  doctrineAlignmentShift: Array<{ at: string; direction: string }>;
  mediaMarketShift: string[];
  turnoutAssumptionChanges: string[];
  strategicPriorityChanges: string[];
  registrationProgressSignals: string[];
};

export type IntelligenceMemoryRegistry = {
  version: number;
  generatedAt: string;
  purpose: string;
  governanceDefaults: Record<string, unknown>;
  narrativeMemory: NarrativeMemoryEntry[];
  opponentMessagingMemory: OpponentMessagingMemoryEntry[];
  debateMemory: DebateMemoryEntry[];
  citationMemory: CitationMemoryEntry[];
  countyNarrativeMemory: CountyNarrativeMemoryEntry[];
};

export function loadIntelligenceMemoryRegistry(repoRoot: string = process.cwd()): IntelligenceMemoryRegistry {
  const abs = path.join(repoRoot, INTELLIGENCE_MEMORY_REGISTRY_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "Memory registry not initialized.",
      governanceDefaults: {},
      narrativeMemory: [],
      opponentMessagingMemory: [],
      debateMemory: [],
      citationMemory: [],
      countyNarrativeMemory: [],
    };
  }
  return JSON.parse(readFileSync(abs, "utf8")) as IntelligenceMemoryRegistry;
}
