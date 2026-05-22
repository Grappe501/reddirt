import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ComplianceRuleTopic } from "./compliance-rule-types";

export type ComplianceRuleReviewRecord = {
  sourceId?: string;
  topic?: ComplianceRuleTopic;
  reviewedByInitials: string;
  reviewedAt: string;
  reviewNote?: string;
  stale?: boolean;
  staleFlaggedAt?: string;
};

const REVIEWS_PATH = path.join(process.cwd(), "data", "compliance", "knowledge", "rule-reviews.json");

export async function loadRuleReviews(): Promise<ComplianceRuleReviewRecord[]> {
  try {
    return JSON.parse(await readFile(REVIEWS_PATH, "utf8")) as ComplianceRuleReviewRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function reviewKey(record: ComplianceRuleReviewRecord): string {
  return record.topic ? `topic:${record.topic}` : `source:${record.sourceId ?? ""}`;
}

export async function saveRuleReview(record: ComplianceRuleReviewRecord): Promise<void> {
  const reviews = await loadRuleReviews();
  const key = reviewKey(record);
  const next = [...reviews.filter((item) => reviewKey(item) !== key), record];
  await mkdir(path.dirname(REVIEWS_PATH), { recursive: true });
  await writeFile(REVIEWS_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export async function flagRuleSourceStale(sourceId: string): Promise<void> {
  const reviews = await loadRuleReviews();
  const existing = reviews.find((item) => item.sourceId === sourceId);
  await saveRuleReview({
    sourceId,
    reviewedByInitials: existing?.reviewedByInitials ?? "SYS",
    reviewedAt: existing?.reviewedAt ?? new Date().toISOString(),
    reviewNote: existing?.reviewNote,
    stale: true,
    staleFlaggedAt: new Date().toISOString(),
  });
}
