/** Future-ready external video source contract — not fully implemented in P4. */

export type ExternalVideoSourceType =
  | "YOUTUBE_CHANNEL"
  | "CAMPAIGN_VIDEO"
  | "MEDIA_INTERVIEW"
  | "FACEBOOK_VIDEO"
  | "PUBLIC_FORUM"
  | "LOCAL_GOVERNMENT";

export type ExternalVideoSourceCandidate = {
  id: string;
  sourceType: ExternalVideoSourceType;
  title: string;
  url: string;
  channelOrPublisher: string;
  publishedAt: string | null;
  opponentId: string;
  discoveryConfidence: number;
  processingStatus: "NOT_IMPLEMENTED" | "DISCOVERED" | "QUEUED";
  retrievalWarnings: string[];
};

export type ExternalVideoTranscriptSource = {
  candidateId: string;
  provider: string;
  transcriptDeferred: boolean;
  segmentsCount: number;
};

export type ExternalSpeakerVerification = {
  candidateId: string;
  attributionStatus: "UNKNOWN" | "NEEDS_REVIEW" | "CONFIRMED";
  signals: string[];
};

export type ExternalVideoChunk = {
  id: string;
  candidateId: string;
  startTime: string;
  endTime: string;
  text: string;
  speakerAttributionStatus: string;
  reviewRequired: true;
};

export const EXTERNAL_VIDEO_P4_STATUS = "CONTRACT_ONLY_NOT_IMPLEMENTED";
