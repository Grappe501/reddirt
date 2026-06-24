"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WorkflowActionKind, WorkflowIntakeStatus, Prisma } from "@prisma/client";

import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import { prisma } from "@/lib/db";
import { promoteVolunteerIntakeContactSpine } from "@/lib/volunteers/contact-spine";
import { canAccessVolunteerIntakeOps } from "@/lib/volunteers/leader-roster";
import { isVolunteerIntakeSource } from "@/lib/volunteers/load-volunteer-intake-dashboard";
import { tryLoadCurrentVolunteerLeader } from "@/lib/volunteers/load-current-leader";
import {
  applyVolunteerLifecycleTransition,
  mergeLifecycleMetadata,
  type VolunteerLifecycleStage,
} from "@/lib/volunteers/volunteer-lifecycle";

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
  metadata?: Record<string, unknown>;
}) {
  await prisma.workflowAction.create({
    data: {
      workflowIntakeId: input.workflowIntakeId,
      actorUserId: null,
      kind: input.kind,
      fromStatus: input.fromStatus ?? undefined,
      toStatus: input.toStatus ?? undefined,
      summary: input.summary,
      metadata: { packet: "VOLUNTEER_INTAKE_OPS", ...input.metadata },
    },
  });
}

async function loadVolunteerIntake(id: string) {
  return prisma.workflowIntake.findUnique({
    where: { id },
    select: { id: true, status: true, source: true, metadata: true, relationalContactId: true },
  });
}

async function runLifecycleAction(fd: FormData, toStage: VolunteerLifecycleStage, summary: string) {
  await requireVolunteerIntakeOpsAction();
  const id = trim(fd, "intakeId");
  if (!id) redirect(`${DASHBOARD_PATH}?error=id`);

  const result = await applyVolunteerLifecycleTransition({ intakeId: id, toStage, summary });
  if (!result.ok) {
    redirect(`${DASHBOARD_PATH}?intake=${id}&error=${result.reason === "invalid_transition" ? "transition" : "not-found"}`);
  }

  revalidatePath(DASHBOARD_PATH);
  redirect(`${DASHBOARD_PATH}?intake=${id}&notice=lifecycle`);
}

export async function markVolunteerIntakeInReviewAction(fd: FormData): Promise<void> {
  await runLifecycleAction(fd, "IN_REVIEW", "Marked in review (volunteer lifecycle).");
}

export async function markVolunteerIntakeAwaitingInfoAction(fd: FormData): Promise<void> {
  await requireVolunteerIntakeOpsAction();
  const id = trim(fd, "intakeId");
  if (!id) redirect(`${DASHBOARD_PATH}?error=id`);

  const row = await loadVolunteerIntake(id);
  if (!row || !isVolunteerIntakeSource(row.source)) {
    redirect(`${DASHBOARD_PATH}?error=not-found`);
  }

  const from = row.status;
  const metadata = mergeLifecycleMetadata(row.metadata, "IN_REVIEW", { awaitingInfo: true });
  await prisma.workflowIntake.update({
    where: { id },
    data: { status: "AWAITING_INFO", metadata: metadata as Prisma.InputJsonValue },
  });
  await logIntakeAction({
    workflowIntakeId: id,
    kind: "STATUS_CHANGE",
    fromStatus: from,
    toStatus: "AWAITING_INFO",
    summary: "Marked awaiting info (volunteer lifecycle).",
    metadata: { lifecycleStage: "IN_REVIEW" },
  });
  revalidatePath(DASHBOARD_PATH);
  redirect(`${DASHBOARD_PATH}?intake=${id}&notice=updated`);
}

export async function markVolunteerIntakePlacedAction(fd: FormData): Promise<void> {
  await runLifecycleAction(fd, "PLACED", "Marked placed — leader or workbench assignment confirmed.");
}

export async function markVolunteerIntakeOnboardingAction(fd: FormData): Promise<void> {
  await runLifecycleAction(fd, "ONBOARDING", "Marked onboarding — welcome path in progress.");
}

export async function markVolunteerIntakeActivatedAction(fd: FormData): Promise<void> {
  await runLifecycleAction(fd, "ACTIVE", "Marked active — volunteer cleared for field work.");
}

export async function markVolunteerLeaderCandidateAction(fd: FormData): Promise<void> {
  await runLifecycleAction(fd, "LEADER_CANDIDATE", "Flagged as leader candidate for coaching follow-up.");
}

export async function markVolunteerIntakeDeclinedAction(fd: FormData): Promise<void> {
  await runLifecycleAction(fd, "ARCHIVED", "Declined from volunteer intake queue.");
}

/** Place with a leader, create RelationalContact + team roster row, advance to onboarding. */
export async function placeAndActivateVolunteerIntakeAction(fd: FormData): Promise<void> {
  await requireVolunteerIntakeOpsAction();
  const id = trim(fd, "intakeId");
  const placementLeaderSlug = trim(fd, "placementLeaderSlug");
  if (!id || !placementLeaderSlug) {
    redirect(`${DASHBOARD_PATH}?intake=${id || ""}&error=placement`);
  }

  const row = await loadVolunteerIntake(id);
  if (!row || !isVolunteerIntakeSource(row.source)) {
    redirect(`${DASHBOARD_PATH}?error=not-found`);
  }

  try {
    const result = await promoteVolunteerIntakeContactSpine({
      intakeId: id,
      placementLeaderSlug,
      addToTeamRoster: fd.get("addToTeamRoster") !== "off",
    });

    const placed = await applyVolunteerLifecycleTransition({
      intakeId: id,
      toStage: "ONBOARDING",
      summary: `Placed with ${placementLeaderSlug} · CRM ${result.relationalContactId}`,
      metadataPatch: {
        placementLeaderSlug,
        relationalContactId: result.relationalContactId,
      },
    });

    if (!placed.ok) {
      await logIntakeAction({
        workflowIntakeId: id,
        kind: "STATUS_CHANGE",
        fromStatus: row.status,
        toStatus: "CONVERTED",
        summary: `Placed with ${placementLeaderSlug} · CRM ${result.relationalContactId}`,
      });
    }
  } catch {
    redirect(`${DASHBOARD_PATH}?intake=${id}&error=spine`);
  }

  revalidatePath(DASHBOARD_PATH);
  redirect(`${DASHBOARD_PATH}?intake=${id}&notice=placed`);
}
