"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CampaignProjectStatus, CampaignTaskStatus } from "@prisma/client";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import {
  advanceProjectTaskStatus,
  attachOpenOpsTaskToProject,
  createCampaignProject,
  createProjectTask,
  updateCampaignProjectStatus,
} from "@/lib/volunteers/campaign-projects";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

const PROJECT_PATHS = [
  "/election-plan/operators/projects",
  "/admin/projects",
  "/election-plan/operators/my-work",
  "/admin/my-work",
  "/admin/campaign-manager-dashboard",
] as const;

function revalidateProjectSurfaces() {
  for (const path of PROJECT_PATHS) {
    revalidatePath(path);
  }
}

async function requireProjectOpsAction(): Promise<void> {
  const epSession = await requireElectionPlanApiSession();
  if (epSession) return;

  const leader = await tryLoadCurrentVolunteerLeader();
  if (leader) return;

  await requireAdminAction();
}

function trim(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function createCampaignProjectAction(fd: FormData): Promise<void> {
  await requireProjectOpsAction();

  const title = trim(fd, "title");
  const templateKey = trim(fd, "templateKey") || null;
  const returnTo = trim(fd, "returnTo") || "/election-plan/operators/projects";
  const laneId = trim(fd, "laneId") || null;
  const countySlug = trim(fd, "countySlug") || null;

  const result = await createCampaignProject({
    title,
    templateKey,
    laneId,
    countySlug,
  });

  revalidateProjectSurfaces();
  if (!result.ok) {
    redirect(`${returnTo}?project=no_db`);
  }
  redirect(`${returnTo.replace(/\/$/, "")}/${result.slug}?project=created`);
}

export async function updateCampaignProjectStatusAction(fd: FormData): Promise<void> {
  await requireProjectOpsAction();

  const slug = trim(fd, "slug");
  const status = trim(fd, "status") as CampaignProjectStatus;
  const returnTo = trim(fd, "returnTo") || `/election-plan/operators/projects/${slug}`;

  if (!slug || !status) redirect(`${returnTo}?project=missing`);

  await updateCampaignProjectStatus(slug, status);
  revalidateProjectSurfaces();
  redirect(`${returnTo}?project=updated`);
}

export async function createProjectTaskAction(fd: FormData): Promise<void> {
  await requireProjectOpsAction();

  const projectSlug = trim(fd, "projectSlug");
  const title = trim(fd, "title");
  const returnTo = trim(fd, "returnTo") || `/election-plan/operators/projects/${projectSlug}`;

  if (!projectSlug || !title) redirect(`${returnTo}?project=missing`);

  const ok = await createProjectTask({
    projectSlug,
    title,
    description: trim(fd, "description") || undefined,
    assignedRole: trim(fd, "assignedRole") || undefined,
    dueDays: Number(trim(fd, "dueDays")) || 7,
  });

  revalidateProjectSurfaces();
  redirect(`${returnTo}?project=${ok ? "task_created" : "task_failed"}`);
}

export async function advanceProjectTaskStatusAction(fd: FormData): Promise<void> {
  await requireProjectOpsAction();

  const taskId = trim(fd, "taskId");
  const status = trim(fd, "status") as CampaignTaskStatus;
  const returnTo = trim(fd, "returnTo") || "/election-plan/operators/projects";

  if (!taskId || !status) redirect(`${returnTo}?project=missing`);

  await advanceProjectTaskStatus(taskId, status);
  revalidateProjectSurfaces();
  redirect(`${returnTo}?project=task_updated`);
}

export async function attachTaskToProjectAction(fd: FormData): Promise<void> {
  await requireProjectOpsAction();

  const taskId = trim(fd, "taskId");
  const projectSlug = trim(fd, "projectSlug");
  const returnTo = trim(fd, "returnTo") || `/election-plan/operators/projects/${projectSlug}`;

  if (!taskId || !projectSlug) redirect(`${returnTo}?project=missing`);

  const ok = await attachOpenOpsTaskToProject(taskId, projectSlug);
  revalidateProjectSurfaces();
  redirect(`${returnTo}?project=${ok ? "attached" : "attach_failed"}`);
}
