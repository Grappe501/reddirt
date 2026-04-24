/**
 * INTEL-3: Source-backed opposition intelligence persistence helpers.
 * No scraping, no publication, no AI conclusions, no voter-level fields.
 * @see docs/COMPETITOR_INTELLIGENCE_MANIFEST.md · docs/opposition-intelligence-engine.md
 */

import {
  type OppositionConfidence,
  type OppositionEntityType,
  type OppositionReviewStatus,
  type OppositionSourceType,
  Prisma,
} from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

export const INTEL3_PACKET = "INTEL-3" as const;

const DEFAULT_CONFIDENCE: OppositionConfidence = "UNVERIFIED";
const DEFAULT_REVIEW: OppositionReviewStatus = "NEEDS_REVIEW";

function warnMissingSource(context: string, sourceId: string | null | undefined) {
  if (!sourceId?.trim()) {
    console.warn(
      `[${INTEL3_PACKET}] ${context}: missing sourceId — link an OppositionSource before treating the row as evidence.`
    );
  }
}

export type CreateOppositionEntityInput = {
  name: string;
  type: OppositionEntityType;
  description?: string | null;
  currentOffice?: string | null;
  party?: string | null;
  geography?: string | null;
  tagsJson?: Prisma.InputJsonValue;
  metadataJson?: Prisma.InputJsonValue;
};

export async function createOppositionEntity(
  data: CreateOppositionEntityInput,
  db: Pick<PrismaClient, "oppositionEntity"> = prisma
) {
  const name = data.name.trim();
  if (!name) throw new Error("opposition_entity_name_required");
  return db.oppositionEntity.create({
    data: {
      name,
      type: data.type,
      description: data.description?.trim() || null,
      currentOffice: data.currentOffice?.trim() || null,
      party: data.party?.trim() || null,
      geography: data.geography?.trim() || null,
      tagsJson: data.tagsJson ?? [],
      metadataJson: data.metadataJson ?? {},
    },
  });
}

export type CreateOppositionSourceInput = {
  title: string;
  sourceType: OppositionSourceType;
  sourceUrl?: string | null;
  sourcePath?: string | null;
  publisher?: string | null;
  publishedAt?: Date | null;
  accessedAt?: Date | null;
  confidence?: OppositionConfidence;
  reviewStatus?: OppositionReviewStatus;
  notes?: string | null;
  metadataJson?: Prisma.InputJsonValue;
};

export async function createOppositionSource(
  data: CreateOppositionSourceInput,
  db: Pick<PrismaClient, "oppositionSource"> = prisma
) {
  const title = data.title.trim();
  if (!title) throw new Error("opposition_source_title_required");
  const hasLoc = Boolean(data.sourceUrl?.trim() || data.sourcePath?.trim());
  if (!hasLoc) {
    console.warn(
      `[${INTEL3_PACKET}] createOppositionSource: no sourceUrl or sourcePath — add provenance before external use.`
    );
  }
  return db.oppositionSource.create({
    data: {
      title,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl?.trim() || null,
      sourcePath: data.sourcePath?.trim() || null,
      publisher: data.publisher?.trim() || null,
      publishedAt: data.publishedAt ?? null,
      accessedAt: data.accessedAt ?? null,
      confidence: data.confidence ?? DEFAULT_CONFIDENCE,
      reviewStatus: data.reviewStatus ?? DEFAULT_REVIEW,
      notes: data.notes?.trim() || null,
      metadataJson: data.metadataJson ?? {},
    },
  });
}

export type CreateOppositionBillRecordInput = {
  entityId: string;
  sourceId?: string | null;
  billNumber?: string | null;
  title?: string | null;
  summary?: string | null;
  role?: string | null;
  policyArea?: string | null;
  impactArea?: string | null;
  session?: string | null;
  status?: string | null;
  introducedAt?: Date | null;
  lastActionAt?: Date | null;
  confidence?: OppositionConfidence;
  reviewStatus?: OppositionReviewStatus;
  notes?: string | null;
  metadataJson?: Prisma.InputJsonValue;
};

export async function createOppositionBillRecord(
  data: CreateOppositionBillRecordInput,
  db: Pick<PrismaClient, "oppositionBillRecord"> = prisma
) {
  warnMissingSource("createOppositionBillRecord", data.sourceId);
  return db.oppositionBillRecord.create({
    data: {
      entityId: data.entityId,
      sourceId: data.sourceId?.trim() || null,
      billNumber: data.billNumber?.trim() || null,
      title: data.title?.trim() || null,
      summary: data.summary?.trim() || null,
      role: data.role?.trim() || null,
      policyArea: data.policyArea?.trim() || null,
      impactArea: data.impactArea?.trim() || null,
      session: data.session?.trim() || null,
      status: data.status?.trim() || null,
      introducedAt: data.introducedAt ?? null,
      lastActionAt: data.lastActionAt ?? null,
      confidence: data.confidence ?? DEFAULT_CONFIDENCE,
      reviewStatus: data.reviewStatus ?? DEFAULT_REVIEW,
      notes: data.notes?.trim() || null,
      metadataJson: data.metadataJson ?? {},
    },
  });
}

export type CreateOppositionVoteRecordInput = {
  entityId: string;
  sourceId?: string | null;
  billNumber?: string | null;
  vote?: string | null;
  voteDate?: Date | null;
  chamber?: string | null;
  category?: string | null;
  impactGroup?: string | null;
  confidence?: OppositionConfidence;
  reviewStatus?: OppositionReviewStatus;
  notes?: string | null;
  metadataJson?: Prisma.InputJsonValue;
};

export async function createOppositionVoteRecord(
  data: CreateOppositionVoteRecordInput,
  db: Pick<PrismaClient, "oppositionVoteRecord"> = prisma
) {
  warnMissingSource("createOppositionVoteRecord", data.sourceId);
  return db.oppositionVoteRecord.create({
    data: {
      entityId: data.entityId,
      sourceId: data.sourceId?.trim() || null,
      billNumber: data.billNumber?.trim() || null,
      vote: data.vote?.trim() || null,
      voteDate: data.voteDate ?? null,
      chamber: data.chamber?.trim() || null,
      category: data.category?.trim() || null,
      impactGroup: data.impactGroup?.trim() || null,
      confidence: data.confidence ?? DEFAULT_CONFIDENCE,
      reviewStatus: data.reviewStatus ?? DEFAULT_REVIEW,
      notes: data.notes?.trim() || null,
      metadataJson: data.metadataJson ?? {},
    },
  });
}

export type CreateOppositionFinanceRecordInput = {
  entityId: string;
  sourceId?: string | null;
  donorName?: string | null;
  donorType?: string | null;
  amount?: number | null;
  date?: Date | null;
  employer?: string | null;
  industry?: string | null;
  geography?: string | null;
  confidence?: OppositionConfidence;
  reviewStatus?: OppositionReviewStatus;
  notes?: string | null;
  metadataJson?: Prisma.InputJsonValue;
};

export async function createOppositionFinanceRecord(
  data: CreateOppositionFinanceRecordInput,
  db: Pick<PrismaClient, "oppositionFinanceRecord"> = prisma
) {
  warnMissingSource("createOppositionFinanceRecord", data.sourceId);
  let amount: Prisma.Decimal | null = null;
  if (data.amount != null) {
    if (!Number.isFinite(data.amount)) throw new Error("opposition_finance_amount_invalid");
    amount = new Prisma.Decimal(data.amount);
  }
  return db.oppositionFinanceRecord.create({
    data: {
      entityId: data.entityId,
      sourceId: data.sourceId?.trim() || null,
      donorName: data.donorName?.trim() || null,
      donorType: data.donorType?.trim() || null,
      amount,
      date: data.date ?? null,
      employer: data.employer?.trim() || null,
      industry: data.industry?.trim() || null,
      geography: data.geography?.trim() || null,
      confidence: data.confidence ?? DEFAULT_CONFIDENCE,
      reviewStatus: data.reviewStatus ?? DEFAULT_REVIEW,
      notes: data.notes?.trim() || null,
      metadataJson: data.metadataJson ?? {},
    },
  });
}

export type CreateOppositionAccountabilityItemInput = {
  entityId: string;
  sourceId?: string | null;
  title?: string | null;
  category?: string | null;
  description?: string | null;
  impact?: string | null;
  billNumber?: string | null;
  actionDate?: Date | null;
  confidence?: OppositionConfidence;
  reviewStatus?: OppositionReviewStatus;
  notes?: string | null;
  metadataJson?: Prisma.InputJsonValue;
};

export async function createOppositionAccountabilityItem(
  data: CreateOppositionAccountabilityItemInput,
  db: Pick<PrismaClient, "oppositionAccountabilityItem"> = prisma
) {
  warnMissingSource("createOppositionAccountabilityItem", data.sourceId);
  return db.oppositionAccountabilityItem.create({
    data: {
      entityId: data.entityId,
      sourceId: data.sourceId?.trim() || null,
      title: data.title?.trim() || null,
      category: data.category?.trim() || null,
      description: data.description?.trim() || null,
      impact: data.impact?.trim() || null,
      billNumber: data.billNumber?.trim() || null,
      actionDate: data.actionDate ?? null,
      confidence: data.confidence ?? DEFAULT_CONFIDENCE,
      reviewStatus: data.reviewStatus ?? DEFAULT_REVIEW,
      notes: data.notes?.trim() || null,
      metadataJson: data.metadataJson ?? {},
    },
  });
}

export async function listOppositionEntities(
  opts: { take?: number } = {},
  db: Pick<PrismaClient, "oppositionEntity"> = prisma
) {
  const take = opts.take ?? 500;
  return db.oppositionEntity.findMany({
    orderBy: [{ name: "asc" }],
    take,
  });
}

export type OppositionEntitySummary = {
  entity: {
    id: string;
    name: string;
    type: OppositionEntityType;
    updatedAt: Date;
  };
  counts: {
    billRecords: number;
    voteRecords: number;
    financeRecords: number;
    messageRecords: number;
    videoRecords: number;
    newsMentions: number;
    electionPatterns: number;
    accountabilityItems: number;
  };
};

export async function getOppositionEntitySummary(
  entityId: string,
  db: Pick<
    PrismaClient,
    | "oppositionEntity"
    | "oppositionBillRecord"
    | "oppositionVoteRecord"
    | "oppositionFinanceRecord"
    | "oppositionMessageRecord"
    | "oppositionVideoRecord"
    | "oppositionNewsMention"
    | "oppositionElectionPattern"
    | "oppositionAccountabilityItem"
  > = prisma
): Promise<OppositionEntitySummary | null> {
  const entity = await db.oppositionEntity.findUnique({
    where: { id: entityId },
    select: { id: true, name: true, type: true, updatedAt: true },
  });
  if (!entity) return null;

  const [
    billRecords,
    voteRecords,
    financeRecords,
    messageRecords,
    videoRecords,
    newsMentions,
    electionPatterns,
    accountabilityItems,
  ] = await Promise.all([
    db.oppositionBillRecord.count({ where: { entityId } }),
    db.oppositionVoteRecord.count({ where: { entityId } }),
    db.oppositionFinanceRecord.count({ where: { entityId } }),
    db.oppositionMessageRecord.count({ where: { entityId } }),
    db.oppositionVideoRecord.count({ where: { entityId } }),
    db.oppositionNewsMention.count({ where: { entityId } }),
    db.oppositionElectionPattern.count({ where: { entityId } }),
    db.oppositionAccountabilityItem.count({ where: { entityId } }),
  ]);

  return {
    entity,
    counts: {
      billRecords,
      voteRecords,
      financeRecords,
      messageRecords,
      videoRecords,
      newsMentions,
      electionPatterns,
      accountabilityItems,
    },
  };
}
