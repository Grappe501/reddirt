/** Legislative transcription types — Postgres-ready. */

export type TranscriptionProviderStatus = "NOT_CONFIGURED" | "OPENAI" | "LOCAL_WHISPER" | "DEFERRED";

export type TranscriptSegment = {
  id: string;
  videoCandidateId: string;
  billNumber: string;
  speakerLabel: string;
  speakerConfidence: number;
  startTime: string;
  endTime: string;
  text: string;
  transcriptionConfidence: number;
  needsHumanReview: boolean;
  sourceCitationAnchorId: string | null;
  createdAt: string;
};

export type TranscriptionJobResult = {
  status: "TRANSCRIBED" | "TRANSCRIPTION_DEFERRED" | "FAILED";
  provider: TranscriptionProviderStatus;
  segments: TranscriptSegment[];
  warnings: string[];
};

export type TranscriptsFile = {
  version: number;
  generatedAt: string;
  segments: TranscriptSegment[];
};
