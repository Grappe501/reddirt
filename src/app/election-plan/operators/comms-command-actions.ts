"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MessageStudioDraftStatus } from "@prisma/client";

import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import { patchMessageStudioDraftWorkflow } from "@/lib/email-command-center/message-studio-drafts";
import { canAccessCommsCommand } from "@/lib/volunteers/leader-roster";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

const DASHBOARD_PATH = "/election-plan/operators/comms-command";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function requireCommsCommandAction(): Promise<void> {
  const epSession = await requireElectionPlanApiSession();
  if (epSession) return;

  const leader = await tryLoadCurrentVolunteerLeader();
  if (leader && canAccessCommsCommand(leader)) return;

  redirect(`${DASHBOARD_PATH}?error=auth`);
}

async function transitionDraftStatus(id: string, status: MessageStudioDraftStatus, notice: string) {
  if (!id) redirect(`${DASHBOARD_PATH}?error=id`);
  try {
    await patchMessageStudioDraftWorkflow({ id, status, updatedByUserId: null });
  } catch {
    redirect(`${DASHBOARD_PATH}?error=not-found`);
  }
  revalidatePath(DASHBOARD_PATH);
  redirect(`${DASHBOARD_PATH}?draft=${id}&notice=${notice}`);
}

export async function markCommsDraftInReviewAction(fd: FormData): Promise<void> {
  await requireCommsCommandAction();
  const id = trim(fd, "draftId");
  await transitionDraftStatus(id, "IN_REVIEW", "in-review");
}

export async function markCommsDraftNeedsEditsAction(fd: FormData): Promise<void> {
  await requireCommsCommandAction();
  const id = trim(fd, "draftId");
  await transitionDraftStatus(id, "NEEDS_REVIEW", "needs-edits");
}

export async function markCommsDraftApprovedAction(fd: FormData): Promise<void> {
  await requireCommsCommandAction();
  const id = trim(fd, "draftId");
  await transitionDraftStatus(id, "APPROVED_FOR_SEND_GOVERNANCE", "approved");
}
