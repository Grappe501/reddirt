/**
 * PHASE 14 — Political Relationship & Influence Network
 *
 * Who can help move people, money, volunteers, credibility, introductions, and relationships?
 * Not endorsements — relationships.
 *
 * Usage: npm run campaign-brain:relationship-network:build
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { OPPORTUNITY_CLUSTERS } from "../strategic-plan/data/opportunity-clusters";
import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";
import type {
  CandidatePartner,
  CountyInfluenceRow,
  CurrentElectedOfficial,
  FormerElectedOfficial,
  LeaderCategory,
  RelationshipNetworkSummary,
} from "./lib/relationship-network-types";

const NETWORK = path.join(BRAIN_ROOT, "relationship-network");

const POWER_MAP_CATEGORIES: Array<{ id: LeaderCategory; label: string }> = [
  { id: "current_elected", label: "Current elected officials" },
  { id: "former_elected", label: "Former elected officials" },
  { id: "democratic_leadership", label: "Democratic county leadership" },
  { id: "civic", label: "Civic leaders" },
  { id: "labor", label: "Labor leaders" },
  { id: "faith", label: "Faith leaders" },
  { id: "community_influencer", label: "Community influencers" },
  { id: "business", label: "Business leaders" },
  { id: "education", label: "Education leaders" },
];

const STANDARD_ASK_PACKAGE = [
  "What should we know about your area?",
  "Who are the 5–10 people we should meet?",
  "Who are the volunteer leaders here?",
  "What events should we attend?",
  "What organizations should we engage?",
  "Would you be willing to make introductions?",
  "Would you consider supporting the campaign financially?",
  "How would you like to stay involved?",
];

const ACTIVATION_WORKFLOW = [
  "Identify Leader",
  "Request Meeting",
  "In-Person Meeting",
  "Present Victory Plan",
  "Request Support",
  "Request Introductions",
  "Request Volunteer Leaders",
  "Request Financial Support",
  "Follow-Up",
  "Relationship Growth",
];

const INTRODUCTION_ASK_FRAMEWORK = [
  "Advice",
  "Introductions",
  "Volunteer leaders",
  "Community leaders",
  "Event opportunities",
  "Financial support",
  "Network access",
  "Future meeting",
];

function normalizeCounty(name: string): string {
  return name.replace(/ County$/i, "").trim();
}

function clusterForCounty(county: string): string {
  const n = normalizeCounty(county);
  for (const c of OPPORTUNITY_CLUSTERS) {
    if (c.counties.some((x) => normalizeCounty(x) === n)) return c.name;
  }
  return "Statewide";
}

function loadCurrentOfficials(): CurrentElectedOfficial[] {
  const raw = readJson<{ officials: CurrentElectedOfficial[] }>(
    path.join(BRAIN_DATA, "current-elected-officials.json"),
  );
  return raw?.officials ?? [];
}

function loadFormerOfficials(): FormerElectedOfficial[] {
  const raw = readJson<{ officials: FormerElectedOfficial[] }>(
    path.join(BRAIN_DATA, "former-elected-officials.json"),
  );
  return raw?.officials ?? [];
}

function loadCandidatePartners(): CandidatePartner[] {
  const raw = readJson<{
    partners: Array<CandidatePartner & { sharedVolunteerPool?: boolean }>;
    byCategory?: Record<string, Array<CandidatePartner & { sharedVolunteerPool?: boolean }>>;
  }>(path.join(BRAIN_DATA, "candidate-partnerships.json"));

  const normalize = (p: CandidatePartner & { sharedVolunteerPool?: boolean }): CandidatePartner => ({
    ...p,
    sharedVolunteers: p.sharedVolunteers ?? (p.sharedVolunteerPool ? 1 : 0),
    sharedEvents: p.sharedEvents ?? 0,
    sharedCanvasses: p.sharedCanvasses ?? 0,
    sharedPhoneBanks: p.sharedPhoneBanks ?? 0,
    sharedFundraising: p.sharedFundraising ?? 0,
    sharedCountyLeadership: p.sharedCountyLeadership ?? false,
    sharedMobilizeEvents: p.sharedMobilizeEvents ?? 0,
    status: p.status ?? "prospect",
    category: p.category ?? "other",
  });

  const fromPartners = (raw?.partners ?? []).map(normalize);
  const fromCategories = Object.values(raw?.byCategory ?? {})
    .flat()
    .map(normalize);
  const byId = new Map<string, CandidatePartner>();
  for (const p of [...fromPartners, ...fromCategories]) {
    if (p?.id) byId.set(p.id, p);
  }
  return [...byId.values()];
}

function isEngaged(asks: { meetingCompleted?: boolean; contacted?: boolean }): boolean {
  return Boolean(asks.meetingCompleted || asks.contacted);
}

function buildCountyInventory(
  current: CurrentElectedOfficial[],
  former: FormerElectedOfficial[],
  strikeTeams: Map<string, { assigned: number; volunteerLeader: boolean }>,
  faithByCounty: Map<string, number>,
  businessByCounty: Map<string, number>,
): CountyInfluenceRow[] {
  return ARKANSAS_COUNTY_REGISTRY.map((reg) => {
    const countyName = reg.displayName;
    const short = normalizeCounty(countyName);

    const currentIn = current.filter((o) => normalizeCounty(o.county) === short);
    const formerIn = former.filter((o) => normalizeCounty(o.county) === short);

    const currentEngaged = currentIn.filter((o) => o.asks.meetingCompleted).length;
    const formerEngaged = formerIn.filter((o) => o.asks.meetingCompleted).length;
    const meetingsRequested =
      currentIn.filter((o) => o.asks.meetingRequested).length +
      formerIn.filter((o) => o.asks.meetingRequested).length;
    const meetingsCompleted = currentEngaged + formerEngaged;

    const strike = strikeTeams.get(short) ?? { assigned: 0, volunteerLeader: false };
    const faithCount = faithByCounty.get(short) ?? 0;
    const businessCount = businessByCounty.get(short) ?? 0;
    const volunteerLeaders = strike.assigned + (strike.volunteerLeader ? 1 : 0);

    const categoriesPresent = new Set<LeaderCategory>();
    for (const o of currentIn) categoriesPresent.add(o.category);
    for (const o of formerIn) categoriesPresent.add("former_elected");
    if (faithCount > 0) categoriesPresent.add("faith");
    if (businessCount > 0) categoriesPresent.add("business");
    if (strike.assigned > 0) categoriesPresent.add("democratic_leadership");

    const missingLeaderCategories = POWER_MAP_CATEGORIES.map((c) => c.id).filter(
      (id) => !categoriesPresent.has(id),
    );

    const knownLeaders = currentIn.length + formerIn.length + faithCount + businessCount + strike.assigned;

    let relationshipStrength: CountyInfluenceRow["relationshipStrength"] = "none";
    if (meetingsCompleted >= 2 || knownLeaders >= 5) relationshipStrength = "established";
    else if (meetingsCompleted >= 1 || knownLeaders >= 2) relationshipStrength = "building";

    const countyInfluenceScore = Math.min(
      100,
      Math.round(
        currentEngaged * 15 +
          formerEngaged * 12 +
          volunteerLeaders * 10 +
          faithCount * 8 +
          businessCount * 5 +
          meetingsCompleted * 5,
      ),
    );

    const priorityIntroductions = missingLeaderCategories.slice(0, 4).map((id) => {
      const cat = POWER_MAP_CATEGORIES.find((c) => c.id === id);
      return cat?.label ?? id;
    });

    return {
      county: countyName,
      slug: reg.slug,
      cluster: clusterForCounty(short),
      knownLeaders,
      missingLeaderCategories,
      relationshipStrength,
      meetingsRequested,
      meetingsCompleted,
      priorityIntroductions,
      countyInfluenceScore,
      currentOfficialsEngaged: currentEngaged,
      formerOfficialsEngaged: formerEngaged,
      volunteerLeadersIdentified: volunteerLeaders,
      faithLeadersIdentified: faithCount,
      businessLeadersIdentified: businessCount,
    };
  });
}

function buildSummary(
  current: CurrentElectedOfficial[],
  former: FormerElectedOfficial[],
  partners: CandidatePartner[],
  counties: CountyInfluenceRow[],
): RelationshipNetworkSummary {
  const meetingsRequested =
    current.filter((o) => o.asks.meetingRequested).length +
    former.filter((o) => o.asks.meetingRequested).length;

  const meetingsCompleted =
    current.filter((o) => o.asks.meetingCompleted).length +
    former.filter((o) => o.asks.meetingCompleted).length;

  const introductionsGenerated =
    current.filter((o) => o.asks.introducedOthers).length +
    former.reduce((a, o) => a + (o.outcomes?.introductionsMade ?? 0), 0);

  const volunteerLeaders =
    current.filter((o) => o.asks.volunteerLeadsProvided).length +
    former.reduce((a, o) => a + (o.outcomes?.volunteerLeadersIdentified ?? 0), 0);

  const countiesWithInfluence = counties.filter((c) => c.countyInfluenceScore > 0).length;

  const statewideRelationshipScore =
    counties.length > 0
      ? Math.round(counties.reduce((a, c) => a + c.countyInfluenceScore, 0) / counties.length)
      : 0;

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    heroLine: "The strongest campaigns are built on trusted relationships, not transactions.",
    currentOfficialsEngaged: current.filter((o) => isEngaged(o.asks)).length,
    currentOfficialsTotal: current.length,
    formerOfficialsEngaged: former.filter((o) => isEngaged(o.asks)).length,
    formerOfficialsTotal: former.length,
    candidatePartnershipsActive: partners.filter((p) => p.status === "active").length,
    volunteerLeadersIdentified: volunteerLeaders,
    countiesWithInfluence,
    countiesTotal: ARKANSAS_COUNTY_REGISTRY.length,
    meetingsRequested,
    meetingsScheduled: meetingsRequested,
    meetingsCompleted,
    introductionsGenerated,
    statewideRelationshipScore,
  };
}

function loadStrikeTeamMap(): Map<string, { assigned: number; volunteerLeader: boolean }> {
  const raw = readJson<{
    counties: Array<{ county: string; roles: Record<string, { status: string; name: string }> }>;
  }>(path.join(BRAIN_DATA, "county-strike-teams.json"));

  const m = new Map<string, { assigned: number; volunteerLeader: boolean }>();
  for (const c of raw?.counties ?? []) {
    const short = normalizeCounty(c.county);
    let assigned = 0;
    let volunteerLeader = false;
    for (const [role, r] of Object.entries(c.roles ?? {})) {
      if (r.status === "assigned" && r.name?.trim()) {
        assigned++;
        if (role === "volunteerCaptain" || role === "countyCaptain") volunteerLeader = true;
      }
    }
    m.set(short, { assigned, volunteerLeader });
  }
  return m;
}

function loadFaithByCounty(): Map<string, number> {
  const raw = readJson<{ churches: Array<{ county?: string }> }>(
    path.join(BRAIN_DATA, "faith-outreach-network.json"),
  );
  const m = new Map<string, number>();
  for (const ch of raw?.churches ?? []) {
    if (!ch.county) continue;
    const short = normalizeCounty(ch.county);
    m.set(short, (m.get(short) ?? 0) + 1);
  }
  return m;
}

function loadBusinessByCounty(): Map<string, number> {
  const raw = readJson<{
    businessesHighlighted: Array<{ county?: string }>;
    restaurantsVisited: Array<{ county?: string }>;
  }>(path.join(BRAIN_DATA, "local-business-people-power.json"));

  const m = new Map<string, number>();
  for (const list of [raw?.businessesHighlighted ?? [], raw?.restaurantsVisited ?? []]) {
    for (const b of list) {
      if (!b.county) continue;
      const short = normalizeCounty(b.county);
      m.set(short, (m.get(short) ?? 0) + 1);
    }
  }
  return m;
}

function ensureSeedFiles() {
  const seeds = [
    "current-elected-officials.json",
    "former-elected-officials.json",
  ];
  for (const f of seeds) {
    const p = path.join(BRAIN_DATA, f);
    if (!existsSync(p)) continue;
  }
}

function writeHub(summary: RelationshipNetworkSummary) {
  mkdirSync(NETWORK, { recursive: true });
  writeFileSync(
    path.join(NETWORK, "PHASE-14-POLITICAL-RELATIONSHIP-INFLUENCE-NETWORK.md"),
    `# Phase 14 — Political Relationship & Influence Network

> **Relationships, not endorsements.** Who can move people, money, volunteers, credibility, and introductions?

Updated: ${summary.generatedAt.slice(0, 10)}

## Mission

Build the statewide relationship map that identifies, tracks, and activates political, civic, community, faith, labor, and organizational leaders.

## Headline metrics

| Metric | Current |
| ------ | ------: |
| Statewide relationship score | **${summary.statewideRelationshipScore}%** |
| Current officials engaged | ${summary.currentOfficialsEngaged} / ${summary.currentOfficialsTotal} |
| Former officials engaged | ${summary.formerOfficialsEngaged} / ${summary.formerOfficialsTotal} |
| Leadership meetings completed | ${summary.meetingsCompleted} |
| Introductions generated | ${summary.introductionsGenerated} |
| Counties with influence | ${summary.countiesWithInfluence} / ${summary.countiesTotal} |

## Objectives

| # | System | Output |
| - | ------ | ------ |
| 1 | Arkansas Power Map | [\`arkansas-power-map.md\`](./arkansas-power-map.md) |
| 2 | Current Officials | [\`current-elected-officials.json\`](../../../data/campaign-brain/current-elected-officials.json) |
| 3 | Former Officials | [\`former-elected-officials.json\`](../../../data/campaign-brain/former-elected-officials.json) |
| 4 | Candidate Partnerships | [\`candidate-partnership-network.md\`](./candidate-partnership-network.md) |
| 5 | Introduction Program | [\`leadership-introduction-program.md\`](./leadership-introduction-program.md) |
| 6 | County Influence | [\`county-influence-inventory.md\`](./county-influence-inventory.md) |
| 7 | Meeting Tracker | [\`leadership-meeting-dashboard.md\`](./leadership-meeting-dashboard.md) |
| 8 | County Relationship Score | [\`county-influence-inventory.json\`](../../../data/campaign-brain/county-influence-inventory.json) |
| 9 | Activation Workflow | [\`relationship-activation-workflow.md\`](./relationship-activation-workflow.md) |
| 10 | Election Plan | \`/election-plan\` → **Political Relationships** |

## Standard ask package

Every face-to-face meeting uses [\`standard-ask-package.md\`](./standard-ask-package.md).

## Build

\`\`\`bash
npm run campaign-brain:relationship-network:build
npm run campaign-brain:build
npm run election-plan:build
\`\`\`
`,
    "utf8",
  );
}

function writePowerMap(counties: CountyInfluenceRow[], current: CurrentElectedOfficial[], former: FormerElectedOfficial[]) {
  const byCluster = new Map<string, CountyInfluenceRow[]>();
  for (const c of counties) {
    const list = byCluster.get(c.cluster) ?? [];
    list.push(c);
    byCluster.set(c.cluster, list);
  }

  writeFileSync(
    path.join(NETWORK, "arkansas-power-map.md"),
    `# Arkansas Power Map

Relationships by county and cluster — not an elected-official list alone.

## Categories tracked

${POWER_MAP_CATEGORIES.map((c) => `- **${c.label}** (\`${c.id}\`)`).join("\n")}

## By cluster

${[...byCluster.entries()]
  .map(
    ([cluster, rows]) => `### ${cluster}

${rows
  .map(
    (r) =>
      `- **${r.county.replace(" County", "")}** — score ${r.countyInfluenceScore} · ${r.knownLeaders} known · gaps: ${r.priorityIntroductions.join(", ") || "none logged"}`,
  )
  .join("\n")}`,
  )
  .join("\n\n")}

## Logged leaders

- Current / elected: **${current.length}**
- Former elected: **${former.length}**

Data: [\`county-influence-inventory.json\`](../../../data/campaign-brain/county-influence-inventory.json)
`,
    "utf8",
  );
}

function writeIntroductionProgram() {
  writeFileSync(
    path.join(NETWORK, "leadership-introduction-program.md"),
    `# Leadership Introduction Program

For every relationship — specific ask framework:

${INTRODUCTION_ASK_FRAMEWORK.map((a, i) => `${i + 1}. **${a}**`).join("\n")}

Track outcomes in official JSON records (\`outcomes\` on former officials · \`asks\` flags on current).

See [\`standard-ask-package.md\`](./standard-ask-package.md) for Kelly's meeting script.
`,
    "utf8",
  );

  writeFileSync(
    path.join(NETWORK, "standard-ask-package.md"),
    `# Standard Ask Package

When Kelly meets a current official, former official, county chair, pastor, labor leader, or community influencer:

${STANDARD_ASK_PACKAGE.map((q, i) => `${i + 1}. ${q}`).join("\n")}

**Priority:** Face-to-face whenever possible.

Log results in [\`current-elected-officials.json\`](../../../data/campaign-brain/current-elected-officials.json) or [\`former-elected-officials.json\`](../../../data/campaign-brain/former-elected-officials.json).
`,
    "utf8",
  );
}

function writeMeetingDashboard(summary: RelationshipNetworkSummary) {
  writeFileSync(
    path.join(NETWORK, "leadership-meeting-dashboard.md"),
    `# Leadership Meeting Dashboard

Updated: ${summary.generatedAt.slice(0, 10)}

| Metric | Count |
| ------ | ----: |
| Meetings requested | ${summary.meetingsRequested} |
| Meetings scheduled | ${summary.meetingsScheduled} |
| Meetings completed | ${summary.meetingsCompleted} |
| Introductions generated | ${summary.introductionsGenerated} |
| Volunteer leaders identified | ${summary.volunteerLeadersIdentified} |
| Current officials engaged | ${summary.currentOfficialsEngaged} / ${summary.currentOfficialsTotal} |
| Former officials engaged | ${summary.formerOfficialsEngaged} / ${summary.formerOfficialsTotal} |

Financial support discussions: track via \`asks.financialSupportRequested\` and \`outcomes.financialSupportDiscussed\` on leader records.
`,
    "utf8",
  );
}

function writeActivationWorkflow() {
  writeFileSync(
    path.join(NETWORK, "relationship-activation-workflow.md"),
    `# Relationship Activation Workflow

${ACTIVATION_WORKFLOW.map((s, i) => (i < ACTIVATION_WORKFLOW.length - 1 ? `${s} →` : s)).join(" ")}

## Detail

1. **Identify Leader** — power map · county gap analysis
2. **Request Meeting** — in-person preferred
3. **In-Person Meeting** — standard ask package
4. **Present Victory Plan** — county-specific, not generic
5. **Request Support** — advice first, endorsement never required
6. **Request Introductions** — 5–10 names per meeting
7. **Request Volunteer Leaders** — strike team pipeline
8. **Request Financial Support** — only when relationship warrants
9. **Follow-Up** — 48h thank-you · 30-day check-in
10. **Relationship Growth** — CRI · events · stories

Connects to Phase 11 People Power and Phase 12/13 motion layers.
`,
    "utf8",
  );
}

function writeCountyInventory(counties: CountyInfluenceRow[]) {
  writeFileSync(
    path.join(BRAIN_DATA, "county-influence-inventory.json"),
    JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), counties }, null, 2),
    "utf8",
  );

  const gaps = counties
    .filter((c) => c.countyInfluenceScore < 20)
    .slice(0, 20);

  writeFileSync(
    path.join(NETWORK, "county-influence-inventory.md"),
    `# County Influence Inventory

**75 counties** · relationship gaps identified by missing leader categories.

## Lowest relationship depth (priority counties)

${gaps.length ? gaps.map((c) => `- **${c.county}** — score ${c.countyInfluenceScore} · need: ${c.priorityIntroductions.join(", ")}`).join("\n") : "_All counties awaiting leader data._"}

## Score components

- Current elected officials engaged
- Former elected officials engaged
- Volunteer leaders (strike team)
- Faith leaders identified
- Business leaders identified

Data: [\`county-influence-inventory.json\`](../../../data/campaign-brain/county-influence-inventory.json)
`,
    "utf8",
  );
}

function writeCandidatePartnershipNetwork(partners: CandidatePartner[]) {
  const normalized = partners.map((p) => ({
    ...p,
    sharedEvents: p.sharedEvents ?? 0,
    sharedCanvasses: p.sharedCanvasses ?? 0,
    sharedPhoneBanks: p.sharedPhoneBanks ?? 0,
    sharedVolunteers: p.sharedVolunteers ?? 0,
    sharedFundraising: p.sharedFundraising ?? 0,
    sharedCountyLeadership: p.sharedCountyLeadership ?? false,
    sharedMobilizeEvents: p.sharedMobilizeEvents ?? 0,
  }));

  writeFileSync(
    path.join(BRAIN_DATA, "candidate-partnership-network.json"),
    JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        note: "Aggregated from candidate-partnerships.json — shared execution tracking",
        partners: normalized,
        totals: {
          active: normalized.filter((p) => p.status === "active").length,
          sharedEvents: normalized.reduce((a, p) => a + p.sharedEvents, 0),
          sharedMobilizeEvents: normalized.reduce((a, p) => a + p.sharedMobilizeEvents, 0),
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  writeFileSync(
    path.join(NETWORK, "candidate-partnership-network.md"),
    `# Candidate Partnership Network

Congressional · State Senate · State House · local candidates — shared execution.

| Partner | Office | County | Shared events | Mobilize | Status |
| ------- | ------ | ------ | ------------- | -------- | ------ |
${normalized.length ? normalized.map((p) => `| ${p.name} | ${p.office} | ${p.county} | ${p.sharedEvents} | ${p.sharedMobilizeEvents} | ${p.status} |`).join("\n") : "| — | — | — | — | — | — |"}

Track: shared canvasses · phone banks · volunteers · fundraising · county leadership.

Source: [\`candidate-partnerships.json\`](../../../data/campaign-brain/candidate-partnerships.json)
`,
    "utf8",
  );
}

function main() {
  ensureSeedFiles();
  const current = loadCurrentOfficials();
  const former = loadFormerOfficials();
  const partners = loadCandidatePartners();
  const strikeTeams = loadStrikeTeamMap();
  const faithByCounty = loadFaithByCounty();
  const businessByCounty = loadBusinessByCounty();

  const counties = buildCountyInventory(current, former, strikeTeams, faithByCounty, businessByCounty);
  const summary = buildSummary(current, former, partners, counties);

  writeFileSync(path.join(BRAIN_DATA, "relationship-network-summary.json"), JSON.stringify(summary, null, 2), "utf8");

  writeHub(summary);
  writePowerMap(counties, current, former);
  writeIntroductionProgram();
  writeMeetingDashboard(summary);
  writeActivationWorkflow();
  writeCountyInventory(counties);
  writeCandidatePartnershipNetwork(partners);

  // eslint-disable-next-line no-console
  console.log(
    `Phase 14 Relationship Network: ${summary.currentOfficialsTotal} current · ${summary.formerOfficialsTotal} former · score ${summary.statewideRelationshipScore}%`,
  );
}

main();
