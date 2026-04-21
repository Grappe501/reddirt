/**
 * Local folder → Supabase Storage + `OwnedMediaAsset` (Postgres) watcher.
 *
 * Requires: DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, optional SUPABASE_CAMPAIGN_MEDIA_BUCKET.
 * Drop files in CAMPAIGN_MEDIA_ROOT/uploads (default: ./campaign-media/uploads).
 */
import path from "node:path";
import chokidar from "chokidar";
import { ingestFileFromPath } from "../src/lib/owned-media/ingest/ingest-one-file";
import { createIngestLogger } from "../src/lib/owned-media/ingest/logger";

const projectRoot = process.cwd();
const campaignMediaRoot = process.env.CAMPAIGN_MEDIA_ROOT
  ? path.resolve(process.env.CAMPAIGN_MEDIA_ROOT)
  : path.join(projectRoot, "campaign-media");
const watchDir = process.env.CAMPAIGN_MEDIA_WATCH_DIR
  ? path.resolve(process.env.CAMPAIGN_MEDIA_WATCH_DIR)
  : path.join(campaignMediaRoot, "uploads");

const logger = createIngestLogger(campaignMediaRoot);

function requireEnv() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    logger.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role) for storage uploads.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    logger.error("Set DATABASE_URL for Prisma.");
    process.exit(1);
  }
}

async function main() {
  requireEnv();
  const { mkdir } = await import("node:fs/promises");
  await mkdir(watchDir, { recursive: true });
  await mkdir(path.join(campaignMediaRoot, "processed"), { recursive: true });
  await mkdir(path.join(campaignMediaRoot, "failed"), { recursive: true });
  await mkdir(path.join(campaignMediaRoot, "duplicate"), { recursive: true });

  const scanOnStart = process.env.CAMPAIGN_MEDIA_INGEST_SCAN_ON_START !== "0";

  logger.info("Campaign media ingest starting", { watchDir, campaignMediaRoot, scanOnStart: String(scanOnStart) });

  const w = chokidar.watch(watchDir, {
    ignored: (filePath) => {
      const base = path.basename(filePath);
      if (base.startsWith(".")) return true;
      if (filePath.endsWith("ingest.log")) return true;
      return false;
    },
    ignoreInitial: !scanOnStart,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 200 },
    depth: 20,
  });

  w.on("add", (p) => {
    void ingestFileFromPath({
      absolutePath: p,
      watchRoot: watchDir,
      campaignMediaRoot,
      logger,
    });
  });
  w.on("error", (e) => logger.error("watcher", { err: String(e) }));
  process.on("SIGINT", () => {
    void w.close();
    process.exit(0);
  });
}

void main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
