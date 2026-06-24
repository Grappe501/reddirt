import type {
  CampaignTaskOpsSourceType,
  CampaignTaskOpsVisibility,
  CampaignTaskPriority,
  CampaignTaskType,
} from "@prisma/client";

export const OPS_WORK_PACKET = "OPS-WORK-2" as const;

export const OPEN_OPS_TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED"] as const;

export type OpsSignalTaskDefinition = {
  title: (count: number) => string;
  description: (count: number) => string;
  taskType: CampaignTaskType;
  priority: CampaignTaskPriority;
  assignedRole: string;
  opsSourceType: CampaignTaskOpsSourceType;
  opsVisibility: CampaignTaskOpsVisibility;
  dueDays: number;
  /** Only create tasks from ladder when severity is watch or action. */
  creatableWhenOk?: boolean;
};

export const OPS_SIGNAL_TASK_DEFINITIONS: Record<string, OpsSignalTaskDefinition> = {
  "quiet-leaders": {
    title: (n) => `Coach ${n} quiet field leader${n === 1 ? "" : "s"}`,
    description: (n) =>
      `${n} leaders with no recent field log or roster activity — first coaching touch from leader command.`,
    taskType: "FIELD",
    priority: "HIGH",
    assignedRole: "FIELD_DIRECTOR",
    opsSourceType: "leader_gap",
    opsVisibility: "operators",
    dueDays: 3,
  },
  "my-five-gaps": {
    title: (n) => `Close My Five gaps (${n} leaders incomplete)`,
    description: (n) =>
      `${n} leaders below 5/5 on My Five — operators coach from leader dashboard and workbench.`,
    taskType: "VOLUNTEER",
    priority: "MEDIUM",
    assignedRole: "VOLUNTEER_COORDINATOR",
    opsSourceType: "leader_gap",
    opsVisibility: "operators",
    dueDays: 7,
  },
  "intake-pending": {
    title: (n) => `Clear volunteer intake queue (${n} pending)`,
    description: (n) =>
      `${n} website sign-ups awaiting review or placement — volunteer intake dashboard.`,
    taskType: "VOLUNTEER",
    priority: "HIGH",
    assignedRole: "VOLUNTEER_COORDINATOR",
    opsSourceType: "workflow_intake",
    opsVisibility: "operators",
    dueDays: 2,
  },
  "cm-intake-backlog": {
    title: (n) => `CM escalation: intake backlog (${n})`,
    description: (n) =>
      `${n} volunteer intakes still open — statewide escalation from operators hub to campaign manager.`,
    taskType: "ADMIN",
    priority: "URGENT",
    assignedRole: "CAMPAIGN_MANAGER",
    opsSourceType: "workflow_intake",
    opsVisibility: "admin",
    dueDays: 1,
  },
  "cm-quiet-leaders": {
    title: (n) => `CM escalation: quiet leaders (${n})`,
    description: (n) =>
      `${n} quiet field leaders statewide — assign county chairs or ACM follow-up from leader command.`,
    taskType: "FIELD",
    priority: "HIGH",
    assignedRole: "CAMPAIGN_MANAGER",
    opsSourceType: "leader_gap",
    opsVisibility: "admin",
    dueDays: 3,
  },
  "field-log": {
    title: () => "Seed field log activity statewide",
    description: () =>
      "Field log count is zero or low — leaders should log conversations and contacts from workbench field log.",
    taskType: "FIELD",
    priority: "MEDIUM",
    assignedRole: "FIELD_DIRECTOR",
    opsSourceType: "field_signal",
    opsVisibility: "operators",
    dueDays: 5,
    creatableWhenOk: true,
  },
};

export function opsSignalTaskDefinition(signalId: string): OpsSignalTaskDefinition | undefined {
  return OPS_SIGNAL_TASK_DEFINITIONS[signalId];
}
