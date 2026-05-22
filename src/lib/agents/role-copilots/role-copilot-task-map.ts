import type { RoleCopilotId } from "./role-copilot-types";
import { getRoleCopilot } from "./role-copilot-registry";

export function getCopilotDailyTasks(role: RoleCopilotId): string[] {
  return getRoleCopilot(role)?.dailyTasks ?? [];
}

export function getCopilotWeeklyTasks(role: RoleCopilotId): string[] {
  return getRoleCopilot(role)?.weeklyTasks ?? [];
}

export function getCopilotSafeActions(role: RoleCopilotId): string[] {
  return getRoleCopilot(role)?.safeActions ?? [];
}

export function getCopilotGatedActions(role: RoleCopilotId): string[] {
  return getRoleCopilot(role)?.gatedActions ?? [];
}
