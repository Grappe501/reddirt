/**
 * Campaign Brain Weekly Brief — leadership meeting packet.
 *
 * Usage: npm run campaign-brain:weekly
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_ROOT, readJson, fmt, loadDropOffTotals, loadOpportunityCounties } from "./lib/inputs";
import { loadCapturedProgressV2 } from "./lib/feedback-load";
import { completionPct } from "./lib/feedback-types";

const PLAN_ROOT = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan");

function weekLabel(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function main() {
  const captured = loadCapturedProgressV2();
  const capturedOpp = readJson<{
    statewide: { potential: number; captured: number; remaining: number; completionPct: number; byLane: Array<{ lane: string; captured: number; goal: number; remaining: number; completionPct: number }> };
    clusters: Array<{ name: string; potential: number; captured: number; remaining: number; completionPct: number; priority?: string }>;
    counties: Array<{ county: string; potential: number; captured: number; remaining: number; completionPct: number }>;
  }>(path.join(BRAIN_ROOT, "measurement/captured-opportunity.json"));

  const fourLanes = readJson<{ lanes: Record<string, { goal: number; gap?: number; potential?: number; current?: number | null; weeklyPace?: number }>; victoryProjection: { scenarios: Record<string, { votes: number }> } }>(
    path.join(PLAN_ROOT, "command-center/four-lanes-dashboard.json"),
  );

  const nextWeek = readJson<{
    primaryCluster: { name: string; remainingOpportunity: number; priority: string };
    focusCities: Array<{ name: string; county: string; targetVotes: number }>;
    recommendedEvents: Array<{ title: string; county: string; score: number; assignment: string; assignmentReason?: string }>;
    laneFocus: string[];
  }>(path.join(BRAIN_ROOT, "decision-intelligence/next-week-recommendation.json"));

  const eventTop =
    readJson<{ top25: Array<{ title: string; county: string; campaignImpactScore: number; assignment: string }> }>(
      path.join(BRAIN_ROOT, "decision-intelligence/campaign-impact-scores.json"),
    )?.top25.slice(0, 5) ?? [];

  const coverage = readJson<{ visitedThisCycle: number; totalCounties: number; neverVisited: number; averageDaysSinceVisit: number }>(
    path.join(BRAIN_ROOT, "routing/county-coverage-index.json"),
  );

  const scenarios = readJson<{ scenarios: { conservative: { votes: number }; expected: { votes: number }; aggressive: { votes: number } } }>(
    path.join(BRAIN_ROOT, "scenario-engine/scenarios.json"),
  );

  const clerks = readJson<{ counties: Array<{ county: string; status: string; meetings: number; priority: string }> }>(
    path.join(BRAIN_ROOT, "layers/clerk-relationships/index.json"),
  )?.counties.filter((c) => c.priority === "High").slice(0, 8) ?? [];

  const faith = readJson<{ counties: Array<{ county: string; faithEngagementIndex: number }> }>(
    path.join(BRAIN_ROOT, "layers/faith-engagement/index.json"),
  )?.counties.slice(0, 8) ?? [];

  const dropOff = loadDropOffTotals();
  const regSummary = readJson<{ statewideGap: number; statewideWeeklyTarget: number; top10ByGoal: Array<{ county: string; goal: number; gapRemaining: number }> }>(
    path.join(PLAN_ROOT, "part-ii-electoral-math/chapter-05-fifty-thousand-new-voter-plan/statewide-registration-summary.json"),
  );

  const tierA = loadOpportunityCounties().filter((c) => c.tier === "A");
  const countyAlerts = (capturedOpp?.counties ?? [])
    .filter((c) => c.completionPct < 5 && c.potential >= 10_000)
    .slice(0, 8);

  const label = weekLabel();
  const dir = path.join(BRAIN_ROOT, "weekly-brief");
  mkdirSync(dir, { recursive: true });

  const md = `# Campaign Brain Weekly Brief

> **Week of ${label}** · CONFIDENTIAL CAMPAIGN LEADERSHIP PACKET

---

## 1. Statewide status

| Metric | Value |
| ------ | ----: |
| Lane 2 drop-off available | ${fmt(dropOff.rawDropOff)} |
| Lane 2 recovery goal @ 50% | ${fmt(dropOff.recovery50Total)} |
| VCI potential | ${fmt(capturedOpp?.statewide.potential ?? 0)} |
| VCI captured | **${fmt(capturedOpp?.statewide.captured ?? 0)}** (${capturedOpp?.statewide.completionPct ?? 0}%) |
| Registration gap | ${fmt(regSummary?.statewideGap ?? 50_000)} |

**Narrative:** Over 102,000 Democrats already voted in 2024. First job: bring them back.

---

## 2. Four-lane status

| Lane | Goal | Captured | Remaining | Completion |
| ---- | ---: | -------: | --------: | ---------: |
${(capturedOpp?.statewide.byLane ?? [])
  .map((l) => `| ${l.lane} | ${fmt(l.goal)} | ${fmt(l.captured)} | ${fmt(l.remaining)} | ${l.completionPct}% |`)
  .join("\n")}

---

## 3. Cluster rankings (by remaining opportunity)

| Cluster | Potential | Captured | Remaining | Completion |
| ------- | --------: | -------: | --------: | ---------: |
${(capturedOpp?.clusters ?? [])
  .slice(0, 6)
  .map((c) => `| ${c.name} | ${fmt(c.potential)} | ${fmt(c.captured)} | **${fmt(c.remaining)}** | ${c.completionPct}% |`)
  .join("\n")}

**Primary cluster this week:** ${nextWeek?.primaryCluster.name ?? "TBD"} (${nextWeek?.primaryCluster.priority ?? ""})

---

## 4. Top event opportunities this week

| Event | County | Score | Deploy |
| ----- | ------ | ----: | ------ |
${eventTop.map((e) => `| ${e.title} | ${e.county} | ${e.campaignImpactScore} | ${e.assignment} |`).join("\n")}

*Strategy-first ranking:* [master-priority-calendar.md](../routing/master-priority-calendar.md)

---

## 5. County coverage & alerts

| Metric | Value |
| ------ | ----: |
| Counties visited | ${coverage?.visitedThisCycle ?? "—"} / ${coverage?.totalCounties ?? 75} |
| Never visited | ${coverage?.neverVisited ?? "—"} |
| Avg days since visit | ${coverage?.averageDaysSinceVisit ?? "—"} |

**High potential, low capture:**

${countyAlerts.length ? countyAlerts.map((c) => `- **${c.county}** — ${fmt(c.remaining)} remaining (${c.completionPct}% complete)`).join("\n") : "- No alerts — update captured-progress.json as field work lands"}

**Tier A counties:** ${tierA.map((c) => c.county).join(", ")}

---

## 6. Clerk relationship updates

| County | Status | Meetings | Priority |
| ------ | ------ | -------: | -------- |
${clerks.map((c) => `| ${c.county} | ${c.status} | ${c.meetings} | ${c.priority} |`).join("\n") || "| — | — | — | — |"}

---

## 7. Faith engagement updates

Top FEI counties: ${faith.map((f) => `${f.county} (${f.faithEngagementIndex})`).join(" · ")}

---

## 8. Registration pace

| Metric | Value |
| ------ | ----: |
| Statewide weekly target | **${fmt(regSummary?.statewideWeeklyTarget ?? 2500)}** |
| Statewide gap | ${fmt(regSummary?.statewideGap ?? 50_000)} |

Top counties: ${(regSummary?.top10ByGoal ?? [])
  .slice(0, 3)
  .map((c) => `${c.county} (${fmt(c.gapRemaining)} gap)`)
  .join(" · ")}

---

## 9. Scenario movement

| Scenario | Votes | vs 400K working goal |
| -------- | ----: | -------------------- |
| Conservative | ${fmt(scenarios?.scenarios.conservative.votes ?? 0)} | ${(scenarios?.scenarios.conservative.votes ?? 0) >= 400_000 ? "✓" : "below"} |
| Expected | **${fmt(scenarios?.scenarios.expected.votes ?? 0)}** | in plurality range |
| Aggressive | ${fmt(scenarios?.scenarios.aggressive.votes ?? 0)} | stretch |

Lane capture progress adjusts scenario confidence — update weekly.

---

## 10. Recommended Kelly schedule

**Cluster:** ${nextWeek?.primaryCluster.name ?? "TBD"}

**Focus cities:** ${(nextWeek?.focusCities ?? []).map((c) => c.name).join(" · ") || "TBD"}

**Events:**

${(nextWeek?.recommendedEvents ?? [])
  .map((e) => `- **${e.title}** (${e.county}) — ${e.assignment}, score ${e.score}${e.assignmentReason ? ` · ${e.assignmentReason}` : ""}`)
  .join("\n") || "- See event-scores.json"}

**Lane focus:** ${(nextWeek?.laneFocus ?? []).join(" · ")}

---

*Generated by Campaign Brain · \`npm run campaign-brain:weekly\`*
`;

  writeFileSync(path.join(dir, `weekly-brief-${label}.md`), md, "utf8");
  writeFileSync(path.join(dir, "LATEST.md"), md, "utf8");

  writeFileSync(
    path.join(dir, `weekly-brief-${label}.json`),
    JSON.stringify({ generatedAt: new Date().toISOString(), weekOf: label, nextWeek, capturedOpp: capturedOpp?.statewide }, null, 2),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(`Weekly brief written: weekly-brief/${label}.md`);
}

main();
