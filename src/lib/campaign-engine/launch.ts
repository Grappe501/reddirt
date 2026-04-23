/**
 * DBMAP-1 + LAUNCH-1: launch planning types and **read-only** population helpers.
 * No send path, no automation, no consent decisions — see `docs/launch-reengagement-foundation.md`.
 */

import { EmailOptInStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const DBMAP1_PACKET = "DBMAP-1" as const;
export const LAUNCH1_PACKET = "LAUNCH-1" as const;

export type LaunchAudienceKind =
  | "all_users"
  | "has_volunteer_profile"
  | "has_linked_voter"
  | "email_opt_in"
  | "users_with_event_signup";

export type LaunchResponseIntent =
  | "volunteer"
  | "updates_only"
  | "events"
  | "donate_later"
  | "local_county"
  | "suppress"
  | "unclear";

/**
 * Conceptual re-engagement state — not persisted in LAUNCH-1 schema.
 * Use in runbooks or future `metadataJson` if needed.
 */
export type ReengagementPhase = "not_contacted" | "messaged" | "responded" | "routed" | "closed";
/** @alias ReengagementPhase — use whichever name matches runbook/docs */
export type ReengagementStatus = ReengagementPhase;

export type LaunchAudienceCountSnapshot = {
  allUsers: number;
  hasVolunteerProfile: number;
  hasLinkedVoterRecord: number;
  contactPreferenceEmailOptIn: number;
  usersWithAtLeastOneEventSignup: number;
};

/**
 * Read-only counts for launch planning. **Not** a consent check; operators must still verify
 * `ContactPreference`, suppression, and the chosen comms path before any send.
 * @see docs/launch-segmentation-and-response-foundation.md
 */
export async function countLaunchAudienceByKind(): Promise<LaunchAudienceCountSnapshot> {
  const [allUsers, hasVolunteerProfile, hasLinkedVoterRecord, contactPreferenceEmailOptIn, signupsWithUser] =
    await Promise.all([
      prisma.user.count(),
      prisma.volunteerProfile.count(),
      prisma.user.count({ where: { linkedVoterRecordId: { not: null } } }),
      prisma.contactPreference.count({
        where: { userId: { not: null }, emailOptInStatus: EmailOptInStatus.OPT_IN },
      }),
      prisma.eventSignup.findMany({
        where: { userId: { not: null } },
        select: { userId: true },
      }),
    ]);
  const usersWithAtLeastOneEventSignup = new Set(
    signupsWithUser.map((s) => s.userId).filter((id): id is string => id != null)
  ).size;
  return {
    allUsers,
    hasVolunteerProfile,
    hasLinkedVoterRecord,
    contactPreferenceEmailOptIn,
    usersWithAtLeastOneEventSignup,
  };
}

/**
 * Sample of users with volunteer profile, linked `VoterRecord`, or an `EventSignup` tied to `userId`
 * (updated recently first). **Not** “cleared to send” — for planning and exports only.
 * @see docs/launch-reengagement-foundation.md
 */
export async function listLaunchReadySupporters(options?: { limit?: number }): Promise<
  {
    id: string;
    email: string;
    name: string | null;
    county: string | null;
    linkedVoterRecordId: string | null;
    updatedAt: Date;
  }[]
> {
  const take = Math.min(Math.max(options?.limit ?? 100, 1), 500);
  return prisma.user.findMany({
    where: {
      OR: [
        { volunteerProfile: { isNot: null } },
        { linkedVoterRecordId: { not: null } },
        { eventSignups: { some: {} } },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      county: true,
      linkedVoterRecordId: true,
      updatedAt: true,
    },
    take,
    orderBy: { updatedAt: "desc" },
  });
}
