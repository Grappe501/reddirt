/**
 * Lightweight transcript analytics (JSONL append). No PII.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ANALYTICS_FILE, WORKSPACE_REL } from "./workspace-store";

export type TranscriptAnalyticsEventType =
  | "TRANSCRIPT_OPEN"
  | "TRANSCRIPT_SEARCH"
  | "TRANSCRIPT_DOWNLOAD"
  | "TRANSCRIPT_COPY_QUOTE"
  | "PAGE_VIEW";

export type TranscriptAnalyticsEvent = {
  type: TranscriptAnalyticsEventType;
  youtubeVideoId?: string;
  slug?: string;
  meta?: Record<string, string | number | boolean>;
  at: string;
};

function abs(repoRoot: string): string {
  return path.join(repoRoot, WORKSPACE_REL, ANALYTICS_FILE);
}

export function recordTranscriptAnalytics(
  event: Omit<TranscriptAnalyticsEvent, "at">,
  repoRoot: string = process.cwd(),
): void {
  const p = abs(repoRoot);
  mkdirSync(path.dirname(p), { recursive: true });
  const line = JSON.stringify({ ...event, at: new Date().toISOString() });
  appendFileSync(p, `${line}\n`, "utf8");
}

export function readRecentAnalytics(limit = 100, repoRoot: string = process.cwd()): TranscriptAnalyticsEvent[] {
  const p = abs(repoRoot);
  if (!existsSync(p)) return [];
  const lines = readFileSync(p, "utf8").trim().split("\n").filter(Boolean);
  return lines
    .slice(-limit)
    .map((l) => {
      try {
        return JSON.parse(l) as TranscriptAnalyticsEvent;
      } catch {
        return null;
      }
    })
    .filter((x): x is TranscriptAnalyticsEvent => Boolean(x))
    .reverse();
}
