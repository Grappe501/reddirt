/**
 * PHASE 10 — Arkansas Field Operating System
 *
 * Execution deployment only. No vote models. No scenario engines.
 *
 * Usage: npm run campaign-brain:field-os:build
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTY_REGISTRY, BRAIN_DATA, BRAIN_ROOT, readJson, shortCountyName } from "./lib/inputs";

const FOS = path.join(BRAIN_ROOT, "field-operating-system");

type RoleStatus = "assigned" | "vacant" | "recruiting";

type StrikeRole = { name: string; email: string; phone: string; status: RoleStatus };

type StrikeCounty = {
  county: string;
  slug: string;
  roles: Record<string, StrikeRole>;
};

const STRIKE_ROLE_KEYS = [
  "countyCaptain",
  "volunteerCaptain",
  "faithCaptain",
  "postcardCaptain",
  "phoneBankCaptain",
  "canvassCaptain",
  "eventsCaptain",
  "mediaCaptain",
  "candidateLiaison",
] as const;

const STRIKE_ROLE_LABELS: Record<string, string> = {
  countyCaptain: "County Captain",
  volunteerCaptain: "Volunteer Captain",
  faithCaptain: "Faith Captain",
  postcardCaptain: "Postcard Captain",
  phoneBankCaptain: "Phone Bank Captain",
  canvassCaptain: "Canvass Captain",
  eventsCaptain: "Events Captain",
  mediaCaptain: "Media Captain",
  candidateLiaison: "Candidate Liaison",
};

function countySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function vacantRole(): StrikeRole {
  return { name: "", email: "", phone: "", status: "vacant" };
}

function ensureStrikeTeams(): StrikeCounty[] {
  const p = path.join(BRAIN_DATA, "county-strike-teams.json");
  const existing = readJson<{ counties?: StrikeCounty[]; roleLabels?: Record<string, string> }>(p);

  const counties: StrikeCounty[] = [];
  for (const reg of ARKANSAS_COUNTY_REGISTRY) {
    const county = shortCountyName(reg.displayName);
    const slug = countySlug(county);
    const prev = existing?.counties?.find((c) => c.county === county);
    const roles: Record<string, StrikeRole> = {};
    for (const key of STRIKE_ROLE_KEYS) {
      roles[key] = prev?.roles?.[key] ?? vacantRole();
    }
    counties.push({ county, slug, roles });
  }

  writeFileSync(
    p,
    JSON.stringify(
      {
        version: 1,
        note: "County Strike Teams — assign captains per county. status: assigned | vacant | recruiting. Re-run campaign-brain:build after edits.",
        roleLabels: STRIKE_ROLE_LABELS,
        counties,
      },
      null,
      2,
    ),
    "utf8",
  );
  return counties;
}

function strikeCoverage(counties: StrikeCounty[]) {
  const totalSlots = counties.length * STRIKE_ROLE_KEYS.length;
  let filled = 0;
  let recruiting = 0;
  for (const c of counties) {
    for (const key of STRIKE_ROLE_KEYS) {
      const r = c.roles[key];
      if (r.status === "assigned" && r.name.trim()) filled++;
      if (r.status === "recruiting") recruiting++;
    }
  }
  return {
    totalSlots,
    filled,
    open: totalSlots - filled - recruiting,
    recruiting,
    coveragePct: totalSlots > 0 ? Math.round((filled / totalSlots) * 1000) / 10 : 0,
  };
}

function writeStrikeTeamCountyFiles(counties: StrikeCounty[]) {
  const dir = path.join(FOS, "county-strike-teams");
  mkdirSync(dir, { recursive: true });

  for (const c of counties) {
    const rows = STRIKE_ROLE_KEYS.map((key) => {
      const r = c.roles[key];
      return `| ${STRIKE_ROLE_LABELS[key]} | ${r.status} | ${r.name || "—"} | ${r.email || "—"} | ${r.phone || "—"} |`;
    }).join("\n");

    writeFileSync(
      path.join(dir, `${c.slug}.md`),
      `# ${c.county} County Strike Team

> Phase 10 · Field Operating System

| Role | Status | Name | Email | Phone |
| ---- | ------ | ---- | ----- | ----- |
${rows}

Edit: [\`county-strike-teams.json\`](../../../data/campaign-brain/county-strike-teams.json)
`,
      "utf8",
    );
  }

  const cov = strikeCoverage(counties);
  writeFileSync(
    path.join(FOS, "county-strike-team-dashboard.md"),
    `# County Strike Team Dashboard

> Phase 10 — who is responsible in every county?

Updated: ${new Date().toISOString().slice(0, 10)}

| Metric | Value |
| ------ | ----: |
| Filled positions | **${cov.filled}** |
| Recruiting | ${cov.recruiting} |
| Open (vacant) | ${cov.open} |
| Total slots (75 × 9) | ${cov.totalSlots} |
| Coverage | **${cov.coveragePct}%** |

---

## Counties missing County Captain

${counties
  .filter((c) => c.roles.countyCaptain.status !== "assigned" || !c.roles.countyCaptain.name.trim())
  .map((c) => `- **${c.county}** (${c.roles.countyCaptain.status})`)
  .join("\n")}

---

## Per-county files

${counties.map((c) => `- [${c.county}](./county-strike-teams/${c.slug}.md)`).join("\n")}

Data: [\`county-strike-teams.json\`](../../data/campaign-brain/county-strike-teams.json)
`,
    "utf8",
  );
}

function writePowerOf5() {
  const dir = path.join(FOS, "power-of-5");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{
    assumption: string;
    statewide: Record<string, number>;
    commitments: unknown[];
  }>(path.join(BRAIN_DATA, "power-of-5.json"))!;

  const s = data.statewide;
  writeFileSync(
    path.join(dir, "power-of-5-dashboard.md"),
    `# Power of 5 Dashboard

> ${data.assumption}

Updated: ${new Date().toISOString().slice(0, 10)}

| Metric | Count |
| ------ | ----: |
| Supporters | **${s.supporters ?? 0}** |
| Power-of-5 commitments | ${s.powerOf5Commitments ?? 0} |
| Conversations | ${s.conversations ?? 0} |
| Volunteer recruits | ${s.volunteerRecruits ?? 0} |
| Event recruits | ${s.eventRecruits ?? 0} |
| Registration recruits | ${s.registrationRecruits ?? 0} |
| GOTV recruits | ${s.gotvRecruits ?? 0} |

Active commitments logged: **${data.commitments?.length ?? 0}**

Data: [\`power-of-5.json\`](../../../data/campaign-brain/power-of-5.json)
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "README.md"),
    `# Power of 5 Engine

Trusted supporters each commit to five conversations that recruit volunteers, registrants, or GOTV contacts.

- [Dashboard](./power-of-5-dashboard.md)
- Data: [\`power-of-5.json\`](../../../data/campaign-brain/power-of-5.json)
`,
    "utf8",
  );
}

function writeHouseParties() {
  const dir = path.join(FOS, "house-parties");
  mkdirSync(dir, { recursive: true });

  const templates = [
    { size: 10, desc: "Living room · neighbor circle · 90 minutes" },
    { size: 25, desc: "Backyard · civic intro · 2 hours" },
    { size: 50, desc: "Community room · registration table · 2.5 hours" },
    { size: 100, desc: "Event hall · Kelly or surrogate · full program" },
  ];

  for (const t of templates) {
    writeFileSync(
      path.join(dir, `template-${t.size}-person.md`),
      `# ${t.size}-Person House Party Template

> ${t.desc}

## Host checklist

| Step | Done |
| ---- | ---- |
| Confirm date, address, capacity (${t.size}) | |
| Invite list from Power of 5 network | |
| Registration table + forms | |
| Volunteer sign-up sheet | |
| Follow-up assigned within 48 hours | |

## Log after event

Update [\`house-parties.json\`](../../../data/campaign-brain/house-parties.json):

| Field | Value |
| ----- | ----- |
| Host | |
| County | |
| Date | |
| Template size | ${t.size} |
| Attendees | |
| New volunteers | |
| Registrations | |
| Follow-up status | pending / complete |
`,
      "utf8",
    );
  }

  const events = readJson<{ events: Array<Record<string, unknown>> }>(path.join(BRAIN_DATA, "house-parties.json"))
    ?.events ?? [];

  writeFileSync(
    path.join(dir, "house-party-log.md"),
    `# House Party Log

| Host | County | Date | Size | Attendees | Volunteers | Registrations | Follow-up |
| ---- | ------ | ---- | ---- | --------- | ---------- | ------------- | --------- |
${events.length ? events.map((e) => `| ${e.host} | ${e.county} | ${e.date} | ${e.templateSize} | ${e.attendees} | ${e.newVolunteers} | ${e.registrations} | ${e.followUpStatus} |`).join("\n") : "| _No events logged yet_ | | | | | | | |"}

Templates: [10](./template-10-person.md) · [25](./template-25-person.md) · [50](./template-50-person.md) · [100](./template-100-person.md)
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "README.md"),
    `# House Party Program

- [10-person template](./template-10-person.md)
- [25-person template](./template-25-person.md)
- [50-person template](./template-50-person.md)
- [100-person template](./template-100-person.md)
- [Event log](./house-party-log.md)
`,
    "utf8",
  );
}

function writeLocalShirts() {
  const dir = path.join(FOS, "local-shirts");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{ editions: Array<Record<string, unknown>> }>(path.join(BRAIN_DATA, "local-shirts-field.json"))!;

  writeFileSync(
    path.join(dir, "local-shirt-program.md"),
    `# Local Shirt Program

| Edition | County | Vendor | Qty | Distributed | Remaining | Goal |
| ------- | ------ | ------ | --- | ----------- | --------- | ---- |
${data.editions
  .map(
    (e) =>
      `| ${e.edition} | ${e.county} | ${e.vendor || "—"} | ${e.quantity} | ${e.distributed} | ${e.remaining} | ${e.goal} |`,
  )
  .join("\n")}

Data: [\`local-shirts-field.json\`](../../../data/campaign-brain/local-shirts-field.json)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Local Shirt Program\n\n- [Program dashboard](./local-shirt-program.md)\n`, "utf8");
}

function writePostcards() {
  const dir = path.join(FOS, "postcards");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{ programs: Record<string, Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "postcards-field.json"),
  )!;

  writeFileSync(
    path.join(dir, "postcard-program-dashboard.md"),
    `# Postcard Program Dashboard

| Program | Printed | Written | Mailed | Response % | Goal |
| ------- | -------: | -------: | -----: | ---------: | ---: |
${Object.values(data.programs)
  .map(
    (p) =>
      `| ${p.label} | ${p.printed} | ${p.written} | ${p.mailed} | ${p.responseRate}% | ${p.goal} |`,
  )
  .join("\n")}

Data: [\`postcards-field.json\`](../../../data/campaign-brain/postcards-field.json)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Postcard Writing System\n\n- [Dashboard](./postcard-program-dashboard.md)\n`, "utf8");
}

function writePhoneBanks() {
  const dir = path.join(FOS, "phone-banks");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{ programs: Record<string, Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "phone-banks-field.json"),
  )!;

  writeFileSync(
    path.join(dir, "phone-bank-dashboard.md"),
    `# Phone Bank Dashboard

| Program | Attempted | Completed | Contacts | Volunteers | Registrations | Goal |
| ------- | --------: | --------: | -------: | ---------: | ------------: | ---: |
${Object.values(data.programs)
  .map(
    (p) =>
      `| ${p.label} | ${p.attempted} | ${p.completed} | ${p.contactsMade} | ${p.volunteersRecruited} | ${p.registrationsGenerated} | ${p.goal} |`,
  )
  .join("\n")}

Data: [\`phone-banks-field.json\`](../../../data/campaign-brain/phone-banks-field.json)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Phone Bank System\n\n- [Dashboard](./phone-bank-dashboard.md)\n`, "utf8");
}

function writeCandidatePartnerships() {
  const dir = path.join(FOS, "candidate-partnerships");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{ partners: unknown[]; byCategory: Record<string, unknown[]> }>(
    path.join(BRAIN_DATA, "candidate-partnerships.json"),
  )!;

  const cats = ["congressional", "stateSenate", "stateHouse", "mayors", "schoolBoard", "countyOfficials"];
  const catLabels: Record<string, string> = {
    congressional: "Congressional",
    stateSenate: "State Senate",
    stateHouse: "State House",
    mayors: "Mayors",
    schoolBoard: "School Board",
    countyOfficials: "County Officials",
  };

  writeFileSync(
    path.join(dir, "candidate-partnership-dashboard.md"),
    `# Candidate Partnership Dashboard

Total partners logged: **${data.partners?.length ?? 0}**

${cats
  .map(
    (c) =>
      `### ${catLabels[c]}\n\n${(data.byCategory[c]?.length ?? 0) ? (data.byCategory[c] as Array<{ name: string }>).map((p) => `- ${p.name}`).join("\n") : "- None logged"}`,
  )
  .join("\n\n")}

## Shared execution (rollup)

Track per partner in [\`candidate-partnerships.json\`](../../../data/campaign-brain/candidate-partnerships.json):

- Shared events
- Shared canvasses
- Shared phone banks
- Shared volunteer pools
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "README.md"),
    `# Candidate Partnership Layer\n\n- [Dashboard](./candidate-partnership-dashboard.md)\n`,
    "utf8",
  );
}

function writeFaithOutreach() {
  const dir = path.join(FOS, "faith-outreach");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{ statewide: Record<string, number>; churches: unknown[]; events: unknown[] }>(
    path.join(BRAIN_DATA, "faith-outreach-network.json"),
  )!;
  const s = data.statewide;

  writeFileSync(
    path.join(dir, "faith-outreach-dashboard.md"),
    `# Faith Outreach Network

> Expand existing faith engagement layer with field deployment tracking.

| Metric | Count |
| ------ | ----: |
| Churches visited | **${s.churchesVisited ?? 0}** |
| Pastors engaged | ${s.pastorsEngaged ?? 0} |
| Faith events attended | ${s.faithEventsAttended ?? 0} |
| Muslim outreach contacts | ${s.muslimOutreachContacts ?? 0} |
| Jewish outreach contacts | ${s.jewishOutreachContacts ?? 0} |
| Community faith events | ${s.communityFaithEvents ?? 0} |
| Volunteer recruits | ${s.volunteerRecruits ?? 0} |

Churches logged: ${data.churches?.length ?? 0} · Events logged: ${data.events?.length ?? 0}

Doctrine: [Big Table Democrat Doctrine](../relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md)

Data: [\`faith-outreach-network.json\`](../../../data/campaign-brain/faith-outreach-network.json)
`,
    "utf8",
  );

  writeFileSync(
    path.join(dir, "README.md"),
    `# Faith Outreach Network\n\n- [Dashboard](./faith-outreach-dashboard.md)\n`,
    "utf8",
  );
}

function writeLocalMedia() {
  const dir = path.join(FOS, "local-media");
  mkdirSync(dir, { recursive: true });
  const data = readJson<{
    outlets: unknown[];
    highlights: Record<string, number>;
    byType: Record<string, unknown[]>;
  }>(path.join(BRAIN_DATA, "local-media-relationships.json"))!;
  const h = data.highlights;

  writeFileSync(
    path.join(dir, "local-media-dashboard.md"),
    `# Local Media Relationship System

Outlets tracked: **${data.outlets?.length ?? 0}**

## Highlights

| Type | Count |
| ---- | ----: |
| Local businesses | ${h.localBusinesses ?? 0} |
| Restaurants | ${h.restaurants ?? 0} |
| Airbnb hosts | ${h.airbnbHosts ?? 0} |
| Letters to editor | ${h.lettersToEditor ?? 0} |
| Guest columns | ${h.guestColumns ?? 0} |
| Substack features | ${h.substackFeatures ?? 0} |

## By outlet type

| Type | Logged |
| ---- | -----: |
| Newspapers | ${data.byType.newspapers?.length ?? 0} |
| Radio | ${data.byType.radio?.length ?? 0} |
| Podcasts | ${data.byType.podcasts?.length ?? 0} |
| Newsletters | ${data.byType.newsletters?.length ?? 0} |
| Substack | ${data.byType.substack?.length ?? 0} |

Data: [\`local-media-relationships.json\`](../../../data/campaign-brain/local-media-relationships.json)
`,
    "utf8",
  );

  writeFileSync(path.join(dir, "README.md"), `# Local Media System\n\n- [Dashboard](./local-media-dashboard.md)\n`, "utf8");
}

function writeCommandCenter(strikeCov: ReturnType<typeof strikeCoverage>) {
  const assets = readJson<Record<string, unknown>>(path.join(BRAIN_DATA, "relationship-assets.json"));
  const po5 = readJson<{ statewide: Record<string, number> }>(path.join(BRAIN_DATA, "power-of-5.json"));
  const faith = readJson<{ statewide: Record<string, number> }>(path.join(BRAIN_DATA, "faith-outreach-network.json"));
  const postcards = readJson<{ programs: Record<string, { mailed: number }> }>(
    path.join(BRAIN_DATA, "postcards-field.json"),
  );
  const phones = readJson<{ programs: Record<string, { completed: number }> }>(
    path.join(BRAIN_DATA, "phone-banks-field.json"),
  );
  const media = readJson<{ highlights: Record<string, number> }>(path.join(BRAIN_DATA, "local-media-relationships.json"));
  const house = readJson<{ events: unknown[] }>(path.join(BRAIN_DATA, "house-parties.json"));

  const statewide = (assets?.statewide ?? {}) as Record<string, { deployed?: number }>;
  const rc = (assets?.relationshipCapital ?? {}) as Record<string, number>;
  const postcardMailed = Object.values(postcards?.programs ?? {}).reduce((s, p) => s + (p.mailed ?? 0), 0);
  const phoneCompleted = Object.values(phones?.programs ?? {}).reduce((s, p) => s + (p.completed ?? 0), 0);

  const trustMetrics = [
    { label: "Yard signs deployed", value: statewide.signs?.deployed ?? 0 },
    { label: "Shirts distributed", value: statewide.shirts?.deployed ?? 0 },
    { label: "Buttons distributed", value: statewide.buttons?.deployed ?? 0 },
    { label: "Flags distributed", value: statewide.flags?.deployed ?? 0 },
    { label: "House parties logged", value: house?.events?.length ?? 0 },
    { label: "Postcards mailed", value: postcardMailed },
    { label: "Phone calls completed", value: phoneCompleted },
    { label: "Faith visits (churches)", value: faith?.statewide?.churchesVisited ?? rc.churchesVisited ?? 0 },
    { label: "Business highlights", value: rc.localBusinessesHighlighted ?? 0 },
    { label: "Media mentions (Substack etc.)", value: media?.highlights?.substackFeatures ?? 0 },
    { label: "Canvass doors", value: rc.canvassDoorsKnocked ?? 0 },
    { label: "Power of 5 commitments", value: po5?.statewide?.powerOf5Commitments ?? 0 },
    { label: "Strike team slots filled", value: strikeCov.filled },
    { label: "Volunteer recruits (Po5)", value: po5?.statewide?.volunteerRecruits ?? 0 },
  ];

  const totalTrust = trustMetrics.reduce((s, m) => s + m.value, 0);

  writeFileSync(
    path.join(FOS, "relationship-capital-command-center.md"),
    `# Relationship Capital Command Center

> **Trust Built This Week** — aggregate field execution (not a score; a rollup)

Updated: ${new Date().toISOString().slice(0, 10)}

## Trust Built This Week

| Activity | Count |
| -------- | ----: |
${trustMetrics.map((m) => `| ${m.label} | **${m.value.toLocaleString()}** |`).join("\n")}

**Field activity rollup:** ${totalTrust.toLocaleString()} units logged across programs

---

## Deployment readiness

| System | Status |
| ------ | ------ |
| County strike teams | ${strikeCov.coveragePct}% filled (${strikeCov.filled}/${strikeCov.totalSlots}) |
| Power of 5 | ${po5?.statewide?.powerOf5Commitments ?? 0} commitments |
| House parties | ${house?.events?.length ?? 0} events logged |
| Postcards | ${postcardMailed.toLocaleString()} mailed |
| Phone banks | ${phoneCompleted.toLocaleString()} completed |
| Faith network | ${faith?.statewide?.churchesVisited ?? 0} churches visited |

---

## The chain

\`\`\`txt
Strategy → Opportunity → Deployment → Relationship Building → Turnout
\`\`\`

Doctrine: *Relationships create trust. Trust creates turnout. Turnout creates victory.*

Hub: [PHASE-10-FIELD-OPERATING-SYSTEM.md](./PHASE-10-FIELD-OPERATING-SYSTEM.md)
`,
    "utf8",
  );
}

function writePhase10Readme(strikeCov: ReturnType<typeof strikeCoverage>) {
  writeFileSync(
    path.join(FOS, "PHASE-10-FIELD-OPERATING-SYSTEM.md"),
    `# Phase 10 — Arkansas Field Operating System

> PLAN → BRAIN → OPTIMIZER → **FIELD EXECUTION**

The strategic architecture is complete. This phase deploys people.

## Objectives

| # | System | Dashboard |
| - | ------ | --------- |
| 1 | County Strike Teams | [Dashboard](./county-strike-team-dashboard.md) |
| 2 | Power of 5 | [Dashboard](./power-of-5/power-of-5-dashboard.md) |
| 3 | House Parties | [Program](./house-parties/README.md) |
| 4 | Local Shirts | [Program](./local-shirts/local-shirt-program.md) |
| 5 | Postcards | [Dashboard](./postcards/postcard-program-dashboard.md) |
| 6 | Phone Banks | [Dashboard](./phone-banks/phone-bank-dashboard.md) |
| 7 | Candidate Partnerships | [Dashboard](./candidate-partnerships/candidate-partnership-dashboard.md) |
| 8 | Faith Outreach | [Dashboard](./faith-outreach/faith-outreach-dashboard.md) |
| 9 | Local Media | [Dashboard](./local-media/local-media-dashboard.md) |
| 10 | Command Center | [Trust Built This Week](./relationship-capital-command-center.md) |

## Current deployment

- Strike team coverage: **${strikeCov.coveragePct}%** (${strikeCov.filled} filled · ${strikeCov.recruiting} recruiting · ${strikeCov.open} vacant)

## Field data files

All under [\`data/campaign-brain/\`](../../data/campaign-brain/):

- \`county-strike-teams.json\`
- \`power-of-5.json\`
- \`house-parties.json\`
- \`local-shirts-field.json\`
- \`postcards-field.json\`
- \`phone-banks-field.json\`
- \`candidate-partnerships.json\`
- \`faith-outreach-network.json\`
- \`local-media-relationships.json\`

\`\`\`bash
npm run campaign-brain:field-os:build   # regenerate dashboards
npm run campaign-brain:build            # full Brain + Field OS
\`\`\`

## What Phase 10 does NOT do

- No new vote models
- No new scenario engines
- No new prediction systems
- No additional strategic architecture

## Success question

The Brain should answer: **Who is responsible? Who is missing? Who is recruiting? Who is executing in every county?**
`,
    "utf8",
  );
}

function main() {
  mkdirSync(FOS, { recursive: true });

  const counties = ensureStrikeTeams();
  const strikeCov = strikeCoverage(counties);

  writeStrikeTeamCountyFiles(counties);
  writePowerOf5();
  writeHouseParties();
  writeLocalShirts();
  writePostcards();
  writePhoneBanks();
  writeCandidatePartnerships();
  writeFaithOutreach();
  writeLocalMedia();
  writeCommandCenter(strikeCov);
  writePhase10Readme(strikeCov);

  // eslint-disable-next-line no-console
  console.log(
    `Phase 10 Field OS: ${counties.length} county strike teams · ${strikeCov.filled}/${strikeCov.totalSlots} slots filled (${strikeCov.coveragePct}%) · command center ready.`,
  );
}

main();
