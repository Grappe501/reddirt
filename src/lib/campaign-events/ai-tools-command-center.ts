import { AI_TOOL_LIFECYCLES } from "./ai-tools-master-catalog";
import { buildSprint4ApprovalPipeline, type Sprint4PipelineStage } from "./ai-tools/sprint4-pipeline";
import { SPRINT4_APPROVAL_EMAIL_TOOL_CONTRACTS } from "./ai-tools/sprint4-approval-email-tools";
import { CAMPAIGN_AI_HUMAN_CONTROL_RULES, type CampaignAiToolContract } from "./ai-tools/tool-contract";
import { mergeSupplementIntoLifecycles, SUPPLEMENT_TOOLS_BY_LIFECYCLE } from "./ai-tools-supplement";
import {
  computeToolSystemReadinessScore,
  deriveOperationalMeta,
  maturityPoints,
  type EnrichedAiTool,
} from "./ai-tools-operational-meta";
import type { AiToolEntry, AiToolLifecycle, AiToolStatus } from "./ai-tools-master-catalog";

export type CommandCenterSnapshot = {
  tools: EnrichedAiTool[];
  lifecycles: AiToolLifecycle[];
  readinessScore: number;
  counts: ReturnType<typeof countEnriched>;
  functionalNow: EnrichedAiTool[];
  needsBuild: EnrichedAiTool[];
  automationBlocked: EnrichedAiTool[];
  highPriorityNext: EnrichedAiTool[];
  buildNextRecommendations: BuildNextRecommendation[];
  byLifecycle: Array<{ lifecycle: AiToolLifecycle; tools: EnrichedAiTool[] }>;
  byStatus: Record<AiToolStatus, EnrichedAiTool[]>;
  sprint4: {
    contracts: CampaignAiToolContract[];
    tools: EnrichedAiTool[];
    pipeline: Sprint4PipelineStage[];
    humanControlRules: readonly string[];
    toolCountBeforeSupplement: number;
  };
};

export type BuildNextRecommendation = {
  tool: EnrichedAiTool;
  score: number;
  rationale: string;
};

function countEnriched(tools: EnrichedAiTool[]) {
  return {
    idea: tools.filter((t) => t.status === "idea").length,
    scaffolded: tools.filter((t) => t.status === "scaffolded").length,
    partial: tools.filter((t) => t.status === "partial").length,
    functional: tools.filter((t) => t.status === "functional").length,
    total: tools.length,
    humanApproval: tools.filter((t) => t.humanApprovalRequired).length,
    availableNow: tools.filter((t) => t.availableNow).length,
    automationBlocked: tools.filter((t) => t.blocksAutomation).length,
  };
}

function enrichTool(tool: AiToolEntry, lifecycleTitle: string): EnrichedAiTool {
  return { ...tool, ...deriveOperationalMeta(tool), lifecycleTitle };
}

export function buildCommandCenterSnapshot(): CommandCenterSnapshot {
  const lifecycles = mergeSupplementIntoLifecycles(AI_TOOL_LIFECYCLES);
  const tools: EnrichedAiTool[] = lifecycles.flatMap((lc) =>
    lc.tools.map((t) => enrichTool(t, lc.title)),
  );

  const readinessScore = computeToolSystemReadinessScore(tools);
  const counts = countEnriched(tools);

  const functionalNow = tools.filter((t) => t.status === "functional");
  const needsBuild = tools.filter((t) => t.status === "idea" || t.status === "scaffolded");
  const automationBlocked = tools.filter((t) => t.blocksAutomation);

  const highPriorityNext = tools
    .filter((t) => t.status !== "functional" && (t.priority === "P0" || t.priority === "P1"))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, 12);

  const buildNextRecommendations = rankBuildNext(tools).slice(0, 5);

  const byLifecycle = lifecycles.map((lc) => ({
    lifecycle: lc,
    tools: lc.tools.map((t) => enrichTool(t, lc.title)),
  }));

  const byStatus: Record<AiToolStatus, EnrichedAiTool[]> = {
    functional: tools.filter((t) => t.status === "functional"),
    partial: tools.filter((t) => t.status === "partial"),
    scaffolded: tools.filter((t) => t.status === "scaffolded"),
    idea: tools.filter((t) => t.status === "idea"),
  };

  const sprint4Tools = tools.filter((t) => t.lifecycleId === "sprint4_approval_email");
  const toolCountBeforeSupplement =
    tools.length - Object.values(SUPPLEMENT_TOOLS_BY_LIFECYCLE).flat().length + (SUPPLEMENT_TOOLS_BY_LIFECYCLE.sprint4_approval_email?.length ?? 0);

  return {
    tools,
    lifecycles,
    readinessScore,
    counts,
    functionalNow,
    needsBuild,
    automationBlocked,
    highPriorityNext,
    buildNextRecommendations,
    byLifecycle,
    byStatus,
    sprint4: {
      contracts: SPRINT4_APPROVAL_EMAIL_TOOL_CONTRACTS,
      tools: sprint4Tools,
      pipeline: buildSprint4ApprovalPipeline(),
      humanControlRules: CAMPAIGN_AI_HUMAN_CONTROL_RULES,
      toolCountBeforeSupplement: Math.max(0, tools.length - sprint4Tools.length),
    },
  };
}

export function getSprint4Contract(snapshot: CommandCenterSnapshot, toolId: string) {
  return snapshot.sprint4.contracts.find((c) => c.id === toolId);
}

export function filterSprint4Tools(
  tools: EnrichedAiTool[],
  filter: { v1Only?: boolean; automationBlocked?: boolean; observationEnabled?: boolean },
): EnrichedAiTool[] {
  let list = tools.filter((t) => t.lifecycleId === "sprint4_approval_email");
  if (filter.automationBlocked === true) list = list.filter((t) => t.blocksAutomation);
  if (filter.observationEnabled) {
    const obsIds = new Set(SPRINT4_APPROVAL_EMAIL_TOOL_CONTRACTS.filter((c) => c.observationEvents.length > 0).map((c) => c.id));
    list = list.filter((t) => obsIds.has(t.id));
  }
  return list;
}

function priorityRank(p: AiToolEntry["priority"]): number {
  if (p === "P0") return 0;
  if (p === "P1") return 1;
  if (p === "P2") return 2;
  return 3;
}

const APRIL_USEFUL_IDS = new Set([
  "cri-city-county-assist",
  "mr-mileage-assist",
  "appr-month-wizard",
  "rpt-month-readiness",
  "tl-month-report",
  "intake-dup-cal-id",
  "conf-schedule",
  "email-draft-scaffold",
]);

const TRAVEL_USEFUL_IDS = new Set([
  "mr-mileage-assist",
  "mr-rt-miles",
  "tl-month-report",
  "rpt-travel-summarizer",
  "rpt-csv-export",
  "mr-anomaly-detector",
]);

const APPROVAL_AUTO_IDS = new Set([
  "appr-email-send",
  "appr-parse-reply",
  "email-confirm-all",
]);

function rankBuildNext(tools: EnrichedAiTool[]): BuildNextRecommendation[] {
  const candidates = tools.filter((t) => t.status !== "functional");

  const scored = candidates.map((tool) => {
    let score = 0;
    const reasons: string[] = [];

    if (tool.priority === "P0") score += 40;
    else if (tool.priority === "P1") score += 28;
    else if (tool.priority === "P2") score += 12;

    if (tool.status === "partial") score += 25;
    else if (tool.status === "scaffolded") score += 18;
    else score += 5;

    if (!tool.blocksAutomation) score += 15;
    else score -= 10;

    if (APRIL_USEFUL_IDS.has(tool.id)) {
      score += 12;
      reasons.push("April completion");
    }
    if (TRAVEL_USEFUL_IDS.has(tool.id)) {
      score += 8;
      reasons.push("Travel ledger");
    }
    if (APPROVAL_AUTO_IDS.has(tool.id)) {
      score += 6;
      reasons.push("Approval automation (blocked on send)");
    }

    if (tool.availableNow) score += 5;

    return {
      tool,
      score,
      rationale: reasons.length ? reasons.join(" · ") : "High priority roadmap item",
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export function getToolById(snapshot: CommandCenterSnapshot, toolId: string): EnrichedAiTool | undefined {
  return snapshot.tools.find((t) => t.id === toolId || t.id === toolId.replace(/^appr-/, "approval-"));
}

export function supplementToolCount(): number {
  return Object.values(SUPPLEMENT_TOOLS_BY_LIFECYCLE).reduce((n, arr) => n + arr.length, 0);
}
