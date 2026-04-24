/**
 * Recursively ingest all supported campaign files from a folder (unzipped dump, network share, etc.).
 * Uses loadRedDirtEnv: put OPENAI_API_KEY in .env.local to override a placeholder in .env.
 *
 * Usage (from RedDirt root):
 *   npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion" [--public] [--comms] [--root-only] [--include-zips] [--include-elearning-bundles]
 *
 * --brain-governed  Skip paths that must not become bulk RAG (election tabulation folder, AR finance filing-detail trees) and skip root/tabular finance filenames (donor/transaction/committee heuristics). Combine with --skip-path-prefix for more.
 * --skip-path-prefix <rel>  Skip any file whose path equals or is under this relative prefix (POSIX segments, repeatable). Example: --skip-path-prefix electionResults
 *
 * --root-only  Only files directly under --dir (no subfolders). Skips .csv/.xlsx/.xls at that level so donor/transaction/volunteer exports are not embedded into search; use a governed packet for tabular finance/field data.
 *
 * --include-zips  Also open each .zip in the tree and ingest entries (same as ingest-briefing-zip per archive).
 * By default, skips e-learning *player* paths (`content/lib/`, `__MACOSX/`) so SCORM/Rise runtimes are not ingested.
 *   --include-elearning-bundles  Disable that skip (not recommended — mostly .js/.woff with no RAG value).
 * Skips: .crdownload, Thumbs.db, .DS_Store, __MACOSX, node_modules, .git
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import { MediaIngestBatchStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";
import {
  ingestCampaignFileBuffer,
  supportedIngestExt,
} from "./ingest-campaign-files-core";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { isBundledElearningPath } from "../src/lib/ingest/campaign-folder-skip";

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
  return "briefing";
}

/** Paths under the ingest root that should not be walked for brain/RAG (repeatable with --skip-path-prefix). */
const BRAIN_GOVERNANCE_PATH_SKIPS = [
  "electionResults",
  "February Filing Details-20260421T211056Z-3-001",
  "March Filing Details-20260421T211053Z-3-001",
];

function normalizeSkipPrefix(p: string): string {
  return p
    .trim()
    .split(path.sep)
    .join("/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function collectSkipPrefixes(): string[] {
  const raw: string[] = [];
  for (let i = 2; i < process.argv.length; i += 1) {
    if (process.argv[i] === "--skip-path-prefix" && process.argv[i + 1]) {
      raw.push(normalizeSkipPrefix(process.argv[i + 1]!));
      i += 1;
    }
  }
  if (process.argv.includes("--brain-governed")) {
    for (const p of BRAIN_GOVERNANCE_PATH_SKIPS) {
      raw.push(normalizeSkipPrefix(p));
    }
  }
  return [...new Set(raw.filter(Boolean))];
}

function dirPruned(relDirPosix: string, skipPrefixes: string[]): boolean {
  if (!relDirPosix || relDirPosix === ".") return false;
  for (const p of skipPrefixes) {
    if (relDirPosix === p || relDirPosix.startsWith(`${p}/`)) return true;
  }
  return false;
}

function filePathSkipped(relPosix: string, skipPrefixes: string[]): boolean {
  for (const p of skipPrefixes) {
    if (relPosix === p || relPosix.startsWith(`${p}/`)) return true;
  }
  return false;
}

/** Avoid embedding obvious finance exports into SearchChunk; use ledger/compliance flows instead. */
function brainGovernanceBasenameSkip(relPosix: string): boolean {
  const base = path.posix.basename(relPosix.split(path.sep).join("/"));
  const lower = base.toLowerCase();
  if (lower.startsWith("_committee")) return true;
  if (lower.includes("donor")) return true;
  if (lower.includes("transaction")) return true;
  return false;
}

async function walkFiles(ingestRoot: string, dir: string, skipPrefixes: string[]): Promise<string[]> {
  const out: string[] = [];
  const relDir = path.relative(ingestRoot, dir).split(path.sep).join("/") || ".";
  if (dirPruned(relDir, skipPrefixes)) {
    return [];
  }
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;
      out.push(...(await walkFiles(ingestRoot, full, skipPrefixes)));
    } else {
      if (skipFileName(e.name)) continue;
      out.push(full);
    }
  }
  return out;
}

/** Top-level files only — no subdirectory traversal. */
async function listRootFilesOnly(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (skipFileName(e.name)) continue;
    out.push(path.join(dir, e.name));
  }
  return out.sort((a, b) => a.localeCompare(b));
}

async function main() {
  const dirPath = arg("--dir");
  const publish = process.argv.includes("--public");
  const includeZips = process.argv.includes("--include-zips");
  const includeElearningBundles = process.argv.includes("--include-elearning-bundles");
  const rootOnly = process.argv.includes("--root-only");
  const brainGoverned = process.argv.includes("--brain-governed");
  const skipPrefixes = collectSkipPrefixes();
  const preset = resolvePreset();
  if (!dirPath) {
    // eslint-disable-next-line no-console
    console.error(
      "Usage: npx tsx scripts/ingest-campaign-folder.ts --dir <path> [--public] [--comms] [--community-training] [--brain-governed] [--skip-path-prefix rel] [--root-only] [--include-zips] [--include-elearning-bundles]"
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
  const allFiles = rootOnly
    ? await listRootFilesOnly(absRoot)
    : await walkFiles(absRoot, absRoot, skipPrefixes);
  const out: { file: string; result: Awaited<ReturnType<typeof ingestCampaignFileBuffer>> }[] = [];
  let imported = 0;
  let duplicates = 0;
  const batch = await prisma.mediaIngestBatch.create({
    data: {
      sourceType: "FOLDER",
      sourceLabel: sourceBundle,
      ingestPath: absRoot,
      status: MediaIngestBatchStatus.STARTED,
    },
  });

  const pushResult = (file: string, result: Awaited<ReturnType<typeof ingestCampaignFileBuffer>>) => {
    out.push({ file, result });
    if (result.skipped?.includes("duplicate")) duplicates += 1;
    else if (result.id) imported += 1;
  };

  try {
  for (const abs of allFiles) {
    const rel = path.relative(absRoot, abs);
    const relPosix = rel.split(path.sep).join("/");
    if (skipPrefixes.length > 0 && filePathSkipped(relPosix, skipPrefixes)) {
      // eslint-disable-next-line no-console
      console.log(`[ingest:${preset}] skip (--skip-path-prefix / --brain-governed): ${relPosix}`);
      continue;
    }
    if (brainGoverned && brainGovernanceBasenameSkip(relPosix)) {
      // eslint-disable-next-line no-console
      console.log(`[ingest:${preset}] skip (brain-governed: finance/tabular filename heuristic): ${relPosix}`);
      continue;
    }
    const ext = path.extname(abs).toLowerCase();
    if (rootOnly && (ext === ".csv" || ext === ".xlsx" || ext === ".xls")) {
      // eslint-disable-next-line no-console
      console.log(`[ingest:${preset}] skip (root-only: tabular/finance — not embedded): ${relPosix}`);
      continue;
    }
    if (ext === ".zip" && includeZips) {
      // eslint-disable-next-line no-console
      console.log(`[ingest:${preset}] (archive) ${relPosix}…`);
      const zbuf = await readFile(abs);
      const zip = await JSZip.loadAsync(zbuf);
      const zipName = path.basename(abs);
      const names = Object.keys(zip.files).filter(
        (n) => !zip.files[n]!.dir && !path.basename(n).startsWith("._")
      );
      for (const name of names) {
        const zext = path.extname(name).toLowerCase();
        if (!supportedIngestExt(zext)) continue;
        const file = zip.files[name];
        if (!file) continue;
        const data = await file.async("nodebuffer");
        if (!(data instanceof Buffer) || data.length === 0) continue;
        const entryPath = `${relPosix}/${name.split(path.sep).join("/")}`;
        if (!includeElearningBundles && isBundledElearningPath(entryPath)) {
          // eslint-disable-next-line no-console
          console.log(`[ingest:${preset}] skip (e-learning bundle): ${entryPath}`);
          continue;
        }
        // eslint-disable-next-line no-console
        console.log(`[ingest:${preset}] ${entryPath} (${data.length} bytes)…`);
        const result = await ingestCampaignFileBuffer(data, name, {
          publish,
          sourceBundle: `${sourceBundle}::${zipName}`,
          relativePath: entryPath,
          preset,
          ingestFrom: "folder",
          mediaIngestBatchId: batch.id,
        });
        pushResult(entryPath, result);
      }
      continue;
    }
    if (ext === ".zip" && !includeZips) {
      // eslint-disable-next-line no-console
      console.log(`[ingest] skip (use --include-zips): ${relPosix}`);
      continue;
    }
    if (!supportedIngestExt(ext)) continue;

    const buf = await readFile(abs);
    if (buf.length === 0) continue;
    if (!includeElearningBundles && isBundledElearningPath(relPosix)) {
      // eslint-disable-next-line no-console
      console.log(`[ingest:${preset}] skip (e-learning bundle): ${relPosix}`);
      continue;
    }
    // eslint-disable-next-line no-console
    console.log(`[ingest:${preset}] ${relPosix} (${buf.length} bytes)…`);
    const result = await ingestCampaignFileBuffer(buf, path.basename(abs), {
      publish,
      sourceBundle,
      relativePath: relPosix,
      preset,
      ingestFrom: "folder",
      mediaIngestBatchId: batch.id,
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
  } catch (err) {
    await prisma.mediaIngestBatch.update({
      where: { id: batch.id },
      data: {
        status: MediaIngestBatchStatus.FAILED,
        finishedAt: new Date(),
        importedCount: imported,
        duplicateCount: duplicates,
        notes: err instanceof Error ? err.message.slice(0, 2000) : String(err).slice(0, 2000),
      },
    });
    throw err;
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        count: out.length,
        mediaIngestBatchId: batch.id,
        publish,
        preset,
        includeZips,
        includeElearningBundles,
        rootOnly,
        brainGoverned,
        skipPathPrefixes: skipPrefixes,
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
