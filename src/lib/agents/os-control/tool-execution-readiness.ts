import { listMasterRegistryTools } from "@/lib/agents/master-tool-registry";
import { HUMAN_APPROVAL_GATES } from "./human-approval-gate-matrix";

export type ToolExecutionReadiness = {
  toolId: string;
  name: string;
  canRead: boolean;
  canDraft: boolean;
  canPrepare: boolean;
  canExecute: boolean;
  requiresHuman: boolean;
  currentBlocker: string | null;
  routeToExecute: string;
  routeToReview: string;
};

const BLOCKED_EXECUTE_PREFIXES = ["email", "gcal", "promot", "fin-1", "send"];
const PREPARE_ONLY_STATUSES = new Set(["partial", "scaffolded", "idea"]);

export function assessToolReadiness(tool: { id: string; name: string; status: string; humanApprovalRequired: boolean; routeBindings: string[] }): ToolExecutionReadiness {
  const route = tool.routeBindings[0] ?? "/admin/campaign-events/ai-tools";
  const idLower = tool.id.toLowerCase();
  const blockedAuto = BLOCKED_EXECUTE_PREFIXES.some((p) => idLower.includes(p) || tool.name.toLowerCase().includes(p));
  const requiresHuman = tool.humanApprovalRequired || blockedAuto;
  const canRead = tool.status !== "idea";
  const canDraft = canRead && tool.status !== "idea";
  const canPrepare = canDraft && (PREPARE_ONLY_STATUSES.has(tool.status) || requiresHuman);
  const canExecute = canRead && !requiresHuman && tool.status === "functional" && !blockedAuto;

  let currentBlocker: string | null = null;
  if (tool.status === "idea") currentBlocker = "Not built";
  else if (tool.status === "scaffolded") currentBlocker = "Scaffold only";
  else if (requiresHuman) currentBlocker = "Human approval required";
  else if (blockedAuto) currentBlocker = "Automation blocked";

  return {
    toolId: tool.id,
    name: tool.name,
    canRead,
    canDraft,
    canPrepare,
    canExecute,
    requiresHuman,
    currentBlocker,
    routeToExecute: route,
    routeToReview: requiresHuman ? route : "/admin/ai-command-center",
  };
}

export function buildToolExecutionReadinessSummary(limit = 24): ToolExecutionReadiness[] {
  return listMasterRegistryTools()
    .slice(0, limit)
    .map((t) =>
      assessToolReadiness({
        id: t.id,
        name: t.name,
        status: t.status,
        humanApprovalRequired: t.humanApprovalRequired,
        routeBindings: t.routeBindings,
      }),
    );
}

export function countReadinessBands(tools: ToolExecutionReadiness[]) {
  return {
    canExecute: tools.filter((t) => t.canExecute).length,
    canPrepareOnly: tools.filter((t) => t.canPrepare && !t.canExecute).length,
    blocked: tools.filter((t) => t.currentBlocker).length,
  };
}

export function controlLayerToolIds(): string[] {
  return [
    ...HUMAN_APPROVAL_GATES.map((g) => g.actionId),
    "campaign-os-state-observer",
    "campaign-os-workflow-planner",
    "agent-action-preparer",
  ];
}
