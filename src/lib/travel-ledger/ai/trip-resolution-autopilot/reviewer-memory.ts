import { readFile } from "node:fs/promises";
import path from "node:path";
import type { TitleCityMatch } from "./autopilot-types";
import { normalizeText } from "./city-county-alias-memory";

const MEMORY_PATH = path.join(process.cwd(), "data", "ai", "travel-ledger-reviewer-memory.json");

export type ReviewerMemoryPattern = {
  pattern: string;
  city?: string;
  state?: string;
  purpose?: string;
  excludeReason?: string;
  confidence: "human_confirmed" | "machine_suggested";
};

export type ReviewerMemory = {
  patterns: ReviewerMemoryPattern[];
};

export async function loadReviewerMemory(): Promise<ReviewerMemory> {
  try {
    const raw = await readFile(MEMORY_PATH, "utf8");
    return JSON.parse(raw) as ReviewerMemory;
  } catch {
    return { patterns: [] };
  }
}

export async function findReviewerMemoryCity(title: string): Promise<TitleCityMatch | null> {
  const memory = await loadReviewerMemory();
  const normalizedTitle = normalizeText(title);
  const match = memory.patterns
    .filter((entry) => entry.city && normalizedTitle.includes(normalizeText(entry.pattern).trim()))
    .sort((a, b) => b.pattern.length - a.pattern.length)[0];

  if (!match?.city) return null;

  return {
    city: match.city,
    state: match.state ?? "AR",
    cities: [{ city: match.city, state: match.state ?? "AR" }],
    confidence: match.confidence === "human_confirmed" ? "high" : "medium",
    matchedText: match.pattern,
    source: "title_alias_match",
    needsHumanConfirmation: match.confidence !== "human_confirmed",
    reason: `Reviewer memory matched "${match.pattern}".`,
  };
}

