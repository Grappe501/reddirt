import { readFile } from "fs/promises";
import path from "path";
import { STRATEGY_MANUAL_DIR, getStrategyMarkdownFilename } from "./md-manifest";

export type StrategyMarkdownLoadResult =
  | { kind: "doc"; markdown: string; sourceFile: string }
  | { kind: "absent" }
  | { kind: "error"; sourceFile: string; message: string };

export async function loadStrategyMarkdown(pathKey: string): Promise<StrategyMarkdownLoadResult> {
  const filename = getStrategyMarkdownFilename(pathKey);
  if (!filename) return { kind: "absent" };
  const full = path.join(process.cwd(), STRATEGY_MANUAL_DIR, filename);
  try {
    const markdown = await readFile(full, "utf8");
    return { kind: "doc", markdown, sourceFile: filename };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown read error";
    return { kind: "error", sourceFile: filename, message };
  }
}
