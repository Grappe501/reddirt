"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WorkflowActionKind, WorkflowIntakeStatus } from "@prisma/client";

import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import { prisma } from "@/lib/db";
import { canAccessVolunteerIntakeOps } from "@/lib/volunteers/leader-roster";
import { isVolunteerIntakeSource } from "@/lib/volunteers/load-volunteer-intake-dashboard";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";

const DASHBOARD_PATH = "/election-plan/operators/volunteer-intake";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function requireVolunteerIntakeOpsAction(): Promise<void> {
  const epSession = await requireElectionPlanApiSession();
  if (epSession) return;

  const leader = await tryLoadCurrentVolunteerLeader();
  if (leader && canAccessVolunteerIntakeOps(leader)) return;

  redirect(`${DASHBOARD_PATH}?error=auth`);
}

async function logIntakeAction(input: {
  workflowIntakeId: string;
  kind: WorkflowActionKind;
  fromStatus: WorkflowIntakeStatus | null;
  toStatus: WorkflowIntakeStatus | null;
  summary: string;
}) {
  await prisma.workflowAction.create({
    data: {
      workflowIntakeId: input.workflowIntakeId,
      actorUserId: null,
      kind: input.kind,
      fromStatus: input.fromStatus ?? undefined,
      toStatus: input.toStatus ?? undefined,
      summary: input.summary,
      metadata: { packet: "VOLUNTEER_INTAKE_OPS" },
    },
  });
}

async function loadVolunteerIntake(id: string) {
  return prisma.workflowIntake.findUnique({
    where: { id },
    select: { id: true, status: true, source: true },
  });
}

async function transitionIntakeStatus(id: string, toStatus: WorkflowIntakeStatus, summary: string) {
  const row = await loadVolunteerIntake(id);
  if (!row || !isVolunteerIntakeSource(row.source)) {
    redirect(`${DASHBOARD_PATH}?error=not-found`);
  }
  const from = row.status;
  await prisma.workflowIntake.update({ where: { id }, data: { status: toStatus } });
  await logIntakeAction({
    workflowIntakeId: id,
    kind: "STATUS_CHANGE",
    fromStatus: from,
    toStatus,
    summary,
  });
  revalidatePath(DASHBOARD_PATH);
  redirect(`${DASHBOARD_PATH}?intake=${id}&notice=updated`);
}

export async function markVolunteerIntakeInReviewAction(fd: FormData): Promise<void> {
  await requireVolunteerIntakeOpsAction();
  const id = trim(fd, "intakeId");
  if (!id) redirect(`${DASHBOARD_PATH}?error=id`);
  await transitionIntakeStatus(id, "IN_REVIEW", "Marked in review (Volunteer intake ops).");
}

export async function markVolunteerIntakeAwaitingInfoAction(fd: FormData): Promise<void> {
  await requireVolunteerIntakeOpsAction();
  const id = trim(fd, "intakeId");
  if (!id) redirect(`${DASHBOARD_PATH}?error=id`);
  await transitionIntakeStatus(id, "AWAITING_INFO", "Marked awaiting info (Volunteer intake ops).");
}

export async function markVolunteerIntakeActivatedAction(fd: FormData): Promise<void> {
  await requireVolunteerIntakeOpsAction();
  const id = trim(fd, "intakeId");
  if (!id) redirect(`${DASHBOARD_PATH}?error=id`);
  await transitionIntakeStatus(id, "CONVERTED", "Marked activated — volunteer placement confirmed.");
}

export async function markVolunteerIntakeDeclinedAction(fd: FormData): Promise<void> {
  await requireVolunteerIntakeOpsAction();
  const id = trim(fd, "intakeId");
  if (!id) redirect(`${DASHBOARD_PATH}?error=id`);
  await transitionIntakeStatus(id, "DECLINED", "Declined from volunteer intake queue.");
}
