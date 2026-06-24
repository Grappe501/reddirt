import { WorkflowActionKind, Prisma, type WorkflowIntakeStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isVolunteerIntakeSource } from "@/lib/volunteers/load-volunteer-intake-dashboard";
import { readIntakePlacementMetadata } from "@/lib/volunteers/contact-spine/metadata";

import { onIntakeLifecycleStage } from "@/lib/volunteers/ops-automation";

import { createVolunteerLifecycleTask } from "./create-lifecycle-tasks";
import {
  canTransitionLifecycle,
  mergeLifecycleMetadata,
  readVolunteerLifecycleStage,
  workflowStatusForLifecycleStage,
  type VolunteerLifecycleStage,
} from "./stages";

export type ApplyLifecycleTransitionInput = {
  intakeId: string;
  toStage: VolunteerLifecycleStage;
  summary: string;
  metadataPatch?: Record<string, unknown>;
};

export type ApplyLifecycleTransitionResult =
  | { ok: true; fromStage: VolunteerLifecycleStage; toStage: VolunteerLifecycleStage }
  | { ok: false; reason: "not_found" | "invalid_transition" };

export async function applyVolunteerLifecycleTransition(
  input: ApplyLifecycleTransitionInput,
): Promise<ApplyLifecycleTransitionResult> {
  const row = await prisma.workflowIntake.findUnique({
    where: { id: input.intakeId },
    select: {
      id: true,
      status: true,
      source: true,
      metadata: true,
      title: true,
      submission: { select: { user: { select: { name: true } } } },
    },
  });

  if (!row || !isVolunteerIntakeSource(row.source)) {
    return { ok: false, reason: "not_found" };
  }

  const fromStage = readVolunteerLifecycleStage(row.metadata, row.status);
  if (!canTransitionLifecycle(fromStage, input.toStage)) {
    return { ok: false, reason: "invalid_transition" };
  }

  const toStatus = workflowStatusForLifecycleStage(input.toStage);
  const fromStatus = row.status;
  const metadata = mergeLifecycleMetadata(row.metadata, input.toStage, input.metadataPatch ?? {});

  await prisma.workflowIntake.update({
    where: { id: row.id },
    data: { status: toStatus, metadata: metadata as Prisma.InputJsonValue },
  });

  await prisma.workflowAction.create({
    data: {
      workflowIntakeId: row.id,
      actorUserId: null,
      kind: WorkflowActionKind.STATUS_CHANGE,
      fromStatus: fromStatus as WorkflowIntakeStatus,
      toStatus,
      summary: input.summary,
      metadata: {
        packet: "VOLUNTEER_LIFECYCLE_OPS",
        lifecycleFrom: fromStage,
        lifecycleTo: input.toStage,
      },
    },
  });

  const placement = readIntakePlacementMetadata(metadata);
  const volunteerName = row.submission?.user?.name ?? row.title;

  await createVolunteerLifecycleTask({
    intakeId: row.id,
    stage: input.toStage,
    volunteerName,
    placementLeaderSlug: placement.placementLeaderSlug ?? null,
  });

  await onIntakeLifecycleStage({
    intakeId: row.id,
    toStage: input.toStage,
    volunteerName,
    metadata,
  }).catch(() => undefined);

  return { ok: true, fromStage, toStage: input.toStage };
}
