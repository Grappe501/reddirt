/**
 * Event Verification Sprint — calendar intelligence layer.
 *
 * Usage: npm run campaign-brain:verification:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_ROOT, loadCommunityEvents, loadOpportunityCounties, readJson } from "./lib/inputs";
import { buildEventVerificationMap } from "./lib/build-verification-map";
import { buildCountyCoverageIndex, loadAllCountyVisits } from "./lib/county-coverage";
import { statusLabel, verificationSummary, type EventVerificationStatus } from "./lib/event-verification";

const OUT = path.join(BRAIN_ROOT, "calendar-intelligence");
const OPS = path.join(BRAIN_ROOT, "operations");
const WAR_ROOM = path.join(OPS, "war-room");
const BRAIN_DATA = path.join(process.cwd(), "data/campaign-brain");

const TEAM_TYPES: Record<string, { label: string; types: Set<string> }> = {
  "team-a-county-fairs": { label: "Team A — County Fairs", types: new Set(["county_fair"]) },
  "team-b-festivals": { label: "Team B — Festivals", types: new Set(["festival"]) },
  "team-c-faith": {
    label: "Team C — Faith Events",
    types: new Set(["faith", "church"]),
  },
  "team-d-clerks": {
    label: "Team D — County Clerks",
    types: new Set(["county_clerk", "clerk"]),
  },
};

function pct(current: number, goal: number, direction: "up" | "down"): number {
  if (goal <= 0) return current <= goal ? 100 : 0;
  if (direction === "up") return Math.min(100, Math.round((current / goal) * 100));
  if (current <= goal) return 100;
  return Math.max(0, Math.round((1 - (current - goal) / Math.max(current, 1)) * 100));
}

function writeWarRoomChecklist(
  slug: string,
  label: string,
  items: Array<{ eventId: string; title: string; county: string; status: string; tier?: string }>,
  captureFields: string[],
) {
  const md = `# ${label}

> Operation Calendar Truth · ${items.length} items · update [\`event-verification-overrides.json\`](../../../data/campaign-brain/event-verification-overrides.json)

Capture: ${captureFields.join(" · ")}

| ✓ | County | Event | Tier | Status | Event ID |
| - | ------ | ----- | ---- | ------ | -------- |
${items
  .map(
    (e) =>
      `| [ ] | ${e.county} | ${e.title.replace(/\|/g, "/")} | ${e.tier ?? "—"} | ${e.status} | \`${e.eventId.slice(0, 20)}…\` |`,
  )
  .join("\n")}
`;
  writeFileSync(path.join(WAR_ROOM, `${slug}.md`), md, "utf8");
}

function main() {
  mkdirSync(OUT, { recursive: true });
  mkdirSync(WAR_ROOM, { recursive: true });

  const events = loadCommunityEvents();
  const oppMap = new Map(loadOpportunityCounties().map((c) => [c.county, c]));
  const { records } = buildEventVerificationMap();
  const summary = verificationSummary(records);
  const eventById = new Map(events.map((e) => [e.id, e]));
  const recordById = new Map(records.map((r) => [r.eventId, r]));

  const coverage = buildCountyCoverageIndex(loadAllCountyVisits(BRAIN_DATA));
  const goals = readJson<{ metrics: Record<string, { goal: number; direction: "up" | "down" }> }>(
    path.join(BRAIN_DATA, "calendar-truth-goals.json"),
  )?.metrics;

  const current = {
    verifiedEvents: summary.verified,
    tentativeEvents: summary.tentative,
    missingDates: summary.missing,
    countiesCovered: coverage.visitedThisCycle,
    guardrailViolations: coverage.guardrailViolations,
  };

  const metricsRows = goals
    ? Object.entries(goals).map(([key, g]) => {
        const cur = current[key as keyof typeof current] ?? 0;
        return {
          metric: key,
          current: cur,
          goal: g.goal,
          direction: g.direction,
          progressPct: pct(cur, g.goal, g.direction),
          onTrack: g.direction === "up" ? cur >= g.goal : cur <= g.goal,
        };
      })
    : [];

  writeFileSync(
    path.join(OPS, "calendar-truth-metrics.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), current, goals: goals ?? {}, metrics: metricsRows }, null, 2),
    "utf8",
  );

  writeFileSync(
    path.join(OPS, "calendar-truth-metrics.md"),
    `# Calendar Truth Metrics

> Operation Calendar Truth — live progress vs goals

Updated: ${new Date().toISOString().slice(0, 10)}

| Metric | Current | Goal | Progress |
| ------ | ------: | ---: | -------: |
${metricsRows
  .map((m) => {
    const label = m.metric
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
    return `| ${label} | **${m.current}** | ${m.goal} | ${m.progressPct}% |`;
  })
  .join("\n")}

---

**Brain readiness:** ${current.verifiedEvents >= 300 ? "Calendar executable" : "Verification sprint required — do not lock 20-week schedule"}

See [OPERATION-CALENDAR-TRUTH.md](./OPERATION-CALENDAR-TRUTH.md)
`,
    "utf8",
  );

  for (const [slug, team] of Object.entries(TEAM_TYPES)) {
    const items = events
      .filter((e) => team.types.has(e.type))
      .map((e) => ({
        eventId: e.id,
        title: e.title,
        county: e.county,
        tier: oppMap.get(e.county)?.tier,
        status: recordById.get(e.id)?.status ?? "missing",
      }))
      .sort((a, b) => (a.tier ?? "Z").localeCompare(b.tier ?? "Z") || a.county.localeCompare(b.county));

    const fields =
      slug === "team-a-county-fairs"
        ? ["date", "location", "contact", "attendance", "vendor deadline", "sponsorship"]
        : slug === "team-b-festivals"
          ? ["date", "attendance", "political rules", "booth cost"]
          : slug === "team-c-faith"
            ? ["minister alliance", "gathering date", "associational meeting"]
            : ["conference", "training", "regional meeting"];

    writeWarRoomChecklist(slug, team.label, items, fields);
  }

  const enriched = records
    .map((v) => {
      const e = eventById.get(v.eventId);
      return {
        ...v,
        title: e?.title ?? v.eventId,
        county: e?.county ?? "—",
        type: e?.type ?? "festival_lead",
        statusLabel: statusLabel(v.status),
      };
    })
    .sort((a, b) => {
      const order: Record<EventVerificationStatus, number> = {
        verified: 0,
        tentative: 1,
        historical: 2,
        missing: 3,
      };
      return order[a.status] - order[b.status] || (b.confidence - a.confidence);
    });

  const output = {
    generatedAt: new Date().toISOString(),
    principle: "Effective rank = Campaign Impact Score × Verification Confidence",
    confidenceMultipliers: { verified: 1.0, tentative: 0.75, historical: 0.55, missing: 0.35 },
    totalEvents: records.length,
    summary,
    events: enriched,
  };

  writeFileSync(path.join(OUT, "event-verification-index.json"), JSON.stringify(output, null, 2), "utf8");

  const md = `# Event Verification Index

> Calendar intelligence — ${records.length} events classified

**Effective rank:** \`Campaign Impact Score × Verification Confidence\`

A score-98 event with no confirmed date (×0.35 = **34**) should not outrank a verified score-92 event (×1.0 = **92**).

---

## Status summary

| Status | Count | Confidence | Meaning |
| ------ | ----: | ---------: | ------- |
| Verified | ${summary.verified} | 1.00 | Date confirmed |
| Tentative | ${summary.tentative} | 0.75 | Expected but not confirmed |
| Historical | ${summary.historical} | 0.55 | Last year's date only |
| Missing | ${summary.missing} | 0.35 | No usable date |

---

## Verification sprint queue

Priority: upgrade **Missing** events in Tier A/B counties first.

${enriched
  .filter((e) => e.status === "missing")
  .slice(0, 15)
  .map((e) => `- **${e.title}** (${e.county}) — ${e.type}`)
  .join("\n")}

---

## Verified events (executable now)

${enriched
  .filter((e) => e.status === "verified" || e.status === "tentative")
  .slice(0, 15)
  .map((e) => `- **${e.eventDate ?? "TBD"}** · ${e.title} (${e.county}) — ${e.status}`)
  .join("\n") || "- None yet — run field verification sprint"}

---

## Field workflow

1. Confirm date in official schedule / county clerk / fair board
2. Update [\`data/campaign-brain/event-verification-overrides.json\`](../../data/campaign-brain/event-verification-overrides.json):

\`\`\`json
{
  "overrides": {
    "fair-event-id": { "status": "verified", "date": "2026-08-15" }
  }
}
\`\`\`

3. \`npm run campaign-brain:build\`

*Full data:* [\`event-verification-index.json\`](./event-verification-index.json)
`;

  writeFileSync(path.join(OUT, "event-verification-index.md"), md, "utf8");
  writeFileSync(
    path.join(OUT, "README.md"),
    `# Calendar Intelligence

Strategy is complete. The bottleneck is now **event-data quality**.

| Artifact | Purpose |
| -------- | ------- |
| [Event verification index](./event-verification-index.md) | Verified / Tentative / Historical / Missing |
| [Operation Calendar Truth](./operations/OPERATION-CALENDAR-TRUTH.md) | Verification war room · execution phase |
| [Calendar truth metrics](./operations/calendar-truth-metrics.md) | Verified reality progress vs goals |
| [Master priority calendar](../routing/master-priority-calendar.md) | Score × confidence ranking |

\`\`\`bash
npm run campaign-brain:verification:build
\`\`\`
`,
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(
    `Event verification: ${summary.verified} verified · ${summary.tentative} tentative · ${summary.missing} missing. Calendar Truth: ${current.countiesCovered}/75 counties · ${current.guardrailViolations} guardrail violations.`,
  );
}

main();
