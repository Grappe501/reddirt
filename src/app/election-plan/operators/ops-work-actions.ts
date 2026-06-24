"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import { completeOpsWorkItem, createOpsTaskFromSignal } from "@/lib/volunteers/ops-work-items";

const LADDER_PATHS = [
  "/election-plan/operators",
  "/election-plan/operators/leaders/command",
  "/election-plan/operators/leader-dashboard",
  "/admin/campaign-manager-dashboard",
  "/election-plan/operators/my-work",
] as const;

function revalidateOpsWorkSurfaces() {
  for (const path of LADDER_PATHS) {
    revalidatePath(path);
  }
}

async function requireOpsWorkAction(): Promise<void> {
  const epSession = await requireElectionPlanApiSession();
  if (epSession) return;
  redirect("/election-plan/operators?error=auth");
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

  const reason = result.reason ?? "unknown";
  redirect(`${returnTo}?opsWork=${reason}`);
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
