import { readFileSync } from "node:fs";
import path from "node:path";

import { CHAPTERS, type ChapterRecord } from "@/content/macroscopic-life/catalog";

const MANUSCRIPT_DIR = path.join(process.cwd(), "src/content/macroscopic-life/manuscript");

function readSource(file: string): string {
  return readFileSync(path.join(MANUSCRIPT_DIR, file), "utf8");
}

function stripEditorialLog(markdown: string): string {
  return markdown.replace(/\n# PUB-[\s\S]*$/m, "").trim();
}

function extractByChapterHeading(markdown: string, chapter: number): string {
  const cleaned = stripEditorialLog(markdown);
  const start = cleaned.search(new RegExp(`^#{1,3}\\s+Chapter ${chapter}\\b`, "im"));
  if (start < 0) {
    throw new Error(`Chapter ${chapter} heading not found`);
  }
  const fromStart = cleaned.slice(start);
  const next = fromStart.search(new RegExp(`\\n#{1,3}\\s+(Chapter ${chapter + 1}\\b|ACT\\s|PUB-)`, "i"));
  return (next > 0 ? fromStart.slice(0, next) : fromStart).trim();
}

export function loadOpening(): string {
  return stripEditorialLog(readSource("00-opening.md"));
}

export function loadFrontMatter(): string {
  const source = stripEditorialLog(readSource("pub-7c-front-matter-chapters-1-3-controlled-editorial-hardening.md"));
  const act = source.search(/^# ACT /m);
  return (act > 0 ? source.slice(0, act) : source).trim();
}

export function loadChapterMarkdown(chapter: ChapterRecord): string {
  const source = readSource(chapter.source.file);
  if (chapter.source.chapter === "file") {
    return stripEditorialLog(source);
  }
  return extractByChapterHeading(source, chapter.source.chapter);
}

export function loadAllChapters(): { chapter: ChapterRecord; markdown: string }[] {
  return CHAPTERS.map((chapter) => ({ chapter, markdown: loadChapterMarkdown(chapter) }));
}
