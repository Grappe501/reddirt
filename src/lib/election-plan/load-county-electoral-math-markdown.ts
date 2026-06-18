import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import bundled from "../../../data/election-plan/county-electoral-math-markdown.json";

type ElectoralMathBundle = {
  version: number;
  generatedAt: string;
  dropOffBySlug: Record<string, string>;
  registrationBySlug: Record<string, string>;
};

const bundle = bundled as ElectoralMathBundle;

const CH4_DISK = path.join(
  process.cwd(),
  "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math/chapter-04-democratic-drop-off/counties",
);
const CH5_DISK = path.join(
  process.cwd(),
  "docs/strategic-plan/plurality-victory-plan/part-ii-electoral-math/chapter-05-fifty-thousand-new-voter-plan/counties",
);

function normalizeCountySlug(slug: string): string {
  return slug.trim().replace(/-county$/, "");
}

function readDisk(dir: string, slug: string): string | null {
  const file = path.join(dir, `${normalizeCountySlug(slug)}-county.md`);
  if (!existsSync(file)) return null;
  return readFileSync(file, "utf8");
}

export function loadCountyDropOffMarkdown(countySlug: string): string | null {
  const key = normalizeCountySlug(countySlug);
  const fromBundle = bundle.dropOffBySlug[key]?.trim();
  if (fromBundle) return fromBundle;
  return readDisk(CH4_DISK, key)?.trim() ?? null;
}

export function loadCountyRegistrationDashboardMarkdown(countySlug: string): string | null {
  const key = normalizeCountySlug(countySlug);
  const fromBundle = bundle.registrationBySlug[key]?.trim();
  if (fromBundle) return fromBundle;
  return readDisk(CH5_DISK, key)?.trim() ?? null;
}

export function countyDropOffHref(countySlug: string): string {
  return `/election-plan/counties/${normalizeCountySlug(countySlug)}/drop-off`;
}

export function countyRegistrationDashboardHref(countySlug: string): string {
  return `/election-plan/counties/${normalizeCountySlug(countySlug)}/registration-dashboard`;
}

/** Resolve relative plurality-plan markdown links from county playbooks. */
export function resolveCountyPlaybookMarkdownHref(href: string): string | null {
  const normalized = href.replace(/\\/g, "/");
  const ch4 = normalized.match(/chapter-04-democratic-drop-off\/counties\/([a-z0-9-]+)-county\.md/i);
  if (ch4?.[1]) return countyDropOffHref(ch4[1]);
  const ch5 = normalized.match(/chapter-05-fifty-thousand-new-voter-plan\/counties\/([a-z0-9-]+)-county\.md/i);
  if (ch5?.[1]) return countyRegistrationDashboardHref(ch5[1]);
  return null;
}

export const COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS = {
  pathToVictory: "/election-plan/executive-book/path-to-victory",
  countyVictoryTargets: "/election-plan/executive-book/county-victory-targets",
  voterEngagement: "/election-plan/executive-book/voter-engagement",
  registrationGoalsOs: "/election-plan/registration-goals",
  countyStrategy: "/election-plan/executive-book/county-strategy",
} as const;
