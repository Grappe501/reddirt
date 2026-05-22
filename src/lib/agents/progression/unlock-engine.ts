import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { getRoleCopilot } from "@/lib/agents/role-copilots/role-copilot-registry";
import { getUnlockedDashboardModules } from "@/lib/agents/training/training-unlock-engine";
import { getRoleLevelDefinition, listRoleLevels } from "./role-level-registry";
import type { RoleProgressLevel } from "./progression-types";

export function getRoleAllowedModules(
  role: RoleCopilotId,
  level: number,
  completedTrainingIds: string[] = [],
): DashboardBlockId[] {
  const clamped = Math.min(3, Math.max(1, level)) as RoleProgressLevel;
  const fromLevel = getRoleLevelDefinition(role, clamped)?.unlocksDashboardModules ?? [];
  const fromTraining = getUnlockedDashboardModules(completedTrainingIds);
  const fromCopilot = getRoleCopilot(role)?.dashboardModuleIds ?? [];
  const set = new Set<DashboardBlockId>([...fromLevel, ...fromTraining, ...fromCopilot]);
  return [...set];
}

export function computeProgressionLevel(
  role: RoleCopilotId,
  completedTrainingIds: string[],
): RoleProgressLevel {
  const levels = listRoleLevels(role);
  let current: RoleProgressLevel = 1;
  for (const def of levels) {
    if (def.requiredTrainingModuleIds.every((id) => completedTrainingIds.includes(id))) {
      current = def.level;
    }
  }
  return current;
}
