/**
 * Ingest media from a mounted phone/camera/USB folder into campaign-owned storage.
 * Writes a durable mirror under `data/owned-campaign-media/ingest/YYYY/MM/DD/{batchId}/raw/...`
 * and registers each file via the shared ingest core (dedupe by SHA-256).
 *
 * Usage (from RedDirt root):
 *   npx tsx scripts/ingest-campaign-device.ts --from "D:\Phone\DCIM" [--public] [--comms] [--community-training]
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MediaIngestBatchStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { getDataRootDir } from "../src/lib/owned-media/paths";
import {
  ingestCampaignFileBuffer,
  supportedIngestExt,
  type CampaignIngestPreset,
} from "./ingest-campaign-files-core";
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

function resolvePreset(): CampaignIngestPreset {
  if (process.argv.includes("--community-training")) return "community-training";
  if (process.argv.includes("--comms")) return "comms";
  return "briefing";
}

function chicagoYmd(d: Date): { y: string; m: string; day: string } {
  const s = d.toLocaleString("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, day] = s.split("-");
  return { y: y!, m: m!, day: day! };
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
  const from = arg("--from");
  const publish = process.argv.includes("--public");
  const preset = resolvePreset();
  if (!from) {
    // eslint-disable-next-line no-console
    console.error(
      "Usage: npx tsx scripts/ingest-campaign-device.ts --from <device_folder> [--public] [--comms] [--community-training]"
    );
    process.exit(1);
  }
  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const absRoot = path.resolve(from);
  const sourceBundle = path.basename(absRoot) || "device";
  const ymd = chicagoYmd(new Date());
  const dataRoot = getDataRootDir();

  const batch = await prisma.mediaIngestBatch.create({
    data: {
      sourceType: "DEVICE",
      sourceLabel: `device:${sourceBundle}`,
      ingestPath: absRoot,
      status: MediaIngestBatchStatus.STARTED,
    },
  });

  const mirrorRootAbs = path.join(dataRoot, "ingest", ymd.y, ymd.m, ymd.day, batch.id, "raw");
  await mkdir(mirrorRootAbs, { recursive: true });

  const allFiles = await walkFiles(absRoot);
  const out: { file: string; result: Awaited<ReturnType<typeof ingestCampaignFileBuffer>> }[] = [];
  let imported = 0;
  let duplicates = 0;
  let failed = 0;

  const pushResult = (file: string, result: Awaited<ReturnType<typeof ingestCampaignFileBuffer>>) => {
    out.push({ file, result });
    if (String(result.skipped ?? "").includes("duplicate")) duplicates += 1;
    else if (result.id) imported += 1;
    else failed += 1;
  };

  for (const abs of allFiles) {
    const rel = path.relative(absRoot, abs);
    const relPosix = rel.split(path.sep).join("/");
    const ext = path.extname(abs).toLowerCase();
    if (!supportedIngestExt(ext)) continue;

    const buf = await readFile(abs);
    if (buf.length === 0) continue;

    const mirrorFileAbs = path.join(mirrorRootAbs, rel);
    await mkdir(path.dirname(mirrorFileAbs), { recursive: true });
    await writeFile(mirrorFileAbs, buf);

    const mirrorKey = path.posix.join("ingest", ymd.y, ymd.m, ymd.day, batch.id, "raw", relPosix);

    // eslint-disable-next-line no-console
    console.log(`[ingest:device] ${relPosix} (${buf.length} bytes)…`);
    const result = await ingestCampaignFileBuffer(buf, path.basename(abs), {
      publish,
      sourceBundle: `device:${sourceBundle}`,
      relativePath: relPosix,
      preset,
      ingestFrom: "device",
      mediaIngestBatchId: batch.id,
      deviceIngestMirrorRelativePath: mirrorKey,
    });
    pushResult(relPosix, result);
  }

  await prisma.mediaIngestBatch.update({
    where: { id: batch.id },
    data: {
      status: failed > 0 ? MediaIngestBatchStatus.PARTIAL : MediaIngestBatchStatus.COMPLETE,
      finishedAt: new Date(),
      importedCount: imported,
      duplicateCount: duplicates,
      failedCount: failed,
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        mediaIngestBatchId: batch.id,
        mirrorRoot: mirrorRootAbs,
        dataRoot,
        from: absRoot,
        imported,
        duplicates,
        failed,
        fileCount: out.length,
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
