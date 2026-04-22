/**
 * Repair planner / optional re-ingest for campaign folder vs DB drift.
 *
 * Default: dry-run — prints recommended commands only.
 *
 * Usage:
 *   npx tsx scripts/repair-campaign-ingestion.ts
 *   npx tsx scripts/repair-campaign-ingestion.ts --apply-ingest-missing
 *   npx tsx scripts/repair-campaign-ingestion.ts --dir "H:\path" --preset briefing
 *
 * --apply-ingest-missing  Re-runs `ingest-campaign-folder` for the same tree. Safe for duplicates (SHA-256 idempotent).
 *                           Does not change existing rows; only creates missing hashes.
 */
import { spawnSync } from "node:child_process";
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
  const apply = process.argv.includes("--apply-ingest-missing");
  const preset = arg("--preset") ?? "briefing";
  const publish = process.argv.includes("--public");
  const includeZips = process.argv.includes("--include-zips");
  const absRoot = path.resolve(dirPath);
  const folderBasename = path.basename(absRoot);

  if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error("DATABASE_URL required for repair planning");
    process.exit(1);
  }

  const inventory = await scanCampaignIngestionFolder(absRoot);
  let dbRows: Awaited<ReturnType<typeof fetchOwnedMediaForFolderAudit>> = [];
  let batches: Awaited<ReturnType<typeof fetchMediaIngestBatchesForFolder>> = [];
  try {
    batches = await fetchMediaIngestBatchesForFolder(absRoot);
    dbRows = await fetchOwnedMediaForFolderAudit({ folderBasename, batchIds: batches.map((b) => b.id) });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  const reconcile = reconcileFolderWithDb(inventory, dbRows);
  const looseMissing = reconcile.onDiskSupportedNotInDb.length;

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        looseFilesMissingFromDb: looseMissing,
        duplicateHashesOnDisk: reconcile.duplicateHashesOnDisk.length,
        dbAssetsForBundle: dbRows.length,
        batches,
        recommendedCommands: [
          looseMissing > 0
            ? `npx tsx scripts/ingest-campaign-folder.ts --dir "${absRoot}" ${publish ? "--public" : ""} ${preset === "comms" ? "--comms" : preset === "community-training" ? "--community-training" : ""} ${includeZips ? "--include-zips" : ""}`.replace(/\s+/g, " ").trim()
            : null,
          `npx tsx scripts/audit-campaign-ingestion.ts --dir "${absRoot}" --verbose`,
        ].filter(Boolean),
      },
      null,
      2,
    ),
  );

  if (!apply) {
    // eslint-disable-next-line no-console
    console.error("\nDry run only. Pass --apply-ingest-missing to run folder ingest (creates missing rows only).");
    return;
  }

  if (looseMissing === 0) {
    // eslint-disable-next-line no-console
    console.error("Nothing missing by hash; skip ingest.");
    return;
  }

  const args = [
    "tsx",
    path.join(root, "scripts/ingest-campaign-folder.ts"),
    "--dir",
    absRoot,
  ];
  if (publish) args.push("--public");
  if (preset === "comms") args.push("--comms");
  if (preset === "community-training") args.push("--community-training");
  if (includeZips) args.push("--include-zips");

  const r = spawnSync("npx", args, { stdio: "inherit", cwd: root, shell: true });
  process.exit(r.status ?? 1);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
