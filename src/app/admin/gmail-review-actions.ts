"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";
import { getGmailApiForStaffUser, getConnectedStaffGmailRow } from "@/lib/gmail/client";
import {
  GMAIL_REVIEW_METADATA_HEADERS,
  buildGmailReviewItemFromMetadata,
  buildQueueDraftFromGmailReviewItem,
} from "@/lib/gmail/review";
import { getGmailMessageMetadata } from "@/lib/gmail/metadata";
import { findEmailWorkflowItemIdByGmailReviewMessageId } from "@/lib/email-workflow/queries";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function revalidateGmailReviewSurfaces(): void {
  revalidatePath("/admin/workbench/email-command-center/gmail/review");
  revalidatePath("/admin/workbench/email-command-center/gmail");
  revalidatePath("/admin/workbench/email-command-center");
  revalidatePath("/admin/workbench/email-queue");
}

/**
 * Manual operator action: Gmail METADATA → one `EmailWorkflowItem`. Re-fetches message server-side.
 * Does not send mail, does not auto-create from Pub/Sub, does not store bodies.
 */
export async function createEmailWorkflowItemFromGmailMetadataAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorUserId = await getAdminActorUserId();
  if (!actorUserId) {
    redirect("/admin/workbench/email-command-center/gmail/review?create_error=needs_actor");
  }

  const gmailMessageId = trim(fd, "gmailMessageId");
  const gmailThreadIdSubmitted = trim(fd, "gmailThreadId");
  if (!gmailMessageId || !gmailThreadIdSubmitted) {
    redirect("/admin/workbench/email-command-center/gmail/review?create_error=missing_ids");
  }

  const dup = await findEmailWorkflowItemIdByGmailReviewMessageId(gmailMessageId);
  if (dup) {
    redirect(`/admin/workbench/email-queue/${dup}?gmail_review_duplicate=1`);
  }

  const row = await getConnectedStaffGmailRow(actorUserId);
  if (!row) {
    redirect("/admin/workbench/email-command-center/gmail/review?create_error=not_connected");
  }

  const gmail = await getGmailApiForStaffUser(actorUserId);
  if (!gmail) {
    redirect("/admin/workbench/email-command-center/gmail/review?create_error=no_client");
  }

  let metadata;
  try {
    metadata = await getGmailMessageMetadata(gmail, gmailMessageId, GMAIL_REVIEW_METADATA_HEADERS);
  } catch {
    redirect("/admin/workbench/email-command-center/gmail/review?create_error=fetch_failed");
  }

  const serverThreadId = metadata.threadId ?? "";
  if (!serverThreadId || serverThreadId !== gmailThreadIdSubmitted) {
    redirect("/admin/workbench/email-command-center/gmail/review?create_error=thread_mismatch");
  }

  const ref = metadata;
  let reviewItem;
  try {
    reviewItem = buildGmailReviewItemFromMetadata(ref, metadata);
  } catch {
    redirect("/admin/workbench/email-command-center/gmail/review?create_error=bad_message");
  }

  const dupAfter = await findEmailWorkflowItemIdByGmailReviewMessageId(reviewItem.gmailMessageId);
  if (dupAfter) {
    redirect(`/admin/workbench/email-queue/${dupAfter}?gmail_review_duplicate=1`);
  }

  const draft = buildQueueDraftFromGmailReviewItem(reviewItem);
  const occurredAt = draft.occurredAt;

  const gmailReviewSource = {
    version: 1 as const,
    gmailMessageId: reviewItem.gmailMessageId,
    gmailThreadId: reviewItem.gmailThreadId,
    headerMessageId: reviewItem.headerMessageId,
    sourceAccountId: row.id,
    importedAt: new Date().toISOString(),
    importedBy: actorUserId,
    headersUsed: [...GMAIL_REVIEW_METADATA_HEADERS],
    bodyStored: false,
    createdByManualOperatorAction: true,
  };

  const metadataJson: Prisma.InputJsonValue = {
    gmailReviewSource,
  };

  const created = await prisma.emailWorkflowItem.create({
    data: {
      status: "NEW",
      priority: draft.priority,
      sourceType: draft.sourceType,
      triggerType: draft.triggerType,
      title: draft.title,
      queueReason: draft.queueReason,
      whoSummary: draft.whoSummary,
      whatSummary: draft.whatSummary,
      whenSummary: draft.whenSummary,
      whereSummary: draft.whereSummary,
      whySummary: draft.whySummary,
      impactSummary: draft.impactSummary,
      recommendedResponseSummary: draft.recommendedResponseSummary,
      recommendedResponseRationale: draft.recommendedResponseRationale,
      ...(occurredAt ? { occurredAt } : {}),
      createdByUserId: actorUserId,
      metadataJson,
    },
    select: { id: true },
  });

  revalidateGmailReviewSurfaces();
  revalidatePath(`/admin/workbench/email-queue/${created.id}`);
  redirect(`/admin/workbench/email-queue/${created.id}?gmail_review_created=1`);
}
