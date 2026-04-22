import {
  CampaignRecipientSendStatus,
  MessageDeliveryStatus,
  MessageDirection,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { recomputeCampaignStats } from "./campaign-processor";

export type WebhookDeliveryContext = {
  /** SendGrid `event` field. */
  sendgridEventType?: string | null;
  errorMessage?: string | null;
};

/**
 * After a provider updates `CommunicationMessage` (Twilio status or SendGrid event),
 * mirror state onto the linked `CommunicationCampaignRecipient` and recompute campaign aggregates.
 */
export async function syncCampaignRecipientFromOutboundMessage(
  messageId: string,
  ctx?: WebhookDeliveryContext
): Promise<void> {
  const msg = await prisma.communicationMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      direction: true,
      communicationCampaignId: true,
      communicationCampaignRecipientId: true,
      providerMessageId: true,
      deliveryStatus: true,
      openedAt: true,
      clickedAt: true,
      failedAt: true,
      errorMessage: true,
    },
  });
  if (!msg || msg.direction !== MessageDirection.OUTBOUND || !msg.communicationCampaignId) return;

  let recipientId = msg.communicationCampaignRecipientId;
  if (!recipientId && msg.providerMessageId) {
    const byProv = await prisma.communicationCampaignRecipient.findFirst({
      where: {
        communicationCampaignId: msg.communicationCampaignId,
        providerMessageId: msg.providerMessageId,
      },
      select: { id: true },
    });
    recipientId = byProv?.id ?? null;
  }
  if (!recipientId) return;

  const sg = (ctx?.sendgridEventType ?? "").toLowerCase();
  const terminalBounce = sg === "bounce" || sg === "blocked";
  const spamLike = sg === "spamreport" || sg === "spam_report";

  const failedLike =
    msg.deliveryStatus === MessageDeliveryStatus.FAILED || terminalBounce || spamLike;

  if (msg.deliveryStatus === MessageDeliveryStatus.DELIVERED) {
    await prisma.communicationCampaignRecipient.update({
      where: { id: recipientId },
      data: {
        sendStatus: CampaignRecipientSendStatus.DELIVERED,
        deliveredAt: new Date(),
        failedAt: null,
        lastError: null,
      },
    });
  } else if (msg.deliveryStatus === MessageDeliveryStatus.SENT) {
    await prisma.communicationCampaignRecipient.update({
      where: { id: recipientId },
      data: { sendStatus: CampaignRecipientSendStatus.SENT },
    });
  } else if (failedLike) {
    const bounced = terminalBounce || sg === "bounce" || sg === "dropped";
    await prisma.communicationCampaignRecipient.update({
      where: { id: recipientId },
      data: {
        sendStatus: bounced ? CampaignRecipientSendStatus.BOUNCED : CampaignRecipientSendStatus.FAILED,
        failedAt: msg.failedAt ?? new Date(),
        lastError: (ctx?.errorMessage ?? msg.errorMessage ?? sg) || "delivery failed",
      },
    });
  } else if (msg.deliveryStatus === MessageDeliveryStatus.OPENED) {
    const at = msg.openedAt ?? new Date();
    const cur = await prisma.communicationCampaignRecipient.findUnique({
      where: { id: recipientId },
      select: { engagementOpenedAt: true },
    });
    if (!cur?.engagementOpenedAt) {
      await prisma.communicationCampaignRecipient.update({
        where: { id: recipientId },
        data: { engagementOpenedAt: at },
      });
    }
  } else if (msg.deliveryStatus === MessageDeliveryStatus.CLICKED) {
    const at = msg.clickedAt ?? new Date();
    await prisma.communicationCampaignRecipient.update({
      where: { id: recipientId },
      data: { engagementClickedAt: at },
    });
  } else {
    return;
  }

  await recomputeCampaignStats(msg.communicationCampaignId);
}
