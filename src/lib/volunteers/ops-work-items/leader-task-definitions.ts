import type {
  CampaignTaskOpsSourceType,
  CampaignTaskPriority,
  CampaignTaskType,
} from "@prisma/client";

export const OPS_LEADER_WORK_PACKET = "OPS-WORK-3" as const;

export type LeaderGapTaskType = "quiet" | "my_five";

export type LeaderGapTaskDefinition = {
  title: (leaderName: string, detail?: string) => string;
  description: (leaderName: string, detail?: string) => string;
  taskType: CampaignTaskType;
  priority: CampaignTaskPriority;
  assignedRole: string;
  opsSourceType: CampaignTaskOpsSourceType;
  dueDays: number;
  signalKey: (leaderSlug: string) => string;
};

export const LEADER_GAP_TASK_DEFINITIONS: Record<LeaderGapTaskType, LeaderGapTaskDefinition> = {
  quiet: {
    title: (name) => `First field touch — ${name}`,
    description: (name) =>
      `${name} has no recent field log or leadership fills — log a conversation or fill a workbench slot.`,
    taskType: "FIELD",
    priority: "HIGH",
    assignedRole: "FIELD_DIRECTOR",
    opsSourceType: "leader_gap",
    dueDays: 5,
    signalKey: (slug) => `leader-quiet:${slug}`,
  },
  my_five: {
    title: (name, detail) => `Complete My Five — ${name}${detail ? ` (${detail})` : ""}`,
    description: (name, detail) =>
      `${name} is below 5/5 on My Five${detail ? ` — ${detail}` : ""}. Map remaining slots from the workbench roster.`,
    taskType: "VOLUNTEER",
    priority: "MEDIUM",
    assignedRole: "VOLUNTEER_COORDINATOR",
    opsSourceType: "leader_gap",
    dueDays: 7,
    signalKey: (slug) => `leader-my-five:${slug}`,
  },
};

export function leaderGapTaskDefinition(
  gapType: LeaderGapTaskType,
): LeaderGapTaskDefinition | undefined {
  return LEADER_GAP_TASK_DEFINITIONS[gapType];
}
