import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  FeedbackDomainSummary,
  FailedRecommendationPattern,
  RecommendationOutcome,
  RecommendationOutcomeStatus,
} from "./orchestration-feedback-types";
import { safeOutcomeNotes, validateRecommendationOutcomeInput } from "./feedback-safety";
import type { CampaignDomainId } from "../campaign-state-types";

const REL = "data/campaign-events/orchestration-feedback/recommendation-outcomes.json";

type Store = {
  updatedAt: string;
  outcomes: RecommendationOutcome[];
};

function storePath(repoRoot?: string): string {
  return path.join(repoRoot ?? process.cwd(), REL);
}

function emptyStore(): Store {
  return { updatedAt: new Date().toISOString(), outcomes: [] };
}

export function loadRecommendationOutcomes(repoRoot?: string): RecommendationOutcome[] {
  const p = storePath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    const parsed = JSON.parse(readFileSync(p, "utf8")) as Partial<Store>;
    return Array.isArray(parsed.outcomes) ? parsed.outcomes : [];
  } catch {
    return [];
  }
}

function saveRecommendationOutcomes(outcomes: RecommendationOutcome[], repoRoot?: string): void {
  const p = storePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const store: Store = { updatedAt: new Date().toISOString(), outcomes: outcomes.slice(-500) };
  writeFileSync(p, JSON.stringify(store, null, 2), "utf8");
}

function scoreFromStatus(status: RecommendationOutcomeStatus, provided?: number): number | undefined {
  if (provided != null) return Math.max(0, Math.min(100, provided));
  if (status === "completed") return 90;
  if (status === "accepted") return 65;
  if (status === "needs_revision") return 35;
  if (status === "ignored") return 20;
  if (status === "rejected" || status === "failed") return 0;
  return undefined;
}

export function recordRecommendationOutcome(
  input: Omit<Partial<RecommendationOutcome>, "id" | "producedObservationIds" | "producedLessonIds" | "safetyNotes"> & {
    id?: string;
    recommendationId: string;
    recommendationTitle: string;
    source: RecommendationOutcome["source"];
    domain: CampaignDomainId;
    status: RecommendationOutcomeStatus;
    producedObservationIds?: string[];
    producedLessonIds?: string[];
    safetyNotes?: string[];
  },
  repoRoot?: string,
): RecommendationOutcome {
  const errors = validateRecommendationOutcomeInput(input);
  if (errors.length) throw new Error(`Invalid recommendation outcome: ${errors.join("; ")}`);

  const now = new Date().toISOString();
  const existing = loadRecommendationOutcomes(repoRoot);
  const outcome: RecommendationOutcome = {
    id: input.id ?? `ro_${Date.now().toString(36)}`,
    recommendationId: input.recommendationId,
    recommendationTitle: input.recommendationTitle,
    source: input.source,
    domain: input.domain,
    county: input.county,
    ownerRole: input.ownerRole,
    proposedAt: input.proposedAt ?? now,
    decidedAt: input.status === "proposed" ? input.decidedAt : input.decidedAt ?? now,
    decidedBy: input.decidedBy,
    status: input.status,
    outcomeSummary: input.outcomeSummary,
    humanFeedback: input.humanFeedback,
    correction: input.correction,
    successScore: scoreFromStatus(input.status, input.successScore),
    producedObservationIds: input.producedObservationIds ?? [],
    producedLessonIds: input.producedLessonIds ?? [],
    followupNeeded: input.followupNeeded ?? (input.status === "failed" || input.status === "needs_revision"),
    followupPrompt: input.followupPrompt,
    safetyNotes: [...safeOutcomeNotes(input.status), ...(input.safetyNotes ?? [])],
  };
  saveRecommendationOutcomes([...existing.filter((o) => o.id !== outcome.id), outcome], repoRoot);
  return outcome;
}

export function listRecentRecommendationOutcomes(limit = 20, repoRoot?: string): RecommendationOutcome[] {
  return loadRecommendationOutcomes(repoRoot)
    .sort((a, b) => (b.decidedAt ?? b.proposedAt).localeCompare(a.decidedAt ?? a.proposedAt))
    .slice(0, limit);
}

export function summarizeFeedbackByDomain(outcomes: RecommendationOutcome[]): FeedbackDomainSummary[] {
  const map = new Map<CampaignDomainId, FeedbackDomainSummary>();
  for (const o of outcomes) {
    const current =
      map.get(o.domain) ??
      {
        domain: o.domain,
        total: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
        failed: 0,
        ignored: 0,
        needsRevision: 0,
      };
    current.total += 1;
    if (o.status === "accepted") current.accepted += 1;
    if (o.status === "rejected") current.rejected += 1;
    if (o.status === "completed") current.completed += 1;
    if (o.status === "failed") current.failed += 1;
    if (o.status === "ignored") current.ignored += 1;
    if (o.status === "needs_revision") current.needsRevision += 1;
    map.set(o.domain, current);
  }
  return [...map.values()];
}

export function identifyIgnoredRecommendations(outcomes: RecommendationOutcome[]): RecommendationOutcome[] {
  return outcomes.filter((o) => o.status === "ignored").slice(-20);
}

export function identifyFailedRecommendationPatterns(outcomes: RecommendationOutcome[]): FailedRecommendationPattern[] {
  const counts = new Map<string, { source: RecommendationOutcome["source"]; domain: CampaignDomainId; count: number }>();
  for (const o of outcomes.filter((x) => x.status === "failed" || x.status === "needs_revision")) {
    const key = `${o.source}:${o.domain}`;
    const item = counts.get(key) ?? { source: o.source, domain: o.domain, count: 0 };
    item.count += 1;
    counts.set(key, item);
  }
  return [...counts.values()]
    .filter((x) => x.count >= 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((x) => ({
      source: x.source,
      domain: x.domain,
      count: x.count,
      summary: `${x.count} ${x.source.replaceAll("_", " ")} outcome(s) failed or needed revision in ${x.domain.replaceAll("_", " ")}.`,
      recommendedAdjustment: "Require human correction notes before recommending this pattern again.",
    }));
}

export function ensureRecommendationOutcomeStore(repoRoot?: string): void {
  const p = storePath(repoRoot);
  if (!existsSync(p)) {
    const dir = path.dirname(p);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(p, JSON.stringify(emptyStore(), null, 2), "utf8");
  }
}
