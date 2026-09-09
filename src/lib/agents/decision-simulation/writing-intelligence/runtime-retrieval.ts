import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Runtime retrieval is allowed to cache first-party public pages outside git.
 * Never commit downloaded article bodies.
 */
export const WRITING_INTELLIGENCE_CACHE_DIR = "H:/SOSWebsite/.local/writing-intelligence-cache";

export function writingCachePath(sourceId: string): string {
  const safe = sourceId.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  return path.join(WRITING_INTELLIGENCE_CACHE_DIR, `${safe}.txt`);
}

export function writeWritingCache(sourceId: string, body: string): string {
  mkdirSync(WRITING_INTELLIGENCE_CACHE_DIR, { recursive: true });
  const filePath = writingCachePath(sourceId);
  writeFileSync(filePath, body, "utf8");
  return filePath;
}

export function isGitSafeWritingArtifact(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("/.local/writing-intelligence-cache/")) return true;
  if (normalized.endsWith(".json") && normalized.includes("/writing-intelligence/data/")) {
    return true;
  }
  return !/\.(html|txt|md)$/.test(normalized) || normalized.includes("/develop_notes/");
}
