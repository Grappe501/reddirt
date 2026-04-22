/**
 * Earned-media / press monitor ingestion (Arkansas sources, Kelly Grappe).
 *
 * Usage:
 *   npx tsx scripts/ingest-external-media.ts
 *   npx tsx scripts/ingest-external-media.ts --dry-run
 *   npx tsx scripts/ingest-external-media.ts --full-registry
 *   npx tsx scripts/ingest-external-media.ts --source=arkansas-times
 *   npx tsx scripts/ingest-external-media.ts --incremental
 *   npx tsx scripts/ingest-external-media.ts --openai
 *
 * Weekly: schedule GET /api/cron/media-monitor?key=... (see MEDIA_MONITOR_CRON_SECRET).
 */
import { runExternalMediaIngest } from "../src/lib/media-monitor/run-ingest";

function argFlag(name: string): boolean {
  return process.argv.includes(name);
}

function argValue(prefix: string): string | null {
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (!hit) return null;
  const [, v] = hit.split("=", 2);
  return v?.trim() || null;
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const dryRun = argFlag("--dry-run");
  const verticalSliceOnly = !argFlag("--full-registry");
  const incremental = argFlag("--incremental");
  const useOpenAi = argFlag("--openai") || process.env.MEDIA_MONITOR_USE_OPENAI === "1";
  const source = argValue("--source");

  console.log(
    JSON.stringify(
      { dryRun, verticalSliceOnly, incremental, useOpenAi, source },
      null,
      2,
    ),
  );

  const result = await runExternalMediaIngest({
    label: "cli",
    dryRun,
    verticalSliceOnly,
    sourceSlug: source,
    incremental,
    useOpenAiRefine: useOpenAi,
  });

  console.log(JSON.stringify(result, null, 2));
  if (result.error) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
