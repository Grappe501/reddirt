import twilio from "twilio";
import {
  CommunicationActionType,
  CommsQueueStatus,
  CommunicationChannel,
  CommsSendProvider,
  MessageDeliveryStatus,
  MessageDirection,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { findOrCreateThreadForInboundPhone, touchThreadAfterInbound } from "@/lib/comms/threads";
import { getTwilioEnv } from "@/lib/integrations/twilio/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toParams(body: string): Record<string, string> {
  const p = new URLSearchParams(body);
  const o: Record<string, string> = {};
  p.forEach((v, k) => {
    o[k] = v;
  });
  return o;
}

export function GET() {
  return new Response("ok", { status: 200 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const params = toParams(raw);
  const { authToken } = getTwilioEnv();

  if (authToken) {
    const signature = request.headers.get("X-Twilio-Signature") ?? "";
    const valid = twilio.validateRequest(authToken, signature, request.url, params);
    if (!valid) {
      return new Response("invalid signature", { status: 403 });
    }
  }

  if (params.MessageStatus) {
    await handleStatus(params);
    return new Response("ok", { status: 200 });
  }

  if (params.From && (params.MessageSid || params.SmsMessageSid)) {
    await handleInboundOrEcho(params);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  return new Response("ok", { status: 200 });
}

async function handleInboundOrEcho(params: Record<string, string>) {
  const from = params.From ?? "";
  const body = (params.Body ?? "").trim() || "(empty message)";
  const sid = params.MessageSid ?? params.SmsMessageSid ?? `manual-${Date.now()}`;

  const already = await prisma.communicationMessage.findFirst({
    where: { provider: CommsSendProvider.TWILIO, providerMessageId: sid },
  });
  if (already) return;

  const thread = await findOrCreateThreadForInboundPhone({ from, body });
  await touchThreadAfterInbound(thread.id);

  await prisma.communicationMessage.create({
    data: {
      threadId: thread.id,
      channel: CommunicationChannel.SMS,
      direction: MessageDirection.INBOUND,
      provider: CommsSendProvider.TWILIO,
      providerMessageId: sid,
      fromAddress: from,
      toAddress: params.To ?? null,
      bodyText: body,
      deliveryStatus: MessageDeliveryStatus.RECEIVED,
    },
  });

  const existingSuggest = await prisma.communicationActionQueue.findFirst({
    where: {
      threadId: thread.id,
      actionType: CommunicationActionType.AI_SUGGEST_FOLLOWUP,
      queueStatus: { in: [CommsQueueStatus.PENDING, CommsQueueStatus.PROCESSING] },
    },
  });
  if (!existingSuggest) {
    await prisma.communicationActionQueue.create({
      data: {
        actionType: CommunicationActionType.AI_SUGGEST_FOLLOWUP,
        threadId: thread.id,
        payloadJson: { source: "twilio_inbound" },
        queueStatus: CommsQueueStatus.PENDING,
      },
    });
  }
}

function mapTwilioMessageStatus(
  s: string | undefined
): MessageDeliveryStatus | null {
  if (!s) return null;
  const u = s.toLowerCase();
  if (u === "delivered" || u === "received") return MessageDeliveryStatus.DELIVERED;
  if (u === "sent" || u === "queued" || u === "accepted" || u === "sending") return MessageDeliveryStatus.SENT;
  if (u === "failed" || u === "undelivered" || u === "canceled") return MessageDeliveryStatus.FAILED;
  if (u === "read") return MessageDeliveryStatus.DELIVERED;
  return null;
}

async function handleStatus(params: Record<string, string>) {
  const sid = params.MessageSid;
  if (!sid) return;
  const st = mapTwilioMessageStatus(params.MessageStatus);
  if (!st) return;

  const message = await prisma.communicationMessage.findFirst({
    where: { provider: CommsSendProvider.TWILIO, providerMessageId: sid, direction: MessageDirection.OUTBOUND },
  });
  if (!message) return;

  await prisma.communicationMessage.update({
    where: { id: message.id },
    data: {
      deliveryStatus: st,
      failedAt: st === MessageDeliveryStatus.FAILED ? new Date() : null,
      errorMessage: params.ErrorMessage ?? (params.ErrorCode ? `code ${params.ErrorCode}` : null),
    },
  });
}
