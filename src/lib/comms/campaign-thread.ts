import { CommunicationChannel, CommunicationThreadStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeUsPhone } from "./phone";
import { resolveAndLinkNewThread } from "./preferences";

type EnsureThreadParams = {
  userId: string | null;
  volunteerProfileId: string | null;
  email: string | null;
  phone: string | null;
  countyId: string | null;
};

/**
 * Reuse 1:1 `CommunicationThread` for broadcast sends (same workbench, webhooks, preferences).
 */
export async function findOrCreateThreadForBroadcast(p: EnsureThreadParams): Promise<string> {
  const nPhone = p.phone ? normalizeUsPhone(p.phone) : null;
  const email = p.email?.trim() || null;

  if (p.userId) {
    const existing = await prisma.communicationThread.findFirst({
      where: { userId: p.userId },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) {
      if (nPhone && !existing.primaryPhone) {
        return (
          await prisma.communicationThread.update({
            where: { id: existing.id },
            data: { primaryPhone: nPhone },
          })
        ).id;
      }
      if (email && !existing.primaryEmail) {
        return (
          await prisma.communicationThread.update({
            where: { id: existing.id },
            data: { primaryEmail: email },
          })
        ).id;
      }
      return existing.id;
    }
  }
  if (nPhone) {
    const byPhone = await prisma.communicationThread.findFirst({ where: { primaryPhone: nPhone } });
    if (byPhone) {
      if (p.userId && !byPhone.userId) {
        const data: Prisma.CommunicationThreadUpdateInput = { user: { connect: { id: p.userId } } };
        if (p.volunteerProfileId) data.volunteerProfile = { connect: { id: p.volunteerProfileId } };
        return (await prisma.communicationThread.update({ where: { id: byPhone.id }, data })).id;
      }
      return byPhone.id;
    }
  }
  if (email) {
    const byEmail = await prisma.communicationThread.findFirst({
      where: { primaryEmail: { equals: email, mode: "insensitive" } },
    });
    if (byEmail) {
      if (p.userId && !byEmail.userId) {
        const data: Prisma.CommunicationThreadUpdateInput = { user: { connect: { id: p.userId } } };
        if (p.volunteerProfileId) data.volunteerProfile = { connect: { id: p.volunteerProfileId } };
        return (await prisma.communicationThread.update({ where: { id: byEmail.id }, data })).id;
      }
      return byEmail.id;
    }
  }

  const preferred: CommunicationChannel =
    p.phone && p.email
      ? CommunicationChannel.SMS
      : p.phone
        ? CommunicationChannel.SMS
        : CommunicationChannel.EMAIL;
  const t = await prisma.communicationThread.create({
    data: {
      userId: p.userId ?? undefined,
      volunteerProfileId: p.volunteerProfileId ?? undefined,
      primaryPhone: nPhone,
      primaryEmail: email,
      preferredChannel: preferred,
      threadStatus: CommunicationThreadStatus.ACTIVE,
      countyId: p.countyId ?? undefined,
      lastTouchedAt: new Date(),
    },
  });
  await resolveAndLinkNewThread(t.id, { email, phone: nPhone });
  return t.id;
}
