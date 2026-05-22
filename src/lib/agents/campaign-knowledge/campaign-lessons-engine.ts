/**
 * Lessons Engine — rank, freshness, usefulness; human approval required for persist.
 */

import type { CampaignLesson, CampaignLessonFreshness, CampaignLessonRef } from "./campaign-lessons-types";
import { loadCampaignLessons, upsertCampaignLesson } from "./campaign-lessons-store";
import type { ObservationIntakeResult } from "./campaign-observation-intake";

function computeFreshness(updatedAt: string): CampaignLessonFreshness {
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  const days = ageMs / (1000 * 60 * 60 * 24);
  if (days <= 14) return "fresh";
  if (days <= 60) return "aging";
  return "stale";
}

export function rankCampaignLessons(lessons: CampaignLesson[]): CampaignLesson[] {
  return [...lessons].sort((a, b) => {
    const score = (l: CampaignLesson) =>
      l.usefulnessScore + (l.confidence === "high" ? 20 : l.confidence === "medium" ? 10 : 0) + (l.status === "approved" ? 15 : 0);
    return score(b) - score(a);
  });
}

export function toLessonRef(lesson: CampaignLesson): CampaignLessonRef {
  return {
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    domainId: lesson.domainId,
    confidence: lesson.confidence,
    usefulnessScore: lesson.usefulnessScore,
  };
}

export function ingestLessonCandidates(
  candidates: ObservationIntakeResult["lessonCandidates"],
  repoRoot?: string,
): CampaignLesson[] {
  const existing = loadCampaignLessons(repoRoot);
  const existingTitles = new Set(existing.map((l) => l.title));
  const added: CampaignLesson[] = [];

  for (const c of candidates) {
    if (existingTitles.has(c.title)) continue;
    const lesson = upsertCampaignLesson(c, repoRoot);
    added.push(lesson);
    existingTitles.add(c.title);
  }

  return added;
}

export function refreshLessonFreshness(repoRoot?: string): CampaignLesson[] {
  const lessons = loadCampaignLessons(repoRoot);
  return lessons.map((l) => ({
    ...l,
    freshness: computeFreshness(l.updatedAt),
  }));
}

export function getStrongestLessons(limit = 5, repoRoot?: string): CampaignLessonRef[] {
  const lessons = refreshLessonFreshness(repoRoot);
  return rankCampaignLessons(lessons.filter((l) => l.status === "approved" || l.status === "proposed"))
    .slice(0, limit)
    .map(toLessonRef);
}

export function detectEmergingPatterns(lessons: CampaignLesson[]): string[] {
  const byDomain = new Map<string, number>();
  for (const l of lessons) {
    if (l.lessonType === "pattern" || l.lessonType === "what_failed") {
      byDomain.set(l.domainId, (byDomain.get(l.domainId) ?? 0) + 1);
    }
  }
  return [...byDomain.entries()]
    .filter(([, n]) => n >= 2)
    .map(([d, n]) => `${n} pattern lessons emerging in ${d.replaceAll("_", " ")}`);
}

export function detectRecurringBlockerPatterns(blockerMessages: string[]): string[] {
  const counts = new Map<string, number>();
  for (const m of blockerMessages) {
    const key = m.slice(0, 50);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .map(([msg, n]) => `Recurring blocker (${n}×): ${msg}`);
}
