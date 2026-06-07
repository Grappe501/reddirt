import { readFile } from "fs/promises";
import path from "node:path";
import { CAMPAIGN_SYSTEM_MANUAL_DIR } from "./md-manifest";

export type CampaignSystemMarkdownLoadResult =
  | { kind: "doc"; markdown: string; sourceFile: string; pathKey: string }
  | { kind: "absent" }
  | { kind: "error"; sourceFile: string; message: string; pathKey: string };

/** Load markdown from `campaign-system-manual/` by relative path key (no `.md` suffix). */
export async function loadCampaignSystemMarkdown(pathKey: string): Promise<CampaignSystemMarkdownLoadResult> {
  const normalized = pathKey.replace(/^\/+|\/+$/g, "");
  const sourceFile = normalized ? `${normalized}.md` : "README.md";
  const full = path.join(process.cwd(), CAMPAIGN_SYSTEM_MANUAL_DIR, sourceFile);
  try {
    const markdown = await readFile(full, "utf8");
    return { kind: "doc", markdown, sourceFile, pathKey: normalized || "README" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown read error";
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return { kind: "absent" };
    }
    return { kind: "error", sourceFile, message, pathKey: normalized };
  }
}
