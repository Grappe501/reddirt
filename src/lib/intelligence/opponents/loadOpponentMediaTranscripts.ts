import "server-only";

import fs from "node:fs";
import path from "node:path";

export type {
  MediaTranscriptSegment,
  OpponentMediaTranscriptEntry,
  OpponentMediaTranscriptsFile,
} from "@/lib/intelligence/opponents/opponentMediaTranscriptTypes";
import type {
  OpponentMediaTranscriptEntry,
  OpponentMediaTranscriptsFile,
} from "@/lib/intelligence/opponents/opponentMediaTranscriptTypes";

const REL = "data/legislature/video-archives/opponent-media-transcripts.json";

export function loadOpponentMediaTranscripts(repoRoot: string = process.cwd()): OpponentMediaTranscriptsFile {
  const abs = path.join(repoRoot, REL);
  if (!fs.existsSync(abs)) {
    return { version: 1, generatedAt: new Date().toISOString(), entries: [] };
  }
  return JSON.parse(fs.readFileSync(abs, "utf8")) as OpponentMediaTranscriptsFile;
}

export function getTranscriptForMedia(mediaId: string, repoRoot?: string): OpponentMediaTranscriptEntry | undefined {
  return loadOpponentMediaTranscripts(repoRoot).entries.find((e) => e.mediaId === mediaId);
}
