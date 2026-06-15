/**
 * PHASE 11 — People Power Operating System
 *
 * Activates humans around Brain opportunity. No vote models. No new strategy.
 *
 * Usage: npm run campaign-brain:people-power:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const PP = path.join(BRAIN_ROOT, "people-power");

const MOBILIZE_CATEGORIES = [
  {
    id: "county_fair",
    label: "County Fair",
    template: "County Fair — Kelly/Surrogate booth · volunteer shifts · RSVP",
    signup: "Mobilize signup → county Events Captain notified",
    reminder: "72h · 24h · day-of text to confirmed volunteers",
    followUp: "48h thank-you · outcome form · Substack story assignment",
  },
  {
    id: "festival",
    label: "Festival",
    template: "Festival activation — tabling · literature · photo op",
    signup: "Public RSVP + volunteer shift picker",
    reminder: "Weekly until event · weather update day-before",
    followUp: "Attendee contacts → Power of 5 · county captain debrief",
  },
  {
    id: "house_party",
    label: "House Party",
    template: "Host-led · 10/25/50/100 capacity · private Mobilize link",
    signup: "Host invite list + open RSVP cap",
    reminder: "Host checklist 1 week · guests 48h",
    followUp: "Registration count · volunteer recruits · follow-up calls",
  },
  {
    id: "volunteer_meeting",
    label: "Volunteer Meeting",
    template: "County or cluster volunteer training · Zoom or in-person",
    signup: "Mobilize registration · role preference",
    reminder: "48h agenda · 2h link reminder",
    followUp: "Strike team role assignments · next action",
  },
  {
    id: "postcard_writing",
    label: "Postcard Writing",
    template: "Postcard party · supplies provided · goal cards per program",
    signup: "Shift signup · cards-per-volunteer target",
    reminder: "Materials pickup · location · parking",
    followUp: "Cards mailed count · county Postcard Captain report",
  },
  {
    id: "phone_bank",
    label: "Phone Bank",
    template: "Virtual or in-person · list assigned · script by program",
    signup: "Mobilize shift · Phone Bank Captain confirms",
    reminder: "1h before · dial-in / location",
    followUp: "Calls completed · contacts · recruits logged",
  },
  {
    id: "faith_event",
    label: "Faith Event",
    template: "Church visit · community faith event · pastor meeting",
    signup: "Faith Captain approval · respectful RSVP cap",
    reminder: "Coordinator confirmation · dress/approach notes",
    followUp: "Pastor relationship log · faith outreach network update",
  },
  {
    id: "candidate_canvass",
    label: "Candidate Canvass",
    template: "Shared canvass with down-ballot partner",
    signup: "Partner candidate co-host · turf assignment",
    reminder: "Meet location · walk list · partner liaison",
    followUp: "Doors knocked · partnership dashboard update",
  },
];

function writeMobilizeLayer() {
  const dir = path.join(PP, "mobilize");
  mkdirSync(dir, { recursive: true });

  const catTable = MOBILIZE_CATEGORIES.map(
    (c) =>
      `### ${c.label}\n\n| Step | Workflow |\n| ---- | -------- |\n| Template | ${c.template} |\n| Signup | ${c.signup} |\n| Reminder | ${c.reminder} |\n| Follow-up | ${c.followUp} |\n`,
  ).join("\n");

  writeFileSync(
    path.join(dir, "mobilize-event-framework.md"),
    `# Mobilize Event Framework

> Every approved Brain event → Mobilize link → RSVP → volunteers → attendance → follow-up

## Required fields per event

| Field | Source |
| ----- | ------ |
| Event ID | Campaign Brain verification map |
| Mobilize URL | Mobilize admin |
| RSVP count | Mobilize export |
| Volunteer signups | Mobilize shifts |
| Attendance | Field report |
| Follow-up status | Event outcome form |

Data: [\`mobilize-events.json\`](../../../data/campaign-brain/mobilize-events.json)

---

${catTable}
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "mobilize-county-playbook.md"),
    `# Mobilize County Playbook

1. **County Captain** approves event from Brain priority list
2. **Events Captain** creates Mobilize event from category template
3. **Volunteer Captain** fills shifts · recruits from Power of 5
4. **Faith / Postcard / Phone captains** activate parallel programs if applicable
5. **Media Captain** assigns Substack story after event
6. Log outcomes → [\`event-outcomes.json\`](../../../data/campaign-brain/event-outcomes.json)

Strike teams: [County Strike Teams](../field-operating-system/county-strike-team-dashboard.md)
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "mobilize-volunteer-workflow.md"),
    `# Mobilize Volunteer Workflow

\`\`\`txt
Brain recommends event → Mobilize published → volunteer signs up →
captain confirms → reminders sent → event → outcome logged → story assigned
\`\`\`

## Volunteer paths

| Path | Entry |
| ---- | ----- |
| Founding 20 | June 28 launch call |
| County team | Strike team captain invite |
| Power of 5 | Personal invite link |
| Open Mobilize | Public event page |
| Partner candidate | Shared canvass / event |

Launch: **June 28 · 6 PM Zoom** · Goal **20 founding volunteer leaders**
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "mobilize-gotv-workflow.md"),
    `# Mobilize GOTV Workflow

1. Verified target event or turf from Brain
2. Mobilize GOTV shift (phone bank or canvass category)
3. County list assigned by Phone Bank / Canvass Captain
4. Shift completion logged → [\`phone-banks-field.json\`](../../../data/campaign-brain/phone-banks-field.json)
5. Missing Democrats program → Lane 2 recovery tracking

No voter-level data in public dashboards — aggregate counts only.
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "README.md"),
    `# Mobilize Integration Layer

- [Event framework](./mobilize-event-framework.md)
- [County playbook](./mobilize-county-playbook.md)
- [Volunteer workflow](./mobilize-volunteer-workflow.md)
- [GOTV workflow](./mobilize-gotv-workflow.md)
- [Festival activation queue](./festival-activation-queue.md)
`,
    "utf8",
  );
}

function writeVolunteerNetwork() {
  const dir = path.join(PP, "volunteer-network");
  mkdirSync(dir, { recursive: true });
  const cfg = readJson<{ volunteerLeadership: Record<string, unknown> }>(
    path.join(BRAIN_DATA, "people-power-network.json"),
  )?.volunteerLeadership;
  const launch = cfg?.launchCall as Record<string, string> | undefined;
  const retreat = cfg?.julyRetreat as Record<string, string> | undefined;
  const monthly = cfg?.monthlyCalls as Record<string, unknown> | undefined;

  writeFileSync(
    path.join(dir, "volunteer-leadership-network.md"),
    `# Volunteer Leadership Network

## June 28 Launch Call

| | |
| --- | --- |
| **Date** | June 28, 2026 |
| **Time** | 6 PM Central |
| **Format** | Zoom |
| **Founding team goal** | **20 volunteers** |
| **Current** | ${cfg?.foundingTeamCurrent ?? 0} / ${cfg?.foundingTeamGoal ?? 20} |
| **Purpose** | Launch Volunteer Leadership Network |

---

## July Retreat — Forevermost Farms

${retreat?.purpose ?? "Build ownership · relationships · train leadership · launch Power of 5 · assign county missions"}

---

## Monthly Leadership Calls

| | |
| --- | --- |
| **Schedule** | ${(monthly?.schedule as string) ?? "Last Sunday · 6 PM"} |
| **Format** | ${(monthly?.format as string) ?? "Statewide Zoom"} |

Track: attendance · counties represented · volunteer growth · action assignments

Data: [\`people-power-network.json\`](../../../data/campaign-brain/people-power-network.json)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Volunteer Leadership Network\n\n- [Network hub](./volunteer-leadership-network.md)\n`, "utf8");
}

function writeSubstack() {
  const dir = path.join(PP, "substack");
  mkdirSync(dir, { recursive: true });
  const stories = readJson<{ stories: unknown[] }>(path.join(BRAIN_DATA, "substack-stories.json"));
  const sub = readJson<{ substack: Record<string, number> }>(path.join(BRAIN_DATA, "people-power-network.json"))?.substack;

  writeFileSync(
    path.join(dir, "substack-story-template.md"),
    `# Substack Story Template

> Every county visit generates a **community story** — not a campaign press release.

## The People We Met

Highlight local residents · names with permission · photos where appropriate

## The Places We Visited

Restaurants · coffee shops · libraries · county fairs · churches · businesses

## What We Learned

Local concerns · local successes · local hopes

## How To Get Involved

Mobilize link · volunteer opportunity · upcoming event

---

Log published stories: [\`substack-stories.json\`](../../../data/campaign-brain/substack-stories.json)
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "substack-dashboard.md"),
    `# Substack Storytelling Engine

| Metric | Count |
| ------ | ----: |
| County stories published | **${sub?.storiesPublished ?? stories?.stories?.length ?? 0}** |
| Shares | ${sub?.shares ?? 0} |
| Local engagement | ${sub?.localEngagement ?? 0} |
| Media pickup | ${sub?.mediaPickup ?? 0} |

Template: [substack-story-template.md](./substack-story-template.md)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Substack Storytelling Engine\n\n- [Dashboard](./substack-dashboard.md)\n- [Template](./substack-story-template.md)\n`, "utf8");
}

function writeLocalBusiness() {
  const dir = path.join(PP, "local-business");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{ rollup: Record<string, number> }>(path.join(BRAIN_DATA, "local-business-people-power.json"))!;
  const r = data.rollup;

  writeFileSync(
    path.join(dir, "local-business-program.md"),
    `# Local Business Relationship Program

> Every dollar spent becomes a relationship.

| Activity | Count |
| -------- | ----: |
| Airbnb stays | ${r.airbnbStays ?? 0} |
| Restaurants visited | ${r.restaurantsVisited ?? 0} |
| Businesses highlighted | ${r.businessesHighlighted ?? 0} |
| Vendors partnered | ${r.vendorsPartnered ?? 0} |
| Local shirt printers | ${r.shirtPrinters ?? 0} |
| Community sponsors | ${r.communitySponsors ?? 0} |

Data: [\`local-business-people-power.json\`](../../../data/campaign-brain/local-business-people-power.json)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Local Business Program\n\n- [Dashboard](./local-business-program.md)\n`, "utf8");
}

function writeLocalShirts() {
  const dir = path.join(PP, "local-shirts");
  mkdirSync(dir, { recursive: true });
  const shirts = readJson<{ editions: Array<Record<string, unknown>> }>(path.join(BRAIN_DATA, "local-shirts-field.json"));

  writeFileSync(
    path.join(dir, "local-shirt-program.md"),
    `# Local Shirt Program — People Power

**Model:** Front = community pride · Back = Kelly Grappe for Secretary of State

| Edition | County | Vendor | Qty | Distributed | Goal |
| ------- | ------ | ------ | --- | ----------- | ---- |
${(shirts?.editions ?? [])
  .map((e) => `| ${e.edition} | ${e.county} | ${e.vendor || "—"} | ${e.quantity} | ${e.distributed} | ${e.goal} |`)
  .join("\n")}

Field OS: [local-shirts](../field-operating-system/local-shirts/local-shirt-program.md)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Local Shirts\n\n- [Program](./local-shirt-program.md)\n`, "utf8");
}

function writePostcards() {
  const dir = path.join(PP, "postcards");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{ programs: Record<string, Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "postcards-field.json"),
  )!;

  writeFileSync(
    path.join(dir, "postcard-activation-engine.md"),
    `# Postcard Activation Engine

Connect each program → Mobilize event · county team · Postcard Captain

| Program | Written | Mailed | County coverage |
| ------- | -------: | -----: | --------------- |
${Object.values(data.programs)
  .map((p) => `| ${p.label} | ${p.written} | ${p.mailed} | Assign captain |`)
  .join("\n")}

Data: [\`postcards-field.json\`](../../../data/campaign-brain/postcards-field.json)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Postcard Activation\n\n- [Engine](./postcard-activation-engine.md)\n`, "utf8");
}

function writePhoneBanks() {
  const dir = path.join(PP, "phone-banks");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{ programs: Record<string, Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "phone-banks-field.json"),
  )!;

  const programs = [
    { key: "relationshipCalls", label: "Missing Democrats / Relationship Calls" },
    { key: "visitInvitations", label: "Visit Invitations" },
    { key: "volunteerRecruitment", label: "Volunteer Recruitment" },
    { key: "gotv", label: "GOTV" },
    { key: "followUp", label: "Follow-Up" },
  ];

  writeFileSync(
    path.join(dir, "phone-bank-activation-engine.md"),
    `# Phone Bank Activation Engine

Connect: county lists · county captains · Mobilize events · volunteer assignments

| Program | Completed | Contacts | Volunteers | Registrations |
| ------- | --------: | -------: | ---------: | ------------: |
${programs
  .map((p) => {
    const row = data.programs[p.key] ?? data.programs.relationshipCalls;
    return `| ${p.label} | ${row?.completed ?? 0} | ${row?.contactsMade ?? 0} | ${row?.volunteersRecruited ?? 0} | ${row?.registrationsGenerated ?? 0} |`;
  })
  .join("\n")}

**House Party Recruitment:** use Volunteer Recruitment program + Mobilize house party template.

Data: [\`phone-banks-field.json\`](../../../data/campaign-brain/phone-banks-field.json)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Phone Bank Activation\n\n- [Engine](./phone-bank-activation-engine.md)\n`, "utf8");
}

function aggregateCri() {
  const cri = readJson<{ metrics: Record<string, number>; goals: Record<string, number> }>(
    path.join(BRAIN_DATA, "community-relationship-index.json"),
  );
  const assets = readJson<Record<string, unknown>>(path.join(BRAIN_DATA, "relationship-assets.json"));
  const po5 = readJson<{ statewide: Record<string, number> }>(path.join(BRAIN_DATA, "power-of-5.json"));
  const faith = readJson<{ statewide: Record<string, number> }>(path.join(BRAIN_DATA, "faith-outreach-network.json"));
  const sub = readJson<{ substack: Record<string, number>; volunteerLeadership: Record<string, number> }>(
    path.join(BRAIN_DATA, "people-power-network.json"),
  );
  const stories = readJson<{ stories: unknown[] }>(path.join(BRAIN_DATA, "substack-stories.json"));
  const house = readJson<{ events: unknown[] }>(path.join(BRAIN_DATA, "house-parties.json"));

  const sw = (assets?.statewide ?? {}) as Record<string, { deployed?: number }>;
  const rc = (assets?.relationshipCapital ?? {}) as Record<string, number>;

  const metrics = {
    signs: sw.signs?.deployed ?? cri?.metrics.signs ?? 0,
    shirts: sw.shirts?.deployed ?? cri?.metrics.shirts ?? 0,
    buttons: sw.buttons?.deployed ?? cri?.metrics.buttons ?? 0,
    flags: sw.flags?.deployed ?? cri?.metrics.flags ?? 0,
    houseParties: house?.events?.length ?? cri?.metrics.houseParties ?? 0,
    storiesPublished: sub?.substack?.storiesPublished ?? stories?.stories?.length ?? cri?.metrics.storiesPublished ?? 0,
    businessesHighlighted: rc.localBusinessesHighlighted ?? cri?.metrics.businessesHighlighted ?? 0,
    churchesVisited: faith?.statewide?.churchesVisited ?? rc.churchesVisited ?? cri?.metrics.churchesVisited ?? 0,
    librariesVisited: cri?.metrics.librariesVisited ?? 0,
    countyClerksVisited: cri?.metrics.countyClerksVisited ?? 0,
    extensionHomemakers: cri?.metrics.extensionHomemakers ?? 0,
    sportsEvents: cri?.metrics.sportsEvents ?? 0,
    volunteerGrowth: sub?.volunteerLeadership?.foundingTeamCurrent ?? cri?.metrics.volunteerGrowth ?? 0,
    powerOf5Growth: po5?.statewide?.powerOf5Commitments ?? cri?.metrics.powerOf5Growth ?? 0,
  };

  return { metrics, goals: cri?.goals ?? {} };
}

function writeCommunityRelationshipIndex(agg: ReturnType<typeof aggregateCri>) {
  const { metrics, goals } = agg;

  writeFileSync(
    path.join(PP, "community-relationship-index.md"),
    `# Community Relationship Index

> **Relationship Capital + Community Presence**

Updated: ${new Date().toISOString().slice(0, 10)}

| Metric | Current | Goal |
| ------ | ------: | ---: |
${Object.entries(metrics)
  .map(([k, v]) => {
    const label = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
    const goal = (goals as Record<string, number>)[k];
    return `| ${label} | **${v.toLocaleString()}** | ${goal ? goal.toLocaleString() : "—"} |`;
  })
  .join("\n")}

Data: [\`community-relationship-index.json\`](../../data/campaign-brain/community-relationship-index.json)
`,
    "utf8",
  );
}

function writeStoryWorkflow() {
  writeFileSync(
    path.join(PP, "story-first-event-workflow.md"),
    `# Story-First Event Workflow

\`\`\`txt
Campaign Brain (verified event)
    ↓
Mobilize Event (RSVP + volunteer shifts)
    ↓
Volunteer Recruitment (strike team + Power of 5)
    ↓
Event Execution
    ↓
Substack Story (community story — not press release)
    ↓
Email → Social → Local Sharing
    ↓
Relationship Growth logged (CRI + Relationship Capital)
\`\`\`

## Purpose

- Every event becomes **content**
- Every piece of content becomes **recruitment**
- Every recruitment becomes **relationship capital**

Template: [Substack story template](./substack/substack-story-template.md)

Mobilize: [Event framework](./mobilize/mobilize-event-framework.md)
`,
    "utf8",
  );
}

function writeFestivalQueue() {
  const mobilize = readJson<{ events: unknown[] }>(path.join(BRAIN_DATA, "mobilize-events.json"));
  writeFileSync(
    path.join(PP, "mobilize", "festival-activation-queue.md"),
    `# Festival Activation Queue

> June–October festival calendar · connect Brain events → Mobilize → volunteers → stories

Mobilize events linked: **${mobilize?.events?.length ?? 0}**

Priority: verify date in Calendar Truth → create Mobilize event → assign county strike team → publish Substack story after.

See Campaign Brain calendar intelligence and Phase 10 field activation for county captains.

Full festival index: [\`docs/strategic-plan/plurality-victory-plan/event-intelligence/\`](../../strategic-plan/plurality-victory-plan/event-intelligence/)
`,
    "utf8",
  );
}

function writePhase11Readme(agg: ReturnType<typeof aggregateCri>) {
  const pp = readJson<{ volunteerLeadership: Record<string, unknown>; mobilize: Record<string, number> }>(
    path.join(BRAIN_DATA, "people-power-network.json"),
  );
  const vl = pp?.volunteerLeadership ?? {};

  writeFileSync(
    path.join(PP, "PHASE-11-PEOPLE-POWER-OPERATING-SYSTEM.md"),
    `# Phase 11 — People Power Operating System

> Brain knows **where** opportunity exists · People Power teaches **how to activate humans**

\`\`\`txt
PLAN → BRAIN → OPTIMIZER → FIELD EXECUTION → PEOPLE POWER
\`\`\`

## Objectives

| # | System | Link |
| - | ------ | ---- |
| 1 | Mobilize Integration | [mobilize/](./mobilize/README.md) |
| 2 | Volunteer Leadership | [volunteer-network/](./volunteer-network/README.md) |
| 3 | Substack Storytelling | [substack/](./substack/README.md) |
| 4 | Local Business | [local-business/](./local-business/README.md) |
| 5 | Local Shirts | [local-shirts/](./local-shirts/README.md) |
| 6 | Postcard Activation | [postcards/](./postcards/README.md) |
| 7 | Phone Bank Activation | [phone-banks/](./phone-banks/README.md) |
| 8 | Community Relationship Index | [CRI](./community-relationship-index.md) |
| 9 | Story-First Workflow | [workflow](./story-first-event-workflow.md) |
| 10 | Election Plan tab | \`/election-plan\` → People Power Network |

## Volunteer leadership

| | |
| --- | --- |
| Founding leaders | **${vl.foundingTeamCurrent ?? 0} / ${vl.foundingTeamGoal ?? 20}** |
| Launch | June 28 · 6 PM Zoom |
| Retreat | Forevermost Farms (July) |
| Monthly calls | Last Sunday · 6 PM |

## Mobilize

Events linked: ${pp?.mobilize?.eventsLinked ?? 0} · RSVPs: ${pp?.mobilize?.rsvpTotal ?? 0}

\`\`\`bash
npm run campaign-brain:people-power:build
npm run campaign-brain:build
npm run election-plan:build
\`\`\`

## Success questions

- How do people join?
- How do events become stories?
- How do stories become local sharing?
- How do county teams activate voters?
- How do volunteers scale beyond Kelly?
`,
    "utf8",
  );
}

function main() {
  mkdirSync(PP, { recursive: true });

  const agg = aggregateCri();

  writeMobilizeLayer();
  writeVolunteerNetwork();
  writeSubstack();
  writeLocalBusiness();
  writeLocalShirts();
  writePostcards();
  writePhoneBanks();
  writeCommunityRelationshipIndex(agg);
  writeStoryWorkflow();
  writeFestivalQueue();
  writePhase11Readme(agg);

  // eslint-disable-next-line no-console
  console.log(`Phase 11 People Power: CRI ${Object.values(agg.metrics).reduce((a, b) => a + b, 0)} units · docs ready · wire /election-plan tab via election-plan:build`);
}

main();
