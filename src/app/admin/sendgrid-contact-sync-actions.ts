"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import { createSendGridContactSyncRun, executeApprovedSendGridContactSyncRun } from "@/lib/email-command-center/sendgrid-contact-sync";
import { isSendGridConfigured } from "@/lib/sendgrid/config";

const ECC = "/admin/workbench/email-command-center";

function revalidateSendGridContactSyncSurfaces() {
  revalidatePath(`${ECC}/sendgrid`);
  revalidatePath(`${ECC}/audiences`);
  revalidatePath(`${ECC}/analytics`);
  revalidatePath(`${ECC}/daily`);
  revalidatePath(ECC);
}

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Operator records a preview-only sync run row (ACTIVE audiences only). */
export async function previewSendGridAudienceContactSyncAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const audienceDefinitionId = trim(fd, "audienceDefinitionId");
  if (!audienceDefinitionId) {
    redirect(`${ECC}/sendgrid?error=missing-audience#contact-sync`);
  }
  try {
    await createSendGridContactSyncRun({
      audienceDefinitionId,
      createdByUserId: actorId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "preview-failed";
    redirect(
      `${ECC}/sendgrid?preview=${encodeURIComponent(audienceDefinitionId)}&error=${encodeURIComponent(msg.slice(0, 200))}#contact-sync`,
    );
  }
  revalidateSendGridContactSyncSurfaces();
  redirect(`${ECC}/sendgrid?preview=${encodeURIComponent(audienceDefinitionId)}&notice=sync-preview-saved#contact-sync`);
}

export async function approveSendGridContactSyncRunAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect(`${ECC}/sendgrid?error=actor#contact-sync`);
  const runId = trim(fd, "runId");
  if (!runId) redirect(`${ECC}/sendgrid?error=missing-run#contact-sync`);

  const run = await prisma.sendGridContactSyncRun.findUnique({
    where: { id: runId },
    select: { id: true, status: true },
  });
  if (!run) redirect(`${ECC}/sendgrid?error=run-not-found#contact-sync`);
  if (run.status !== "PREVIEWED") {
    redirect(`${ECC}/sendgrid?error=run-not-previewed#contact-sync`);
  }

  await prisma.sendGridContactSyncRun.update({
    where: { id: runId },
    data: {
      status: "APPROVED",
      approvedByUserId: actorId,
      approvedAt: new Date(),
      resultJson: {
        approvedAt: new Date().toISOString(),
        note: "Approval is governance-only — no SendGrid API execution in EMAIL-SENDGRID-CONTACT-SYNC-1.1.",
      },
    },
  });

  revalidateSendGridContactSyncSurfaces();
  redirect(`${ECC}/sendgrid?notice=sync-run-approved#contact-sync`);
}

/**
 * Governed Marketing Contacts upsert for an APPROVED run only — contact management, no email send.
 * Production requires hosted Kelly-Grappe-App DB gate (operatorGate.localContactImportDbVerified).
 */
export async function executeSendGridContactSyncRunAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const runId = trim(fd, "runId");
  if (!runId) redirect(`${ECC}/sendgrid?error=missing-run#contact-sync`);

  const run = await prisma.sendGridContactSyncRun.findUnique({
    where: { id: runId },
    select: { id: true, status: true },
  });
  if (!run) redirect(`${ECC}/sendgrid?error=run-not-found#contact-sync`);
  if (run.status !== "APPROVED") {
    redirect(`${ECC}/sendgrid?error=run-not-approved#contact-sync`);
  }

  if (!isSendGridConfigured()) {
    revalidateSendGridContactSyncSurfaces();
    redirect(
      `${ECC}/sendgrid?notice=execute-blocked&executeReason=${encodeURIComponent("SENDGRID_API_KEY missing — execution blocked.")}#contact-sync`,
    );
  }

  const snap = await getEmailCommandCenterSnapshot();
  if (process.env.NODE_ENV === "production" && !snap.operatorGate.localContactImportDbVerified) {
    revalidateSendGridContactSyncSurfaces();
    redirect(
      `${ECC}/sendgrid?notice=execute-blocked&executeReason=${encodeURIComponent(
        "Hosted Kelly-Grappe-App DB not verified — contact upsert disabled in production until migrate + contact-import gate pass on hosted DATABASE_URL.",
      )}#contact-sync`,
    );
  }

  const result = await executeApprovedSendGridContactSyncRun(runId);
  revalidateSendGridContactSyncSurfaces();
  if (!result.ok) {
    redirect(
      `${ECC}/sendgrid?notice=execute-failed&executeReason=${encodeURIComponent(result.reason.slice(0, 220))}#contact-sync`,
    );
  }
  redirect(`${ECC}/sendgrid?notice=execute-synced&runId=${encodeURIComponent(runId)}#contact-sync`);
}
