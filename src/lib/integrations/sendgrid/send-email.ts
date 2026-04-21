import sendgrid from "@sendgrid/mail";
import {
  CommunicationChannel,
  CommsSendProvider,
  MessageDeliveryStatus,
  MessageDirection,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSendgridEnv, isSendgridConfigured } from "./env";
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
}): Promise<SendEmailResult> {
  const to = params.to.trim();
  if (!to.includes("@")) return { ok: false, error: "Invalid email address." };

  if (!isSendgridConfigured()) {
    await prisma.communicationMessage.create({
      data: {
        threadId: params.threadId,
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
      customArgs: { commMsgId: msgRow.id },
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
