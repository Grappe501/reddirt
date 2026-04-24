/**
 * Repair SearchChunk rows + OpenAI embeddings for OwnedMedia tied to a MediaIngestBatch.
 *
 * Usage (from RedDirt/):
 *   npm run repair:owned-media-embeddings -- --batch-id <id> [--dry-run]
 *
 * - Does not delete OwnedMedia, does not ingest new files, does not run migrations.
 * - Skips spreadsheet extensions (.xlsx / .xls) per root-loose policy alignment.
 * - Idempotent: upserts by (path, chunkIndex); removes orphan chunk indices after re-chunking.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OwnedMediaKind } from "@prisma/client";
import { chunkTextForSearch } from "../src/lib/campaign-briefings/chunk-for-search";
import { extractTextFromDocxBuffer } from "../src/lib/campaign-briefings/extract-docx";
import {
  BRIEFING_TAG,
  COMMS_TAG,
  COMMUNITY_TRAINING_TAG,
} from "../src/lib/campaign-briefings/briefing-queries";
import { prisma } from "../src/lib/db";
import { extractPdfText, htmlToPlainText } from "../src/lib/ingest/extract-document-text";
import { formatOpenAIErrorForClient, isOpenAIConfigured } from "../src/lib/openai/client";
import { embedTexts, parseStoredEmbedding } from "../src/lib/openai/embeddings";
import { storageKeyToAbsoluteFilePath } from "../src/lib/owned-media/paths";
import type { CampaignIngestPreset } from "./ingest-campaign-files-core";
import { mimeForCampaignFileName } from "./ingest-campaign-files-core";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadRedDirtEnv(repoRoot);

const BASE_ISSUE_TAGS = new Set([
  "secretary-of-state",
  "arkansas-campaign-2026",
  COMMS_TAG,
  BRIEFING_TAG,
  COMMUNITY_TRAINING_TAG,
  "ingest-sensitive-review",
]);

function parseArgs(argv: string[]): { batchId: string | null; dryRun: boolean } {
  let batchId: string | null = null;
  let dryRun = false;
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]!;
    if (a === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (a === "--batch-id" && argv[i + 1]) {
      batchId = argv[i + 1]!.trim();
      i += 1;
      continue;
    }
  }
  return { batchId, dryRun };
}

function metaRecord(asset: { metadataJson: unknown }): Record<string, unknown> {
  const j = asset.metadataJson;
  return j && typeof j === "object" && !Array.isArray(j) ? (j as Record<string, unknown>) : {};
}

function getPreset(asset: {
  metadataJson: unknown;
  issueTags: string[];
}): CampaignIngestPreset | null {
  const m = metaRecord(asset);
  if (m.commsIngest === true) return "comms";
  if (m.communitySupportTrainingIngest === true) return "community-training";
  if (m.briefingIngest === true) return "briefing";
  if (asset.issueTags.includes(COMMUNITY_TRAINING_TAG)) return "community-training";
  if (asset.issueTags.includes(COMMS_TAG)) return "comms";
  if (asset.issueTags.includes(BRIEFING_TAG)) return "briefing";
  return null;
}

function extraIssueTags(asset: { issueTags: string[] }): string[] {
  return asset.issueTags.filter((t) => !BASE_ISSUE_TAGS.has(t));
}

function searchPathForAsset(
  asset: { id: string; issueTags: string[] },
  preset: CampaignIngestPreset,
  extra: string[],
): string {
  if (extra.includes("campaign-brain")) return `brain-doc:${asset.id}`;
  if (preset === "comms") return `comms-doc:${asset.id}`;
  if (preset === "community-training") return `community-training-doc:${asset.id}`;
  return `briefing-doc:${asset.id}`;
}

function embedLabel(preset: CampaignIngestPreset): string {
  if (preset === "comms") return "Campaign communications";
  if (preset === "community-training") return "Community support training";
  return "Campaign briefing";
}

async function searchPathCoverageOk(
  searchPath: string,
  expectedCount: number,
): Promise<{ ok: boolean; reason: string }> {
  const rows = await prisma.searchChunk.findMany({
    where: { path: searchPath },
    orderBy: { chunkIndex: "asc" },
  });
  if (expectedCount === 0) {
    if (rows.length === 0) return { ok: true, reason: "no chunks expected or present" };
    return { ok: false, reason: `expected 0 chunks but found ${rows.length} (orphans)` };
  }
  if (rows.length !== expectedCount) {
    return { ok: false, reason: `chunk count ${rows.length} !== expected ${expectedCount}` };
  }
  for (const r of rows) {
    if (parseStoredEmbedding(r.embedding).length === 0) {
      return { ok: false, reason: `empty embedding at chunkIndex ${r.chunkIndex}` };
    }
  }
  return { ok: true, reason: "valid" };
}

function binaryKindFromAsset(kind: OwnedMediaKind): "image" | "video" | "audio" | null {
  if (kind === OwnedMediaKind.IMAGE) return "image";
  if (kind === OwnedMediaKind.VIDEO) return "video";
  if (kind === OwnedMediaKind.AUDIO) return "audio";
  return null;
}

function buildBinaryChunk(input: {
  assetId: string;
  preset: CampaignIngestPreset;
  sourceBundle: string;
  relativePath: string;
  title: string;
  description: string;
  kind: "image" | "video" | "audio";
}): { path: string; title: string; chunkContent: string; embedInput: string } {
  const presetLabel =
    input.preset === "comms"
      ? "Campaign communications media"
      : input.preset === "community-training"
        ? "Community support training media"
        : "Campaign briefing media";
  const kindLabel = input.kind === "image" ? "Image" : input.kind === "video" ? "Video" : "Audio";
  const content = [
    `${presetLabel} (${kindLabel}): ${input.title}`,
    input.description,
    `Source bundle: ${input.sourceBundle}`,
    `Path: ${input.relativePath}`,
    "Library asset — retrieve via owned campaign media API; embedding uses metadata only.",
  ].join("\n\n");
  const searchPath = `campaign-media:${input.assetId}`;
  const chunkContent = `${input.title}\n\n${content}`;
  const embedInput = `${input.title}\n\n${content}`;
  const title = `${kindLabel}: ${input.title}`;
  return { path: searchPath, title, chunkContent, embedInput };
}

async function extractDocumentTextFromFile(
  absPath: string,
  fileName: string,
): Promise<{ text: string; skipReason?: string }> {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".xlsx" || ext === ".xls") {
    return { text: "", skipReason: "spreadsheet (excluded from repair policy)" };
  }
  const buf = readFileSync(absPath);
  const mime = mimeForCampaignFileName(fileName);
  if (mime === "application/octet-stream") {
    return { text: "", skipReason: "unknown mime / unsupported" };
  }
  if (ext === ".docx") {
    try {
      return { text: await extractTextFromDocxBuffer(buf) };
    } catch {
      return { text: "", skipReason: "docx extract failed" };
    }
  }
  if (ext === ".txt" || ext === ".md") {
    return { text: buf.toString("utf8") };
  }
  if (ext === ".csv") {
    try {
      return { text: buf.toString("utf8") };
    } catch {
      return { text: "", skipReason: "csv read failed" };
    }
  }
  if (ext === ".html" || ext === ".htm") {
    try {
      return { text: htmlToPlainText(buf.toString("utf8")) };
    } catch {
      return { text: "", skipReason: "html extract failed" };
    }
  }
  if (ext === ".pdf") {
    const text = await extractPdfText(buf);
    if (!text.length) {
      return {
        text: "[PDF: no extractable text (scanned or failed extraction). File is still stored.]",
      };
    }
    return { text };
  }
  if (ext === ".pptx") {
    return {
      text: `[PowerPoint: ${fileName} — file stored. Export to PDF for full text extraction in a follow-up.]`,
    };
  }
  return { text: "", skipReason: `unsupported document extension ${ext}` };
}

async function main() {
  const { batchId, dryRun } = parseArgs(process.argv);
  if (!batchId) {
    console.error("Usage: repair-owned-media-embeddings --batch-id <id> [--dry-run]");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  if (!isOpenAIConfigured()) {
    console.error(
      "OPENAI_API_KEY is missing or empty after loading .env / .env.local. Embeddings cannot be repaired.",
    );
    process.exit(1);
  }

  if (!dryRun) {
    try {
      await embedTexts(["embedding probe"]);
    } catch (e) {
      console.error("OpenAI embedding probe failed:", formatOpenAIErrorForClient(e));
      process.exit(1);
    }
  }

  const assets = await prisma.ownedMediaAsset.findMany({
    where: { mediaIngestBatchId: batchId },
    orderBy: { createdAt: "asc" },
    include: {
      transcripts: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });

  if (assets.length === 0) {
    console.log(`No OwnedMediaAsset rows for mediaIngestBatchId=${batchId}`);
    process.exit(0);
  }

  // eslint-disable-next-line no-console
  console.log(`Batch ${batchId}: ${assets.length} OwnedMedia row(s). dryRun=${dryRun}`);

  let wouldRepair = 0;
  let repaired = 0;
  let skipped = 0;
  let alreadyOk = 0;

  for (const asset of assets) {
    const preset = getPreset(asset);
    if (!preset) {
      // eslint-disable-next-line no-console
      console.warn(`[skip] ${asset.id} ${asset.fileName}: cannot infer ingest preset from metadata/tags`);
      skipped += 1;
      continue;
    }

    const m = metaRecord(asset);
    const sourceBundle = typeof m.ingestSourceBundle === "string" ? m.ingestSourceBundle : "unknown-bundle";
    const relativePath =
      typeof m.originalEntry === "string"
        ? m.originalEntry
        : asset.localIngestRelativePath || asset.fileName;

    const extra = extraIssueTags(asset);
    const binKind = binaryKindFromAsset(asset.kind);

    if (binKind) {
      const chunk = buildBinaryChunk({
        assetId: asset.id,
        preset,
        sourceBundle,
        relativePath,
        title: asset.title,
        description: asset.description ?? "",
        kind: binKind,
      });
      const cov = await searchPathCoverageOk(chunk.path, 1);
      if (cov.ok) {
        alreadyOk += 1;
        continue;
      }
      wouldRepair += 1;
      // eslint-disable-next-line no-console
      console.log(
        `[${dryRun ? "dry-run" : "repair"}] binary ${chunk.path} (${asset.fileName}): ${cov.reason}`,
      );
      if (dryRun) continue;
      const [embedding] = await embedTexts([chunk.embedInput]);
      await prisma.searchChunk.upsert({
        where: { path_chunkIndex: { path: chunk.path, chunkIndex: 0 } },
        create: {
          path: chunk.path,
          title: chunk.title,
          chunkIndex: 0,
          content: chunk.chunkContent,
          embedding: JSON.stringify(embedding),
        },
        update: {
          title: chunk.title,
          content: chunk.chunkContent,
          embedding: JSON.stringify(embedding),
        },
      });
      await prisma.searchChunk.deleteMany({
        where: { path: chunk.path, chunkIndex: { gte: 1 } },
      });
      repaired += 1;
      continue;
    }

    const ext = path.extname(asset.fileName).toLowerCase();
    if (ext === ".xlsx" || ext === ".xls") {
      // eslint-disable-next-line no-console
      console.warn(`[skip] ${asset.id} ${asset.fileName}: spreadsheet — excluded from repair`);
      skipped += 1;
      continue;
    }

    const abs = storageKeyToAbsoluteFilePath(asset.storageKey);
    let text = asset.transcripts[0]?.transcriptText?.trim() ?? "";

    if (!text.length) {
      if (!existsSync(abs)) {
        // eslint-disable-next-line no-console
        console.warn(`[skip] ${asset.id} ${asset.fileName}: no transcript and file missing on disk`);
        skipped += 1;
        continue;
      }
      const extracted = await extractDocumentTextFromFile(abs, asset.fileName);
      if (extracted.skipReason) {
        // eslint-disable-next-line no-console
        console.warn(`[skip] ${asset.id} ${asset.fileName}: ${extracted.skipReason}`);
        skipped += 1;
        continue;
      }
      text = extracted.text.trim();
    }

    const docPath = searchPathForAsset(asset, preset, extra);
    const titleForChunk = asset.title;

    if (text.length <= 80) {
      const cov = await searchPathCoverageOk(docPath, 0);
      if (cov.ok) {
        alreadyOk += 1;
        continue;
      }
      wouldRepair += 1;
      // eslint-disable-next-line no-console
      console.log(
        `[${dryRun ? "dry-run" : "repair"}] doc ${docPath} (${asset.fileName}): short text — remove ${cov.reason}`,
      );
      if (!dryRun) {
        await prisma.searchChunk.deleteMany({ where: { path: docPath } });
        repaired += 1;
      }
      continue;
    }

    const tagLine = extra.length ? `Tags: ${extra.join(", ")}\n` : "";
    const chunkSource = `${tagLine}Source: ${sourceBundle} / ${relativePath}\n\n${text}`;
    const chunks = chunkTextForSearch(chunkSource, 1800);
    const expectedCount = chunks.length;
    const cov = await searchPathCoverageOk(docPath, expectedCount);
    if (cov.ok) {
      alreadyOk += 1;
      continue;
    }

    wouldRepair += 1;
    // eslint-disable-next-line no-console
    console.log(
      `[${dryRun ? "dry-run" : "repair"}] doc ${docPath} (${asset.fileName}): ${chunks.length} chunk(s) — ${cov.reason}`,
    );
    if (dryRun) continue;

    const label = embedLabel(preset);
    const tagHint = extra.length ? `${extra.slice(0, 10).join(", ")}. ` : "";
    const batchSize = 12;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const slice = chunks.slice(i, i + batchSize);
      const embed = await embedTexts(
        slice.map((c) => `${label} [${sourceBundle}]: ${titleForChunk}\n${tagHint}\n\n${c}`),
      );
      for (let j = 0; j < slice.length; j += 1) {
        const chunkIndex = i + j;
        const content = slice[j]!;
        await prisma.searchChunk.upsert({
          where: { path_chunkIndex: { path: docPath, chunkIndex } },
          create: {
            path: docPath,
            title: titleForChunk,
            chunkIndex,
            content: `${titleForChunk}\n\n${content}`,
            embedding: JSON.stringify(embed[j]!),
          },
          update: {
            title: titleForChunk,
            content: `${titleForChunk}\n\n${content}`,
            embedding: JSON.stringify(embed[j]!),
          },
        });
      }
    }
    await prisma.searchChunk.deleteMany({
      where: { path: docPath, chunkIndex: { gte: expectedCount } },
    });
    repaired += 1;
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        batchId,
        dryRun,
        assets: assets.length,
        alreadyOk,
        wouldRepairOrRepaired: dryRun ? wouldRepair : repaired,
        skipped,
        summary: dryRun
          ? `Dry-run: ${wouldRepair} asset(s) need embedding repair; ${alreadyOk} already OK; ${skipped} skipped.`
          : `Live: ${repaired} asset(s) repaired; ${alreadyOk} already OK; ${skipped} skipped.`,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
