/**
 * PHASE 14 — Coalition, Labor & Power Map Activation
 *
 * Execution infrastructure — NAACP, AEA, Muslim, Hispanic, labor, elected officials,
 * Sherwood GOTV, city forums, rural town halls. No vote models.
 *
 * Usage: npm run campaign-brain:coalition
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";
import type { CoalitionPowerMapSummary } from "./lib/coalition-power-map-types";

const COALITION = path.join(BRAIN_ROOT, "coalition-power-map");
const TOP_CITIES = path.join(
  process.cwd(),
  "docs/strategic-plan/plurality-victory-plan/part-iii-arkansas-battlefield/chapter-07-top-40-city-strategy/top-40-city-summary.json",
);

const COALITION_ASKS = [
  "Meeting",
  "Introductions",
  "Volunteer leaders",
  "Local networks",
  "Event opportunities",
  "Email list support (where legally/permissibly available)",
  "Financial support",
  "Public/private validation",
  "Future follow-up",
];

const STANDARD_ASK_PACKAGE = [
  "What should Kelly know about your area?",
  "Who are the 5–10 people she must meet?",
  "Who are the volunteer leaders in your area?",
  "What events should Kelly attend?",
  "Can you introduce us to local networks?",
  "Can you help us connect with email/text/social networks where appropriate?",
  "Can you help us identify financial supporters?",
  "Can you personally support the campaign financially?",
  "Can we schedule a follow-up meeting?",
  "Can we publicly or privately list you as a supporter if appropriate?",
];

const RURAL_TOWNHALL_COUNTIES = [
  { county: "Ashley", topCity: "Crossett" },
  { county: "Bradley", topCity: "Warren" },
  { county: "Chicot", topCity: "Lake Village" },
  { county: "Desha", topCity: "McGehee" },
  { county: "Drew", topCity: "Monticello" },
  { county: "Mississippi", topCity: "Blytheville" },
  { county: "Monroe", topCity: "Clarendon" },
  { county: "Phillips", topCity: "Helena-West Helena" },
  { county: "St. Francis", topCity: "Forrest City" },
  { county: "Lee", topCity: "Marianna" },
];

function ensureDir(d: string) {
  mkdirSync(d, { recursive: true });
}

function writeIfMissing(filePath: string, content: string) {
  if (!existsSync(filePath)) writeFileSync(filePath, content, "utf8");
}

function syncElectedOfficials() {
  const current = readJson<{ officials: unknown[] }>(path.join(BRAIN_DATA, "current-elected-officials.json"));
  const powerMap = path.join(BRAIN_DATA, "democratic-elected-officials-power-map.json");
  if ((current?.officials?.length ?? 0) > 0) {
    writeFileSync(
      powerMap,
      JSON.stringify(
        { version: 1, generatedAt: new Date().toISOString(), note: "Synced from current-elected-officials.json", officials: current!.officials },
        null,
        2,
      ),
      "utf8",
    );
  }
  return readJson<{ officials: unknown[] }>(powerMap)?.officials ?? [];
}

function syncPastOfficials() {
  const former = readJson<{ officials: unknown[] }>(path.join(BRAIN_DATA, "former-elected-officials.json"));
  const out = path.join(BRAIN_DATA, "past-elected-officials-network.json");
  if ((former?.officials?.length ?? 0) > 0) {
    writeFileSync(
      out,
      JSON.stringify(
        { version: 1, generatedAt: new Date().toISOString(), note: "Synced from former-elected-officials.json", officials: former!.officials },
        null,
        2,
      ),
      "utf8",
    );
  }
  return readJson<{ officials: unknown[] }>(out)?.officials ?? [];
}

function syncCandidatePartnerships() {
  const raw = readJson<{ partners: unknown[]; byCategory?: Record<string, unknown[]> }>(
    path.join(BRAIN_DATA, "candidate-partnerships.json"),
  );
  const all = [...(raw?.partners ?? []), ...Object.values(raw?.byCategory ?? {}).flat()];
  const out = path.join(BRAIN_DATA, "running-candidate-partnerships.json");
  if (all.length > 0) {
    writeFileSync(
      out,
      JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), candidates: all }, null, 2),
      "utf8",
    );
  }
  return readJson<{ candidates: Array<Record<string, unknown>> }>(out)?.candidates ?? [];
}

function seedCityForums() {
  const file = path.join(BRAIN_DATA, "top-city-candidate-forums.json");
  const existing = readJson<{ forums: unknown[] }>(file);
  if ((existing?.forums?.length ?? 0) > 0) return existing!.forums;

  const cities = readJson<{ cities: Array<{ rank: number; name: string; county: string }> }>(TOP_CITIES);
  const top20 = (cities?.cities ?? []).sort((a, b) => a.rank - b.rank).slice(0, 20);
  const forums = top20.map((c) => ({
    city: c.name,
    county: c.county,
    proposedDate: null,
    host: "",
    venue: "",
    candidatesInvited: [],
    moderator: "",
    mobilizeLink: "",
    facebookEvent: "",
    pressRelease: "",
    status: c.name === "Fort Smith" ? "booked" : "not_started",
    note: c.name === "Fort Smith" ? "Already booked per field team" : "Target September/October after Sept 17",
  }));

  writeFileSync(file, JSON.stringify({ version: 1, note: "Top 20 city joint candidate forums", forums }, null, 2), "utf8");
  return forums;
}

function seedRuralTownhalls() {
  const file = path.join(BRAIN_DATA, "top-rural-election-townhalls.json");
  const existing = readJson<{ townhalls: unknown[] }>(file);
  if ((existing?.townhalls?.length ?? 0) > 0) return existing!.townhalls;

  const townhalls = RURAL_TOWNHALL_COUNTIES.map((r) => ({
    county: r.county,
    topCity: r.topCity,
    host: "",
    venue: "",
    date: null,
    clerkInvited: false,
    localCandidatesInvited: false,
    pressInvited: false,
    status: "not_started",
    topics: [
      "election process",
      "registration",
      "polling locations",
      "absentee/mail rules",
      "county clerk responsibilities",
      "voter participation",
      "transparency and trust",
    ],
  }));

  writeFileSync(file, JSON.stringify({ version: 1, note: "Top 10 rural election Q&A town halls — no legal claims without source review", townhalls }, null, 2), "utf8");
  return townhalls;
}

function buildSummary(
  naacp: { branches: Array<{ callStatus?: string; meetingRequested?: boolean; branchSpeakingDate?: string | null }> },
  aea: { counties: Array<{ meetingStatus?: string; teacherSupporters?: string[] }> },
  muslim: { communities: Array<{ meetingRequest?: string }> },
  hispanic: { frameworkStatus: string; lead: string },
  labor: { unions: Array<{ contactStatus?: string; meetingCompleted?: boolean; endorsementStatus?: string }> },
  elected: Array<{ asks?: { contacted?: boolean; meetingCompleted?: boolean; networkRequested?: boolean } }>,
  past: Array<{ asks?: { meetingCompleted?: boolean; contacted?: boolean } }>,
  candidates: Array<{ status?: string; sharedEvents?: number; sharedMobilizeEvents?: number }>,
  sherwood: { goal: string; tracking: Record<string, number | string>; event: { status: string } },
  forums: Array<{ status?: string; city?: string }>,
  townhalls: Array<{ status?: string }>,
): CoalitionPowerMapSummary {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    heroLine: "Move from opportunity to organized relationships — coalition, labor, and power map activation.",
    naacp: {
      branchesTotal: naacp.branches.length,
      called: naacp.branches.filter((b) => b.callStatus && b.callStatus !== "not_called").length,
      meetingsRequested: naacp.branches.filter((b) => b.meetingRequested).length,
      speakingScheduled: naacp.branches.filter((b) => b.branchSpeakingDate).length,
    },
    aea: {
      countiesActive: aea.counties.length,
      teacherSupporters: aea.counties.reduce((a, c) => a + (c.teacherSupporters?.length ?? 0), 0),
      meetingsCompleted: aea.counties.filter((c) => c.meetingStatus === "completed").length,
    },
    muslim: {
      contactsTotal: muslim.communities.length,
      meetingsOpen: muslim.communities.filter((c) => c.meetingRequest === "open" || c.meetingRequest === "scheduled").length,
      meetingsRequested: muslim.communities.filter((c) => c.meetingRequest === "requested").length,
    },
    hispanic: {
      frameworkStatus: hispanic.frameworkStatus,
      lead: hispanic.lead,
      pendingJasmineReview: hispanic.frameworkStatus === "pending_jasmine_review",
    },
    labor: {
      unionsTotal: labor.unions.length,
      contacted: labor.unions.filter((u) => u.contactStatus && u.contactStatus !== "not_contacted").length,
      meetingsCompleted: labor.unions.filter((u) => u.meetingCompleted).length,
      endorsementsInProgress: labor.unions.filter((u) => u.endorsementStatus === "in_progress").length,
    },
    electedOfficials: {
      contacted: elected.filter((o) => o.asks?.contacted).length,
      total: elected.length,
      meetingsCompleted: elected.filter((o) => o.asks?.meetingCompleted).length,
      introductionsRequested: elected.filter((o) => o.asks?.networkRequested).length,
    },
    candidates: {
      activePartnerships: candidates.filter((c) => c.status === "active").length,
      sharedEvents: candidates.reduce((a, c) => a + (Number(c.sharedEvents) || 0), 0),
      jointMobilize: candidates.reduce((a, c) => a + (Number(c.sharedMobilizeEvents) || 0), 0),
    },
    pastOfficials: {
      engaged: past.filter((o) => o.asks?.meetingCompleted || o.asks?.contacted).length,
      total: past.length,
    },
    sherwood: {
      goal: sherwood.goal,
      vipTablesSold: Number(sherwood.tracking.vipTablesSold) || 0,
      vipTablesGoal: Number(sherwood.tracking.vipTablesGoal) || 20,
      ticketsSold: Number(sherwood.tracking.ticketsSold) || 0,
      status: String(sherwood.event.status),
      onTrack: Number(sherwood.tracking.vipTablesSold) >= 5,
    },
    cityForums: {
      planned: forums.filter((f) => f.status === "planned" || f.status === "booked").length,
      booked: forums.filter((f) => f.status === "booked").length,
      total: forums.length,
      fortSmithBooked: forums.some((f) => f.city === "Fort Smith" && f.status === "booked"),
    },
    ruralTownhalls: {
      planned: townhalls.filter((t) => t.status === "planned" || t.status === "scheduled").length,
      total: townhalls.length,
    },
  };
}

function writeHub(summary: CoalitionPowerMapSummary) {
  writeFileSync(
    path.join(COALITION, "PHASE-14-COALITION-LABOR-POWER-MAP.md"),
    `# Phase 14 — Coalition, Labor & Power Map Activation

Updated: ${summary.generatedAt.slice(0, 10)}

## Mission

Identify, track, contact, and activate statewide relationship networks — execution infrastructure, not a vote model.

## Every coalition conversation asks for

${COALITION_ASKS.map((a, i) => `${i + 1}. ${a}`).join("\n")}

## Progress snapshot

| Track | Status |
| ----- | ------ |
| NAACP branches | ${summary.naacp.called}/${summary.naacp.branchesTotal} called · ${summary.naacp.speakingScheduled} speaking |
| AEA / teachers | ${summary.aea.countiesActive} counties · ${summary.aea.teacherSupporters} supporters |
| Muslim outreach | ${summary.muslim.contactsTotal} contacts |
| Hispanic outreach | ${summary.hispanic.frameworkStatus} (${summary.hispanic.lead}) |
| Labor / unions | ${summary.labor.contacted}/${summary.labor.unionsTotal} contacted |
| Elected officials | ${summary.electedOfficials.contacted}/${summary.electedOfficials.total} contacted |
| Candidate partnerships | ${summary.candidates.activePartnerships} active |
| Sherwood 60%+ | VIP ${summary.sherwood.vipTablesSold}/${summary.sherwood.vipTablesGoal} |
| City forums | ${summary.cityForums.planned}/${summary.cityForums.total} planned |
| Rural town halls | ${summary.ruralTownhalls.planned}/${summary.ruralTownhalls.total} planned |

## Build

\`\`\`bash
npm run campaign-brain:coalition
npm run campaign-brain:build
npm run election-plan:build
\`\`\`
`,
    "utf8",
  );
}

function writeStandardAsk() {
  writeFileSync(
    path.join(COALITION, "standard-ask-package.md"),
    `# Standard Relationship Ask Package

Every Kelly meeting — coalition, labor, faith, elected official, or community leader:

${STANDARD_ASK_PACKAGE.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`,
    "utf8",
  );
}

function writeNaacpDocs(naacp: { branches: unknown[]; goal: string }) {
  const d = path.join(COALITION, "naacp");
  ensureDir(d);
  writeFileSync(
    path.join(d, "naacp-branch-engagement-plan.md"),
    `# NAACP Branch Engagement Plan

**Goal:** ${naacp.goal}

Call every branch · request time for Kelly to speak · track volunteer leaders and introductions.

Branches logged: **${naacp.branches.length}**

Data: [\`naacp-branch-engagement.json\`](../../../data/campaign-brain/naacp-branch-engagement.json)
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "naacp-branch-call-script.md"),
    `# NAACP Branch Call Script

Hi, my name is [NAME] with the Kelly Grappe campaign for Secretary of State.

Kelly is running a statewide campaign built on showing up in every community. We'd like to request time for Kelly to speak to your branch about elections access, voter participation, and the Secretary of State's role in serving all Arkansans.

Could we schedule a conversation with your branch president?

**Track:** call status · meeting requested · speaking date · introductions · volunteer leaders
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "naacp-branch-tracker.md"),
    `# NAACP Branch Tracker

${naacp.branches.length} branches in data file. Add branches to JSON — no PII on election-plan dashboard.
`,
    "utf8",
  );
}

function writeAeaDocs(aea: { coordinator: string; counties: unknown[] }) {
  const d = path.join(COALITION, "aea-teachers");
  ensureDir(d);
  writeFileSync(
    path.join(d, "aea-teacher-network-plan.md"),
    `# AEA / Teacher Network Plan

Coordinator: **${aea.coordinator}**

Identify teacher supporters across counties · request supporter meetings at each campaign stop.

Counties tracked: **${aea.counties.length}**
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "april-reisma-meeting-brief.md"),
    `# April Reisma Meeting Brief

Coordinate county-by-county teacher supporter identification.

Ask April:
- Which counties have active teacher advocates?
- Who should Kelly meet at each stop?
- Which AEA contacts can make introductions?
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "teacher-supporter-request-script.md"),
    `# Teacher Supporter Request Script

We're building a statewide campaign that respects educators. Would you be willing to meet with Kelly briefly at [EVENT/COUNTY] or connect us with teachers who care about elections access and public service?
`,
    "utf8",
  );
}

function writeMuslimDocs(muslim: { partners: string[]; communities: unknown[] }) {
  const d = path.join(COALITION, "muslim-outreach");
  ensureDir(d);
  writeFileSync(
    path.join(d, "muslim-community-outreach-framework.md"),
    `# Muslim Community Outreach Framework

Partners: ${muslim.partners.join(" · ")}

Relationship-first · respectful · no transactional asks on first contact.

Communities tracked: **${muslim.communities.length}**
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "dr-ali-khan-ebrahim-network-brief.md"),
    `# Dr. Ali Khan & Ebrahim Network Brief

Work with Dr. Ali Khan and Ebrahim to respectfully network into Muslim communities across Arkansas.

Track cultural notes · meeting requests · event opportunities · volunteer leaders.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "mosque-community-meeting-tracker.md"),
    `# Mosque / Community Meeting Tracker

See [\`muslim-community-outreach.json\`](../../../data/campaign-brain/muslim-community-outreach.json)
`,
    "utf8",
  );
}

function writeHispanicDocs(hispanic: { lead: string; frameworkStatus: string; pillars: string[] }) {
  const d = path.join(COALITION, "hispanic-outreach");
  ensureDir(d);
  writeFileSync(
    path.join(d, "hispanic-outreach-framework.md"),
    `# Hispanic Outreach Framework

**Status:** ${hispanic.frameworkStatus}

**Lead:** ${hispanic.lead} — do **not** finalize plan without Jasmine Serano.

## Pillars (framework only)

${hispanic.pillars.map((p) => `- ${p.replace(/_/g, " ")}`).join("\n")}
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "jasmine-serano-planning-brief.md"),
    `# Jasmine Serano Planning Brief

Jasmine is Hispanic Outreach Lead and youth leader.

Campaign Brain holds framework only until Jasmine builds the operational plan.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "hispanic-community-listening-plan.md"),
    `# Hispanic Community Listening Plan

Draft listening sessions · youth outreach · trusted messenger strategy — pending lead review.
`,
    "utf8",
  );
}

function writeLaborDocs(labor: { keyPartners: string[]; coreQuestion: string; unions: unknown[] }) {
  const d = path.join(COALITION, "labor-unions");
  ensureDir(d);
  writeFileSync(
    path.join(d, "labor-union-strategy.md"),
    `# Labor & Union Strategy

Key partners: ${labor.keyPartners.join(" · ")}

**Core question:** ${labor.coreQuestion}

**Goal:** Seek endorsements from as many union halls as possible.

Unions tracked: **${labor.unions.length}**
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "union-meeting-prep-brief.md"),
    `# Union Meeting Prep Brief

Listen first · SOS office support for working people · fair filings · transparency · accountability.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "union-leader-meeting-ask.md"),
    `# Union Leader Meeting Ask

1. How can the Secretary of State's office better support your members?
2. Would your hall consider an endorsement conversation?
3. Can you connect us with member communication channels where appropriate?
4. Volunteer and financial support — when relationship warrants.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "democratic-union-caucus-zack-bledsoe-brief.md"),
    `# Democratic Union Caucus — Zack Bledsoe Brief

Coordinate with Democratic Union Caucus and Zack Bledsoe for hall introductions and caucus events.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "secretary-of-state-and-labor-listening-brief.md"),
    `# Secretary of State & Labor Listening Brief

Kelly listens · explains SOS role · asks how office can serve working Arkansans — not a transactional pitch.
`,
    "utf8",
  );
}

function writeElectedDocs() {
  const d = path.join(COALITION, "elected-officials");
  ensureDir(d);
  for (const [file, title, body] of [
    ["democratic-elected-officials-power-map.md", "Democratic Elected Officials Power Map", "Track current officials — networks, money, volunteer leaders, introductions."],
    ["current-official-call-script.md", "Current Official Call Script", "Request meeting · present county-specific victory plan · standard ask package."],
    ["past-official-call-script.md", "Past Official Call Script", "Institutional memory · advice · introductions · local leader recommendations."],
    ["candidate-partnership-call-script.md", "Candidate Partnership Call Script", "Shared canvass · phone bank · events · Mobilize · volunteer pool."],
  ] as const) {
    writeFileSync(path.join(d, file), `# ${title}\n\n${body}\n`, "utf8");
  }
}

function writeSherwoodDocs(sherwood: Record<string, unknown>) {
  const d = path.join(COALITION, "win-sherwood");
  ensureDir(d);
  const event = sherwood.event as Record<string, unknown>;
  const tracking = sherwood.tracking as Record<string, number>;

  writeFileSync(
    path.join(d, "WIN-SHERWOOD-60-PERCENT-PLAN.md"),
    `# WIN SHERWOOD — 60%+ Plan

**Goal:** ${sherwood.goal}

Home-base GOTV operation · Central Arkansas momentum · Kelly Grappe for SOS event.

| Metric | Current |
| ------ | ------: |
| VIP tables sold | ${tracking.vipTablesSold ?? 0} / ${tracking.vipTablesGoal ?? 20} |
| Tickets sold | ${tracking.ticketsSold ?? 0} |
| Volunteer signups | ${tracking.volunteerSignups ?? 0} |

Event: outdoor · 700+ capacity · VIP $1,000 · show $25 · food $25
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "sherwood-gotv-kickoff-event-plan.md"),
    `# Sherwood GOTV Kickoff Event Plan

Frames: ${(event.frames as string[]).join(" · ")}

Planning team: ${event.planningTeamSize} leaders · alcohol compliance · legal review required.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "vip-table-fundraising-plan.md"),
    `# VIP Table Fundraising Plan

VIP table: $${event.vipTablePrice} — ${event.vipTableIncludes}
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "sherwood-resource-allocation.md"),
    `# Sherwood Resource Allocation

Track staffing · security · permits · alcohol compliance · follow-up.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "sherwood-volunteer-deployment.md"),
    `# Sherwood Volunteer Deployment

Convert event attendees → Power of 5 · strike team · GOTV shifts.
`,
    "utf8",
  );
}

function writeCityForumDocs(forums: Array<{ city: string; county: string; status?: string }>) {
  const d = path.join(COALITION, "top-city-candidate-forums");
  ensureDir(d);
  writeFileSync(
    path.join(d, "top-20-city-candidate-forum-plan.md"),
    `# Top 20 City Candidate Forum Plan

Joint candidate forums in September/October **after September 17**.

**${forums.filter((f) => f.status === "booked").length}** booked · **${forums.length}** cities tracked.

Fort Smith: ${forums.some((f) => f.city === "Fort Smith" && f.status === "booked") ? "BOOKED" : "pending"}
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "candidate-forum-host-kit.md"),
    `# Candidate Forum Host Kit

Venue · moderator · candidate invites · Mobilize · Facebook draft · press release · Phase 13 forward motion.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "candidate-forum-tracker.md"),
    `# Candidate Forum Tracker

${forums.map((f) => `- **${f.city}** (${f.county}) — ${f.status ?? "not_started"}`).join("\n")}
`,
    "utf8",
  );
}

function writeRuralTownhallDocs(townhalls: Array<{ county: string; topCity: string; status?: string }>) {
  const d = path.join(COALITION, "rural-election-townhalls");
  ensureDir(d);
  writeFileSync(
    path.join(d, "top-rural-election-qa-townhall-plan.md"),
    `# Top Rural Election Q&A Town Hall Plan

Top 10 rural counties · election process · registration · clerk role · transparency.

**No legal claims without source review.**
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "election-townhall-format.md"),
    `# Election Town Hall Format

60–90 min · clerk welcome if available · Q&A · voter participation · non-partisan process education.
`,
    "utf8",
  );
  writeFileSync(
    path.join(d, "rural-townhall-tracker.md"),
    `# Rural Town Hall Tracker

${townhalls.map((t) => `- **${t.county}** (${t.topCity}) — ${t.status ?? "not_started"}`).join("\n")}
`,
    "utf8",
  );
}

function main() {
  ensureDir(COALITION);

  syncElectedOfficials();
  syncPastOfficials();
  syncCandidatePartnerships();
  const forums = seedCityForums() as Array<{ city: string; county: string; status?: string }>;
  const townhalls = seedRuralTownhalls() as Array<{ county: string; topCity: string; status?: string }>;

  const naacp = readJson<{ branches: Array<{ callStatus?: string; meetingRequested?: boolean; branchSpeakingDate?: string | null }>; goal: string }>(
    path.join(BRAIN_DATA, "naacp-branch-engagement.json"),
  ) ?? { branches: [], goal: "Call every NAACP branch in Arkansas" };

  const aea = readJson<{ coordinator: string; counties: Array<{ meetingStatus?: string; teacherSupporters?: string[] }> }>(
    path.join(BRAIN_DATA, "aea-teacher-network.json"),
  ) ?? { coordinator: "April Reisma", counties: [] };

  const muslim = readJson<{ partners: string[]; communities: Array<{ meetingRequest?: string }> }>(
    path.join(BRAIN_DATA, "muslim-community-outreach.json"),
  ) ?? { partners: ["Dr. Ali Khan", "Ebrahim"], communities: [] };

  const hispanic = readJson<{ frameworkStatus: string; lead: string; pillars: string[] }>(
    path.join(BRAIN_DATA, "hispanic-outreach.json"),
  ) ?? { frameworkStatus: "pending_jasmine_review", lead: "Jasmine Serano", pillars: [] };

  const labor = readJson<{ keyPartners: string[]; coreQuestion: string; unions: Array<{ contactStatus?: string; meetingCompleted?: boolean; endorsementStatus?: string }> }>(
    path.join(BRAIN_DATA, "labor-union-engagement.json"),
  ) ?? { keyPartners: [], coreQuestion: "", unions: [] };

  const elected = syncElectedOfficials() as Array<{ asks?: { contacted?: boolean; meetingCompleted?: boolean; networkRequested?: boolean } }>;
  const past = syncPastOfficials() as Array<{ asks?: { meetingCompleted?: boolean; contacted?: boolean } }>;
  const candidates = syncCandidatePartnerships();

  const sherwood = readJson<Record<string, unknown>>(path.join(BRAIN_DATA, "win-sherwood-operation.json")) ?? {
    goal: "Win Sherwood outright with 60%+",
    event: { status: "planning", frames: [], planningTeamSize: 8, vipTablePrice: 1000, vipTableIncludes: "" },
    tracking: { vipTablesSold: 0, vipTablesGoal: 20, ticketsSold: 0, volunteerSignups: 0 },
  };

  const summary = buildSummary(naacp, aea, muslim, hispanic, labor, elected, past, candidates, sherwood as never, forums, townhalls);

  writeFileSync(path.join(BRAIN_DATA, "coalition-power-map-summary.json"), JSON.stringify(summary, null, 2), "utf8");

  writeHub(summary);
  writeStandardAsk();
  writeNaacpDocs(naacp);
  writeAeaDocs(aea);
  writeMuslimDocs(muslim);
  writeHispanicDocs(hispanic);
  writeLaborDocs(labor);
  writeElectedDocs();
  writeSherwoodDocs(sherwood);
  writeCityForumDocs(forums);
  writeRuralTownhallDocs(townhalls);

  // eslint-disable-next-line no-console
  console.log(
    `Phase 14 Coalition: NAACP ${summary.naacp.branchesTotal} branches · forums ${summary.cityForums.planned}/${summary.cityForums.total} · Sherwood VIP ${summary.sherwood.vipTablesSold}/${summary.sherwood.vipTablesGoal}`,
  );
}

main();
