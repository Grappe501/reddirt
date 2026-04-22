/**
 * Thin wrapper: folder inventory + DB rows + reconcile buckets as JSON.
 *
 *   npx tsx scripts/reconcile-campaign-folder-vs-db.ts
 *   npx tsx scripts/reconcile-campaign-folder-vs-db.ts --dir "H:\path"
 */
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
  const absRoot = path.resolve(dirPath);
  const folderBasename = path.basename(absRoot);

  const inventory = await scanCampaignIngestionFolder(absRoot);
  const batches = await fetchMediaIngestBatchesForFolder(absRoot);
  const dbRows = await fetchOwnedMediaForFolderAudit({
    folderBasename,
    batchIds: batches.map((b) => b.id),
  });
  const reconcile = reconcileFolderWithDb(inventory, dbRows);
  await prisma.$disconnect().catch(() => {});

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ batches, dbRowCount: dbRows.length, reconcile }, null, 2));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
