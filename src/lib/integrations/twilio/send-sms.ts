import twilio from "twilio";
import {
  CommunicationChannel,
  CommsSendProvider,
  MessageDeliveryStatus,
  MessageDirection,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getTwilioEnv, isTwilioConfigured } from "./env";
import { normalizeUsPhone } from "@/lib/comms/phone";
import { touchThreadAfterOutbound } from "@/lib/comms/threads";

export type SendSmsResult =
  | { ok: true; messageId: string; providerMessageId: string }
  | { ok: false; error: string };

/**
 * Outbound SMS: persist message, call Twilio, update row with provider id + status.
 */
export async function sendSmsAndRecord(params: {
  threadId: string;
  to: string;
  body: string;
  sentByUserId: string | null;
}): Promise<SendSmsResult> {
  const to = normalizeUsPhone(params.to);
  if (!to) return { ok: false, error: "Invalid destination phone number." };
  if (!isTwilioConfigured()) {
    const row = await prisma.communicationMessage.create({
      data: {
        threadId: params.threadId,
        channel: CommunicationChannel.SMS,
        direction: MessageDirection.OUTBOUND,
        provider: CommsSendProvider.TWILIO,
        toAddress: to,
        bodyText: params.body,
        deliveryStatus: MessageDeliveryStatus.FAILED,
        errorMessage: "Twilio is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_SMS_FROM).",
        failedAt: new Date(),
        sentByUserId: params.sentByUserId ?? undefined,
      },
    });
    void row;
    return { ok: false, error: "Twilio is not configured." };
  }

  const { accountSid, authToken, smsFrom } = getTwilioEnv();
  const client = twilio(accountSid, authToken);

  const msgRow = await prisma.communicationMessage.create({
    data: {
      threadId: params.threadId,
      channel: CommunicationChannel.SMS,
      direction: MessageDirection.OUTBOUND,
      provider: CommsSendProvider.TWILIO,
      toAddress: to,
      bodyText: params.body,
      deliveryStatus: MessageDeliveryStatus.QUEUED,
      sentByUserId: params.sentByUserId ?? undefined,
    },
  });

  try {
    const tmsg = await client.messages.create({ from: smsFrom, to, body: params.body });
    await prisma.communicationMessage.update({
      where: { id: msgRow.id },
      data: {
        providerMessageId: tmsg.sid,
        deliveryStatus: tmsg.status === "failed" ? MessageDeliveryStatus.FAILED : MessageDeliveryStatus.SENT,
        failedAt: tmsg.status === "failed" ? new Date() : null,
        errorMessage: tmsg.errorMessage ?? null,
      },
    });
    await touchThreadAfterOutbound(params.threadId);
    if (tmsg.status === "failed")
      return { ok: false, error: tmsg.errorMessage || "Twilio reported failed send." };
    return { ok: true, messageId: msgRow.id, providerMessageId: tmsg.sid };
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
