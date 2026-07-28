/**
 * Search index derived from published transcripts (does not alter transcript text).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { SEARCH_INDEX_FILE, WORKSPACE_REL } from "./workspace-store";
import { flagProperNouns } from "./proper-noun-flags";

export type TranscriptSearchDocument = {
  youtubeVideoId: string;
  slug: string;
  title: string;
  excerpt: string;
  keywords: string[];
  entities: string[];
  topics: string[];
  counties: string[];
  organizations: string[];
  plainText: string;
};

export type TranscriptSearchIndex = {
  version: number;
  generatedAt: string;
  documents: TranscriptSearchDocument[];
};

export function buildSearchDocument(media: CampaignMediaRecord): TranscriptSearchDocument {
  const text = media.transcript.plainText;
  const flags = flagProperNouns(text);
  const entities = flags.map((f) => f.term);
  const counties = [
    ...(media.counties ?? []),
    ...flags.filter((f) => f.category === "COUNTY").map((f) => f.term),
  ];
  const organizations = flags.filter((f) => f.category === "ORGANIZATION").map((f) => f.term);
  const keywords = Array.from(
    new Set([...media.topics, ...entities].map((k) => k.trim()).filter(Boolean)),
  );
  return {
    youtubeVideoId: media.youtubeVideoId,
    slug: media.slug,
    title: media.title,
    excerpt: text.slice(0, 280),
    keywords,
    entities,
    topics: media.topics,
    counties: Array.from(new Set(counties)),
    organizations: Array.from(new Set(organizations)),
    plainText: text,
  };
}

export function buildTranscriptSearchIndex(mediaList: CampaignMediaRecord[]): TranscriptSearchIndex {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    documents: mediaList.map(buildSearchDocument),
  };
}

export function persistTranscriptSearchIndex(
  index: TranscriptSearchIndex,
  repoRoot: string = process.cwd(),
): string {
  const abs = path.join(repoRoot, WORKSPACE_REL, SEARCH_INDEX_FILE);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  return abs;
}

export function searchTranscriptIndex(
  index: TranscriptSearchIndex,
  query: {
    q?: string;
    county?: string;
    topic?: string;
  },
): TranscriptSearchDocument[] {
  const q = query.q?.trim().toLowerCase();
  const county = query.county?.trim().toLowerCase();
  const topic = query.topic?.trim().toLowerCase();
  return index.documents.filter((doc) => {
    if (county && !doc.counties.some((c) => c.toLowerCase().includes(county))) return false;
    if (topic && !doc.topics.some((t) => t.toLowerCase().includes(topic))) return false;
    if (!q) return true;
    const hay = `${doc.title}\n${doc.excerpt}\n${doc.plainText}\n${doc.keywords.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}
