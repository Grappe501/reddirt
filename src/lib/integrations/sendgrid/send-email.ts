import sendgrid from "@sendgrid/mail";
import {
  CommunicationChannel,
  CommsSendProvider,
  MessageDeliveryStatus,
  MessageDirection,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSendgridEnv, isSendgridConfigured } from "./env";
import { getEffectivePreferenceForThread, canSendEmail } from "@/lib/comms/preferences";
import { touchThreadAfterOutbound } from "@/lib/comms/threads";

export type SendEmailResult =
  | { ok: true; messageId: string; providerMessageId: string | null }
  | { ok: false; error: string };

/**
 * Outbound email: persist message, call SendGrid, store message id / header id when returned.
 */
export async function sendEmailAndRecord(params: {
  threadId: string;
  to: string;
  subject: string;
  text: string;
  sentByUserId: string | null;
  communicationCampaignId?: string;
  communicationCampaignRecipientId?: string;
}): Promise<SendEmailResult> {
  const cExtra: { communicationCampaignId?: string; communicationCampaignRecipientId?: string } = {};
  if (params.communicationCampaignId) cExtra.communicationCampaignId = params.communicationCampaignId;
  if (params.communicationCampaignRecipientId) cExtra.communicationCampaignRecipientId = params.communicationCampaignRecipientId;
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
          ...cExtra,
          channel: CommunicationChannel.EMAIL,
          direction: MessageDirection.OUTBOUND,
          provider: CommsSendProvider.SENDGRID,
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

  if (!isSendgridConfigured()) {
    await prisma.communicationMessage.create({
      data: {
        threadId: params.threadId,
        ...cExtra,
        channel: CommunicationChannel.EMAIL,
        direction: MessageDirection.OUTBOUND,
        provider: CommsSendProvider.SENDGRID,
        toAddress: to,
        subject: params.subject,
        bodyText: params.text,
        deliveryStatus: MessageDeliveryStatus.FAILED,
        errorMessage: "SendGrid is not configured (SENDGRID_API_KEY / SENDGRID_FROM_EMAIL).",
        failedAt: new Date(),
        sentByUserId: params.sentByUserId ?? undefined,
      },
    });
    return { ok: false, error: "SendGrid is not configured." };
  }

  const { apiKey, fromEmail, fromName } = getSendgridEnv();
  sendgrid.setApiKey(apiKey);

  const msgRow = await prisma.communicationMessage.create({
    data: {
      threadId: params.threadId,
      ...cExtra,
      channel: CommunicationChannel.EMAIL,
      direction: MessageDirection.OUTBOUND,
      provider: CommsSendProvider.SENDGRID,
      toAddress: to,
      fromAddress: fromEmail,
      subject: params.subject,
      bodyText: params.text,
      deliveryStatus: MessageDeliveryStatus.QUEUED,
      sentByUserId: params.sentByUserId ?? undefined,
    },
  });

  try {
    const [res] = await sendgrid.send({
      to,
      from: { email: fromEmail, name: fromName },
      subject: params.subject,
      text: params.text,
      customArgs: {
        commMsgId: msgRow.id,
        ...(params.communicationCampaignId ? { commCampaignId: params.communicationCampaignId } : {}),
        ...(params.communicationCampaignRecipientId
          ? { commRecipientId: params.communicationCampaignRecipientId }
          : {}),
      },
    });

    const providerMessageId =
      (res?.headers["x-message-id"] as string | undefined) ??
      (res?.headers["X-Message-Id"] as string | undefined) ??
      null;
    await prisma.communicationMessage.update({
      where: { id: msgRow.id },
      data: {
        deliveryStatus: MessageDeliveryStatus.SENT,
        providerMessageId: providerMessageId || msgRow.id,
      },
    });
    await touchThreadAfterOutbound(params.threadId);
    return { ok: true, messageId: msgRow.id, providerMessageId: providerMessageId as string | null };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    await prisma.communicationMessage.update({
      where: { id: msgRow.id },
      data: {
        deliveryStatus: MessageDeliveryStatus.FAILED,
        failedAt: new Date(),
        errorMessage: err,
      },
    });
    return { ok: false, error: err };
  }
}
