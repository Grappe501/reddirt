/**
 * Executive Book Chapter 8 — Eyeball-to-Eyeball Organizing & Power of 5.
 * Campaign organizing doctrine: how the movement grows before GOTV deploys it.
 *
 * Usage: npm run campaign-brain:power-of-5-chapter:build
 */

import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const EXEC_BOOK = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan/executive-book-v1");
const OUT_DATA = path.join(BRAIN_DATA, "relational-organizing");
const OUT_MD = "07-EYEBALL-TO-EYEBALL-ORGANIZING-AND-POWER-OF-5.md";
const LEGACY_MD = "07-POWER-OF-5-RELATIONAL-ORGANIZING-MODEL.md";
const PASS = "EYEBALL-TO-EYEBALL-EXECUTIVE-CHAPTER-1.0";
const NETWORK_GOAL = 60_000;
const COUNTY_HOSTS_GOAL = 75;

const DISCLAIMER =
  "Organizing doctrine — not a volunteer how-to. Operators use field dashboards for execution detail.";

const OPERATING_FUNNEL = [
  "Conversation",
  "Relationship",
  "Trust",
  "Volunteer",
  "Host",
  "Recruit Five",
  "Vote",
];

const THREE_ASKS = [
  "Who else should we meet?",
  "Who would host the next gathering?",
  "Who are the five people everyone in this room knows?",
];

const EVENT_PYRAMID = [
  {
    tier: "Large events",
    purpose: "Visibility",
    examples: ["Sherwood launch", "Candidate forums", "Festivals", "Major rallies"],
  },
  {
    tier: "Medium events",
    purpose: "Credibility",
    examples: ["County meetings", "Union halls", "NAACP branches", "Rotary", "Chambers of Commerce"],
  },
  {
    tier: "Small events",
    purpose: "Relationship building",
    examples: ["Breakfasts", "Coffee meetings", "House parties", "Backyard gatherings", "Living room conversations"],
  },
];

const SURROGATE_TIERS = [
  {
    tier: 1,
    name: "Kelly Grappe",
    role: "Highest-value rooms · statewide validators · defining moments",
    examples: ["Labor Day gate events", "Sherwood", "Tier-1 county breakthroughs", "Coalition validators"],
  },
  {
    tier: 2,
    name: "Campaign surrogates",
    role: "Carry Kelly's message into rooms she cannot reach this week",
    examples: [
      "Former officials",
      "Community leaders",
      "Educators",
      "Faith leaders",
      "Union leaders",
      "NAACP leaders",
      "Volunteer leaders",
    ],
  },
  {
    tier: 3,
    name: "County hosts",
    role: "Local ownership — coffee, living rooms, backyards, lunch discussions",
    examples: ["House party hosts", "Civic introducers", "Rotary connectors", "Church gathering hosts"],
  },
  {
    tier: 4,
    name: "Power of 5 organizers",
    role: "Grassroots multiplication — every supporter recruits five trusted contacts",
    examples: ["Po5 commitments", "Conversation logs", "Peer invitations", "Trusted-network GOTV"],
  },
];

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function doctrineConstants() {
  return {
    operatingFunnel: OPERATING_FUNNEL,
    threeAsks: THREE_ASKS,
    eventPyramid: EVENT_PYRAMID,
    surrogateTiers: SURROGATE_TIERS,
    relationshipLadder: [
      "Meet",
      "Listen",
      "Follow Up",
      "Invite",
      "Engage",
      "Volunteer",
      "Lead",
      "Recruit Five",
    ],
    bigTableWelcome: [
      "Rural Democrats",
      "Conservative Democrats",
      "Union Democrats",
      "Faith Democrats",
      "Young Democrats",
      "Independents",
      "Moderate Republicans willing to listen",
    ],
  };
}

function buildChapter(): string {
  const po5 = readJson<{
    statewide?: {
      supporters?: number;
      powerOf5Commitments?: number;
      conversations?: number;
      volunteerRecruits?: number;
    };
  }>(path.join(BRAIN_DATA, "power-of-5.json"));

  const assets = readJson<{
    doctrine?: string;
    statewide?: Record<string, { deployed?: number; goal?: number }>;
    programs?: Record<string, { completed?: number; goal?: number }>;
  }>(path.join(BRAIN_DATA, "relationship-assets.json"));

  const pp = readJson<{
    volunteerLeadership?: { foundingTeamGoal?: number; foundingTeamCurrent?: number };
  }>(path.join(BRAIN_DATA, "people-power-network.json"));

  const hci = readJson<{ goal?: number; total?: number }>(path.join(BRAIN_DATA, "human-contact-index.json"));

  const relationshipAssets = [
    "Yard signs in yards",
    "Shirts on backs",
    "House parties",
    "County fairs & festivals",
    "Civic clubs · Rotary · Lions",
    "Extension Homemakers",
    "NAACP branches",
    "Union halls",
    "Faith communities",
    "Local restaurants & businesses",
    "Local media relationships",
    "Postcards (handwritten)",
    "Phone calls (trusted messengers)",
    "Door conversations",
    "Mobilize events",
    "Community stories (Motion & Storytelling)",
  ];

  const foundingCurrent = pp?.volunteerLeadership?.foundingTeamCurrent ?? 0;
  const foundingGoal = pp?.volunteerLeadership?.foundingTeamGoal ?? 20;

  return `# Eyeball-to-Eyeball Organizing & Power of 5

> ${PASS} · **Executive Book Chapter 8 — Campaign organizing doctrine**

> "What is the organizing philosophy of this campaign?"

**This chapter answers that question in one place.**

${DISCLAIMER}

This doctrine is the mechanism that connects Kelly's message · Power of 5 · relational organizing · house parties · county coverage · coalition work · volunteer leadership · endorsements · independent/Republican outreach · and GOTV into **one operating philosophy**.

---

## Why small rooms matter

Most persuasion in this campaign happens in **small rooms** — not rallies, not TV, not Facebook, not direct mail, not candidate forums.

A **12-person breakfast** may be more valuable than a **200-person speech** because:

- 12 people ask questions
- 12 people tell stories
- 12 people bring friends
- 12 people become hosts

**Large events create visibility. Small events create ownership.** You need both.

---

## The Eyeball-to-Eyeball Organizing Model

Also called the **Arkansas Living Room Strategy**.

This is not an advertising campaign. It is a **relationship campaign**.

\`\`\`
Relationships create trust.
Trust creates participation.
Participation creates turnout.
Turnout creates victory.
\`\`\`

Most campaigns organize around TV, mail, and digital ads. **Kelly Grappe for Secretary of State** organizes around **trusted human networks** in all 75 counties — eyeball to eyeball.

### Objective

Not attendance. Not applause. Not likes.

\`\`\`
Meaningful relationships.
\`\`\`

Every county visit should leave behind: new relationships · volunteers · signs · shirts · postcard writers · phone bank participants · **local champions**.

---

## Every stop creates more stops

The campaign enters a community and hosts a coffee · breakfast · lunch · house party · meet-and-greet · civic club · union hall · fundraiser · church gathering · or candidate forum.

**Before leaving, every event ends with three asks:**

1. **Who else should we meet?**
2. **Who would host the next gathering?**
3. **Who are your five?** — the five people everyone in this room knows

This is how coverage compounds: one room leads to the next room · the next host · the next county.

---

## The real funnel

This campaign's funnel is **not**:

\`\`\`
Ad → Vote
\`\`\`

It is:

\`\`\`
${OPERATING_FUNNEL.join(" → ")}
\`\`\`

That is fundamentally different. **Chapter 9 — Students for Arkansas** builds the youth pipeline. **Chapter 10 — GOTV** explains how the movement votes. **This chapter** explains how the movement grows.

---

## Event pyramid

| Tier | Examples | Purpose |
|------|----------|---------|
| **Large events** | ${EVENT_PYRAMID[0].examples.join(" · ")} | **${EVENT_PYRAMID[0].purpose}** |
| **Medium events** | ${EVENT_PYRAMID[1].examples.join(" · ")} | **${EVENT_PYRAMID[1].purpose}** |
| **Small events** | ${EVENT_PYRAMID[2].examples.join(" · ")} | **${EVENT_PYRAMID[2].purpose}** |

Schedule all three tiers every week. Visibility without relationship depth is wasted motion. Relationship depth without visibility is invisible momentum.

---

## The surrogate layer

**Kelly cannot attend every event.** The campaign scales through trusted messengers in rooms Kelly cannot reach.

\`\`\`
Kelly → Regional Surrogates → County Captains → Hosts → Power of 5 Network
\`\`\`

| Tier | Role | Who |
|------|------|-----|
| **Tier 1 — Kelly** | Highest-value events · statewide validators | Candidate |
| **Tier 2 — Campaign surrogates** | Carry the message when Kelly is elsewhere | ${SURROGATE_TIERS[1].examples!.slice(0, 4).join(" · ")} · and more |
| **Tier 3 — County hosts** | Coffee · living rooms · backyards · lunch discussions | Local champions willing to open their networks |
| **Tier 4 — Power of 5 organizers** | Grassroots multiplication engine | Every supporter recruits five |

### Surrogate development plan

Leadership planning targets:

| Asset | Goal | Current |
|-------|-----:|--------:|
| Founding volunteer leaders | ${foundingGoal} | ${foundingCurrent} |
| County hosts (one per county minimum) | ${COUNTY_HOSTS_GOAL} | — |
| Regional surrogates | Build pipeline | — |
| Coalition surrogates | Endorsement validators | — |
| Issue-specific surrogates | Labor · faith · education · NAACP | — |

Surrogates carry Kelly's message — they do not invent a new one. Source: \`docs/campaign-brain/routing/local-surrogate-training.md\`

---

## The Power of 5

Every supporter recruits **five** trusted contacts. Those five recruit five. Those five recruit five.

| Level | Objective |
|-------|-----------|
| Individual | Complete your Five · log conversations |
| Team | ~5 people · mutual accountability |
| County | Captain ladder · strike team roles |
| State | **${fmt(NETWORK_GOAL)} deep relational network** |

### Current statewide (field data)

| Metric | Current | Notes |
|--------|--------:|-------|
| Power of 5 commitments | ${fmt(po5?.statewide?.powerOf5Commitments ?? 0)} | Target network depth |
| Conversations logged | ${fmt(po5?.statewide?.conversations ?? 0)} | Trusted-network talks |
| Volunteer recruits via Po5 | ${fmt(po5?.statewide?.volunteerRecruits ?? 0)} | |
| Founding leaders | ${foundingCurrent} / ${foundingGoal} | June 28 launch |

Power of 5 is **Tier 4** of the surrogate layer — the engine that turns hosts into organizers and organizers into voters.

---

## The Big Table Democrat

Kelly's defining message connects directly to eyeball-to-eyeball organizing.

The campaign intentionally welcomes:

- Rural Democrats · Conservative Democrats · Union Democrats
- Faith Democrats · Young Democrats · Independents
- Moderate Republicans willing to listen

**We do not ask people to give up who they are. We ask Arkansans to come back to the table.**

Organizing implication: every conversation starts with **listening**, not persuasion scripts. Local messengers lead in their own networks — especially for Lane 4 conversion.

Source: \`docs/campaign-brain/relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md\`

---

## The relationship ladder

Every contact moves through:

\`\`\`
Meet → Listen → Follow Up → Invite → Engage → Volunteer → Lead → Recruit Five
\`\`\`

| Rung | Channel examples |
|------|------------------|
| Meet | County fair · diner · civic club · house party |
| Listen | Kelly stop · surrogate · validator intro |
| Follow Up | Phone · postcard · text · Mobilize |
| Invite | Event RSVP · house party · volunteer shift |
| Engage | Phone bank · postcard party · canvass |
| Volunteer | Strike team role · founding leader |
| Lead | County captain · Power of 5 leader |
| Recruit Five | Power of 5 commitment |

Human Contact Index (${fmt(hci?.total ?? 0)} / ${fmt(hci?.goal ?? 250_000)}) measures ladder volume. **Local ownership** measures ladder quality.

---

## Relationship assets

These are not separate programs. They are **trust-building mechanisms**:

${relationshipAssets.map((a) => `- ${a}`).join("\n")}

### Deployment goals

| Asset | Goal |
|-------|-----:|
| Signs | ${fmt(assets?.statewide?.signs?.goal ?? 5000)} |
| Shirts | ${fmt(assets?.statewide?.shirts?.goal ?? 3000)} |
| House parties | ${fmt(assets?.programs?.houseParties?.goal ?? 150)} |
| Civic club meetings | ${fmt(assets?.programs?.civicClubMeetings?.goal ?? 200)} |
| Faith events | ${fmt(assets?.programs?.faithEvents?.goal ?? 150)} |

---

## The ${fmt(NETWORK_GOAL)} network goal

Leadership planning anchor: a **deep statewide relational network** capable of:

- GOTV activation
- Volunteer mobilization
- Referendum and ballot initiative campaigns
- Community problem-solving between elections
- Validator and endorsement pipelines

| Layer | Planning target |
|-------|----------------:|
| Human Contact Index | ${fmt(hci?.goal ?? 250_000)} conversations |
| Power of 5 network depth | ${fmt(NETWORK_GOAL)} trusted connections |
| Founding volunteer leaders | ${foundingGoal} |
| County hosts | ${COUNTY_HOSTS_GOAL} |
| Counties with influence map | 75 |

---

## How this connects everything

| System | Connection |
|--------|------------|
| Kelly's message | Big Table listening in every room |
| County coverage | Every stop → three asks → next host |
| Coalition work | Surrogates open doors Kelly cannot |
| Endorsements | Validators emerge from relationship depth |
| Independent / Republican outreach | Lane 4 trust-first conversations |
| Volunteer leadership | Founding 20 → county captains → hosts |
| Citizen Voices Network | Earned media surrogate — local voices multiply in local papers |
| Students for Arkansas (Chapter 9) | Youth pipeline — registration · content · future leaders |
| GOTV (Chapter 10) | Deploys the network this chapter builds |

**Relationship Capital is the mechanism through which the Four Lanes actually move.**

---

## Perfect Week Doctrine

Every week the campaign:

1. Attends events · 2. Recruits volunteers (Power of 5) · 3. Builds endorsements
4. Tells stories · 5. Captures contacts · 6. Schedules future visits
7. Generates local media · 8. Builds coalition relationships

Three jobs: **visible momentum** · **validators** · **volunteer machine**.

Source: \`docs/campaign-brain/operations/perfect-week-doctrine.md\`

---

## Where operators find execution detail

| System | Location |
|--------|----------|
| Surrogate training | \`docs/campaign-brain/routing/local-surrogate-training.md\` |
| Citizen Voices Network | \`docs/campaign-brain/citizen-voices/CITIZEN-VOICES-NETWORK.md\` |
| Power of 5 dashboard | \`docs/campaign-brain/field-operating-system/power-of-5/\` |
| Relationship Capital | \`data/campaign-brain/relationship-assets.json\` |
| People Power | People Power tab · \`people-power-network.json\` |
| County Strike Teams | \`county-strike-teams.json\` |
| Community Relationship Index | \`community-relationship-index.json\` |
| Voter Contact & GOTV | Chapter 10 · Phase 16 |

---

## Rebuild

\`\`\`bash
npm run campaign-brain:power-of-5-chapter:build
npm run campaign-brain:voter-contact:build
npm run election-plan:build
\`\`\`

Shareable chapter: \`/election-plan/executive-book/power-of-5\`
`;
}

function buildSummary() {
  const po5 = readJson<{
    statewide?: {
      powerOf5Commitments?: number;
      conversations?: number;
      volunteerRecruits?: number;
    };
  }>(path.join(BRAIN_DATA, "power-of-5.json"));

  const assets = readJson<{ doctrine?: string }>(path.join(BRAIN_DATA, "relationship-assets.json"));
  const pp = readJson<{
    volunteerLeadership?: { foundingTeamGoal?: number; foundingTeamCurrent?: number };
  }>(path.join(BRAIN_DATA, "people-power-network.json"));
  const hci = readJson<{ goal?: number; total?: number }>(path.join(BRAIN_DATA, "human-contact-index.json"));

  const constants = doctrineConstants();

  return {
    generatedAt: new Date().toISOString(),
    pass: PASS,
    chapterTitle: "Eyeball-to-Eyeball Organizing & Power of 5",
    disclaimer: DISCLAIMER,
    doctrine:
      assets?.doctrine ??
      "Relationships create trust. Trust creates participation. Participation creates turnout. Turnout creates victory.",
    objective: "Meaningful relationships.",
    smallRoomsPrinciple: "Large events create visibility. Small events create ownership.",
    networkGoal: NETWORK_GOAL,
    countyHostsGoal: COUNTY_HOSTS_GOAL,
    hciGoal: hci?.goal ?? 250_000,
    hciCurrent: hci?.total ?? 0,
    powerOf5Commitments: po5?.statewide?.powerOf5Commitments ?? 0,
    conversations: po5?.statewide?.conversations ?? 0,
    foundingLeaders: pp?.volunteerLeadership?.foundingTeamCurrent ?? 0,
    foundingLeadersGoal: pp?.volunteerLeadership?.foundingTeamGoal ?? 20,
    operatingFunnel: constants.operatingFunnel,
    threeAsks: constants.threeAsks,
    eventPyramid: constants.eventPyramid,
    surrogateTiers: constants.surrogateTiers,
    relationshipLadder: constants.relationshipLadder,
    bigTableWelcome: constants.bigTableWelcome,
  };
}

function main() {
  mkdirSync(EXEC_BOOK, { recursive: true });
  mkdirSync(OUT_DATA, { recursive: true });
  mkdirSync(path.join(BRAIN_ROOT, "relational-organizing"), { recursive: true });

  const chapter = buildChapter();
  const summary = buildSummary();

  writeFileSync(path.join(EXEC_BOOK, OUT_MD), chapter);
  try {
    unlinkSync(path.join(EXEC_BOOK, LEGACY_MD));
  } catch {
    // legacy filename may not exist
  }
  writeFileSync(path.join(OUT_DATA, "power-of-5-executive-chapter.json"), JSON.stringify(summary, null, 2));
  writeFileSync(
    path.join(BRAIN_ROOT, "relational-organizing", "power-of-5-executive-chapter.summary.json"),
    JSON.stringify(summary, null, 2),
  );

  console.log(
    `Eyeball-to-Eyeball Executive Chapter: funnel ${summary.operatingFunnel.length} steps · ${summary.surrogateTiers.length} surrogate tiers · network goal ${fmt(NETWORK_GOAL)} · HCI ${summary.hciCurrent}/${summary.hciGoal}`,
  );
}

main();
