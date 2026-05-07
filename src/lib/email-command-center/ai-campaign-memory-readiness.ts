/**
 * EMAIL-AI-CAMPAIGN-MEMORY-READINESS-1.0 — honest inventory of campaign “memory” vs SearchChunk / embeddings.
 * Server-only. Does not run ingestion, fabricate index coverage, or send mail.
 */

import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/db";
import { isOpenAIConfigured } from "@/lib/openai/client";
import {
  MISSING_DOC_OPERATOR_GUIDANCE,
  SOURCE_MATERIAL_READINESS,
  type SourceMaterialReadinessKind,
} from "@/lib/email-command-center/campaign-voice";

/** Surfaces that may query `SearchChunk` today (from code audit — Message Studio is not on this list). */
export const SEARCH_CHUNK_CONSUMING_SURFACES: readonly string[] = [
  "POST /api/search — keyword chunks always; optional `includeAnswer` uses OpenAI + retrieved snippets.",
  "POST /api/assistant — blends semantic + keyword retrieval over `SearchChunk` when DB + OpenAI available.",
  "GET /api/search — returns `chunkCount` diagnostic only.",
];

/** Message Studio / email-command-center paths: static excerpts + operator text only (no SearchChunk in server actions). */
export const MESSAGE_STUDIO_AI_SOURCE_POSTURE =
  "Campaign Voice AI and related ECC OpenAI helpers use repo-defined excerpts, operator paste, queue summaries you provide, and advisory JSON — they do not call `searchChunks` / semantic RAG unless a future packet wires it explicitly.";

/** Ingestion entry points documented in `package.json` — operator-run only; this module does not execute them. */
export const DOCUMENTED_SAFE_INGEST_COMMANDS: readonly {
  id: string;
  command: string;
  purpose: string;
}[] = [
  { id: "ingest", command: "npm run ingest", purpose: "Chunk `docs/**/*.md` + route seeds into `SearchChunk` (optional embeddings)." },
  {
    id: "ingest-folder",
    command: "npm run ingest:folder",
    purpose: "Operator-directed campaign folder ingest via `scripts/ingest-campaign-folder.ts` (args required).",
  },
  {
    id: "ingest-briefings",
    command: "npm run ingest:briefings",
    purpose: "Briefing ZIP pipeline when approved for that packet.",
  },
  {
    id: "audit-campaign-ingestion",
    command: "npm run audit:campaign-ingestion",
    purpose: "Read-only audit of campaign ingestion posture (no send).",
  },
  {
    id: "ingest-docs-only",
    command: "npm run ingest",
    purpose: "Same as `ingest` — primary path for docs index rebuild in dev/staging.",
  },
] as const;

export type SearchChunkBucketStat = {
  bucket: string;
  chunkCount: number;
};

export type SearchChunkIndexStats = {
  totalChunks: number;
  chunksWithNonEmptyEmbedding: number;
  /** 0–1; 0 when totalChunks is 0 */
  embeddingCoverageRatio: number;
  buckets: SearchChunkBucketStat[];
  /** Set when DB unreachable or query failed — never pretend success */
  indexError: string | null;
};

export type CatalogKnowledgeSource = {
  id: string;
  title: string;
  slot: string;
  readiness: SourceMaterialReadinessKind;
  location: string;
  notes: string;
};

export type MissingKnowledgeItem = {
  id: string;
  severity: "info" | "warning";
  message: string;
  remediation?: string;
};

export type IngestionPlanStep = {
  step: number;
  title: string;
  action: string;
  notes: string;
};

export type CampaignMemoryReadinessSnapshot = {
  generatedAt: string;
  databaseConfigured: boolean;
  openAiConfigured: boolean;
  searchChunk: SearchChunkIndexStats;
  /** coarse label derived from real counts — not a substitute for operator verification */
  memoryTier: "no_index" | "keyword_index" | "semantic_partial" | "semantic_strong";
  messageStudioUsesSearchChunkRag: false;
  messageStudioSourceExplanation: string;
  searchChunkConsumers: readonly string[];
  operatorMustPasteManually: readonly string[];
  /** DB + registry derived gaps (same request as snapshot — no extra pretend state) */
  missingKnowledgeItems: MissingKnowledgeItem[];
};

async function loadSearchChunkIndexStats(): Promise<SearchChunkIndexStats> {
  if (!isDatabaseConfigured()) {
    return {
      totalChunks: 0,
      chunksWithNonEmptyEmbedding: 0,
      embeddingCoverageRatio: 0,
      buckets: [],
      indexError: "DATABASE_URL not configured or unreachable for this process.",
    };
  }
  try {
    const totals = await prisma.$queryRaw<{ total: bigint; nonempty: bigint }[]>`
      SELECT
        COUNT(*)::bigint AS "total",
        COUNT(*) FILTER (
          WHERE "embedding" IS NOT NULL
            AND LENGTH(TRIM("embedding")) > 2
            AND TRIM("embedding") <> '[]'
        )::bigint AS "nonempty"
      FROM "SearchChunk"
    `;
    const row = totals[0];
    const totalChunks = row?.total != null ? Number(row.total) : 0;
    const chunksWithNonEmptyEmbedding = row?.nonempty != null ? Number(row.nonempty) : 0;
    const embeddingCoverageRatio = totalChunks > 0 ? chunksWithNonEmptyEmbedding / totalChunks : 0;

    const bucketsRaw = await prisma.$queryRaw<{ bucket: string; chunk_count: bigint }[]>`
      SELECT
        CASE
          WHEN "path" LIKE 'route:%' THEN 'route_seeds'
          WHEN "path" LIKE 'brief:%' THEN 'briefings'
          WHEN "path" LIKE 'docs/%' OR "path" LIKE 'docs\\%' THEN 'docs_markdown'
          WHEN "path" LIKE '%owned%' OR "path" LIKE '%campaign-media%' OR "path" LIKE '%kellymedia%' THEN 'owned_or_media'
          WHEN "path" LIKE 'external:%' THEN 'external'
          ELSE 'other'
        END AS "bucket",
        COUNT(*)::bigint AS "chunk_count"
      FROM "SearchChunk"
      GROUP BY 1
      ORDER BY "chunk_count" DESC
    `;

    const buckets: SearchChunkBucketStat[] = bucketsRaw.map((b) => ({
      bucket: b.bucket,
      chunkCount: Number(b.chunk_count),
    }));

    return {
      totalChunks,
      chunksWithNonEmptyEmbedding,
      embeddingCoverageRatio,
      buckets,
      indexError: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "SearchChunk query failed.";
    return {
      totalChunks: 0,
      chunksWithNonEmptyEmbedding: 0,
      embeddingCoverageRatio: 0,
      buckets: [],
      indexError: msg,
    };
  }
}

function tierFromStats(stats: SearchChunkIndexStats, openAi: boolean): CampaignMemoryReadinessSnapshot["memoryTier"] {
  if (stats.indexError || stats.totalChunks === 0) return "no_index";
  if (!openAi || stats.embeddingCoverageRatio < 0.05) return "keyword_index";
  if (stats.embeddingCoverageRatio < 0.5) return "semantic_partial";
  return "semantic_strong";
}

/** Registry-backed sources operators can rely on today (static repo paths / documented pipelines). */
export function listAvailableKnowledgeSources(): CatalogKnowledgeSource[] {
  return SOURCE_MATERIAL_READINESS.filter((s) => s.readiness === "static_repo").map((s) => ({
    id: s.id,
    title: s.title,
    slot: s.slot,
    readiness: s.readiness,
    location: s.location,
    notes: s.notes,
  }));
}

/** Sources that are not bundled markdown, require paste, or require ingest before semantic RAG applies. */
export function listCatalogGapsFromRegistry(): CatalogKnowledgeSource[] {
  return SOURCE_MATERIAL_READINESS.filter((s) => s.readiness !== "static_repo").map((s) => ({
    id: s.id,
    title: s.title,
    slot: s.slot,
    readiness: s.readiness,
    location: s.location,
    notes: s.notes,
  }));
}

/** Indexed rows in Postgres only — from live `SearchChunk` counts (may be empty). */
export async function listIndexedKnowledgeSources(): Promise<{
  stats: SearchChunkIndexStats;
}> {
  const stats = await loadSearchChunkIndexStats();
  return { stats };
}

export async function listMissingKnowledgeSources(stats?: SearchChunkIndexStats): Promise<MissingKnowledgeItem[]> {
  const out: MissingKnowledgeItem[] = [];
  const resolved = stats ?? (await loadSearchChunkIndexStats());

  if (resolved.indexError) {
    out.push({
      id: "db_index_unavailable",
      severity: "warning",
      message: `SearchChunk statistics unavailable: ${resolved.indexError}`,
      remediation: "Fix DATABASE_URL / migrations, then re-open this panel.",
    });
    return out;
  }

  if (resolved.totalChunks === 0) {
    out.push({
      id: "searchchunk_empty",
      severity: "warning",
      message: "No rows in `SearchChunk` — semantic and keyword site search over the DB index are empty.",
      remediation: "From RedDirt/, run `npm run ingest` when operators approve refreshing the docs index (requires network + OPENAI_API_KEY for embeddings).",
    });
  } else if (resolved.embeddingCoverageRatio < 0.2) {
    out.push({
      id: "embeddings_sparse",
      severity: "warning",
      message: `Only ~${Math.round(resolved.embeddingCoverageRatio * 100)}% of chunks have non-empty embeddings — semantic search is weak; keyword fallback still may return hits.`,
      remediation: "Set OPENAI_API_KEY and re-run `npm run ingest`, or use `scripts/repair-owned-media-embeddings.ts` for media batches when applicable.",
    });
  }

  for (const s of SOURCE_MATERIAL_READINESS) {
    if (s.readiness === "no_bundled_document") {
      out.push({
        id: `registry_${s.id}`,
        severity: "info",
        message: `${s.title}: no bundled repo document — ${s.notes}`,
        remediation: "Paste approved material into Message Studio or extend SOURCE_MATERIAL_READINESS in a dedicated packet.",
      });
    }
  }

  for (const s of SOURCE_MATERIAL_READINESS) {
    if (s.readiness === "operator_provided_only") {
      out.push({
        id: `operator_only_${s.id}`,
        severity: "info",
        message: `${s.title} — ${s.notes}`,
        remediation: "Paste or summarize approved context into the draft; toggles in Campaign Voice document intent only.",
      });
    }
  }

  if (SOURCE_MATERIAL_READINESS.some((s) => s.readiness === "requires_ingest_for_semantic_rag")) {
    out.push({
      id: "semantic_rag_requires_ingest",
      severity: "info",
      message:
        "Registry lists SearchChunk semantic RAG as `requires_ingest_for_semantic_rag` — Message Studio still does not query it automatically.",
      remediation: MESSAGE_STUDIO_AI_SOURCE_POSTURE,
    });
  }

  for (const line of MISSING_DOC_OPERATOR_GUIDANCE) {
    out.push({
      id: `guidance_${out.length}`,
      severity: "info",
      message: line,
    });
  }

  return out;
}

export async function buildKnowledgeGapReport(): Promise<string> {
  const { stats } = await listIndexedKnowledgeSources();
  const missing = await listMissingKnowledgeSources();
  const lines: string[] = [];
  lines.push(`# Campaign memory / knowledge gap report`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`## SearchChunk (live DB)`);
  if (stats.indexError) {
    lines.push(`- Error: ${stats.indexError}`);
  } else {
    lines.push(`- Total chunks: ${stats.totalChunks}`);
    lines.push(`- Chunks with non-empty embedding JSON: ${stats.chunksWithNonEmptyEmbedding}`);
    lines.push(`- Approximate embedding coverage: ${(stats.embeddingCoverageRatio * 100).toFixed(1)}%`);
    if (stats.buckets.length) {
      lines.push(`- Buckets:`);
      for (const b of stats.buckets) {
        lines.push(`  - ${b.bucket}: ${b.chunkCount}`);
      }
    }
  }
  lines.push("");
  lines.push(`## Gaps / reminders`);
  for (const m of missing) {
    lines.push(`- [${m.severity}] ${m.message}${m.remediation ? ` → ${m.remediation}` : ""}`);
  }
  lines.push("");
  lines.push(`## Message Studio`);
  lines.push(`- ${MESSAGE_STUDIO_AI_SOURCE_POSTURE}`);
  return lines.join("\n");
}

/** Ordered, conservative steps — references only documented npm scripts; does not run them. */
export function buildRecommendedIngestionPlan(): IngestionPlanStep[] {
  return [
    {
      step: 1,
      title: "Confirm database + OpenAI gates",
      action: "Run Communication Command Center readiness + `npm run email:db:diagnose` from RedDirt/ when unsure.",
      notes: "Embeddings require OPENAI_API_KEY; without it ingest still writes chunks but semantic similarity is weak.",
    },
    {
      step: 2,
      title: "Baseline docs + route seeds",
      action: DOCUMENTED_SAFE_INGEST_COMMANDS[0].command,
      notes: DOCUMENTED_SAFE_INGEST_COMMANDS[0].purpose,
    },
    {
      step: 3,
      title: "Optional campaign folder governed ingest",
      action: DOCUMENTED_SAFE_INGEST_COMMANDS[1].command,
      notes: "Use explicit `--dir` and flags per ops checklist — no bulk ingest without packet approval.",
    },
    {
      step: 4,
      title: "Audit prior runs",
      action: "npm run audit:campaign-ingestion",
      notes: "Read-only posture review before expanding corpus.",
    },
    {
      step: 5,
      title: "Future corpus (not auto-run here)",
      action: "See docs/email-ai-campaign-memory-readiness.md — mission, policy, bio, speeches, fundraising, volunteer, press, issues, opposition rules, compliance.",
      notes: "Each slice should ship as its own ingestion + governance packet; this readiness module never pretends those rows exist.",
    },
  ];
}

export async function getCampaignMemoryReadiness(): Promise<CampaignMemoryReadinessSnapshot> {
  const stats = await loadSearchChunkIndexStats();
  const openAi = isOpenAIConfigured();
  const memoryTier = tierFromStats(stats, openAi);

  const operatorMustPasteManually = [
    ...MISSING_DOC_OPERATOR_GUIDANCE,
    ...SOURCE_MATERIAL_READINESS.filter((s) => s.readiness === "operator_provided_only").map((s) => `${s.title}: ${s.notes}`),
  ];

  const missingKnowledgeItems = await listMissingKnowledgeSources(stats);

  return {
    generatedAt: new Date().toISOString(),
    databaseConfigured: isDatabaseConfigured(),
    openAiConfigured: openAi,
    searchChunk: stats,
    memoryTier,
    messageStudioUsesSearchChunkRag: false,
    messageStudioSourceExplanation: MESSAGE_STUDIO_AI_SOURCE_POSTURE,
    searchChunkConsumers: SEARCH_CHUNK_CONSUMING_SURFACES,
    operatorMustPasteManually,
    missingKnowledgeItems,
  };
}
