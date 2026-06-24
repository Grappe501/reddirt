import {
  RelationalOrganizingStatus,
  RelationalRelationshipType,
  VoterInteractionChannel,
  VoterInteractionType,
  WorkflowIntakeStatus,
} from "@prisma/client";

import { createRelationalContact, recordRelationalTouch } from "@/lib/campaign-engine/relational-contacts";
import { prisma } from "@/lib/db";
import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import { isVolunteerIntakeSource } from "@/lib/volunteers/load-volunteer-intake-dashboard";
import { createVolunteerLeaderRosterPerson } from "@/lib/volunteers/leader-roster-db";

import {
  CONTACT_SPINE_PACKET,
  mergeContactSpineMetadata,
  readIntakePlacementMetadata,
  type VolunteerIntakePlacementMetadata,
} from "./metadata";
import { resolveCountyIdFromSlug, resolveLeaderOwnerUserId } from "./resolve-owner-user";

export type PromoteVolunteerIntakeInput = {
  intakeId: string;
  placementLeaderSlug: string;
  addToTeamRoster?: boolean;
};

export type PromoteVolunteerIntakeResult = {
  relationalContactId: string;
  rosterPersonId: string | null;
  ownerUserId: string;
  placement: VolunteerIntakePlacementMetadata;
};

function splitDisplayName(name: string): { firstName: string | null; lastName: string | null } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: null };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export async function promoteVolunteerIntakeContactSpine(
  input: PromoteVolunteerIntakeInput,
): Promise<PromoteVolunteerIntakeResult> {
  const leader = getVolunteerLeaderBySlug(input.placementLeaderSlug.trim());
  if (!leader) {
    throw new Error(`Unknown placement leader slug: ${input.placementLeaderSlug}`);
  }

  const intake = await prisma.workflowIntake.findUnique({
    where: { id: input.intakeId },
    include: {
      submission: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              county: true,
            },
          },
        },
      },
    },
  });

  if (!intake || !isVolunteerIntakeSource(intake.source)) {
    throw new Error("Volunteer intake not found");
  }

  if (intake.relationalContactId) {
    const placement = readIntakePlacementMetadata(intake.metadata);
    return {
      relationalContactId: intake.relationalContactId,
      rosterPersonId: placement.rosterPersonId ?? null,
      ownerUserId: await resolveLeaderOwnerUserId(leader),
      placement,
    };
  }

  const meta =
    typeof intake.metadata === "object" && intake.metadata !== null && !Array.isArray(intake.metadata)
      ? (intake.metadata as Record<string, unknown>)
      : {};

  const user = intake.submission?.user;
  const displayName =
    (user?.name?.trim() || intake.title?.trim() || "Volunteer intake contact").slice(0, 200);
  const { firstName, lastName } = splitDisplayName(displayName);
  const countySlug =
    typeof meta.county === "string" ? meta.county.trim().toLowerCase() : user?.county?.trim() ?? null;
  const countyId = await resolveCountyIdFromSlug(countySlug);

  const ownerUserId = await resolveLeaderOwnerUserId(leader);
  const placedAt = new Date().toISOString();

  const contact = await createRelationalContact({
    ownerUserId,
    displayName,
    firstName,
    lastName,
    email: user?.email?.trim() || null,
    phone: user?.phone?.trim() || null,
    relationshipType: RelationalRelationshipType.UNKNOWN,
    organizingStatus: RelationalOrganizingStatus.CONTACTED,
    countyId,
    notes: typeof meta.preferredRole === "string" ? `Preferred role: ${meta.preferredRole}` : null,
    metadataJson: mergeContactSpineMetadata(null, {
      contactSpine: CONTACT_SPINE_PACKET,
      leaderSlug: leader.slug,
      leaderInitials: leader.initials,
      workflowIntakeId: intake.id,
      volunteerUserId: user?.id,
      placementLeaderSlug: leader.slug,
      placementLeaderInitials: leader.initials,
      placedAt,
      proxyOwner: true,
    }),
  });

  let rosterPersonId: string | null = null;
  if (input.addToTeamRoster !== false) {
    const rosterRow = await createVolunteerLeaderRosterPerson({
      leaderInitials: leader.initials,
      layer: "team",
      displayName,
      category: typeof meta.preferredRole === "string" ? meta.preferredRole : "Volunteer intake",
      status: "invited",
      notes: `Placed from intake ${intake.id}`,
    });
    if (rosterRow) {
      rosterPersonId = rosterRow.id;
      await prisma.volunteerLeaderRosterPerson.update({
        where: { id: rosterRow.id },
        data: { relationalContactId: contact.id },
      });
    }
  }

  const placementMetadata = mergeContactSpineMetadata(intake.metadata, {
    placementLeaderSlug: leader.slug,
    placementLeaderInitials: leader.initials,
    placedAt,
    workflowIntakeId: intake.id,
    volunteerUserId: user?.id,
  });

  const metadataWithIds = {
    ...placementMetadata,
    relationalContactId: contact.id,
    rosterPersonId: rosterPersonId ?? undefined,
  };

  await prisma.workflowIntake.update({
    where: { id: intake.id },
    data: {
      relationalContactId: contact.id,
      status: WorkflowIntakeStatus.CONVERTED,
      metadata: metadataWithIds,
    },
  });

  if (user?.id) {
    await recordRelationalTouch({
      relationalContactId: contact.id,
      contactedByUserId: ownerUserId,
      interactionType: VoterInteractionType.OTHER,
      interactionChannel: VoterInteractionChannel.IN_PERSON,
      notes: `Volunteer intake activated and placed with ${leader.displayName} (${leader.initials}).`,
      organizingStatus: RelationalOrganizingStatus.CONTACTED,
    }).catch(() => null);
  }

  return {
    relationalContactId: contact.id,
    rosterPersonId,
    ownerUserId,
    placement: {
      placementLeaderSlug: leader.slug,
      placementLeaderInitials: leader.initials,
      placedAt,
      relationalContactId: contact.id,
      rosterPersonId: rosterPersonId ?? undefined,
    },
  };
}
