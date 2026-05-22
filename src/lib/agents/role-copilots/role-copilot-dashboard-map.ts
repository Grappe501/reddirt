import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import type { RoleCopilotId } from "./role-copilot-types";
import { getRoleCopilot } from "./role-copilot-registry";
import { getRoleAllowedModules } from "@/lib/agents/progression/unlock-engine";

export function getCopilotDashboardModules(role: RoleCopilotId, level = 1): DashboardBlockId[] {
  const fromProgression = getRoleAllowedModules(role, level);
  if (fromProgression.length > 0) return fromProgression;
  return getRoleCopilot(role)?.dashboardModuleIds ?? [];
}
