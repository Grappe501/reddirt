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
import { getCountyPartySearchChunks } from "../../src/lib/election-plan/load-county-party-intelligence";
import { getAllImmersionCountyMissions } from "../../src/lib/election-plan/load-immersion-county-missions";
import { getArkansasCampuses, getFreshmanWeekReadinessRollup } from "../../src/lib/election-plan/load-movement-infrastructure";
import { primaryNavGroups } from "../../src/config/navigation";

type SearchEntry = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  type: string;
  sourcePath: string;
  sourcePublicUrl?: string;
  keywords: string[];
};

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/election-plan/election-plan-search-index.json");

const EXEC_BOOK_FILE_TO_HREF = new Map(
  EXECUTIVE_BOOK_CHAPTERS.map((ch) => [ch.markdownFile, ch.href]),
);

const BRIEF_TYPE_MAP: Record<string, string> = {
  "executive-book-hub": "Executive Book",
  "executive-book-chapter": "Executive Book",
  "county-victory-targets": "County",
  "county-playbook": "County",
  "city-brief": "City",
  "conversation-strategy": "Message",
  "budget-dashboard": "Budget",
  "campus-hub": "Campus",
  "freshman-week": "Campus",
  "forward-motion-stop": "Calendar",
  "forward-motion-tab": "Calendar",
  "field-calendar": "Calendar",
  "field-calendar-tab": "Calendar",
  "direct-democracy": "Message",
  "power-of-5": "Message",
  "searcy-trust": "Leadership",
  "academy-hub": "Academy",
  "academy-role": "Academy",
};

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
        const chapterHref = EXEC_BOOK_FILE_TO_HREF.get(name);
        const isDoctrine = name.startsWith("00-CAMPAIGN-DOCTRINE");
        entries.push({
          id: `md:${rel}`,
          title,
          href: chapterHref ?? (rel.includes("executive-book-v1") ? "/election-plan/executive-book" : "/election-plan"),
          excerpt: excerpt(raw),
          type: isDoctrine ? "Doctrine" : type,
          sourcePath: rel,
          keywords: [
            ...title.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
            ...(isDoctrine ? ["campaign doctrine", "arkansas way to win", "open doors", "movement"] : []),
          ],
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
    const href = brief.pathPattern.startsWith("/")
      ? brief.tabPattern
        ? `${brief.pathPattern}?tab=${brief.tabPattern}`
        : brief.pathPattern
      : `/election-plan/${brief.pathPattern}`;
    entries.push({
      id: `brief:${brief.id}`,
      title: brief.title,
      href,
      excerpt: brief.answers,
      type: BRIEF_TYPE_MAP[brief.id] ?? "Election Plan",
      sourcePath: "data/campaign-brain/election-plan/page-briefs.source.json",
      keywords: [...(brief.searchKeywords ?? []), brief.title.toLowerCase(), brief.id],
    });
  }

  for (const ch of EXECUTIVE_BOOK_CHAPTERS) {
    const entryType =
      ch.slug === "doctrine"
        ? "Doctrine"
        : ch.slug === "budget"
          ? "Budget"
          : ch.slug === "message"
            ? "Message"
            : ch.slug === "power-of-5"
              ? "Message"
              : "Executive Book";
    entries.push({
      id: `eb:${ch.slug}`,
      title: `Ch. ${ch.number}: ${ch.title}`,
      href: ch.href,
      excerpt: ch.subtitle,
      type: entryType,
      sourcePath: `docs/strategic-plan/plurality-victory-plan/executive-book-v1/${ch.markdownFile}`,
      keywords: [ch.slug, ch.title.toLowerCase(), "executive book", "chapter", ...(ch.slug === "doctrine" ? ["campaign doctrine", "open doors", "movement"] : [])],
    });
  }

  const highGrowthCounties = getAllCountyVictoryTargets().filter((c) => c.percentIncrease >= 20);
  if (highGrowthCounties.length > 0) {
    entries.push({
      id: "aggregate:counties-20pct",
      title: "Counties needing 20%+ vote increase",
      href: "/election-plan/county-victory-targets",
      excerpt: `${highGrowthCounties.length} counties need 20% or more Democratic vote growth: ${highGrowthCounties
        .slice(0, 10)
        .map((c) => c.county)
        .join(", ")}${highGrowthCounties.length > 10 ? "…" : ""}`,
      type: "County",
      sourcePath: "data/election/kelly-win-target-scenario-v1.json",
      keywords: ["20%", "20 percent", "percent increase", "high growth", "counties", "victory targets"],
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

  for (const chunk of getCountyPartySearchChunks()) {
    entries.push({
      id: chunk.id,
      title: chunk.title,
      href: chunk.href,
      excerpt: chunk.content.slice(0, 280),
      type: "County Party",
      sourcePath: chunk.sourcePath,
      sourcePublicUrl: chunk.sourceUrl ?? undefined,
      keywords: [...chunk.keywords, "county chair", "arkdems", "county party meeting"],
    });
  }

  for (const mission of getAllImmersionCountyMissions()) {
    entries.push({
      id: `immersion-mission:${mission.id}`,
      title: `${mission.community} · ${mission.headline}`,
      href: mission.href ?? `/election-plan/immersion-missions`,
      excerpt: `${mission.tagline} · Success: ${mission.successMetric}`,
      type: "Doctrine",
      sourcePath: "data/campaign-brain/election-plan/immersion-county-missions.source.json",
      keywords: [
        mission.community.toLowerCase(),
        mission.headline.toLowerCase(),
        mission.countySlug,
        "immersion mission",
        "campaign doctrine",
        "one mission",
      ],
    });
  }

  const freshman = getFreshmanWeekReadinessRollup();
  entries.push({
    id: "freshman-week-hub",
    title: "Freshman Week Readiness",
    href: "/election-plan/campuses/freshman-week",
    excerpt: `${freshman.summary.fullyReady}/${freshman.summary.total} campuses fully ready · target ${freshman.targetDate} · Labor Day gate ${freshman.laborDayGate}`,
    type: "Campus",
    sourcePath: "data/campaign-brain/movement-infrastructure/freshman-week-readiness.source.json",
    keywords: ["freshman week", "campus", "move-in", "registration", "august", "college"],
  });

  for (const campus of getArkansasCampuses()) {
    entries.push({
      id: `campus:${campus.slug}`,
      title: `${campus.shortName} · Campus`,
      href: `/election-plan/campuses/${campus.slug}`,
      excerpt: `${campus.city}, ${campus.county} County · captain ${campus.campusCaptainStatus} · reg goal ${campus.registrationGoal.toLocaleString()}`,
      type: "Campus",
      sourcePath: "data/campaign-brain/movement-infrastructure/arkansas-campuses.source.json",
      keywords: [
        campus.name.toLowerCase(),
        campus.shortName.toLowerCase(),
        campus.city.toLowerCase(),
        "campus",
        "freshman week",
        campus.freshmanWeekOpportunity ? "freshman week" : "",
      ].filter(Boolean),
    });
  }

  const snapshotPath = path.join(ROOT, "data/election-plan/election-plan-workbench.snapshot.json");
  if (existsSync(snapshotPath)) {
    const snap = JSON.parse(readFileSync(snapshotPath, "utf8")) as {
      cities?: Array<{ name: string; slug: string; county: string; targetVotes: number }>;
      forwardMotion?: {
        stops?: Array<{
          eventId: string;
          eventName: string;
          county: string;
          city: string | null;
          date: string;
        }>;
      };
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

    for (const stop of snap.forwardMotion?.stops ?? []) {
      entries.push({
        id: `fm:${stop.eventId}`,
        title: stop.eventName,
        href: `/election-plan/forward-motion/${encodeURIComponent(stop.eventId)}`,
        excerpt: `${stop.county}${stop.city && stop.city !== "TBD" ? ` · ${stop.city}` : ""} · ${stop.date} · Forward Motion stop command center`,
        type: "Calendar",
        sourcePath: "data/election-plan/election-plan-workbench.snapshot.json",
        keywords: [
          stop.eventName.toLowerCase(),
          stop.county.toLowerCase(),
          stop.city?.toLowerCase() ?? "",
          "forward motion",
          "kelly stop",
          "field",
        ].filter(Boolean),
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
