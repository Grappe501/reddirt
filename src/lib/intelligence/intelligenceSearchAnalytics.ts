/**
 * Admin intelligence search analytics — failed queries and top searches for content gap triage.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type IntelSearchAnalyticsEvent = {
  timestamp: string;
  query: string;
  resultCount: number;
  intent?: string;
  urgency?: string;
  mode?: string;
  rewrittenQueries?: string[];
};

export type IntelSearchAnalyticsFile = {
  version: 1;
  events: IntelSearchAnalyticsEvent[];
};

const REL = "data/intelligence/search-analytics.json";
const MAX_EVENTS = 500;

function absPath(repoRoot: string): string {
  return path.join(repoRoot, REL);
}

function readFile(repoRoot: string): IntelSearchAnalyticsFile {
  const abs = absPath(repoRoot);
  if (!existsSync(abs)) {
    return { version: 1, events: [] };
  }
  try {
    return JSON.parse(readFileSync(abs, "utf8")) as IntelSearchAnalyticsFile;
  } catch {
    return { version: 1, events: [] };
  }
}

export function recordIntelSearchEvent(
  event: Omit<IntelSearchAnalyticsEvent, "timestamp">,
  repoRoot: string = process.cwd(),
): void {
  const file = readFile(repoRoot);
  file.events.unshift({
    ...event,
    timestamp: new Date().toISOString(),
  });
  file.events = file.events.slice(0, MAX_EVENTS);
  const abs = absPath(repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

export type IntelSearchGapSummary = {
  failedQueries: { query: string; count: number; lastAt: string }[];
  recentZeroResult: IntelSearchAnalyticsEvent[];
};

export function summarizeIntelSearchGaps(repoRoot: string = process.cwd()): IntelSearchGapSummary {
  const file = readFile(repoRoot);
  const zero = file.events.filter((e) => e.resultCount === 0);
  const counts = new Map<string, { count: number; lastAt: string }>();
  for (const e of zero) {
    const key = e.query.trim().toLowerCase();
    if (!key) continue;
    const prev = counts.get(key);
    if (!prev) counts.set(key, { count: 1, lastAt: e.timestamp });
    else {
      prev.count++;
      if (e.timestamp > prev.lastAt) prev.lastAt = e.timestamp;
    }
  }
  const failedQueries = [...counts.entries()]
    .map(([query, v]) => ({ query, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  return { failedQueries, recentZeroResult: zero.slice(0, 8) };
}
