import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RecommendationFeedbackRecord, RecommendationFeedbackSummary } from "./recommendation-feedback-types";

const REL = "data/campaign-events/campaign-knowledge/recommendation-feedback.json";

function filePath(repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), REL);
}

export function loadRecommendationFeedback(repoRoot?: string): RecommendationFeedbackRecord[] {
  const p = filePath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(raw?.records) ? raw.records : Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function save(records: RecommendationFeedbackRecord[], repoRoot?: string) {
  const p = filePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify({ records: records.slice(-300) }, null, 2), "utf8");
}

export function recordRecommendationFeedback(
  partial: Omit<RecommendationFeedbackRecord, "id" | "recordedAt"> & { id?: string; recordedAt?: string },
  repoRoot?: string,
): RecommendationFeedbackRecord {
  const records = loadRecommendationFeedback(repoRoot);
  const rec: RecommendationFeedbackRecord = {
    id: partial.id ?? `recfb_${Date.now().toString(36)}`,
    recordedAt: partial.recordedAt ?? new Date().toISOString(),
    recommendationId: partial.recommendationId,
    recommendationKind: partial.recommendationKind,
    title: partial.title,
    domainId: partial.domainId,
    period: partial.period,
    status: partial.status,
    recordedBy: partial.recordedBy,
    outcomeNote: partial.outcomeNote,
  };
  save([...records.filter((r) => r.recommendationId !== rec.recommendationId), rec], repoRoot);
  return rec;
}

export function summarizeRecommendationFeedback(records: RecommendationFeedbackRecord[]): RecommendationFeedbackSummary {
  const count = (s: RecommendationFeedbackRecord["status"]) => records.filter((r) => r.status === s).length;
  const successful = count("successful") + count("completed");
  const failed = count("failed") + count("rejected");
  const decided = successful + failed;
  return {
    total: records.length,
    pending: count("pending"),
    accepted: count("accepted"),
    rejected: count("rejected"),
    completed: count("completed"),
    ignored: count("ignored"),
    successful: count("successful"),
    failed: count("failed"),
    successRate: decided > 0 ? Math.round((successful / decided) * 100) : 0,
  };
}
