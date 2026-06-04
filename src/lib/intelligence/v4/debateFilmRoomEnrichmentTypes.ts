import type { OpponentMediaEntry } from "@/lib/intelligence/opponents/opponentMediaCatalogTypes";
import type {
  MediaTranscriptSegment,
  OpponentMediaTranscriptEntry,
} from "@/lib/intelligence/opponents/opponentMediaTranscriptTypes";

/** Client-safe film room media drill types — no node:fs. */

export type FilmRoomMediaDrill = {
  mediaId: string;
  title: string;
  url: string;
  publisher: string;
  platform: string;
  researchValue: string;
  speakerVerification: string;
  summary: string;
  topicTags: string[];
  transcript?: OpponentMediaTranscriptEntry;
  keySegments: MediaTranscriptSegment[];
  offensiveUse: string;
  defensiveUse: string;
  kellyPivot30s: string;
  drillPrompt: string;
  claimsGate: string;
  trapLaneHref: string | null;
  billDrillHrefs: string[];
};

export type { OpponentMediaEntry };
