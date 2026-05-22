import type { RoleCopilotId } from "./role-copilot-types";
import { getRoleCopilot } from "./role-copilot-registry";

export function getCopilotTrainingModuleIds(role: RoleCopilotId): string[] {
  return getRoleCopilot(role)?.trainingModuleIds ?? [];
}

export function mapCopilotToTrainingRole(role: RoleCopilotId): string {
  return role;
}
