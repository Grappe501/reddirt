"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { updateMediaFindingReviewStatus } from "@/lib/intelligence/publicMediaReviewWorkflow";
import {
  dismissFindingAfterReview,
  markFindingNeedsMoreReview,
  promoteFindingToCitationCandidateDraft,
  promoteFindingToRetrievalTaskDraft,
} from "@/lib/intelligence/mediaFindingPromotionWorkflow";
import { runDryRunPublicMediaIntake } from "@/lib/intelligence/scheduledPublicMediaIntake";
import type { MediaFindingReviewStatus } from "@/lib/intelligence/publicMediaIntake";

const CHANGED_BY_ROUTE = "admin/intelligence/media-intake/media-intake-actions";

const REVALIDATE_PATHS = [
  "/admin/intelligence/media-intake",
  "/admin/intelligence/morning-brief",
  "/admin/intelligence/kim-hammer/audit-log",
  "/admin/intelligence/kim-hammer/citation-locker",
  "/admin/intelligence/kim-hammer/intelligence-gaps",
];

function revalidateSurfaces() {
  for (const routePath of REVALIDATE_PATHS) {
    revalidatePath(routePath);
  }
}

export async function updateMediaFindingReviewAction(input: {
  findingId: string;
  nextStatus: MediaFindingReviewStatus;
  operatorNotes?: string;
}) {
  await requireAdminAction();

  const result = updateMediaFindingReviewStatus({
    findingId: input.findingId,
    nextStatus: input.nextStatus,
    operator: "admin-operator",
    operatorNotes: input.operatorNotes,
    changedByRoute: CHANGED_BY_ROUTE,
  });

  if (result.ok) {
    revalidateSurfaces();
  }

  return result;
}

export async function promoteFindingToTaskDraftAction(input: {
  findingId: string;
  operatorNotes?: string;
}) {
  await requireAdminAction();

  const result = promoteFindingToRetrievalTaskDraft({
    findingId: input.findingId,
    operator: "admin-operator",
    operatorNotes: input.operatorNotes,
    changedByRoute: CHANGED_BY_ROUTE,
  });

  if (result.ok) {
    revalidateSurfaces();
  }

  return result;
}

export async function promoteFindingToCitationCandidateAction(input: {
  findingId: string;
  operatorNotes?: string;
  proposedCitationText?: string;
}) {
  await requireAdminAction();

  const result = promoteFindingToCitationCandidateDraft({
    findingId: input.findingId,
    operator: "admin-operator",
    operatorNotes: input.operatorNotes,
    proposedCitationText: input.proposedCitationText,
    changedByRoute: CHANGED_BY_ROUTE,
  });

  if (result.ok) {
    revalidateSurfaces();
  }

  return result;
}

export async function dismissMediaFindingAction(input: {
  findingId: string;
  operatorNotes?: string;
}) {
  await requireAdminAction();

  const result = dismissFindingAfterReview({
    findingId: input.findingId,
    operator: "admin-operator",
    operatorNotes: input.operatorNotes,
    changedByRoute: CHANGED_BY_ROUTE,
  });

  if (result.ok) {
    revalidateSurfaces();
  }

  return result;
}

export async function markMediaFindingNeedsMoreReviewAction(input: {
  findingId: string;
  operatorNotes?: string;
}) {
  await requireAdminAction();

  const result = markFindingNeedsMoreReview({
    findingId: input.findingId,
    operator: "admin-operator",
    operatorNotes: input.operatorNotes,
    changedByRoute: CHANGED_BY_ROUTE,
  });

  if (result.ok) {
    revalidateSurfaces();
  }

  return result;
}

export async function runDryRunIntakeAction() {
  await requireAdminAction();

  const result = await runDryRunPublicMediaIntake({
    operator: "admin-operator",
    writeQueue: false,
    notes: "Manual dry-run triggered from media intake UI.",
  });

  revalidateSurfaces();

  return { ok: true, run: result.run };
}
