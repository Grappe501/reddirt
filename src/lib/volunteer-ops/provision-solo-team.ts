import "server-only";

import type { VolunteerOpsTeamMemberRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  buildTeamSlug,
  formatTeamCode,
  formatTeamDisplayName,
  TEAM_CALLSIGNS,
} from "@/lib/team-naming";
import { volunteerInterestsToOpsRole } from "@/lib/volunteer-ops/infer-role";
import { recomputeVolunteerOpsTeamStatus } from "@/lib/volunteer-ops/recompute-team-status";

function geographySlug(county: string | null | undefined, zip: string | null | undefined): string {
  if (county?.trim()) {
    return county
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "oklahoma";
  }
  if (zip?.trim()) {
    return `zip-${zip.trim().replace(/\s+/g, "").slice(0, 10)}`;
  }
  return "oklahoma-team";
}

function callsignForUser(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i += 1) {
    h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const idx = h % TEAM_CALLSIGNS.length;
  return TEAM_CALLSIGNS[idx]!;
}

function threeDigitFromSeed(seed: string, attempt: number): number {
  let h = attempt;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return 100 + (h % 900);
}

function defaultMonthlyPrograms() {
  return {
    monthlyPrograms: [
      {
        id: "vos-p5-community-social-hour",
        title: "Community Outreach Social Hour",
        cadence: "monthly",
        kind: "power_of_5_gathering",
        planningNote: "Bring local Power of 5 networks together; add as a campaign event when scheduled.",
      },
      {
        id: "vos-vr-monthly-drive",
        title: "Monthly Voter Registration Event",
        cadence: "monthly",
        kind: "voter_registration",
        planningNote: "Create in the Events system so it surfaces on the Events tab and calendars.",
      },
    ],
  };
}

function defaultBriefing(displayName: string): string {
  return `Welcome to ${displayName}. You are the founding organizer — your team starts in "building" status until the three core lanes (Events, Social Media, Power of 5 / voter registration) each have a coordinator. Use Build Your Team to invite privately by email, coach everyone’s Power of 5 circle, and route new volunteers to /volunteer when they want to join officially.`;
}

export type ProvisionSoloTeamInput = {
  userId: string;
  name: string;
  county: string | null | undefined;
  zip: string | null | undefined;
  interests: string[];
};

export async function provisionVolunteerOpsSoloTeam(input: ProvisionSoloTeamInput): Promise<{ teamSlug: string; teamId: string }> {
  const existing = await prisma.volunteerOpsTeamMember.findFirst({
    where: { userId: input.userId },
    select: { teamId: true, team: { select: { slug: true } } },
  });
  if (existing) {
    return { teamSlug: existing.team.slug, teamId: existing.teamId };
  }

  const geoKey = geographySlug(input.county, input.zip);
  const callsign = callsignForUser(input.userId);
  const role: VolunteerOpsTeamMemberRole = volunteerInterestsToOpsRole(input.interests);

  let displayName = "";
  let teamCode = "";
  let created: { id: string; slug: string } | null = null;

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const n = threeDigitFromSeed(`${input.userId}:${attempt}`, attempt);
    const slugTry = buildTeamSlug(geoKey, callsign, n);
    displayName = formatTeamDisplayName(
      input.county?.trim() || input.zip?.trim() || "Oklahoma",
      callsign,
      n,
    );
    teamCode = formatTeamCode(callsign, n);

    try {
      created = await prisma.volunteerOpsTeam.create({
        data: {
          slug: slugTry,
          displayName,
          teamCode,
          geographyLabel: input.county?.trim() || input.zip?.trim() || "Oklahoma",
          level: "county",
          status: "BUILDING",
          upstreamContactUserId: input.userId,
          createdByUserId: input.userId,
          adminUserIds: [input.userId],
          weeklyBriefing: defaultBriefing(displayName),
          metadataJson: {
            ...defaultMonthlyPrograms(),
            downstreamTeamsLaunched: 0,
            turnoutTarget: {
              registrationsPerPowerOfFiveNetwork: 10,
              contactsPerVolunteer: 5,
            },
          },
          members: {
            create: {
              userId: input.userId,
              role,
              isTemporaryUpstream: true,
            },
          },
        },
        select: { id: true, slug: true },
      });
      break;
    } catch {
      // slug collision — retry with another digit seed
    }
  }

  if (!created) {
    throw new Error("volunteer_ops_team_provision_failed");
  }

  await recomputeVolunteerOpsTeamStatus(created.id);

  return { teamSlug: created.slug, teamId: created.id };
}
