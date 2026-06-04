/** Client-safe types and helpers — no node:fs (import from loadOpponentMediaCatalog only on server). */

export type OpponentMediaEntry = {
  id: string;
  opponentId: "kim-hammer" | "michael-packo" | string;
  platform: string;
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: string;
  topicTags: string[];
  researchValue: "HIGH" | "MEDIUM" | "LOW";
  speakerVerification: string;
  summary: string;
  sourceType: string;
};

export type OpponentMediaCatalog = {
  version: number;
  generatedAt: string;
  notes?: string;
  candidates: OpponentMediaEntry[];
};

export function isYoutubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}
