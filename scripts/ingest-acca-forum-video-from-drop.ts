/**
 * Ingest large ACCA forum video from local drop folder (7+ GB OK — disk move, not browser upload).
 *
 * Usage (from RedDirt/, with DATABASE_URL + OPENAI_API_KEY in .env.local):
 *   node scripts/run-with-h-drive-env.cjs npx tsx scripts/ingest-acca-forum-video-from-drop.ts
 *   node scripts/run-with-h-drive-env.cjs npx tsx scripts/ingest-acca-forum-video-from-drop.ts --no-analysis
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ingestLargeForumVideoFromDrop } from "../src/lib/intelligence/v4/ingestLargeForumVideo";
import { getAcca2026SosForumDropAbsolute } from "../src/lib/intelligence/v4/forumVideoDropPath";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadRedDirtEnv(root);

const noAnalysis = process.argv.includes("--no-analysis");

void (async () => {
  console.log("Drop folder:", getAcca2026SosForumDropAbsolute());
  const result = await ingestLargeForumVideoFromDrop({ runAnalysis: !noAnalysis });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
})();
