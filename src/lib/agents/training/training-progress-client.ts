import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";

/** Browser-local training progress (Training Center UI). */
export type LocalTrainingProgress = {
  operatorId: string;
  role: RoleCopilotId;
  completedModuleIds: string[];
  startedModuleIds: string[];
  level: number;
};

const LOCAL_KEY = "kelly_os_training_progress";

export function loadLocalTrainingProgress(): LocalTrainingProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as LocalTrainingProgress) : null;
  } catch {
    return null;
  }
}

export function saveLocalTrainingProgress(progress: LocalTrainingProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

export function getOrCreateOperatorId(): string {
  if (typeof window === "undefined") return "server_operator";
  const key = "kelly_os_operator_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `op_${Date.now().toString(36)}`;
    localStorage.setItem(key, id);
  }
  return id;
}
