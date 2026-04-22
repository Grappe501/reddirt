import { prisma } from "@/lib/db";
import { normalizeUsPhone } from "./phone";

export type ResolvedContact = {
  userId: string | null;
  volunteerProfileId: string | null;
  countyId: string | null;
};

async function countyIdFromUserCountyString(county: string | null): Promise<string | null> {
  if (!county?.trim()) return null;
  const t = county.trim();
  const c = await prisma.county.findFirst({
    where: {
      OR: [
        { displayName: { equals: t, mode: "insensitive" } },
        { slug: { equals: t.toLowerCase().replace(/\s+/g, "-"), mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });
  return c?.id ?? null;
}

/**
 * Default-link threads to an existing `User` / `VolunteerProfile` when email or phone match.
 */
export async function resolveContactFromEmailAndPhone(input: {
  email: string | null | undefined;
  phone: string | null | undefined;
}): Promise<ResolvedContact> {
  const email = input.email?.trim() ? input.email.trim().toLowerCase() : null;
  const nPhone = input.phone ? normalizeUsPhone(input.phone) : null;

  let userId: string | null = null;
  let volunteerProfileId: string | null = null;
  let countyId: string | null = null;

  const applyUser = (u: {
    id: string;
    county: string | null;
    volunteerProfile: { id: string } | null;
  }) => {
    userId = u.id;
    volunteerProfileId = u.volunteerProfile?.id ?? null;
  };

  if (email) {
    const u = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      include: { volunteerProfile: { select: { id: true } } },
    });
    if (u) {
      applyUser(u);
      countyId = await countyIdFromUserCountyString(u.county);
    }
  }

  if (!userId && nPhone) {
    const u2 = await prisma.user.findFirst({
      where: { phone: nPhone },
      include: { volunteerProfile: { select: { id: true } } },
    });
    if (u2) {
      applyUser(u2);
      countyId = (await countyIdFromUserCountyString(u2.county)) ?? countyId;
    }
  }

  return { userId, volunteerProfileId, countyId };
}

export async function linkThreadToResolvedContact(
  threadId: string,
  r: ResolvedContact
): Promise<void> {
  if (!r.userId && !r.volunteerProfileId && !r.countyId) return;

  const t = await prisma.communicationThread.findUnique({
    where: { id: threadId },
    select: { userId: true, volunteerProfileId: true, countyId: true },
  });
  if (!t) return;

  const data: {
    userId?: string;
    volunteerProfileId?: string;
    countyId?: string;
  } = {};
  if (r.userId && !t.userId) data.userId = r.userId;
  if (r.volunteerProfileId && !t.volunteerProfileId) data.volunteerProfileId = r.volunteerProfileId;
  if (r.countyId && !t.countyId) data.countyId = r.countyId;
  if (Object.keys(data).length === 0) return;

  await prisma.communicationThread.update({
    where: { id: threadId },
    data,
  });
}
