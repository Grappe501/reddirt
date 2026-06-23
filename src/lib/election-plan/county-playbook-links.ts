/** Client-safe county playbook routes — no node:fs (safe for ElectionPlanWorkbench client bundle). */

export function normalizeCountySlug(slug: string): string {
  return slug.trim().replace(/-county$/, "");
}

export function countyDropOffHref(countySlug: string): string {
  return `/election-plan/counties/${normalizeCountySlug(countySlug)}/drop-off`;
}

export function countyRegistrationDashboardHref(countySlug: string): string {
  return `/election-plan/counties/${normalizeCountySlug(countySlug)}/registration-dashboard`;
}

export function countyPathToVictoryHref(countySlug: string): string {
  return `/election-plan/counties/${normalizeCountySlug(countySlug)}/path-to-victory`;
}

export function cityPathToVictoryHref(citySlug: string): string {
  return `/election-plan/cities/${citySlug}/path-to-victory`;
}

export const COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS = {
  pathToVictory: "/election-plan/executive-book/path-to-victory",
  countyVictoryTargets: "/election-plan/executive-book/county-victory-targets",
  voterEngagement: "/election-plan/executive-book/voter-engagement",
  registrationGoalsOs: "/election-plan/registration-goals",
  countyStrategy: "/election-plan/executive-book/county-strategy",
} as const;

/** Resolve relative plurality-plan markdown links from county playbooks. */
export function resolveCountyPlaybookMarkdownHref(href: string): string | null {
  const normalized = href.replace(/\\/g, "/");
  const ch4 = normalized.match(/chapter-04-democratic-drop-off\/counties\/([a-z0-9-]+)-county\.md/i);
  if (ch4?.[1]) return countyDropOffHref(ch4[1]);
  const ch5 = normalized.match(/chapter-05-fifty-thousand-new-voter-plan\/counties\/([a-z0-9-]+)-county\.md/i);
  if (ch5?.[1]) return countyRegistrationDashboardHref(ch5[1]);
  const cityCh7 = normalized.match(/chapter-07-top-40-city-strategy\/cities\/([a-z0-9-]+)\.md/i);
  if (cityCh7?.[1]) return `/election-plan/cities/${cityCh7[1]}`;
  const countyCh9 = normalized.match(/chapter-09-seventy-five-county-playbook\/counties\/([a-z0-9-]+)-county\.md/i);
  if (countyCh9?.[1]) return `/election-plan/counties/${countyCh9[1].replace(/-county$/, "")}`;
  return null;
}

export function countyPlaybookBundleMetaFromJson(bundle: {
  generatedAt?: string;
  countyCount?: number;
}): { generatedAt: string | null; countyCount: number } {
  return {
    generatedAt: bundle.generatedAt ?? null,
    countyCount: bundle.countyCount ?? 0,
  };
}
