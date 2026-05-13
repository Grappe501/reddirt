import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ApprovalContext } from "./build-approval-context";
import type { AiApprovalRecommendation } from "./ai-approval-recommendation-types";

const DATA_DIR = path.join(process.cwd(), "data", "calendar-command-center");
const CACHE_FILE = path.join(DATA_DIR, "ai-recommendations.json");

type CacheFile = {
  version: 1;
  byItemId: Record<
    string,
    {
      contextHash: string;
      savedAt: string;
      recommendation: AiApprovalRecommendation;
    }
  >;
};

export function hashApprovalContext(ctx: ApprovalContext): string {
  return createHash("sha256").update(JSON.stringify(ctx)).digest("hex");
}

function readAll(): CacheFile {
  if (!existsSync(CACHE_FILE)) {
    return { version: 1, byItemId: {} };
  }
  try {
    const raw = JSON.parse(readFileSync(CACHE_FILE, "utf8")) as CacheFile;
    if (raw?.version !== 1 || typeof raw.byItemId !== "object" || !raw.byItemId) {
      return { version: 1, byItemId: {} };
    }
    return raw;
  } catch {
    return { version: 1, byItemId: {} };
  }
}

function writeAll(data: CacheFile) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function getCachedRecommendation(
  calendarItemId: string,
  contextHash: string,
): AiApprovalRecommendation | null {
  const data = readAll();
  const row = data.byItemId[calendarItemId];
  if (!row || row.contextHash !== contextHash) return null;
  return row.recommendation;
}

export function putCachedRecommendation(
  calendarItemId: string,
  contextHash: string,
  recommendation: AiApprovalRecommendation,
): void {
  const data = readAll();
  data.byItemId[calendarItemId] = {
    contextHash,
    savedAt: new Date().toISOString(),
    recommendation,
  };
  writeAll(data);
}
