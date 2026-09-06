import { readFileSync } from "node:fs";
import path from "node:path";

import { CHAPTERS, type ChapterRecord } from "@/content/macroscopic-life/catalog";

// The public Macroscopic Life reader now resolves directly from the canonical
// research manuscript layer. This prevents the Netlify site from drifting behind
// the publication-controlled manuscript as Book One moves through production.
const MANUSCRIPT_DIR = path.join(process.cwd(), "research/macroscopic-life/manuscript");

const ACT_SOURCE: Record<ChapterRecord["act"], string> = {
  i: "pub-7l-r1-act-i-redundancy-cut-reader-manuscript.md",
  ii: "pub-7l-r1-act-ii-redundancy-cut-reader-manuscript.md",
  iii: "pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md",
  iv: "pub-7l-r1-act-iv-redundancy-cut-reader-manuscript.md",
  v: "pub-7l-r1-act-v-redundancy-cut-reader-manuscript.md",
};

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
  const source = stripEditorialLog(readSource(ACT_SOURCE.i));
  const act = source.search(/^# ACT /m);
  return (act > 0 ? source.slice(0, act) : source).trim();
}

export function loadChapterMarkdown(chapter: ChapterRecord): string {
  const source = readSource(ACT_SOURCE[chapter.act]);
  return extractByChapterHeading(source, chapter.number);
}

export function loadAllChapters(): { chapter: ChapterRecord; markdown: string }[] {
  return CHAPTERS.map((chapter) => ({ chapter, markdown: loadChapterMarkdown(chapter) }));
}
