"use server";

import { revalidatePath } from "next/cache";
import { CommunicationDraftStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  createCommunicationDraftSchema,
  updateCommunicationDraftSchema,
} from "@/lib/comms-workbench/draft-schemas";

function revalidatePlanPaths(communicationPlanId: string) {
  revalidatePath(`/admin/workbench/comms/plans/${communicationPlanId}`);
  revalidatePath("/admin/workbench/comms/plans");
  revalidatePath("/admin/workbench/comms");
}

/**
 * Create a draft. Primary rule: at most one primary per plan+channel; first draft for that channel is primary unless `isPrimary: false`.
 */
export async function createCommunicationDraftAction(
  raw: unknown
): Promise<{ ok: true; draftId: string } | { ok: false; error: string }> {
  await requireAdminAction();
  const parsed = createCommunicationDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;
  const plan = await prisma.communicationPlan.findUnique({ where: { id: input.communicationPlanId }, select: { id: true } });
  if (!plan) return { ok: false, error: "Communication plan not found." };

  const actor = await getAdminActorUserId();
  const sameChannelCount = await prisma.communicationDraft.count({
    where: { communicationPlanId: input.communicationPlanId, channel: input.channel },
  });
  const userWantsPrimary = input.isPrimary === true;
  /** First draft for this plan+channel is primary unless a second+ draft is added without the primary checkbox. */
  const effectivePrimary = userWantsPrimary || sameChannelCount === 0;

  try {
    const draft = await prisma.$transaction(async (tx) => {
      if (effectivePrimary) {
        await tx.communicationDraft.updateMany({
          where: { communicationPlanId: input.communicationPlanId, channel: input.channel },
          data: { isPrimary: false },
        });
      }
      return tx.communicationDraft.create({
        data: {
          communicationPlanId: input.communicationPlanId,
          channel: input.channel,
          title: input.title ?? null,
          subjectLine: input.subjectLine ?? null,
          previewText: input.previewText ?? null,
          bodyCopy: input.bodyCopy.trim(),
          shortCopy: input.shortCopy ?? null,
          messageToneMode: input.messageToneMode ?? null,
          messageTacticMode: input.messageTacticMode ?? null,
          status: CommunicationDraftStatus.DRAFT,
          isPrimary: effectivePrimary,
          createdByUserId: actor,
          updatedByUserId: actor,
        },
      });
    });
    revalidatePlanPaths(input.communicationPlanId);
    return { ok: true, draftId: draft.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save draft." };
  }
}

export async function updateCommunicationDraftAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const parsed = updateCommunicationDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const input = parsed.data;

  const existing = await prisma.communicationDraft.findUnique({
    where: { id: input.id },
    select: {
      id: true,
      communicationPlanId: true,
      channel: true,
    },
  });
  if (!existing) return { ok: false, error: "Draft not found." };

  const actor = await getAdminActorUserId();

  const bodyCopy =
    input.bodyCopy !== undefined ? input.bodyCopy.trim() : undefined;
  if (bodyCopy !== undefined && bodyCopy.length === 0) {
    return { ok: false, error: "Message body cannot be empty." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (input.isPrimary === true) {
        await tx.communicationDraft.updateMany({
          where: {
            communicationPlanId: existing.communicationPlanId,
            channel: existing.channel,
            id: { not: existing.id },
          },
          data: { isPrimary: false },
        });
      }

      await tx.communicationDraft.update({
        where: { id: input.id },
        data: {
          ...(input.title !== undefined ? { title: input.title ?? null } : {}),
          ...(input.subjectLine !== undefined ? { subjectLine: input.subjectLine ?? null } : {}),
          ...(input.previewText !== undefined ? { previewText: input.previewText ?? null } : {}),
          ...(bodyCopy !== undefined ? { bodyCopy } : {}),
          ...(input.shortCopy !== undefined ? { shortCopy: input.shortCopy ?? null } : {}),
          ...(input.messageToneMode !== undefined
            ? { messageToneMode: input.messageToneMode }
            : {}),
          ...(input.messageTacticMode !== undefined
            ? { messageTacticMode: input.messageTacticMode }
            : {}),
          ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
          updatedByUserId: actor,
        },
      });
    });

    revalidatePlanPaths(existing.communicationPlanId);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update draft." };
  }
}
