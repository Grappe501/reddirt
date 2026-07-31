/**
 * CLI intake — same path as Evidence Workbench "Intake all new".
 * From RedDirt:
 *   npm run evidence:intake
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/batch-ingest-campaign-photos.ts
 */
import Module from "node:module";

const originalLoad = (Module as unknown as { _load: (...args: unknown[]) => unknown })._load;
(Module as unknown as { _load: (...args: unknown[]) => unknown })._load = function (...args: unknown[]) {
  const request = String(args[0] ?? "");
  const normalized = request.replace(/\\/g, "/");
  if (
    request === "server-only" ||
    normalized.includes("/server-only/") ||
    normalized.endsWith("/server-only")
  ) {
    return {};
  }
  return originalLoad.apply(this, args);
};

async function main() {
  const { intakeAllNewCampaignPhotos, getPhotoIntakeStatus } = await import(
    "../src/lib/campaign-media/photo-ingest"
  );
  const result = await intakeAllNewCampaignPhotos();
  const status = getPhotoIntakeStatus();
  console.log(JSON.stringify({ ...result, status }, null, 2));
  if (!result.ok && result.queued === 0 && result.skippedErrors > 0) process.exit(1);
  console.log("OK evidence:intake");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
