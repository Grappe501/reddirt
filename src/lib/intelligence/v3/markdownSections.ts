import fs from "node:fs";
import path from "node:path";

export type V3MarkdownSection = {
  heading: string;
  bullets: string[];
  paragraphs: string[];
};

const ROOT = process.cwd();

export function readMarkdownSections(relPath: string): V3MarkdownSection[] {
  try {
    const text = fs.readFileSync(path.join(ROOT, relPath), "utf8");
    return parseMarkdownSections(text);
  } catch {
    return [];
  }
}

export function sectionBulletsFromMarkdown(relPath: string, heading: string): string[] {
  const section = readMarkdownSections(relPath).find(
    (row) => row.heading.toLowerCase() === heading.toLowerCase(),
  );
  return section?.bullets ?? [];
}

function parseMarkdownSections(markdown: string): V3MarkdownSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: V3MarkdownSection[] = [];
  let current: V3MarkdownSection | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), bullets: [], paragraphs: [] };
      continue;
    }
    if (!current) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("- ")) {
      current.bullets.push(trimmed.slice(2).trim());
    } else if (!trimmed.startsWith("#") && !trimmed.startsWith("|")) {
      current.paragraphs.push(trimmed);
    }
  }
  if (current) sections.push(current);
  return sections;
}
