/**
 * INTEL-4A — Manual, source-backed opposition intelligence JSON import (no scraping, no conclusions).
 *
 * Usage (from RedDirt/):
 *   npm run ingest:opposition-intel -- --file data/intelligence/manual-opposition-intel-template.json --dry-run
 *   npm run ingest:opposition-intel -- --file path/to/bundle.json
 *
 * Order: entities (localKey → id) → sources (localKey → id) → record arrays with entityLocalKey/sourceLocalKey.
 * Defaults: reviewStatus NEEDS_REVIEW, confidence UNVERIFIED when omitted. Nothing is auto-approved.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import {
  OppositionConfidence,
  OppositionEntityType,
  OppositionReviewStatus,
  OppositionSourceType,
  Prisma,
} from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../src/lib/db";
import {
  createOppositionAccountabilityItem,
  createOppositionBillRecord,
  createOppositionElectionPattern,
  createOppositionEntity,
  createOppositionFinanceRecord,
  createOppositionMessageRecord,
  createOppositionNewsMention,
  createOppositionSource,
  createOppositionVideoRecord,
  createOppositionVoteRecord,
} from "../src/lib/campaign-engine/opposition-intelligence";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, "..");

/** CLI log prefix (helpers still tag warnings with INTEL3_PACKET). */
const LOG = "[INTEL-4A] opposition-intel import";

const DEFAULT_CONF: OppositionConfidence = "UNVERIFIED";
const DEFAULT_REVIEW: OppositionReviewStatus = "NEEDS_REVIEW";

function hasFlag(name: string) {
  return process.argv.includes(name);
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function parseOptDate(raw: unknown, field: string): Date | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return null;
  if (typeof raw !== "string") throw new Error(`${field}: expected ISO string, null, or omit`);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw new Error(`${field}: invalid date`);
  return d;
}

function asJson(r: unknown): Prisma.InputJsonValue {
  if (r === undefined || r === null) return {};
  return r as Prisma.InputJsonValue;
}

const entityRow = z
  .object({
    localKey: z.string().min(1),
    name: z.string().min(1),
    type: z.nativeEnum(OppositionEntityType),
    description: z.string().nullable().optional(),
    currentOffice: z.string().nullable().optional(),
    party: z.string().nullable().optional(),
    geography: z.string().nullable().optional(),
    tagsJson: z.unknown().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict();

const sourceRow = z
  .object({
    localKey: z.string().min(1),
    title: z.string().min(1),
    sourceType: z.nativeEnum(OppositionSourceType),
    sourceUrl: z.string().nullable().optional(),
    sourcePath: z.string().nullable().optional(),
    publisher: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    accessedAt: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict();

const linkFields = {
  entityLocalKey: z.string().optional(),
  entityId: z.string().optional(),
  sourceLocalKey: z.string().optional(),
  sourceId: z.string().nullable().optional(),
};

const billRecordRow = z
  .object({
    ...linkFields,
    billNumber: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
    policyArea: z.string().nullable().optional(),
    impactArea: z.string().nullable().optional(),
    session: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    introducedAt: z.string().nullable().optional(),
    lastActionAt: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict()
  .refine((r) => Boolean(r.entityLocalKey?.trim() || r.entityId?.trim()), {
    message: "billRecords[]: entityLocalKey or entityId required",
  });

const voteRecordRow = z
  .object({
    ...linkFields,
    billNumber: z.string().nullable().optional(),
    vote: z.string().nullable().optional(),
    voteDate: z.string().nullable().optional(),
    chamber: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    impactGroup: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict()
  .refine((r) => Boolean(r.entityLocalKey?.trim() || r.entityId?.trim()), {
    message: "voteRecords[]: entityLocalKey or entityId required",
  });

const financeRecordRow = z
  .object({
    ...linkFields,
    donorName: z.string().nullable().optional(),
    donorType: z.string().nullable().optional(),
    amount: z.number().nullable().optional(),
    date: z.string().nullable().optional(),
    employer: z.string().nullable().optional(),
    industry: z.string().nullable().optional(),
    geography: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict()
  .refine((r) => Boolean(r.entityLocalKey?.trim() || r.entityId?.trim()), {
    message: "financeRecords[]: entityLocalKey or entityId required",
  });

const messageRecordRow = z
  .object({
    ...linkFields,
    messageType: z.string().nullable().optional(),
    topic: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    tone: z.string().nullable().optional(),
    messageDate: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict()
  .refine((r) => Boolean(r.entityLocalKey?.trim() || r.entityId?.trim()), {
    message: "messageRecords[]: entityLocalKey or entityId required",
  });

const videoRecordRow = z
  .object({
    ...linkFields,
    eventType: z.string().nullable().optional(),
    topic: z.string().nullable().optional(),
    billNumber: z.string().nullable().optional(),
    videoDate: z.string().nullable().optional(),
    timestampLabel: z.string().nullable().optional(),
    transcriptStatus: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict()
  .refine((r) => Boolean(r.entityLocalKey?.trim() || r.entityId?.trim()), {
    message: "videoRecords[]: entityLocalKey or entityId required",
  });

const newsMentionRow = z
  .object({
    ...linkFields,
    outlet: z.string().nullable().optional(),
    headline: z.string().nullable().optional(),
    topic: z.string().nullable().optional(),
    sentiment: z.string().nullable().optional(),
    mentionDate: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict()
  .refine((r) => Boolean(r.entityLocalKey?.trim() || r.entityId?.trim()), {
    message: "newsMentions[]: entityLocalKey or entityId required",
  });

const electionPatternRow = z
  .object({
    ...linkFields,
    electionYear: z.number().int().nullable().optional(),
    county: z.string().nullable().optional(),
    voteShare: z.number().nullable().optional(),
    turnout: z.number().nullable().optional(),
    comparisonGroup: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict()
  .refine((r) => Boolean(r.entityLocalKey?.trim() || r.entityId?.trim()), {
    message: "electionPatterns[]: entityLocalKey or entityId required",
  });

const accountabilityRow = z
  .object({
    ...linkFields,
    title: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    impact: z.string().nullable().optional(),
    billNumber: z.string().nullable().optional(),
    actionDate: z.string().nullable().optional(),
    confidence: z.nativeEnum(OppositionConfidence).optional(),
    reviewStatus: z.nativeEnum(OppositionReviewStatus).optional(),
    notes: z.string().nullable().optional(),
    metadataJson: z.unknown().optional(),
  })
  .strict()
  .refine((r) => Boolean(r.entityLocalKey?.trim() || r.entityId?.trim()), {
    message: "accountabilityItems[]: entityLocalKey or entityId required",
  });

const bundleSchema = z
  .object({
    entities: z.array(entityRow).default([]),
    sources: z.array(sourceRow).default([]),
    billRecords: z.array(billRecordRow).default([]),
    voteRecords: z.array(voteRecordRow).default([]),
    financeRecords: z.array(financeRecordRow).default([]),
    messageRecords: z.array(messageRecordRow).default([]),
    videoRecords: z.array(videoRecordRow).default([]),
    newsMentions: z.array(newsMentionRow).default([]),
    electionPatterns: z.array(electionPatternRow).default([]),
    accountabilityItems: z.array(accountabilityRow).default([]),
  })
  .strict();

type EntityMap = Map<string, string>;
type SourceMap = Map<string, string>;

type Db = PrismaClient | Prisma.TransactionClient;

function resolveEntityId(
  row: { entityLocalKey?: string; entityId?: string | null },
  entityMap: EntityMap,
  context: string
): string {
  if (row.entityId?.trim()) return row.entityId.trim();
  const lk = row.entityLocalKey?.trim();
  if (lk) {
    const id = entityMap.get(lk);
    if (!id) throw new Error(`${context}: unknown entityLocalKey "${lk}"`);
    return id;
  }
  throw new Error(`${context}: entityLocalKey or entityId required`);
}

function resolveSourceId(
  row: { sourceLocalKey?: string; sourceId?: string | null },
  sourceMap: SourceMap
): string | null {
  if (row.sourceId !== undefined && row.sourceId !== null && String(row.sourceId).trim() !== "")
    return String(row.sourceId).trim();
  const lk = row.sourceLocalKey?.trim();
  if (lk) {
    const id = sourceMap.get(lk);
    if (!id) throw new Error(`unknown sourceLocalKey "${lk}"`);
    return id;
  }
  return null;
}

async function runImport(dryRun: boolean, data: z.infer<typeof bundleSchema>) {
  const entityMap: EntityMap = new Map();
  const sourceMap: SourceMap = new Map();

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          wouldCreate: {
            entities: data.entities.length,
            sources: data.sources.length,
            billRecords: data.billRecords.length,
            voteRecords: data.voteRecords.length,
            financeRecords: data.financeRecords.length,
            messageRecords: data.messageRecords.length,
            videoRecords: data.videoRecords.length,
            newsMentions: data.newsMentions.length,
            electionPatterns: data.electionPatterns.length,
            accountabilityItems: data.accountabilityItems.length,
          },
        },
        null,
        2
      )
    );
    return;
  }

  const run = async (db: Db) => {
    for (const e of data.entities) {
      const created = await createOppositionEntity(
        {
          name: e.name,
          type: e.type,
          description: e.description ?? null,
          currentOffice: e.currentOffice ?? null,
          party: e.party ?? null,
          geography: e.geography ?? null,
          tagsJson: asJson(e.tagsJson ?? []),
          metadataJson: asJson(e.metadataJson),
        },
        db
      );
      if (entityMap.has(e.localKey)) throw new Error(`duplicate entity localKey: ${e.localKey}`);
      entityMap.set(e.localKey, created.id);
    }

    for (const s of data.sources) {
      const created = await createOppositionSource(
        {
          title: s.title,
          sourceType: s.sourceType,
          sourceUrl: s.sourceUrl ?? null,
          sourcePath: s.sourcePath ?? null,
          publisher: s.publisher ?? null,
          publishedAt: parseOptDate(s.publishedAt, "source.publishedAt") ?? null,
          accessedAt: parseOptDate(s.accessedAt, "source.accessedAt") ?? null,
          confidence: s.confidence ?? DEFAULT_CONF,
          reviewStatus: s.reviewStatus ?? DEFAULT_REVIEW,
          notes: s.notes ?? null,
          metadataJson: asJson(s.metadataJson),
        },
        db
      );
      if (sourceMap.has(s.localKey)) throw new Error(`duplicate source localKey: ${s.localKey}`);
      sourceMap.set(s.localKey, created.id);
    }

    for (const r of data.billRecords) {
      await createOppositionBillRecord(
        {
          entityId: resolveEntityId(r, entityMap, "billRecords[]"),
          sourceId: resolveSourceId(r, sourceMap),
          billNumber: r.billNumber ?? null,
          title: r.title ?? null,
          summary: r.summary ?? null,
          role: r.role ?? null,
          policyArea: r.policyArea ?? null,
          impactArea: r.impactArea ?? null,
          session: r.session ?? null,
          status: r.status ?? null,
          introducedAt: parseOptDate(r.introducedAt, "introducedAt") ?? null,
          lastActionAt: parseOptDate(r.lastActionAt, "lastActionAt") ?? null,
          confidence: r.confidence ?? DEFAULT_CONF,
          reviewStatus: r.reviewStatus ?? DEFAULT_REVIEW,
          notes: r.notes ?? null,
          metadataJson: asJson(r.metadataJson),
        },
        db
      );
    }

    for (const r of data.voteRecords) {
      await createOppositionVoteRecord(
        {
          entityId: resolveEntityId(r, entityMap, "voteRecords[]"),
          sourceId: resolveSourceId(r, sourceMap),
          billNumber: r.billNumber ?? null,
          vote: r.vote ?? null,
          voteDate: parseOptDate(r.voteDate, "voteDate") ?? null,
          chamber: r.chamber ?? null,
          category: r.category ?? null,
          impactGroup: r.impactGroup ?? null,
          confidence: r.confidence ?? DEFAULT_CONF,
          reviewStatus: r.reviewStatus ?? DEFAULT_REVIEW,
          notes: r.notes ?? null,
          metadataJson: asJson(r.metadataJson),
        },
        db
      );
    }

    for (const r of data.financeRecords) {
      await createOppositionFinanceRecord(
        {
          entityId: resolveEntityId(r, entityMap, "financeRecords[]"),
          sourceId: resolveSourceId(r, sourceMap),
          donorName: r.donorName ?? null,
          donorType: r.donorType ?? null,
          amount: r.amount ?? null,
          date: parseOptDate(r.date, "date") ?? null,
          employer: r.employer ?? null,
          industry: r.industry ?? null,
          geography: r.geography ?? null,
          confidence: r.confidence ?? DEFAULT_CONF,
          reviewStatus: r.reviewStatus ?? DEFAULT_REVIEW,
          notes: r.notes ?? null,
          metadataJson: asJson(r.metadataJson),
        },
        db
      );
    }

    for (const r of data.messageRecords) {
      await createOppositionMessageRecord(
        {
          entityId: resolveEntityId(r, entityMap, "messageRecords[]"),
          sourceId: resolveSourceId(r, sourceMap),
          messageType: r.messageType ?? null,
          topic: r.topic ?? null,
          summary: r.summary ?? null,
          tone: r.tone ?? null,
          messageDate: parseOptDate(r.messageDate, "messageDate") ?? null,
          confidence: r.confidence ?? DEFAULT_CONF,
          reviewStatus: r.reviewStatus ?? DEFAULT_REVIEW,
          notes: r.notes ?? null,
          metadataJson: asJson(r.metadataJson),
        },
        db
      );
    }

    for (const r of data.videoRecords) {
      await createOppositionVideoRecord(
        {
          entityId: resolveEntityId(r, entityMap, "videoRecords[]"),
          sourceId: resolveSourceId(r, sourceMap),
          eventType: r.eventType ?? null,
          topic: r.topic ?? null,
          billNumber: r.billNumber ?? null,
          videoDate: parseOptDate(r.videoDate, "videoDate") ?? null,
          timestampLabel: r.timestampLabel ?? null,
          transcriptStatus: r.transcriptStatus ?? null,
          confidence: r.confidence ?? DEFAULT_CONF,
          reviewStatus: r.reviewStatus ?? DEFAULT_REVIEW,
          notes: r.notes ?? null,
          metadataJson: asJson(r.metadataJson),
        },
        db
      );
    }

    for (const r of data.newsMentions) {
      await createOppositionNewsMention(
        {
          entityId: resolveEntityId(r, entityMap, "newsMentions[]"),
          sourceId: resolveSourceId(r, sourceMap),
          outlet: r.outlet ?? null,
          headline: r.headline ?? null,
          topic: r.topic ?? null,
          sentiment: r.sentiment ?? null,
          mentionDate: parseOptDate(r.mentionDate, "mentionDate") ?? null,
          confidence: r.confidence ?? DEFAULT_CONF,
          reviewStatus: r.reviewStatus ?? DEFAULT_REVIEW,
          notes: r.notes ?? null,
          metadataJson: asJson(r.metadataJson),
        },
        db
      );
    }

    for (const r of data.electionPatterns) {
      await createOppositionElectionPattern(
        {
          entityId: resolveEntityId(r, entityMap, "electionPatterns[]"),
          sourceId: resolveSourceId(r, sourceMap),
          electionYear: r.electionYear ?? null,
          county: r.county ?? null,
          voteShare: r.voteShare ?? null,
          turnout: r.turnout ?? null,
          comparisonGroup: r.comparisonGroup ?? null,
          confidence: r.confidence ?? DEFAULT_CONF,
          reviewStatus: r.reviewStatus ?? DEFAULT_REVIEW,
          notes: r.notes ?? null,
          metadataJson: asJson(r.metadataJson),
        },
        db
      );
    }

    for (const r of data.accountabilityItems) {
      await createOppositionAccountabilityItem(
        {
          entityId: resolveEntityId(r, entityMap, "accountabilityItems[]"),
          sourceId: resolveSourceId(r, sourceMap),
          title: r.title ?? null,
          category: r.category ?? null,
          description: r.description ?? null,
          impact: r.impact ?? null,
          billNumber: r.billNumber ?? null,
          actionDate: parseOptDate(r.actionDate, "actionDate") ?? null,
          confidence: r.confidence ?? DEFAULT_CONF,
          reviewStatus: r.reviewStatus ?? DEFAULT_REVIEW,
          notes: r.notes ?? null,
          metadataJson: asJson(r.metadataJson),
        },
        db
      );
    }
  };

  await prisma.$transaction((tx) => run(tx as unknown as PrismaClient));
  console.log(`${LOG} import committed.`);
}

async function main() {
  loadEnvConfig(REPO);
  const fileArg = argValue("--file");
  if (!fileArg) {
    console.error(`${LOG} missing --file <path-to-json>`);
    process.exit(1);
  }
  const abs = path.isAbsolute(fileArg) ? fileArg : path.join(REPO, fileArg);
  const raw = readFileSync(abs, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (e) {
    console.error(`${LOG} invalid JSON:`, e);
    process.exit(1);
  }

  const data = bundleSchema.parse(parsed);
  const dryRun = hasFlag("--dry-run");

  if (dryRun) {
    console.log(`${LOG} --dry-run: validating and reporting counts (no DB writes).`);
  }

  await runImport(dryRun, data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
