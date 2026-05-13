/**
 * Today-view / operator summary counts over EmailContactProfile + preferences.
 * Read-only; no provider calls.
 */

import { prisma } from "@/lib/db";

export type AudienceListHealthSnapshot = {
  dbReachable: boolean;
  totalProfiles: number;
  profilesWithValidEmail: number;
  profilesMissingEmail: number;
  /** Distinct primary emails that appear on more than one profile (governance cleanup signal). */
  duplicatePrimaryEmailGroups: number;
  /** Profiles linked to User or VolunteerProfile with marketing opt-out / global unsubscribe. */
  profilesWithMarketingOptOut: number;
};

export async function getAudienceListHealthSnapshot(): Promise<AudienceListHealthSnapshot> {
  const empty: AudienceListHealthSnapshot = {
    dbReachable: false,
    totalProfiles: 0,
    profilesWithValidEmail: 0,
    profilesMissingEmail: 0,
    duplicatePrimaryEmailGroups: 0,
    profilesWithMarketingOptOut: 0,
  };
  try {
    const [totalProfiles, profilesWithValidEmail, dupRow, optedOut] = await Promise.all([
      prisma.emailContactProfile.count(),
      prisma.emailContactProfile.count({
        where: {
          primaryEmail: {
            not: null,
            contains: "@",
          },
        },
      }),
      prisma.$queryRaw<{ c: bigint }[]>`
        SELECT COUNT(*)::bigint AS c
        FROM (
          SELECT lower(trim(primary_email)) AS e
          FROM "EmailContactProfile"
          WHERE primary_email IS NOT NULL AND btrim(primary_email) <> ''
          GROUP BY lower(trim(primary_email))
          HAVING COUNT(*) > 1
        ) t
      `,
      prisma.emailContactProfile.count({
        where: {
          OR: [
            { user: { contactPreference: { globalUnsubscribeAt: { not: null } } } },
            { user: { contactPreference: { emailOptInStatus: "OPT_OUT" } } },
            { volunteerProfile: { contactPreference: { globalUnsubscribeAt: { not: null } } } },
            { volunteerProfile: { contactPreference: { emailOptInStatus: "OPT_OUT" } } },
          ],
        },
      }),
    ]);

    const profilesMissingEmail = totalProfiles - profilesWithValidEmail;
    const duplicatePrimaryEmailGroups = Number(dupRow[0]?.c ?? 0);

    return {
      dbReachable: true,
      totalProfiles,
      profilesWithValidEmail,
      profilesMissingEmail,
      duplicatePrimaryEmailGroups,
      profilesWithMarketingOptOut: optedOut,
    };
  } catch {
    return empty;
  }
}
