import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import { computeProgressionLevel } from "@/lib/agents/progression/unlock-engine";
import type { CopilotCampaignContext, CopilotIntelligenceInput, CopilotRoleSnapshot } from "./copilot-intelligence-types";
import type { CopilotSkillLevel } from "./role-copilot-types";
import { getRoleCopilot } from "./role-copilot-registry";

export function composeCopilotRoleSnapshot(input: CopilotIntelligenceInput): CopilotRoleSnapshot {
  const def = getRoleCopilot(input.role);
  const skillLevel: CopilotSkillLevel = input.skillLevel ?? "beginner";
  const completed = input.completedTrainingIds ?? [];
  const level = input.progressionLevel ?? computeProgressionLevel(input.role, completed);
  return {
    role: input.role,
    label: def?.label ?? input.role,
    mission: def?.mission ?? "",
    skillLevel,
    progressionLevel: level,
    month: input.month ?? "2026-03",
    pathname: input.pathname,
  };
}

export function composeCopilotCampaignContext(input: CopilotIntelligenceInput): CopilotCampaignContext {
  const obs = input.observations ?? [];
  const friction: string[] = [];
  if (obs.some((o) => o.event === "abandoned_flow" || o.event === "flow_abandoned")) {
    friction.push("Recent abandoned workflow — prefer shorter guided tasks.");
  }
  if (obs.some((o) => o.event === "financial_gap_detected" || o.event === "receipt_missing_detected")) {
    friction.push("Finance gaps detected — route treasurer-safe review only.");
  }
  if (obs.some((o) => o.event === "operator_overwhelm_detected" || o.event === "candidate_overload_detected")) {
    friction.push("Overload signal — use simple mode and fewer modules.");
  }
  const pathname = input.pathname ?? "";
  let routeContext = "general";
  if (pathname.includes("reimbursement")) routeContext = "reimbursement";
  else if (pathname.includes("workbench")) routeContext = "workbench";
  else if (pathname.includes("volunteer")) routeContext = "volunteer";
  else if (pathname.includes("county")) routeContext = "county";
  else if (pathname.includes("communications")) routeContext = "communications";

  return {
    month: input.month ?? "2026-03",
    systemHealthScore: input.osSnapshot?.systemHealthScore,
    activeBlockers: input.osSnapshot?.activeBlockers ?? [],
    pendingApprovals: input.osSnapshot?.pendingApprovals,
    routeContext,
    recentFriction: friction,
  };
}
