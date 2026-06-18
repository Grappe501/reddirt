/**
 * Ingest ACCA forum from YouTube — yt-dlp audio + Whisper + speaker labels + analysis.
 *
 * Usage (from RedDirt/, with DATABASE_URL + OPENAI_API_KEY):
 *   node scripts/run-with-h-drive-env.cjs npm run forum:ingest-youtube-acca
 *   node scripts/run-with-h-drive-env.cjs npm run forum:ingest-youtube-acca -- --no-analysis
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ingestYoutubeForumVideo } from "../src/lib/intelligence/v4/youtubeForumIngest";
import { ACCA_2026_SOS_FORUM_EVENT } from "../src/lib/intelligence/v4/forumVideoDropPath";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadRedDirtEnv(root);

const noAnalysis = process.argv.includes("--no-analysis");
const captionsOnly = process.argv.includes("--captions-only");

void (async () => {
  console.log("YouTube:", ACCA_2026_SOS_FORUM_EVENT.youtubeWatchUrl);
  const result = await ingestYoutubeForumVideo({
    urlOrId: ACCA_2026_SOS_FORUM_EVENT.youtubeVideoId,
    preferWhisper: !captionsOnly,
    runDiarization: true,
    runAnalysis: !noAnalysis,
    runDeepAnalysis: !noAnalysis,
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
})();
