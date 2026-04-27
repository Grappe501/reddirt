/**
 * Admin-only: REL-2 + Power of 5 context for a matched voter file row.
 * Do not use from public RSC/API routes.
 */

import type { RelationalRelationshipCloseness, RelationalRelationshipType } from "@prisma/client";

import { prisma } from "@/lib/db";

export type RelationalOrganizingLinkForVoter = {
  relationalContactId: string;
  relationshipType: RelationalRelationshipType;
  relationshipCloseness: RelationalRelationshipCloseness | null;
  invitedBy: {
    userId: string;
    label: string;
  };
  teamAssignment: string | null;
  fieldUnitType: string | null;
  pipelineStage: string;
  organizingStatusRaw: string;
  powerOfFive: {
    isCoreFive: boolean;
    slot: number | null;
  };
  activity: {
    lastContactedAt: Date | null;
    nextFollowUpAt: Date | null;
    loggedTouchCount: number;
    latestTouch: {
      interactionType: string;
      interactionChannel: string;
      interactionDate: Date;
    } | null;
  };
};

function organizerDisplayLabel(name: string | null | undefined, email: string): string {
  const n = name?.trim();
  if (n) return n;
  return email;
}

/** Sentence-style label for admin UI (enum value → readable). */
export function formatRelationalPipelineStage(status: string): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * All relational contacts matched to this voter (multiple owners possible in edge cases).
 */
export async function listRelationalOrganizingLinksForVoter(
  voterRecordId: string,
): Promise<RelationalOrganizingLinkForVoter[]> {
  const rows = await prisma.relationalContact.findMany({
    where: { matchedVoterRecordId: voterRecordId },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      fieldUnit: { select: { id: true, name: true, type: true } },
      voterInteractions: {
        orderBy: { interactionDate: "desc" },
        take: 1,
        select: {
          interactionType: true,
          interactionChannel: true,
          interactionDate: true,
        },
      },
      _count: { select: { voterInteractions: true } },
    },
  });

  return rows.map((r) => {
    const latest = r.voterInteractions[0] ?? null;
    const team =
      r.fieldUnit != null ? `${r.fieldUnit.name} (${r.fieldUnit.type})` : null;
    return {
      relationalContactId: r.id,
      relationshipType: r.relationshipType,
      relationshipCloseness: r.relationshipCloseness,
      invitedBy: {
        userId: r.owner.id,
        label: organizerDisplayLabel(r.owner.name, r.owner.email),
      },
      teamAssignment: team,
      fieldUnitType: r.fieldUnit?.type ?? null,
      pipelineStage: formatRelationalPipelineStage(r.organizingStatus),
      organizingStatusRaw: r.organizingStatus,
      powerOfFive: {
        isCoreFive: r.isCoreFive,
        slot: r.powerOfFiveSlot,
      },
      activity: {
        lastContactedAt: r.lastContactedAt,
        nextFollowUpAt: r.nextFollowUpAt,
        loggedTouchCount: r._count.voterInteractions,
        latestTouch: latest
          ? {
              interactionType: latest.interactionType,
              interactionChannel: latest.interactionChannel,
              interactionDate: latest.interactionDate,
            }
          : null,
      },
    };
  });
}

export type RelationalOrganizingSnapshotForContact = Omit<
  RelationalOrganizingLinkForVoter,
  "relationalContactId"
> & { relationalContactId: string };

/** Build the same shape from an already-loaded relational contact detail row (admin detail page). */
export function relationalOrganizingSnapshotFromContactDetail(contact: {
  id: string;
  relationshipType: RelationalRelationshipType;
  relationshipCloseness: RelationalRelationshipCloseness | null;
  organizingStatus: string;
  isCoreFive: boolean;
  powerOfFiveSlot: number | null;
  lastContactedAt: Date | null;
  nextFollowUpAt: Date | null;
  owner: { id: string; email: string; name: string | null };
  fieldUnit: { name: string; type: string } | null;
  voterInteractions: {
    interactionType: string;
    interactionChannel: string;
    interactionDate: Date;
  }[];
  _count: { voterInteractions: number };
}): RelationalOrganizingSnapshotForContact {
  const latest = contact.voterInteractions[0] ?? null;
  const team =
    contact.fieldUnit != null
      ? `${contact.fieldUnit.name} (${contact.fieldUnit.type})`
      : null;
  return {
    relationalContactId: contact.id,
    relationshipType: contact.relationshipType,
    relationshipCloseness: contact.relationshipCloseness,
    invitedBy: {
      userId: contact.owner.id,
      label: organizerDisplayLabel(contact.owner.name, contact.owner.email),
    },
    teamAssignment: team,
    fieldUnitType: contact.fieldUnit?.type ?? null,
    pipelineStage: formatRelationalPipelineStage(contact.organizingStatus),
    organizingStatusRaw: contact.organizingStatus,
    powerOfFive: {
      isCoreFive: contact.isCoreFive,
      slot: contact.powerOfFiveSlot,
    },
    activity: {
      lastContactedAt: contact.lastContactedAt,
      nextFollowUpAt: contact.nextFollowUpAt,
      loggedTouchCount: contact._count.voterInteractions,
      latestTouch: latest
        ? {
            interactionType: latest.interactionType,
            interactionChannel: latest.interactionChannel,
            interactionDate: latest.interactionDate,
          }
        : null,
    },
  };
}
