import {
  CommunicationChannel,
  CommsSendProvider,
  MessageDeliveryStatus,
  MessageDirection,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getEffectivePreferenceForThread, canSendEmail } from "@/lib/comms/preferences";
import { touchThreadAfterOutbound } from "@/lib/comms/threads";
import { sendStaffGmailMessage } from "./gmail-api";

export type SendGmailResult =
  | { ok: true; messageId: string; gmailMessageId: string; gmailThreadId: string | null }
  | { ok: false; error: string };

/**
 * Outbound 1:1 email via a staff member’s Google workspace/Gmail. Does **not** go through SendGrid.
 * Respects the same `ContactPreference` / email gate as broadcast rail.
 */
export async function sendGmailAndRecord(params: {
  staffUserId: string;
  threadId: string;
  to: string;
  subject: string;
  text: string;
  sentByUserId: string | null;
  /** If set, try to keep Gmail thread continuity with a prior GMAIL message on this thread. */
  inReplyToCommunicationMessageId?: string | null;
}): Promise<SendGmailResult> {
  const to = params.to.trim();
  if (!to.includes("@")) return { ok: false, error: "Invalid email address." };
  const thread = await prisma.communicationThread.findUnique({ where: { id: params.threadId } });
  if (!thread) return { ok: false, error: "Thread not found." };
  {
    const p = await getEffectivePreferenceForThread(thread);
    const gate = canSendEmail(p);
    if (!gate.ok) {
      await prisma.communicationMessage.create({
        data: {
          threadId: params.threadId,
          channel: CommunicationChannel.EMAIL,
          direction: MessageDirection.OUTBOUND,
          provider: CommsSendProvider.GMAIL,
          toAddress: to,
          subject: params.subject,
          bodyText: params.text,
          deliveryStatus: MessageDeliveryStatus.FAILED,
          errorMessage: gate.reason,
          failedAt: new Date(),
          sentByUserId: params.sentByUserId ?? undefined,
        },
      });
      return { ok: false, error: gate.reason };
    }
  }

  const acc = await prisma.staffGmailAccount.findUnique({ where: { userId: params.staffUserId, isActive: true } });
  if (!acc) return { ok: false, error: "Gmail is not connected for the staff actor (Comms → connect Gmail)." };

  let threadId: string | undefined;
  if (params.inReplyToCommunicationMessageId) {
    const prior = await prisma.communicationMessage.findFirst({
      where: {
        id: params.inReplyToCommunicationMessageId,
        threadId: params.threadId,
        provider: CommsSendProvider.GMAIL,
      },
    });
    if (prior?.gmailThreadId) threadId = prior.gmailThreadId;
  }
  if (!threadId) {
    const lastGmail = await prisma.communicationMessage.findFirst({
      where: {
        threadId: params.threadId,
        provider: CommsSendProvider.GMAIL,
        direction: MessageDirection.OUTBOUND,
        gmailThreadId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });
    if (lastGmail?.gmailThreadId) threadId = lastGmail.gmailThreadId;
  }

  const row = await prisma.communicationMessage.create({
    data: {
      threadId: params.threadId,
      channel: CommunicationChannel.EMAIL,
      direction: MessageDirection.OUTBOUND,
      provider: CommsSendProvider.GMAIL,
      toAddress: to,
      fromAddress: acc.sendAsEmail,
      subject: params.subject,
      bodyText: params.text,
      deliveryStatus: MessageDeliveryStatus.QUEUED,
      sentByUserId: params.sentByUserId ?? undefined,
    },
  });

  const sent = await sendStaffGmailMessage({
    userId: params.staffUserId,
    to,
    subject: params.subject,
    body: params.text,
    threadId: threadId ?? null,
  });

  if (!sent.id || sent.rawError) {
    const err = sent.rawError || "Gmail send failed";
    await prisma.staffGmailAccount.update({
      where: { userId: params.staffUserId },
      data: { lastError: err },
    }).catch(() => {});
    await prisma.communicationMessage.update({
      where: { id: row.id },
      data: {
        deliveryStatus: MessageDeliveryStatus.FAILED,
        failedAt: new Date(),
        errorMessage: err,
      },
    });
    return { ok: false, error: err };
  }

  await prisma.communicationMessage.update({
    where: { id: row.id },
    data: {
      deliveryStatus: MessageDeliveryStatus.SENT,
      providerMessageId: sent.id,
      gmailMessageId: sent.id,
      gmailThreadId: sent.threadId,
    },
  });
  await touchThreadAfterOutbound(params.threadId);
  return { ok: true, messageId: row.id, gmailMessageId: sent.id, gmailThreadId: sent.threadId };
}
