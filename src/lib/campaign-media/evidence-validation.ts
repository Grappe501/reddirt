import type { PhotoEvidenceOverlay, SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";

const HERO_LEVELS = new Set(["HERO", "FEATURE", "SUPPORTING", "UNREVIEWED"]);
const PUBLICATION = new Set(["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]);
const TIERS = new Set(["Gold", "Silver", "Archive", ""]);

export function parseHeroLevel(raw: string): PhotoEvidenceOverlay["heroLevel"] | undefined {
  const v = raw.trim();
  if (!v) return undefined;
  return HERO_LEVELS.has(v) ? (v as PhotoEvidenceOverlay["heroLevel"]) : undefined;
}

export function parsePublicationStatus(
  raw: string,
): PhotoEvidenceOverlay["publicationStatus"] | undefined {
  const v = raw.trim();
  if (!v) return undefined;
  return PUBLICATION.has(v) ? (v as PhotoEvidenceOverlay["publicationStatus"]) : undefined;
}

export function parseTierIntent(raw: string): PhotoEvidenceOverlay["tierIntent"] {
  const v = raw.trim();
  if (!TIERS.has(v)) return "";
  return v as PhotoEvidenceOverlay["tierIntent"];
}

export function normalizeCountyList(raw: string): string[] {
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .filter((c, i, arr) => arr.findIndex((x) => x.toLowerCase() === c.toLowerCase()) === i);
}

export function mergeAiCountyIntoList(existing: string, suggestedCounty: string): string {
  const sug = suggestedCounty.trim();
  if (!sug || sug === "Unknown") return existing;
  const list = normalizeCountyList(existing);
  if (list.some((c) => c.toLowerCase() === sug.toLowerCase())) return list.join(", ");
  return [...list, sug].join(", ");
}

export type SpeechEvidenceSaveFields = Pick<
  SpeechEvidenceOverlay,
  | "counties"
  | "city"
  | "venue"
  | "eventDate"
  | "eventName"
  | "whatThisProves"
  | "approvedForPublic"
  | "homepageCandidate"
  | "publicationStatus"
>;
