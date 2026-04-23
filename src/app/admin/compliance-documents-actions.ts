"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { ComplianceDocumentType } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";
import { saveOwnedMediaFile } from "@/lib/owned-media/storage";

function parseDocumentType(raw: string): ComplianceDocumentType {
  const s = String(raw || "").trim();
  if (Object.values(ComplianceDocumentType).includes(s as ComplianceDocumentType)) {
    return s as ComplianceDocumentType;
  }
  return ComplianceDocumentType.OTHER;
}

export async function uploadComplianceDocumentAction(formData: FormData) {
  await requireAdminAction();
  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    redirect("/admin/compliance-documents?error=upload");
  }

  const id = randomUUID();
  let saved: Awaited<ReturnType<typeof saveOwnedMediaFile>>;
  try {
    saved = await saveOwnedMediaFile({ assetId: id, file });
  } catch {
    redirect("/admin/compliance-documents?error=upload");
  }

  const titleRaw = String(formData.get("title") ?? "").trim();
  const title = titleRaw || saved.fileName;
  const documentType = parseDocumentType(String(formData.get("documentType") ?? "OTHER"));
  const reportingPeriod = String(formData.get("reportingPeriod") ?? "").trim() || null;
  const periodDateRaw = String(formData.get("periodDate") ?? "").trim();
  const periodDate = periodDateRaw ? new Date(periodDateRaw) : null;
  if (periodDate && Number.isNaN(periodDate.getTime())) {
    redirect("/admin/compliance-documents?error=date");
  }
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const approvedForAi = String(formData.get("approvedForAi") ?? "") === "on";
  const origName = (file as File).name || saved.fileName;
  const uploadedByUserId = await getAdminActorUserId();

  await prisma.complianceDocument.create({
    data: {
      id,
      storageKey: saved.storageKey,
      fileName: saved.fileName,
      originalFileName: origName,
      mimeType: saved.mimeType,
      fileSizeBytes: saved.fileSizeBytes,
      title,
      documentType,
      reportingPeriod,
      periodDate: periodDate && !Number.isNaN(periodDate.getTime()) ? periodDate : null,
      notes,
      approvedForAiReference: approvedForAi,
      uploadedByUserId,
    },
  });

  revalidatePath("/admin/compliance-documents");
  redirect("/admin/compliance-documents?saved=1");
}

export async function setComplianceDocumentAiApprovalAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/compliance-documents?error=form");
  const approved = String(formData.get("approvedForAi") ?? "") === "on";
  const row = await prisma.complianceDocument.findUnique({ where: { id } });
  if (!row) redirect("/admin/compliance-documents?error=missing");
  await prisma.complianceDocument.update({
    where: { id },
    data: { approvedForAiReference: approved },
  });
  revalidatePath("/admin/compliance-documents");
  redirect("/admin/compliance-documents?updated=1");
}
