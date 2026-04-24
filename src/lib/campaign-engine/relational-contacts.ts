/**
 * REL-2: durable relational contacts + power-of-5 fields.
 * No auto-classification, no auto-matching, no message sending.
 */

import { Prisma } from "@prisma/client";
import type { Prisma as PrismaTypes } from "@prisma/client";
import {
  ModelConfidence,
  RelationalMatchStatus,
  RelationalOrganizingStatus,
  RelationalRelationshipType,
  VoterInteractionChannel,
  VoterInteractionType,
  VoterSignalKind,
  VoterSignalSource,
  VoterSignalStrength,
  VoterSupportLevel,
} from "@prisma/client";

import { prisma } from "@/lib/db";

import { createVoterInteraction } from "./voter-interactions";

export const REL2_PACKET = "REL-2" as const;

const CORE_SLOT_MIN = 1;
const CORE_SLOT_MAX = 5;

function assertCoreFiveSlot(slot: number | null | undefined) {
  if (slot == null) return;
  if (!Number.isInteger(slot) || slot < CORE_SLOT_MIN || slot > CORE_SLOT_MAX) {
    throw new Error(
      `powerOfFiveSlot must be an integer between ${CORE_SLOT_MIN} and ${CORE_SLOT_MAX} when set`,
    );
  }
}

export type CreateRelationalContactInput = {
  ownerUserId: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  relationshipType?: RelationalRelationshipType;
  relationshipCloseness?: PrismaTypes.RelationalContactCreateInput["relationshipCloseness"];
  countyId?: string | null;
  fieldUnitId?: string | null;
  matchedVoterRecordId?: string | null;
  matchStatus?: RelationalMatchStatus;
  matchConfidence?: ModelConfidence | null;
  organizingStatus?: RelationalOrganizingStatus;
  supportLevel?: VoterSupportLevel | null;
  isCoreFive?: boolean;
  powerOfFiveSlot?: number | null;
  notes?: string | null;
  metadataJson?: PrismaTypes.InputJsonValue | null;
};

export async function createRelationalContact(input: CreateRelationalContactInput) {
  const displayName = String(input.displayName ?? "").trim();
  if (!input.ownerUserId?.trim() || !displayName) {
    throw new Error("createRelationalContact: ownerUserId and displayName are required");
  }
  if (input.isCoreFive) {
    assertCoreFiveSlot(input.powerOfFiveSlot ?? undefined);
  }

  return prisma.relationalContact.create({
    data: {
      owner: { connect: { id: input.ownerUserId } },
      displayName,
      firstName: input.firstName?.trim() || null,
      lastName: input.lastName?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      relationshipType: input.relationshipType ?? RelationalRelationshipType.UNKNOWN,
      relationshipCloseness: input.relationshipCloseness ?? undefined,
      county: input.countyId ? { connect: { id: input.countyId } } : undefined,
      fieldUnit: input.fieldUnitId ? { connect: { id: input.fieldUnitId } } : undefined,
      matchedVoterRecord: input.matchedVoterRecordId
        ? { connect: { id: input.matchedVoterRecordId } }
        : undefined,
      matchStatus: input.matchStatus,
      matchConfidence: input.matchConfidence === undefined ? undefined : input.matchConfidence,
      organizingStatus: input.organizingStatus,
      supportLevel: input.supportLevel === undefined ? undefined : input.supportLevel,
      isCoreFive: input.isCoreFive ?? false,
      powerOfFiveSlot: input.powerOfFiveSlot ?? undefined,
      notes: input.notes?.trim() || null,
      metadataJson:
        input.metadataJson === undefined
          ? undefined
          : input.metadataJson === null
            ? Prisma.JsonNull
            : input.metadataJson,
    },
  });
}

export type UpdateRelationalContactInput = {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string;
  phone?: string | null;
  email?: string | null;
  relationshipType?: RelationalRelationshipType;
  relationshipCloseness?: PrismaTypes.RelationalContactUpdateInput["relationshipCloseness"];
  countyId?: string | null;
  fieldUnitId?: string | null;
  matchedVoterRecordId?: string | null;
  matchStatus?: RelationalMatchStatus;
  matchConfidence?: ModelConfidence | null;
  organizingStatus?: RelationalOrganizingStatus;
  supportLevel?: VoterSupportLevel | null;
  isCoreFive?: boolean;
  powerOfFiveSlot?: number | null;
  lastContactedAt?: Date | null;
  nextFollowUpAt?: Date | null;
  notes?: string | null;
  metadataJson?: PrismaTypes.InputJsonValue | null;
};

export async function updateRelationalContact(id: string, input: UpdateRelationalContactInput) {
  if (input.isCoreFive === true || input.powerOfFiveSlot != null) {
    assertCoreFiveSlot(input.powerOfFiveSlot ?? undefined);
  }
  if (input.displayName !== undefined && !String(input.displayName).trim()) {
    throw new Error("updateRelationalContact: displayName cannot be empty");
  }

  const data: PrismaTypes.RelationalContactUpdateInput = {};
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.displayName !== undefined) data.displayName = input.displayName.trim();
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.email !== undefined) data.email = input.email;
  if (input.relationshipType !== undefined) data.relationshipType = input.relationshipType;
  if (input.relationshipCloseness !== undefined) data.relationshipCloseness = input.relationshipCloseness;
  if (input.countyId !== undefined) {
    data.county = input.countyId ? { connect: { id: input.countyId } } : { disconnect: true };
  }
  if (input.fieldUnitId !== undefined) {
    data.fieldUnit = input.fieldUnitId ? { connect: { id: input.fieldUnitId } } : { disconnect: true };
  }
  if (input.matchedVoterRecordId !== undefined) {
    data.matchedVoterRecord = input.matchedVoterRecordId
      ? { connect: { id: input.matchedVoterRecordId } }
      : { disconnect: true };
  }
  if (input.matchStatus !== undefined) data.matchStatus = input.matchStatus;
  if (input.matchConfidence !== undefined) data.matchConfidence = input.matchConfidence;
  if (input.organizingStatus !== undefined) data.organizingStatus = input.organizingStatus;
  if (input.supportLevel !== undefined) data.supportLevel = input.supportLevel;
  if (input.isCoreFive !== undefined) data.isCoreFive = input.isCoreFive;
  if (input.powerOfFiveSlot !== undefined) data.powerOfFiveSlot = input.powerOfFiveSlot;
  if (input.lastContactedAt !== undefined) data.lastContactedAt = input.lastContactedAt;
  if (input.nextFollowUpAt !== undefined) data.nextFollowUpAt = input.nextFollowUpAt;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.metadataJson !== undefined) {
    data.metadataJson =
      input.metadataJson === null ? Prisma.JsonNull : input.metadataJson;
  }

  return prisma.relationalContact.update({ where: { id }, data });
}

export async function listRelationalContactsForUser(ownerUserId: string) {
  return prisma.relationalContact.findMany({
    where: { ownerUserId },
    orderBy: [{ isCoreFive: "desc" }, { powerOfFiveSlot: "asc" }, { updatedAt: "desc" }],
    include: {
      county: { select: { id: true, displayName: true, slug: true } },
      matchedVoterRecord: { select: { id: true, countySlug: true, firstName: true, lastName: true } },
    },
  });
}

export async function getRelationalContactDetail(id: string) {
  return prisma.relationalContact.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      county: { select: { id: true, displayName: true, slug: true, fips: true } },
      fieldUnit: { select: { id: true, name: true, type: true } },
      matchedVoterRecord: {
        select: {
          id: true,
          voterFileKey: true,
          countySlug: true,
          firstName: true,
          lastName: true,
          phone10: true,
          inLatestCompletedFile: true,
        },
      },
      voterInteractions: {
        orderBy: { interactionDate: "desc" },
        take: 50,
        include: {
          contactedBy: { select: { id: true, email: true, name: true } },
        },
      },
      voterSignals: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
}

/**
 * Same as getRelationalContactDetail but enforces the volunteer/owner id (REL-3).
 * Returns null if missing or not owned.
 */
export async function getRelationalContactDetailForOwner(id: string, ownerUserId: string) {
  const contact = await getRelationalContactDetail(id);
  if (!contact || contact.ownerUserId !== ownerUserId) return null;
  return contact;
}

export async function listCoreFiveForUser(ownerUserId: string) {
  return prisma.relationalContact.findMany({
    where: { ownerUserId, isCoreFive: true },
    orderBy: [{ powerOfFiveSlot: "asc" }, { displayName: "asc" }],
    include: {
      county: { select: { id: true, displayName: true, slug: true } },
      matchedVoterRecord: { select: { id: true, countySlug: true } },
    },
  });
}

export type RelationalContactSummary = {
  ownerUserId: string;
  totalContacts: number;
  coreFiveCount: number;
  matchedCount: number;
  unmatchedCount: number;
  lastTouchedAt: Date | null;
};

export async function getRelationalContactSummaryForUser(
  ownerUserId: string,
): Promise<RelationalContactSummary> {
  const [totalContacts, coreFiveCount, matchedCount, unmatchedCount, latest] = await Promise.all([
    prisma.relationalContact.count({ where: { ownerUserId } }),
    prisma.relationalContact.count({ where: { ownerUserId, isCoreFive: true } }),
    prisma.relationalContact.count({ where: { ownerUserId, matchStatus: RelationalMatchStatus.MATCHED } }),
    prisma.relationalContact.count({ where: { ownerUserId, matchStatus: RelationalMatchStatus.UNMATCHED } }),
    prisma.relationalContact.findFirst({
      where: { ownerUserId },
      orderBy: { updatedAt: "desc" },
      select: { lastContactedAt: true, updatedAt: true },
    }),
  ]);
  const lastTouchedAt = latest
    ? new Date(
        Math.max(
          (latest.lastContactedAt?.getTime() ?? 0) || 0,
          latest.updatedAt.getTime(),
        ),
      )
    : null;
  return {
    ownerUserId,
    totalContacts,
    coreFiveCount,
    matchedCount,
    unmatchedCount,
    lastTouchedAt,
  };
}

export type RelationalTouchSignalInput = {
  voterRecordId?: string | null;
  userId?: string | null;
  signalKind: VoterSignalKind;
  signalSource: VoterSignalSource;
  signalStrength: VoterSignalStrength;
  signalDate?: Date | null;
  confidence: ModelConfidence;
  notes?: string | null;
  metadataJson?: PrismaTypes.InputJsonValue | null;
};

export type RecordRelationalTouchInput = {
  relationalContactId: string;
  contactedByUserId: string;
  interactionType: VoterInteractionType;
  interactionChannel: VoterInteractionChannel;
  interactionDate?: Date;
  /** Explicit notes for the interaction; used for voter-less touches (INTERACTION-1 rule). */
  notes?: string | null;
  /** Set only when the actor records an explicit support read (no inference). */
  supportLevel?: VoterSupportLevel | null;
  /**
   * When set, use this voter for the touch instead of the contact’s `matchedVoterRecordId` (must still be intentional).
   */
  voterRecordIdOverride?: string | null;
  organizingStatus?: RelationalOrganizingStatus | null;
  nextFollowUpAt?: Date | null;
  createSignal?: boolean;
  signal?: RelationalTouchSignalInput | null;
};

/**
 * Log a human-initiated touch: optional `VoterInteraction` + `lastContactedAt`, and optional
 * `VoterSignal` only when `createSignal` and full signal fields are provided.
 */
export async function recordRelationalTouch(input: RecordRelationalTouchInput) {
  if (!input.relationalContactId?.trim() || !input.contactedByUserId?.trim()) {
    throw new Error("recordRelationalTouch: relationalContactId and contactedByUserId are required");
  }

  const contact = await prisma.relationalContact.findUnique({
    where: { id: input.relationalContactId },
  });
  if (!contact) {
    throw new Error("recordRelationalTouch: relational contact not found");
  }

  const effectiveVoterId =
    (input.voterRecordIdOverride?.trim() || null) ?? contact.matchedVoterRecordId ?? null;

  const hasNotes = Boolean(input.notes?.trim());
  const canLogInteraction =
    Boolean(effectiveVoterId) || (hasNotes && Boolean(input.contactedByUserId?.trim()));

  if (!canLogInteraction) {
    throw new Error(
      "recordRelationalTouch: add notes (non-empty) or set a matched/override voter id so a VoterInteraction can be created (INTERACTION-1 rules)",
    );
  }

  const interaction = await createVoterInteraction({
    voterRecordId: effectiveVoterId,
    relationalContactId: contact.id,
    contactedByUserId: input.contactedByUserId,
    interactionType: input.interactionType,
    interactionChannel: input.interactionChannel,
    interactionDate: input.interactionDate,
    supportLevel: input.supportLevel,
    notes: input.notes ?? null,
    metadataJson: { rel2Packet: REL2_PACKET, relationalContactId: contact.id } as PrismaTypes.InputJsonValue,
  });

  const touchTime = input.interactionDate ?? new Date();
  await prisma.relationalContact.update({
    where: { id: contact.id },
    data: {
      lastContactedAt: touchTime,
      organizingStatus: input.organizingStatus ?? undefined,
      nextFollowUpAt: input.nextFollowUpAt === undefined ? undefined : input.nextFollowUpAt,
    },
  });

  let signal: Awaited<ReturnType<typeof prisma.voterSignal.create>> | null = null;
  if (input.createSignal && input.signal) {
    const s = input.signal;
    if (!s.voterRecordId?.trim() && !s.userId?.trim()) {
      throw new Error(
        "recordRelationalTouch: createSignal requires signal.voterRecordId and/or signal.userId (explicit target)",
      );
    }
    const mergedMeta: PrismaTypes.InputJsonValue = {
      ...((s.metadataJson && typeof s.metadataJson === "object" && s.metadataJson !== null
        ? s.metadataJson
        : {}) as object),
      rel2Packet: REL2_PACKET,
      relationalContactId: contact.id,
    };
    signal = await prisma.voterSignal.create({
      data: {
        voterRecord: s.voterRecordId ? { connect: { id: s.voterRecordId } } : undefined,
        user: s.userId ? { connect: { id: s.userId } } : undefined,
        relationalContact: { connect: { id: contact.id } },
        signalKind: s.signalKind,
        signalSource: s.signalSource,
        signalStrength: s.signalStrength,
        signalDate: s.signalDate ?? touchTime,
        confidence: s.confidence,
        notes: s.notes?.trim() || null,
        metadataJson: mergedMeta,
      },
    });
  } else if (input.createSignal && !input.signal) {
    throw new Error("recordRelationalTouch: createSignal is true but signal details are missing");
  }

  return { contactId: contact.id, interaction, signal };
}