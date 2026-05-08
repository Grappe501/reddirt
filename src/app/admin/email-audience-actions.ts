"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import type { PreviewEmailAudienceState } from "@/lib/email-command-center/audience-preview-form-state";
import {
  activateAudienceDefinition,
  archiveAudienceDefinition,
  buildAudiencePreview,
  createDraftAudienceDefinition,
  getEmailAudienceDefinitionById,
  logAudiencePreviewRun,
  parseCriteria,
} from "@/lib/email-command-center/audience-studio";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function previewEmailAudienceAction(
  _prev: PreviewEmailAudienceState,
  fd: FormData
): Promise<PreviewEmailAudienceState> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const rawCriteria = fd.get("criteriaJson");
  let criteria: Record<string, unknown> = {};
  if (typeof rawCriteria === "string" && rawCriteria.trim()) {
    try {
      criteria = JSON.parse(rawCriteria) as Record<string, unknown>;
    } catch {
      return { status: "error", error: "Invalid criteria JSON." };
    }
  } else {
    criteria = {
      factKeyEquals: trim(fd, "factKeyEquals") || undefined,
      factValueEquals: trim(fd, "factValueEquals") || undefined,
      factTypeEquals: trim(fd, "factTypeEquals") || undefined,
      audienceHintLabel: trim(fd, "audienceHintLabel") || undefined,
      county: trim(fd, "county") || undefined,
      city: trim(fd, "city") || undefined,
      workflowSourceType: trim(fd, "workflowSourceType") || undefined,
      minConfidence: trim(fd, "minConfidence") ? Number(trim(fd, "minConfidence")) : undefined,
    };
  }

  const parsed = parseCriteria(criteria);

  try {
    const { matchCount, samples, limitations } = await buildAudiencePreview(parsed);
    try {
      await logAudiencePreviewRun({
        criteria: parsed,
        matchCount,
        generatedByUserId: actorId,
        audienceDefinitionId: trim(fd, "audienceDefinitionId") || null,
      });
    } catch {
      /* Preview audit table may be absent until migration deploy — preview counts still useful. */
    }
    revalidatePath("/admin/workbench/email-command-center/audiences");
    revalidatePath("/admin/workbench/email-command-center");
    return {
      status: "success",
      matchCount,
      samples: samples as unknown as Array<Record<string, unknown>>,
      limitations,
    };
  } catch (e: unknown) {
    return { status: "error", error: e instanceof Error ? e.message : "Preview failed." };
  }
}

export async function createDraftEmailAudienceDefinitionAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect("/admin/workbench/email-command-center/audiences?error=actor");
  const name = trim(fd, "name");
  const description = trim(fd, "description");
  const rawCriteria = trim(fd, "criteriaJson");
  if (!name) redirect("/admin/workbench/email-command-center/audiences?error=name");
  let criteria: Record<string, unknown> = {};
  if (rawCriteria) {
    try {
      criteria = JSON.parse(rawCriteria) as Record<string, unknown>;
    } catch {
      redirect("/admin/workbench/email-command-center/audiences?error=criteria-json");
    }
  }
  await createDraftAudienceDefinition({
    name,
    description: description || null,
    criteria: parseCriteria(criteria),
    createdByUserId: actorId,
  });
  revalidatePath("/admin/workbench/email-command-center/audiences");
  revalidatePath("/admin/workbench/email-command-center");
  redirect("/admin/workbench/email-command-center/audiences?notice=draft-saved");
}

export async function archiveEmailAudienceDefinitionAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect("/admin/workbench/email-command-center/audiences?error=actor");
  const id = trim(fd, "id");
  if (!id) redirect("/admin/workbench/email-command-center/audiences?error=id");
  await archiveAudienceDefinition(id, actorId);
  revalidatePath("/admin/workbench/email-command-center/audiences");
  revalidatePath("/admin/workbench/email-command-center");
  redirect("/admin/workbench/email-command-center/audiences?notice=archived");
}

export async function previewSavedEmailAudienceDefinitionAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trim(fd, "id");
  if (!id) redirect("/admin/workbench/email-command-center/audiences?error=preview-id");
  const def = await getEmailAudienceDefinitionById(id);
  if (!def) redirect("/admin/workbench/email-command-center/audiences?error=preview-not-found");
  const parsed = parseCriteria(def.criteriaJson);
  try {
    const { matchCount } = await buildAudiencePreview(parsed);
    try {
      await logAudiencePreviewRun({
        criteria: parsed,
        matchCount,
        generatedByUserId: actorId,
        audienceDefinitionId: id,
      });
    } catch {
      /* optional audit */
    }
    revalidatePath("/admin/workbench/email-command-center/audiences");
    revalidatePath("/admin/workbench/email-command-center");
    const q = new URLSearchParams();
    q.set("notice", "preview-done");
    q.set("def", id);
    q.set("mc", String(matchCount));
    redirect(`/admin/workbench/email-command-center/audiences?${q.toString()}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Preview failed.";
    redirect(`/admin/workbench/email-command-center/audiences?error=${encodeURIComponent(msg)}`);
  }
}

export async function activateEmailAudienceDefinitionAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect("/admin/workbench/email-command-center/audiences?error=actor");
  const id = trim(fd, "id");
  if (!id) redirect("/admin/workbench/email-command-center/audiences?error=activate-id");
  const res = await activateAudienceDefinition({ audienceDefinitionId: id, updatedByUserId: actorId });
  revalidatePath("/admin/workbench/email-command-center/audiences");
  revalidatePath("/admin/workbench/email-command-center");
  revalidatePath("/admin/workbench/email-command-center/launch-room");
  if (!res.ok) {
    const q = new URLSearchParams();
    q.set("error", "activate-blocked");
    q.set("def", id);
    q.set("why", encodeURIComponent(res.reasons.join(" · ")));
    redirect(`/admin/workbench/email-command-center/audiences?${q.toString()}`);
  }
  const q = new URLSearchParams();
  q.set("notice", "activated");
  q.set("def", id);
  q.set("mc", String(res.matchedCount));
  q.set("sup", String(res.excludedSuppressedApprox));
  q.set("elig", String(res.eligibleAfterSuppressionApprox));
  redirect(`/admin/workbench/email-command-center/audiences?${q.toString()}`);
}
