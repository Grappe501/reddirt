import { CampaignTaskStatus, type CampaignTask } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

import { OPEN_OPS_TASK_STATUSES } from "./signal-task-definitions";
import {
  OPS_LEADER_WORK_PACKET,
  leaderGapTaskDefinition,
  type LeaderGapTaskType,
} from "./leader-task-definitions";

export type CreateLeaderGapTaskInput = {
  gapType: LeaderGapTaskType;
  leaderSlug: string;
  leaderName: string;
  detail?: string;
};

export type CreateLeaderGapTaskResult =
  | { created: false; reason: "missing_def" | "no_db"; task: null }
  | { created: false; reason: "already_open"; task: Pick<CampaignTask, "id" | "title" | "status"> }
  | { created: true; reason: "created"; task: Pick<CampaignTask, "id" | "title" | "status"> };

export async function createLeaderGapTask(
  input: CreateLeaderGapTaskInput,
): Promise<CreateLeaderGapTaskResult> {
  if (!isDatabaseConfigured()) {
    return { created: false, reason: "no_db", task: null };
  }

  const def = leaderGapTaskDefinition(input.gapType);
  if (!def) {
    return { created: false, reason: "missing_def", task: null };
  }

  const signalId = def.signalKey(input.leaderSlug);

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
  dueAt.setDate(dueAt.getDate() + def.dueDays);

  const task = await prisma.campaignTask.create({
    data: {
      title: def.title(input.leaderName, input.detail),
      description: def.description(input.leaderName, input.detail),
      taskType: def.taskType,
      priority: def.priority,
      status: CampaignTaskStatus.TODO,
      assignedRole: def.assignedRole,
      dueAt,
      opsSourceType: def.opsSourceType,
      opsSourceSignalId: signalId,
      leaderSlug: input.leaderSlug,
      opsVisibility: "leader",
      opsMetadataJson: {
        packet: OPS_LEADER_WORK_PACKET,
        gapType: input.gapType,
        leaderSlug: input.leaderSlug,
        leaderName: input.leaderName,
      },
    },
    select: { id: true, title: true, status: true },
  });

  return { created: true, reason: "created", task };
}

export async function loadOpenLeaderTasksBySlug(): Promise<
  Record<string, { id: string; title: string; signalId: string }>
> {
  if (!isDatabaseConfigured()) return {};

  try {
    const rows = await prisma.campaignTask.findMany({
      where: {
        leaderSlug: { not: null },
        status: { in: [...OPEN_OPS_TASK_STATUSES] },
      },
      select: {
        id: true,
        title: true,
        leaderSlug: true,
        opsSourceSignalId: true,
      },
    });

    const map: Record<string, { id: string; title: string; signalId: string }> = {};
    for (const row of rows) {
      if (!row.leaderSlug || !row.opsSourceSignalId) continue;
      map[row.leaderSlug] = {
        id: row.id,
        title: row.title,
        signalId: row.opsSourceSignalId,
      };
    }
    return map;
  } catch {
    return {};
  }
}
