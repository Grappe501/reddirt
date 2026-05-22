import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import type { CopilotSkillLevel } from "@/lib/agents/role-copilots/role-copilot-types";
import { getCopilotTrainingModuleIds } from "@/lib/agents/role-copilots/role-copilot-training-map";
import { getTrainingModule, listTrainingModulesForRole } from "./training-module-registry";
import type { TrainingModule } from "./training-types";

export type TrainingPath = {
  id: string;
  role: RoleCopilotId;
  skillLevel: CopilotSkillLevel;
  moduleIds: string[];
  estimatedMinutes: number;
  rationale: string;
};

export function getRoleTrainingPath(
  role: RoleCopilotId,
  skillLevel: CopilotSkillLevel = "beginner",
  completedIds: string[] = [],
): TrainingPath {
  const roleModules = listTrainingModulesForRole(role);
  const copilotIds = getCopilotTrainingModuleIds(role);
  const merged = new Map<string, TrainingModule>();
  for (const m of roleModules) merged.set(m.id, m);
  for (const id of copilotIds) {
    const m = getTrainingModule(id);
    if (m) merged.set(m.id, m);
  }
  let candidates = [...merged.values()];
  if (skillLevel === "beginner") {
    candidates = candidates.filter((m) => m.level === "intro" || m.level === "core");
  } else if (skillLevel === "advanced") {
    candidates.sort((a, b) => (a.level === "advanced" ? -1 : 1));
  }
  const ordered = topologicalSort(
    candidates.map((m) => m.id),
    (id) => getTrainingModule(id)?.prerequisiteModuleIds ?? [],
  );
  const cap = skillLevel === "beginner" ? 6 : skillLevel === "intermediate" ? 10 : 14;
  const available = ordered.filter((id) => {
    const m = getTrainingModule(id);
    return m && m.prerequisiteModuleIds.every((p) => completedIds.includes(p));
  });
  const moduleIds = (available.length >= 3 ? available : ordered).slice(0, cap);
  const estimatedMinutes = moduleIds.reduce((s, id) => s + (getTrainingModule(id)?.estimatedMinutes ?? 0), 0);
  return {
    id: `path_${role}_${skillLevel}`,
    role,
    skillLevel,
    moduleIds,
    estimatedMinutes,
    rationale: `Kelly SOS path for ${role} at ${skillLevel} level (${moduleIds.length} modules).`,
  };
}

export function buildTrainingPathForAvailableTime(
  role: RoleCopilotId,
  availableMinutes: number,
  completedIds: string[] = [],
): TrainingPath {
  const full = getRoleTrainingPath(role, "beginner", completedIds);
  let total = 0;
  const moduleIds: string[] = [];
  for (const id of full.moduleIds) {
    const m = getTrainingModule(id);
    if (!m) continue;
    if (total + m.estimatedMinutes > availableMinutes && moduleIds.length >= 1) break;
    moduleIds.push(id);
    total += m.estimatedMinutes;
  }
  return {
    ...full,
    moduleIds: moduleIds.length ? moduleIds : full.moduleIds.slice(0, 1),
    estimatedMinutes: total || full.estimatedMinutes,
    rationale: `Time-boxed path (~${availableMinutes} min available).`,
  };
}

function topologicalSort(ids: string[], prereqsFn: (id: string) => string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    for (const p of prereqsFn(id)) visit(p);
    if (ids.includes(id)) {
      seen.add(id);
      out.push(id);
    }
  };
  for (const id of ids) visit(id);
  return out;
}
