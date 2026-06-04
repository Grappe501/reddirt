import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  loadAiCopilotToolRegistry,
  recommendCopilotRuns,
  type AiCopilotToolEntry,
} from "@/lib/intelligence/aiCopilotOrchestrator";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { listSosDebateQuestionSummaries } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { listTrapLaneSummaries } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { AGENT_RUN_AUDIT_LOG_REL } from "@/lib/intelligence/intelligenceAgentOrchestrator";

export const DEBATE_AGENT_TOOLING_PACKAGE_REL = "data/intelligence/debate-agent-tooling-package.json";

export type DebateAgentToolingSequenceStep = {
  toolId: string;
  label: string;
  why: string;
};

export type DebateAgentToolingSequence = {
  sequenceId: string;
  label: string;
  phase: string;
  audience: string;
  estimatedMinutes: number;
  steps: DebateAgentToolingSequenceStep[];
};

export type DebateAgentToolingLinkedSurface = {
  href: string;
  label: string;
  role: string;
};

export type DebateAgentToolingPackageFile = {
  version: number;
  packageId: string;
  generatedAt: string;
  purpose: string;
  governance: Record<string, unknown>;
  linkedSurfaces: DebateAgentToolingLinkedSurface[];
  sequences: DebateAgentToolingSequence[];
  quickToolIds: string[];
};

export type DebateAgentReadinessSignal = {
  id: string;
  label: string;
  status: "ok" | "warn" | "action";
  detail: string;
};

export type DebateAgentToolingPageData = {
  package: DebateAgentToolingPackageFile;
  registryToolCount: number;
  debatePrepTools: AiCopilotToolEntry[];
  quickTools: AiCopilotToolEntry[];
  sequences: DebateAgentToolingSequence[];
  linkedSurfaces: DebateAgentToolingLinkedSurface[];
  recommendedRuns: string[];
  readinessSignals: DebateAgentReadinessSignal[];
  sosQuestionCount: number;
  sosHighProbabilityCount: number;
  trapLaneCount: number;
  recentAuditRuns: Array<{ runId: string; generatedAt: string; debateReadinessOverall?: number }>;
};

function resolveRepoRoot(repoRoot?: string): string {
  return repoRoot ?? process.cwd();
}

export function loadDebateAgentToolingPackage(repoRoot?: string): DebateAgentToolingPackageFile | null {
  const root = resolveRepoRoot(repoRoot);
  const filePath = path.join(root, DEBATE_AGENT_TOOLING_PACKAGE_REL);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as DebateAgentToolingPackageFile;
  } catch {
    return null;
  }
}

function loadRecentAuditRuns(repoRoot?: string, limit = 5): DebateAgentToolingPageData["recentAuditRuns"] {
  const root = resolveRepoRoot(repoRoot);
  const filePath = path.join(root, AGENT_RUN_AUDIT_LOG_REL);
  if (!existsSync(filePath)) return [];
  try {
    const raw = JSON.parse(readFileSync(filePath, "utf8")) as {
      runs?: Array<{ runId: string; generatedAt: string; debateReadinessOverall?: number }>;
      entries?: Array<{ runId: string; generatedAt: string; debateReadinessOverall?: number }>;
    };
    const list = raw.runs ?? raw.entries ?? [];
    return list.slice(-limit).reverse();
  } catch {
    return [];
  }
}

export function buildDebateAgentReadinessSignals(repoRoot?: string): DebateAgentReadinessSignal[] {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const notExportReady = evidence.claims.filter((c) => !c.exportReady).length;
  const openTasks = evidence.retrievalTasks.filter((t) => t.taskStatus !== "COMPLETE" && t.taskStatus !== "ARCHIVED").length;
  const sos = listSosDebateQuestionSummaries();
  const high = sos.filter((q) => q.probability === "HIGH").length;

  return [
    {
      id: "claims-export",
      label: "Export-ready claims",
      status: notExportReady > 8 ? "action" : notExportReady > 3 ? "warn" : "ok",
      detail: `${evidence.claims.length - notExportReady} export-ready · ${notExportReady} need review before stage lines`,
    },
    {
      id: "retrieval",
      label: "Open retrieval tasks",
      status: openTasks > 5 ? "action" : openTasks > 0 ? "warn" : "ok",
      detail: openTasks === 0 ? "No open retrieval tasks" : `${openTasks} open — run source-gap-finder`,
    },
    {
      id: "sos-bank",
      label: "SOS question bank",
      status: "ok",
      detail: `${sos.length} questions · ${high} HIGH probability — rehearse speak-order drills`,
    },
    {
      id: "trap-lanes",
      label: "Trap lanes",
      status: "ok",
      detail: `${listTrapLaneSummaries().length} lanes with full drill-down`,
    },
  ];
}

export function recommendDebateAgentRuns(repoRoot?: string): string[] {
  const base = recommendCopilotRuns(repoRoot);
  const extra = [
    "Run trap-question-detector + SOS question bank before mock debate.",
    "Run bridge-line-builder when pivoting from record fight to unity spine.",
    "Pair rebuttal-builder output with Claims gate — never read LLM drafts on stage.",
  ];
  return [...base, ...extra].slice(0, 8);
}

export function buildDebateAgentToolingPageData(repoRoot?: string): DebateAgentToolingPageData | null {
  const pkg = loadDebateAgentToolingPackage(repoRoot);
  if (!pkg) return null;

  const registry = loadAiCopilotToolRegistry(repoRoot);
  const byId = new Map(registry.tools.map((t) => [t.toolId, t]));
  const debatePrepTools = registry.tools.filter((t) => t.category === "debate_prep");
  const quickTools = pkg.quickToolIds.map((id) => byId.get(id)).filter((t): t is AiCopilotToolEntry => Boolean(t));

  const sos = listSosDebateQuestionSummaries();

  return {
    package: pkg,
    registryToolCount: registry.tools.length,
    debatePrepTools,
    quickTools,
    sequences: pkg.sequences,
    linkedSurfaces: pkg.linkedSurfaces,
    recommendedRuns: recommendDebateAgentRuns(repoRoot),
    readinessSignals: buildDebateAgentReadinessSignals(repoRoot),
    sosQuestionCount: sos.length,
    sosHighProbabilityCount: sos.filter((q) => q.probability === "HIGH").length,
    trapLaneCount: listTrapLaneSummaries().length,
    recentAuditRuns: loadRecentAuditRuns(repoRoot),
  };
}
