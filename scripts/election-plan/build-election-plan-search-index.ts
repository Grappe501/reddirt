/**
 * Build local Election Plan search index (18.7H).
 * Corpus: election-plan pages, executive book, strategic plan, campaign brain — no admin/private data.
 *
 * Run: npm run election-plan:search:build
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import { EXECUTIVE_BOOK_CHAPTERS } from "../../src/lib/election-plan/executiveBookChapters";
import {
  ELECTION_PLAN_SEARCH_PUBLIC_ROUTE_PREFIXES,
  isElectionPlanSearchExcluded,
} from "../../src/lib/election-plan/election-plan-search-exclusions";
import { getAllCountyVictoryTargets } from "../../src/lib/election-plan/load-county-victory-targets";
import { getAllPageBriefEntries } from "../../src/lib/election-plan/load-page-briefs";
import { primaryNavGroups } from "../../src/config/navigation";

type SearchEntry = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  type: string;
  sourcePath: string;
  keywords: string[];
};

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/election-plan/election-plan-search-index.json");

function stripMd(text: string): string {
  return text
    .replace(/^#+\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text: string, max = 220): string {
  const clean = stripMd(text);
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

function walkMarkdown(dir: string, type: string, entries: SearchEntry[]): void {
  if (!existsSync(dir)) return;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const name of readdirSync(current)) {
      const full = path.join(current, name);
      const rel = path.relative(ROOT, full).replace(/\\/g, "/");
      if (isElectionPlanSearchExcluded(rel)) continue;
      const st = statSync(full);
      if (st.isDirectory()) {
        stack.push(full);
      } else if (name.endsWith(".md")) {
        const raw = readFileSync(full, "utf8");
        const titleMatch = raw.match(/^#\s+(.+)$/m);
        const title = titleMatch ? stripMd(titleMatch[1]!) : name.replace(/\.md$/, "");
        entries.push({
          id: `md:${rel}`,
          title,
          href: rel.includes("executive-book-v1") ? `/election-plan/executive-book` : "/election-plan",
          excerpt: excerpt(raw),
          type,
          sourcePath: rel,
          keywords: title.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
        });
      }
    }
  }
}

function addPublicRoutes(entries: SearchEntry[]): void {
  for (const group of primaryNavGroups) {
    const items = group.groupLandingHref
      ? [{ label: group.label, href: group.groupLandingHref }, ...group.items]
      : group.items;
    for (const item of items) {
      if (!ELECTION_PLAN_SEARCH_PUBLIC_ROUTE_PREFIXES.some((p) => item.href.startsWith(p))) continue;
      entries.push({
        id: `route:${item.href}`,
        title: item.label,
        href: item.href,
        excerpt: `Public campaign page · ${group.label}`,
        type: "Public Website",
        sourcePath: "src/config/navigation.ts",
        keywords: [item.label.toLowerCase(), group.label.toLowerCase(), "public"],
      });
    }
  }
}

function main(): void {
  const entries: SearchEntry[] = [];

  for (const brief of getAllPageBriefEntries()) {
    entries.push({
      id: `brief:${brief.id}`,
      title: brief.title,
      href: brief.pathPattern.startsWith("/") ? brief.pathPattern : `/election-plan/${brief.pathPattern}`,
      excerpt: brief.answers,
      type: "Election Plan",
      sourcePath: "data/campaign-brain/election-plan/page-briefs.source.json",
      keywords: [...(brief.searchKeywords ?? []), brief.title.toLowerCase()],
    });
  }

  for (const ch of EXECUTIVE_BOOK_CHAPTERS) {
    entries.push({
      id: `eb:${ch.slug}`,
      title: `Ch. ${ch.number}: ${ch.title}`,
      href: ch.href,
      excerpt: ch.subtitle,
      type: "Executive Book",
      sourcePath: `docs/strategic-plan/plurality-victory-plan/executive-book-v1/${ch.markdownFile}`,
      keywords: [ch.slug, ch.title.toLowerCase(), "executive book", "chapter"],
    });
  }

  for (const county of getAllCountyVictoryTargets()) {
    entries.push({
      id: `county:${county.slug}`,
      title: `${county.county} County Playbook`,
      href: `/election-plan/counties/${county.slug}`,
      excerpt: `Need +${county.growthNeeded.toLocaleString()} votes (${county.percentIncrease.toFixed(1)}% increase) · ${county.powerOf5LeadersNeeded} Po5 leaders · weekly ${county.weeklyVoteGoal} votes`,
      type: "County",
      sourcePath: "data/election/kelly-win-target-scenario-v1.json",
      keywords: [
        county.county.toLowerCase(),
        "county",
        "playbook",
        `${Math.round(county.percentIncrease)}%`,
        county.percentIncrease >= 20 ? "20% increase" : "",
        county.isStrategic ? "strategic county" : "",
      ].filter(Boolean),
    });
  }

  walkMarkdown(
    path.join(ROOT, "docs/strategic-plan/plurality-victory-plan/executive-book-v1"),
    "Executive Book",
    entries,
  );
  walkMarkdown(path.join(ROOT, "docs/strategic-plan/plurality-victory-plan"), "Strategic Plan", entries);
  walkMarkdown(path.join(ROOT, "docs/campaign-brain"), "Campaign Brain", entries);

  addPublicRoutes(entries);

  const snapshotPath = path.join(ROOT, "data/election-plan/election-plan-workbench.snapshot.json");
  if (existsSync(snapshotPath)) {
    const snap = JSON.parse(readFileSync(snapshotPath, "utf8")) as {
      cities?: Array<{ name: string; slug: string; county: string; targetVotes: number }>;
    };
    for (const city of snap.cities ?? []) {
      entries.push({
        id: `city:${city.slug}`,
        title: `${city.name} · City Brief`,
        href: `/election-plan/cities/${city.slug}`,
        excerpt: `${city.county} County · ${city.targetVotes.toLocaleString()} vote target`,
        type: "City",
        sourcePath: "data/election-plan/election-plan-workbench.snapshot.json",
        keywords: [city.name.toLowerCase(), city.county.toLowerCase(), "city", "brief"],
      });
    }
  }

  const deduped = new Map<string, SearchEntry>();
  for (const e of entries) {
    deduped.set(e.id, e);
  }
  const final = [...deduped.values()].sort((a, b) => a.title.localeCompare(b.title));

  writeFileSync(
    OUT,
    JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        entryCount: final.length,
        corpusNote:
          "Local-only index. Excludes admin, voter files, donor data, private contacts, opposition raw.",
        entries: final,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Wrote ${final.length} search entries → ${path.relative(ROOT, OUT)}`);
}

main();
