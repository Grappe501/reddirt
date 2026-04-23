"use server";

import { revalidatePath } from "next/cache";
import {
  CommunicationDraftStatus,
  CommunicationReviewDecision,
  CommunicationVariantStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  approveCommunicationDraftSchema,
  approveCommunicationVariantSchema,
  rejectCommunicationDraftSchema,
  rejectCommunicationVariantSchema,
  requestChangesCommunicationDraftSchema,
  requestChangesCommunicationVariantSchema,
  requestCommunicationDraftReviewSchema,
  requestCommunicationVariantReviewSchema,
} from "@/lib/comms-workbench/review-schemas";

export type CommsReviewActionResult = { ok: true } | { ok: false; error: string };

function revalidatePlan(communicationPlanId: string) {
  revalidatePath(`/admin/workbench/comms/plans/${communicationPlanId}`);
  revalidatePath("/admin/workbench/comms/plans");
  revalidatePath("/admin/workbench/comms");
}

function variantInReview(s: CommunicationVariantStatus): boolean {
  return s === CommunicationVariantStatus.READY_FOR_REVIEW || s === CommunicationVariantStatus.READY;
}

/* —— Drafts —— */

export async function requestCommunicationDraftReviewAction(raw: unknown): Promise<CommsReviewActionResult> {
  await requireAdminAction();
  const parsed = requestCommunicationDraftReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { communicationDraftId, note } = parsed.data;

  const d = await prisma.communicationDraft.findUnique({
    where: { id: communicationDraftId },
    select: { id: true, status: true, communicationPlanId: true },
  });
  if (!d) return { ok: false, error: "Draft not found." };
  if (d.status !== CommunicationDraftStatus.DRAFT && d.status !== CommunicationDraftStatus.REJECTED) {
    return { ok: false, error: "Only a draft in DRAFT or REJECTED can request review." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) return { ok: false, error: "Admin actor required." };

  try {
    await prisma.communicationDraft.update({
      where: { id: d.id },
      data: {
        status: CommunicationDraftStatus.READY_FOR_REVIEW,
        reviewRequestedAt: new Date(),
        reviewRequestedByUserId: actor,
        reviewNotes: note ?? null,
        reviewedAt: null,
        reviewedByUserId: null,
        reviewDecision: null,
        updatedByUserId: actor,
      },
    });
    revalidatePlan(d.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not request review." };
  }
}

export async function approveCommunicationDraftAction(raw: unknown): Promise<CommsReviewActionResult> {
  await requireAdminAction();
  const parsed = approveCommunicationDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { communicationDraftId, note } = parsed.data;

  const d = await prisma.communicationDraft.findUnique({
    where: { id: communicationDraftId },
    select: { id: true, status: true, communicationPlanId: true },
  });
  if (!d) return { ok: false, error: "Draft not found." };
  if (d.status !== CommunicationDraftStatus.READY_FOR_REVIEW) {
    return { ok: false, error: "Only a draft in READY_FOR_REVIEW can be approved." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) return { ok: false, error: "Admin actor required." };

  try {
    await prisma.communicationDraft.update({
      where: { id: d.id },
      data: {
        status: CommunicationDraftStatus.APPROVED,
        reviewDecision: CommunicationReviewDecision.APPROVED,
        reviewedAt: new Date(),
        reviewedByUserId: actor,
        reviewNotes: note ?? null,
        updatedByUserId: actor,
      },
    });
    revalidatePlan(d.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not approve draft." };
  }
}

export async function rejectCommunicationDraftAction(raw: unknown): Promise<CommsReviewActionResult> {
  await requireAdminAction();
  const parsed = rejectCommunicationDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { communicationDraftId, note } = parsed.data;

  const d = await prisma.communicationDraft.findUnique({
    where: { id: communicationDraftId },
    select: { id: true, status: true, communicationPlanId: true },
  });
  if (!d) return { ok: false, error: "Draft not found." };
  if (d.status !== CommunicationDraftStatus.READY_FOR_REVIEW) {
    return { ok: false, error: "Only a draft in READY_FOR_REVIEW can be rejected." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) return { ok: false, error: "Admin actor required." };

  try {
    await prisma.communicationDraft.update({
      where: { id: d.id },
      data: {
        status: CommunicationDraftStatus.REJECTED,
        reviewDecision: CommunicationReviewDecision.REJECTED,
        reviewedAt: new Date(),
        reviewedByUserId: actor,
        reviewNotes: note,
        updatedByUserId: actor,
      },
    });
    revalidatePlan(d.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not reject draft." };
  }
}

export async function requestChangesCommunicationDraftAction(raw: unknown): Promise<CommsReviewActionResult> {
  await requireAdminAction();
  const parsed = requestChangesCommunicationDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { communicationDraftId, note } = parsed.data;

  const d = await prisma.communicationDraft.findUnique({
    where: { id: communicationDraftId },
    select: { id: true, status: true, communicationPlanId: true },
  });
  if (!d) return { ok: false, error: "Draft not found." };
  if (d.status !== CommunicationDraftStatus.READY_FOR_REVIEW) {
    return { ok: false, error: "Only a draft in READY_FOR_REVIEW can be sent back for changes." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) return { ok: false, error: "Admin actor required." };

  try {
    await prisma.communicationDraft.update({
      where: { id: d.id },
      data: {
        status: CommunicationDraftStatus.DRAFT,
        reviewDecision: CommunicationReviewDecision.CHANGES_REQUESTED,
        reviewedAt: new Date(),
        reviewedByUserId: actor,
        reviewNotes: note,
        reviewRequestedAt: null,
        reviewRequestedByUserId: null,
        updatedByUserId: actor,
      },
    });
    revalidatePlan(d.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not request changes." };
  }
}

/* —— Variants —— */

export async function requestCommunicationVariantReviewAction(raw: unknown): Promise<CommsReviewActionResult> {
  await requireAdminAction();
  const parsed = requestCommunicationVariantReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { communicationVariantId, note } = parsed.data;

  const v = await prisma.communicationVariant.findUnique({
    where: { id: communicationVariantId },
    select: { id: true, status: true, draft: { select: { communicationPlanId: true } } },
  });
  if (!v) return { ok: false, error: "Variant not found." };
  if (v.status !== CommunicationVariantStatus.DRAFT && v.status !== CommunicationVariantStatus.REJECTED) {
    return { ok: false, error: "Only a variant in DRAFT or REJECTED can request review." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) return { ok: false, error: "Admin actor required." };

  try {
    await prisma.communicationVariant.update({
      where: { id: v.id },
      data: {
        status: CommunicationVariantStatus.READY_FOR_REVIEW,
        reviewRequestedAt: new Date(),
        reviewRequestedByUserId: actor,
        reviewNotes: note ?? null,
        reviewedAt: null,
        reviewedByUserId: null,
        reviewDecision: null,
      },
    });
    revalidatePlan(v.draft.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not request variant review." };
  }
}

export async function approveCommunicationVariantAction(raw: unknown): Promise<CommsReviewActionResult> {
  await requireAdminAction();
  const parsed = approveCommunicationVariantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { communicationVariantId, note } = parsed.data;

  const v = await prisma.communicationVariant.findUnique({
    where: { id: communicationVariantId },
    select: { id: true, status: true, draft: { select: { communicationPlanId: true } } },
  });
  if (!v) return { ok: false, error: "Variant not found." };
  if (!variantInReview(v.status)) {
    return { ok: false, error: "Only a variant in review (READY_FOR_REVIEW) can be approved." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) return { ok: false, error: "Admin actor required." };

  try {
    await prisma.communicationVariant.update({
      where: { id: v.id },
      data: {
        status: CommunicationVariantStatus.APPROVED,
        reviewDecision: CommunicationReviewDecision.APPROVED,
        reviewedAt: new Date(),
        reviewedByUserId: actor,
        reviewNotes: note ?? null,
      },
    });
    revalidatePlan(v.draft.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not approve variant." };
  }
}

export async function rejectCommunicationVariantAction(raw: unknown): Promise<CommsReviewActionResult> {
  await requireAdminAction();
  const parsed = rejectCommunicationVariantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { communicationVariantId, note } = parsed.data;

  const v = await prisma.communicationVariant.findUnique({
    where: { id: communicationVariantId },
    select: { id: true, status: true, draft: { select: { communicationPlanId: true } } },
  });
  if (!v) return { ok: false, error: "Variant not found." };
  if (!variantInReview(v.status)) {
    return { ok: false, error: "Only a variant in review (READY_FOR_REVIEW) can be rejected." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) return { ok: false, error: "Admin actor required." };

  try {
    await prisma.communicationVariant.update({
      where: { id: v.id },
      data: {
        status: CommunicationVariantStatus.REJECTED,
        reviewDecision: CommunicationReviewDecision.REJECTED,
        reviewedAt: new Date(),
        reviewedByUserId: actor,
        reviewNotes: note,
      },
    });
    revalidatePlan(v.draft.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not reject variant." };
  }
}

export async function requestChangesCommunicationVariantAction(raw: unknown): Promise<CommsReviewActionResult> {
  await requireAdminAction();
  const parsed = requestChangesCommunicationVariantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { communicationVariantId, note } = parsed.data;

  const v = await prisma.communicationVariant.findUnique({
    where: { id: communicationVariantId },
    select: { id: true, status: true, draft: { select: { communicationPlanId: true } } },
  });
  if (!v) return { ok: false, error: "Variant not found." };
  if (!variantInReview(v.status)) {
    return { ok: false, error: "Only a variant in review (READY_FOR_REVIEW) can be sent back for changes." };
  }

  const actor = await getAdminActorUserId();
  if (!actor) return { ok: false, error: "Admin actor required." };

  try {
    await prisma.communicationVariant.update({
      where: { id: v.id },
      data: {
        status: CommunicationVariantStatus.DRAFT,
        reviewDecision: CommunicationReviewDecision.CHANGES_REQUESTED,
        reviewedAt: new Date(),
        reviewedByUserId: actor,
        reviewNotes: note,
        reviewRequestedAt: null,
        reviewRequestedByUserId: null,
      },
    });
    revalidatePlan(v.draft.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not request variant changes." };
  }
}
