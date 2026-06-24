"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import {
  completeOpsWorkItem,
  createLeaderGapTask,
  createOpsTaskFromSignal,
} from "@/lib/volunteers/ops-work-items";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";
import type { LeaderGapTaskType } from "@/lib/volunteers/ops-work-items/leader-task-definitions";

const OPS_WORK_PATHS = [
  "/election-plan/operators",
  "/election-plan/operators/leaders/command",
  "/election-plan/operators/leader-dashboard",
  "/election-plan/operators/my-work",
  "/election-plan/operators/projects",
  "/election-plan/operators/leaders/me",
  "/admin/campaign-manager-dashboard",
  "/admin/my-work",
  "/admin/projects",
] as const;

function revalidateOpsWorkSurfaces() {
  for (const path of OPS_WORK_PATHS) {
    revalidatePath(path);
  }
}

async function requireOpsWorkAction(): Promise<void> {
  const epSession = await requireElectionPlanApiSession();
  if (epSession) return;

  const leader = await tryLoadCurrentVolunteerLeader();
  if (leader) return;

  await requireAdminAction();
}

export async function createTaskFromSignalAction(formData: FormData) {
  await requireOpsWorkAction();

  const signalId = String(formData.get("signalId") ?? "").trim();
  const count = Number(formData.get("count") ?? 0);
  const tierId = String(formData.get("tierId") ?? "").trim();
  const severity = String(formData.get("severity") ?? "watch") as "ok" | "watch" | "action";
  const returnTo = String(formData.get("returnTo") ?? "/election-plan/operators/my-work").trim();

  if (!signalId) {
    redirect(`${returnTo}?opsWork=missing_signal`);
  }

  const result = await createOpsTaskFromSignal({
    signalId,
    count: Number.isFinite(count) ? count : 0,
    tierId,
    severity,
  });

  revalidateOpsWorkSurfaces();

  if (result.created) {
    redirect(`${returnTo}?opsWork=created&taskId=${result.task?.id ?? ""}`);
  }

  redirect(`${returnTo}?opsWork=${result.reason ?? "unknown"}`);
}

export async function createLeaderGapTaskAction(formData: FormData) {
  await requireOpsWorkAction();

  const gapType = String(formData.get("gapType") ?? "").trim() as LeaderGapTaskType;
  const leaderSlug = String(formData.get("leaderSlug") ?? "").trim();
  const leaderName = String(formData.get("leaderName") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim() || undefined;
  const returnTo = String(formData.get("returnTo") ?? "/election-plan/operators/leaders/command").trim();

  if (!gapType || !leaderSlug || !leaderName) {
    redirect(`${returnTo}?opsWork=missing_leader`);
  }

  const result = await createLeaderGapTask({
    gapType,
    leaderSlug,
    leaderName,
    detail,
  });

  revalidateOpsWorkSurfaces();

  if (result.created) {
    redirect(`${returnTo}?opsWork=leader_task_created`);
  }

  redirect(`${returnTo}?opsWork=${result.reason ?? "unknown"}`);
}

export async function completeOpsTaskAction(formData: FormData) {
  await requireOpsWorkAction();

  const taskId = String(formData.get("taskId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/election-plan/operators/my-work").trim();

  if (!taskId) {
    redirect(`${returnTo}?opsWork=missing_task`);
  }

  const ok = await completeOpsWorkItem(taskId);
  revalidateOpsWorkSurfaces();
  redirect(`${returnTo}?opsWork=${ok ? "completed" : "complete_failed"}`);
}
