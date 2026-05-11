import { readFile } from "fs/promises";
import path from "path";

import { FIELD_PLAYBOOK_MANUAL_DIR, getFieldPlaybookMarkdownFilename } from "./md-manifest";

export type FieldPlaybookMarkdownLoadResult =
  | { kind: "doc"; markdown: string; sourceFile: string }
  | { kind: "absent" }
  | { kind: "error"; sourceFile: string; message: string };

export async function loadFieldPlaybookMarkdown(pathKey: string): Promise<FieldPlaybookMarkdownLoadResult> {
  const filename = getFieldPlaybookMarkdownFilename(pathKey);
  if (!filename) return { kind: "absent" };
  const full = path.join(process.cwd(), FIELD_PLAYBOOK_MANUAL_DIR, filename);
  try {
    const markdown = await readFile(full, "utf8");
    return { kind: "doc", markdown, sourceFile: filename };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown read error";
    return { kind: "error", sourceFile: filename, message };
  }
}
