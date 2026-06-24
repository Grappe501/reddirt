import type { ElectionPlanFieldCategory } from "@prisma/client";
import {
  RelationalOrganizingStatus,
  RelationalRelationshipType,
  VoterInteractionChannel,
  VoterInteractionType,
} from "@prisma/client";

import { createRelationalContact, recordRelationalTouch } from "@/lib/campaign-engine/relational-contacts";
import { prisma } from "@/lib/db";
import { getVolunteerLeaderByInitials } from "@/lib/volunteers/leader-roster";

import { CONTACT_SPINE_PACKET, FIELD_ENTRY_CRM_CATEGORIES, mergeContactSpineMetadata } from "./metadata";
import { resolveCountyIdFromSlug, resolveLeaderOwnerUserIdByInitials } from "./resolve-owner-user";

export type SyncFieldEntryContactSpineInput = {
  fieldEntryId: string;
  operatorInitials: string;
  category: ElectionPlanFieldCategory;
  label: string;
  description: string | null;
  countySlug: string;
  citySlug: string | null;
  linkToCrm?: boolean;
};

export type SyncFieldEntryContactSpineResult = {
  linked: boolean;
  relationalContactId: string | null;
  created: boolean;
};

function relationshipTypeForCategory(
  category: ElectionPlanFieldCategory,
): RelationalRelationshipType {
  if (category === "volunteer") return RelationalRelationshipType.COMMUNITY_GROUP;
  if (category === "leader") return RelationalRelationshipType.COWORKER;
  if (category === "house_party") return RelationalRelationshipType.FRIEND;
  return RelationalRelationshipType.UNKNOWN;
}

function interactionTypeForCategory(category: ElectionPlanFieldCategory): VoterInteractionType {
  if (category === "conversation") return VoterInteractionType.ISSUE_CONVERSATION;
  if (category === "house_party") return VoterInteractionType.EVENT_INVITE;
  return VoterInteractionType.OTHER;
}

export async function syncFieldEntryContactSpine(
  input: SyncFieldEntryContactSpineInput,
): Promise<SyncFieldEntryContactSpineResult> {
  if (input.linkToCrm === false) {
    return { linked: false, relationalContactId: null, created: false };
  }

  if (!FIELD_ENTRY_CRM_CATEGORIES.has(input.category)) {
    return { linked: false, relationalContactId: null, created: false };
  }

  const label = input.label.trim();
  if (label.length < 2) {
    return { linked: false, relationalContactId: null, created: false };
  }

  const leader = getVolunteerLeaderByInitials(input.operatorInitials);
  const ownerUserId = await resolveLeaderOwnerUserIdByInitials(input.operatorInitials);
  if (!ownerUserId) {
    return { linked: false, relationalContactId: null, created: false };
  }

  const countyId = await resolveCountyIdFromSlug(input.countySlug);

  const existing = await prisma.relationalContact.findFirst({
    where: {
      ownerUserId,
      displayName: { equals: label, mode: "insensitive" },
    },
    select: { id: true },
  });

  let relationalContactId = existing?.id ?? null;
  let created = false;

  if (!relationalContactId) {
    const contact = await createRelationalContact({
      ownerUserId,
      displayName: label.slice(0, 200),
      relationshipType: relationshipTypeForCategory(input.category),
      organizingStatus: RelationalOrganizingStatus.IDENTIFIED,
      countyId,
      notes: input.description?.trim() || null,
      metadataJson: mergeContactSpineMetadata(null, {
        contactSpine: CONTACT_SPINE_PACKET,
        leaderSlug: leader?.slug,
        leaderInitials: input.operatorInitials.toUpperCase(),
        fieldEntryId: input.fieldEntryId,
        proxyOwner: true,
      }),
    });
    relationalContactId = contact.id;
    created = true;
  }

  await prisma.electionPlanFieldEntry.update({
    where: { id: input.fieldEntryId },
    data: { relationalContactId },
  });

  const touchNotes =
    input.description?.trim() ||
    `Field log · ${input.category.replace(/_/g, " ")} · ${label}`;

  await recordRelationalTouch({
    relationalContactId,
    contactedByUserId: ownerUserId,
    interactionType: interactionTypeForCategory(input.category),
    interactionChannel: VoterInteractionChannel.IN_PERSON,
    notes: touchNotes,
    organizingStatus: RelationalOrganizingStatus.CONTACTED,
  }).catch(() => null);

  return { linked: true, relationalContactId, created };
}
