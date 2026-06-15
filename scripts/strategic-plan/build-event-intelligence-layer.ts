/**
 * Phase 5 — Master Event Intelligence Layer (index + category scaffolds).
 *
 * Usage: npm run strategic-plan:events:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { readJson, PLAN_ROOT } from "./lib/strategic-plan-shared";

const CAL = path.join(process.cwd(), "data/calendar-command-center");
const OUT = path.join(PLAN_ROOT, "event-intelligence");

type CommunityRow = {
  id: string;
  type: string;
  title: string;
  county: string;
  verificationStatus?: string;
  campaignValue?: string;
  recommendedCoverage?: string;
  routeCluster?: string;
  score?: { total: number };
};

type FairRow = {
  county: string;
  fairName: string;
  campaignValue?: string;
  routeCluster?: string;
  verificationStatus?: string;
};

type FestivalLead = {
  eventName: string;
  county: string;
  date?: string;
  reconcileStatus?: string;
};

const CATEGORY_MAP: Record<string, { folder: string; label: string; sourceTypes: string[] }> = {
  county_fair: { folder: "county-fairs", label: "County Fairs", sourceTypes: ["county_fair"] },
  festival: { folder: "festivals", label: "Festivals", sourceTypes: ["festival"] },
  chamber: { folder: "chambers", label: "Chamber Events", sourceTypes: ["chamber"] },
  rotary: { folder: "rotary-clubs", label: "Rotary Clubs", sourceTypes: ["rotary"] },
  lions: { folder: "lions-clubs", label: "Lions Clubs", sourceTypes: ["lions"] },
  farm_bureau: { folder: "farm-bureau", label: "Farm Bureau", sourceTypes: ["farm_bureau"] },
  volunteer_fire: { folder: "volunteer-fire-departments", label: "Volunteer Fire Departments", sourceTypes: ["vfd", "volunteer_fire"] },
  faith: { folder: "faith-events", label: "Faith Events", sourceTypes: ["faith", "church"] },
  county_clerk: { folder: "county-clerk-events", label: "County Clerk Events", sourceTypes: ["county_clerk", "clerk"] },
  campus: { folder: "campus-school", label: "Campus & School Events", sourceTypes: ["campus_event", "high_school_football", "aea_meeting"] },
  civic: { folder: "civic-community", label: "Civic & Community", sourceTypes: ["extension_homemakers", "retired_teachers"] },
};

function main() {
  const community = readJson<{ rows: CommunityRow[] }>(path.join(CAL, "community-opportunities-2026.normalized.json"));
  const fairs = readJson<{ rows: FairRow[] }>(path.join(CAL, "arkansas-county-fairs-2026.normalized.json"));
  const festivals = readJson<FestivalLead[]>(path.join(CAL, "festival-leads.verified.json")) ?? [];

  const rows = community?.rows ?? [];
  const byType = new Map<string, CommunityRow[]>();
  for (const r of rows) {
    const list = byType.get(r.type) ?? [];
    list.push(r);
    byType.set(r.type, list);
  }

  mkdirSync(OUT, { recursive: true });

  const categorySummaries: Array<{
    id: string;
    label: string;
    count: number;
    folder: string;
    status: "populated" | "scaffold";
  }> = [];

  for (const [id, cat] of Object.entries(CATEGORY_MAP)) {
    const dir = path.join(OUT, cat.folder);
    mkdirSync(dir, { recursive: true });

    let items: unknown[] = [];
    let status: "populated" | "scaffold" = "scaffold";

    if (id === "county_fair" && fairs?.rows) {
      items = fairs.rows;
      status = "populated";
    } else if (id === "festival") {
      items = festivals;
      status = festivals.length > 0 ? "populated" : "scaffold";
    } else {
      for (const t of cat.sourceTypes) {
        items.push(...(byType.get(t) ?? []));
      }
      if (items.length > 0) status = "populated";
    }

    writeFileSync(
      path.join(dir, "index.json"),
      JSON.stringify(
        {
          category: cat.label,
          generatedAt: new Date().toISOString(),
          count: items.length,
          status,
          items,
        },
        null,
        2,
      ),
      "utf8",
    );

    writeFileSync(
      path.join(dir, "README.md"),
      `# ${cat.label}

> **Status:** ${status === "populated" ? "Indexed from calendar data" : "Scaffold — ingest pending"}

| Events indexed | ${items.length} |
| Source | \`data/calendar-command-center/\` |

See [\`index.json\`](./index.json) for machine-readable event list.

${status === "scaffold" ? "\n**Next:** Ingest events into community-opportunities or category-specific pipeline.\n" : ""}
`,
      "utf8",
    );

    categorySummaries.push({ id, label: cat.label, count: items.length, folder: cat.folder, status });
  }

  writeFileSync(
    path.join(OUT, "master-event-index.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalIndexed: categorySummaries.reduce((s, c) => s + c.count, 0),
        categories: categorySummaries,
        note: "Build 20-week schedule only after event layer is verified. Do not populate week files yet.",
      },
      null,
      2,
    ),
    "utf8",
  );

  writeFileSync(
    path.join(OUT, "README.md"),
    `# Master Event Intelligence Layer

> **Status:** Generated — scheduling engine foundation
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT

**Do not build Weeks 1–20 until this layer is verified and merged with opportunity clusters.**

---

## Event categories

| Category | Events | Status |
| -------- | -----: | ------ |
${categorySummaries.map((c) => `| [${c.label}](./${c.folder}/README.md) | ${c.count} | ${c.status} |`).join("\n")}

---

## Priority for SOS race

**County clerk events** have disproportionate value — build clerk relationship calendar alongside fairs and festivals.

---

## Data sources

- \`data/calendar-command-center/community-opportunities-2026.normalized.json\` (317 rows)
- \`data/calendar-command-center/arkansas-county-fairs-2026.normalized.json\` (75 fairs)
- \`data/calendar-command-center/festival-leads.verified.json\`

---

## Regenerate

\`npm run strategic-plan:events:build\`
`,
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(`Wrote event intelligence layer (${categorySummaries.reduce((s, c) => s + c.count, 0)} events indexed).`);
}

main();
