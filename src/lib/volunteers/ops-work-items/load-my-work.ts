import { CampaignTaskStatus, type CampaignTaskOpsVisibility } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

import { OPEN_OPS_TASK_STATUSES } from "./signal-task-definitions";

export type OpsWorkItemRow = {
  id: string;
  title: string;
  description: string | null;
  status: CampaignTaskStatus;
  priority: string;
  assignedRole: string | null;
  dueAt: string | null;
  leaderSlug: string | null;
  opsVisibility: CampaignTaskOpsVisibility | null;
  signalId: string | null;
  href: string;
};

export type OpsMyWorkPayload = {
  dbAvailable: boolean;
  items: OpsWorkItemRow[];
};

function taskHref(task: OpsWorkItemRow): string {
  if (task.opsVisibility === "admin") return "/admin/tasks";
  return "/election-plan/operators/my-work";
}

export async function loadOpsMyWork(input: {
  visibility?: CampaignTaskOpsVisibility[];
  leaderSlug?: string | null;
  limit?: number;
}): Promise<OpsMyWorkPayload> {
  const empty: OpsMyWorkPayload = { dbAvailable: false, items: [] };
  if (!isDatabaseConfigured()) return empty;

  const limit = input.limit ?? 30;
  const visibilities = input.visibility ?? ["operators", "admin", "leader"];

  try {
    const where = {
      status: { in: [...OPEN_OPS_TASK_STATUSES] },
      opsSourceSignalId: { not: null },
      OR: [
        { opsVisibility: { in: visibilities } },
        ...(input.leaderSlug ? [{ leaderSlug: input.leaderSlug }] : []),
      ],
    };

    const rows = await prisma.campaignTask.findMany({
      where,
      orderBy: [{ dueAt: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        assignedRole: true,
        dueAt: true,
        leaderSlug: true,
        opsVisibility: true,
        opsSourceSignalId: true,
      },
    });

    const items: OpsWorkItemRow[] = rows.map((r) => {
      const row: OpsWorkItemRow = {
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        priority: r.priority,
        assignedRole: r.assignedRole,
        dueAt: r.dueAt?.toISOString() ?? null,
        leaderSlug: r.leaderSlug,
        opsVisibility: r.opsVisibility,
        signalId: r.opsSourceSignalId,
        href: "",
      };
      row.href = taskHref(row);
      return row;
    });

    return { dbAvailable: true, items };
  } catch {
    return { ...empty, dbAvailable: true };
  }
}

export async function completeOpsWorkItem(taskId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    await prisma.campaignTask.update({
      where: { id: taskId },
      data: {
        status: CampaignTaskStatus.DONE,
        completedAt: new Date(),
      },
    });
    return true;
  } catch {
    return false;
  }
}
