/**
 * REL-2: read-only match suggestions and explicit human-confirmed match writes.
 * No auto-matching, no background jobs.
 */

import type { Prisma } from "@prisma/client";
import { ModelConfidence, Prisma as PrismaNS, RelationalMatchStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

import { REL2_PACKET } from "./relational-contacts";

export const REL2_MATCHING_PACKET = "REL-2-matching" as const;

function digits10(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  if (d.length < 10) return null;
  return d.slice(-10);
}

export type VoterMatchCandidate = {
  voterRecordId: string;
  voterFileKey: string;
  countyId: string;
  countySlug: string;
  firstName: string | null;
  lastName: string | null;
  phone10: string | null;
  reasons: {
    nameMatch: boolean;
    countyMatch: boolean;
    phoneMatch: boolean;
    /** `VoterRecord` has no email column — never matched against roll data here. */
    emailMatch: "n_a_no_voter_email_field" | "contact_has_no_email" | "not_applicable";
  };
};

/**
 * Returns up to 25 candidate `VoterRecord` rows. Does not update the contact.
 */
export async function suggestVoterMatchesForRelationalContact(
  contactId: string,
  take = 25,
): Promise<VoterMatchCandidate[]> {
  const contact = await prisma.relationalContact.findUnique({ where: { id: contactId } });
  if (!contact) return [];

  const fn = contact.firstName?.trim().toLowerCase() || null;
  const ln = contact.lastName?.trim().toLowerCase() || null;
  const contactPhone = digits10(contact.phone);
  const contactCountyId = contact.countyId;

  const ors: Prisma.VoterRecordWhereInput[] = [];

  if (contactCountyId && fn && ln) {
    ors.push({
      countyId: contactCountyId,
      firstName: { equals: fn, mode: PrismaNS.QueryMode.insensitive },
      lastName: { equals: ln, mode: PrismaNS.QueryMode.insensitive },
    });
  } else if (contactCountyId && ln) {
    ors.push({
      countyId: contactCountyId,
      lastName: { equals: ln, mode: PrismaNS.QueryMode.insensitive },
    });
  } else if (ln) {
    ors.push({ lastName: { equals: ln, mode: PrismaNS.QueryMode.insensitive } });
  }

  if (contactPhone) {
    ors.push({ phone10: contactPhone });
  }

  if (ors.length === 0) {
    return [];
  }

  const rows = await prisma.voterRecord.findMany({
    where: { OR: ors, inLatestCompletedFile: true },
    take: 80,
    select: {
      id: true,
      voterFileKey: true,
      countyId: true,
      countySlug: true,
      firstName: true,
      lastName: true,
      phone10: true,
    },
  });

  const emailNarr: VoterMatchCandidate["reasons"]["emailMatch"] = !contact.email?.trim()
    ? "contact_has_no_email"
    : "n_a_no_voter_email_field";

  const scored: VoterMatchCandidate[] = [];
  for (const v of rows) {
    const vfn = v.firstName?.trim().toLowerCase() || null;
    const vln = v.lastName?.trim().toLowerCase() || null;
    const nameMatch = Boolean(
      (fn && ln && vfn && vln && vfn === fn && vln === ln) || (ln && vln && ln === vln),
    );
    const countyMatch = Boolean(contactCountyId && v.countyId === contactCountyId);
    const phoneMatch = Boolean(contactPhone && v.phone10 && v.phone10 === contactPhone);
    // Conservative: at least one substantive signal (not county-only).
    if (!nameMatch && !phoneMatch) continue;
    scored.push({
      voterRecordId: v.id,
      voterFileKey: v.voterFileKey,
      countyId: v.countyId,
      countySlug: v.countySlug,
      firstName: v.firstName,
      lastName: v.lastName,
      phone10: v.phone10,
      reasons: {
        nameMatch,
        countyMatch,
        phoneMatch,
        emailMatch: emailNarr,
      },
    });
  }

  const score = (c: VoterMatchCandidate) =>
    (c.reasons.phoneMatch ? 5 : 0) +
    (c.reasons.nameMatch ? 3 : 0) +
    (c.reasons.countyMatch ? 1 : 0);

  const byId = new Map<string, VoterMatchCandidate>();
  for (const c of scored) {
    const prev = byId.get(c.voterRecordId);
    if (!prev || score(c) > score(prev)) byId.set(c.voterRecordId, c);
  }
  return [...byId.values()].sort((a, b) => score(b) - score(a)).slice(0, take);
}

export type SetRelationalContactVoterMatchInput = {
  contactId: string;
  voterRecordId: string;
  actorUserId: string;
  confidence: ModelConfidence;
  extraMetadataJson?: Prisma.InputJsonValue | null;
};

/**
 * Human-confirmed match: sets `matchedVoterRecordId`, `MATCHED`, and merges provenance into `metadataJson`.
 */
export async function setRelationalContactVoterMatch(input: SetRelationalContactVoterMatchInput) {
  const c = await prisma.relationalContact.findUnique({ where: { id: input.contactId } });
  if (!c) throw new Error("setRelationalContactVoterMatch: contact not found");
  const v = await prisma.voterRecord.findUnique({ where: { id: input.voterRecordId } });
  if (!v) throw new Error("setRelationalContactVoterMatch: voter record not found");

  const baseMeta =
    c.metadataJson && typeof c.metadataJson === "object" && c.metadataJson !== null
      ? (c.metadataJson as object)
      : {};
  const nextMeta: Prisma.InputJsonValue = {
    ...baseMeta,
    ...(input.extraMetadataJson && typeof input.extraMetadataJson === "object"
      ? (input.extraMetadataJson as object)
      : {}),
    rel2Packet: REL2_PACKET,
    matchProvenance: {
      matchedAt: new Date().toISOString(),
      matchedByUserId: input.actorUserId,
      voterRecordId: input.voterRecordId,
      confidence: input.confidence,
    },
  };

  return prisma.relationalContact.update({
    where: { id: input.contactId },
    data: {
      matchedVoterRecord: { connect: { id: input.voterRecordId } },
      matchStatus: RelationalMatchStatus.MATCHED,
      matchConfidence: input.confidence,
      metadataJson: nextMeta,
    },
  });
}
