import { CampaignRecipientSendStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { recomputeCampaignStats } from "./campaign-processor";

/**
 * First inbound reply on a thread after a broadcast send: attribute to open campaign recipients.
 */
export async function markCampaignReplyForThread(threadId: string) {
  const recs = await prisma.communicationCampaignRecipient.findMany({
    where: {
      communicationThreadId: threadId,
      responseAt: null,
      sendStatus: { in: [CampaignRecipientSendStatus.SENT, CampaignRecipientSendStatus.DELIVERED] },
    },
    select: { id: true, communicationCampaignId: true },
  });
  if (!recs.length) return;
  const now = new Date();
  await prisma.communicationCampaignRecipient.updateMany({
    where: { id: { in: recs.map((r) => r.id) } },
    data: { responseAt: now },
  });
  const ids = [...new Set(recs.map((r) => r.communicationCampaignId))];
  for (const id of ids) {
    await recomputeCampaignStats(id);
  }
}
