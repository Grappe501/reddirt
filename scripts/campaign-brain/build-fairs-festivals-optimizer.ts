/**
 * FAIRS_AND_FESTIVALS_OPTIMIZER
 *
 * Strategy scores the calendar — not the other way around.
 *
 * Usage: npm run campaign-brain:optimizer:build
 *
 * Outputs:
 *   1. Kelly schedule recommendation
 *   2. Surrogate schedule (Congressional + Senate)
 *   3. County team schedule
 *   4. Uncovered county alerts
 *   5. Weekly opportunity ranking
 *   6. Master priority calendar
 *   7. County Coverage Index
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_POPULATION_2020 } from "../strategic-plan/data/arkansas-top-40-cities";
import {
  BRAIN_DATA,
  BRAIN_ROOT,
  cityInfluenceByCounty,
  loadCommunityEvents,
  loadFestivalLeads,
  loadOpportunityCounties,
  loadVci,
  maxOf,
  oppByCountyMap,
  readJson,
  vciByCountyMap,
  fmt,
} from "./lib/inputs";
import { buildCountyCoverageIndex, loadAllCountyVisits, type CountyVisit } from "./lib/county-coverage";
import { buildEventVerificationMap } from "./lib/build-verification-map";
import {
  buildFaithIndexByCounty,
  computeCampaignImpactScore,
  type CampaignImpactScore,
} from "./lib/event-prioritization";
import {
  costPerOpportunityPoint,
  effortUnits,
  hasActualCosts,
  type EventCostEstimate,
} from "./lib/cost-per-opportunity";

const ROUTING = path.join(BRAIN_ROOT, "routing");

type FestivalLead = {
  id?: string;
  eventName: string;
  county: string;
  date?: string;
  reconcileStatus?: string;
};

function loadCountyVisits(): CountyVisit[] {
  return loadAllCountyVisits(BRAIN_DATA);
}

function loadClerkMeetings(): Map<string, number> {
  const seed = readJson<{ meetings?: Record<string, { meetings?: number }> }>(
    path.join(BRAIN_DATA, "clerk-relationships-seed.json"),
  );
  const map = new Map<string, number>();
  for (const [county, row] of Object.entries(seed?.meetings ?? {})) {
    map.set(county, row.meetings ?? 0);
  }
  return map;
}

function festivalAsEvent(lead: FestivalLead, idx: number) {
  return {
    id: lead.id ?? `fest-lead-${idx}`,
    type: "festival",
    title: lead.eventName,
    county: lead.county,
    verificationStatus: lead.reconcileStatus ?? "needs_confirmation",
    campaignValue: "high_value",
    recommendedCoverage: "kelly",
    audienceTags: ["families", "persuasion"],
    score: { total: 70 },
  };
}

function formatDateShort(iso: string | null): string {
  if (!iso) return "TBD";
  const d = new Date(`${iso.slice(0, 10)}T12:00:00.000Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function scheduleTable(rows: CampaignImpactScore[], limit = 40): string {
  return rows
    .slice(0, limit)
    .map(
      (r) =>
        `| ${formatDateShort(r.date)} | ${r.title.slice(0, 40)}${r.title.length > 40 ? "…" : ""} | ${r.county} | ${r.campaignImpactScore} | **${r.effectiveScore}** | ${r.verification} | ${r.assignment} |`,
    )
    .join("\n");
}

function festivalNameMatchesEvent(eventTitle: string, eventType: string, festivalName: string): boolean {
  const et = eventTitle.toLowerCase();
  const fn = festivalName.toLowerCase();
  if (eventType === "county_fair" && !fn.includes("fair") && !fn.includes("fest")) return false;
  if (et === fn) return true;
  const etCore = et.replace(/\s*\(.*\)$/, "").trim();
  if (fn.includes(etCore) || etCore.includes(fn)) return true;
  const significant = et.split(/\s+/).filter((w) => w.length > 4 && !["county", "verify", "local"].includes(w));
  const hits = significant.filter((w) => fn.includes(w)).length;
  return hits >= 2;
}

function main() {
  mkdirSync(ROUTING, { recursive: true });

  const vci = loadVci();
  const opp = loadOpportunityCounties();
  const oppMap = oppByCountyMap(opp);
  const vciMap = vciByCountyMap(vci);
  const cityInfl = cityInfluenceByCounty();
  const clerkMeetings = loadClerkMeetings();
  const communityEvents = loadCommunityEvents();
  const festivalLeads = loadFestivalLeads() as FestivalLead[];

  const maxVci = maxOf(vci.map((c) => c.vci));
  const maxRecovery = maxOf(opp.map((c) => c.dropOffRecovery50));
  const maxReg = maxOf(opp.map((c) => c.registrationGoal));
  const maxRep = maxOf(opp.map((c) => c.republicanConversionPotential));
  const maxPop = maxOf(Object.values(ARKANSAS_COUNTY_POPULATION_2020));

  const faithMap = buildFaithIndexByCounty(oppMap, maxPop);
  const visits = loadCountyVisits();
  const coverageIndex = buildCountyCoverageIndex(visits);
  const coverageByCounty = new Map(coverageIndex.counties.map((c) => [c.county, c]));
  const { byEventId: verificationByEventId, festivalDates } = buildEventVerificationMap();
  const costEstimates =
    readJson<{ estimates: Record<string, EventCostEstimate> }>(path.join(BRAIN_DATA, "event-cost-estimates.json"))
      ?.estimates ?? {};

  const communityKeys = new Set(communityEvents.map((e) => `${e.county}|${e.title.toLowerCase()}`));
  const extraFestivals = festivalLeads.filter(
    (f) => !communityKeys.has(`${f.county}|${f.eventName.toLowerCase()}`),
  );

  const events = [...communityEvents, ...extraFestivals.map((f, i) => festivalAsEvent(f, i))];

  const dateByEventId = new Map<string, string>(festivalDates);
  for (let i = 0; i < extraFestivals.length; i++) {
    const f = extraFestivals[i];
    if (f.date) dateByEventId.set(`fest-lead-${i}`, f.date);
  }

  const scored: CampaignImpactScore[] = events.map((e) => {
    let verification = verificationByEventId.get(e.id);
    if (!verification) {
      const date = dateByEventId.get(e.id);
      verification = verificationByEventId.get(e.id) ?? {
        eventId: e.id,
        status: date ? "tentative" : "missing",
        confidence: date ? 0.75 : 0.35,
        eventDate: date ?? null,
      };
    }
    if (dateByEventId.has(e.id) && verification.eventDate === null) {
      verification = { ...verification, eventDate: dateByEventId.get(e.id)! };
    }
    return computeCampaignImpactScore(
      e,
      oppMap.get(e.county),
      vciMap.get(e.county),
      coverageByCounty.get(e.county),
      cityInfl.get(e.county) ?? 0,
      faithMap.get(e.county) ?? 0,
      clerkMeetings.get(e.county) ?? 0,
      maxVci,
      maxRecovery,
      maxReg,
      maxRep,
      maxPop,
      verification,
    );
  });

  scored.sort((a, b) => b.effectiveScore - a.effectiveScore || b.campaignImpactScore - a.campaignImpactScore);

  const kellySchedule = scored.filter((e) => e.assignment === "Kelly");
  const surrogateSchedule = scored.filter((e) => e.assignment === "Congressional" || e.assignment === "Senate");
  const countyTeamSchedule = scored.filter((e) => e.assignment === "County Team");

  const scheduled = scored.filter((e) => e.date).sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const weeklyRanking = scored.slice(0, 25);

  const output = {
    generatedAt: new Date().toISOString(),
    principle: "Effective rank = Campaign Impact Score × Verification Confidence",
    rankingFormula: "effectiveScore = campaignImpactScore × verificationConfidence",
    totalEvents: scored.length,
    countyCoverage: {
      visited: coverageIndex.visitedThisCycle,
      remaining: coverageIndex.totalCounties - coverageIndex.visitedThisCycle,
      neverVisited: coverageIndex.neverVisited,
      averageDaysSinceVisit: coverageIndex.averageDaysSinceVisit,
    },
    schedules: {
      kelly: kellySchedule.slice(0, 30).map(pickScheduleFields),
      surrogate: surrogateSchedule.slice(0, 30).map(pickScheduleFields),
      countyTeam: countyTeamSchedule.slice(0, 40).map(pickScheduleFields),
    },
    uncoveredCountyAlerts: coverageIndex.uncoveredAlerts,
    weeklyOpportunityRanking: weeklyRanking.map(pickScheduleFields),
    masterCalendar: scheduled.slice(0, 50).map(pickScheduleFields),
    topUnscheduled: scored.filter((e) => !e.date).slice(0, 30).map(pickScheduleFields),
  };

  writeFileSync(path.join(ROUTING, "optimizer-output.json"), JSON.stringify(output, null, 2), "utf8");
  writeFileSync(path.join(ROUTING, "county-coverage-index.json"), JSON.stringify(coverageIndex, null, 2), "utf8");

  writeFileSync(
    path.join(ROUTING, "county-coverage-index.md"),
    `# County Coverage Index

> ${coverageIndex.totalCounties} counties · reference ${coverageIndex.referenceDate}

---

## Summary

| Metric | Value |
| ------ | ----: |
| Counties visited this cycle | **${coverageIndex.visitedThisCycle}** |
| Never visited | ${coverageIndex.neverVisited} |
| Remaining (never + neglected 60d+) | ${coverageIndex.remaining} |
| Average days since visit | ${coverageIndex.averageDaysSinceVisit} |
| **45-day guardrail violations** | **${coverageIndex.guardrailViolations}** |
| Guardrail warnings (36–45 days) | ${coverageIndex.guardrailWarnings} |

---

## No County Left Behind (45 days)

See [no-county-left-behind-alerts.md](./no-county-left-behind-alerts.md).

| Condition | Adjustment |
| --------- | ----------- |
| No visit in 60 days | +20 |
| No visit in 30 days | +10 |
| Visited within 14 days | -15 |

---

## Neglected counties (priority for routing)

${coverageIndex.counties
  .filter((c) => c.status === "never_visited" || c.status === "neglected")
  .slice(0, 20)
  .map((c) => `- **${c.county}** — ${c.daysSinceVisit === null ? "never visited" : `${c.daysSinceVisit} days since last visit`}`)
  .join("\n")}

*Full data:* [\`county-coverage-index.json\`](./county-coverage-index.json)
`,
    "utf8",
  );

  writeFileSync(
    path.join(ROUTING, "master-priority-calendar.md"),
    `# Master Priority Calendar

> Campaign Impact Score ranks every event **before** it reaches Kelly's calendar.

**Principle:** Use campaign strategy to score the fair and festival calendar — not the calendar to schedule the campaign.

Generated: ${new Date().toISOString().slice(0, 10)} · ${scored.length} events scored

---

## Score components

| Factor | Weight |
| ------ | -----: |
| County VCI | 30% |
| Lane 2 recovery | 20% |
| Registration goal | 15% |
| GOP conversion | 15% |
| County coverage need | 10% |
| Event attendance | 10% |

**Multipliers:** Rural strategy overlay · rural event bonuses · coverage bonuses

**Effective rank:** \`Campaign Impact Score × Verification Confidence\` — verified events outrank high-scoring unverified inventory.

---

## Scheduled events (by date, effective score)

| Date | Event | County | Impact | Effective | Verify | Assignment |
| ---- | ----- | ------ | -----: | --------: | ------ | ---------- |
${scheduleTable(scheduled, 35) || "| — | — | — | — | — | — | — |"}

---

## Top unscheduled (score-first — verify dates in field)

| Event | County | Impact | Effective | Assignment | Verify |
| ----- | ------ | -----: | --------: | ---------- | ------ |
${scored
  .filter((e) => !e.date)
  .slice(0, 25)
  .map((r) => `| ${r.title.slice(0, 45)} | ${r.county} | ${r.campaignImpactScore} | ${r.effectiveScore} | ${r.assignment} | ${r.verification} |`)
  .join("\n")}

---

## Candidate coverage model

| Assignee | When |
| -------- | ---- |
| **Kelly** | High VCI · clerk · media · faith · GOP conversion |
| **Congressional** | Dense urban · shared media · registration focus |
| **Senate** | Regional turnout · volunteer activation |
| **County Team** | Relationship maintenance · visibility |

*Full data:* [\`optimizer-output.json\`](./optimizer-output.json)
`,
    "utf8",
  );

  writeScheduleMd("kelly-schedule", "Kelly Schedule Recommendation", kellySchedule, "High VCI · clerk · media · faith · GOP conversion");
  writeScheduleMd(
    "surrogate-schedule",
    "Surrogate Schedule (Congressional + Senate)",
    surrogateSchedule,
    "Urban registration drives · regional turnout · volunteer activation",
  );
  writeScheduleMd("county-team-schedule", "County Team Schedule", countyTeamSchedule, "Visibility · relationship maintenance");

  writeFileSync(
    path.join(ROUTING, "no-county-left-behind-alerts.md"),
    `# No County Left Behind — 45-Day Guardrail

> **Rule:** No county may exceed **45 days** without campaign contact.

Contact types: Kelly visit · surrogate · county chair · clerk meeting · faith outreach · volunteer event

Reference date: ${coverageIndex.referenceDate}

---

## Violations (${coverageIndex.guardrailViolations})

${coverageIndex.noCountyLeftBehindAlerts
  .filter((a) => a.severity === "critical")
  .slice(0, 25)
  .map((a) => `- **${a.county}** — ${a.message}${a.lastContactDate ? ` (last: ${a.lastContactDate})` : ""}`)
  .join("\n") || "- None"}

---

## Warnings (${coverageIndex.guardrailWarnings})

${coverageIndex.noCountyLeftBehindAlerts
  .filter((a) => a.severity === "warning")
  .map((a) => `- **${a.county}** — ${a.message}`)
  .join("\n") || "- None"}
`,
    "utf8",
  );

  const costRows = scored.slice(0, 50).map((e) => {
    const est = costEstimates[e.eventId] ?? {};
    const units = effortUnits(est, e.assignment);
    return {
      eventId: e.eventId,
      title: e.title,
      county: e.county,
      effectiveScore: e.effectiveScore,
      effortUnits: units,
      costPerOpportunityPoint: costPerOpportunityPoint(e.effectiveScore, units),
      assignment: e.assignment,
      hasActualCosts: hasActualCosts(est),
    };
  });
  costRows.sort((a, b) => b.costPerOpportunityPoint - a.costPerOpportunityPoint);
  mkdirSync(path.join(BRAIN_ROOT, "measurement"), { recursive: true });
  writeFileSync(
    path.join(BRAIN_ROOT, "measurement/cost-per-opportunity-point.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), topEfficient: costRows.slice(0, 20), all: costRows }, null, 2),
    "utf8",
  );

  writeFileSync(
    path.join(ROUTING, "uncovered-county-alerts.md"),
    `# Uncovered County Alerts

> Counties the Brain prioritizes because coverage is lagging.

---

## ${coverageIndex.neverVisited} counties never visited this cycle

${coverageIndex.counties
  .filter((c) => c.status === "never_visited")
  .map((c) => `- **${c.county}**`)
  .join("\n")}

---

## Neglected (60+ days since visit)

${coverageIndex.counties
  .filter((c) => c.status === "neglected")
  .map((c) => `- **${c.county}** — ${c.daysSinceVisit} days · last ${c.lastVisitDate}`)
  .join("\n") || "- None yet — update county-visit-log.json as travel lands"}

---

## Recommended action

Route Kelly or surrogates to highest-scoring events in uncovered counties. See [master-priority-calendar.md](./master-priority-calendar.md).
`,
    "utf8",
  );

  writeFileSync(
    path.join(ROUTING, "weekly-opportunity-ranking.md"),
    `# Weekly Opportunity Ranking

> Top 25 events by **effective score** (impact × verification confidence).

| Rank | Event | County | Impact | Effective | Verify | Assignment | Date |
| ---: | ----- | ------ | -----: | --------: | ------ | ---------- | ---- |
${weeklyRanking
  .map(
    (r, i) =>
      `| ${i + 1} | ${r.title.slice(0, 38)}${r.title.length > 38 ? "…" : ""} | ${r.county} | ${r.campaignImpactScore} | **${r.effectiveScore}** | ${r.verification} | ${r.assignment} | ${formatDateShort(r.date)} |`,
  )
  .join("\n")}

---

## Rural strategy overlay active

Events in rural counties receive 1.30× multiplier — aligning routing with the rural-heavy plurality path.
`,
    "utf8",
  );

  writeFileSync(
    path.join(ROUTING, "README.md"),
    `# Event Routing — FAIRS_AND_FESTIVALS_OPTIMIZER

> **Strategy scores the calendar.** Every fair, festival, chamber, faith, and civic event receives a Campaign Impact Score before it reaches Kelly's calendar.

---

## Outputs

| File | Purpose |
| ---- | ------- |
| [Master priority calendar](./master-priority-calendar.md) | Score-ranked events · date + assignment |
| [Kelly schedule](./kelly-schedule.md) | Kelly deployment recommendation |
| [Surrogate schedule](./surrogate-schedule.md) | Congressional + Senate routing |
| [County team schedule](./county-team-schedule.md) | Local visibility events |
| [County coverage index](./county-coverage-index.md) | 75-county visit tracking |
| [Uncovered county alerts](./uncovered-county-alerts.md) | Neglected counties |
| [Weekly opportunity ranking](./weekly-opportunity-ranking.md) | Top 25 this week |

---

## Field inputs

- [\`data/campaign-brain/county-visit-log.json\`](../../data/campaign-brain/county-visit-log.json) — manual visit log
- [\`data/campaign-brain/event-outcomes.json\`](../../data/campaign-brain/event-outcomes.json) — auto-merged attended events

\`\`\`bash
npm run campaign-brain:optimizer:build
\`\`\`
`,
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(
    `FAIRS_AND_FESTIVALS_OPTIMIZER: ${scored.length} events · Kelly ${kellySchedule.length} · Surrogate ${surrogateSchedule.length} · Coverage ${coverageIndex.visitedThisCycle}/${coverageIndex.totalCounties} counties visited.`,
  );
}

function pickScheduleFields(e: CampaignImpactScore) {
  return {
    eventId: e.eventId,
    title: e.title,
    county: e.county,
    type: e.type,
    date: e.date,
    dateStatus: e.dateStatus,
    campaignImpactScore: e.campaignImpactScore,
    verificationConfidence: e.verificationConfidence,
    effectiveScore: e.effectiveScore,
    verification: e.verification,
    assignment: e.assignment,
    assignmentReason: e.assignmentReason,
    ruralClass: e.ruralClass,
    components: e.components,
  };
}

function writeScheduleMd(slug: string, title: string, rows: CampaignImpactScore[], subtitle: string) {
  writeFileSync(
    path.join(ROUTING, `${slug}.md`),
    `# ${title}

> ${subtitle}

| Date | Event | County | Score | Reason |
| ---- | ----- | ------ | ----: | ------ |
${rows
  .slice(0, 30)
  .map(
    (r) =>
      `| ${formatDateShort(r.date)} | ${r.title.slice(0, 40)}${r.title.length > 40 ? "…" : ""} | ${r.county} | ${r.campaignImpactScore} | ${r.assignmentReason.slice(0, 50)} |`,
  )
  .join("\n") || "| — | — | — | — | — |"}
`,
    "utf8",
  );
}

main();
