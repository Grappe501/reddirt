/**
 * Audience-specific executive narratives from shared data foundation.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_ROOT, fmt, loadDropOffTotals, readJson } from "./lib/inputs";

const OUT = path.join(BRAIN_ROOT, "executive-narrative");

function main() {
  mkdirSync(OUT, { recursive: true });
  const dropOff = loadDropOffTotals();
  const scenarios = readJson<{ scenarios: { conservative: { votes: number }; expected: { votes: number }; aggressive: { votes: number } } }>(
    path.join(BRAIN_ROOT, "scenario-engine/scenarios.json"),
  );

  writeFileSync(
    path.join(OUT, "candidate-version.md"),
    `# How We Win — Kelly Grappe (Candidate Version)

> Your north star for every room — 10 minutes, from the heart.

---

## The opening

Arkansas 2026 is not a majority-or-nothing race. It's a **plurality race**. Three names on the ballot. Largest coalition wins.

I'm not asking Arkansas to become a different state overnight. I'm asking us to **assemble the coalition that already exists** — and add to it.

---

## The three truths you own

1. **102,000 Democrats** voted in 2024 but skipped the 2022 midterm. They're not strangers. They're our people. We bring them back first.

2. **50,000 registrations** sounds impossible until you hear **2,500 a week**. That's achievable in every county.

3. **Relationships beat television.** Power of 5. Clerks. Fairs. Faith. Eyeball to eyeball.

---

## What winning looks like

| Path | Votes |
| ---- | ----: |
| Working goal | **400,000+** |
| Expected scenario | ${fmt(scenarios?.scenarios.expected.votes ?? 410_000)} |
| Plurality range | 390,000–420,000 |

---

## Your four lanes (say them every time)

1. **Hold** our Democrats
2. **Bring back** drop-off voters (${fmt(dropOff.recovery50Total)} @ half recovery)
3. **Register** 50,000 new voters
4. **Convert** through trust — not attacks

**Voice:** [Big Table Democrat Doctrine](../relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md) — working-class Democrat · bigger table · dignity for all Arkansans.

---

## Close

Recover Democrats → Register new voters → Build relationships → Split the opposition → **Win the largest coalition.**

*Full narrative: [THE-STORY-OF-HOW-WE-WIN.md](./THE-STORY-OF-HOW-WE-WIN.md) · [Big Table Doctrine](../relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md)*
`,
    "utf8",
  );

  writeFileSync(
    path.join(OUT, "donor-version.md"),
    `# How We Win — Donor Brief

> Investment case: plurality math, measurable engines, disciplined execution.

---

## Why this race is winnable

Plurality election. Three candidates. Working target **400,000+**, not 500,000.

---

## Three quantifiable engines

| Engine | Potential |
| ------ | --------: |
| Lane 2 drop-off recovery | ${fmt(dropOff.rawDropOff)} available · ${fmt(dropOff.recovery50Total)} @ 50% |
| Lane 3 registration | 50,000 · 2,500/week |
| Lane 4 conversion | 12% peel by county |

**Philosophy:** [Big Table Democrat Doctrine](../relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md)

---

## Scenario range

| Scenario | Votes |
| -------- | ----: |
| Conservative | ${fmt(scenarios?.scenarios.conservative.votes ?? 382_000)} |
| Expected | **${fmt(scenarios?.scenarios.expected.votes ?? 410_000)}** |
| Aggressive | ${fmt(scenarios?.scenarios.aggressive.votes ?? 438_000)} |

---

## What donors fund

Field infrastructure: Brain recommendations, cluster deployment, clerk/faith layers, captured-opportunity accountability.

*Data: Campaign Brain · Official SOS history*
`,
    "utf8",
  );

  writeFileSync(
    path.join(OUT, "county-chair-version.md"),
    `# How We Win — County Chair Brief

> Your county has a mission. Here is how it fits the statewide win.

---

## Stop saying "we can't win here"

**102,000 Arkansas Democrats** voted in 2024 but not in the 2022 midterm.

Your playbook shows drop-off, recovery scenarios, and a **Hope Index**.

**We bring our own people back.**

---

## Your three jobs

1. **Lane 2** — Reactivate drop-off Democrats (Power of 5)
2. **Lane 3** — Hit registration weekly pace in your playbook
3. **Lane 4** — Relationships at fairs, faith, community events

---

## Your playbook includes

County mission · Registration dashboard · VCI rank · Volunteer + Power of 5 targets

You're part of a **regional cluster** — not alone.

## Big Table recruiting

We are building a **bigger table** — room for working-class, rural, Christian, conservative, and independent Arkansans who want honest government and strong communities. You do not have to agree on every issue to win your county.

Read: [Big Table Democrat Doctrine](../relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md)

*File: chapter-09 county playbook · Weekly brief: campaign-brain/weekly-brief/LATEST.md*
`,
    "utf8",
  );

  writeFileSync(
    path.join(OUT, "volunteer-version.md"),
    `# How We Win — Volunteer Brief

> What you do matters. Here is how you fit in.

---

## We're not trying to flip Arkansas overnight

We're building the **biggest coalition** in a three-way race. Every conversation counts.

---

## Four ways you help

| Lane | What you do |
| ---- | ----------- |
| 1 | Keep Democrats engaged — don't let friends sit out |
| 2 | **Bring people back** who voted in 2024 but skipped the last midterm |
| 3 | **Register** voters — seniors, students, neighbors |
| 4 | **Listen** — Power of 5 conversations with people who don't think like us |

---

## Power of 5

You identify **five people**. Each conversation creates five more.

No lecture. No attack ads. **Relationships.**

---

## This week

- Show up to the event your county chair recommends
- Bring registration forms
- Collect names for follow-up
- Report outcomes so the campaign learns

---

## The goal

**400,000+ votes** — largest coalition wins.

You are not background. You are the campaign.

*Questions: your county chair · field team*
`,
    "utf8",
  );

  writeFileSync(
    path.join(OUT, "README.md"),
    `# Executive Narrative — Audience Versions

Same underlying data. Different audience.

| Version | File | Audience |
| ------- | ---- | -------- |
| Master | [THE-STORY-OF-HOW-WE-WIN.md](./THE-STORY-OF-HOW-WE-WIN.md) | Full reference |
| Philosophy | [Big Table Democrat Doctrine](../relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md) | Governing voice — all audiences |
| Candidate | [candidate-version.md](./candidate-version.md) | Kelly — every room |
| Donor | [donor-version.md](./donor-version.md) | Fundraising |
| County chair | [county-chair-version.md](./county-chair-version.md) | 75 county leaders |
| Volunteer | [volunteer-version.md](./volunteer-version.md) | Field organizers |

Regenerate: \`npm run campaign-brain:narratives:build\`
`,
    "utf8",
  );

  console.log("Executive narrative variants written (4 audiences).");
}

main();
