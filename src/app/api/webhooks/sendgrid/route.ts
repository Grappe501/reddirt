import { MessageDeliveryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

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
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }
  if (!Array.isArray(raw)) {
    return new Response("expected array", { status: 400 });
  }

  for (const ev of raw as SgEvent[]) {
    const st = mapEvent(ev.event);
    if (!st) continue;

    let msg = null;
    if (ev.commMsgId) {
      msg = await prisma.communicationMessage.findUnique({ where: { id: ev.commMsgId } });
    }
    if (!msg && ev.sg_message_id) {
      msg = await prisma.communicationMessage.findFirst({
        where: { providerMessageId: { contains: ev.sg_message_id } },
      });
    }
    if (!msg) continue;

    const data: { deliveryStatus: MessageDeliveryStatus; openedAt?: Date; clickedAt?: Date; failedAt?: Date; errorMessage?: string | null } = {
      deliveryStatus: st,
    };
    if (st === MessageDeliveryStatus.OPENED) data.openedAt = new Date();
    if (st === MessageDeliveryStatus.CLICKED) data.clickedAt = new Date();
    if (st === MessageDeliveryStatus.FAILED) {
      data.failedAt = new Date();
      data.errorMessage = ev.reason ?? ev.event ?? "sendgrid";
    }
    await prisma.communicationMessage.update({ where: { id: msg.id }, data });
  }

  return new Response("ok", { status: 200 });
}
