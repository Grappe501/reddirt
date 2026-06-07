import { readFile } from "fs/promises";
import path from "node:path";
import { findMovementPhilosophyEntry } from "./movement-philosophy-nav";

const DOCS_DIR = "docs";

export type MovementPhilosophyMarkdownLoadResult =
  | { kind: "doc"; markdown: string; sourceFile: string; pathKey: string }
  | { kind: "absent" }
  | { kind: "error"; sourceFile: string; message: string; pathKey: string };

/** Load markdown from `docs/` movement philosophy corpus by pathKey. */
export async function loadMovementPhilosophyMarkdown(pathKey: string): Promise<MovementPhilosophyMarkdownLoadResult> {
  const entry = findMovementPhilosophyEntry(pathKey);
  if (!entry) return { kind: "absent" };

  const full = path.join(process.cwd(), DOCS_DIR, entry.sourceFile);
  try {
    const markdown = await readFile(full, "utf8");
    return { kind: "doc", markdown, sourceFile: entry.sourceFile, pathKey: entry.pathKey };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown read error";
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return { kind: "absent" };
    }
    return { kind: "error", sourceFile: entry.sourceFile, message, pathKey: entry.pathKey };
  }
}
