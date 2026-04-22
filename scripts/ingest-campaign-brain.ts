/**
 * Ingest a folder of campaign source files into the DB with path-derived "brain" tags
 * and aggressive skipping of e-learning / SCORM minified assets (e.g. content/lib/**).
 *
 * From RedDirt root:
 *   npx tsx scripts/ingest-campaign-brain.ts --dir "H:\SOSWebsite\campaign information for ingestion" [--public] [--comms] [--include-zips]
 *
 * Default preset is --community-training (voter/field materials). Use --comms or omit flags as needed.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { MediaIngestBatchStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { inferBrainIssueTags, shouldSkipBrainPath } from "../src/lib/ingest/brain-path-tags";
import { ingestCampaignFileBuffer, supportedIngestExt } from "./ingest-campaign-files-core";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadRedDirtEnv(root);

const SKIP_DIR = new Set(["node_modules", ".git", "__MACOSX", ".next"]);
function skipFileName(name: string): boolean {
  if (name === "Thumbs.db" || name === ".DS_Store") return true;
  if (name.toLowerCase().endsWith(".crdownload")) return true;
  return false;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

type Preset = "briefing" | "comms" | "community-training";

function resolvePreset(): Preset {
  if (process.argv.includes("--community-training")) return "community-training";
  if (process.argv.includes("--comms")) return "comms";
  if (process.argv.includes("--briefing")) return "briefing";
  return "community-training";
}

async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;
      out.push(...(await walkFiles(full)));
    } else {
      if (skipFileName(e.name)) continue;
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const dirPath = arg("--dir");
  const publish = process.argv.includes("--public");
  const includeZips = process.argv.includes("--include-zips");
  const preset = resolvePreset();
  if (!dirPath) {
    // eslint-disable-next-line no-console
    console.error(
      "Usage: npx tsx scripts/ingest-campaign-brain.ts --dir <path> [--public] [--briefing] [--comms] [--community-training] [--include-zips]"
    );
    process.exit(1);
  }
  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const absRoot = path.resolve(dirPath);
  const sourceBundle = path.basename(absRoot);
  const allFiles = await walkFiles(absRoot);
  const out: { file: string; result: Awaited<ReturnType<typeof ingestCampaignFileBuffer>>; skippedPath?: string }[] =
    [];
  let imported = 0;
  let duplicates = 0;
  let pathSkipped = 0;

  const batch = await prisma.mediaIngestBatch.create({
    data: {
      sourceType: "FOLDER",
      sourceLabel: `brain:${sourceBundle}`,
      ingestPath: absRoot,
      status: MediaIngestBatchStatus.STARTED,
    },
  });

  const pushResult = (
    file: string,
    result: Awaited<ReturnType<typeof ingestCampaignFileBuffer>>,
    skippedPath?: string
  ) => {
    out.push({ file, result, skippedPath });
    if (result.skipped?.includes("duplicate")) duplicates += 1;
    else if (result.id) imported += 1;
    if (skippedPath) pathSkipped += 1;
  };

  for (const abs of allFiles) {
    const rel = path.relative(absRoot, abs);
    const relPosix = rel.split(path.sep).join("/");
    if (shouldSkipBrainPath(relPosix)) {
      // eslint-disable-next-line no-console
      console.log(`[ingest:brain] skip (path): ${relPosix}`);
      pushResult(abs, { id: "", title: path.basename(abs), skipped: "brain path filter" }, relPosix);
      continue;
    }
    const ext = path.extname(abs).toLowerCase();
    const extraTags = inferBrainIssueTags(relPosix, sourceBundle);

    if (ext === ".zip" && includeZips) {
      // eslint-disable-next-line no-console
      console.log(`[ingest:brain] (archive) ${relPosix}…`);
      const zbuf = await readFile(abs);
      const zip = await JSZip.loadAsync(zbuf);
      const zipName = path.basename(abs);
      const names = Object.keys(zip.files).filter(
        (n) => !zip.files[n]!.dir && !path.basename(n).startsWith("._")
      );
      for (const name of names) {
        const zext = path.extname(name).toLowerCase();
        if (!supportedIngestExt(zext)) continue;
        const entryPath = `${relPosix}/${name.split(path.sep).join("/")}`;
        if (shouldSkipBrainPath(entryPath)) continue;
        const file = zip.files[name];
        if (!file) continue;
        const data = await file.async("nodebuffer");
        if (!(data instanceof Buffer) || data.length === 0) continue;
        const entryExtra = inferBrainIssueTags(entryPath, `${sourceBundle}::${zipName}`);
        // eslint-disable-next-line no-console
        console.log(`[ingest:brain] ${entryPath} (${data.length} bytes)…`);
        const result = await ingestCampaignFileBuffer(data, name, {
          publish,
          sourceBundle: `${sourceBundle}::${zipName}`,
          relativePath: entryPath,
          preset,
          ingestFrom: "folder",
          mediaIngestBatchId: batch.id,
          extraIssueTags: entryExtra,
        });
        pushResult(entryPath, result);
      }
      continue;
    }
    if (ext === ".zip" && !includeZips) {
      // eslint-disable-next-line no-console
      console.log(`[ingest:brain] skip (use --include-zips): ${relPosix}`);
      continue;
    }
    if (!supportedIngestExt(ext)) continue;

    const buf = await readFile(abs);
    if (buf.length === 0) continue;
    // eslint-disable-next-line no-console
    console.log(`[ingest:brain] ${relPosix} (${buf.length} bytes)…`);
    const result = await ingestCampaignFileBuffer(buf, path.basename(abs), {
      publish,
      sourceBundle,
      relativePath: relPosix,
      preset,
      ingestFrom: "folder",
      mediaIngestBatchId: batch.id,
      extraIssueTags: extraTags,
    });
    pushResult(relPosix, result);
  }

  await prisma.mediaIngestBatch.update({
    where: { id: batch.id },
    data: {
      status: MediaIngestBatchStatus.COMPLETE,
      finishedAt: new Date(),
      importedCount: imported,
      duplicateCount: duplicates,
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        count: out.length,
        mediaIngestBatchId: batch.id,
        publish,
        preset,
        pathSkipped,
        includeZips,
        root: absRoot,
        imported,
        duplicates,
        results: out,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
