import {
  type CommunicationThread,
  CommunicationThreadStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveAndLinkNewThread } from "@/lib/comms/preferences";
import { normalizeUsPhone } from "./phone";

export const threadListInclude = {
  county: { select: { id: true, displayName: true, slug: true } },
  user: { select: { id: true, name: true, email: true } },
  volunteerProfile: {
    select: {
      id: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
  tagAssignments: { include: { tag: { select: { id: true, key: true, label: true, color: true } } } },
  _count: { select: { messages: true } },
} as const;

export type ThreadListItem = Prisma.CommunicationThreadGetPayload<{ include: typeof threadListInclude }>;

export async function findThreadByPhone(phone: string) {
  const n = normalizeUsPhone(phone);
  if (!n) return null;
  return prisma.communicationThread.findFirst({
    where: { primaryPhone: n },
  });
}

export async function findOrCreateThreadForInboundPhone(params: {
  from: string;
  to?: string | null;
  body: string;
}): Promise<CommunicationThread> {
  const fromNorm = normalizeUsPhone(params.from);
  if (!fromNorm) {
    throw new Error("Unrecognized from phone; cannot open thread");
  }
  const existing = await findThreadByPhone(params.from);
  if (existing) {
    await resolveAndLinkNewThread(existing.id, { email: existing.primaryEmail, phone: existing.primaryPhone });
    return existing;
  }
  const created = await prisma.communicationThread.create({
    data: {
      primaryPhone: fromNorm,
      preferredChannel: "SMS",
      threadStatus: CommunicationThreadStatus.NEEDS_REPLY,
    },
  });
  await resolveAndLinkNewThread(created.id, { email: null, phone: fromNorm });
  return created;
}

export async function touchThreadAfterInbound(threadId: string) {
  await prisma.communicationThread.update({
    where: { id: threadId },
    data: {
      lastInboundAt: new Date(),
      lastMessageAt: new Date(),
      lastTouchedAt: new Date(),
      threadStatus: CommunicationThreadStatus.NEEDS_REPLY,
      unreadCount: { increment: 1 },
    },
  });
}

export async function touchThreadAfterOutbound(threadId: string) {
  await prisma.communicationThread.update({
    where: { id: threadId },
    data: {
      lastOutboundAt: new Date(),
      lastMessageAt: new Date(),
      lastTouchedAt: new Date(),
    },
  });
}
