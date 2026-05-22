import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import { getBlockById } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import { getRoleAllowedModules, computeProgressionLevel } from "@/lib/agents/progression/unlock-engine";
import { getLockedDashboardModules } from "@/lib/agents/training/training-unlock-engine";
import { getRoleTrainingPath } from "@/lib/agents/training/training-path-builder";
import { recommendNextTrainingModule } from "@/lib/agents/training/training-recommendation-engine";
import type { CopilotReadinessReport } from "./copilot-intelligence-types";
import type { CopilotSkillLevel, RoleCopilotId } from "./role-copilot-types";
import { getRoleCopilot } from "./role-copilot-registry";

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function scoreCopilotReadiness(
  role: RoleCopilotId,
  skillLevel: CopilotSkillLevel = "beginner",
  completedTrainingIds: string[] = [],
): CopilotReadinessReport {
  const def = getRoleCopilot(role);
  const level = computeProgressionLevel(role, completedTrainingIds);
  const path = getRoleTrainingPath(role, skillLevel, completedTrainingIds);
  const completed = completedTrainingIds.length;
  const pathTotal = path.moduleIds.length || 1;
  const trainingReadiness = clamp((completed / pathTotal) * 100);
  const roleReadiness = skillLevel === "advanced" ? 90 : skillLevel === "intermediate" ? 70 : 45;
  const unlocked = getRoleAllowedModules(role, level, completedTrainingIds);
  const allDesired = def?.dashboardModuleIds ?? [];
  const locked = getLockedDashboardModules(allDesired, completedTrainingIds);
  const dashboardReadiness = clamp((unlocked.length / Math.max(allDesired.length, 1)) * 100);
  const taskReadiness = clamp(roleReadiness * 0.6 + trainingReadiness * 0.4);
  const riskReadiness = skillLevel === "beginner" ? 55 : 80;
  const autonomyReadiness = skillLevel === "advanced" && level >= 3 ? 75 : skillLevel === "beginner" ? 20 : 45;
  const overall = clamp(
    (roleReadiness + trainingReadiness + dashboardReadiness + taskReadiness + riskReadiness + autonomyReadiness) / 6,
  );

  const safeNow = [...(def?.safeActions ?? []).slice(0, 4)];
  const needsTrainingFirst = path.moduleIds
    .filter((id) => !completedTrainingIds.includes(id))
    .slice(0, 3)
    .map((id) => id);
  const needsSupervisor = [...(def?.gatedActions ?? []).slice(0, 3), ...(skillLevel === "beginner" ? ["Month review approvals"] : [])];
  const tooAdvancedModules = locked.map((l) => l.blockId);
  const hiddenUntilLater =
    skillLevel === "beginner"
      ? [...(def?.gatedActions ?? []), ...(def?.doNotTouch ?? []).slice(0, 2)]
      : [...(def?.doNotTouch ?? []).slice(0, 1)];

  let label: CopilotReadinessReport["label"] = "getting_started";
  if (overall >= 75) label = "expert";
  else if (overall >= 55) label = "operational";
  else if (overall >= 35) label = "building_skills";

  return {
    role,
    dimensions: {
      roleReadiness,
      trainingReadiness,
      dashboardReadiness,
      taskReadiness,
      riskReadiness,
      autonomyReadiness,
      overall,
    },
    safeNow,
    needsTrainingFirst,
    needsSupervisor,
    tooAdvancedModules,
    hiddenUntilLater,
    label,
  };
}

export function canSafelyPerformTask(
  role: RoleCopilotId,
  taskTitle: string,
  completedTrainingIds: string[] = [],
): boolean {
  const report = scoreCopilotReadiness(role, "beginner", completedTrainingIds);
  if (report.hiddenUntilLater.some((h) => taskTitle.toLowerCase().includes(h.toLowerCase()))) return false;
  if (report.needsSupervisor.some((s) => taskTitle.toLowerCase().includes(s.toLowerCase()))) return false;
  return true;
}

export function describeModuleLock(blockId: DashboardBlockId): string {
  const def = getBlockById(blockId);
  return def?.title ?? blockId;
}
