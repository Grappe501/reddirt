"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  approveContactImportBatch,
  archiveContactImportBatch,
  commitApprovedContactImportBatch,
  createContactImportBatch,
  validateEmailContactImportBatch,
} from "@/lib/email-command-center/contact-import";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function batchIdFromForm(fd: FormData): string {
  const id = trim(fd, "batchId");
  if (!id) throw new Error("Missing batchId.");
  return id;
}

export async function uploadEmailContactImportCsvAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const name = trim(fd, "name") || "Imported list";
  const sourceLabel = trim(fd, "sourceLabel") || null;
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/workbench/email-command-center/imports?error=file");
  }
  const text = await file.text();
  if (text.length > 2_000_000) {
    redirect("/admin/workbench/email-command-center/imports?error=size");
  }
  const batchId = await createContactImportBatch({
    name,
    sourceLabel,
    originalFilename: file.name || "upload.csv",
    createdByUserId: actorId,
    csvText: text,
  });
  revalidatePath("/admin/workbench/email-command-center/imports");
  revalidatePath("/admin/workbench/email-command-center");
  redirect(`/admin/workbench/email-command-center/imports/${batchId}`);
}

export async function validateEmailContactImportBatchAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const batchId = batchIdFromForm(fd);
  await validateEmailContactImportBatch(batchId);
  revalidatePath("/admin/workbench/email-command-center/imports");
  revalidatePath(`/admin/workbench/email-command-center/imports/${batchId}`);
  revalidatePath("/admin/workbench/email-command-center");
}

export async function approveEmailContactImportBatchAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const batchId = batchIdFromForm(fd);
  await approveContactImportBatch(batchId, actorId);
  revalidatePath("/admin/workbench/email-command-center/imports");
  revalidatePath(`/admin/workbench/email-command-center/imports/${batchId}`);
  revalidatePath("/admin/workbench/email-command-center");
}

export async function commitEmailContactImportBatchAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const batchId = batchIdFromForm(fd);
  await commitApprovedContactImportBatch(batchId, actorId);
  revalidatePath("/admin/workbench/email-command-center/imports");
  revalidatePath(`/admin/workbench/email-command-center/imports/${batchId}`);
  revalidatePath("/admin/workbench/email-command-center");
  revalidatePath("/admin/workbench/email-command-center/profiles");
  revalidatePath("/admin/workbench/email-command-center/audiences");
}

export async function archiveEmailContactImportBatchAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const batchId = batchIdFromForm(fd);
  await archiveContactImportBatch(batchId);
  revalidatePath("/admin/workbench/email-command-center/imports");
  revalidatePath(`/admin/workbench/email-command-center/imports/${batchId}`);
  revalidatePath("/admin/workbench/email-command-center");
}
