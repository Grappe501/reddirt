import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import bundled from "../../../data/election-plan/county-electoral-math-markdown.json";

import {
  countyDropOffHref,
  countyRegistrationDashboardHref,
  normalizeCountySlug,
  resolveCountyPlaybookMarkdownHref,
} from "@/lib/election-plan/county-playbook-links";

export {
  countyDropOffHref,
  countyRegistrationDashboardHref,
  COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS,
  resolveCountyPlaybookMarkdownHref,
} from "@/lib/election-plan/county-playbook-links";

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

export function countyElectoralMathBundleMeta(): {
  generatedAt: string | null;
  dropOffCount: number;
  registrationCount: number;
} {
  return {
    generatedAt: bundle.generatedAt ?? null,
    dropOffCount: Object.keys(bundle.dropOffBySlug ?? {}).length,
    registrationCount: Object.keys(bundle.registrationBySlug ?? {}).length,
  };
}
