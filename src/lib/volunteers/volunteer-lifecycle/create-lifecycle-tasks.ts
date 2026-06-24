import { CampaignTaskPriority, CampaignTaskStatus, CampaignTaskType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

import { LIFECYCLE_STAGE_LABELS, type VolunteerLifecycleStage, VOLUNTEER_LIFECYCLE_PACKET } from "./stages";

const OPEN = [CampaignTaskStatus.TODO, CampaignTaskStatus.IN_PROGRESS, CampaignTaskStatus.BLOCKED] as const;

type LifecycleTaskSpec = {
  title: string;
  description: string;
  taskType: CampaignTaskType;
  priority: CampaignTaskPriority;
  dueDays: number;
  assignedRole: string;
};

const TASKS_BY_STAGE: Partial<Record<VolunteerLifecycleStage, LifecycleTaskSpec>> = {
  IN_REVIEW: {
    title: "Review volunteer intake",
    description: "Confirm geography, skills, and preferred role before placement.",
    taskType: CampaignTaskType.OTHER,
    priority: CampaignTaskPriority.MEDIUM,
    dueDays: 2,
    assignedRole: "volunteer_ops",
  },
  PLACED: {
    title: "Confirm volunteer placement",
    description: "Verify leader or workbench assignment and notify placement leader.",
    taskType: CampaignTaskType.OTHER,
    priority: CampaignTaskPriority.MEDIUM,
    dueDays: 3,
    assignedRole: "volunteer_ops",
  },
  ONBOARDING: {
    title: "Send volunteer onboarding welcome",
    description: "Share workbench path, team expectations, and first-week checklist.",
    taskType: CampaignTaskType.OTHER,
    priority: CampaignTaskPriority.HIGH,
    dueDays: 2,
    assignedRole: "volunteer_ops",
  },
  ACTIVE: {
    title: "First-week volunteer check-in",
    description: "Confirm the volunteer completed first actions and has workbench access.",
    taskType: CampaignTaskType.OTHER,
    priority: CampaignTaskPriority.MEDIUM,
    dueDays: 7,
    assignedRole: "volunteer_ops",
  },
  LEADER_CANDIDATE: {
    title: "Leader candidate coaching touch",
    description: "Schedule a coaching conversation for potential county or lane leadership.",
    taskType: CampaignTaskType.OTHER,
    priority: CampaignTaskPriority.MEDIUM,
    dueDays: 14,
    assignedRole: "campaign_manager",
  },
};

function lifecycleTaskSignalId(intakeId: string, stage: VolunteerLifecycleStage): string {
  return `lifecycle:${intakeId}:${stage}`;
}

export async function createVolunteerLifecycleTask(input: {
  intakeId: string;
  stage: VolunteerLifecycleStage;
  volunteerName?: string | null;
  placementLeaderSlug?: string | null;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;

  const spec = TASKS_BY_STAGE[input.stage];
  if (!spec) return;

  const signalId = lifecycleTaskSignalId(input.intakeId, input.stage);
  const existing = await prisma.campaignTask.findFirst({
    where: { opsSourceSignalId: signalId, status: { in: [...OPEN] } },
    select: { id: true },
  });
  if (existing) return;

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + spec.dueDays);

  const nameSuffix = input.volunteerName?.trim() ? ` — ${input.volunteerName.trim()}` : "";

  await prisma.campaignTask.create({
    data: {
      title: `${spec.title}${nameSuffix}`,
      description: spec.description,
      taskType: spec.taskType,
      priority: spec.priority,
      status: CampaignTaskStatus.TODO,
      assignedRole: spec.assignedRole,
      dueAt,
      leaderSlug: input.placementLeaderSlug ?? undefined,
      opsSourceType: "workflow_intake",
      opsSourceSignalId: signalId,
      opsVisibility: "operators",
      opsMetadataJson: {
        packet: VOLUNTEER_LIFECYCLE_PACKET,
        workflowIntakeId: input.intakeId,
        lifecycleStage: input.stage,
        lifecycleLabel: LIFECYCLE_STAGE_LABELS[input.stage],
      },
    },
  });
}
