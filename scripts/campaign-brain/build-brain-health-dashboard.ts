/**
 * Campaign Brain Health Dashboard — accountability layer (not planning).
 *
 * Usage: npm run campaign-brain:health:build
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, loadCommunityEvents, loadOpportunityCounties, readJson } from "./lib/inputs";
import { buildEventVerificationMap } from "./lib/build-verification-map";
import { allCountyNames, buildCountyCoverageIndex, loadAllCountyVisits } from "./lib/county-coverage";
import { verificationSummary } from "./lib/event-verification";
import { loadEventOutcomes } from "./lib/feedback-load";

const GOV = path.join(BRAIN_ROOT, "governance");

type HealthGoal = {
  goal: number;
  direction: "up" | "down";
  label: string;
  unit?: "percent" | "days_max";
};

function daysSince(iso: string): number {
  const then = new Date(`${iso.slice(0, 10)}T12:00:00.000Z`);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function status(current: number, goal: number, direction: "up" | "down", unit?: string): "healthy" | "warning" | "critical" {
  if (unit === "days_max") {
    if (current <= goal) return "healthy";
    if (current <= goal + 3) return "warning";
    return "critical";
  }
  if (unit === "percent") {
    if (current >= goal) return "healthy";
    if (current >= goal * 0.5) return "warning";
    return "critical";
  }
  if (direction === "up") {
    if (current >= goal) return "healthy";
    if (current >= goal * 0.5) return "warning";
    return "critical";
  }
  if (current <= goal) return "healthy";
  if (current <= goal * 2) return "warning";
  return "critical";
}

function main() {
  mkdirSync(GOV, { recursive: true });

  const { records } = buildEventVerificationMap();
  const vSummary = verificationSummary(records);
  const coverage = buildCountyCoverageIndex(loadAllCountyVisits(BRAIN_DATA));
  const outcomes = loadEventOutcomes();
  const visits = loadAllCountyVisits(BRAIN_DATA);

  const lastBuildPath = path.join(BRAIN_DATA, "last-brain-build.json");
  const lastBuild = readJson<{ completedAt: string }>(lastBuildPath);
  const daysSinceUpdate = lastBuild?.completedAt ? daysSince(lastBuild.completedAt) : null;

  const eligibleForOutcome = visits.length;
  const outcomeReportPct =
    eligibleForOutcome > 0 ? Math.round((outcomes.length / eligibleForOutcome) * 1000) / 10 : 100;

  const ownersData = readJson<{
    counties?: Array<{ county: string; owner: string; status: string }>;
    owners?: Record<string, string>;
  }>(path.join(BRAIN_DATA, "county-contact-owners.json"));
  const countiesWithOwner = ownersData?.counties
    ? ownersData.counties.filter((c) => c.owner?.trim()).length
    : allCountyNames().filter((c) => ownersData?.owners?.[c]?.trim()).length;
  const countyOwnerCoveragePct = Math.round((countiesWithOwner / 75) * 1000) / 10;

  const velocity = readJson<{
    verifiedThisWeek: number;
    verifiedLastWeek: number;
    weeklyDelta: number;
    projectedCompletionDate300: string;
    currentVerified: number;
    goal: number;
  }>(path.join(BRAIN_DATA, "verification-velocity.json"));

  const goals = readJson<{ metrics: Record<string, HealthGoal> }>(
    path.join(BRAIN_DATA, "brain-health-goals.json"),
  )?.metrics;

  const current = {
    verifiedEvents: vSummary.verified,
    countiesCovered: coverage.visitedThisCycle,
    guardrailViolations: coverage.guardrailViolations,
    outcomeReportPct,
    outcomeReportsSubmitted: outcomes.length,
    outcomeReportsEligible: eligibleForOutcome,
    daysSinceLastBrainUpdate: daysSinceUpdate,
    lastBrainBuild: lastBuild?.completedAt ?? null,
    countiesWithContactOwner: countiesWithOwner,
    countyOwnerCoveragePct,
    verifiedThisWeek: velocity?.verifiedThisWeek ?? vSummary.verified,
    verifiedLastWeek: velocity?.verifiedLastWeek ?? 0,
    verificationWeeklyDelta: velocity?.weeklyDelta ?? 0,
    projectedCompletionDate300: velocity?.projectedCompletionDate300 ?? "—",
  };

  const rows = goals
    ? Object.entries(goals).map(([key, g]) => {
        const raw = current[key as keyof typeof current];
        const cur = typeof raw === "number" ? raw : key === "daysSinceLastBrainUpdate" ? (daysSinceUpdate ?? 999) : 0;
        return {
          key,
          label: g.label,
          current: key === "daysSinceLastBrainUpdate" && daysSinceUpdate === null ? null : cur,
          goal: g.goal,
          unit: g.unit,
          direction: g.direction,
          health:
            key === "daysSinceLastBrainUpdate" && daysSinceUpdate === null
              ? "critical"
              : status(cur as number, g.goal, g.direction, g.unit),
        };
      })
    : [];

  const oppMap = new Map(loadOpportunityCounties().map((c) => [c.county, c.tier]));
  const communityEvents = loadCommunityEvents();
  const verificationMap = new Map(records.map((r) => [r.eventId, r]));

  const fairs = communityEvents.filter((e) => e.type === "county_fair");
  const fairsVerified = fairs.filter((e) => verificationMap.get(e.id)?.status === "verified").length;

  const tierAEvents = communityEvents.filter((e) => oppMap.get(e.county) === "A");
  const tierAVerified = tierAEvents.filter((e) => verificationMap.get(e.id)?.status === "verified").length;
  const tierATotal = tierAEvents.length;

  const exitCriteria = {
    verifiedEvents300Plus: { met: current.verifiedEvents >= 300, current: current.verifiedEvents, required: 300 },
    allCountyFairsVerified: {
      met: fairsVerified >= 75,
      current: `${fairsVerified}/75 verified`,
      required: "75/75",
    },
    tierACountyEventsVerified: {
      met: tierAVerified >= tierATotal && tierATotal > 0,
      current: `${tierAVerified}/${tierATotal} Tier A events verified`,
      required: "100% Tier A",
    },
    guardrailViolationsBelow10: {
      met: current.guardrailViolations < 10,
      current: current.guardrailViolations,
      required: "<10",
    },
    everyCountyContactOwner: {
      met: countiesWithOwner >= 75,
      current: `${countiesWithOwner}/75`,
      required: "75/75",
    },
    weeklyUpdateCadence: {
      met: (daysSinceUpdate ?? 999) <= 7,
      current: daysSinceUpdate === null ? "never" : `${daysSinceUpdate} days`,
      required: "≤7 days",
    },
    outcomeReportingAbove90: {
      met: current.outcomeReportPct >= 90,
      current: `${current.outcomeReportPct}%`,
      required: "≥90%",
    },
    readyToLockWeeks1to20: false,
  };
  exitCriteria.readyToLockWeeks1to20 = [
    exitCriteria.verifiedEvents300Plus,
    exitCriteria.allCountyFairsVerified,
    exitCriteria.tierACountyEventsVerified,
    exitCriteria.guardrailViolationsBelow10,
    exitCriteria.everyCountyContactOwner,
    exitCriteria.weeklyUpdateCadence,
    exitCriteria.outcomeReportingAbove90,
  ].every((c) => c.met);

  const output = {
    generatedAt: new Date().toISOString(),
    principle: "If these numbers improve, the Brain improves. If they stagnate, recommendation quality declines.",
    health: rows,
    current,
    calendarTruthExit: exitCriteria,
  };

  writeFileSync(path.join(GOV, "brain-health-dashboard.json"), JSON.stringify(output, null, 2), "utf8");

  const healthLabel = (h: string) => (h === "healthy" ? "Healthy" : h === "warning" ? "Warning" : "Critical");

  const md = `# Campaign Brain Health Dashboard

> Accountability layer — not planning. Is the organization feeding the Brain?

Updated: ${new Date().toISOString().slice(0, 10)}

---

## Five metrics

| Metric | Current | Goal | Status |
| ------ | ------: | ---: | ------ |
${rows
  .map((r) => {
    const cur =
      r.unit === "percent"
        ? `${r.current}% (${current.outcomeReportsSubmitted}/${current.outcomeReportsEligible} visits)`
        : r.unit === "days_max"
          ? r.current === null || r.current === undefined
            ? "—"
            : `${r.current} days`
          : String(r.current);
    return `| ${r.label} | **${cur}** | ${r.unit === "percent" ? "100%" : r.unit === "days_max" ? "≤7" : r.goal} | ${healthLabel(r.health)} |`;
  })
  .join("\n")}

---

## System readiness

**Outcome reporting:** ${current.outcomeReportsSubmitted} of ${current.outcomeReportsEligible} visits have outcome reports (${current.outcomeReportPct}%).

**Last Brain update:** ${lastBuild?.completedAt ?? "Never"}${daysSinceUpdate !== null ? ` (${daysSinceUpdate} days ago)` : ""}

**County contact owners:** ${countiesWithOwner}/75 assigned (${current.countyOwnerCoveragePct}%) — [assignment dashboard](./county-owner-assignment-dashboard.md) · [\`county-contact-owners.json\`](../../data/campaign-brain/county-contact-owners.json)

---

## Verification velocity (Sprint 01)

| Metric | Value |
| ------ | ----: |
| Verified events (total) | **${current.verifiedEvents}** / 300 |
| Verified this week | ${current.verifiedThisWeek} |
| Verified last week | ${current.verifiedLastWeek} |
| Weekly delta | ${current.verificationWeeklyDelta >= 0 ? "+" : ""}${current.verificationWeeklyDelta} |
| Projected completion (300+) | ${current.projectedCompletionDate300} |

Workbench: [calendar-truth-workbench](../operations/calendar-truth-workbench/README.md)

---

## Operation Calendar Truth — exit criteria

| Criterion | Status | Current |
| --------- | ------ | ------- |
| 300+ verified events | ${exitCriteria.verifiedEvents300Plus.met ? "Met" : "Open"} | ${exitCriteria.verifiedEvents300Plus.current} |
| All 75 county fairs verified | ${exitCriteria.allCountyFairsVerified.met ? "Met" : "Open"} | ${exitCriteria.allCountyFairsVerified.current} |
| Tier A county events verified | ${exitCriteria.tierACountyEventsVerified.met ? "Met" : "Open"} | ${exitCriteria.tierACountyEventsVerified.current} |
| Guardrail violations < 10 | ${exitCriteria.guardrailViolationsBelow10.met ? "Met" : "Open"} | ${exitCriteria.guardrailViolationsBelow10.current} |
| Every county has contact owner | ${exitCriteria.everyCountyContactOwner.met ? "Met" : "Open"} | ${exitCriteria.everyCountyContactOwner.current} |
| Weekly update cadence (≤7 days) | ${exitCriteria.weeklyUpdateCadence.met ? "Met" : "Open"} | ${exitCriteria.weeklyUpdateCadence.current} |
| Outcome reporting (≥90%) | ${exitCriteria.outcomeReportingAbove90.met ? "Met" : "Open"} | ${exitCriteria.outcomeReportingAbove90.current} |

**Ready to lock Weeks 1–20 (Phase 9):** ${exitCriteria.readyToLockWeeks1to20 ? "**YES**" : "**NO** — achieve Calendar Truth first"}

---

## The discipline

The Brain needs verified dates · contacts · outcomes · visit logs.

The campaign produces travel · events · conversations · registrations.

**Success = the second consistently updates the first.**

*Full data:* [\`brain-health-dashboard.json\`](./brain-health-dashboard.json)
`;

  writeFileSync(path.join(GOV, "brain-health-dashboard.md"), md, "utf8");
  writeFileSync(
    path.join(GOV, "README.md"),
    `# Campaign Brain Governance

> Architecture frozen. Accountability active.

| Document | Purpose |
| -------- | ------- |
| [Health dashboard](./brain-health-dashboard.md) | Five metrics · exit criteria · verification velocity |
| [County owner assignment](./county-owner-assignment-dashboard.md) | 75/75 owner coverage |
| [Monday leadership rhythm](./MONDAY-LEADERSHIP-RHYTHM.md) | Weekly meeting structure |
| [Governance checkpoint](./GOVERNANCE-CHECKPOINT.md) | Is the org prepared to feed the Brain? |

\`\`\`bash
npm run campaign-brain:health:build
\`\`\`
`,
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(
    `Brain health: ${current.verifiedEvents} verified · ${current.countiesCovered}/75 counties · ${current.guardrailViolations} violations · ${current.outcomeReportPct}% outcomes reported · ${daysSinceUpdate ?? "—"} days since update.`,
  );
}

main();
