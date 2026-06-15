/**
 * Kelly Grappe Campaign Brain — decision intelligence build pipeline.
 *
 * Usage: npm run campaign-brain:build
 * Requires: npm run strategic-plan:operational:build (once)
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

import { ARKANSAS_COUNTY_POPULATION_2020 } from "../strategic-plan/data/arkansas-top-40-cities";
import {
  BRAIN_DATA,
  BRAIN_ROOT,
  loadClusters,
  loadCommunityEvents,
  loadDropOffTotals,
  loadFestivalLeads,
  loadOpportunityCounties,
  loadVci,
  maxOf,
  oppByCountyMap,
  cityInfluenceByCounty,
  vciByCountyMap,
  ARKANSAS_COUNTY_REGISTRY,
  shortCountyName,
  fmt,
  readJson,
} from "./lib/inputs";
import { loadCapturedProgressV2 } from "./lib/feedback-load";
import type { CapturedProgressFile } from "./lib/feedback-types";
import { buildCountyCoverageIndex, loadAllCountyVisits, type CountyVisit } from "./lib/county-coverage";
import { buildEventVerificationMap } from "./lib/build-verification-map";
import { buildFaithIndexByCounty, computeCampaignImpactScore } from "./lib/event-prioritization";
import { classifyEventVerification } from "./lib/event-verification";
import { faithEngagementIndex, priorityLabel } from "./lib/scoring";

const PLAN_ROOT = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan");

function ensureDirs() {
  for (const d of [
    BRAIN_ROOT,
    path.join(BRAIN_ROOT, "decision-intelligence"),
    path.join(BRAIN_ROOT, "layers/clerk-relationships/counties"),
    path.join(BRAIN_ROOT, "layers/faith-engagement/counties"),
    path.join(BRAIN_ROOT, "measurement"),
    path.join(BRAIN_ROOT, "feedback-loops"),
    path.join(BRAIN_ROOT, "weekly-brief"),
    path.join(BRAIN_ROOT, "routing"),
    path.join(BRAIN_ROOT, "calendar-intelligence"),
    path.join(BRAIN_ROOT, "phase-8/week-candidates"),
    path.join(BRAIN_ROOT, "governance"),
    path.join(BRAIN_ROOT, "relational-organizing"),
    path.join(BRAIN_ROOT, "scenario-engine"),
    path.join(BRAIN_ROOT, "executive-narrative"),
    BRAIN_DATA,
  ]) {
    mkdirSync(d, { recursive: true });
  }
}

function buildEventVerification() {
  const events = loadCommunityEvents();
  const festivals = loadFestivalLeads();
  const byStatus: Record<string, number> = {};
  for (const e of events) {
    const s = e.verificationStatus ?? "unknown";
    byStatus[s] = (byStatus[s] ?? 0) + 1;
  }
  const festVerified = festivals.filter((f) => f.date && f.reconcileStatus !== "web_supplemental_lead").length;

  const report = {
    generatedAt: new Date().toISOString(),
    communityEvents: events.length,
    verificationByStatus: byStatus,
    dateNotPosted: byStatus.date_not_posted ?? 0,
    festivalsIndexed: festivals.length,
    festivalsWithDates: festivals.filter((f) => f.date).length,
    festivalsVerified: festVerified,
    actionRequired:
      "Verify fair dates county-by-county before 20-week schedule. Priority: Tier A counties + cluster leaders.",
    priorityCounties: loadOpportunityCounties()
      .filter((c) => c.tier === "A")
      .map((c) => c.county),
  };

  writeFileSync(path.join(BRAIN_ROOT, "decision-intelligence/event-verification-report.json"), JSON.stringify(report, null, 2), "utf8");
  return report;
}

function loadCountyVisitsForScoring(): CountyVisit[] {
  return loadAllCountyVisits(BRAIN_DATA);
}

function loadClerkMeetingsMap(): Map<string, number> {
  const seed = readJson<{ meetings?: Record<string, { meetings?: number }> }>(
    path.join(BRAIN_DATA, "clerk-relationships-seed.json"),
  );
  const map = new Map<string, number>();
  for (const [county, row] of Object.entries(seed?.meetings ?? {})) {
    map.set(county, row.meetings ?? 0);
  }
  return map;
}

function buildRecommendationEngine() {
  const vci = loadVci();
  const opp = loadOpportunityCounties();
  const oppMap = oppByCountyMap(opp);
  const vciMap = vciByCountyMap(vci);
  const cityInfl = cityInfluenceByCounty();
  const events = loadCommunityEvents();
  const clerkMeetings = loadClerkMeetingsMap();
  const maxPop = maxOf(Object.values(ARKANSAS_COUNTY_POPULATION_2020));

  const maxVci = maxOf(vci.map((c) => c.vci));
  const maxRecovery = maxOf(opp.map((c) => c.dropOffRecovery50));
  const maxReg = maxOf(opp.map((c) => c.registrationGoal));
  const maxRep = maxOf(opp.map((c) => c.republicanConversionPotential));

  const faithMap = buildFaithIndexByCounty(oppMap, maxPop);
  const coverageByCounty = new Map(
    buildCountyCoverageIndex(loadCountyVisitsForScoring()).counties.map((c) => [c.county, c]),
  );
  const { byEventId: verificationByEventId } = buildEventVerificationMap();

  const eventScores = events
    .map((e) => {
      const verification =
        verificationByEventId.get(e.id) ??
        classifyEventVerification({ eventId: e.id, rawVerificationStatus: e.verificationStatus });
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
    })
    .sort((a, b) => b.effectiveScore - a.effectiveScore || b.campaignImpactScore - a.campaignImpactScore);

  const topEvents = eventScores.slice(0, 25);

  writeFileSync(
    path.join(BRAIN_ROOT, "decision-intelligence/campaign-impact-scores.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), total: eventScores.length, top25: topEvents, all: eventScores }, null, 2),
    "utf8",
  );

  writeFileSync(
    path.join(BRAIN_ROOT, "decision-intelligence/event-scores.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: eventScores.length,
        note: "Legacy alias — use campaign-impact-scores.json. Scored by strategy-first Campaign Impact Score.",
        top25: topEvents.map((e) => ({
          eventId: e.eventId,
          title: e.title,
          county: e.county,
          type: e.type,
          overallScore: e.campaignImpactScore,
          candidate: e.assignment,
          recommendedAttendance: e.campaignImpactScore >= 55 ? "YES" : e.campaignImpactScore >= 35 ? "MAYBE" : "NO",
          verificationStatus: e.verificationStatus,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );

  const md = `# Campaign Impact Scores

> Strategy scores the calendar — ${eventScores.length} events ranked by Campaign Impact Score

## Top 5 events

${topEvents
  .slice(0, 5)
  .map(
    (e) => `### ${e.title} (${e.county} County)

**Campaign Impact Score:** ${e.campaignImpactScore}/100 · **Effective:** ${e.effectiveScore} (${e.verification})

| VCI | Lane 2 | Registration | GOP | Coverage | Attendance |
| --: | -----: | -----------: | --: | -------: | ---------: |
| ${e.components.countyVci} | ${e.components.lane2Recovery} | ${e.components.registrationGoal} | ${e.components.gopConversion} | ${e.components.countyCoverageNeed} | ${e.components.eventAttendance} |

- **Assignment:** ${e.assignment} — ${e.assignmentReason}
- **Verification:** ${e.verificationStatus}
`,
  )
  .join("\n")}

*Full data:* [\`campaign-impact-scores.json\`](./campaign-impact-scores.json) · [Master calendar](../routing/master-priority-calendar.md)
`;

  writeFileSync(path.join(BRAIN_ROOT, "decision-intelligence/event-scores.md"), md, "utf8");
  return { eventScores, topEvents };
}

function buildClusterPriority(captured: CapturedProgressFile) {
  const clusters = loadClusters();
  const rows = clusters.map((c) => {
    const potential = c.combined.victoryContributionIndex;
    const capturedAmount = captured.byCluster[c.id]?.capturedVci ?? 0;
    const remaining = Math.max(0, potential - capturedAmount);
    return {
      id: c.id,
      name: c.name,
      potential,
      captured: capturedAmount,
      remaining,
      priority: priorityLabel(remaining, potential),
      recommendedVisits: c.recommendedVisits,
      lane2: c.combined.lane2Recovery50,
      registrationGoal: c.combined.registrationGoal,
      lane4: c.combined.lane4ConversionPotential,
    };
  });

  rows.sort((a, b) => b.remaining - a.remaining);

  writeFileSync(
    path.join(BRAIN_ROOT, "decision-intelligence/cluster-priority.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), clusters: rows }, null, 2),
    "utf8",
  );
  return rows;
}

function buildClerkLayer() {
  const seed = readJson<{
    meetings: Record<string, { status: string; meetings: number; followUps: number; priority: string; source?: string }>;
    defaultPriorityByTier: Record<string, string>;
  }>(path.join(BRAIN_DATA, "clerk-relationships-seed.json"))!;
  const opp = oppByCountyMap(loadOpportunityCounties());

  const counties = ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const county = shortCountyName(reg.displayName);
    const tier = opp.get(county)?.tier ?? "D";
    const seedRow = seed.meetings[county];
    const status = seedRow?.status ?? "Unknown";
    const meetings = seedRow?.meetings ?? 0;
    const followUps = seedRow?.followUps ?? 0;
    let priority = seedRow?.priority ?? seed.defaultPriorityByTier[tier] ?? "Low";
    if (status === "Unknown" && (tier === "A" || tier === "B")) priority = "High";

    return { county, slug: reg.slug, status, meetings, followUps, priority, tier, source: seedRow?.source };
  });

  writeFileSync(path.join(BRAIN_ROOT, "layers/clerk-relationships/index.json"), JSON.stringify({ generatedAt: new Date().toISOString(), counties }, null, 2), "utf8");

  for (const c of counties) {
    writeFileSync(
      path.join(BRAIN_ROOT, "layers/clerk-relationships/counties", `${c.slug}.md`),
      `# ${c.county} County — Clerk Relationship

| Field | Value |
| ----- | ----- |
| Status | **${c.status}** |
| Meetings | ${c.meetings} |
| Follow-ups | ${c.followUps} |
| Priority | **${c.priority}** |
| Opportunity tier | ${c.tier} |

${c.source ? `*Source: ${c.source}*` : "*Update from field CRM — SOS race clerk relationships are a scheduling priority.*"}
`,
      "utf8",
    );
  }
  return counties;
}

function buildFaithLayer() {
  const opp = oppByCountyMap(loadOpportunityCounties());
  const maxPop = maxOf(Object.values(ARKANSAS_COUNTY_POPULATION_2020));

  const counties = ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const county = shortCountyName(reg.displayName);
    const pop = ARKANSAS_COUNTY_POPULATION_2020[county] ?? 10_000;
    const fei = faithEngagementIndex(county, opp.get(county), pop, maxPop);
    return { county, slug: reg.slug, faithEngagementIndex: fei, tier: opp.get(county)?.tier };
  });

  counties.sort((a, b) => b.faithEngagementIndex - a.faithEngagementIndex);

  writeFileSync(path.join(BRAIN_ROOT, "layers/faith-engagement/index.json"), JSON.stringify({ generatedAt: new Date().toISOString(), note: "Proxy FEI until church-count ingest", counties }, null, 2), "utf8");

  for (const c of counties) {
    writeFileSync(
      path.join(BRAIN_ROOT, "layers/faith-engagement/counties", `${c.slug}.md`),
      `# ${c.county} County — Faith Engagement Index

| Field | Value |
| ----- | ----: |
| Faith Engagement Index | **${c.faithEngagementIndex}**/100 |
| Opportunity tier | ${c.tier} |

## Integration

- Christian congregational outreach
- Interfaith opportunities (Muslim, Jewish, faith-based service orgs)
- Pastor networks and minister alliances
- Faith event calendar (see event-intelligence/faith-events)

*Proxy model — replace with church counts and pastoral network maps when ingested.*
`,
      "utf8",
    );
  }
  return counties;
}

function buildScenarioEngine() {
  const dropOff = loadDropOffTotals();
  const win = readJson<{ statewide: { statewideBaselineVotes: number } }>(path.join(process.cwd(), "data/election/kelly-win-target-scenario-v1.json"))!;
  const opp = loadOpportunityCounties();
  const clusters = loadClusters();
  const vci = loadVci();

  const baseline = win.statewide.statewideBaselineVotes;
  const l2pot = dropOff.rawDropOff;
  const l2goal = dropOff.recovery50Total;
  const l2stretch = Math.round(l2pot * 0.75);
  const l3goal = 50_000;
  const l4goal = Math.round(opp.reduce((s, c) => s + c.republicanConversionPotential, 0));

  const scenarios = {
    conservative: {
      label: "Conservative",
      rates: { lane2: 0.35, lane3: 0.4, lane4: 0.25 },
      projectedVotes: Math.round(baseline + l2goal * 0.35 + l3goal * 0.4 + l4goal * 0.25),
    },
    expected: {
      label: "Expected",
      rates: { lane2: 0.5, lane3: 0.6, lane4: 0.4 },
      projectedVotes: Math.round(baseline + l2goal * 0.5 + l3goal * 0.6 + l4goal * 0.4),
    },
    aggressive: {
      label: "Aggressive",
      rates: { lane2: 0.75, lane3: 0.9, lane4: 0.55 },
      projectedVotes: Math.round(baseline + l2stretch * 0.75 + l3goal * 0.9 + l4goal * 0.55),
    },
  };

  const laneContribution = (rates: { lane2: number; lane3: number; lane4: number }) => ({
    lane1_retention: baseline,
    lane2_reactivation: Math.round(l2goal * rates.lane2),
    lane3_registration: Math.round(l3goal * rates.lane3),
    lane4_conversion: Math.round(l4goal * rates.lane4),
  });

  const topCounties = vci.slice(0, 15).map((c) => {
    const o = opp.find((x) => x.county === c.county)!;
    return {
      county: c.county,
      vci: c.vci,
      expectedContribution: Math.round(c.vci * (scenarios.expected.projectedVotes / vci.reduce((s, x) => s + x.vci, 0))),
      lane2: o.dropOffRecovery50,
      lane3: o.registrationGoal,
      lane4: o.republicanConversionPotential,
    };
  });

  const clusterContribution = clusters.map((c) => ({
    name: c.name,
    vci: c.combined.victoryContributionIndex,
    shareOfExpected: Number(
      (c.combined.victoryContributionIndex / clusters.reduce((s, x) => s + x.combined.victoryContributionIndex, 0)).toFixed(3),
    ),
  }));

  const output = {
    generatedAt: new Date().toISOString(),
    pluralityRange: { low: 390_000, high: 420_000 },
    scenarios: {
      conservative: { ...scenarios.conservative, lanes: laneContribution(scenarios.conservative.rates), votes: scenarios.conservative.projectedVotes },
      expected: { ...scenarios.expected, lanes: laneContribution(scenarios.expected.rates), votes: scenarios.expected.projectedVotes },
      aggressive: { ...scenarios.aggressive, lanes: laneContribution(scenarios.aggressive.rates), votes: scenarios.aggressive.projectedVotes },
    },
    topCounties,
    clusterContribution,
  };

  writeFileSync(path.join(BRAIN_ROOT, "scenario-engine/scenarios.json"), JSON.stringify(output, null, 2), "utf8");

  const md = `# Scenario Engine

| Scenario | Projected votes | Plurality range |
| -------- | --------------: | --------------- |
| Conservative | **${fmt(scenarios.conservative.projectedVotes)}** | ${scenarios.conservative.projectedVotes >= 390_000 ? "In range" : "Below"} |
| Expected | **${fmt(scenarios.expected.projectedVotes)}** | In range |
| Aggressive | **${fmt(scenarios.aggressive.projectedVotes)}** | ${scenarios.aggressive.projectedVotes >= 420_000 ? "Stretch" : "In range"} |

## Lane contribution (Expected)

| Lane | Votes |
| ---- | ----: |
| Lane 1 Retention | ${fmt(laneContribution(scenarios.expected.rates).lane1_retention)} |
| Lane 2 Reactivation | ${fmt(laneContribution(scenarios.expected.rates).lane2_reactivation)} |
| Lane 3 Registration | ${fmt(laneContribution(scenarios.expected.rates).lane3_registration)} |
| Lane 4 Conversion | ${fmt(laneContribution(scenarios.expected.rates).lane4_conversion)} |

*Full model:* [\`scenarios.json\`](./scenarios.json)
`;

  writeFileSync(path.join(BRAIN_ROOT, "scenario-engine/README.md"), md, "utf8");
  return output;
}

function buildNextWeekRecommendation(
  clusterPriority: ReturnType<typeof buildClusterPriority>,
  topEvents: ReturnType<typeof buildRecommendationEngine>["topEvents"],
) {
  const topCluster = clusterPriority[0];
  const focusCounties = new Set(
    loadClusters()
      .find((c) => c.id === topCluster.id)
      ?.counties.slice(0, 4) ?? [],
  );

  const clusterEvents = topEvents.filter((e) => focusCounties.has(e.county)).slice(0, 3);
  const cities =
    readJson<{ cities: Array<{ name: string; county: string; targetVotes: number; rank: number }> }>(
      path.join(PLAN_ROOT, "part-iii-arkansas-battlefield/chapter-07-top-40-city-strategy/top-40-city-summary.json"),
    )?.cities.filter((c) => focusCounties.has(c.county)).slice(0, 2) ?? [];

  const rec = {
    generatedAt: new Date().toISOString(),
    question: "What should Kelly do next week?",
    primaryCluster: {
      name: topCluster.name,
      remainingOpportunity: topCluster.remaining,
      priority: topCluster.priority,
    },
    focusCities: cities.map((c) => ({ name: c.name, county: c.county, targetVotes: c.targetVotes })),
    recommendedEvents: clusterEvents.map((e) => ({
      title: e.title,
      county: e.county,
      score: e.campaignImpactScore,
      assignment: e.assignment,
      assignmentReason: e.assignmentReason,
    })),
    laneFocus: ["Lane 2 Recovery", "Lane 3 Registration", "Clerk relationship outreach"],
    kellyPersonalAppearances: clusterEvents.filter((e) => e.assignment === "Kelly").length,
    surrogateDeployments: clusterEvents.filter((e) => e.assignment === "Congressional" || e.assignment === "Senate").length,
    narrative:
      `Prioritize ${topCluster.name} — ${fmt(topCluster.remaining)} VCI remaining. Lead with drop-off recovery conversations and registration drives in ${cities.map((c) => c.name).join(" and ") || "cluster county seats"}.`,
  };

  writeFileSync(path.join(BRAIN_ROOT, "decision-intelligence/next-week-recommendation.json"), JSON.stringify(rec, null, 2), "utf8");

  const md = `# What Should Kelly Do Next Week?

> Generated ${new Date().toISOString().slice(0, 10)}

## Answer

${rec.narrative}

---

## Primary cluster

**${topCluster.name}** — Priority **${topCluster.priority}**

| Potential | Captured | Remaining |
| --------- | -------: | --------: |
| ${fmt(topCluster.potential)} | ${fmt(topCluster.captured)} | **${fmt(topCluster.remaining)}** |

---

## Focus cities

${cities.map((c) => `- **${c.name}** (${c.county}) — ${fmt(c.targetVotes)} target votes`).join("\n") || "- Assign from cluster county seats"}

---

## Recommended events

${clusterEvents.map((e) => `### ${e.title}

- **Campaign Impact Score:** ${e.campaignImpactScore}/100
- **Deploy:** ${e.assignment} — ${e.assignmentReason}
- **Rural class:** ${e.ruralClass}
`).join("\n") || "*Verify event dates — see routing/master-priority-calendar.md*"}

---

## Lane focus

${rec.laneFocus.map((l) => `- ${l}`).join("\n")}
`;

  writeFileSync(path.join(BRAIN_ROOT, "decision-intelligence/next-week-recommendation.md"), md, "utf8");
  return rec;
}

function writeBrainReadme() {
  writeFileSync(
    path.join(BRAIN_ROOT, "README.md"),
    `# Kelly Grappe Campaign Brain

> Decision-support platform for the final 20 weeks — not a document archive.

---

## Layers

| Layer | Contents |
| ----- | -------- |
| **Strategic** | [Plurality Victory Plan](../strategic-plan/plurality-victory-plan/README.md) — theory, math, playbooks, cities |
| **Operational** | Event intelligence, VCI, registration, drop-off, deployment priority |
| **Command** | Four lanes dashboard, clusters, victory projection |
| **Decision Intelligence** | [Recommendations](./decision-intelligence/) — answers *what next* |

---

## Decision outputs

| Output | Question |
| ------ | -------- |
| [Weekly Brief](./weekly-brief/LATEST.md) | Leadership meeting packet |
| [Next week recommendation](./decision-intelligence/next-week-recommendation.md) | What should Kelly do next week? |
| [Captured opportunity](./measurement/captured-opportunity.md) | Potential vs captured vs remaining |
| [Event learning](./feedback-loops/event-learning.md) | Was the recommendation correct? |
| [Campaign impact scores](./decision-intelligence/campaign-impact-scores.json) | Strategy-first event ranking |
| [Master priority calendar](./routing/master-priority-calendar.md) | Kelly calendar — score × verification |
| [Event verification](./calendar-intelligence/event-verification-index.md) | Verified / Tentative / Historical / Missing |
| [County coverage completion](./measurement/county-coverage-completion.md) | Planned vs completed contacts |
| [No county left behind](./routing/no-county-left-behind-alerts.md) | 45-day guardrail alerts |
| [Week candidates](./phase-8/week-candidates/LATEST.md) | Phase 8 — approve before lock |
| [Scenario engine](./scenario-engine/README.md) | Conservative / expected / aggressive paths |
| [Clerk relationships](./layers/clerk-relationships/index.json) | SOS race clerk scheduling factor |
| [Faith engagement](./layers/faith-engagement/index.json) | County faith routing index |

---

## Build

\`\`\`bash
npm run strategic-plan:operational:build   # once — data foundation
npm run campaign-brain:build               # decision intelligence
\`\`\`

Update [\`data/campaign-brain/captured-progress.json\`](../../data/campaign-brain/captured-progress.json) as field work captures opportunity.

---

## Executive narrative

- [The Story of How We Win](./executive-narrative/THE-STORY-OF-HOW-WE-WIN.md)
- [Candidate](./executive-narrative/candidate-version.md) · [Donor](./executive-narrative/donor-version.md) · [County chair](./executive-narrative/county-chair-version.md) · [Volunteer](./executive-narrative/volunteer-version.md)

## Execution phase

- [Governance checkpoint](./governance/GOVERNANCE-CHECKPOINT.md) — is the org feeding the Brain?
- [Brain health dashboard](./governance/brain-health-dashboard.md) — five accountability metrics
- [Monday leadership rhythm](./governance/MONDAY-LEADERSHIP-RHYTHM.md)
- [Operation Calendar Truth](./operations/OPERATION-CALENDAR-TRUTH.md)
- [Relational Organizing Engine](./relational-organizing/OPERATING-DOCTRINE.md) · [Relationship Capital](./relational-organizing/relationship-capital-dashboard.md)

## Field feedback

Update [\`data/campaign-brain/captured-progress.json\`](../../data/campaign-brain/captured-progress.json) and [\`event-outcomes.json\`](../../data/campaign-brain/event-outcomes.json) after each event.
`,
    "utf8",
  );
}

async function main() {
  ensureDirs();

  if (!existsSync(path.join(PLAN_ROOT, "command-center/victory-contribution-index.json"))) {
    console.error("Run npm run strategic-plan:operational:build first.");
    process.exit(1);
  }

  const captured = loadCapturedProgressV2();
  const capturedPath = path.join(BRAIN_DATA, "captured-progress.json");
  const existing = readJson<{ version?: number }>(capturedPath);
  if (!existsSync(capturedPath) || existing?.version !== 2) {
    writeFileSync(capturedPath, JSON.stringify(captured, null, 2), "utf8");
  }

  const verification = buildEventVerification();
  const { topEvents } = buildRecommendationEngine();
  const clusterPriority = buildClusterPriority(captured);
  buildClerkLayer();
  buildFaithLayer();
  const scenarios = buildScenarioEngine();
  const nextWeek = buildNextWeekRecommendation(clusterPriority, topEvents);
  writeBrainReadme();

  execSync("npx tsx scripts/campaign-brain/build-event-verification-sprint.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-fairs-festivals-optimizer.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-county-coverage-completion.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-captured-opportunity-layer.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-event-learning.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-executive-narratives.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-week-candidates.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-weekly-executive-packet.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-relationship-capital-dashboard.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-calendar-truth-sprint.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-field-operating-system.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-people-power-operating-system.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-motion-storytelling-engine.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-forward-motion-activation.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-relationship-influence-network.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-coalition-power-map.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-endorsement-acquisition-system.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-voter-contact-gotv-system.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/campaign-brain/build-brain-health-dashboard.ts", { stdio: "inherit" });
  execSync("npx tsx scripts/build-election-plan-workbench.ts", { stdio: "inherit" });

  writeFileSync(
    path.join(BRAIN_DATA, "last-brain-build.json"),
    JSON.stringify({ completedAt: new Date().toISOString(), command: "campaign-brain:build" }, null, 2),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(
    `Campaign Brain built. Next week: ${nextWeek.primaryCluster.name} (${nextWeek.primaryCluster.priority}). Events scored: ${verification.communityEvents}. Expected scenario: ${scenarios.scenarios.expected.votes.toLocaleString()} votes.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
