import path from "node:path";
import { existsSync } from "node:fs";
import type { ForumTranscriptLabRecord } from "@/lib/intelligence/v4/forumTranscriptLab";

/** Resolve repo-relative local video path to absolute, or null if missing. */
export function resolveForumLocalVideoAbsolute(record: ForumTranscriptLabRecord): string | null {
  const rel = record.localVideoRelativePath?.trim();
  if (!rel) return null;
  const abs = path.resolve(process.cwd(), rel.replace(/\//g, path.sep));
  const cwd = path.resolve(process.cwd());
  if (!abs.startsWith(cwd)) return null;
  if (!existsSync(abs)) return null;
  return abs;
}
