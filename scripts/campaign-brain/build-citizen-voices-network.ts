/**
 * Citizen Voices Network — Arkansas Citizen Voices Project.
 * Earned media volunteer program: letters to the editor, guest columns, local validation.
 *
 * Usage: npm run campaign-brain:citizen-voices:build
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const CV_DATA = path.join(BRAIN_DATA, "citizen-voices");
const CV_DOCS = path.join(BRAIN_ROOT, "citizen-voices");
const PASS = "CITIZEN-VOICES-NETWORK-1.0";
const LABOR_DAY = "2026-09-07";
const ELECTION_DAY = "2026-11-03";

const CONTENT_CATEGORIES = [
  { id: "why-kelly", label: "Why I Support Kelly Grappe", description: "Personal stories" },
  { id: "elections-matter", label: "Why Elections Matter", description: "Civic participation" },
  { id: "local-communities", label: "Why Local Communities Matter", description: "Community-focused content" },
  { id: "small-business", label: "Small Business Voices", description: "Business filing and economic issues" },
  { id: "public-education", label: "Public Education Voices", description: "Teachers, parents, students" },
  { id: "veterans", label: "Veterans Voices", description: "Service and civic responsibility" },
  { id: "faith-community", label: "Faith and Community Voices", description: "Neighbor engagement" },
  { id: "young-arkansas", label: "Young Arkansas Voices", description: "Students and young professionals" },
];

const EDITORIAL_CALENDAR = [
  { day: "Monday", activity: "Issue brief distributed to writers" },
  { day: "Tuesday", activity: "Drafting" },
  { day: "Wednesday", activity: "Review and editing" },
  { day: "Thursday", activity: "Submission day" },
  { day: "Friday", activity: "Publication tracking and amplification" },
];

const SPEND_ALLOCATION_NOTE =
  "Campaign amplification (Substack, Facebook, Instagram, email, website) only after publication.";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

type Writer = {
  id: string;
  name: string;
  county: string;
  city?: string;
  role?: string;
  subjectFocus?: string[];
  status: "prospect" | "active" | "founding" | "inactive";
  recruitedAt?: string;
};

type Submission = {
  id: string;
  writerId: string;
  outletId: string;
  category: string;
  type: "letter" | "guest_column" | "opinion";
  status: "draft" | "review" | "submitted" | "published" | "declined";
  submittedAt?: string;
  publishedAt?: string;
  title?: string;
};

function buildOperatingManual(
  metrics: Record<string, number>,
  outletCounts: Record<number, number>,
): string {
  return `# Citizen Voices Network

> ${PASS} · **Arkansas Citizen Voices Project**

**Not a Kelly promotion team.** A statewide volunteer network where supporters submit letters explaining why they support Kelly, what issues matter to them, or why the Secretary of State's office matters to Arkansas communities.

---

## Why this program exists

One of the highest-ROI volunteer programs because it does three things simultaneously:

1. **Generates earned media**
2. **Creates local validation from community members**
3. **Gives volunteers a meaningful task** that doesn't require canvassing or phone banking

Similar to Power of 5 — except instead of multiplying conversations, you're **multiplying local voices in local media**.

---

## Mission

Build a statewide volunteer network that regularly submits Letters to the Editor, guest columns, community opinion pieces, and local testimonials to Arkansas newspapers, online publications, and community news outlets.

Ensure Arkansas voters regularly hear **authentic voices from their own communities** discussing civic participation, elections, local issues, and support for Kelly Grappe's campaign.

---

## Goals

| Goal | Description |
|------|-------------|
| **Visibility** | Steady presence in local media across Arkansas |
| **Local validation** | Neighbors, teachers, veterans, business owners, retirees, students, clergy, union members, farmers |
| **Volunteer activation** | Role for supporters who cannot canvass, cannot travel, prefer writing, or are community influencers |
| **Geographic coverage** | At least one active writer in every county · multiple writers in high-priority counties |

---

## Leadership targets

| Target | Goal | Deadline |
|--------|-----:|----------|
| Founding writers | **20** | Labor Day (${LABOR_DAY}) |
| Active writers | **50** | October 2026 |
| Letters submitted | **200+** | Election Day (${ELECTION_DAY}) |
| Major media markets | **≥1 published piece/week each** | Sep–Nov 2026 |

---

## Weekly production goals

### Standard week

| Metric | Target |
|--------|-------:|
| Letters submitted | 25 |
| Letters published | 10 |
| Guest columns submitted | 5 |
| Guest columns published | 2 |

### Election season (Sep–Nov)

| Metric | Target |
|--------|-------:|
| Submissions per week | 50+ |
| Publications per week | 20+ |

---

## Organizational structure

| Role | Responsibility |
|------|----------------|
| **State Lead** | Newspaper database · writer recruitment · editorial calendar · submission tracking |
| **Regional Leads** | Review submissions · identify local opportunities |
| **County Writers** | Submit letters and opinion pieces |
| **Subject Matter Writers** | Elections · small business · public education · agriculture · veterans · labor · civic engagement |

---

## Editorial calendar

| Day | Activity |
|-----|----------|
${EDITORIAL_CALENDAR.map((d) => `| ${d.day} | ${d.activity} |`).join("\n")}

---

## Content categories

${CONTENT_CATEGORIES.map((c) => `- **${c.label}** — ${c.description}`).join("\n")}

---

## Distribution tiers

| Tier | Outlets | Notes |
|------|---------|-------|
| **Tier 1** | Largest Arkansas newspapers | ${outletCounts[1] ?? 0} in inventory |
| **Tier 2** | Regional newspapers | ${outletCounts[2] ?? 0} in inventory |
| **Tier 3** | Weekly local newspapers | ${outletCounts[3] ?? 0} in inventory |
| **Tier 4** | Community newsletters & digital pubs | ${outletCounts[4] ?? 0} in inventory |
| **Tier 5** | Campaign amplification | Substack · Facebook · Instagram · email · website — **${SPEND_ALLOCATION_NOTE}** |

---

## Success metrics (live)

| Metric | Current | Goal |
|--------|--------:|-----:|
| Writers recruited | ${metrics.writersRecruited} | 50 active |
| Founding writers | ${metrics.foundingWriters} | 20 by Labor Day |
| Counties represented | ${metrics.countiesRepresented} | 75 |
| Letters submitted | ${metrics.lettersSubmitted} | 200+ |
| Letters published | ${metrics.lettersPublished} | — |
| Guest columns published | ${metrics.guestColumnsPublished} | — |
| Outlets in inventory | ${metrics.outletsTotal} | expand as needed |

Also track: estimated readership · shares · new volunteer inquiries · donor inquiries · event attendees · county contacts.

---

## Data artifacts

| File | Purpose |
|------|---------|
| \`data/campaign-brain/citizen-voices/citizen-voices-network.json\` | Dashboard summary |
| \`data/campaign-brain/citizen-voices/newspaper-inventory.json\` | Arkansas newspaper inventory |
| \`data/campaign-brain/citizen-voices/writer-registry.json\` | Volunteer writer registry |
| \`data/campaign-brain/citizen-voices/submission-queue.json\` | Submission queue |
| \`data/campaign-brain/citizen-voices/publication-tracker.json\` | Published pieces |
| \`data/campaign-brain/citizen-voices/editorial-calendar.json\` | Weekly rhythm |
| \`data/campaign-brain/citizen-voices/county-coverage-map.json\` | County writer coverage |

---

## Rebuild

\`\`\`bash
npm run campaign-brain:citizen-voices:build
npm run election-plan:build
\`\`\`

Election Plan: **People Power** tab · Citizen Voices Network section.
`;
}

function main() {
  mkdirSync(CV_DATA, { recursive: true });
  mkdirSync(CV_DOCS, { recursive: true });

  const newspaperSource = readJson<{ outlets: Array<{ id: string; name: string; tier: number; mediaMarket: string; counties: string[]; submissionType: string; website?: string }> }>(
    path.join(CV_DATA, "newspaper-inventory.source.json"),
  );
  const writerSource = readJson<{ writers: Writer[] }>(path.join(CV_DATA, "writer-registry.source.json"));
  const queueSource = readJson<{ submissions: Submission[] }>(path.join(CV_DATA, "submission-queue.source.json"));

  const outlets = newspaperSource?.outlets ?? [];
  const writers = writerSource?.writers ?? [];
  const submissions = queueSource?.submissions ?? [];

  const outletCounts: Record<number, number> = {};
  for (const o of outlets) {
    outletCounts[o.tier] = (outletCounts[o.tier] ?? 0) + 1;
  }

  const foundingWriters = writers.filter((w) => w.status === "founding" || w.status === "active").length;
  const activeWriters = writers.filter((w) => w.status === "active" || w.status === "founding").length;
  const countiesRepresented = new Set(writers.map((w) => w.county).filter(Boolean)).size;

  const lettersSubmitted = submissions.filter((s) => s.type === "letter").length;
  const lettersPublished = submissions.filter((s) => s.type === "letter" && s.status === "published").length;
  const guestColumnsSubmitted = submissions.filter((s) => s.type === "guest_column").length;
  const guestColumnsPublished = submissions.filter((s) => s.type === "guest_column" && s.status === "published").length;

  const generatedAt = new Date().toISOString();

  const coverageByCounty = new Map<string, number>();
  for (const w of writers) {
    if (w.county) coverageByCounty.set(w.county, (coverageByCounty.get(w.county) ?? 0) + 1);
  }
  const countyCoverageMap = [...coverageByCounty.entries()].map(([county, writerCount]) => ({
    county,
    hasWriter: writerCount > 0,
    writerCount,
    priority: ["Pulaski", "Benton", "Washington", "Sebastian", "Craighead", "Jefferson", "Faulkner"].includes(county)
      ? "high"
      : "standard",
  }));

  const publicationTracker = submissions
    .filter((s) => s.status === "published")
    .map((s) => {
      const outlet = outlets.find((o) => o.id === s.outletId);
      const writer = writers.find((w) => w.id === s.writerId);
      return {
        submissionId: s.id,
        title: s.title ?? "Untitled",
        outlet: outlet?.name ?? s.outletId,
        outletTier: outlet?.tier ?? null,
        writer: writer?.name ?? s.writerId,
        county: writer?.county ?? null,
        category: s.category,
        type: s.type,
        publishedAt: s.publishedAt ?? null,
      };
    });

  const editorialCalendar = {
    generatedAt,
    pass: PASS,
    weeklyRhythm: EDITORIAL_CALENDAR,
    contentCategories: CONTENT_CATEGORIES,
    weeklyTargets: {
      lettersSubmitted: 25,
      lettersPublished: 10,
      guestColumnsSubmitted: 5,
      guestColumnsPublished: 2,
    },
    electionSeasonTargets: {
      submissionsPerWeek: 50,
      publicationsPerWeek: 20,
    },
  };

  const summary = {
    generatedAt,
    pass: PASS,
    programName: "Arkansas Citizen Voices Project",
    networkName: "Citizen Voices Network",
    positioning: "Not a Kelly promotion team — authentic community voices in local media",
    doctrine:
      "Earned media · local validation · meaningful volunteer role without canvassing or phone banking",
    laborDayDeadline: LABOR_DAY,
    electionDay: ELECTION_DAY,
    targets: {
      foundingWriters: 20,
      foundingWritersBy: LABOR_DAY,
      activeWriters: 50,
      activeWritersBy: "2026-10-01",
      lettersSubmittedBeforeElection: 200,
      weeklyPublishedInMajorMarkets: 1,
    },
    weeklyProduction: editorialCalendar.weeklyTargets,
    electionSeasonProduction: editorialCalendar.electionSeasonTargets,
    metrics: {
      writersRecruited: writers.length,
      foundingWriters,
      activeWriters,
      countiesRepresented,
      countiesGoal: 75,
      lettersSubmitted,
      lettersSubmittedGoal: 200,
      lettersPublished,
      guestColumnsSubmitted,
      guestColumnsPublished,
      outletsTotal: outlets.length,
      publicationsTotal: publicationTracker.length,
    },
    newspaperInventory: {
      tier1: outletCounts[1] ?? 0,
      tier2: outletCounts[2] ?? 0,
      tier3: outletCounts[3] ?? 0,
      tier4: outletCounts[4] ?? 0,
      tier5: outletCounts[5] ?? 0,
      total: outlets.length,
    },
    contentCategories: CONTENT_CATEGORIES,
    organizationalRoles: ["state_lead", "regional_lead", "county_writer", "subject_matter_writer"],
    spendMixNote: SPEND_ALLOCATION_NOTE,
  };

  writeFileSync(path.join(CV_DATA, "citizen-voices-network.json"), JSON.stringify(summary, null, 2));
  writeFileSync(
    path.join(CV_DATA, "newspaper-inventory.json"),
    JSON.stringify({ generatedAt, pass: PASS, outlets, byTier: outletCounts }, null, 2),
  );
  writeFileSync(path.join(CV_DATA, "writer-registry.json"), JSON.stringify({ generatedAt, pass: PASS, writers }, null, 2));
  writeFileSync(path.join(CV_DATA, "submission-queue.json"), JSON.stringify({ generatedAt, pass: PASS, submissions }, null, 2));
  writeFileSync(path.join(CV_DATA, "publication-tracker.json"), JSON.stringify({ generatedAt, pass: PASS, publications: publicationTracker }, null, 2));
  writeFileSync(path.join(CV_DATA, "editorial-calendar.json"), JSON.stringify(editorialCalendar, null, 2));
  writeFileSync(path.join(CV_DATA, "county-coverage-map.json"), JSON.stringify({ generatedAt, pass: PASS, counties: countyCoverageMap }, null, 2));

  writeFileSync(path.join(CV_DOCS, "CITIZEN-VOICES-NETWORK.md"), buildOperatingManual(summary.metrics, outletCounts));
  writeFileSync(path.join(CV_DOCS, "citizen-voices-network.summary.json"), JSON.stringify(summary, null, 2));

  // Sync letter counts to local-media-relationships highlights
  const mediaPath = path.join(BRAIN_DATA, "local-media-relationships.json");
  try {
    const media = JSON.parse(readFileSync(mediaPath, "utf8")) as {
      highlights?: Record<string, number>;
    };
    if (media.highlights) {
      media.highlights.lettersToEditor = lettersPublished;
      media.highlights.guestColumns = guestColumnsPublished;
      writeFileSync(mediaPath, JSON.stringify(media, null, 2));
    }
  } catch {
    // optional sync
  }

  console.log(
    `Citizen Voices Network: ${outlets.length} outlets · ${writers.length} writers · ${lettersSubmitted} submissions · ${lettersPublished} published · target 20 founding by ${LABOR_DAY}`,
  );
}

main();
