import type { ClassifiedIntent } from "./agent-runtime-types";
import type { AgentPlanStep } from "./agent-runtime-types";
import type { ToolRouteResult } from "./agent-runtime-types";

export function buildToolPlan(
  intent: ClassifiedIntent,
  route: ToolRouteResult,
  blockers: string[],
): { proposedPlan: AgentPlanStep[]; safeActions: AgentPlanStep[]; blockedActions: { action: string; reason: string }[] } {
  const safeActions: AgentPlanStep[] = [];
  const blockedActions: { action: string; reason: string }[] = [];

  safeActions.push({
    id: "step_primary_route",
    title: `Open ${intent.task.replaceAll("_", " ")}`,
    kind: "route",
    href: intent.likelyRoute,
  });

  for (const link of route.actionLinks.slice(1, 4)) {
    safeActions.push({
      id: `step_${link.label.replace(/\W/g, "_")}`,
      title: link.label,
      kind: "route",
      href: link.href,
    });
  }

  for (const tool of route.recommended.slice(0, 3)) {
    safeActions.push({
      id: `tool_${tool.id}`,
      title: `Use tool: ${tool.name}`,
      kind: "read",
      toolId: tool.id,
      href: tool.routeBindings[0],
    });
  }

  if (blockers.length) {
    safeActions.push({
      id: "step_clear_blockers",
      title: `Clear blocker: ${blockers[0]}`,
      kind: "fix",
      href: intent.likelyRoute,
    });
  }

  for (const b of route.blocked.slice(0, 3)) {
    blockedActions.push({
      action: `Auto-run ${b.tool.name}`,
      reason: b.reason,
    });
  }

  if (intent.humanApprovalRequired) {
    blockedActions.push({
      action: "Autonomous completion of this request",
      reason: "Human approval required — use gated UI controls.",
    });
  }

  const proposedPlan = [...safeActions, ...blockedActions.map((b, i) => ({
    id: `blocked_${i}`,
    title: `Blocked: ${b.action}`,
    kind: "blocked" as const,
  }))];

  return { proposedPlan, safeActions, blockedActions };
}
