import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { getRoleAllowedModules, computeProgressionLevel } from "./unlock-engine";
import { listRoleLevels } from "./role-level-registry";
import { listAchievements } from "./achievement-recorder";
import type { ProgressionSummary } from "./progression-types";

export function buildProgressionSummary(
  role: RoleCopilotId,
  completedTrainingIds: string[] = [],
): ProgressionSummary {
  const level = computeProgressionLevel(role, completedTrainingIds);
  const nextLevel = level < 3 ? ((level + 1) as 2 | 3) : undefined;
  const unlockedModules = getRoleAllowedModules(role, level, completedTrainingIds);
  const allL3 = getRoleAllowedModules(role, 3, completedTrainingIds);
  const lockedModules = allL3.filter((m) => !unlockedModules.includes(m));
  const nextDef = nextLevel ? listRoleLevels(role).find((l) => l.level === nextLevel) : undefined;
  const required = nextDef?.requiredTrainingModuleIds ?? [];
  const done = required.filter((id) => completedTrainingIds.includes(id)).length;
  const percentToNext = nextLevel ? (required.length ? Math.round((done / required.length) * 100) : 50) : 100;
  return {
    role,
    level,
    nextLevel,
    percentToNext,
    unlockedModules,
    lockedModules,
    recentAchievements: listAchievements(role).slice(-5).map((a) => a.label),
  };
}
