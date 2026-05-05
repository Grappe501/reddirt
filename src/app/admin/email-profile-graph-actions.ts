"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  approveAudienceHint,
  approveProfileFactSuggestion,
  createProfileFactSuggestionsFromEmailAiAnalysis,
  rejectAudienceHint,
  rejectProfileFactSuggestion,
} from "@/lib/email-command-center/profile-graph";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function generateProfileSuggestionsFromEmailAiAction(
  fd: FormData
): Promise<{ ok: true; createdFacts: number; createdHints: number } | { ok: false; error: string }> {
  await requireAdminAction();
  const itemId = trim(fd, "itemId");
  if (!itemId) return { ok: false, error: "Missing item id." };

  try {
    const r = await createProfileFactSuggestionsFromEmailAiAnalysis(itemId);
    revalidatePath(`/admin/workbench/email-queue/${itemId}`);
    revalidatePath("/admin/workbench/email-queue");
    revalidatePath("/admin/workbench/email-command-center");
    revalidatePath("/admin/workbench/email-command-center/profiles");
    return { ok: true, createdFacts: r.profileFactSuggestionsCreated, createdHints: r.audienceHintsCreated };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error.";
    return { ok: false, error: msg };
  }
}

export async function approveEmailProfileFactSuggestionAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const suggestionId = trim(fd, "suggestionId");
  const itemId = trim(fd, "emailWorkflowItemId");
  const actorId = await getAdminActorUserId();
  if (!actorId) return { ok: false, error: "Admin actor not resolved." };

  try {
    await approveProfileFactSuggestion(suggestionId, actorId);
    revalidateProfileSurfaces(itemId);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error." };
  }
}

export async function rejectEmailProfileFactSuggestionAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const suggestionId = trim(fd, "suggestionId");
  const itemId = trim(fd, "emailWorkflowItemId");
  const actorId = await getAdminActorUserId();
  if (!actorId) return { ok: false, error: "Admin actor not resolved." };

  try {
    await rejectProfileFactSuggestion(suggestionId, actorId);
    revalidateProfileSurfaces(itemId);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error." };
  }
}

export async function approveEmailAudienceHintAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const hintId = trim(fd, "hintId");
  const itemId = trim(fd, "emailWorkflowItemId");
  const actorId = await getAdminActorUserId();
  if (!actorId) return { ok: false, error: "Admin actor not resolved." };

  try {
    await approveAudienceHint(hintId, actorId);
    revalidateProfileSurfaces(itemId);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error." };
  }
}

export async function rejectEmailAudienceHintAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const hintId = trim(fd, "hintId");
  const itemId = trim(fd, "emailWorkflowItemId");
  const actorId = await getAdminActorUserId();
  if (!actorId) return { ok: false, error: "Admin actor not resolved." };

  try {
    await rejectAudienceHint(hintId, actorId);
    revalidateProfileSurfaces(itemId);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error." };
  }
}

function revalidateProfileSurfaces(itemId: string) {
  revalidatePath("/admin/workbench/email-command-center");
  revalidatePath("/admin/workbench/email-command-center/profiles");
  revalidatePath("/admin/workbench/email-queue");
  if (itemId) {
    revalidatePath(`/admin/workbench/email-queue/${itemId}`);
  }
}
