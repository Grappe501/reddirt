import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";

export type RoleProgressLevel = 1 | 2 | 3;

export type RoleLevelDefinition = {
  role: RoleCopilotId;
  level: RoleProgressLevel;
  title: string;
  description: string;
  requiredTrainingModuleIds: string[];
  unlocksDashboardModules: DashboardBlockId[];
  achievements: string[];
};

export type ProgressionSummary = {
  role: RoleCopilotId;
  level: RoleProgressLevel;
  nextLevel?: RoleProgressLevel;
  percentToNext: number;
  unlockedModules: DashboardBlockId[];
  lockedModules: DashboardBlockId[];
  recentAchievements: string[];
};
