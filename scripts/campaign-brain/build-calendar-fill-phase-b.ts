/**
 * Calendar Fill Phase B — proposed weekend assignments (Option C: Balanced).
 * NOT Kelly's final calendar. Leadership approval required.
 *
 * Usage: npm run campaign-brain:calendar-fill:phase-b
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const OUT = path.join(BRAIN_ROOT, "calendar-fill");
const SETTLEMENT = path.join(BRAIN_ROOT, "calendar-settlement/calendar-settlement.summary.json");
const CORRIDORS = path.join(OUT, "coverage-completion-corridors.json");
const LOCKED_PATH = path.join(BRAIN_DATA, "locked-events-steve.json");
const EARLY_VOTING = "2026-10-20";
const LABOR_DAY = "2026-09-07";

const DISCLAIMER =
  "Proposed leadership-review schedule only. Not Kelly's final calendar. Not published to /events or Google Calendar. Approval required before Phase B becomes operational.";

const STRATEGY = "option_c_balanced_delta_tier1";

type ProposedBlock = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  corridorId: string;
  anchorCity: string;
  countiesNew: string[];
  countiesRevisit: string[];
  travelClass: "local" | "regional" | "immersion" | "multi-day";
  overnightLikely: boolean;
  originRule: string;
  stacksWithLocked: string[];
  objectives: string[];
  coalition: string[];
  storytelling: string[];
  category: "coverage" | "tier1_reinforcement" | "rest_prep" | "gotv_prep";
  status: "proposed";
};

/** Option C — Balanced Delta + Tier 1 reinforcement. Leadership-approved strategy encoded as proposal. */
const PROPOSED_ASSIGNMENTS: ProposedBlock[] = [
  {
    id: "prop-jul19-jefferson",
    label: "Tier 1 revisit — Pine Bluff / Jefferson",
    startDate: "2026-07-19",
    endDate: "2026-07-19",
    corridorId: "tier1-revisit",
    anchorCity: "Pine Bluff",
    countiesNew: [],
    countiesRevisit: ["Jefferson"],
    travelClass: "regional",
    overnightLikely: false,
    originRule: "Rose Bud (Sunday)",
    stacksWithLocked: [],
    objectives: ["Tier 1 VCI revisit", "Lane 2 persuasion", "Educator + NAACP intros"],
    coalition: ["Jefferson NAACP", "Pine Bluff educator network"],
    storytelling: ["Urban Delta recovery story", "Local business spotlight"],
    category: "tier1_reinforcement",
    status: "proposed",
  },
  {
    id: "prop-aug8-delta-gateway",
    label: "Delta Gateway immersion — West Memphis + Blytheville",
    startDate: "2026-08-08",
    endDate: "2026-08-09",
    corridorId: "delta-gateway",
    anchorCity: "West Memphis",
    countiesNew: ["Crittenden", "Mississippi"],
    countiesRevisit: [],
    travelClass: "multi-day",
    overnightLikely: true,
    originRule: "Rose Bud → overnight West Memphis Fri Aug 7 or Sat Aug 8",
    stacksWithLocked: [],
    objectives: ["Delta proof before September", "County completion +2", "Gateway media visibility"],
    coalition: ["West Memphis Dems", "Delta labor", "NAACP gateway"],
    storytelling: ["Mississippi River gateway", "Clerk/election access", "Memphis spillover media"],
    category: "coverage",
    status: "proposed",
  },
  {
    id: "prop-aug15-nwa",
    label: "NWA Tier 1 reinforcement — Benton + Washington stack",
    startDate: "2026-08-15",
    endDate: "2026-08-16",
    corridorId: "nwa-reinforcement",
    anchorCity: "Bentonville",
    countiesNew: [],
    countiesRevisit: ["Benton", "Washington"],
    travelClass: "multi-day",
    overnightLikely: true,
    originRule: "Rose Bud → NWA overnight",
    stacksWithLocked: [],
    objectives: ["Highest VCI vote production", "Top 40 city stack", "Balance vs Delta-only weekends"],
    coalition: ["AEA NWA", "Chamber validators", "Senior Dems follow-up Aug 5"],
    storytelling: ["NWA growth corridor", "Business validator meetings", "Student registration"],
    category: "tier1_reinforcement",
    status: "proposed",
  },
  {
    id: "prop-aug23-delta-river",
    label: "Delta River corridor — Helena / Phillips + Monroe + St. Francis",
    startDate: "2026-08-23",
    endDate: "2026-08-24",
    corridorId: "delta-river",
    anchorCity: "Helena",
    countiesNew: ["Phillips", "Monroe", "St. Francis"],
    countiesRevisit: [],
    travelClass: "multi-day",
    overnightLikely: true,
    originRule: "Stack after Aug 22 Cave City (locked) · overnight Helena",
    stacksWithLocked: ["2026-08-22 Cave City"],
    objectives: ["Deep Delta coverage +3", "September Delta proof", "Historic corridor relationships"],
    coalition: ["Delta churches", "Helena NAACP", "Educator networks"],
    storytelling: ["Helena heritage", "Farm community listening", "Courthouse access"],
    category: "coverage",
    status: "proposed",
  },
  {
    id: "prop-aug30-craighead-ne",
    label: "Tier 1 Jonesboro revisit + Lawrence county completion",
    startDate: "2026-08-30",
    endDate: "2026-08-30",
    corridorId: "tier1-revisit",
    anchorCity: "Jonesboro",
    countiesNew: ["Lawrence"],
    countiesRevisit: ["Craighead"],
    travelClass: "immersion",
    overnightLikely: false,
    originRule: "Rose Bud (Sunday) · optional LR Tue origin if rescheduled to weekday exception",
    stacksWithLocked: [],
    objectives: ["Craighead Tier 1 revisit overdue", "NE corridor start", "Jonesboro hub media"],
    coalition: ["Jonesboro educators", "City candidate partnership"],
    storytelling: ["Crowley's Ridge business spotlight", "NE fair circuit relationship"],
    category: "tier1_reinforcement",
    status: "proposed",
  },
  {
    id: "prop-sep6-northeast",
    label: "Northeast completion — Walnut Ridge / Newport / Augusta corridor",
    startDate: "2026-09-06",
    endDate: "2026-09-07",
    corridorId: "northeast-completion",
    anchorCity: "Walnut Ridge",
    countiesNew: ["Randolph", "Jackson", "Poinsett", "Woodruff"],
    countiesRevisit: [],
    travelClass: "multi-day",
    overnightLikely: true,
    originRule: "Overnight NE · Labor Day Sep 7 = partial travel day",
    stacksWithLocked: [],
    objectives: ["NE quadrant completion +4", "Pre-Labor Day county proof", "Fair season stack"],
    coalition: ["NE educator intro", "County Dem clubs"],
    storytelling: ["Railroad towns", "NE Arkansas identity"],
    category: "coverage",
    status: "proposed",
  },
  {
    id: "prop-sep26-south-delta-sw",
    label: "Southeast Delta + Southwest completion immersion",
    startDate: "2026-09-26",
    endDate: "2026-09-27",
    corridorId: "southeast-delta",
    anchorCity: "Crossett",
    countiesNew: ["Ashley", "Chicot", "Lincoln", "Calhoun", "Dallas", "Miller", "Sevier", "Grant"],
    countiesRevisit: [],
    travelClass: "multi-day",
    overnightLikely: true,
    originRule: "South AR overnight · stack post Sep 25 Hot Springs Forum (locked)",
    stacksWithLocked: ["2026-09-25 Hot Springs Forum"],
    objectives: ["Complete SE Delta arc", "Southwest quadrant +5", "8 counties via stacked immersion"],
    coalition: ["South AR elected officials", "Rural Dem clubs", "Chamber south"],
    storytelling: ["Timber communities", "Small business filers", "South AR listening tour"],
    category: "coverage",
    status: "proposed",
  },
  {
    id: "prop-oct3-ozark",
    label: "Ozark / North Central completion",
    startDate: "2026-10-03",
    endDate: "2026-10-04",
    corridorId: "ozark-completion",
    anchorCity: "Jasper",
    countiesNew: ["Newton", "Madison", "Perry", "Logan", "Little River"],
    countiesRevisit: [],
    travelClass: "multi-day",
    overnightLikely: true,
    originRule: "Ozarks overnight · before Oct 4 Air Show (locked LR)",
    stacksWithLocked: ["2026-10-04 Air Show"],
    objectives: ["Ozark gap fill +5", "Mountain community visibility", "Clerk relationships north"],
    coalition: ["Ozarks hospitality", "Small-town clerks"],
    storytelling: ["Buffalo River gateway", "Mountain community stories"],
    category: "coverage",
    status: "proposed",
  },
  {
    id: "prop-oct11-prairie",
    label: "Central Prairie completion + recovery buffer",
    startDate: "2026-10-11",
    endDate: "2026-10-12",
    corridorId: "central-prairie",
    anchorCity: "De Witt",
    countiesNew: ["Prairie", "Scott"],
    countiesRevisit: [],
    travelClass: "regional",
    overnightLikely: false,
    originRule: "Little Rock Fri Oct 9 origin if weekday exception · or Rose Bud weekend",
    stacksWithLocked: ["2026-10-12 Saline County GOTV (locked)"],
    objectives: ["Final completion counties +2", "Reach 75/75 coverage", "Buffer before GOTV sprint"],
    coalition: ["Farm bureau adjacency", "Rural church network"],
    storytelling: ["Ag prairie communities", "Rice landscape"],
    category: "coverage",
    status: "proposed",
  },
  {
    id: "prop-oct18-prep",
    label: "Recovery / story backlog / early vote prep",
    startDate: "2026-10-18",
    endDate: "2026-10-18",
    corridorId: "rest",
    anchorCity: "Little Rock",
    countiesNew: [],
    countiesRevisit: ["Pulaski"],
    travelClass: "local",
    overnightLikely: false,
    originRule: "Little Rock · protected work alignment",
    stacksWithLocked: [],
    objectives: ["Candidate recovery", "Substack/social backlog", "Early voting launch prep Oct 20"],
    coalition: ["Internal volunteer calls", "Endorsement follow-up"],
    storytelling: ["Content catch-up", "Proof archive assembly"],
    category: "rest_prep",
    status: "proposed",
  },
];

const TIER1_TRACK = [
  "Pulaski",
  "Benton",
  "Washington",
  "Faulkner",
  "Saline",
  "Sebastian",
  "Jefferson",
  "Garland",
  "Craighead",
  "Lonoke",
  "White",
  "Pope",
];

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

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function computeAfterFill(
  settlement: { visitedBaseline?: number; projectedCountiesAfterLocked?: number; stillMissingCounties?: string[] },
  assignments: ProposedBlock[],
) {
  const baseline = settlement.projectedCountiesAfterLocked ?? 50;
  const newCounties = unique(assignments.flatMap((a) => a.countiesNew));
  const revisited = unique(assignments.flatMap((a) => a.countiesRevisit));
  const stillMissingBefore = settlement.stillMissingCounties ?? [];
  const stillMissingAfter = stillMissingBefore.filter((c) => !newCounties.includes(c));
  return {
    visitedBeforeFill: settlement.visitedBaseline ?? 43,
    afterLockedBackbone: baseline,
    proposedNewCounties: newCounties.length,
    proposedTotalAfterFill: baseline + newCounties.length,
    stillMissingAfterFill: stillMissingAfter,
    tier1RevisitsProposed: revisited.filter((c) => TIER1_TRACK.includes(c)),
    deltaCountiesProposed: newCounties.filter((c) => DELTA_COUNTIES.includes(c)),
  };
}

function main() {
  mkdirSync(OUT, { recursive: true });

  const settlement = readJson<{
    visitedBaseline?: number;
    projectedCountiesAfterLocked?: number;
    stillMissingCounties?: string[];
    stillMissingCount?: number;
    tier1RevisitStatus?: Array<{
      county: string;
      lastVisitDate: string | null;
      nextLockedDate: string | null;
      status: string;
    }>;
  }>(SETTLEMENT);

  const locked = readJson<{ events: Array<{ date: string; eventName: string; county: string }> }>(LOCKED_PATH)?.events ?? [];
  const after = computeAfterFill(settlement ?? {}, PROPOSED_ASSIGNMENTS);

  const payload = {
    generatedAt: new Date().toISOString(),
    strategy: STRATEGY,
    strategyLabel: "Option C — Balanced Delta + Tier 1 reinforcement",
    status: "proposed_leadership_review",
    disclaimer: DISCLAIMER,
    datesAssigned: true,
    isKellyFinalCalendar: false,
    googleCalendarWritten: false,
    eventsPublished: false,
    windowEnd: "2026-10-19",
    earlyVotingStart: EARLY_VOTING,
    laborDay: LABOR_DAY,
    proposedBlocks: PROPOSED_ASSIGNMENTS,
    summary: after,
    lockedEventCount: locked.length,
  };

  writeFileSync(path.join(OUT, "proposed-calendar-fill.json"), JSON.stringify(payload, null, 2));

  writeFileSync(
    path.join(OUT, "calendar-fill-phase-b.summary.json"),
    JSON.stringify(
      {
        generatedAt: payload.generatedAt,
        disclaimer: DISCLAIMER,
        strategy: STRATEGY,
        proposedBlockCount: PROPOSED_ASSIGNMENTS.length,
        proposedTotalAfterFill: after.proposedTotalAfterFill,
        stillMissingAfterFill: after.stillMissingAfterFill.length,
        deltaCountiesScheduled: after.deltaCountiesProposed.length,
        tier1RevisitsProposed: after.tier1RevisitsProposed,
        leadershipApprovalRequired: true,
      },
      null,
      2,
    ),
  );

  const phaseBMd = `# Proposed Calendar Fill — Phase B

> **${DISCLAIMER}**

**Strategy:** Option C — Balanced Delta + Tier 1 reinforcement  
**Status:** Proposed — leadership approval required  
**Window:** Through early voting (${EARLY_VOTING})

## Summary

| Metric | Value |
|--------|------:|
| Baseline visited | ${after.visitedBeforeFill}/75 |
| After locked backbone | ${after.afterLockedBackbone}/75 |
| **Proposed after fill** | **${after.proposedTotalAfterFill}/75** |
| New counties in proposal | ${after.proposedNewCounties} |
| Still missing after fill | ${after.stillMissingAfterFill.length} |
| Proposed blocks | ${PROPOSED_ASSIGNMENTS.length} |
| Delta counties in proposal | ${after.deltaCountiesProposed.length}/8 Delta gaps |

## Proposed weekend / immersion blocks

${PROPOSED_ASSIGNMENTS.map(
  (b) => `### ${b.label}

- **Dates:** ${b.startDate}${b.endDate !== b.startDate ? ` → ${b.endDate}` : ""}
- **Corridor:** ${b.corridorId}
- **New counties:** ${b.countiesNew.join(", ") || "—"}
- **Revisits:** ${b.countiesRevisit.join(", ") || "—"}
- **Travel:** ${b.travelClass}${b.overnightLikely ? " · overnight likely" : ""}
- **Stacks with locked:** ${b.stacksWithLocked.join(" · ") || "—"}
- **Category:** ${b.category}

`,
).join("\n")}

## Protected constraints honored

- Tuesday Little Rock workday preserved on surrounding weeks
- Debate prep + locked backbone untouched
- 90+ minute drives use overnight where noted
- Forward Motion queue not used as schedule source

## Not included

- Google Calendar writes
- Public /events publication
- Final Kelly calendar designation
`;
  writeFileSync(path.join(OUT, "PROPOSED-CALENDAR-FILL-PHASE-B.md"), phaseBMd);

  writeFileSync(
    path.join(OUT, "county-completion-after-fill.md"),
    `# County Completion After Proposed Fill

> Proposed only · ${after.proposedTotalAfterFill}/75 counties

## Pathway

| Stage | Count |
|-------|------:|
| Leadership-confirmed visited | ${after.visitedBeforeFill} |
| After locked backbone | ${after.afterLockedBackbone} |
| **After proposed fill** | **${after.proposedTotalAfterFill}** |

## New counties in proposal (${after.proposedNewCounties})

${unique(PROPOSED_ASSIGNMENTS.flatMap((b) => b.countiesNew))
  .sort()
  .map((c) => `- ${c}`)
  .join("\n")}

## Still missing after proposal

${after.stillMissingAfterFill.length ? after.stillMissingAfterFill.map((c) => `- ${c}`).join("\n") : "_None — 75/75 reached in proposal._"}
`,
  );

  const tier1Rows = TIER1_TRACK.map((county) => {
    const lockedRow = settlement?.tier1RevisitStatus?.find((t) => t.county === county);
    const proposedRevisit = PROPOSED_ASSIGNMENTS.find((b) => b.countiesRevisit.includes(county));
    const proposedNew = PROPOSED_ASSIGNMENTS.find((b) => b.countiesNew.includes(county));
    let proposedAction = "—";
    if (proposedRevisit) proposedAction = `${proposedRevisit.startDate} revisit (${proposedRevisit.label})`;
    else if (proposedNew) proposedAction = `${proposedNew.startDate} new coverage`;
    else if (lockedRow?.nextLockedDate) proposedAction = `Locked ${lockedRow.nextLockedDate}`;
    return { county, lastVisit: lockedRow?.lastVisitDate ?? "—", proposedAction, status: lockedRow?.status ?? "—" };
  });

  writeFileSync(
    path.join(OUT, "tier-1-revisit-after-fill.md"),
    `# Tier 1 Revisit After Proposed Fill

| County | Last visit | Proposed / locked action |
|--------|------------|--------------------------|
${tier1Rows.map((r) => `| ${r.county} | ${r.lastVisit} | ${r.proposedAction} |`).join("\n")}

## Proposed Tier 1 reinforcement weekends

${after.tier1RevisitsProposed.map((c) => `- **${c}**`).join("\n") || "—"}
`,
  );

  writeFileSync(
    path.join(OUT, "delta-coverage-after-fill.md"),
    `# Delta Coverage After Proposed Fill

## Delta counties (${DELTA_COUNTIES.length} in corridor doctrine)

${DELTA_COUNTIES.map((c) => {
  const inProposal = after.deltaCountiesProposed.includes(c) || PROPOSED_ASSIGNMENTS.some((b) => b.countiesNew.includes(c));
  const lockedTouch = locked.some((e) => e.county === c);
  return `- **${c}** · ${inProposal ? "proposed fill" : lockedTouch ? "locked only" : "gap remains"}`;
}).join("\n")}

## Proposed Delta blocks

${PROPOSED_ASSIGNMENTS.filter((b) => b.corridorId.startsWith("delta") || b.countiesNew.some((c) => DELTA_COUNTIES.includes(c)))
  .map((b) => `- ${b.startDate}: ${b.label} (${b.countiesNew.join(", ")})`)
  .join("\n")}

## September Delta proof

Delta Gateway **Aug 8–9** and Delta River **Aug 23–24** land **before Labor Day** — visible proof for September forums and persuasion season.
`,
  );

  const sepCriteria = [
    {
      criterion: "All 75 counties touched or scheduled",
      status: after.proposedTotalAfterFill >= 75 ? "met_proposed" : "partial",
      detail: `${after.proposedTotalAfterFill}/75 in proposal`,
    },
    {
      criterion: "Top 10 cities revisited or scheduled",
      status: "partial",
      detail: "NWA Aug 15–16 · Jefferson Jul 19 · Craighead Aug 30 · LR locked events",
    },
    {
      criterion: "Delta partially covered before Labor Day",
      status: after.deltaCountiesProposed.length >= 5 ? "met_proposed" : "partial",
      detail: `${after.deltaCountiesProposed.length} Delta counties in proposal before Sep forums`,
    },
    {
      criterion: "Volunteer leaders active",
      status: "missing",
      detail: "Depends on Jun 28 launch execution — not assigned in this proposal",
    },
    {
      criterion: "Sherwood on track",
      status: "partial",
      detail: "Jul 3 locked · Sep 17 in plan",
    },
    {
      criterion: "Endorsement pipeline active",
      status: "missing",
      detail: "Operational — not calendar-assigned",
    },
  ];

  writeFileSync(
    path.join(OUT, "september-readiness-after-fill.md"),
    `# September Readiness After Proposed Fill

> If leadership approves Option C proposal

| Criterion | Status | Detail |
|-----------|--------|--------|
${sepCriteria.map((g) => `| ${g.criterion} | ${g.status} | ${g.detail} |`).join("\n")}
`,
  );

  writeFileSync(
    path.join(OUT, "september-readiness-after-fill.json"),
    JSON.stringify({ laborDay: LABOR_DAY, criteria: sepCriteria }, null, 2),
  );

  writeFileSync(
    path.join(OUT, "leadership-approval-checklist.md"),
    `# Leadership Approval Checklist — Phase B Proposal

> ${DISCLAIMER}

## Review surfaces (before merge to main)

- [ ] **Weekly Dashboard** — Can Kelly run her week from election-plan?
- [ ] **Coverage Reality** — Does 43 → 50 → ${after.proposedTotalAfterFill} pathway make sense?
- [ ] **Calendar Settlement** — Travel/overnight assumptions realistic?
- [ ] **20 Week Plan** — Cluster rotation feels right?

## Phase B proposal decisions

- [ ] Approve **Option C** balanced strategy (Delta + Tier 1)
- [ ] Approve **Delta Gateway Aug 8–9** as first major fill weekend
- [ ] Approve **NWA Aug 15–16** vote-production weekend (tradeoff accepted)
- [ ] Approve **Sep 26–27** 8-county south immersion intensity
- [ ] Confirm **Oct 18 recovery** before early voting Oct 20
- [ ] Confirm no Google Calendar / /events publish until operational lock

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Candidate | Kelly | | |
| Campaign leadership | Ernie | | |
| Operations | Steve | | |

## After approval

1. Operational lock proposal → CampaignEvent / calendar workflow (future pass)
2. Merge \`feature/kelly-schedule-settlement-dashboard\` → \`main\`
3. Deploy election-plan as operating manual
`,
  );

  console.log(
    `Calendar Fill Phase B (proposed): ${PROPOSED_ASSIGNMENTS.length} blocks · ${after.proposedTotalAfterFill}/75 projected · ${after.stillMissingAfterFill.length} still missing · leadership approval required`,
  );
}

main();
