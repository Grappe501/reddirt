/** Client-safe transcript types — no node:fs. */

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
