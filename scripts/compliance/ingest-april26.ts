/**
 * Ingest Compliance/April26 into RedDirt staged compliance storage.
 * Usage:
 *   npm run compliance:april26:dry
 *   npm run compliance:april26:ingest
 *
 * Uses RedDirt/.env only (OPENAI_API_KEY optional for vision).
 * PII stays in local data/compliance/april26 (gitignored).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import { ingestApril26Folder } from "../../src/lib/compliance/april26/ingest-april26";

loadEnvConfig(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."));

async function main() {
  const dryRun = process.argv.includes("--dry");
  const report = await ingestApril26Folder({
    dryRun,
    openaiApiKey: dryRun ? undefined : process.env.OPENAI_API_KEY,
    visionModel: process.env.OPENAI_VISION_MODEL ?? process.env.OPENAI_MODEL,
    actorInitials: "CLI",
  });
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
