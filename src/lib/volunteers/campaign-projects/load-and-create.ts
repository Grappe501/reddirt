import {
  CampaignProjectOwnerKind,
  CampaignProjectStatus,
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";

import {
  CAMPAIGN_PROJECT_PACKET,
  KANBAN_COLUMNS,
  projectTemplateByKey,
  slugifyProjectTitle,
  type CampaignProjectTemplate,
} from "./definitions";

export type CampaignProjectSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: CampaignProjectStatus;
  ownerKind: CampaignProjectOwnerKind;
  ownerRole: string | null;
  laneId: string | null;
  countySlug: string | null;
  leaderSlug: string | null;
  targetStartAt: string | null;
  targetEndAt: string | null;
  openTaskCount: number;
  doneTaskCount: number;
  href: string;
};

export type CampaignProjectTaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: CampaignTaskStatus;
  priority: string;
  dueAt: string | null;
  assignedRole: string | null;
  leaderSlug: string | null;
};

export type CampaignProjectBoardPayload = {
  dbAvailable: boolean;
  project: CampaignProjectSummary | null;
  columns: Array<{ status: CampaignTaskStatus; label: string; tasks: CampaignProjectTaskRow[] }>;
  upcomingDue: CampaignProjectTaskRow[];
};

export type CampaignProjectListPayload = {
  dbAvailable: boolean;
  projects: CampaignProjectSummary[];
  templates: CampaignProjectTemplate[];
};

function mapSummary(
  row: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    status: CampaignProjectStatus;
    ownerKind: CampaignProjectOwnerKind;
    ownerRole: string | null;
    laneId: string | null;
    countySlug: string | null;
    leaderSlug: string | null;
    targetStartAt: Date | null;
    targetEndAt: Date | null;
    tasks: Array<{ status: CampaignTaskStatus }>;
  },
  hrefPrefix: string,
): CampaignProjectSummary {
  const openTaskCount = row.tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length;
  const doneTaskCount = row.tasks.filter((t) => t.status === "DONE").length;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    status: row.status,
    ownerKind: row.ownerKind,
    ownerRole: row.ownerRole,
    laneId: row.laneId,
    countySlug: row.countySlug,
    leaderSlug: row.leaderSlug,
    targetStartAt: row.targetStartAt?.toISOString() ?? null,
    targetEndAt: row.targetEndAt?.toISOString() ?? null,
    openTaskCount,
    doneTaskCount,
    href: `${hrefPrefix}/${row.slug}`,
  };
}

export async function loadCampaignProjectList(
  hrefPrefix = "/election-plan/operators/projects",
): Promise<CampaignProjectListPayload> {
  const { CAMPAIGN_PROJECT_TEMPLATES } = await import("./definitions");
  const empty: CampaignProjectListPayload = {
    dbAvailable: false,
    projects: [],
    templates: CAMPAIGN_PROJECT_TEMPLATES,
  };
  if (!isDatabaseConfigured()) return empty;

  try {
    const rows = await prisma.campaignProject.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: [{ status: "asc" }, { targetEndAt: "asc" }, { updatedAt: "desc" }],
      take: 40,
      include: { tasks: { select: { status: true } } },
    });
    return {
      dbAvailable: true,
      projects: rows.map((r) => mapSummary(r, hrefPrefix)),
      templates: CAMPAIGN_PROJECT_TEMPLATES,
    };
  } catch {
    return { ...empty, dbAvailable: true };
  }
}

export async function loadCampaignProjectBoard(
  slug: string,
  hrefPrefix = "/election-plan/operators/projects",
): Promise<CampaignProjectBoardPayload> {
  const empty: CampaignProjectBoardPayload = {
    dbAvailable: false,
    project: null,
    columns: KANBAN_COLUMNS.map((c) => ({ ...c, tasks: [] })),
    upcomingDue: [],
  };
  if (!isDatabaseConfigured()) return empty;

  try {
    const row = await prisma.campaignProject.findUnique({
      where: { slug },
      include: {
        tasks: {
          orderBy: [{ dueAt: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueAt: true,
            assignedRole: true,
            leaderSlug: true,
          },
        },
      },
    });
    if (!row) return { ...empty, dbAvailable: true };

    const tasks: CampaignProjectTaskRow[] = row.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueAt: t.dueAt?.toISOString() ?? null,
      assignedRole: t.assignedRole,
      leaderSlug: t.leaderSlug,
    }));

    const columns = KANBAN_COLUMNS.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.status === col.status),
    }));

    const upcomingDue = tasks
      .filter((t) => t.status !== "DONE" && t.status !== "CANCELLED" && t.dueAt)
      .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""))
      .slice(0, 12);

    return {
      dbAvailable: true,
      project: mapSummary({ ...row, tasks: row.tasks.map((t) => ({ status: t.status })) }, hrefPrefix),
      columns,
      upcomingDue,
    };
  } catch {
    return { ...empty, dbAvailable: true };
  }
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || "project";
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await prisma.campaignProject.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) return candidate;
    n += 1;
  }
}

export type CreateCampaignProjectInput = {
  title: string;
  description?: string | null;
  templateKey?: string | null;
  laneId?: string | null;
  countySlug?: string | null;
  leaderSlug?: string | null;
  ownerKind?: CampaignProjectOwnerKind;
  ownerRole?: string | null;
  targetEndDays?: number;
};

export async function createCampaignProject(
  input: CreateCampaignProjectInput,
): Promise<{ ok: true; slug: string } | { ok: false; reason: "no_db" }> {
  if (!isDatabaseConfigured()) return { ok: false, reason: "no_db" };

  const template = input.templateKey ? projectTemplateByKey(input.templateKey) : undefined;
  const title = input.title.trim() || template?.title || "Campaign project";
  const description = input.description?.trim() || template?.description || null;
  const slug = await uniqueSlug(slugifyProjectTitle(title));

  const targetEndAt = new Date();
  targetEndAt.setDate(targetEndAt.getDate() + (input.targetEndDays ?? 21));

  const project = await prisma.campaignProject.create({
    data: {
      slug,
      title,
      description,
      status: "ACTIVE",
      ownerKind: input.ownerKind ?? template?.ownerKind ?? "lane_lead",
      ownerRole: input.ownerRole ?? template?.ownerRole ?? null,
      laneId: input.laneId ?? template?.laneId ?? null,
      countySlug: input.countySlug ?? template?.countySlug ?? null,
      leaderSlug: input.leaderSlug ?? null,
      targetStartAt: new Date(),
      targetEndAt,
      metadataJson: {
        packet: CAMPAIGN_PROJECT_PACKET,
        templateKey: input.templateKey ?? null,
      } as Prisma.InputJsonValue,
    },
  });

  const taskDefs = template?.defaultTasks ?? [];
  for (const def of taskDefs) {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + def.dueDays);
    await prisma.campaignTask.create({
      data: {
        title: def.title,
        description: def.description,
        taskType: CampaignTaskType.OTHER,
        priority: CampaignTaskPriority.MEDIUM,
        status: CampaignTaskStatus.TODO,
        assignedRole: def.assignedRole,
        dueAt,
        campaignProjectId: project.id,
        opsSourceType: "lane_ops",
        opsVisibility: "operators",
        opsMetadataJson: {
          packet: CAMPAIGN_PROJECT_PACKET,
          campaignProjectSlug: slug,
        } as Prisma.InputJsonValue,
        laneId: project.laneId,
        leaderSlug: project.leaderSlug,
      },
    });
  }

  return { ok: true, slug };
}

export async function updateCampaignProjectStatus(
  slug: string,
  status: CampaignProjectStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    await prisma.campaignProject.update({ where: { slug }, data: { status } });
    return true;
  } catch {
    return false;
  }
}

export async function attachOpenOpsTaskToProject(taskId: string, projectSlug: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    const project = await prisma.campaignProject.findUnique({ where: { slug: projectSlug }, select: { id: true } });
    if (!project) return false;
    await prisma.campaignTask.update({
      where: { id: taskId },
      data: { campaignProjectId: project.id },
    });
    return true;
  } catch {
    return false;
  }
}

export async function createProjectTask(input: {
  projectSlug: string;
  title: string;
  description?: string;
  dueDays?: number;
  assignedRole?: string;
}): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    const project = await prisma.campaignProject.findUnique({
      where: { slug: input.projectSlug },
      select: { id: true, laneId: true, leaderSlug: true },
    });
    if (!project) return false;
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + (input.dueDays ?? 7));
    await prisma.campaignTask.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        taskType: CampaignTaskType.OTHER,
        priority: CampaignTaskPriority.MEDIUM,
        status: CampaignTaskStatus.TODO,
        assignedRole: input.assignedRole ?? "volunteer_ops",
        dueAt,
        campaignProjectId: project.id,
        laneId: project.laneId,
        leaderSlug: project.leaderSlug,
        opsSourceType: "manual",
        opsVisibility: "operators",
        opsMetadataJson: { packet: CAMPAIGN_PROJECT_PACKET } as Prisma.InputJsonValue,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function advanceProjectTaskStatus(
  taskId: string,
  status: CampaignTaskStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    await prisma.campaignTask.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === "DONE" ? new Date() : null,
      },
    });
    return true;
  } catch {
    return false;
  }
}
