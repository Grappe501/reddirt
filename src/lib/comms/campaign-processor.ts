import { CampaignRecipientSendStatus, CommunicationCampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendEmailAndRecord } from "@/lib/integrations/sendgrid/send-email";
import { sendSmsAndRecord } from "@/lib/integrations/twilio/send-sms";
import { findOrCreateThreadForBroadcast } from "./campaign-thread";
import { defaultAudienceDefinition, type AudienceDefinition } from "./audience-definition";
import { getEffectivePreferenceByIdentity } from "./preferences";
import { resolveAudience } from "./audience-resolve";

const BATCH = 12;
const LOCK_MS = 90_000;

function renderBody(tpl: string, row: { name?: string | null; email?: string | null }): string {
  const first = row.name?.split(/\s+/)[0] || row.email?.split("@")[0] || "there";
  return tpl.replace(/\{\{firstName\}\}/g, first).replace(/\{\{name\}\}/g, row.name || first);
}

function pickBodySubject(c: {
  subjectText: string | null;
  bodyText: string | null;
  template: { subjectTemplate: string | null; bodyTemplate: string } | null;
}) {
  const subj = c.subjectText?.trim() || c.template?.subjectTemplate || "";
  const body = c.bodyText?.trim() || c.template?.bodyTemplate || "";
  return { subject: subj, body };
}

/**
 * (Re)builds recipient rows from `audienceDefinitionJson`. Skips if any recipient already left PENDING/PROCESSING chain with delivered etc.
 */
export async function seedCampaignRecipients(campaignId: string) {
  const c = await prisma.communicationCampaign.findUnique({
    where: { id: campaignId },
    include: { template: true, audienceSegment: true },
  });
  if (!c) return { ok: false as const, error: "not_found" };
  const terminal = await prisma.communicationCampaignRecipient.count({
    where: {
      communicationCampaignId: campaignId,
      sendStatus: { in: [CampaignRecipientSendStatus.SENT, CampaignRecipientSendStatus.DELIVERED] },
    },
  });
  if (terminal > 0) {
    return { ok: true as const, skipped: true as const };
  }
  await prisma.communicationCampaignRecipient.deleteMany({ where: { communicationCampaignId: campaignId } });
  let def = { ...defaultAudienceDefinition(), ...(c.audienceDefinitionJson as object) } as AudienceDefinition;
  if (c.audienceSegment?.definitionJson) {
    def = { ...def, ...(c.audienceSegment.definitionJson as object) } as AudienceDefinition;
  }
  const { rows } = await resolveAudience(def, c.channel);
  for (const r of rows) {
    if (r.suppressed) {
      const pref = r.userId
        ? await getEffectivePreferenceByIdentity({ userId: r.userId, volunteerProfileId: r.volunteerProfileId })
        : null;
      await prisma.communicationCampaignRecipient.create({
        data: {
          communicationCampaignId: campaignId,
          userId: r.userId ?? undefined,
          volunteerProfileId: r.volunteerProfileId ?? undefined,
          communicationThreadId: r.threadId ?? undefined,
          channel: r.channel,
          recipientEmail: r.email,
          recipientPhone: r.phone,
          sendStatus: CampaignRecipientSendStatus.SKIPPED_SUPPRESSION,
          unsubscribeStateSnapshot: {
            reason: r.suppressionReason,
            pref: pref
              ? {
                  email: pref.emailOptInStatus,
                  sms: pref.smsOptInStatus,
                  globalUnsub: Boolean(pref.globalUnsubscribeAt),
                }
              : null,
          } as object,
        },
      });
      continue;
    }
    if (r.channel === "EMAIL" && !r.email) {
      await prisma.communicationCampaignRecipient.create({
        data: {
          communicationCampaignId: campaignId,
          userId: r.userId ?? undefined,
          volunteerProfileId: r.volunteerProfileId ?? undefined,
          communicationThreadId: r.threadId ?? undefined,
          channel: r.channel,
          recipientEmail: r.email,
          recipientPhone: r.phone,
          sendStatus: CampaignRecipientSendStatus.SKIPPED_NO_ADDRESS,
        },
      });
      continue;
    }
    if (r.channel === "SMS" && !r.phone) {
      await prisma.communicationCampaignRecipient.create({
        data: {
          communicationCampaignId: campaignId,
          userId: r.userId ?? undefined,
          volunteerProfileId: r.volunteerProfileId ?? undefined,
          communicationThreadId: r.threadId ?? undefined,
          channel: r.channel,
          recipientEmail: r.email,
          recipientPhone: r.phone,
          sendStatus: CampaignRecipientSendStatus.SKIPPED_NO_ADDRESS,
        },
      });
      continue;
    }
    await prisma.communicationCampaignRecipient.create({
      data: {
        communicationCampaignId: campaignId,
        userId: r.userId ?? undefined,
        volunteerProfileId: r.volunteerProfileId ?? undefined,
        communicationThreadId: r.threadId ?? undefined,
        channel: r.channel,
        recipientEmail: r.email,
        recipientPhone: r.phone,
        sendStatus: CampaignRecipientSendStatus.PENDING,
        idempotencyKey: `${campaignId}-${r.dedupeKey}`,
      },
    });
  }
  const total = await prisma.communicationCampaignRecipient.count({ where: { communicationCampaignId: campaignId } });
  const sup = await prisma.communicationCampaignRecipient.count({
    where: {
      communicationCampaignId: campaignId,
      sendStatus: { in: [CampaignRecipientSendStatus.SKIPPED_SUPPRESSION, CampaignRecipientSendStatus.SKIPPED_NO_ADDRESS] },
    },
  });
  await prisma.communicationCampaign.update({
    where: { id: campaignId },
    data: {
      totalRecipients: total,
      suppressedCount: sup,
    },
  });
  return { ok: true as const, count: total };
}

export async function recomputeCampaignStats(campaignId: string) {
  const g = await prisma.communicationCampaignRecipient.groupBy({
    by: ["sendStatus"],
    where: { communicationCampaignId: campaignId },
    _count: { _all: true },
  });
  const map = Object.fromEntries(g.map((x) => [x.sendStatus, x._count._all])) as Record<string, number>;
  const get = (k: string) => map[k] ?? 0;
  const total = g.reduce((s, x) => s + x._count._all, 0);
  const suppressedCount =
    get("SKIPPED_SUPPRESSION") + get("SKIPPED_NO_ADDRESS");
  const sentAttempted = get("SENT") + get("DELIVERED") + get("FAILED") + get("BOUNCED");
  const failedCount = get("FAILED") + get("BOUNCED");
  const deliveredCount = get("DELIVERED");
  const replyWithResponse = await prisma.communicationCampaignRecipient.count({
    where: { communicationCampaignId: campaignId, responseAt: { not: null } },
  });
  const [engagementOpenCount, engagementClickCount] = await Promise.all([
    prisma.communicationCampaignRecipient.count({
      where: { communicationCampaignId: campaignId, engagementOpenedAt: { not: null } },
    }),
    prisma.communicationCampaignRecipient.count({
      where: { communicationCampaignId: campaignId, engagementClickedAt: { not: null } },
    }),
  ]);
  const optOutCount = get("SKIPPED_SUPPRESSION");
  await prisma.communicationCampaign.update({
    where: { id: campaignId },
    data: {
      totalRecipients: total,
      suppressedCount,
      sentCount: sentAttempted,
      deliveredCount,
      failedCount,
      replyCount: replyWithResponse,
      optOutCount,
      engagementOpenCount,
      engagementClickCount,
      statsJson: {
        ...map,
        replyByResponse: replyWithResponse,
        engagementOpenCount,
        engagementClickCount,
      } as object,
    },
  });
}

/**
 * Picks up QUEUED or SENDING campaigns and sends up to `BATCH` pending recipients.
 */
/**
 * Clear expired send locks and mark SENDING campaigns complete when there are no pending rows.
 * Safe to run from cron on every tick.
 */
export async function recoverStuckCampaignBatches(): Promise<{
  locksCleared: number;
  campaignsCompleted: string[];
}> {
  const now = new Date();
  const stuckSending = await prisma.communicationCampaign.findMany({
    where: {
      status: CommunicationCampaignStatus.SENDING,
      processingLockUntil: { not: null, lt: now },
    },
    select: { id: true },
  });
  let locksCleared = 0;
  for (const c of stuckSending) {
    await prisma.communicationCampaign.update({
      where: { id: c.id },
      data: { processingLockUntil: null, lastProcessError: "Lock cleared (stuck recovery; worker may have died)." },
    });
    locksCleared += 1;
  }

  const campaignsCompleted: string[] = [];
  const maybeDone = await prisma.communicationCampaign.findMany({
    where: { status: CommunicationCampaignStatus.SENDING },
    select: { id: true },
  });
  for (const c of maybeDone) {
    const pending = await prisma.communicationCampaignRecipient.count({
      where: { communicationCampaignId: c.id, sendStatus: CampaignRecipientSendStatus.PENDING },
    });
    if (pending > 0) continue;
    await prisma.communicationCampaign.update({
      where: { id: c.id },
      data: {
        status: CommunicationCampaignStatus.COMPLETE,
        completedAt: new Date(),
        processingLockUntil: null,
        lastProcessError: null,
      },
    });
    await recomputeCampaignStats(c.id);
    campaignsCompleted.push(c.id);
  }
  return { locksCleared, campaignsCompleted };
}

export async function processCommsCampaignBatch(params?: { campaignId?: string }): Promise<{
  processed: number;
  campaigns: string[];
  recovery?: { locksCleared: number; campaignsCompleted: string[] };
}> {
  const recovery = await recoverStuckCampaignBatches();
  const now = new Date();
  if (params?.campaignId) {
    const c = await prisma.communicationCampaign.findFirst({
      where: {
        id: params.campaignId,
        status: { in: [CommunicationCampaignStatus.QUEUED, CommunicationCampaignStatus.SENDING, CommunicationCampaignStatus.PAUSED] },
      },
      include: { template: true },
    });
    if (!c) return { processed: 0, campaigns: [], recovery };
    if (c.status === CommunicationCampaignStatus.PAUSED) return { processed: 0, campaigns: [], recovery };
    if (c.processingLockUntil && c.processingLockUntil > now) return { processed: 0, campaigns: [], recovery };
    const r = await processOneCampaign(c);
    return { processed: r.processed, campaigns: r.campaigns, recovery };
  }

  const list = await prisma.communicationCampaign.findMany({
    where: {
      status: { in: [CommunicationCampaignStatus.QUEUED, CommunicationCampaignStatus.SENDING] },
      OR: [{ scheduledAt: { lte: now } }, { scheduledAt: null }],
      NOT: { status: CommunicationCampaignStatus.PAUSED },
    },
    take: 5,
    orderBy: { updatedAt: "asc" },
    include: { template: true },
  });

  let processed = 0;
  const campaigns: string[] = [];
  for (const c of list) {
    if (c.processingLockUntil && c.processingLockUntil > now) continue;
    const r = await processOneCampaign(c);
    processed += r.processed;
    if (r.processed) campaigns.push(c.id);
  }
  return { processed, campaigns, recovery };
}

type CampaignWithTemplate = Awaited<
  ReturnType<typeof prisma.communicationCampaign.findFirst<{ include: { template: true } }>>
>;

async function processOneCampaign(c: NonNullable<CampaignWithTemplate>): Promise<{ processed: number; campaigns: string[] }> {
  const now = new Date();
  const lock = new Date(Date.now() + LOCK_MS);
  await prisma.communicationCampaign.update({
    where: { id: c.id },
    data: {
      status: CommunicationCampaignStatus.SENDING,
      startedAt: c.startedAt ?? now,
      processingLockUntil: lock,
    },
  });

  const { subject, body: rawBody } = pickBodySubject(c);
  if (!rawBody.trim()) {
    await prisma.communicationCampaign.update({
      where: { id: c.id },
      data: {
        status: CommunicationCampaignStatus.FAILED,
        lastProcessError: "Missing body text or template content.",
        processingLockUntil: null,
      },
    });
    return { processed: 0, campaigns: [c.id] };
  }
  let processed = 0;
  const pending = await prisma.communicationCampaignRecipient.findMany({
    where: { communicationCampaignId: c.id, sendStatus: CampaignRecipientSendStatus.PENDING },
    take: BATCH,
    orderBy: { id: "asc" },
  });

  for (const rec of pending) {
    if (!rec.userId && !rec.recipientEmail && !rec.recipientPhone) {
      await prisma.communicationCampaignRecipient.update({
        where: { id: rec.id },
        data: { sendStatus: CampaignRecipientSendStatus.SKIPPED_NO_ADDRESS },
      });
      continue;
    }
    const user = rec.userId
      ? await prisma.user.findUnique({ where: { id: rec.userId }, select: { name: true, email: true } })
      : null;
    const body = renderBody(rawBody, { name: user?.name, email: user?.email ?? rec.recipientEmail });
    const sub = renderBody(subject, { name: user?.name, email: user?.email ?? rec.recipientEmail });

    const threadId = await findOrCreateThreadForBroadcast({
      userId: rec.userId,
      volunteerProfileId: rec.volunteerProfileId,
      email: rec.recipientEmail,
      phone: rec.recipientPhone,
      countyId: null,
    });
    await prisma.communicationCampaignRecipient.update({
      where: { id: rec.id },
      data: { communicationThreadId: threadId },
    });

    const sentBy: string | null = c.createdByUserId ?? null;
    if (rec.channel === "SMS") {
      const to = rec.recipientPhone;
      if (!to) {
        await prisma.communicationCampaignRecipient.update({
          where: { id: rec.id },
          data: { sendStatus: CampaignRecipientSendStatus.SKIPPED_NO_ADDRESS },
        });
        continue;
      }
      const r = await sendSmsAndRecord({
        threadId,
        to,
        body,
        sentByUserId: sentBy,
        communicationCampaignId: c.id,
        communicationCampaignRecipientId: rec.id,
      });
      if (r.ok) {
        await prisma.communicationCampaignRecipient.update({
          where: { id: rec.id },
          data: {
            sendStatus: CampaignRecipientSendStatus.SENT,
            providerMessageId: r.providerMessageId,
            attemptCount: { increment: 1 },
          },
        });
      } else {
        await prisma.communicationCampaignRecipient.update({
          where: { id: rec.id },
          data: {
            sendStatus: CampaignRecipientSendStatus.FAILED,
            lastError: r.error,
            failedAt: new Date(),
            attemptCount: { increment: 1 },
          },
        });
      }
    } else if (rec.channel === "EMAIL") {
      const to = rec.recipientEmail;
      if (!to) {
        await prisma.communicationCampaignRecipient.update({
          where: { id: rec.id },
          data: { sendStatus: CampaignRecipientSendStatus.SKIPPED_NO_ADDRESS },
        });
        continue;
      }
      if (!sub.trim()) {
        await prisma.communicationCampaignRecipient.update({
          where: { id: rec.id },
          data: { sendStatus: CampaignRecipientSendStatus.FAILED, lastError: "Missing subject" },
        });
        continue;
      }
      const r = await sendEmailAndRecord({
        threadId,
        to,
        subject: sub,
        text: body,
        sentByUserId: sentBy,
        communicationCampaignId: c.id,
        communicationCampaignRecipientId: rec.id,
      });
      if (r.ok) {
        await prisma.communicationCampaignRecipient.update({
          where: { id: rec.id },
          data: {
            sendStatus: CampaignRecipientSendStatus.SENT,
            providerMessageId: r.providerMessageId ?? null,
            attemptCount: { increment: 1 },
          },
        });
      } else {
        await prisma.communicationCampaignRecipient.update({
          where: { id: rec.id },
          data: {
            sendStatus: CampaignRecipientSendStatus.FAILED,
            lastError: r.error,
            failedAt: new Date(),
            attemptCount: { increment: 1 },
          },
        });
      }
    }
    processed += 1;
  }

  const remaining = await prisma.communicationCampaignRecipient.count({
    where: { communicationCampaignId: c.id, sendStatus: CampaignRecipientSendStatus.PENDING },
  });
  if (remaining === 0) {
    await prisma.communicationCampaign.update({
      where: { id: c.id },
      data: {
        status: CommunicationCampaignStatus.COMPLETE,
        completedAt: new Date(),
        processingLockUntil: null,
      },
    });
  } else {
    await prisma.communicationCampaign.update({
      where: { id: c.id },
      data: { processingLockUntil: new Date(Date.now() + 30_000) },
    });
  }
  await recomputeCampaignStats(c.id);
  return { processed, campaigns: [c.id] };
}
