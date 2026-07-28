/**
 * Operator sync: discover channel videos + download captions into REVIEW_REQUIRED drafts.
 * Never publishes.
 *
 *   npm run media:youtube-transcript-sync
 */

import { syncYouTubeTranscriptPipeline } from "../src/lib/media/youtube-transcripts/sync-pipeline";
import { validateYouTubeConnection } from "../src/lib/media/youtube-transcripts/oauth-client";
import { getYouTubeConnectionPublicStatus } from "../src/lib/media/youtube-transcripts/oauth-store";

async function main() {
  const status = getYouTubeConnectionPublicStatus();
  if (!status.connected) {
    console.error("YouTube is not connected. Use Admin → Media → YouTube to connect OAuth first.");
    process.exit(1);
  }
  const validated = await validateYouTubeConnection();
  if (!validated.ok) {
    console.error("YouTube token validation failed:", validated.error);
    process.exit(1);
  }
  console.log("Connected:", validated.channelTitle, validated.channelId);
  const result = await syncYouTubeTranscriptPipeline({
    maxVideos: Number(process.env.YOUTUBE_SYNC_MAX_VIDEOS ?? 25),
    downloadCaptions: process.env.YOUTUBE_SYNC_SKIP_CAPTIONS !== "1",
    author: "operator:youtube-transcript-sync",
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
