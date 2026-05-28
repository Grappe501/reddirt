"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  createKimHammerCitationCard,
  createKimHammerCitationFromProducedEvidence,
  linkKimHammerCitationToClaim,
  updateKimHammerCitationCard,
} from "@/lib/opposition/kimHammerCitationWorkflow";
import type { KimHammerCitationReviewStatus } from "@/lib/opposition/types/kimHammerCitationLocker";
import type {
  KimHammerEvidencePolarity,
  KimHammerEvidenceStatus,
  KimHammerSourceClass,
  KimHammerSourceConfidence,
  KimHammerSourceDurability,
} from "@/lib/opposition/types/kimHammerEvidence";

const CITATION_CHANGED_BY_ROUTE =
  "admin/intelligence/kim-hammer/citation-actions";

const CITATION_REVALIDATE_PATHS = [
  "/admin/intelligence/kim-hammer",
  "/admin/intelligence/kim-hammer/evidence-command",
  "/admin/intelligence/kim-hammer/citation-locker",
  "/admin/intelligence/kim-hammer/audit-log",
  "/admin/intelligence/kim-hammer/public-debate-evidence",
];

function revalidateKimHammerCitationSurfaces() {
  for (const routePath of CITATION_REVALIDATE_PATHS) {
    revalidatePath(routePath);
  }
}

export async function updateKimHammerCitationAction(input: {
  citationId: string;
  operator: string;
  reviewStatus?: KimHammerCitationReviewStatus;
  operatorNotes?: string;
  revalidate?: boolean;
}) {
  await requireAdminAction();

  const result = updateKimHammerCitationCard({
    ...input,
    changedByRoute: `${CITATION_CHANGED_BY_ROUTE}#updateKimHammerCitationAction`,
  });

  if (result.ok) {
    revalidateKimHammerCitationSurfaces();
  }

  return result;
}

export async function createKimHammerCitationAction(input: {
  operator: string;
  sourceUrl: string;
  summary: string;
  sourceClass?: KimHammerSourceClass;
  sourceDurability?: KimHammerSourceDurability;
  evidenceStatus?: KimHammerEvidenceStatus;
  sourceConfidence?: KimHammerSourceConfidence;
  originTaskId?: string;
  linkedNarrativeIds?: string[];
  context?: string;
}) {
  await requireAdminAction();

  const result = createKimHammerCitationCard({
    ...input,
    changedByRoute: `${CITATION_CHANGED_BY_ROUTE}#createKimHammerCitationAction`,
  });

  if (result.ok) {
    revalidateKimHammerCitationSurfaces();
  }

  return result;
}

export async function linkKimHammerCitationAction(input: {
  citationId: string;
  claimId: string;
  polarity?: KimHammerEvidencePolarity;
  operator: string;
}) {
  await requireAdminAction();

  const result = linkKimHammerCitationToClaim({
    ...input,
    changedByRoute: `${CITATION_CHANGED_BY_ROUTE}#linkKimHammerCitationAction`,
  });

  if (result.ok) {
    revalidateKimHammerCitationSurfaces();
  }

  return result;
}

export async function promoteProducedEvidenceToCitationAction(input: {
  operator: string;
  producedEvidenceLink: string;
  summary?: string;
  originTaskId?: string;
}) {
  await requireAdminAction();

  const result = createKimHammerCitationFromProducedEvidence({
    operator: input.operator,
    producedEvidenceLink: input.producedEvidenceLink,
    summary: input.summary ?? "",
    originTaskId: input.originTaskId,
    changedByRoute: `${CITATION_CHANGED_BY_ROUTE}#promoteProducedEvidenceToCitationAction`,
  });

  if (result.ok) {
    revalidateKimHammerCitationSurfaces();
  }

  return result;
}
