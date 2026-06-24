import { EmailOptInStatus, SmsOptInStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export type ProvisionVolunteerBoardInput = {
  email: string;
  name?: string | null;
  phone?: string | null;
  zip?: string | null;
  county?: string | null;
  interests?: string[];
  availability?: string | null;
  leadershipInterest?: boolean;
};

export type ProvisionVolunteerBoardResult = {
  userId: string;
  volunteerProfileId: string;
  created: boolean;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Create or refresh User + VolunteerProfile for personal board access.
 * Safe to call when importing a roster row — idempotent on email.
 */
export async function provisionVolunteerBoardUser(
  input: ProvisionVolunteerBoardInput,
): Promise<ProvisionVolunteerBoardResult> {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    throw new Error("Valid email required");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { volunteerProfile: true },
  });

  if (existing?.volunteerProfile) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: input.name?.trim() || existing.name,
        phone: input.phone?.trim() || existing.phone,
        zip: input.zip?.trim() || existing.zip,
        county: input.county?.trim() || existing.county,
        interests: input.interests?.length ? input.interests : existing.interests,
      },
    });
    await prisma.volunteerProfile.update({
      where: { id: existing.volunteerProfile.id },
      data: {
        availability: input.availability?.trim() || existing.volunteerProfile.availability,
        leadershipInterest: input.leadershipInterest ?? existing.volunteerProfile.leadershipInterest,
      },
    });
    return {
      userId: existing.id,
      volunteerProfileId: existing.volunteerProfile.id,
      created: false,
    };
  }

  const user = existing
    ? existing
    : await prisma.user.create({
        data: {
          email,
          name: input.name?.trim() || null,
          phone: input.phone?.trim() || null,
          zip: input.zip?.trim() || null,
          county: input.county?.trim() || null,
          interests: input.interests ?? [],
        },
      });

  const profile = await prisma.volunteerProfile.create({
    data: {
      userId: user.id,
      availability: input.availability?.trim() || null,
      leadershipInterest: input.leadershipInterest ?? false,
    },
  });

  await prisma.contactPreference.upsert({
    where: { volunteerProfileId: profile.id },
    create: {
      volunteerProfileId: profile.id,
      emailOptInStatus: EmailOptInStatus.UNKNOWN,
      smsOptInStatus: SmsOptInStatus.UNKNOWN,
      source: "volunteer_board_provision",
    },
    update: {},
  });

  return { userId: user.id, volunteerProfileId: profile.id, created: !existing };
}
