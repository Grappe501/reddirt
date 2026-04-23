/**
 * Review publicly visible imported owned media for financial / donor / PII content and mark
 * those rows private (isPublic=false, PENDING_REVIEW).
 *
 * 1) Fast path: path/filename heuristics (same patterns as ingest sensitive-classification).
 * 2) AI path: batched OpenAI review of filename + ingest path + transcript excerpt.
 *
 * Usage (from RedDirt/):
 *   npx tsx scripts/ai-privatize-sensitive-owned-media.ts           # dry-run
 *   npx tsx scripts/ai-privatize-sensitive-owned-media.ts --apply   # write DB updates
 *   npx tsx scripts/ai-privatize-sensitive-owned-media.ts --apply --limit 20
 *   npx tsx scripts/ai-privatize-sensitive-owned-media.ts --apply --skip-heuristic  # AI only
 *
 * Requires DATABASE_URL + OPENAI_API_KEY (via .env / .env.local).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Prisma } from "@prisma/client";
import { OwnedMediaReviewStatus, OwnedMediaSourceType } from "@prisma/client";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { prisma } from "../src/lib/db";
import { classifyIngestPath } from "../src/lib/ingest/sensitive-classification";
import { getOpenAIClient, getOpenAIConfigFromEnv } from "../src/lib/openai/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadRedDirtEnv(root);

const TAG = "ai-financial-privacy-review";
const BATCH = 6;
const TEXT_PREVIEW_MAX = 6000;

type Dossier = {
  id: string;
  fileName: string;
  title: string;
  localPath: string | null;
  description: string | null;
  textPreview: string;
};

function parseArgs() {
  const argv = process.argv.slice(2);
  return {
    apply: argv.includes("--apply"),
    skipHeuristic: argv.includes("--skip-heuristic"),
    includeAllPublic: argv.includes("--include-all-public"),
    limit: (() => {
      const i = argv.indexOf("--limit");
      if (i === -1 || !argv[i + 1]) return undefined;
      const n = parseInt(argv[i + 1]!, 10);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    })(),
  };
}

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function mergeEnrichment(existing: unknown, patch: Record<string, unknown>): Record<string, unknown> {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing) ? { ...(existing as object) } : {};
  return { ...base, ...patch };
}

async function privatizeRow(
  id: string,
  reasons: string[],
  source: "heuristic" | "ai",
  extra?: { confidence?: string; rationale?: string },
) {
  const row = await prisma.ownedMediaAsset.findUnique({
    where: { id },
    select: { issueTags: true, enrichmentMetadata: true },
  });
  if (!row) return;
  const tags = [...new Set([...row.issueTags, TAG])];
  const scanEntry = {
    at: new Date().toISOString(),
    source,
    reasons,
    ...extra,
  };
  const prevScans =
    (row.enrichmentMetadata as Record<string, unknown> | null)?.privacyScans;
  const scans = Array.isArray(prevScans) ? [...prevScans, scanEntry] : [scanEntry];
  await prisma.ownedMediaAsset.update({
    where: { id },
    data: {
      isPublic: false,
      reviewStatus: OwnedMediaReviewStatus.PENDING_REVIEW,
      issueTags: tags,
      enrichmentMetadata: mergeEnrichment(row.enrichmentMetadata, {
        privacyScans: scans,
      }) as Prisma.InputJsonValue,
    },
  });
}

type AiResult = { id: string; mark_private: boolean; confidence: string; rationale: string };

async function runAiBatch(items: Dossier[]): Promise<AiResult[]> {
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const payload = items.map((i) => ({
    id: i.id,
    fileName: i.fileName,
    title: i.title,
    ingestPath: i.localPath,
    description: i.description,
    textPreview: i.textPreview || null,
  }));

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a compliance reviewer for a U.S. political campaign's digital asset library.
For each item, set mark_private true only when the filename, ingest path, description, or text preview suggests the file actually contains or is clearly for:
- Donor or contribution data (names with amounts, donor lists, FEC/finance filings, transaction/expenditure logs, committee treasurer reports)
- Banking or payment instructions (account/routing numbers, wire details, check images with account info)
- Tax/payroll identifiers in a finance context (SSN, EIN on filings or payroll spreadsheets)

Do NOT mark private for: generic work emails in comms drafts, editorial/op-ed drafts, field organizing notes, training decks, event photos, or policy explainers unless the preview explicitly shows donor/financial tables or payment data.

Return STRICT JSON:
{"results":[{"id":"string","mark_private":boolean,"confidence":"high"|"medium"|"low","rationale":"short string"}]}
Use mark_private true with confidence high or medium only for realistic finance/donor/PII exposure — not for mere presence of email addresses in internal writing.`,
      },
      {
        role: "user",
        content: JSON.stringify({ items: payload }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty OpenAI response");
  const parsed = JSON.parse(raw) as { results?: AiResult[] };
  if (!Array.isArray(parsed.results)) {
    throw new Error("Invalid JSON: missing results array");
  }
  return parsed.results;
}

async function main() {
  const { apply, skipHeuristic, includeAllPublic, limit } = parseArgs();

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("OPENAI_API_KEY required");
    process.exit(1);
  }

  const whereBase = {
    isPublic: true,
    ...(includeAllPublic
      ? {}
      : { sourceType: OwnedMediaSourceType.IMPORT }),
  };

  const candidates = await prisma.ownedMediaAsset.findMany({
    where: whereBase,
    select: {
      id: true,
      fileName: true,
      title: true,
      description: true,
      localIngestRelativePath: true,
      transcripts: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { transcriptText: true },
      },
    },
    orderBy: { createdAt: "asc" },
    ...(limit ? { take: limit } : {}),
  });

  console.log(
    `[privacy-scan] ${apply ? "APPLY" : "DRY-RUN"} — ${candidates.length} public asset(s) ` +
      `${includeAllPublic ? "(all source types)" : "(IMPORT only)"}\n`,
  );

  let heuristicCount = 0;
  let aiFlagged = 0;
  let aiOk = 0;
  const forAi: typeof candidates = [];

  for (const row of candidates) {
    const rel = row.localIngestRelativePath ?? "";
    if (!skipHeuristic && classifyIngestPath(row.fileName, rel).level === "SENSITIVE_ADMIN") {
      const { reasons } = classifyIngestPath(row.fileName, rel);
      heuristicCount += 1;
      console.log(`[heuristic] ${row.id} ${row.fileName} → private (${reasons.slice(0, 3).join("; ")})`);
      if (apply) {
        await privatizeRow(row.id, reasons, "heuristic");
      }
      continue;
    }
    forAi.push(row);
  }

  for (let i = 0; i < forAi.length; i += BATCH) {
    const slice = forAi.slice(i, i + BATCH);
    const dossiers: Dossier[] = slice.map((row) => ({
      id: row.id,
      fileName: row.fileName,
      title: row.title,
      localPath: row.localIngestRelativePath,
      description: row.description,
      textPreview: clip(row.transcripts[0]?.transcriptText ?? "", TEXT_PREVIEW_MAX),
    }));

    let results: AiResult[];
    try {
      results = await runAiBatch(dossiers);
    } catch (e) {
      console.error(`[privacy-scan] AI batch failed at offset ${i}:`, e instanceof Error ? e.message : e);
      process.exit(1);
    }

    const byId = new Map(results.map((r) => [r.id, r]));
    for (const d of dossiers) {
      const r = byId.get(d.id);
      if (!r) {
        console.warn(`[privacy-scan] missing AI result for ${d.id}`);
        continue;
      }
      const risky = r.mark_private && (r.confidence === "high" || r.confidence === "medium");
      if (risky) {
        aiFlagged += 1;
        console.log(
          `[ai] ${d.id} ${d.fileName} → private [${r.confidence}] ${r.rationale}`,
        );
        if (apply) {
          await privatizeRow(d.id, [r.rationale], "ai", {
            confidence: r.confidence,
            rationale: r.rationale,
          });
        }
      } else {
        aiOk += 1;
      }
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(
    `\n[privacy-scan] done. heuristic→private: ${heuristicCount}, ai→private: ${aiFlagged}, ai cleared: ${aiOk}` +
      (apply ? "" : " (no DB writes — pass --apply)"),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });
