import { CampaignTaskStatus, type CampaignTask } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { OPEN_OPS_TASK_STATUSES } from "@/lib/volunteers/ops-work-items/signal-task-definitions";

import { OPS_AUTOMATION_PACKET, type AutomationTaskSpec, type OpsAutomationTrigger } from "./definitions";

export type CreateAutomationTaskInput = {
  trigger: OpsAutomationTrigger;
  signalKey: string;
  spec: AutomationTaskSpec;
};

export type CreateAutomationTaskResult =
  | { created: false; reason: "no_db" | "already_open"; task: Pick<CampaignTask, "id" | "title" | "status"> | null }
  | { created: true; reason: "created"; task: Pick<CampaignTask, "id" | "title" | "status"> };

export async function createAutomationTask(
  input: CreateAutomationTaskInput,
): Promise<CreateAutomationTaskResult> {
  if (!isDatabaseConfigured()) {
    return { created: false, reason: "no_db", task: null };
  }

  const signalId = `automation:${input.trigger}:${input.signalKey}`;

  const existing = await prisma.campaignTask.findFirst({
    where: {
      opsSourceSignalId: signalId,
      status: { in: [...OPEN_OPS_TASK_STATUSES] },
    },
    select: { id: true, title: true, status: true },
  });

  if (existing) {
    return { created: false, reason: "already_open", task: existing };
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + input.spec.dueDays);

  const task = await prisma.campaignTask.create({
    data: {
      title: input.spec.title,
      description: input.spec.description,
      taskType: input.spec.taskType,
      priority: input.spec.priority,
      status: CampaignTaskStatus.TODO,
      assignedRole: input.spec.assignedRole,
      dueAt,
      leaderSlug: input.spec.leaderSlug ?? undefined,
      parentTaskId: input.spec.parentTaskId ?? undefined,
      laneId: input.spec.laneId ?? undefined,
      countyId: input.spec.countyId ?? undefined,
      eventId: input.spec.eventId ?? undefined,
      opsSourceType: input.spec.opsSourceType,
      opsSourceSignalId: signalId,
      opsVisibility: input.spec.opsVisibility,
      opsMetadataJson: {
        packet: OPS_AUTOMATION_PACKET,
        trigger: input.trigger,
        signalKey: input.signalKey,
        ...input.spec.metadata,
      },
    },
    select: { id: true, title: true, status: true },
  });

  return { created: true, reason: "created", task };
}
