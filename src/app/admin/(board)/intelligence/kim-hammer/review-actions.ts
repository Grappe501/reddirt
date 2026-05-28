"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { updateKimHammerClaimReviewStatus } from "@/lib/opposition/kimHammerReviewWorkflow";
import type { KimHammerReviewStatus } from "@/lib/opposition/types/kimHammerEvidence";

const REVIEW_CHANGED_BY_ROUTE =
  "admin/intelligence/kim-hammer/review-actions#updateKimHammerClaimReviewAction";

const REVIEW_REVALIDATE_PATHS = [
  "/admin/intelligence/kim-hammer",
  "/admin/intelligence/kim-hammer/evidence-command",
  "/admin/intelligence/kim-hammer/public-debate-evidence",
  "/admin/intelligence/kim-hammer/debate-packet-export",
];

function revalidateKimHammerReviewSurfaces() {
  for (const routePath of REVIEW_REVALIDATE_PATHS) {
    revalidatePath(routePath);
  }
}

export async function updateKimHammerClaimReviewAction(input: {
  claimId: string;
  nextStatus: KimHammerReviewStatus;
  reviewer: string;
  reviewNotes?: string;
}) {
  await requireAdminAction();

  const result = updateKimHammerClaimReviewStatus({
    claimId: input.claimId,
    nextStatus: input.nextStatus,
    reviewer: input.reviewer,
    reviewNotes: input.reviewNotes,
    changedByRoute: REVIEW_CHANGED_BY_ROUTE,
  });

  if (result.ok) {
    revalidateKimHammerReviewSurfaces();
  }

  return result;
}
