"use server";

import { revalidatePath } from "next/cache";
import { CommunicationVariantStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  createCommunicationVariantSchema,
  deleteCommunicationVariantSchema,
  updateCommunicationVariantSchema,
} from "@/lib/comms-workbench/variant-schemas";

export type VariantActionResult =
  | { ok: true; variantId?: string }
  | { ok: false; error: string };

function revalidatePlanPaths(communicationPlanId: string) {
  revalidatePath(`/admin/workbench/comms/plans/${communicationPlanId}`);
  revalidatePath("/admin/workbench/comms/plans");
  revalidatePath("/admin/workbench/comms");
}

async function planIdForVariant(variantId: string): Promise<string | null> {
  const v = await prisma.communicationVariant.findUnique({
    where: { id: variantId },
    select: { draft: { select: { communicationPlanId: true } } },
  });
  return v?.draft.communicationPlanId ?? null;
}

export async function createCommunicationVariantAction(raw: unknown): Promise<VariantActionResult> {
  await requireAdminAction();
  const parsed = createCommunicationVariantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;

  const draft = await prisma.communicationDraft.findUnique({
    where: { id: input.communicationDraftId },
    select: { id: true, communicationPlanId: true },
  });
  if (!draft) {
    return { ok: false, error: "Communication draft not found." };
  }

  try {
    const row = await prisma.communicationVariant.create({
      data: {
        communicationDraftId: input.communicationDraftId,
        variantType: input.variantType,
        targetSegmentId: input.targetSegmentId ?? null,
        targetSegmentLabel: input.targetSegmentLabel ?? null,
        channelOverride: input.channelOverride ?? null,
        subjectLineOverride: input.subjectLineOverride ?? null,
        bodyCopyOverride: input.bodyCopyOverride ?? null,
        ctaOverride: input.ctaOverride ?? null,
        status: CommunicationVariantStatus.DRAFT,
      },
    });
    revalidatePlanPaths(draft.communicationPlanId);
    return { ok: true, variantId: row.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create variant." };
  }
}

export async function updateCommunicationVariantAction(raw: unknown): Promise<VariantActionResult> {
  await requireAdminAction();
  const parsed = updateCommunicationVariantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;

  const existing = await prisma.communicationVariant.findUnique({
    where: { id: input.id },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, error: "Variant not found." };
  }

  const planId = await planIdForVariant(input.id);
  if (!planId) {
    return { ok: false, error: "Could not resolve plan for variant." };
  }

  try {
    const data: Prisma.CommunicationVariantUpdateInput = {};
    if (input.variantType !== undefined) data.variantType = input.variantType;
    if (input.targetSegmentId !== undefined) data.targetSegmentId = input.targetSegmentId;
    if (input.targetSegmentLabel !== undefined) data.targetSegmentLabel = input.targetSegmentLabel;
    if (input.channelOverride !== undefined) data.channelOverride = input.channelOverride;
    if (input.subjectLineOverride !== undefined) data.subjectLineOverride = input.subjectLineOverride;
    if (input.bodyCopyOverride !== undefined) data.bodyCopyOverride = input.bodyCopyOverride;
    if (input.ctaOverride !== undefined) data.ctaOverride = input.ctaOverride;

    await prisma.communicationVariant.update({
      where: { id: input.id },
      data,
    });
    revalidatePlanPaths(planId);
    return { ok: true, variantId: input.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update variant." };
  }
}

export async function deleteCommunicationVariantAction(raw: unknown): Promise<VariantActionResult> {
  await requireAdminAction();
  const parsed = deleteCommunicationVariantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id } = parsed.data;

  const planId = await planIdForVariant(id);
  if (!planId) {
    return { ok: false, error: "Variant not found." };
  }

  try {
    await prisma.communicationVariant.delete({ where: { id } });
    revalidatePlanPaths(planId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete variant." };
  }
}
