import type { County, Prisma, SignupSheetEntry, VoterRecord } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeNamePart, normalizePhone10 } from "./normalize";
import { resolveCountyFromText } from "./resolve-county";

export type MatchReason = { rule: string; score: number; detail?: string };

const TOP_N = 12;

/**
 * Match one intake row to `VoterRecord` candidates. The warehouse must include
 * `firstName` + `lastName` (and ideally `phone10`) from voter file import.
 * If county is missing on the entry and there is no phone, we return few or no
 * matches to avoid cross-state false positives.
 */
export async function buildMatchCandidatesForEntry(
  entry: Pick<SignupSheetEntry, "id" | "firstName" | "lastName" | "phone" | "countyId" | "countyText" | "address">,
  counties: Pick<County, "id" | "slug" | "displayName" | "fips">[]
): Promise<{
  voterRowsSampled: number;
  hasPiiInWarehouse: boolean;
  ambiguous: boolean;
  candidates: { voter: VoterRecord; score: number; reasons: MatchReason[] }[];
}> {
  const totalWithNames = await prisma.voterRecord.count({
    where: { inLatestCompletedFile: true, firstName: { not: null }, lastName: { not: null } },
  });
  if (totalWithNames === 0) {
    return { voterRowsSampled: 0, hasPiiInWarehouse: false, ambiguous: false, candidates: [] };
  }

  const fn = normalizeNamePart(entry.firstName);
  const ln = normalizeNamePart(entry.lastName);
  const phone10 = normalizePhone10(entry.phone);
  if (!ln || !fn) {
    return { voterRowsSampled: 0, hasPiiInWarehouse: true, ambiguous: false, candidates: [] };
  }

  let countyId = entry.countyId;
  if (!countyId && entry.countyText) {
    const r = resolveCountyFromText(entry.countyText, counties);
    if (r) countyId = r.countyId;
  }

  if (!countyId && !phone10) {
    return {
      voterRowsSampled: 0,
      hasPiiInWarehouse: true,
      ambiguous: true,
      candidates: [],
    };
  }

  const nameWhere: Prisma.VoterRecordWhereInput = {
    inLatestCompletedFile: true,
    firstName: { equals: fn, mode: "insensitive" },
    lastName: { equals: ln, mode: "insensitive" },
  };
  if (countyId) {
    nameWhere.countyId = countyId;
  }

  if (phone10) {
    const byPhone = await prisma.voterRecord.findMany({
      where: { ...nameWhere, phone10 },
      take: TOP_N,
    });
    if (byPhone.length > 0) {
      return {
        voterRowsSampled: byPhone.length,
        hasPiiInWarehouse: true,
        ambiguous: byPhone.length > 1,
        candidates: byPhone.map((v) => ({
          voter: v,
          score: 0.95,
          reasons: [{ rule: "phone+name+county", score: 0.95, detail: "phone10 match" } satisfies MatchReason],
        })),
      };
    }
  }

  const pool = await prisma.voterRecord.findMany({
    where: nameWhere,
    take: TOP_N,
  });

  const scored: { voter: VoterRecord; score: number; reasons: MatchReason[] }[] = [];
  for (const v of pool) {
    const reasons: MatchReason[] = [{ rule: "name", score: 0.5, detail: "first+last" }];
    let score = 0.5;
    if (countyId && v.countyId === countyId) {
      reasons.push({ rule: "county", score: 0.35 });
      score += 0.35;
    }
    if (entry.address && v.city) {
      const a = entry.address.toLowerCase();
      const c = (v.city ?? "").toLowerCase();
      if (c && a.includes(c)) {
        reasons.push({ rule: "city", score: 0.1 });
        score += 0.1;
      }
    }
    scored.push({ voter: v, score: Math.min(1, score), reasons });
  }
  scored.sort((a, b) => b.score - a.score);

  return {
    voterRowsSampled: pool.length,
    hasPiiInWarehouse: true,
    ambiguous: scored.length > 1,
    candidates: scored,
  };
}

export async function refreshMatchesForExtractionId(extractionId: string) {
  const entries = await prisma.signupSheetEntry.findMany({ where: { extractionId, approvalStatus: "PENDING_REVIEW" } });
  const counties = await prisma.county.findMany({ select: { id: true, slug: true, displayName: true, fips: true } });
  for (const e of entries) {
    await prisma.volunteerMatchCandidate.deleteMany({ where: { entryId: e.id } });
    const { hasPiiInWarehouse, ambiguous, candidates } = await buildMatchCandidatesForEntry(e, counties);
    let rank = 0;
    for (const c of candidates) {
      await prisma.volunteerMatchCandidate.create({
        data: {
          entryId: e.id,
          voterRecordId: c.voter.id,
          score: c.score,
          reasonJson: { reasons: c.reasons, hasPiiInWarehouse, ambiguous } as object,
          rank: rank++,
        },
      });
    }
  }
}
