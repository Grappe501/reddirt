import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import bundled from "../../../data/election-plan/county-playbook-markdown.json";

type PlaybookBundle = {
  version: number;
  generatedAt: string;
  countyCount: number;
  missing?: string[];
  bySlug: Record<string, string>;
};

const bundle = bundled as PlaybookBundle;

function normalizeCountySlug(slug: string): string {
  return slug.trim().replace(/-county$/, "");
}

/** Production path — bundled at `npm run election-plan:build`. */
export function getCountyPlaybookMarkdownFromBundle(countySlug: string): string | null {
  const key = normalizeCountySlug(countySlug);
  const md = bundle.bySlug[key];
  return md?.trim() ? md : null;
}

/** Dev fallback — read Chapter 9 markdown from docs when bundle is stale or missing a county. */
export function loadCountyPlaybookMarkdownFromDisk(playbookPath: string): string | null {
  if (!playbookPath?.trim()) return null;
  const resolved = path.normalize(path.join(process.cwd(), playbookPath));
  const root = path.normalize(path.join(process.cwd(), "docs/strategic-plan"));
  if (!resolved.startsWith(root)) return null;
  if (!existsSync(resolved)) return null;
  return readFileSync(resolved, "utf8");
}

/**
 * Load county playbook prose for `/election-plan/counties/{slug}`.
 * Prefer bundled JSON (Netlify-safe); fall back to docs/ in local dev.
 */
export function loadCountyPlaybookMarkdown(
  countySlug: string,
  playbookPath?: string,
): string | null {
  const fromBundle = getCountyPlaybookMarkdownFromBundle(countySlug);
  if (fromBundle) return fromBundle;
  if (playbookPath) return loadCountyPlaybookMarkdownFromDisk(playbookPath);
  return null;
}

export function countyPlaybookBundleMeta(): Pick<PlaybookBundle, "generatedAt" | "countyCount"> {
  return { generatedAt: bundle.generatedAt, countyCount: bundle.countyCount };
}
