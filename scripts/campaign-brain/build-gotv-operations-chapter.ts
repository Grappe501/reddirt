/**
 * Executive Book Chapter 8 — Arkansas GOTV Operations Plan.
 * Field manual synthesized from existing plan artifacts. Not a new Brain phase.
 *
 * Usage: npm run campaign-brain:gotv-operations:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const EXEC_BOOK = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan/executive-book-v1");
const OUT_DATA = path.join(BRAIN_DATA, "gotv");
const PLAN_SNAPSHOT = path.join(process.cwd(), "data/election-plan/election-plan-workbench.snapshot.json");
const PASS = "GOTV-OPERATIONS-PLAN-1.0";
const ELECTION_DAY = "2026-11-03";
const EARLY_VOTING_START = "2026-10-20";

const DELTA_COUNTIES = [
  "Crittenden",
  "Mississippi",
  "St. Francis",
  "Phillips",
  "Monroe",
  "Chicot",
  "Ashley",
  "Lincoln",
];

const DISCLAIMER =
  "Field operations manual — planning document. Assign owners before execution. Not legal advice. Not individual voter targeting automation.";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

const TOP_10_FALLBACK = [
  "Little Rock",
  "Fort Smith",
  "Fayetteville",
  "Springdale",
  "Jonesboro",
  "North Little Rock",
  "Conway",
  "Rogers",
  "Bentonville",
  "Pine Bluff",
];

function loadCityTiers(): { top10: string[]; top40: string[] } {
  const plan = readJson<{ cities?: Array<{ name: string; isTop10?: boolean }> }>(PLAN_SNAPSHOT);
  const cities = plan?.cities ?? [];
  if (cities.length > 0) {
    return {
      top10: cities.filter((c) => c.isTop10).map((c) => c.name),
      top40: cities.map((c) => c.name),
    };
  }
  return { top10: TOP_10_FALLBACK, top40: TOP_10_FALLBACK };
}

function buildChapter(): string {
  const vc = readJson<{
    humanContactIndex?: { total?: number; goal?: number };
    tracks?: {
      lane2Reactivation?: { turnoutTarget?: number };
      lane3Registration?: { goal?: number };
    };
    channels?: Array<{ id: string; label: string; goal: number; primaryMetric: number }>;
  }>(path.join(BRAIN_DATA, "voter-contact-summary.json"));

  const strike = readJson<{ counties?: unknown[] }>(path.join(BRAIN_DATA, "county-strike-teams.json"));
  const sherwood = readJson<{
    goal?: string;
    event?: { name?: string; vipTablePrice?: number; showTicketPrice?: number };
    tracking?: { vipTablesGoal?: number };
  }>(path.join(BRAIN_DATA, "win-sherwood-operation.json"));

  const { top10, top40 } = loadCityTiers();

  const phoneGoal = vc?.channels?.find((c) => c.id === "phoneBank")?.goal ?? 29_000;
  const postcardGoal = vc?.channels?.find((c) => c.id === "postcard")?.goal ?? 48_000;
  const canvassGoal = vc?.channels?.find((c) => c.id === "canvass")?.goal ?? 60_000;
  const gotvGoal = vc?.channels?.find((c) => c.id === "gotv")?.goal ?? 15_000;
  const po5Goal = vc?.channels?.find((c) => c.id === "powerOf5")?.goal ?? 25_000;
  const hciGoal = vc?.humanContactIndex?.goal ?? 250_000;
  const lane2Target = vc?.tracks?.lane2Reactivation?.turnoutTarget ?? 51_051;
  const regGoal = vc?.tracks?.lane3Registration?.goal ?? 50_000;

  const weeklyCalls = Math.round(phoneGoal / 9);
  const weeklyPostcards = Math.round(postcardGoal / 9);
  const weeklyDoors = Math.round(canvassGoal / 9);

  return `# Arkansas GOTV Operations Plan

> ${PASS} · **Executive Book Chapter 8 — Field manual**

**Election Day:** ${ELECTION_DAY} · **Early voting begins:** ${EARLY_VOTING_START}

> It is October 19. How exactly do we win Election Day? **This chapter answers that question.**

${DISCLAIMER}

---

## Section 1 — Win Condition

To win Arkansas Secretary of State in a three-candidate plurality race:

1. **Hold Democratic base vote** — Lane 1 retention
2. **Recover ${fmt(lane2Target)} drop-off voters** — Lane 2 reactivation @ 50%
3. **Register ${fmt(regGoal)} new voters** — Lane 3 registration
4. **Convert targeted Republicans and Independents** — Lane 4 persuasion
5. **Turn those voters into ballots** — GOTV execution

### Election Day success

\`\`\`
Election Day success = Ballots Cast
\`\`\`

Human Contact Index (${fmt(hciGoal)} goal) measures **relationship depth**. GOTV measures **ballots**. Both are required.

---

## Section 2 — Target Universe

| Tier | Universe | GOTV priority |
|------|----------|---------------|
| **Tier 1** | Top 10 Cities | Highest — daily contact Sep–Nov |
| **Tier 2** | Top 40 Cities | High — weekly contact cycles |
| **Tier 3** | Delta Corridor (8 counties) | High — repeat contact + NAACP/educator networks |
| **Tier 4** | County Completion counties | Medium — captain-led local ops |
| **Tier 5** | Statewide low-propensity Democrats | Ongoing — phone · postcard · Power of 5 |

### Tier 1 — Top 10 Cities

${top10.map((c) => `- ${c}`).join("\n")}

### Tier 2 — Top 40 Cities

${top40.slice(0, 40).map((c) => `- ${c}`).join("\n")}

### Tier 3 — Delta Corridor

${DELTA_COUNTIES.map((c) => `- ${c}`).join("\n")}

Leadership doctrine: all 8 touched once · repeat Crittenden · Phillips · Jefferson · St. Francis.

### Tier 4 — County Completion

All 75 counties via County Strike Teams (${strike?.counties?.length ?? 75} county records). Priority: counties with vacant captain roles before Election Day.

### Tier 5 — Low-Propensity Democrats

Lane 2 drop-off pool statewide — prioritize through Power of 5 trusted-network conversations before mass GOTV.

---

## Section 3 — GOTV Timeline

| Phase | Dates | Mode | Primary channels |
|-------|-------|------|------------------|
| **Persuasion** | Sept 1–15 | Relationship · story · forums | Events · Power of 5 · coalition |
| **Commitment** | Sept 15–30 | Vote plan · volunteer ask | Phone · house parties · Mobilize |
| **Ballot Chase** | Oct 1–18 | Confirm vote plan · chase absentee | Phone · postcard · canvass |
| **Early Voting** | Oct 20–Nov 2 | Turnout | GOTV calls · poll greeters · shifts |
| **Final 96 Hours** | Oct 31–Nov 2 | Full GOTV | All channels · war room |
| **Election Day** | Nov 3 | Turnout operations | Poll coverage · candidate routing · hotline |

20-week plan anchors: **Oct 19** statewide GOTV sprint launch · **Oct 20** early voting · **Nov 3** Election Day.

---

## Section 4 — Human Contact Ladder

Every target voter should move through:

\`\`\`
Story → Event → Volunteer → Phone → Postcard → Door → Vote Plan → Ballot
\`\`\`

| Rung | Owner | Data source |
|------|-------|-------------|
| Story | Motion & Storytelling | story-pipeline.json |
| Event | Forward Motion / Mobilize | mobilize-events.json |
| Volunteer | People Power | people-power-network.json |
| Phone | Phone Bank Captain | phone-banks-field.json |
| Postcard | Postcard Captain | postcards-field.json |
| Door | Canvass Captain | canvass-field.json |
| Vote Plan | County Captain | county-strike-teams.json |
| Ballot | GOTV Lead | voter-contact-tracks.json |

HCI current: **${fmt(vc?.humanContactIndex?.total ?? 0)}** / ${fmt(hciGoal)} — ladder rungs must produce measurable movement weekly.

---

## Section 5 — Volunteer Deployment (Planning Targets)

Statewide channel goals from Phase 16 voter contact system. Weekly planning targets assume **9 execution weeks** (Sept 1 – Nov 3).

| Channel | Total goal | ~Weekly target | Owner |
|---------|----------:|---------------:|-------|
| Phone calls | ${fmt(phoneGoal)} | ${fmt(weeklyCalls)} | Phone Bank Captain |
| Postcards mailed | ${fmt(postcardGoal)} | ${fmt(weeklyPostcards)} | Postcard Captain |
| Doors knocked | ${fmt(canvassGoal)} | ${fmt(weeklyDoors)} | Canvass Captain |
| Power of 5 conversations | ${fmt(po5Goal)} | ${fmt(Math.round(po5Goal / 9))} | Volunteer Captain |
| GOTV contacts (final week) | ${fmt(gotvGoal)} | ${fmt(Math.round(gotvGoal / 2))} (final 2 wks) | GOTV Lead |
| Founding leaders | 20 | 2–3/week through Jun 28 | Volunteer Leadership |

**Status:** Planning targets — assign county-level quotas after founding 20 launch.

---

## Section 6 — County Captain Model

Every county uses the County Strike Team structure (75 counties · ${strike?.counties?.length ?? 75} records):

| Role | Strike team field | Status if vacant |
|------|-------------------|------------------|
| County Captain | countyCaptain | **Recruit before Labor Day** |
| Phone Lead | phoneBankCaptain | Assign with founding team |
| Postcard Lead | postcardCaptain | Assign with founding team |
| Volunteer Lead | volunteerCaptain | Assign with founding team |
| Event Lead | eventsCaptain | Assign with founding team |
| Social Lead | mediaCaptain | Assign with founding team |
| Canvass Lead | canvassCaptain | Assign Sep 1 |
| Faith Lead | faithCaptain | Coalition sprint |

Edit: \`data/campaign-brain/county-strike-teams.json\` → \`npm run campaign-brain:build\`

---

## Section 7 — Election Week Command Structure

| Function | Primary owner | Status |
|----------|---------------|--------|
| Poll watchers | **needs_assignment** | Train T-30 |
| Poll greeters | County Captains | Recruit Oct 1 |
| Election protection | **needs_assignment** | Legal review required |
| Voter hotline | **needs_assignment** | Stand up Oct 15 |
| Social media war room | Motion & Storytelling owner | **TBD** in ownership matrix |
| Candidate routing | Steve + Kelly | Lock Oct 12 |
| War room lead | Ernie / campaign manager | **needs_assignment** |
| Turnout tracking | Weekly scorecard + GOTV dashboard | Live Oct 20 |

---

## Section 8 — Sherwood GOTV Launch

**${sherwood?.goal ?? "Win Sherwood outright with 60%+"}**

| Element | Detail |
|---------|--------|
| Event | ${sherwood?.event?.name ?? "Sherwood GOTV Kickoff"} · Grassroots & Guitar Strings |
| Frame | Sherwood GOTV · Central Arkansas kickoff · statewide momentum |
| VIP tables | $${sherwood?.event?.vipTablePrice ?? 1000} · goal ${sherwood?.tracking?.vipTablesGoal ?? 20} |
| Show tickets | $${sherwood?.event?.showTicketPrice ?? 25} |
| Strategic role | **Official launch of statewide GOTV phase** after Labor Day readiness gate |
| July 3–4 corridor | Sherwood Fireworks · Pops on the River — locked backbone |

Sherwood is not a side event. It is the Central Arkansas GOTV kickoff that signals statewide turnout operations have begun.

---

## Section 9 — Daily GOTV Metrics

Track daily during GOTV phase (Oct 1 – Nov 3). Not campaign vanity metrics — **ballot chase metrics**.

| Metric | Planning goal | Current |
|--------|-------------:|--------:|
| Calls completed | ${fmt(phoneGoal)} | 0 |
| Conversations (HCI) | ${fmt(hciGoal)} | ${fmt(vc?.humanContactIndex?.total ?? 0)} |
| Postcards mailed | ${fmt(postcardGoal)} | 0 |
| Doors knocked | ${fmt(canvassGoal)} | 0 |
| Mobilize RSVPs | — | 0 |
| Volunteer shifts filled | — | 0 |
| Early vote commitments | — | 0 |
| **Ballots cast** | Plurality coalition | **Election Day truth** |

Rebuild live counts: \`npm run campaign-brain:voter-contact:build\`

---

## Section 10 — Election Day Plan

### Poll Opening Checklist — needs_assignment

- [ ] Poll greeters assigned per priority precinct
- [ ] Poll watcher credentials confirmed (legal review)
- [ ] Candidate visibility plan confirmed
- [ ] Hotline staffed and tested
- [ ] Turnout tracker live

### Poll Coverage Map — needs_build

Priority: Top 10 cities · Sherwood · Delta population centers. Map links to county strike teams.

### Candidate Schedule — locked backbone

Follow locked events Oct 20–Nov 3 early voting window. Election Day routing: **needs_lock** by Oct 12.

### War Room Structure

| Time | Lead | Function |
|------|------|----------|
| 6:00 AM | War room lead | Open · turnout baseline |
| 7:00 AM–7:00 PM | County captains | Poll reports every 2 hours |
| 7:00 PM | Leadership | Closing poll push |
| 8:00 PM+ | Ernie + Kelly | Results night |

### Incident Escalation

1. County Captain → War room lead
2. War room lead → Legal / Ernie
3. Media incidents → Motion & Storytelling owner

### Turnout Tracking

Compare hourly ballots cast vs. planning model. Delta + Top 10 + Sherwood reported separately.

### Closing Poll Operations

Final two hours: all volunteer shifts · candidate thank-yous · social content capture.

### Results Night

Central watch location · coalition validators invited · no premature claims until AP/county calls.

---

## Rebuild

\`\`\`bash
npm run campaign-brain:gotv-operations:build
npm run campaign-brain:voter-contact:build
npm run election-plan:build
\`\`\`

Shareable chapter: \`/election-plan/executive-book/gotv\`
`;
}

function buildJsonSummary() {
  const vc = readJson<{
    humanContactIndex?: { total?: number; goal?: number };
    tracks?: { lane2Reactivation?: { turnoutTarget?: number }; lane3Registration?: { goal?: number } };
    channels?: Array<{ id: string; label: string; goal: number; primaryMetric: number }>;
  }>(path.join(BRAIN_DATA, "voter-contact-summary.json"));

  const strike = readJson<{ counties?: unknown[] }>(path.join(BRAIN_DATA, "county-strike-teams.json"));
  const { top10 } = loadCityTiers();

  return {
    generatedAt: new Date().toISOString(),
    pass: PASS,
    disclaimer: DISCLAIMER,
    electionDay: ELECTION_DAY,
    earlyVotingStart: EARLY_VOTING_START,
    winCondition: {
      lane2TurnoutTarget: vc?.tracks?.lane2Reactivation?.turnoutTarget ?? 51_051,
      registrationGoal: vc?.tracks?.lane3Registration?.goal ?? 50_000,
      hciGoal: vc?.humanContactIndex?.goal ?? 250_000,
      hciCurrent: vc?.humanContactIndex?.total ?? 0,
    },
    targetUniverse: {
      tier1Top10: top10,
      tier2Top40Count: 40,
      tier3DeltaCounties: DELTA_COUNTIES,
      tier4CountyRecords: strike?.counties?.length ?? 75,
    },
    channelGoals: (vc?.channels ?? []).map((c) => ({
      id: c.id,
      label: c.label,
      goal: c.goal,
      current: c.primaryMetric,
    })),
    dailyMetrics: [
      { metric: "Calls", goal: vc?.channels?.find((c) => c.id === "phoneBank")?.goal ?? 29_000, current: 0 },
      { metric: "Conversations (HCI)", goal: vc?.humanContactIndex?.goal ?? 250_000, current: vc?.humanContactIndex?.total ?? 0 },
      { metric: "Postcards mailed", goal: vc?.channels?.find((c) => c.id === "postcard")?.goal ?? 48_000, current: 0 },
      { metric: "Doors knocked", goal: vc?.channels?.find((c) => c.id === "canvass")?.goal ?? 60_000, current: 0 },
      { metric: "GOTV contacts", goal: vc?.channels?.find((c) => c.id === "gotv")?.goal ?? 15_000, current: 0 },
      { metric: "Ballots cast", goal: "Plurality coalition", current: "Election Day" },
    ],
    electionDayChecklist: [
      { item: "Poll greeters assigned", status: "needs_assignment" },
      { item: "Poll watcher credentials", status: "needs_assignment" },
      { item: "Poll coverage map", status: "needs_build" },
      { item: "Candidate Election Day routing", status: "needs_lock" },
      { item: "War room lead", status: "needs_assignment" },
      { item: "Voter hotline", status: "needs_assignment" },
    ],
  };
}

function main() {
  mkdirSync(EXEC_BOOK, { recursive: true });
  mkdirSync(OUT_DATA, { recursive: true });

  const chapter = buildChapter();
  const summary = buildJsonSummary();

  writeFileSync(path.join(EXEC_BOOK, "07-ARKANSAS-GOTV-OPERATIONS-PLAN.md"), chapter);
  writeFileSync(path.join(OUT_DATA, "gotv-operations-plan.json"), JSON.stringify(summary, null, 2));
  mkdirSync(path.join(BRAIN_ROOT, "gotv-operations"), { recursive: true });

  writeFileSync(path.join(BRAIN_ROOT, "gotv-operations", "GOTV-OPERATIONS-PLAN.summary.json"), JSON.stringify(summary, null, 2));

  console.log(
    `GOTV Operations Plan: Chapter 8 · HCI ${summary.winCondition.hciCurrent}/${summary.winCondition.hciGoal} · ${summary.targetUniverse.tier1Top10.length} Top 10 cities · ${summary.electionDayChecklist.filter((c) => c.status !== "complete").length} Election Day items need assignment`,
  );
}

main();
