/**
 * PHASE 16 — Voter Contact & GOTV Operating System
 *
 * Unifies postcards, phone banks, Power of 5, house parties, canvassing,
 * and event outcomes into one voter-contact engine with Human Contact Index (HCI).
 *
 * Usage: npm run campaign-brain:voter-contact:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";
import type {
  ChannelDashboard,
  HumanContactIndexComponents,
  VoterContactSummary,
} from "./lib/voter-contact-types";

const VC = path.join(BRAIN_ROOT, "voter-contact");

type PhonePrograms = Record<
  string,
  { label: string; attempted?: number; completed?: number; contactsMade?: number; registrationsGenerated?: number; goal?: number }
>;

type PostcardPrograms = Record<
  string,
  { label: string; printed?: number; written?: number; mailed?: number; goal?: number }
>;

type CanvassPrograms = Record<
  string,
  { label: string; doorsKnocked?: number; conversations?: number; commitments?: number; registrationsGenerated?: number; goal?: number }
>;

function pct(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.round((current / goal) * 1000) / 10;
}

function sumProgramField<T extends Record<string, unknown>>(
  programs: Record<string, T> | undefined,
  field: keyof T,
): number {
  let n = 0;
  for (const p of Object.values(programs ?? {})) {
    const v = p[field];
    if (typeof v === "number") n += v;
  }
  return n;
}

function loadPhoneContacts(): number {
  const pb = readJson<{ programs?: PhonePrograms }>(path.join(BRAIN_DATA, "phone-banks-field.json"));
  const fromPrograms = sumProgramField(pb?.programs, "contactsMade");
  const ra = readJson<{ relationshipCapital?: { phoneCallsCompleted?: number } }>(
    path.join(BRAIN_DATA, "relationship-assets.json"),
  );
  return Math.max(fromPrograms, ra?.relationshipCapital?.phoneCallsCompleted ?? 0);
}

function loadPostcardsMailed(): number {
  const pc = readJson<{ programs?: PostcardPrograms }>(path.join(BRAIN_DATA, "postcards-field.json"));
  const fromPrograms = sumProgramField(pc?.programs, "mailed");
  const ra = readJson<{ relationshipCapital?: { postcardsWritten?: number } }>(
    path.join(BRAIN_DATA, "relationship-assets.json"),
  );
  return Math.max(fromPrograms, ra?.relationshipCapital?.postcardsWritten ?? 0);
}

function loadDoorsKnocked(): number {
  const cv = readJson<{ programs?: CanvassPrograms }>(path.join(BRAIN_DATA, "canvass-field.json"));
  const fromCanvass = sumProgramField(cv?.programs, "doorsKnocked");
  const ra = readJson<{ relationshipCapital?: { canvassDoorsKnocked?: number } }>(
    path.join(BRAIN_DATA, "relationship-assets.json"),
  );
  return Math.max(fromCanvass, ra?.relationshipCapital?.canvassDoorsKnocked ?? 0);
}

function loadHousePartyAttendees(): number {
  const hp = readJson<{ events?: Array<{ attendees?: number }> }>(path.join(BRAIN_DATA, "house-parties.json"));
  return (hp?.events ?? []).reduce((s, e) => s + (e.attendees ?? 0), 0);
}

function loadPowerOf5Conversations(): number {
  const po5 = readJson<{ statewide?: { conversations?: number } }>(path.join(BRAIN_DATA, "power-of-5.json"));
  return po5?.statewide?.conversations ?? 0;
}

function loadVolunteerRecruits(): number {
  const po5 = readJson<{ statewide?: { volunteerRecruits?: number } }>(path.join(BRAIN_DATA, "power-of-5.json"));
  const pp = readJson<{ volunteerLeadership?: { foundingTeamCurrent?: number } }>(
    path.join(BRAIN_DATA, "people-power-network.json"),
  );
  const outcomes = readJson<{ outcomes?: Array<{ volunteerSignups?: number }> }>(
    path.join(BRAIN_DATA, "event-outcomes.json"),
  );
  const fromEvents = (outcomes?.outcomes ?? []).reduce((s, o) => s + (o.volunteerSignups ?? 0), 0);
  return (po5?.statewide?.volunteerRecruits ?? 0) + (pp?.volunteerLeadership?.foundingTeamCurrent ?? 0) + fromEvents;
}

function loadEventAttendees(): number {
  const outcomes = readJson<{ outcomes?: Array<{ attended?: boolean; estimatedAttendance?: number }> }>(
    path.join(BRAIN_DATA, "event-outcomes.json"),
  );
  return (outcomes?.outcomes ?? [])
    .filter((o) => o.attended)
    .reduce((s, o) => s + (o.estimatedAttendance ?? 0), 0);
}

function buildHciComponents(): HumanContactIndexComponents {
  return {
    phoneCalls: loadPhoneContacts(),
    postcards: loadPostcardsMailed(),
    doorsKnocked: loadDoorsKnocked(),
    housePartyAttendees: loadHousePartyAttendees(),
    powerOf5Conversations: loadPowerOf5Conversations(),
    volunteerRecruits: loadVolunteerRecruits(),
    eventAttendees: loadEventAttendees(),
  };
}

function buildSummary(): VoterContactSummary {
  const tracksFile = readJson<{
    humanContactIndexGoal?: number;
    lane2Reactivation?: { contacted: number; engaged: number; committed: number; turnoutTarget: number };
    lane3Registration?: {
      registrationsStarted: number;
      registrationsCompleted: number;
      registrationEvents: number;
      volunteerRegistrars: number;
      goal: number;
    };
    lane4Persuasion?: {
      conversations: number;
      followUps: number;
      eventAttendance: number;
      endorsementsGenerated: number;
    };
    funnel?: { volunteersActive: number; commitments: number; turnoutTargets: number };
  }>(path.join(BRAIN_DATA, "voter-contact-tracks.json"));

  const pb = readJson<{ programs?: PhonePrograms }>(path.join(BRAIN_DATA, "phone-banks-field.json"));
  const pc = readJson<{ programs?: PostcardPrograms }>(path.join(BRAIN_DATA, "postcards-field.json"));
  const cv = readJson<{ programs?: CanvassPrograms }>(path.join(BRAIN_DATA, "canvass-field.json"));
  const po5 = readJson<{ statewide?: { powerOf5Commitments?: number; conversations?: number } }>(
    path.join(BRAIN_DATA, "power-of-5.json"),
  );
  const hp = readJson<{ events?: unknown[] }>(path.join(BRAIN_DATA, "house-parties.json"));
  const sc = readJson<{ endorsed?: number }>(path.join(BRAIN_DATA, "endorsement-scorecard.json"));

  const components = buildHciComponents();
  const hciTotal = Object.values(components).reduce((a, b) => a + b, 0);
  const hciGoal = tracksFile?.humanContactIndexGoal ?? 250_000;

  const phoneGoal = sumProgramField(pb?.programs, "goal");
  const postcardGoal = sumProgramField(pc?.programs, "goal");
  const canvassGoal = sumProgramField(cv?.programs, "goal");

  const lane2 = tracksFile?.lane2Reactivation ?? {
    contacted: 0,
    engaged: 0,
    committed: 0,
    turnoutTarget: 51_051,
  };
  const lane3 = tracksFile?.lane3Registration ?? {
    registrationsStarted: 0,
    registrationsCompleted: 0,
    registrationEvents: 0,
    volunteerRegistrars: 0,
    goal: 50_000,
  };
  const lane4 = tracksFile?.lane4Persuasion ?? {
    conversations: 0,
    followUps: 0,
    eventAttendance: 0,
    endorsementsGenerated: sc?.endorsed ?? 0,
  };

  const phoneContacts = loadPhoneContacts();
  const postcardsMailed = loadPostcardsMailed();
  const doors = loadDoorsKnocked();
  const registrationsFromPhone = sumProgramField(pb?.programs, "registrationsGenerated");
  const registrationsFromEvents = readJson<{ outcomes?: Array<{ registrationFormsCompleted?: number }> }>(
    path.join(BRAIN_DATA, "event-outcomes.json"),
  );
  const regFromEvents = (registrationsFromEvents?.outcomes ?? []).reduce(
    (s, o) => s + (o.registrationFormsCompleted ?? 0),
    0,
  );

  const channels: ChannelDashboard[] = [
    {
      id: "phoneBank",
      label: "Phone Bank",
      primaryMetric: phoneContacts,
      goal: phoneGoal || 29_000,
      completionPct: pct(phoneContacts, phoneGoal || 29_000),
      detail: `${Object.keys(pb?.programs ?? {}).length} programs · relationship · visit invite · GOTV`,
    },
    {
      id: "postcard",
      label: "Postcards",
      primaryMetric: postcardsMailed,
      goal: postcardGoal || 48_000,
      completionPct: pct(postcardsMailed, postcardGoal || 48_000),
      detail: "Visit announcement · senior GOTV · youth · volunteer recruitment",
    },
    {
      id: "canvass",
      label: "Canvass",
      primaryMetric: doors,
      goal: canvassGoal || 60_000,
      completionPct: pct(doors, canvassGoal || 60_000),
      detail: "Lane 2 drop-off · Lane 4 persuasion · registration turf",
    },
    {
      id: "powerOf5",
      label: "Power of 5",
      primaryMetric: po5?.statewide?.conversations ?? 0,
      goal: 25_000,
      completionPct: pct(po5?.statewide?.conversations ?? 0, 25_000),
      detail: `${po5?.statewide?.powerOf5Commitments ?? 0} commitments · trusted-network conversations`,
    },
    {
      id: "houseParty",
      label: "House Parties",
      primaryMetric: loadHousePartyAttendees(),
      goal: 3_000,
      completionPct: pct(loadHousePartyAttendees(), 3_000),
      detail: `${hp?.events?.length ?? 0} events logged`,
    },
    {
      id: "gotv",
      label: "GOTV",
      primaryMetric: pb?.programs?.gotv?.contactsMade ?? 0,
      goal: pb?.programs?.gotv?.goal ?? 15_000,
      completionPct: pct(pb?.programs?.gotv?.contactsMade ?? 0, pb?.programs?.gotv?.goal ?? 15_000),
      detail: "Final-week turnout contacts — separate from relationship calls",
    },
  ];

  const voterContacts =
    phoneContacts + postcardsMailed + doors + (po5?.statewide?.conversations ?? 0) + loadHousePartyAttendees();

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    heroLine: "Human Contact Index — how many Arkansans have had a direct interaction with the campaign?",
    doctrine:
      "Volunteer → Voter Contact → Commitment → Turnout. Lanes 2, 3, and 4 are won through conversations — not dashboards.",
    humanContactIndex: {
      total: hciTotal,
      components,
      goal: hciGoal,
      completionPct: pct(hciTotal, hciGoal),
    },
    tracks: {
      lane2Reactivation: {
        ...lane2,
        contacted: Math.max(lane2.contacted, phoneContacts + doors),
        completionPct: pct(lane2.committed, lane2.turnoutTarget),
      },
      lane3Registration: {
        ...lane3,
        registrationsCompleted: Math.max(lane3.registrationsCompleted, registrationsFromPhone + regFromEvents),
        completionPct: pct(
          Math.max(lane3.registrationsCompleted, registrationsFromPhone + regFromEvents),
          lane3.goal,
        ),
      },
      lane4Persuasion: {
        ...lane4,
        endorsementsGenerated: Math.max(lane4.endorsementsGenerated, sc?.endorsed ?? 0),
      },
    },
    funnel: {
      volunteersActive: tracksFile?.funnel?.volunteersActive ?? loadVolunteerRecruits(),
      voterContacts,
      commitments: tracksFile?.funnel?.commitments ?? lane2.committed + (po5?.statewide?.powerOf5Commitments ?? 0),
      turnoutTargets: tracksFile?.funnel?.turnoutTargets ?? lane2.turnoutTarget,
    },
    channels,
  };
}

function writeDashboard(name: string, title: string, body: string) {
  writeFileSync(path.join(VC, `${name}.md`), `# ${title}\n\n${body}\n`, "utf8");
}

function writeHub(summary: VoterContactSummary) {
  const hci = summary.humanContactIndex;
  const c = hci.components;

  writeFileSync(
    path.join(VC, "PHASE-16-VOTER-CONTACT-GOTV-OPERATING-SYSTEM.md"),
    `# Phase 16 — Voter Contact & GOTV Operating System

Updated: ${summary.generatedAt.slice(0, 10)}

## Mission

Unify voter contact across Field OS channels into one command center. Measure **Human Contact Index (HCI)** — the heartbeat of the final 20 weeks.

> ${summary.doctrine}

## Human Contact Index

| Component | Count |
| --------- | ----: |
| Phone calls | ${c.phoneCalls.toLocaleString()} |
| Postcards | ${c.postcards.toLocaleString()} |
| Doors knocked | ${c.doorsKnocked.toLocaleString()} |
| House party attendees | ${c.housePartyAttendees.toLocaleString()} |
| Power of 5 conversations | ${c.powerOf5Conversations.toLocaleString()} |
| Volunteer recruits | ${c.volunteerRecruits.toLocaleString()} |
| Event attendees | ${c.eventAttendees.toLocaleString()} |
| **HCI total** | **${hci.total.toLocaleString()}** |
| Goal | ${hci.goal.toLocaleString()} |
| Completion | ${hci.completionPct}% |

## Three tracks

| Track | Primary measure | Progress |
| ----- | ---------------- | -------: |
| **A — Lane 2 Reactivation** | Committed / ${summary.tracks.lane2Reactivation.turnoutTarget.toLocaleString()} turnout target | ${summary.tracks.lane2Reactivation.completionPct}% |
| **B — Lane 3 Registration** | ${summary.tracks.lane3Registration.registrationsCompleted.toLocaleString()} / ${summary.tracks.lane3Registration.goal.toLocaleString()} | ${summary.tracks.lane3Registration.completionPct}% |
| **C — Lane 4 Persuasion** | ${summary.tracks.lane4Persuasion.conversations.toLocaleString()} conversations | — |

## Campaign funnel

\`\`\`txt
Volunteer → Voter Contact → Commitment → Turnout
\`\`\`

| Stage | Count |
| ----- | ----: |
| Volunteers active | ${summary.funnel.volunteersActive.toLocaleString()} |
| Voter contacts | ${summary.funnel.voterContacts.toLocaleString()} |
| Commitments | ${summary.funnel.commitments.toLocaleString()} |
| Turnout targets | ${summary.funnel.turnoutTargets.toLocaleString()} |

## Dashboards

| Dashboard | Doc |
| --------- | --- |
| Command Center | [voter-contact-command-center.md](./voter-contact-command-center.md) |
| Lane 2 Reactivation | [lane-2-reactivation-dashboard.md](./lane-2-reactivation-dashboard.md) |
| Registration | [registration-dashboard.md](./registration-dashboard.md) |
| Persuasion | [persuasion-dashboard.md](./persuasion-dashboard.md) |
| Power of 5 Conversion | [power-of-5-conversion-dashboard.md](./power-of-5-conversion-dashboard.md) |
| Postcards | [postcard-dashboard.md](./postcard-dashboard.md) |
| Phone Banks | [phone-bank-dashboard.md](./phone-bank-dashboard.md) |
| Canvass | [canvass-dashboard.md](./canvass-dashboard.md) |
| House Parties | [house-party-dashboard.md](./house-party-dashboard.md) |
| GOTV | [gotv-dashboard.md](./gotv-dashboard.md) |

## Field data files

- \`phone-banks-field.json\` · \`postcards-field.json\` · \`canvass-field.json\`
- \`power-of-5.json\` · \`house-parties.json\` · \`event-outcomes.json\`
- \`voter-contact-tracks.json\` — lane rollups (update weekly)
- \`relationship-assets.json\` — legacy capital metrics (merged at build)

\`\`\`bash
npm run campaign-brain:voter-contact:build
\`\`\`
`,
    "utf8",
  );
}

function writeAllDashboards(summary: VoterContactSummary) {
  const hci = summary.humanContactIndex;
  const t2 = summary.tracks.lane2Reactivation;
  const t3 = summary.tracks.lane3Registration;
  const t4 = summary.tracks.lane4Persuasion;

  writeDashboard(
    "voter-contact-command-center",
    "Voter Contact Command Center",
    `HCI: **${hci.total.toLocaleString()}** / ${hci.goal.toLocaleString()} (${hci.completionPct}%)

Funnel: ${summary.funnel.volunteersActive.toLocaleString()} volunteers → ${summary.funnel.voterContacts.toLocaleString()} contacts → ${summary.funnel.commitments.toLocaleString()} commitments

Data: [\`voter-contact-summary.json\`](../../../data/campaign-brain/voter-contact-summary.json)`,
  );

  writeDashboard(
    "lane-2-reactivation-dashboard",
    "Lane 2 — Democratic Reactivation",
    `Targets: presidential-only Democrats · low-frequency Democrats · dormant households

| Metric | Count |
| ------ | ----: |
| Contacted | ${t2.contacted.toLocaleString()} |
| Engaged | ${t2.engaged.toLocaleString()} |
| Committed | ${t2.committed.toLocaleString()} |
| Turnout target | ${t2.turnoutTarget.toLocaleString()} |
| Completion | ${t2.completionPct}% |`,
  );

  writeDashboard(
    "registration-dashboard",
    "Registration Dashboard (Lane 3)",
    `| Metric | Count |
| ------ | ----: |
| Started | ${t3.registrationsStarted.toLocaleString()} |
| Completed | ${t3.registrationsCompleted.toLocaleString()} |
| Registration events | ${t3.registrationEvents.toLocaleString()} |
| Volunteer registrars | ${t3.volunteerRegistrars.toLocaleString()} |
| Goal | ${t3.goal.toLocaleString()} |
| Completion | ${t3.completionPct}% |`,
  );

  writeDashboard(
    "persuasion-dashboard",
    "Persuasion Dashboard (Lane 4)",
    `| Metric | Count |
| ------ | ----: |
| Conversations | ${t4.conversations.toLocaleString()} |
| Follow-ups | ${t4.followUps.toLocaleString()} |
| Event attendance | ${t4.eventAttendance.toLocaleString()} |
| Endorsements generated | ${t4.endorsementsGenerated.toLocaleString()} |`,
  );

  const po5 = summary.channels.find((c) => c.id === "powerOf5");
  writeDashboard(
    "power-of-5-conversion-dashboard",
    "Power of 5 Conversion",
    `Conversations: **${po5?.primaryMetric.toLocaleString() ?? 0}** / ${po5?.goal.toLocaleString() ?? 0}

Source: [\`power-of-5.json\`](../../../data/campaign-brain/power-of-5.json)`,
  );

  for (const ch of summary.channels) {
    if (ch.id === "powerOf5") continue;
    const slug = ch.id === "phoneBank" ? "phone-bank" : ch.id === "houseParty" ? "house-party" : ch.id;
    writeDashboard(
      `${slug}-dashboard`,
      `${ch.label} Dashboard`,
      `${ch.detail}

| Metric | Count |
| ------ | ----: |
| Primary | ${ch.primaryMetric.toLocaleString()} |
| Goal | ${ch.goal.toLocaleString()} |
| Completion | ${ch.completionPct}% |`,
    );
  }

  writeFileSync(path.join(VC, "README.md"), `# Voter Contact & GOTV\n\n- [Phase 16 Hub](./PHASE-16-VOTER-CONTACT-GOTV-OPERATING-SYSTEM.md)\n`, "utf8");
}

function main() {
  mkdirSync(VC, { recursive: true });
  const summary = buildSummary();

  writeFileSync(path.join(BRAIN_DATA, "human-contact-index.json"), JSON.stringify(summary.humanContactIndex, null, 2), "utf8");
  writeFileSync(path.join(BRAIN_DATA, "voter-contact-summary.json"), JSON.stringify(summary, null, 2), "utf8");

  writeHub(summary);
  writeAllDashboards(summary);

  // eslint-disable-next-line no-console
  console.log(
    `Phase 16 Voter Contact: HCI ${summary.humanContactIndex.total.toLocaleString()} / ${summary.humanContactIndex.goal.toLocaleString()} · Lane 3 reg ${summary.tracks.lane3Registration.registrationsCompleted.toLocaleString()}`,
  );
}

main();
