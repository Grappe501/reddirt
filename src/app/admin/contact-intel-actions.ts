"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { createContactIntelImportJob } from "@/lib/contact-intel/jobs";
import { buildContactIntelMappingFromForm, guessContactIntelMapping } from "@/lib/contact-intel/mapping";
import { ContactIntelUploadError } from "@/lib/contact-intel/parse";
import { applyContactIntelMappingAndPreview, commitContactIntelImport } from "@/lib/contact-intel/pipeline";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function uploadContactIntelFileAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/contact-intel/import?error=file");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const jobId = await createContactIntelImportJob({
      filename: file.name || "upload.csv",
      buffer: buf,
      sourceLabel: trim(fd, "sourceLabel") || null,
      createdByUserId: actorId,
    });
    revalidatePath("/admin/contact-intel");
    revalidatePath("/admin/contact-intel/import");
    redirect(`/admin/contact-intel/import/${jobId}`);
  } catch (err) {
    const code = err instanceof ContactIntelUploadError ? err.code : "parse";
    redirect(`/admin/contact-intel/import?error=${code}`);
  }
}

export async function previewContactIntelMappingAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const jobId = trim(fd, "jobId");
  if (!jobId) redirect("/admin/contact-intel/import?error=job");
  const headersRaw = trim(fd, "headers");
  let headers: string[] = [];
  try {
    headers = JSON.parse(headersRaw) as string[];
  } catch {
    headers = [];
  }
  const mapping =
    headers.length > 0
      ? buildContactIntelMappingFromForm(headers, (key) => trim(fd, key))
      : guessContactIntelMapping([]);
  await applyContactIntelMappingAndPreview(jobId, mapping);
  revalidatePath(`/admin/contact-intel/import/${jobId}`);
  revalidatePath("/admin/contact-intel");
}

export async function commitContactIntelImportAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const jobId = trim(fd, "jobId");
  if (!jobId) redirect("/admin/contact-intel/import?error=job");
  try {
    await commitContactIntelImport(jobId);
  } catch {
    redirect(`/admin/contact-intel/import/${jobId}?error=commit`);
  }
  revalidatePath(`/admin/contact-intel/import/${jobId}`);
  revalidatePath("/admin/contact-intel");
  redirect(`/admin/contact-intel/import/${jobId}?committed=1`);
}
