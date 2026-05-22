import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import type { RoleProgressLevel } from "./progression-types";

export type AchievementEntry = {
  id: string;
  role: RoleCopilotId;
  level: RoleProgressLevel;
  label: string;
  at: string;
};

const achievements: AchievementEntry[] = [];

export function recordAchievement(
  role: RoleCopilotId,
  level: RoleProgressLevel,
  label?: string,
): AchievementEntry {
  const entry: AchievementEntry = {
    id: `ach_${Date.now().toString(36)}`,
    role,
    level,
    label: label ?? `${role} reached level ${level}`,
    at: new Date().toISOString(),
  };
  achievements.push(entry);
  return entry;
}

export function listAchievements(role?: RoleCopilotId): AchievementEntry[] {
  return role ? achievements.filter((a) => a.role === role) : [...achievements];
}
