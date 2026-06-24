import {
  CampaignTaskStatus,
  type CampaignTask,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

import { OPEN_OPS_TASK_STATUSES, OPS_WORK_PACKET, opsSignalTaskDefinition } from "./signal-task-definitions";

export type CreateOpsTaskFromSignalInput = {
  signalId: string;
  count: number;
  tierId: string;
  severity: "ok" | "watch" | "action";
};

export type CreateOpsTaskFromSignalResult =
  | { created: false; reason: "missing_def" | "not_actionable" | "no_db"; task: null }
  | { created: false; reason: "already_open"; task: Pick<CampaignTask, "id" | "title" | "status"> }
  | { created: true; reason: "created"; task: Pick<CampaignTask, "id" | "title" | "status"> };

export async function createOpsTaskFromSignal(
  input: CreateOpsTaskFromSignalInput,
): Promise<CreateOpsTaskFromSignalResult> {
  if (!isDatabaseConfigured()) {
    return { created: false, reason: "no_db", task: null };
  }

  const def = opsSignalTaskDefinition(input.signalId);
  if (!def) {
    return { created: false, reason: "missing_def", task: null };
  }

  if (input.severity === "ok" && !def.creatableWhenOk) {
    return { created: false, reason: "not_actionable", task: null };
  }

  const existing = await prisma.campaignTask.findFirst({
    where: {
      opsSourceSignalId: input.signalId,
      status: { in: [...OPEN_OPS_TASK_STATUSES] },
    },
    select: { id: true, title: true, status: true },
  });

  if (existing) {
    return { created: false, reason: "already_open", task: existing };
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + def.dueDays);

  const task = await prisma.campaignTask.create({
    data: {
      title: def.title(input.count),
      description: def.description(input.count),
      taskType: def.taskType,
      priority: def.priority,
      status: CampaignTaskStatus.TODO,
      assignedRole: def.assignedRole,
      dueAt,
      opsSourceType: def.opsSourceType,
      opsSourceSignalId: input.signalId,
      opsVisibility: def.opsVisibility,
      opsMetadataJson: {
        packet: OPS_WORK_PACKET,
        signalId: input.signalId,
        signalCount: input.count,
        tierId: input.tierId,
        severity: input.severity,
      },
    },
    select: { id: true, title: true, status: true },
  });

  return { created: true, reason: "created", task };
}

export type OpenOpsTaskSummary = {
  id: string;
  title: string;
  status: string;
  signalId: string;
};

export async function loadOpenOpsTasksBySignalId(): Promise<Record<string, OpenOpsTaskSummary>> {
  if (!isDatabaseConfigured()) return {};

  try {
    const rows = await prisma.campaignTask.findMany({
      where: {
        opsSourceSignalId: { not: null },
        status: { in: [...OPEN_OPS_TASK_STATUSES] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        opsSourceSignalId: true,
      },
    });

    const map: Record<string, OpenOpsTaskSummary> = {};
    for (const row of rows) {
      if (!row.opsSourceSignalId) continue;
      map[row.opsSourceSignalId] = {
        id: row.id,
        title: row.title,
        status: row.status,
        signalId: row.opsSourceSignalId,
      };
    }
    return map;
  } catch {
    return {};
  }
}
