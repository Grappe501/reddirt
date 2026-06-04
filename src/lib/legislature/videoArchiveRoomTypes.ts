/** Client-safe video archive room types — no node:fs (server loads data in videoArchiveRoom.ts). */

import type { HammerDirectDemocracyPacket } from "@/lib/intelligence/v4/hammerDirectDemocracyTypes";
import type { KellyRoadStoriesFile } from "@/lib/intelligence/kellyRoadStoriesTypes";
import type { OpponentMediaEntry } from "@/lib/intelligence/opponents/opponentMediaCatalogTypes";
import type { OpponentMediaTranscriptEntry } from "@/lib/intelligence/opponents/opponentMediaTranscriptTypes";
import type {
  KellyCandidateSuggestion,
  OpponentSnippetSlot,
  VideoArchiveManifestAsset,
  VideoArchiveManualSponsorLink,
} from "@/lib/legislature/videoArchiveRoomManifestTypes";

export type { VideoArchiveManualSponsorLink } from "@/lib/legislature/videoArchiveRoomManifestTypes";

export type VideoArchiveCommitteeLink = {
  id: string;
  committeeName: string;
  meetingDate: string;
  videoUrl: string;
  sourcePageUrl: string;
  sourceType: string;
  expectedSpeaker: string;
  sponsorExpected: boolean;
  processingStatus: string;
  discoveryConfidence: number;
  origin: "DISCOVERY" | "MANUAL";
  downloadHref: string;
};

export type VideoArchiveBillRow = {
  billNumber: string;
  session: string;
  title: string;
  sponsor: string;
  priorityLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  isDebateAnchor: boolean;
  billUrl: string;
  videoDiscoveryStatus: string;
  committeeVideos: VideoArchiveCommitteeLink[];
  cutReadyAssets: VideoArchiveManifestAsset[];
  manualLinks: VideoArchiveManualSponsorLink[];
};

export type OpponentMediaRow = OpponentMediaEntry & {
  snippetSlots: OpponentSnippetSlot[];
  snippets: VideoArchiveManifestAsset[];
  watchUrl: string;
  downloadUrl: string;
  transcript?: OpponentMediaTranscriptEntry;
};

export type VideoArchiveRoomPacket = {
  generatedAt: string;
  focusBillCount: number;
  billsWithVideo: number;
  totalCommitteeLinks: number;
  cutReadyCount: number;
  cutReadyFolderLabel: string;
  operatorNotes: string;
  bills: VideoArchiveBillRow[];
  opponentMedia: {
    hammer: OpponentMediaRow[];
    packo: OpponentMediaRow[];
    kellySuggestions: KellyCandidateSuggestion[];
  };
  transcripts: {
    catalogCount: number;
    pipelineSegmentCount: number;
    transcriptionStatus: string;
  };
  legislativeRecord: HammerDirectDemocracyPacket;
  roadStories: KellyRoadStoriesFile;
  committeeTranscriptExcerpts: Array<{
    billNumber: string;
    videoCandidateId: string;
    text: string;
    speakerLabel: string;
  }>;
};
