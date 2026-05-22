import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CampaignLesson } from "./campaign-lessons-types";

const REL = "data/campaign-events/campaign-knowledge/lessons.json";

function filePath(repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), REL);
}

export function loadCampaignLessons(repoRoot?: string): CampaignLesson[] {
  const p = filePath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(raw?.lessons) ? raw.lessons : Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function save(lessons: CampaignLesson[], repoRoot?: string) {
  const p = filePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify({ lessons: lessons.slice(-200) }, null, 2), "utf8");
}

export function upsertCampaignLesson(
  partial: Omit<CampaignLesson, "id" | "createdAt" | "updatedAt"> & { id?: string },
  repoRoot?: string,
): CampaignLesson {
  const lessons = loadCampaignLessons(repoRoot);
  const now = new Date().toISOString();
  const existing = partial.id ? lessons.find((l) => l.id === partial.id) : undefined;
  if (existing) {
    const updated = { ...existing, ...partial, updatedAt: now };
    save(lessons.map((l) => (l.id === existing.id ? updated : l)), repoRoot);
    return updated;
  }
  const lesson: CampaignLesson = {
    id: partial.id ?? `lesson_${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
  save([...lessons, lesson], repoRoot);
  return lesson;
}

export function setCampaignLessonStatus(
  id: string,
  status: CampaignLesson["status"],
  repoRoot?: string,
): CampaignLesson | null {
  const lessons = loadCampaignLessons(repoRoot);
  const idx = lessons.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  lessons[idx] = { ...lessons[idx], status, updatedAt: new Date().toISOString() };
  save(lessons, repoRoot);
  return lessons[idx];
}
