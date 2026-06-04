import fs from "node:fs";
import path from "node:path";

export type MediaTranscriptSegment = {
  startTime: string;
  endTime: string;
  speakerLabel: string;
  text: string;
};

export type OpponentMediaTranscriptEntry = {
  mediaId: string;
  status: string;
  provider: string;
  speakerVerification: string;
  segments: MediaTranscriptSegment[];
  debateUseNotes?: string;
};

export type OpponentMediaTranscriptsFile = {
  version: number;
  generatedAt: string;
  notes?: string;
  entries: OpponentMediaTranscriptEntry[];
};

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
