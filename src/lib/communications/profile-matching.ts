import "server-only";

import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/communications/email-address";
import type { CommunicationIdentity } from "@prisma/client";

/**
 * Exact-email profile lookup — never auto-approves; creates match candidates only.
 */
export async function matchCommunicationIdentityToEmailContactProfiles(
  identity: Pick<CommunicationIdentity, "id" | "normalizedEmail">,
): Promise<{ profiles: { id: string; primaryEmail: string | null }[]; conflict: boolean }> {
  const em = identity.normalizedEmail?.trim();
  if (!em) return { profiles: [], conflict: false };
  const profiles = await prisma.emailContactProfile.findMany({
    where: { primaryEmail: { equals: em, mode: "insensitive" } },
    select: { id: true, primaryEmail: true },
    take: 5,
  });
  return { profiles, conflict: profiles.length > 1 };
}

export async function createCommunicationMatchCandidatesForIdentity(
  identityId: string,
  profiles: { id: string }[],
  conflict: boolean,
): Promise<number> {
  if (profiles.length === 0) return 0;
  if (conflict) {
    await prisma.communicationProfileMatchCandidate.create({
      data: {
        communicationIdentityId: identityId,
        targetType: "EMAIL_CONTACT_PROFILE",
        targetId: profiles[0].id,
        confidence: 0.4,
        reasonsJson: { kind: "multiple_profiles_same_email", count: profiles.length },
        status: "PENDING",
      },
    });
    return 1;
  }
  await prisma.communicationProfileMatchCandidate.create({
    data: {
      communicationIdentityId: identityId,
      targetType: "EMAIL_CONTACT_PROFILE",
      targetId: profiles[0].id,
      confidence: 0.95,
      reasonsJson: { kind: "exact_primary_email" },
      status: "PENDING",
    },
  });
  return 1;
}

export async function isSendGridSuppressedEmail(normalizedEmail: string): Promise<boolean> {
  const n = normalizeEmail(normalizedEmail);
  if (!n) return false;
  const hit = await prisma.sendGridSuppression.findFirst({
    where: { email: { equals: n, mode: "insensitive" } },
    select: { id: true },
  });
  return Boolean(hit);
}

export async function ensureCommunicationIdentityForEmail(input: {
  normalizedEmail: string;
  displayName?: string | null;
}): Promise<{ id: string; created: boolean; suppressed: boolean }> {
  const normalizedEmail = normalizeEmail(input.normalizedEmail);
  if (!normalizedEmail) throw new Error("missing email");
  const suppressed = await isSendGridSuppressedEmail(normalizedEmail);
  const existing = await prisma.communicationIdentity.findFirst({
    where: { normalizedEmail },
    select: { id: true, reviewStatus: true },
  });
  if (existing) {
    if (suppressed && existing.reviewStatus !== "SUPPRESSED") {
      await prisma.communicationIdentity.update({
        where: { id: existing.id },
        data: { reviewStatus: "SUPPRESSED" },
      });
    }
    return { id: existing.id, created: false, suppressed };
  }
  const row = await prisma.communicationIdentity.create({
    data: {
      primaryEmail: normalizedEmail,
      normalizedEmail,
      displayName: input.displayName?.trim() || null,
      reviewStatus: suppressed ? "SUPPRESSED" : "NEEDS_REVIEW",
      sourceSummaryJson: { origins: ["communication_intelligence_ingest"] },
    },
  });
  return { id: row.id, created: true, suppressed };
}
