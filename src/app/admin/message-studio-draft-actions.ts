"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { parseMessageStudioLocalDraftPayload } from "@/components/admin/email-command-center/message-studio-local-drafts";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import type { MessageStudioDraftStatus } from "@prisma/client";
import {
  archiveMessageStudioDraft,
  buildServerDraftFromLocalDraftPayload,
  createMessageStudioDraftRevision,
  getMessageStudioDraft,
  promoteLocalDraftPayloadToServerDraft,
  serverDraftRowToLocalDraft,
  updateMessageStudioDraft,
  verifyUserIdExists,
} from "@/lib/email-command-center/message-studio-drafts";

const ECC = "/admin/workbench/email-command-center";

function revalidateMessageStudioSurfaces() {
  revalidatePath(`${ECC}/message-studio`);
  revalidatePath(`${ECC}/daily`);
  revalidatePath(ECC);
  revalidatePath(`${ECC}/send-execution`);
}

function trimFd(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

const SERVER_STATUSES: MessageStudioDraftStatus[] = [
  "DRAFT",
  "NEEDS_REVIEW",
  "IN_REVIEW",
  "APPROVED_FOR_SEND_GOVERNANCE",
  "ARCHIVED",
];

function parseServerStatus(raw: string): MessageStudioDraftStatus | undefined {
  return SERVER_STATUSES.includes(raw as MessageStudioDraftStatus) ? (raw as MessageStudioDraftStatus) : undefined;
}

export async function saveLocalDraftToServerAction(
  fd: FormData,
): Promise<{ ok: true; serverDraftId: string } | { ok: false; error: string }> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const raw = fd.get("localDraftJson");
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, error: "Missing local draft JSON." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }
  const draft = parseMessageStudioLocalDraftPayload(parsed);
  if (!draft) return { ok: false, error: "Invalid draft payload." };
  const row = await promoteLocalDraftPayloadToServerDraft({ payload: draft, createdByUserId: actorId });
  revalidateMessageStudioSurfaces();
  return { ok: true, serverDraftId: row.id };
}

export async function updateServerMessageDraftAction(
  fd: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trimFd(fd, "serverDraftId");
  if (!id) return { ok: false, error: "Missing server draft id." };
  const raw = fd.get("localDraftJson");
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, error: "Missing local draft JSON." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }
  const draft = parseMessageStudioLocalDraftPayload(parsed);
  if (!draft) return { ok: false, error: "Invalid draft payload." };
  const built = buildServerDraftFromLocalDraftPayload(draft);
  const statusRaw = trimFd(fd, "serverWorkflowStatus");
  const nextStatus = parseServerStatus(statusRaw);
  const revisionNote = trimFd(fd, "revisionNoteAfterUpdate");

  const existing = await getMessageStudioDraft(id);
  if (!existing || existing.status === "ARCHIVED") return { ok: false, error: "Draft not found or archived." };

  const reviewerRaw = trimFd(fd, "assignedReviewerUserId");
  let assignedReviewerUserId: string | null | undefined;
  if (reviewerRaw === "") {
    assignedReviewerUserId = null;
  } else if (reviewerRaw) {
    assignedReviewerUserId = (await verifyUserIdExists(reviewerRaw)) ? reviewerRaw : undefined;
  }

  const status = nextStatus ?? existing.status;
  const transitioningToApproved =
    status === "APPROVED_FOR_SEND_GOVERNANCE" && existing.status !== "APPROVED_FOR_SEND_GOVERNANCE";

  await updateMessageStudioDraft(id, {
    ...built,
    status,
    updatedByUserId: actorId,
    ...(transitioningToApproved
      ? { reviewedAt: new Date(), reviewedByUserId: actorId ?? undefined }
      : {}),
    ...(assignedReviewerUserId !== undefined ? { assignedReviewerUserId } : {}),
  });

  if (revisionNote) {
    await createMessageStudioDraftRevision(id, revisionNote, actorId);
  }

  revalidateMessageStudioSurfaces();
  return { ok: true };
}

export async function archiveServerMessageDraftAction(fd: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trimFd(fd, "serverDraftId");
  if (!id) return { ok: false, error: "Missing server draft id." };
  const existing = await getMessageStudioDraft(id);
  if (!existing) return { ok: false, error: "Draft not found." };
  await archiveMessageStudioDraft(id, actorId);
  revalidateMessageStudioSurfaces();
  return { ok: true };
}

export async function createMessageDraftRevisionAction(
  fd: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trimFd(fd, "serverDraftId");
  const note = trimFd(fd, "revisionNote");
  if (!id) return { ok: false, error: "Missing server draft id." };
  const existing = await getMessageStudioDraft(id);
  if (!existing || existing.status === "ARCHIVED") return { ok: false, error: "Draft not found or archived." };
  await createMessageStudioDraftRevision(id, note || null, actorId);
  revalidateMessageStudioSurfaces();
  return { ok: true };
}

export async function loadMessageStudioServerDraftPayloadAction(
  id: string,
): Promise<{ ok: true; draft: MessageStudioLocalDraft } | { ok: false; error: string }> {
  await requireAdminAction();
  const row = await getMessageStudioDraft(id);
  if (!row || row.status === "ARCHIVED") return { ok: false, error: "Draft not found or archived." };
  return { ok: true, draft: serverDraftRowToLocalDraft(row) };
}
