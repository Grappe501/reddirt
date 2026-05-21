import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

export type WritingStyleObservation = {
  id: string;
  at: string;
  source: "accepted_edit" | "explicit_note" | "rejected_suggestion";
  field?: string;
  audience?: string;
  beforeSnippet?: string;
  afterSnippet?: string;
  note?: string;
};

const REL = "data/campaign-events/writing-style-observations.json";

function filePath(repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), REL);
}

export function loadWritingStyleObservations(repoRoot?: string): WritingStyleObservation[] {
  const p = filePath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function appendWritingStyleObservation(
  obs: Omit<WritingStyleObservation, "id" | "at">,
  repoRoot?: string,
): WritingStyleObservation {
  const p = filePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const prev = loadWritingStyleObservations(repoRoot);
  const full: WritingStyleObservation = {
    ...obs,
    id: `wso_${Date.now().toString(36)}`,
    at: new Date().toISOString(),
  };
  writeFileSync(p, JSON.stringify([...prev, full].slice(-200), null, 2), "utf8");
  return full;
}
