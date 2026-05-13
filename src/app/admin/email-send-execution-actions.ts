"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";
import {
  approveSendExecutionFinal,
  archiveSendExecution,
  createSendExecutionDraft,
  executeFinalSendGridSend,
  markSendExecutionReadyForFinalApproval,
  runSendExecutionPreflight,
  sendSendGridTestEmail,
} from "@/lib/email-command-center/send-execution";

const ECC = "/admin/workbench/email-command-center";

function revalidateSendExecutionSurfaces() {
  revalidatePath(`${ECC}/send-execution`);
  revalidatePath(`${ECC}/daily`);
  revalidatePath(`${ECC}/analytics`);
  revalidatePath(`${ECC}/message-studio`);
  revalidatePath(`${ECC}/sendgrid`);
  revalidatePath(`${ECC}/audiences`);
  revalidatePath(ECC);
}

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createEmailSendExecutionDraftAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const messageStudioDraftId = trim(fd, "messageStudioDraftId");
  const emailAudienceDefinitionId = trim(fd, "emailAudienceDefinitionId");
  const sendGridContactSyncRunId = trim(fd, "sendGridContactSyncRunId") || null;
  if (!messageStudioDraftId || !emailAudienceDefinitionId) {
    redirect(`${ECC}/send-execution?error=missing-fields#ops`);
  }
  try {
    const run = await createSendExecutionDraft({
      messageStudioDraftId,
      emailAudienceDefinitionId,
      sendGridContactSyncRunId,
      createdByUserId: actorId,
    });
    revalidateSendExecutionSurfaces();
    redirect(`${ECC}/send-execution?id=${encodeURIComponent(run.id)}&notice=created#ops`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "create-failed";
    redirect(`${ECC}/send-execution?error=${encodeURIComponent(msg.slice(0, 200))}#ops`);
  }
}

export async function runEmailSendExecutionPreflightAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const sendExecutionId = trim(fd, "sendExecutionId");
  if (!sendExecutionId) redirect(`${ECC}/send-execution?error=missing-id#ops`);
  try {
    await runSendExecutionPreflight(sendExecutionId, actorId);
    revalidateSendExecutionSurfaces();
    redirect(`${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&notice=preflight#ops`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "preflight-failed";
    redirect(
      `${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&error=${encodeURIComponent(msg.slice(0, 200))}#ops`,
    );
  }
}

export async function sendEmailSendGridTestAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const sendExecutionId = trim(fd, "sendExecutionId");
  const testRecipientEmail = trim(fd, "testRecipientEmail");
  if (!sendExecutionId || !testRecipientEmail) redirect(`${ECC}/send-execution?error=missing-test-fields#ops`);

  const snap = await getEmailCommandCenterSnapshot();
  if (process.env.NODE_ENV === "production" && !snap.operatorGate.governedSendExecutionDbReady) {
    redirect(
      `${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&error=${encodeURIComponent(
        "Email Command Center migrations or send-execution tables are not verified on this database — test send disabled in production. Run prisma migrate deploy on this DATABASE_URL.",
      )}#ops`,
    );
  }

  try {
    await sendSendGridTestEmail(sendExecutionId, testRecipientEmail, actorId);
    revalidateSendExecutionSurfaces();
    redirect(`${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&notice=test-sent#ops`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "test-failed";
    redirect(
      `${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&error=${encodeURIComponent(msg.slice(0, 200))}#ops`,
    );
  }
}

export async function markEmailSendExecutionReadyForFinalApprovalAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const sendExecutionId = trim(fd, "sendExecutionId");
  if (!sendExecutionId) redirect(`${ECC}/send-execution?error=missing-id#ops`);
  try {
    await markSendExecutionReadyForFinalApproval(sendExecutionId);
    revalidateSendExecutionSurfaces();
    redirect(`${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&notice=ready-final#ops`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "transition-failed";
    redirect(
      `${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&error=${encodeURIComponent(msg.slice(0, 200))}#ops`,
    );
  }
}

export async function approveEmailSendExecutionFinalAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const sendExecutionId = trim(fd, "sendExecutionId");
  const note = trim(fd, "note");
  if (!sendExecutionId) redirect(`${ECC}/send-execution?error=missing-id#ops`);
  try {
    await approveSendExecutionFinal(sendExecutionId, actorId, note || undefined);
    revalidateSendExecutionSurfaces();
    redirect(`${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&notice=final-approved#ops`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "approve-failed";
    redirect(
      `${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&error=${encodeURIComponent(msg.slice(0, 200))}#ops`,
    );
  }
}

export async function executeEmailSendGridFinalAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const sendExecutionId = trim(fd, "sendExecutionId");
  const confirmText = trim(fd, "confirmText");
  if (!sendExecutionId) redirect(`${ECC}/send-execution?error=missing-id#ops`);

  const snap = await getEmailCommandCenterSnapshot();
  if (process.env.NODE_ENV === "production" && !snap.operatorGate.governedSendExecutionDbReady) {
    redirect(
      `${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&error=${encodeURIComponent(
        "Email Command Center migrations or send-execution tables are not verified on this database — final send disabled in production. Run prisma migrate deploy on this DATABASE_URL.",
      )}#ops`,
    );
  }

  try {
    await executeFinalSendGridSend(sendExecutionId, confirmText, actorId);
    revalidateSendExecutionSurfaces();
    redirect(`${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&notice=sent#ops`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send-failed";
    redirect(
      `${ECC}/send-execution?id=${encodeURIComponent(sendExecutionId)}&error=${encodeURIComponent(msg.slice(0, 200))}#ops`,
    );
  }
}

export async function archiveEmailSendExecutionAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const sendExecutionId = trim(fd, "sendExecutionId");
  if (!sendExecutionId) redirect(`${ECC}/send-execution?error=missing-id#ops`);
  try {
    await archiveSendExecution(sendExecutionId);
    revalidateSendExecutionSurfaces();
    redirect(`${ECC}/send-execution?notice=archived#ops`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "archive-failed";
    redirect(`${ECC}/send-execution?error=${encodeURIComponent(msg.slice(0, 200))}#ops`);
  }
}
