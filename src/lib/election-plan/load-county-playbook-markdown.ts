import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** Load Chapter 9 county playbook markdown (tables + missions — not snapshot bullets). */
export function loadCountyPlaybookMarkdown(playbookPath: string): string | null {
  if (!playbookPath?.trim()) return null;
  const resolved = path.normalize(path.join(process.cwd(), playbookPath));
  const root = path.normalize(path.join(process.cwd(), "docs/strategic-plan"));
  if (!resolved.startsWith(root)) return null;
  if (!existsSync(resolved)) return null;
  return readFileSync(resolved, "utf8");
}
