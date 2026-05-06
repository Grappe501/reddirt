/**
 * EMAIL-SEND-EXECUTION-1.0 — governed SendGrid send execution (explicit operator actions; no queue send; no automation).
 */

import type { Prisma } from "@prisma/client";
import {
  EmailSendExecutionSendType,
  EmailSendExecutionStatus,
  EmailSendRecipientStatus,
  MessageStudioDraftStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAudiencePreviewMatchedProfileIds, parseCriteria } from "@/lib/email-command-center/audience-studio";
import { getMessageStudioDraft } from "@/lib/email-command-center/message-studio-drafts";
import { excludeSuppressedContacts } from "@/lib/email-command-center/sendgrid-contact-sync";
import { getSendGridEnvStatus } from "@/lib/sendgrid/config";
import {
  getSendGridMailReadiness,
  readAsmGroupId,
  sanitizeSendGridMailError,
  sendSendGridBroadcastEmail,
  sendSendGridSingleTestEmail,
} from "@/lib/sendgrid/mail-send";

const PROFILE_CAP = 4000;

/** Operator must type this exactly (excluding surrounding whitespace) before final SendGrid broadcast. */
export const EMAIL_SEND_FINAL_CONFIRMATION_PHRASE = "SEND APPROVED";

export type SendExecutionReadiness = {
  dbReachable: boolean;
  executionTablesAvailable: boolean;
  messageStudioDraftsAvailable: boolean;
  sendGridMailReady: boolean;
  notes: string[];
};

export async function getSendExecutionReadiness(): Promise<SendExecutionReadiness> {
  const notes: string[] = [];
  let dbReachable = false;
  let executionTablesAvailable = false;
  let messageStudioDraftsAvailable = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbReachable = true;
  } catch {
    notes.push("Database unreachable — send execution unavailable.");
  }
  if (dbReachable) {
    try {
      await prisma.emailSendExecution.count();
      executionTablesAvailable = true;
    } catch {
      notes.push("EmailSendExecution table missing — apply migration 20260510140000_email_send_execution.");
    }
    try {
      await prisma.messageStudioDraft.count();
      messageStudioDraftsAvailable = true;
    } catch {
      notes.push("MessageStudioDraft table unavailable.");
    }
  }
  const mail = getSendGridMailReadiness();
  if (!mail.broadcastAllowed) {
    notes.push(...mail.notes);
  }
  return {
    dbReachable,
    executionTablesAvailable,
    messageStudioDraftsAvailable,
    sendGridMailReady: mail.broadcastAllowed,
    notes,
  };
}

export function sanitizeProviderError(error: unknown): string {
  return sanitizeSendGridMailError(error);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function htmlForSend(body: string, broadcast: boolean): string {
  const complianceNote = broadcast
    ? '<p style="font-size:11px;color:#555;">This broadcast uses SendGrid ASM when configured. Recipients excluded by local suppression are not mailed.</p>'
    : "";
  const trimmed = body.trim();
  if (trimmed.toLowerCase().startsWith("<!doctype") || trimmed.toLowerCase().startsWith("<html")) {
    return `${trimmed}${complianceNote}`;
  }
  return `<!DOCTYPE html><html><body>${body}${complianceNote}</body></html>`;
}

function textForSend(body: string, broadcast: boolean): string {
  const note = broadcast ? "\n\n---\nCampaign email via SendGrid (governed send execution).\n" : "";
  const stripped = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return `${stripped}${note}`;
}

export async function listEmailSendExecutions(limit = 40) {
  try {
    return await prisma.emailSendExecution.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        emailAudienceDefinition: { select: { id: true, name: true } },
        messageStudioDraft: { select: { id: true, title: true } },
        sendGridContactSyncRun: { select: { id: true, status: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function getEmailSendExecution(id: string) {
  try {
    return await prisma.emailSendExecution.findUnique({
      where: { id },
      include: {
        recipients: { orderBy: { email: "asc" } },
        approvals: { orderBy: { createdAt: "desc" } },
        emailAudienceDefinition: true,
        messageStudioDraft: true,
        sendGridContactSyncRun: true,
      },
    });
  } catch {
    return null;
  }
}

export type CreateSendExecutionDraftInput = {
  messageStudioDraftId: string;
  emailAudienceDefinitionId: string;
  sendGridContactSyncRunId?: string | null;
  sendType?: EmailSendExecutionSendType;
  createdByUserId: string | null;
};

export async function createSendExecutionDraft(input: CreateSendExecutionDraftInput) {
  const draft = await getMessageStudioDraft(input.messageStudioDraftId);
  if (!draft) throw new Error("Shared Message Studio draft not found.");
  const audience = await prisma.emailAudienceDefinition.findUnique({
    where: { id: input.emailAudienceDefinitionId },
  });
  if (!audience || audience.status !== "ACTIVE") {
    throw new Error("Audience must exist and be ACTIVE.");
  }

  const sendType = input.sendType ?? "SENDGRID_BROADCAST";
  const fromEmail = process.env.SENDGRID_FROM_EMAIL?.trim() ?? "";
  const fromName = process.env.SENDGRID_FROM_NAME?.trim() ?? "";

  const packet =
    draft.sendPacketJson && isPlainObject(draft.sendPacketJson)
      ? (draft.sendPacketJson as Record<string, unknown>)
      : {};

  return prisma.emailSendExecution.create({
    data: {
      status: "DRAFT",
      sendType,
      messageStudioDraftId: draft.id,
      emailAudienceDefinitionId: audience.id,
      sendGridContactSyncRunId: input.sendGridContactSyncRunId ?? null,
      sendPacketJson: packet as Prisma.InputJsonValue,
      subject: draft.subject?.trim() ?? "",
      preheader: draft.preheader?.trim() ?? "",
      body: draft.body ?? "",
      fromEmail,
      fromName,
      replyToEmail: null,
      createdByUserId: input.createdByUserId,
      metadataJson: { source: "EMAIL-SEND-EXECUTION-1.0", draftTitle: draft.title },
    },
  });
}

export async function buildSendExecutionFromSharedDraftAndPacket(input: CreateSendExecutionDraftInput) {
  return createSendExecutionDraft(input);
}

async function loadAudienceProfilesWithEmail(audienceDefinitionId: string) {
  const def = await prisma.emailAudienceDefinition.findUnique({
    where: { id: audienceDefinitionId },
    select: { criteriaJson: true },
  });
  if (!def) return [];
  const criteria = parseCriteria(def.criteriaJson);
  const ids = await getAudiencePreviewMatchedProfileIds(criteria);
  const capped = ids.slice(0, PROFILE_CAP);
  if (!capped.length) return [];
  return prisma.emailContactProfile.findMany({
    where: { id: { in: capped } },
    select: { id: true, primaryEmail: true, source: true },
  });
}

export async function listEligibleRecipientsForSend(sendExecutionId: string) {
  return prisma.emailSendRecipient.findMany({
    where: { sendExecutionId, status: "READY" },
    orderBy: { email: "asc" },
  });
}

/** Re-scan suppression for existing recipient rows (READY/CANDIDATE → EXCLUDED_SUPPRESSED). */
export async function applySuppressionExclusions(sendExecutionId: string) {
  const rows = await prisma.emailSendRecipient.findMany({
    where: {
      sendExecutionId,
      status: { in: ["CANDIDATE", "READY"] },
    },
  });
  const withEmail = rows
    .map((r) => ({ id: r.id, email: r.email.trim().toLowerCase() }))
    .filter((r) => r.email.includes("@"));
  const { allowed } = await excludeSuppressedContacts(withEmail.map((r) => ({ email: r.email })));
  const allowedSet = new Set(allowed.map((a) => a.email));
  for (const r of rows) {
    const e = r.email.trim().toLowerCase();
    if (!e.includes("@")) continue;
    if (!allowedSet.has(e)) {
      await prisma.emailSendRecipient.update({
        where: { id: r.id },
        data: { status: "EXCLUDED_SUPPRESSED", suppressionReason: "sendgrid_suppression_table" },
      });
    }
  }
}

export async function runSendExecutionPreflight(sendExecutionId: string, preflightByUserId: string | null) {
  const ex = await prisma.emailSendExecution.findUnique({
    where: { id: sendExecutionId },
    include: { messageStudioDraft: true, sendGridContactSyncRun: true },
  });
  if (!ex) throw new Error("Send execution not found.");

  const statusesAllowingPreflight = new Set<EmailSendExecutionStatus>([
    "DRAFT",
    "PREFLIGHT_FAILED",
    "READY_FOR_TEST",
  ]);
  if (!statusesAllowingPreflight.has(ex.status)) {
    throw new Error(`Preflight is not allowed when execution status is ${ex.status}.`);
  }

  const checks: { id: string; ok: boolean; detail: string }[] = [];
  const fail = (id: string, detail: string) => {
    checks.push({ id, ok: false, detail });
  };
  const pass = (id: string, detail: string) => {
    checks.push({ id, ok: true, detail });
  };

  if (!ex.messageStudioDraftId || !ex.messageStudioDraft) {
    fail("draft", "Shared draft link missing.");
  } else if (ex.messageStudioDraft.status !== MessageStudioDraftStatus.APPROVED_FOR_SEND_GOVERNANCE) {
    fail("draft_status", "Draft must be APPROVED_FOR_SEND_GOVERNANCE before preflight.");
  } else {
    pass("draft", "Shared draft present and governance-approved.");
  }

  const packetOk = isPlainObject(ex.sendPacketJson) && Object.keys(ex.sendPacketJson as object).length > 0;
  if (!packetOk) fail("send_packet", "sendPacketJson is required on execution (copy from Message Studio Send Packet).");
  else pass("send_packet", "Send packet JSON present.");

  if (!ex.subject?.trim()) fail("subject", "Subject required.");
  else pass("subject", "Subject present.");

  if (!ex.body?.trim()) fail("body", "Body required.");
  else pass("body", "Body present.");

  const audienceDefinitionId = ex.emailAudienceDefinitionId;
  if (!audienceDefinitionId) fail("audience", "Audience required.");
  else pass("audience", "Audience linked.");

  const audience =
    audienceDefinitionId == null
      ? null
      : await prisma.emailAudienceDefinition.findUnique({
          where: { id: audienceDefinitionId },
        });
  if (!audience || audience.status !== "ACTIVE") fail("audience_active", "Audience must be ACTIVE.");
  else pass("audience_active", "Audience ACTIVE.");

  const mailReadiness = getSendGridMailReadiness();
  if (ex.sendType === "SENDGRID_BROADCAST") {
    if (!mailReadiness.broadcastAllowed) {
      fail("sendgrid_broadcast_env", mailReadiness.notes.join(" ") || "SendGrid broadcast env incomplete.");
    } else pass("sendgrid_broadcast_env", "SendGrid broadcast env (key + from + ASM) present.");
  } else if (ex.sendType === "SENDGRID_TEST") {
    if (!mailReadiness.sendgridApiKeyConfigured || !mailReadiness.fromEmailConfigured || !mailReadiness.fromNameConfigured) {
      fail("sendgrid_test_env", "Test send requires SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME.");
    } else pass("sendgrid_test_env", "SendGrid test mail env present.");
  }

  const env = getSendGridEnvStatus();
  if (!env.sendgridApiKeyPresent) fail("sendgrid_key", "SENDGRID_API_KEY required.");
  else pass("sendgrid_key", "API key present (name only in logs).");

  if (ex.sendType === "SENDGRID_BROADCAST") {
    if (!ex.sendGridContactSyncRunId) {
      fail("sync_run", "SYNCED SendGridContactSyncRun required for broadcast.");
    } else if (!ex.sendGridContactSyncRun || ex.sendGridContactSyncRun.status !== "SYNCED") {
      fail("sync_run_status", "Contact sync run must be SYNCED before broadcast preflight.");
    } else pass("sync_run", "SYNCED contact sync run linked.");
  } else if (ex.sendType === "SENDGRID_TEST") {
    pass("sync_run", "Test execution — SYNCED sync run not required.");
  }

  const allProfiles =
    audienceDefinitionId == null ? [] : await loadAudienceProfilesWithEmail(audienceDefinitionId);
  const withEmail = allProfiles
    .map((p) => ({
      profileId: p.id,
      email: (p.primaryEmail ?? "").trim().toLowerCase(),
      source: p.source?.trim() ?? "",
    }))
    .filter((p) => p.email.includes("@"));

  const { allowed: nonSuppressed, excludedSuppressed } = await excludeSuppressedContacts(withEmail);

  const packet = isPlainObject(ex.sendPacketJson) ? (ex.sendPacketJson as Record<string, unknown>) : {};
  const importConsentOk = packet.importListConsentReviewed === true;
  const hasImportSource = withEmail.some(
    (p) => p.source.toLowerCase().includes("import") || p.source.toLowerCase().includes("contact_import"),
  );
  if (hasImportSource && !importConsentOk) {
    fail("import_consent", "Import-sourced profiles detected — set sendPacketJson.importListConsentReviewed true after review.");
  } else if (hasImportSource) {
    pass("import_consent", "Operator acknowledged import list consent in send packet.");
  } else {
    pass("import_consent", "No import-only source posture flagged.");
  }

  let readyCount = 0;
  const syncableSet = new Set(nonSuppressed.map((p) => p.profileId));
  for (const p of withEmail) {
    const suppressed = !syncableSet.has(p.profileId);
    if (suppressed) continue;
    if (hasImportSource && !importConsentOk) continue;
    readyCount += 1;
  }

  if (readyCount === 0) fail("recipients", "No READY recipients after suppression / consent gates.");
  else pass("recipients", `${readyCount} READY recipient(s).`);

  const allChecksOk = checks.every((c) => c.ok);

  await prisma.emailSendRecipient.deleteMany({ where: { sendExecutionId } });

  if (allChecksOk) {
    for (const p of withEmail) {
      const suppressed = !syncableSet.has(p.profileId);
      let status: EmailSendRecipientStatus;
      let suppressionReason: string | null = null;
      if (suppressed) {
        status = "EXCLUDED_SUPPRESSED";
        suppressionReason = "local_sendgrid_suppression_overlap";
      } else if (hasImportSource && !importConsentOk) {
        status = "EXCLUDED_MISSING_CONSENT";
      } else {
        status = "READY";
      }
      await prisma.emailSendRecipient.create({
        data: {
          sendExecutionId,
          email: p.email,
          emailContactProfileId: p.profileId,
          status,
          suppressionReason,
        },
      });
    }
  }

  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: {
      candidateRecipientCount: withEmail.length,
      suppressedRecipientCount: excludedSuppressed,
      finalRecipientCount: allChecksOk ? readyCount : 0,
      preflightByUserId,
      preflightAt: new Date(),
      preflightJson: {
        checkedAt: new Date().toISOString(),
        checks,
        automaticSendEnabled: false,
        queueSend: false,
      } as Prisma.InputJsonValue,
      status: allChecksOk ? "READY_FOR_TEST" : "PREFLIGHT_FAILED",
      errorSafe: allChecksOk ? null : checks.find((c) => !c.ok)?.detail ?? "Preflight failed.",
    },
  });

  return { ok: allChecksOk, checks, readyCount };
}

export async function markSendExecutionReadyForTest(sendExecutionId: string, userId: string | null) {
  const ex = await prisma.emailSendExecution.findUnique({ where: { id: sendExecutionId } });
  if (!ex) throw new Error("Not found.");
  if (ex.status !== "DRAFT" && ex.status !== "PREFLIGHT_FAILED") {
    return { ok: true, note: "Preflight already completed for this execution." };
  }
  await runSendExecutionPreflight(sendExecutionId, userId);
  return { ok: true };
}

export async function sendSendGridTestEmail(sendExecutionId: string, testRecipientEmail: string, sentByUserId: string | null) {
  const ex = await prisma.emailSendExecution.findUnique({ where: { id: sendExecutionId } });
  if (!ex || ex.status !== "READY_FOR_TEST") throw new Error("Execution must be READY_FOR_TEST.");
  const to = testRecipientEmail.trim();
  if (!to.includes("@")) throw new Error("Invalid test recipient.");

  const mail = getSendGridMailReadiness();
  if (!mail.sendgridApiKeyConfigured || !mail.fromEmailConfigured || !mail.fromNameConfigured) {
    throw new Error("SendGrid mail not configured for test send.");
  }

  const html = htmlForSend(ex.body, false);
  const text = textForSend(ex.body, false);
  const result = await sendSendGridSingleTestEmail({
    to,
    subject: `[TEST] ${ex.subject}`,
    html,
    text,
    fromEmail: ex.fromEmail || process.env.SENDGRID_FROM_EMAIL!.trim(),
    fromName: ex.fromName || process.env.SENDGRID_FROM_NAME!.trim(),
    replyToEmail: ex.replyToEmail,
  });

  if (!result.ok) {
    await prisma.emailSendExecution.update({
      where: { id: sendExecutionId },
      data: {
        errorSafe: result.safeMessage,
        providerResultJson: { testSend: false, reason: result.safeMessage } as Prisma.InputJsonValue,
      },
    });
    throw new Error(result.safeMessage);
  }

  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: {
      status: "TEST_SENT",
      testRecipientEmail: to,
      sentByUserId,
      providerResultJson: {
        testSend: true,
        testRecipientEmail: to,
        httpStatus: result.statusCode,
        sentAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
      errorSafe: null,
    },
  });
}

export async function markSendExecutionReadyForFinalApproval(sendExecutionId: string) {
  const ex = await prisma.emailSendExecution.findUnique({ where: { id: sendExecutionId } });
  if (!ex || ex.status !== "TEST_SENT") throw new Error("Execution must be TEST_SENT.");
  if (ex.sendType !== "SENDGRID_BROADCAST") {
    throw new Error("Final approval flow applies to SENDGRID_BROADCAST executions only.");
  }
  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: { status: "READY_FOR_FINAL_APPROVAL" },
  });
}

export async function approveSendExecutionFinal(sendExecutionId: string, approvedByUserId: string | null, note?: string) {
  const ex = await prisma.emailSendExecution.findUnique({ where: { id: sendExecutionId } });
  if (!ex || ex.status !== "READY_FOR_FINAL_APPROVAL") throw new Error("Execution must be READY_FOR_FINAL_APPROVAL.");
  if (ex.sendType !== "SENDGRID_BROADCAST") {
    throw new Error("Final approval applies to SENDGRID_BROADCAST executions only.");
  }
  await prisma.$transaction([
    prisma.emailSendApproval.create({
      data: {
        sendExecutionId,
        approvalType: "FINAL_SEND_APPROVAL",
        status: "APPROVED",
        note: note?.trim() ?? "",
        approvedByUserId,
        decidedAt: new Date(),
      },
    }),
    prisma.emailSendExecution.update({
      where: { id: sendExecutionId },
      data: {
        status: "FINAL_APPROVED",
        approvedByUserId,
        finalApprovedAt: new Date(),
        approvalJson: {
          finalApprovedAt: new Date().toISOString(),
          finalApprovedByUserId: approvedByUserId,
        } as Prisma.InputJsonValue,
      },
    }),
  ]);
}

export async function executeFinalSendGridSend(
  sendExecutionId: string,
  confirmationPhrase: string,
  sentByUserId: string | null,
) {
  const trimmed = confirmationPhrase.trim();
  if (trimmed !== EMAIL_SEND_FINAL_CONFIRMATION_PHRASE) {
    throw new Error(`Confirmation must be exactly: ${EMAIL_SEND_FINAL_CONFIRMATION_PHRASE}`);
  }

  const ex = await prisma.emailSendExecution.findUnique({
    where: { id: sendExecutionId },
    include: { recipients: true },
  });
  if (!ex || ex.status !== "FINAL_APPROVED") throw new Error("Execution must be FINAL_APPROVED.");
  if (ex.sendType !== "SENDGRID_BROADCAST") {
    throw new Error("Final governed multi-recipient send is only implemented for SENDGRID_BROADCAST.");
  }

  const asmId = readAsmGroupId();
  if (asmId === null || Number.isNaN(asmId)) {
    throw new Error("Broadcast requires SENDGRID_UNSUBSCRIBE_GROUP_ID (numeric ASM).");
  }

  await applySuppressionExclusions(sendExecutionId);
  const ready = await prisma.emailSendRecipient.findMany({
    where: { sendExecutionId, status: "READY" },
  });
  if (!ready.length) throw new Error("No READY recipients after suppression re-check.");

  const emails = ready.map((r) => r.email);
  const html = htmlForSend(ex.body, true);
  const text = textForSend(ex.body, true);
  const fromEmail = ex.fromEmail || process.env.SENDGRID_FROM_EMAIL?.trim() || "";
  const fromName = ex.fromName || process.env.SENDGRID_FROM_NAME?.trim() || "";

  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: { status: "SENDING", sentByUserId },
  });

  const result = await sendSendGridBroadcastEmail({
    recipientEmails: emails,
    subject: ex.subject,
    html,
    text,
    fromEmail,
    fromName,
    replyToEmail: ex.replyToEmail,
    asmGroupId: asmId,
    sendExecutionId,
    broadcastRecipientContext: ready.map((r) => ({
      email: r.email.trim().toLowerCase(),
      emailSendRecipientId: r.id,
    })),
  });
  if (!result.ok) {
    await prisma.emailSendExecution.update({
      where: { id: sendExecutionId },
      data: {
        status: "FAILED",
        errorSafe: result.safeMessage,
        providerResultJson: { ok: false } as Prisma.InputJsonValue,
      },
    });
    throw new Error(result.safeMessage);
  }
  await prisma.emailSendRecipient.updateMany({
    where: { sendExecutionId, status: "READY" },
    data: { status: "SUBMITTED" },
  });
  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      finalRecipientCount: ready.length,
      providerResultJson: {
        ok: true,
        batches: result.batches,
        lastStatusCode: result.lastStatusCode,
        recipientCount: ready.length,
        sentAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
      errorSafe: null,
    },
  });
}

export async function archiveSendExecution(sendExecutionId: string) {
  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });
}
