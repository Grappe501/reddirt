import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import { getTrainingModule } from "./training-module-registry";

export function getUnlockedDashboardModules(completedModuleIds: string[]): DashboardBlockId[] {
  const set = new Set<DashboardBlockId>();
  for (const id of completedModuleIds) {
    const m = getTrainingModule(id);
    if (!m) continue;
    for (const block of m.unlocksDashboardModules) set.add(block);
  }
  return [...set];
}

export function getLockedDashboardModules(
  allDesired: DashboardBlockId[],
  completedModuleIds: string[],
): { blockId: DashboardBlockId; requiredModuleId: string; moduleTitle: string }[] {
  const unlocked = new Set(getUnlockedDashboardModules(completedModuleIds));
  const locked: { blockId: DashboardBlockId; requiredModuleId: string; moduleTitle: string }[] = [];
  for (const blockId of allDesired) {
    if (unlocked.has(blockId)) continue;
    const mod = findModuleUnlocking(blockId);
    if (mod) locked.push({ blockId, requiredModuleId: mod.id, moduleTitle: mod.title });
  }
  return locked;
}

import { listTrainingModules } from "./training-module-registry";

function findModuleUnlocking(blockId: DashboardBlockId) {
  return listTrainingModules().find((m) => m.unlocksDashboardModules.includes(blockId));
}
