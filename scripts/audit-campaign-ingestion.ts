/**
 * Forensic audit: campaign information folder vs OwnedMedia / SearchChunk / batches.
 *
 * Usage (from RedDirt root, DATABASE_URL set):
 *   npx tsx scripts/audit-campaign-ingestion.ts
 *   npx tsx scripts/audit-campaign-ingestion.ts --dir "H:\path\to\folder"
 *   npx tsx scripts/audit-campaign-ingestion.ts --json > audit.json
 *
 * Folder-only (no DB):
 *   npx tsx scripts/audit-campaign-ingestion.ts --disk-only
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { scanCampaignIngestionFolder } from "../src/lib/audit/campaign-ingestion-inventory";
import {
  DEFAULT_CAMPAIGN_INGEST_FOLDER,
  fetchMediaIngestBatchesForFolder,
  fetchOwnedMediaForFolderAudit,
  reconcileFolderWithDb,
} from "../src/lib/audit/campaign-ingestion-audit";
import { prisma } from "../src/lib/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadRedDirtEnv(root);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

async function main() {
  const dirPath = arg("--dir") ?? DEFAULT_CAMPAIGN_INGEST_FOLDER;
  const diskOnly = process.argv.includes("--disk-only");
  const writeMd = process.argv.includes("--write-md");
  const absRoot = path.resolve(dirPath);
  const folderBasename = path.basename(absRoot);

  const inventory = await scanCampaignIngestionFolder(absRoot);
  const supported = inventory.filter((e) => e.supportedExtension);
  const wouldLoose = inventory.filter((e) => e.wouldProcessAsLooseFile);
  const elearningSkipped = inventory.filter((e) => e.skippedElearningBundlePath && e.supportedExtension);
  const unsupported = inventory.filter((e) => !e.supportedExtension);
  const zips = inventory.filter((e) => e.extension === ".zip");

  let dbError: string | null = null;
  let batches: Awaited<ReturnType<typeof fetchMediaIngestBatchesForFolder>> = [];
  let dbRows: Awaited<ReturnType<typeof fetchOwnedMediaForFolderAudit>> = [];
  let reconcile: ReturnType<typeof reconcileFolderWithDb> | null = null;

  if (diskOnly) {
    dbError = "disk-only mode (skipped DB)";
  } else if (!process.env.DATABASE_URL?.trim()) {
    dbError = "DATABASE_URL not set";
  } else {
    try {
      batches = await fetchMediaIngestBatchesForFolder(absRoot);
      dbRows = await fetchOwnedMediaForFolderAudit({
        folderBasename,
        batchIds: batches.map((b) => b.id),
      });
      reconcile = reconcileFolderWithDb(inventory, dbRows);
    } catch (e) {
      dbError = e instanceof Error ? e.message : String(e);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    folder: { absRoot, folderBasename },
    disk: {
      totalFiles: inventory.length,
      supportedExtensionCount: supported.length,
      wouldProcessLooseFileCount: wouldLoose.length,
      elearningPathSkippedSupported: elearningSkipped.length,
      unsupportedExtensionCount: unsupported.length,
      zipLooseFiles: zips.length,
      unsupportedExtensions: [...new Map(unsupported.map((u) => [u.extension || "(none)", 0])).keys()].slice(0, 40),
    },
    database:
      dbError && diskOnly
        ? { ok: false, skipped: true, note: dbError }
        : dbError
          ? { ok: false, error: dbError }
          : {
              ok: true,
              batches,
              assetRowCount: dbRows.length,
              reconcile: reconcile
                ? {
                    onDiskAndInDbByHash: reconcile.onDiskAndInDbByHash.length,
                    onDiskSupportedMissingFromDb: reconcile.onDiskSupportedNotInDb.length,
                    inDbNotPublicEligible: reconcile.inDbButNotPublicEligible.length,
                    inDbDocumentZeroSearchChunks: reconcile.inDbZeroSearchChunks.length,
                    inDbDocumentNoImportTranscript: reconcile.inDbNoImportTranscript.length,
                    duplicateContentHashesOnDisk: reconcile.duplicateHashesOnDisk.length,
                  }
                : null,
            },
  };

  if (process.argv.includes("--json")) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ...report, inventory, dbRows, reconcile }, null, 2));
    return;
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(report, null, 2));
  if (reconcile && process.argv.includes("--verbose")) {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          missingFromDbSample: reconcile.onDiskSupportedNotInDb.slice(0, 30).map((e) => e.relativePath),
          duplicateHashesOnDisk: reconcile.duplicateHashesOnDisk.slice(0, 20),
        },
        null,
        2,
      ),
    );
  }

  if (writeMd) {
    const mdPath = path.join(root, "docs", "campaign-ingestion-forensic-audit.md");
    const lines: string[] = [
      "# Campaign ingestion forensic audit (generated)",
      "",
      `Generated: ${report.generatedAt}`,
      "",
      "## Folder",
      "",
      `- Path: \`${absRoot}\``,
      `- Basename (ingest \`sourceBundle\`): \`${folderBasename}\``,
      "",
      "## Disk summary",
      "",
      `| Metric | Count |`,
      `|--------|-------|`,
      `| Files scanned | ${report.disk.totalFiles} |`,
      `| Supported extensions | ${report.disk.supportedExtensionCount} |`,
      `| Would ingest as loose file (no --include-zips) | ${report.disk.wouldProcessLooseFileCount} |`,
      `| Supported but e-learning path skip | ${report.disk.elearningPathSkippedSupported} |`,
      `| Unsupported extension | ${report.disk.unsupportedExtensionCount} |`,
      `| .zip at tree (skipped unless --include-zips) | ${report.disk.zipLooseFiles} |`,
      "",
      "## Database",
      "",
      dbError ? `**Error:** ${dbError}` : `**Batches found:** ${batches.length} · **Asset rows:** ${dbRows.length}`,
      "",
    ];
    if (reconcile) {
      lines.push("## Reconciliation", "", "```json", JSON.stringify(report.database, null, 2), "```", "");
    }
    await writeFile(mdPath, lines.join("\n"), "utf8");
    // eslint-disable-next-line no-console
    console.error(`Wrote ${mdPath}`);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
