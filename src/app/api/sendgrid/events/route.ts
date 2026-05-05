import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  getSendgridWebhookVerificationKey,
  sendgridEventWebhookHeaderNames,
  shouldRequireSendgridWebhookSignature,
  verifySendgridEventWebhook,
} from "@/lib/integrations/sendgrid/webhook-verify";
import {
  mapSendGridEventToSuppressionType,
  normalizeSendGridEventItem,
  parseSendGridEventWebhookJson,
  shouldCreateSuppressionForEvent,
} from "@/lib/sendgrid/event-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

/**
 * EMAIL-SENDGRID-FOUNDATION-1.0 — Event Webhook intake for `SendGridEvent` + `SendGridSuppression` only.
 * Does not send mail, does not call OpenAI, does not mutate User/VolunteerProfile.
 * Comms workbench continues to use `/api/webhooks/sendgrid` when configured separately.
 */
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
    return new Response("SENDGRID_WEBHOOK_VERIFICATION_KEY or SENDGRID_WEBHOOK_PUBLIC_KEY required in production", {
      status: 503,
    });
  }

  let parsed: unknown[];
  try {
    parsed = parseSendGridEventWebhookJson(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  for (const item of parsed) {
    const n = normalizeSendGridEventItem(item);
    if (!n) continue;

    const reason =
      typeof (item as { reason?: unknown }).reason === "string"
        ? (item as { reason: string }).reason
        : null;

    try {
      await prisma.sendGridEvent.create({
        data: {
          email: n.email,
          eventType: n.eventType,
          sendgridEventId: n.sendgridEventId,
          sendgridMessageId: n.sendgridMessageId,
          sendgridMarketingCampaignId: n.sendgridMarketingCampaignId,
          occurredAt: n.occurredAt,
          rawEventJson: n.sanitizedPayload as Prisma.InputJsonValue,
          metadataJson: { source: "api/sendgrid/events" } as Prisma.InputJsonValue,
        },
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) {
        /* ignore other row failures — webhook must stay idempotent */
      }
    }

    if (n.email && shouldCreateSuppressionForEvent(n.eventType, reason)) {
      const st = mapSendGridEventToSuppressionType(n.eventType, reason);
      if (st) {
        try {
          await prisma.sendGridSuppression.create({
            data: {
              email: n.email.trim().toLowerCase(),
              suppressionType: st,
              sendgridEventId: n.sendgridEventId,
              source: "sendgrid_webhook",
              occurredAt: n.occurredAt,
              metadataJson: {
                eventType: n.eventType,
                reason: reason ?? null,
              } as Prisma.InputJsonValue,
            },
          });
        } catch {
          /* ignore duplicate / bad row */
        }
      }
    }
  }

  return new Response(null, { status: 204 });
}
