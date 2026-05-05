"use server";

import type { EmailWorkflowStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";
import { runEmailWorkflowInterpretation } from "@/lib/email-workflow/intelligence/interpreter";
import { canTransitionEmailWorkflowStatus } from "@/lib/email-workflow/governance";

function trim(f: FormData, key: string): string | null {
  const v = f.get(key);
  if (v == null || typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function revalidateEmailWorkflowRoutes(itemId: string): void {
  revalidatePath("/admin/workbench/email-queue");
  revalidatePath(`/admin/workbench/email-queue/${itemId}`);
}

type JsonRecord = Record<string, unknown>;

function asRecord(v: unknown): JsonRecord {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as JsonRecord;
  }
  return {};
}

function appendOperatorActionMetadata(
  baseMetadata: unknown,
  payload: { action: string; actorUserId: string | null; details?: JsonRecord }
): Prisma.InputJsonValue {
  const root = asRecord(baseMetadata);
  const prior = asRecord(root.emailWorkflowOperatorAction);
  const history = Array.isArray(prior.history) ? [...prior.history] : [];
  history.push({
    action: payload.action,
    actorUserId: payload.actorUserId,
    at: new Date().toISOString(),
    details: payload.details ?? {},
  });
  return {
    ...root,
    emailWorkflowOperatorAction: {
      lastAction: payload.action,
      lastActorUserId: payload.actorUserId,
      lastAt: new Date().toISOString(),
      history: history.slice(-20),
    },
  } satisfies Prisma.InputJsonValue;
}

/**
 * E-1: manual row creation only — always queue-first (default NEW), no auto-approval or send.
 */
export async function createEmailWorkflowItemManualAction(
  fd: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdminAction();
  const title = trim(fd, "title");
  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  const actor = await getAdminActorUserId();
  const row = await prisma.emailWorkflowItem.create({
    data: {
      title,
      queueReason: trim(fd, "queueReason"),
      whoSummary: trim(fd, "whoSummary"),
      whatSummary: trim(fd, "whatSummary"),
      whenSummary: trim(fd, "whenSummary"),
      whereSummary: trim(fd, "whereSummary"),
      whySummary: trim(fd, "whySummary"),
      impactSummary: trim(fd, "impactSummary"),
      recommendedResponseSummary: trim(fd, "recommendedResponseSummary"),
      ...(actor ? { createdByUserId: actor } : {}),
    },
    select: { id: true },
  });
  revalidateEmailWorkflowRoutes(row.id);
  return { ok: true, id: row.id };
}

/**
 * E-2A: manual interpretation pass (deterministic heuristics + safe writeback). No AI, no send.
 * Re-runs are allowed; use checkboxes to overwrite protected summary/triage fields.
 */
export async function runEmailWorkflowInterpretationAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const id = (fd.get("itemId") as string | null)?.trim() ?? "";
  if (!id) {
    return { ok: false, error: "Missing item id." };
  }
  const forceOverwriteSummaries = fd.get("forceSummaries") === "on";
  const forceOverwriteSignals = fd.get("forceSignals") === "on";
  const r = await runEmailWorkflowInterpretation({
    itemId: id,
    forceOverwriteSummaries,
    forceOverwriteSignals,
  });
  if (!r.ok) {
    return { ok: false, error: r.error };
  }
  revalidateEmailWorkflowRoutes(id);
  return { ok: true };
}

export async function assignEmailWorkflowItemToCurrentActorAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const id = (fd.get("itemId") as string | null)?.trim() ?? "";
  if (!id) {
    return { ok: false, error: "Missing item id." };
  }
  const actorUserId = await getAdminActorUserId();
  if (!actorUserId) {
    return {
      ok: false,
      error: "ADMIN_ACTOR_USER_EMAIL is required to assign items to the current admin actor.",
    };
  }

  const row = await prisma.emailWorkflowItem.findUnique({
    where: { id },
    select: { metadataJson: true },
  });
  if (!row) {
    return { ok: false, error: "Email workflow item not found." };
  }

  await prisma.emailWorkflowItem.update({
    where: { id },
    data: {
      assignedToUserId: actorUserId,
      metadataJson: appendOperatorActionMetadata(row.metadataJson, {
        action: "assign_to_current_actor",
        actorUserId,
      }),
    },
  });
  revalidateEmailWorkflowRoutes(id);
  return { ok: true };
}

export async function clearEmailWorkflowItemAssignmentAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const id = (fd.get("itemId") as string | null)?.trim() ?? "";
  if (!id) {
    return { ok: false, error: "Missing item id." };
  }
  const actorUserId = await getAdminActorUserId();
  const row = await prisma.emailWorkflowItem.findUnique({
    where: { id },
    select: { metadataJson: true },
  });
  if (!row) {
    return { ok: false, error: "Email workflow item not found." };
  }

  await prisma.emailWorkflowItem.update({
    where: { id },
    data: {
      assignedToUserId: null,
      metadataJson: appendOperatorActionMetadata(row.metadataJson, {
        action: "clear_assignment",
        actorUserId,
      }),
    },
  });
  revalidateEmailWorkflowRoutes(id);
  return { ok: true };
}

export async function transitionEmailWorkflowItemStatusAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const id = (fd.get("itemId") as string | null)?.trim() ?? "";
  const toStatusRaw = (fd.get("toStatus") as string | null)?.trim() ?? "";
  if (!id || !toStatusRaw) {
    return { ok: false, error: "Missing status transition payload." };
  }

  const toStatus = toStatusRaw as EmailWorkflowStatus;
  const actorUserId = await getAdminActorUserId();
  const row = await prisma.emailWorkflowItem.findUnique({
    where: { id },
    select: { status: true, metadataJson: true },
  });
  if (!row) {
    return { ok: false, error: "Email workflow item not found." };
  }
  if (!canTransitionEmailWorkflowStatus(row.status, toStatus)) {
    return {
      ok: false,
      error: `Manual transition ${row.status} -> ${toStatus} is not allowed by queue governance.`,
    };
  }

  const now = new Date();
  await prisma.emailWorkflowItem.update({
    where: { id },
    data: {
      status: toStatus,
      ...(toStatus === "IN_REVIEW" || toStatus === "READY_TO_RESPOND" || toStatus === "APPROVED"
        ? {
            reviewedAt: now,
            ...(actorUserId ? { reviewedByUserId: actorUserId } : {}),
          }
        : {}),
      metadataJson: appendOperatorActionMetadata(row.metadataJson, {
        action: "status_transition",
        actorUserId,
        details: { fromStatus: row.status, toStatus },
      }),
    },
  });
  revalidateEmailWorkflowRoutes(id);
  return { ok: true };
}
