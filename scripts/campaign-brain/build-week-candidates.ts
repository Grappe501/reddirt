/**
 * Phase 8 prep — Week Candidates (not locked schedule).
 *
 * Leadership approves week candidates before schedule locks.
 *
 * Usage: npm run campaign-brain:week-candidates:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_ROOT, readJson, fmt, loadClusters } from "./lib/inputs";

const OUT = path.join(BRAIN_ROOT, "phase-8/week-candidates");
const WEEKS = 8;

type ScoredEvent = {
  eventId: string;
  title: string;
  county: string;
  date: string | null;
  campaignImpactScore: number;
  effectiveScore: number;
  verificationConfidence: number;
  verification: string;
  assignment: string;
  type: string;
};

function nextMonday(from = new Date()): Date {
  const d = new Date(from);
  const day = d.getUTCDay();
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function weekRange(start: Date): { label: string; start: string; end: string } {
  const end = addDays(start, 6);
  const fmtD = (x: Date) => x.toISOString().slice(0, 10);
  return { label: `${fmtD(start)} → ${fmtD(end)}`, start: fmtD(start), end: fmtD(end) };
}

function inWeek(date: string | null, start: string, end: string): boolean {
  if (!date) return false;
  return date >= start && date <= end;
}

function rainOutAlternatives(events: ScoredEvent[], county: string, clusterCounties: Set<string>): ScoredEvent[] {
  const indoorTypes = new Set(["chamber", "rotary", "lions", "faith", "aea_meeting", "farm_bureau"]);
  return events
    .filter(
      (e) =>
        indoorTypes.has(e.type) &&
        (e.county === county || clusterCounties.has(e.county)) &&
        e.effectiveScore >= 30,
    )
    .slice(0, 3);
}

function main() {
  mkdirSync(OUT, { recursive: true });

  const impact = readJson<{ all?: ScoredEvent[]; top25?: ScoredEvent[] }>(
    path.join(BRAIN_ROOT, "decision-intelligence/campaign-impact-scores.json"),
  );
  const allEvents = impact?.all ?? impact?.top25 ?? [];

  const clusters = readJson<{ clusters: Array<{ id: string; name: string; remaining: number; priority: string; counties: string[] }> }>(
    path.join(BRAIN_ROOT, "decision-intelligence/cluster-priority.json"),
  )?.clusters ?? [];

  const cities =
    readJson<{ cities: Array<{ name: string; county: string; targetVotes: number; rank: number }> }>(
      path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan/part-iii-arkansas-battlefield/chapter-07-top-40-city-strategy/top-40-city-summary.json"),
    )?.cities ?? [];

  const clusterDefs = loadClusters();
  const sorted = [...allEvents].sort((a, b) => (b.effectiveScore ?? 0) - (a.effectiveScore ?? 0));
  const verifiedFirst = [...sorted].sort(
    (a, b) =>
      (b.verification === "verified" ? 1 : 0) - (a.verification === "verified" ? 1 : 0) ||
      (b.effectiveScore ?? 0) - (a.effectiveScore ?? 0),
  );

  const start = nextMonday();
  const weeks: Array<{
    weekNumber: number;
    weekOf: string;
    range: { label: string; start: string; end: string };
    status: "candidate";
    primaryCluster: { name: string; priority: string; remaining: number };
    focusCityPair: Array<{ name: string; county: string; targetVotes: number }>;
    topEvents: ScoredEvent[];
    backupEvents: ScoredEvent[];
    rainOutAlternatives: ScoredEvent[];
    surrogateOpportunities: ScoredEvent[];
    approvalNote: string;
  }> = [];

  for (let w = 0; w < WEEKS; w++) {
    const weekStart = addDays(start, w * 7);
    const range = weekRange(weekStart);
    const cluster = clusters[w % clusters.length] ?? clusters[0];
    const clusterDef = clusterDefs.find((c) => c.id === cluster?.id) ?? clusterDefs[0];
    const clusterCounties = new Set(clusterDef?.counties ?? []);

    const focusCityPair = cities.filter((c) => clusterCounties.has(c.county)).slice(0, 2);

    const weekDated = verifiedFirst.filter((e) => inWeek(e.date, range.start, range.end));
    const clusterPool = verifiedFirst.filter((e) => clusterCounties.has(e.county));
    const topEvents = (weekDated.length >= 2 ? weekDated : clusterPool).slice(0, 3);
    const backupEvents = clusterPool.filter((e) => !topEvents.some((t) => t.eventId === e.eventId)).slice(0, 3);
    const rainOut = rainOutAlternatives(sorted, focusCityPair[0]?.county ?? clusterDef.counties[0], clusterCounties);
    const surrogates = sorted
      .filter((e) => clusterCounties.has(e.county) && (e.assignment === "Congressional" || e.assignment === "Senate"))
      .slice(0, 3);

    weeks.push({
      weekNumber: w + 1,
      weekOf: range.start,
      range,
      status: "candidate",
      primaryCluster: {
        name: cluster?.name ?? clusterDef.name,
        priority: cluster?.priority ?? "HIGH",
        remaining: cluster?.remaining ?? 0,
      },
      focusCityPair: focusCityPair.map((c) => ({ name: c.name, county: c.county, targetVotes: c.targetVotes })),
      topEvents,
      backupEvents,
      rainOutAlternatives: rainOut,
      surrogateOpportunities: surrogates,
      approvalNote: "Candidate — requires leadership approval before locking schedule",
    });
  }

  writeFileSync(path.join(OUT, "week-candidates.json"), JSON.stringify({ generatedAt: new Date().toISOString(), weeks }, null, 2), "utf8");

  const md = `# Week Candidates — Phase 8

> **Not a locked schedule.** Leadership approves each week before calendar lock.

Generated: ${new Date().toISOString().slice(0, 10)} · ${WEEKS} week candidates

---

${weeks
  .map(
    (w) => `## Week ${w.weekNumber} · ${w.range.label}

**Status:** ${w.status.toUpperCase()} — ${w.approvalNote}

### Primary cluster
**${w.primaryCluster.name}** (${w.primaryCluster.priority}) — ${fmt(w.primaryCluster.remaining)} VCI remaining

### Focus city pair
${w.focusCityPair.map((c) => `- **${c.name}** (${c.county}) — ${fmt(c.targetVotes)} target votes`).join("\n") || "- Assign from cluster seats"}

### Top events (effective score = impact × verification)
${w.topEvents.map((e) => `- **${e.title}** (${e.county}) — effective **${e.effectiveScore}** · ${e.assignment} · ${e.verification}${e.date ? ` · ${e.date}` : ""}`).join("\n") || "- Verify dates — see calendar-intelligence sprint"}

### Backup events
${w.backupEvents.map((e) => `- ${e.title} (${e.county}) — ${e.effectiveScore}`).join("\n") || "- —"}

### Rain-out alternatives (indoor)
${w.rainOutAlternatives.map((e) => `- ${e.title} (${e.county}) — ${e.type}`).join("\n") || "- Chamber / Rotary / faith events in cluster"}

### Surrogate opportunities
${w.surrogateOpportunities.map((e) => `- ${e.title} (${e.county}) — ${e.assignment}`).join("\n") || "- —"}

---
`,
  )
  .join("\n")}

*Approve in leadership meeting → lock to calendar → log outcomes → re-run build.*
`;

  writeFileSync(path.join(OUT, "README.md"), md, "utf8");
  writeFileSync(path.join(OUT, "LATEST.md"), md, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Week candidates: ${WEEKS} candidate weeks written to phase-8/week-candidates/`);
}

main();
