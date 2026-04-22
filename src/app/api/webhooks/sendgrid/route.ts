import { MessageDeliveryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { applySendgridEventToContactPreference } from "@/lib/comms/preferences";
import { syncCampaignRecipientFromOutboundMessage } from "@/lib/comms/campaign-webhook-sync";
import {
  getSendgridWebhookVerificationKey,
  sendgridEventWebhookHeaderNames,
  shouldRequireSendgridWebhookSignature,
  verifySendgridEventWebhook,
} from "@/lib/integrations/sendgrid/webhook-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SgEvent = {
  event?: string;
  email?: string;
  timestamp?: number;
  sg_message_id?: string;
  "smtp-id"?: string;
  commMsgId?: string;
  reason?: string;
};

function mapEvent(event: string | undefined): MessageDeliveryStatus | null {
  if (!event) return null;
  const e = event.toLowerCase();
  if (e === "delivered") return MessageDeliveryStatus.DELIVERED;
  if (e === "processed" || e === "sent") return MessageDeliveryStatus.SENT;
  if (e === "open") return MessageDeliveryStatus.OPENED;
  if (e === "click") return MessageDeliveryStatus.CLICKED;
  if (e === "dropped" || e === "bounce" || e === "deferred" || e === "spamreport") return MessageDeliveryStatus.FAILED;
  return null;
}

export function GET() {
  return new Response("ok", { status: 200 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const { signature, timestamp } = sendgridEventWebhookHeaderNames();
  const key = getSendgridWebhookVerificationKey();
  const needSig = shouldRequireSendgridWebhookSignature();
  if (key) {
    const ok = verifySendgridEventWebhook(
      key,
      raw,
      request.headers.get(signature),
      request.headers.get(timestamp)
    );
    if (!ok) {
      return new Response("invalid signature", { status: 401 });
    }
  } else if (needSig) {
    return new Response("SENDGRID_WEBHOOK_VERIFICATION_KEY required in production", { status: 503 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }
  if (!Array.isArray(parsed)) {
    return new Response("expected array", { status: 400 });
  }

  for (const ev of parsed as SgEvent[]) {
    const st = mapEvent(ev.event);
    if (st) {
      let msg = null;
      if (ev.commMsgId) {
        msg = await prisma.communicationMessage.findUnique({ where: { id: ev.commMsgId } });
      }
      if (!msg && ev.sg_message_id) {
        msg = await prisma.communicationMessage.findFirst({
          where: { providerMessageId: { contains: ev.sg_message_id } },
        });
      }
      if (msg) {
        const data: {
          deliveryStatus: MessageDeliveryStatus;
          openedAt?: Date;
          clickedAt?: Date;
          failedAt?: Date;
          errorMessage?: string | null;
        } = {
          deliveryStatus: st,
        };
        if (st === MessageDeliveryStatus.OPENED) data.openedAt = new Date();
        if (st === MessageDeliveryStatus.CLICKED) data.clickedAt = new Date();
        if (st === MessageDeliveryStatus.FAILED) {
          data.failedAt = new Date();
          data.errorMessage = ev.reason ?? ev.event ?? "sendgrid";
        }
        await prisma.communicationMessage.update({ where: { id: msg.id }, data });
        void syncCampaignRecipientFromOutboundMessage(msg.id, {
          sendgridEventType: ev.event,
          errorMessage: data.errorMessage,
        });
      }
    }

    await applySendgridEventToContactPreference(ev);
  }

  return new Response("ok", { status: 200 });
}
