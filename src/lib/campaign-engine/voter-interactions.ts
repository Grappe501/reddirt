/**
 * INTERACTION-1: read/write helpers for staff-logged voter touchpoints.
 * No automation; no inferred support unless caller sets `supportLevel`.
 */

import type { Prisma } from "@prisma/client";
import {
  VotePlanStatus,
  VoterInteractionChannel,
  VoterInteractionType,
  VoterSupportLevel,
} from "@prisma/client";

import { prisma } from "@/lib/db";

export const INTERACTION_1_PACKET = "INTERACTION-1" as const;

export type CreateVoterInteractionInput = {
  voterRecordId?: string | null;
  /// REL-2: optional link to a relational contact row.
  relationalContactId?: string | null;
  contactedByUserId?: string | null;
  relatedVolunteerUserId?: string | null;
  interactionType: VoterInteractionType;
  interactionChannel: VoterInteractionChannel;
  interactionDate?: Date;
  supportLevel?: VoterSupportLevel | null;
  registrationChecked?: boolean;
  registrationStatusAtContact?: string | null;
  wantsFollowUp?: boolean;
  followUpNotes?: string | null;
  votePlanStatus?: VotePlanStatus | null;
  notes?: string | null;
  metadataJson?: Prisma.InputJsonValue | null;
};

export async function listVoterInteractions(voterRecordId: string) {
  return prisma.voterInteraction.findMany({
    where: { voterRecordId },
    orderBy: { interactionDate: "desc" },
    include: {
      contactedBy: { select: { id: true, email: true, name: true } },
      relatedVolunteer: { select: { id: true, email: true, name: true } },
    },
  });
}

export async function createVoterInteraction(input: CreateVoterInteractionInput) {
  const hasVoter = Boolean(input.voterRecordId?.trim());
  const hasNotes = Boolean(input.notes?.trim());
  const hasActor = Boolean(input.contactedByUserId?.trim());
  if (!hasVoter && !(hasNotes && hasActor)) {
    throw new Error(
      "createVoterInteraction: require voterRecordId, or both notes and contactedByUserId (non-empty)",
    );
  }

  const data: Prisma.VoterInteractionCreateInput = {
    interactionType: input.interactionType,
    interactionChannel: input.interactionChannel,
    interactionDate: input.interactionDate ?? new Date(),
    registrationChecked: input.registrationChecked ?? false,
    wantsFollowUp: input.wantsFollowUp ?? false,
    supportLevel:
      input.supportLevel === undefined ? VoterSupportLevel.UNKNOWN : input.supportLevel,
  };

  if (input.voterRecordId) {
    data.voterRecord = { connect: { id: input.voterRecordId } };
  }
  if (input.relationalContactId) {
    data.relationalContact = { connect: { id: input.relationalContactId } };
  }
  if (input.contactedByUserId) {
    data.contactedBy = { connect: { id: input.contactedByUserId } };
  }
  if (input.relatedVolunteerUserId) {
    data.relatedVolunteer = { connect: { id: input.relatedVolunteerUserId } };
  }
  if (input.registrationStatusAtContact != null) {
    data.registrationStatusAtContact = input.registrationStatusAtContact;
  }
  if (input.followUpNotes != null) data.followUpNotes = input.followUpNotes;
  if (input.votePlanStatus != null) data.votePlanStatus = input.votePlanStatus;
  if (input.notes != null) data.notes = input.notes;
  if (input.metadataJson != null) data.metadataJson = input.metadataJson;

  return prisma.voterInteraction.create({ data });
}

export type VoterInteractionSummary = {
  voterRecordId: string;
  totalInteractions: number;
  lastInteractionAt: Date | null;
  lastRegistrationCheckAt: Date | null;
  byType: Partial<Record<VoterInteractionType, number>>;
  withSupportLevelRecorded: number;
};

export async function getVoterInteractionSummary(voterRecordId: string): Promise<VoterInteractionSummary> {
  const rows = await prisma.voterInteraction.findMany({
    where: { voterRecordId },
    select: {
      interactionType: true,
      interactionDate: true,
      registrationChecked: true,
      supportLevel: true,
    },
  });

  const byType: Partial<Record<VoterInteractionType, number>> = {};
  let lastInteractionAt: Date | null = null;
  let lastRegistrationCheckAt: Date | null = null;
  let withSupportLevelRecorded = 0;

  for (const r of rows) {
    byType[r.interactionType] = (byType[r.interactionType] ?? 0) + 1;
    if (!lastInteractionAt || r.interactionDate > lastInteractionAt) {
      lastInteractionAt = r.interactionDate;
    }
    if (
      r.registrationChecked &&
      (!lastRegistrationCheckAt || r.interactionDate > lastRegistrationCheckAt)
    ) {
      lastRegistrationCheckAt = r.interactionDate;
    }
    if (r.supportLevel != null && r.supportLevel !== VoterSupportLevel.UNKNOWN) {
      withSupportLevelRecorded += 1;
    }
  }

  return {
    voterRecordId,
    totalInteractions: rows.length,
    lastInteractionAt,
    lastRegistrationCheckAt,
    byType,
    withSupportLevelRecorded,
  };
}
