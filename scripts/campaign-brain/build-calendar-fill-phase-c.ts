/**
 * Calendar Fill Phase C — Operational Lock Review.
 * Refines Phase B (Option C) per leadership flags. NOT operational lock. NOT Google Calendar.
 *
 * Usage: npm run campaign-brain:calendar-fill:phase-c
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_ROOT, readJson } from "./lib/inputs";

const OUT = path.join(BRAIN_ROOT, "calendar-fill");
const PHASE_B = path.join(OUT, "proposed-calendar-fill.json");

const DISCLAIMER =
  "Operational Lock Review (Phase C). Refines Option C for executability. Not Kelly's final calendar. Not Google Calendar or /events. Leadership sign-off required before operational lock.";

type Block = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  corridorId: string;
  anchorCity: string;
  countiesNew: string[];
  countiesRevisit: string[];
  travelClass: string;
  overnightLikely: boolean;
  category: string;
  approvalStatus: "approved" | "conditional_resolved" | "protected";
  mustHitCounties?: string[];
  bonusIfTimeCounties?: string[];
  phaseCNotes?: string[];
};

type TimeAudit = {
  blockId: string;
  block: string;
  candidateHours: number;
  travelHours: number;
  eventHours: number;
  relationshipHours: number;
  relationshipDensity: "high" | "medium" | "low";
  notes: string;
};

function estimateTimeAudit(b: Block): TimeAudit {
  const days =
    (Date.parse(b.endDate) - Date.parse(b.startDate)) / 86400000 + 1;
  const candidateHours = Math.round(days * 10);

  let travelHours = 4;
  if (b.travelClass === "regional") travelHours = 6;
  if (b.travelClass === "immersion") travelHours = 10;
  if (b.travelClass === "multi-day") travelHours = Math.round(days * 5);
  if (b.category === "rest_prep") travelHours = 0;

  let relationshipHours = 4;
  let eventHours = 3;
  if (b.category === "tier1_reinforcement") {
    relationshipHours = Math.round(days * 5);
    eventHours = Math.round(days * 2);
  }
  if (b.corridorId.startsWith("delta")) {
    relationshipHours = Math.round(days * 4);
    eventHours = Math.round(days * 2);
  }
  if (b.id === "prop-sep26-south-delta-sw") {
    relationshipHours = 8;
    eventHours = 4;
  }
  if (b.category === "rest_prep") {
    relationshipHours = 4;
    eventHours = 0;
  }
  if (b.id === "prop-oct3-ozark") {
    travelHours = 12;
    relationshipHours = 6;
    eventHours = 4;
  }

  const densityScore = relationshipHours / Math.max(candidateHours, 1);
  const relationshipDensity =
    densityScore >= 0.45 ? "high" : densityScore >= 0.3 ? "medium" : "low";

  const notes =
    relationshipDensity === "high"
      ? "Stack clerk + coalition + business + media where possible"
      : relationshipDensity === "medium"
        ? "Add one relationship anchor per county — avoid drive-by only"
        : "Risk: picture-only visit — add meeting or defer to bonus tier";

  return {
    blockId: b.id,
    block: b.label,
    candidateHours,
    travelHours,
    eventHours,
    relationshipHours,
    relationshipDensity,
    notes,
  };
}

function refinePhaseB(blocks: Block[]): Block[] {
  return blocks.map((b) => {
    const copy: Block = { ...b, phaseCNotes: [], approvalStatus: "approved" };

    if (b.id === "prop-sep26-south-delta-sw") {
      copy.approvalStatus = "conditional_resolved";
      copy.mustHitCounties = ["Ashley", "Chicot", "Lincoln", "Calhoun", "Dallas"];
      copy.bonusIfTimeCounties = ["Miller", "Sevier", "Grant"];
      copy.countiesNew = [...copy.mustHitCounties, ...copy.bonusIfTimeCounties];
      copy.phaseCNotes = [
        "Leadership flag: 8 counties in one immersion is operationally risky.",
        "Must-hit cap: 5 counties (SE Delta + SW core). Bonus tier: 3 — defer if fatigue.",
        "Relationship density priority: Crossett/Lake Village/Star City + Camden corridor meetings.",
      ];
    }

    if (b.id === "prop-oct3-ozark") {
      copy.approvalStatus = "conditional_resolved";
      copy.countiesNew = ["Newton", "Madison", "Perry", "Logan"];
      copy.endDate = "2026-10-03";
      copy.phaseCNotes = [
        "Little River removed — geographically southwest, not Ozark (see geographic-corrections.md).",
        "Oct 4 reserved for Air Show short appearance only — no additional county fill.",
        "Sat Oct 3: Jasper/Newton/Madison stack · return or overnight Russellville adjacency.",
      ];
    }

    if (b.id === "prop-oct11-prairie") {
      copy.approvalStatus = "conditional_resolved";
      copy.countiesNew = ["Prairie", "Scott", "Little River"];
      copy.label = "Central Prairie + Little River (geographic correction)";
      copy.phaseCNotes = [
        "Little River moved from Ozark block — SW Arkansas placement via Hope/Camden corridor backup.",
        "Stack with locked Saline GOTV Oct 12 as local/regional day.",
      ];
    }

    if (b.id === "prop-oct18-prep") {
      copy.approvalStatus = "protected";
      copy.phaseCNotes = [
        "Protected recovery block — do not sacrifice for county completion.",
        "Early voting prep Oct 20 takes priority over any optional county touch.",
      ];
    }

    if (b.id === "prop-aug8-delta-gateway") {
      copy.phaseCNotes = [
        "Leadership approved — keep early for September Delta proof.",
        "Maximize relationship density: clerk, labor, NAACP, local media in West Memphis.",
      ];
    }

    return copy;
  });
}

function main() {
  mkdirSync(OUT, { recursive: true });

  const phaseB = readJson<{ proposedBlocks?: Block[]; strategyLabel?: string }>(PHASE_B);
  const refined = refinePhaseB(phaseB?.proposedBlocks ?? []);
  const timeAudits = refined.map(estimateTimeAudit);

  const mustHitAll = refined.flatMap((b) => b.mustHitCounties ?? b.countiesNew);
  const bonusAll = refined.flatMap((b) => b.bonusIfTimeCounties ?? []);
  const newIfMustHitOnly = new Set(
    refined.flatMap((b) => b.mustHitCounties ?? b.countiesNew.filter((c) => !b.bonusIfTimeCounties?.includes(c))),
  );

  const v2 = {
    generatedAt: new Date().toISOString(),
    phase: "C_operational_lock_review",
    parentProposal: "proposed-calendar-fill.json",
    strategyLabel: phaseB?.strategyLabel ?? "Option C — Balanced Delta + Tier 1 reinforcement",
    status: "operational_lock_review",
    disclaimer: DISCLAIMER,
    isKellyFinalCalendar: false,
    googleCalendarWritten: false,
    eventsPublished: false,
    leadershipSignOffRequired: true,
    proposedBlocksV2: refined,
    coverage: {
      mustHitCountyCount: newIfMustHitOnly.size,
      bonusCountyCount: bonusAll.length,
      totalIfAllBonus: mustHitAll.length,
      pathwayMustHit: `50 locked + ${newIfMustHitOnly.size} must-hit = ${50 + newIfMustHitOnly.size}/75`,
      pathwayFull: "50 locked + 25 fill = 75/75 if all bonus executed",
    },
    timeAudits,
  };

  writeFileSync(path.join(OUT, "proposed-calendar-fill-v2.json"), JSON.stringify(v2, null, 2));

  writeFileSync(
    path.join(OUT, "calendar-fill-phase-c.summary.json"),
    JSON.stringify(
      {
        generatedAt: v2.generatedAt,
        disclaimer: DISCLAIMER,
        conditionalBlocksResolved: 3,
        protectedBlocks: 1,
        mustHitCountyCount: newIfMustHitOnly.size,
        bonusCountyCount: bonusAll.length,
        leadershipDecisionsPending: 4,
      },
      null,
      2,
    ),
  );

  writeFileSync(
    path.join(OUT, "kelly-time-allocation-audit.json"),
    JSON.stringify({ generatedAt: v2.generatedAt, audits: timeAudits }, null, 2),
  );

  const auditMd = `# Kelly Time Allocation Audit

> ${DISCLAIMER}

Maximize **relationship density per hour**, not county count alone.

| Block | Candidate hrs | Travel hrs | Event hrs | Relationship hrs | Density |
|-------|-------------:|-----------:|----------:|-----------------:|---------|
${timeAudits.map((a) => `| ${a.block} | ${a.candidateHours} | ${a.travelHours} | ${a.eventHours} | ${a.relationshipHours} | ${a.relationshipDensity} |`).join("\n")}

## High-value relationship stack (target per immersion day)

- County clerk or election official intro
- One coalition meeting (NAACP, labor, AEA, or Dem club)
- One local business validator
- One civic club or local media touch
- Public event or festival stop

## Low-value pattern to avoid

- Drive in → photo → leave with no meetings scheduled

${timeAudits
  .filter((a) => a.relationshipDensity === "low")
  .map((a) => `- **${a.block}:** ${a.notes}`)
  .join("\n")}
`;
  writeFileSync(path.join(OUT, "kelly-time-allocation-audit.md"), auditMd);

  writeFileSync(
    path.join(OUT, "geographic-corrections.md"),
    `# Geographic Corrections — Phase C

## Little River County

**Issue:** Phase B placed Little River in the Ozark / North Central block. Little River is **southwest Arkansas** (Ashdown/Texarkana region), not Ozark foothills.

**Correction:**
- **Removed** from Oct 3–4 Ozark block
- **Added** to Oct 11–12 Central Prairie + SW backup route (Hope/Camden corridor logic)
- Alternative bonus path: Sep 27 tail from El Dorado/Union immersion direction if Sep 26–27 bonus tier executes

## Ozark block (Oct 3)

**Counties retained:** Newton, Madison, Perry, Logan  
**Anchor:** Jasper / Russellville adjacency

## Sep 26–27 South immersion

**Geographic logic:** SE Delta (Crossett/Lake Village) → SW (Camden/El Dorado direction) — one continuous south AR arc, not two unrelated jumps.
`,
  );

  writeFileSync(
    path.join(OUT, "must-hit-bonus-tiers.json"),
    JSON.stringify(
      {
        generatedAt: v2.generatedAt,
        tiers: refined
          .filter((b) => b.mustHitCounties?.length)
          .map((b) => ({
            blockId: b.id,
            label: b.label,
            dates: `${b.startDate} → ${b.endDate}`,
            mustHit: b.mustHitCounties,
            bonusIfTime: b.bonusIfTimeCounties ?? [],
          })),
      },
      null,
      2,
    ),
  );

  writeFileSync(
    path.join(OUT, "must-hit-bonus-tiers.md"),
    `# Must-Hit vs Bonus-If-Time Tiers

## Sep 26–27 South immersion (conditional → resolved)

### Must-hit (5 counties)

| County | Rationale |
|--------|-----------|
| Ashley | SE Delta fair season · Crossett anchor |
| Chicot | Lake Village · deep south Delta |
| Lincoln | Star City · completes SE Delta arc |
| Calhoun | SW completion core |
| Dallas | Camden corridor · chamber/coalition |

### Bonus-if-time (3 counties)

| County | Rationale |
|--------|-----------|
| Miller | Texarkana adjacency · only if Sep 26–27 energy holds |
| Sevier | De Queen · stack with Miller if southbound |
| Grant | Sheridan · defer if fatigue — can absorb elsewhere |

**Operational rule:** If Kelly is fatigued after must-hit, **skip bonus tier** — 72/75 with strong relationships beats 75/75 drive-by.
`,
  );

  writeFileSync(
    path.join(OUT, "oct-air-show-resolution.md"),
    `# Oct 3–4 Air Show Conflict Resolution

## Conflict

Phase B stacked Ozark completion (Oct 3–4) with **locked Air Show (Oct 4, North Little Rock / Pulaski)**.

## Resolution (Phase C)

| Day | Assignment |
|-----|------------|
| **Oct 3 (Sat)** | Ozark completion day trip or overnight — Newton, Madison, Perry, Logan only |
| **Oct 4 (Sun)** | **Air Show only** — short local appearance (2–3 hours). No additional county fill. |

## Options if Oct 3 runs long

1. Kelly returns to LR metro Oct 3 evening for Oct 4 Air Show (preferred)
2. Surrogate/staff covers Air Show booth if Ozark overnight required — **leadership decision**

## Not approved

- Full Ozark immersion Oct 4 + Air Show same day
`,
  );

  writeFileSync(
    path.join(OUT, "leadership-decisions-required.md"),
    `# Leadership Decisions Required — Before Operational Lock

Answer these four questions before Phase C becomes operational lock.

---

## 1. Is 75/75 still the goal — and by when?

| Option | Implication |
|--------|-------------|
| **75/75 before Labor Day** | Requires aggressive Sep 6–7 + Sep 26–27 execution; little buffer |
| **75/75 before October** | Phase C must-hit path targets ~72 by Sep 30; bonus tier in early Oct |
| **75/75 before Early Voting (Oct 20)** | Current Option C + Phase C refinements fit this timeline |

**Phase C default assumption:** 75/75 before Early Voting; must-hit path acceptable at 72/75 if bonus fails.

---

## 2. What is the minimum acceptable Delta footprint?

Current proposal touches **8 Delta counties** once each.

| Option | Meaning |
|--------|---------|
| **One touch enough** | Aug 8–9 + Aug 23–24 + Sep 26–27 must-hit satisfies legitimacy |
| **Recurring Delta presence** | Requires second revisit window — conflicts with NWA/Tier 1 vote production |

**Phase C recommendation:** One substantive touch (relationship meetings, not drive-by) per Delta county before September forums.

---

## 3. Which Top 10 cities must be revisited before September?

| City | Phase B/C status |
|------|------------------|
| Little Rock | Locked events + Oct 4 Air Show |
| North Little Rock | Locked + Oct 4 Air Show |
| Conway | Locked Faulkner Jul 20 · Conway fair Sep 12 |
| Jonesboro | Proposed Aug 30 Craighead revisit |
| Fayetteville | Proposed Aug 15–16 NWA stack |
| Rogers | Proposed Aug 15–16 NWA stack |
| Fort Smith | Locked Sebastian immersion Jul 31 |
| Pine Bluff | Proposed Jul 19 Jefferson revisit |

**Pending leadership confirm:** All eight covered in proposal — verify relationship density, not just geographic touch.

---

## 4. What gets bumped if endorsements start landing?

Flex slots reserved for:

- Oct 18 recovery (protected — bump county bonus, not recovery)
- Sep 26–27 bonus tier (first to defer)
- Oct 11 Little River backup (second to defer)

**Endorsement priority examples:** AEA signing event, labor hall, NAACP branch, county clerk invitation — these **override bonus tier**, not must-hit Delta or Tier 1 revisits without leadership call.
`,
  );

  writeFileSync(
    path.join(OUT, "operational-lock-recommendation.md"),
    `# Operational Lock Recommendation — Phase C

> ${DISCLAIMER}

## Recommendation

**Proceed toward operational lock** after Kelly and Ernie sign \`LEADERSHIP-SIGN-OFF-PACKAGE.md\`, using \`proposed-calendar-fill-v2.json\` as the refined backbone.

## Approved without change

- Jul 19 Jefferson / Pine Bluff Tier 1 revisit
- Aug 8–9 Delta Gateway
- Aug 15–16 NWA Reinforcement
- Aug 23–24 Delta River
- Aug 30 Craighead + Lawrence
- Sep 6–7 Northeast Completion
- Oct 18 Recovery / early vote prep (**protected**)

## Conditional — resolved in Phase C

| Block | Resolution |
|-------|------------|
| Sep 26–27 | Must-hit 5 · Bonus 3 |
| Oct 3–4 Ozark | Oct 3 only · Oct 4 Air Show short appearance |
| Little River | Moved to Oct 11–12 SW backup |

## Not ready for operational lock until

- [ ] Four leadership decisions answered (\`leadership-decisions-required.md\`)
- [ ] Kelly + Ernie sign approval checklist
- [ ] Endorsement surge bump protocol agreed
- [ ] Explicit **no Google Calendar / no /events** until operational lock commit

## Next pass after sign-off

**Operational Lock Pass:** write approved blocks to CampaignEvent workflow (future — not this sprint).
`,
  );

  writeFileSync(
    path.join(OUT, "LEADERSHIP-SIGN-OFF-PACKAGE.md"),
    `# Leadership Sign-Off Package — Calendar Fill Phase C

> ${DISCLAIMER}

## Executive summary

**Strategy approved:** Option C — Balanced Delta + Tier 1 reinforcement  
**Phase C status:** Operational lock review complete — refinements applied  
**Coverage pathway:** 50 locked → 72 must-hit → 75 if bonus tier executes  
**Not final until signed below**

---

## What we approve

### Vote production
- Benton · Washington · Craighead · Jefferson · Pulaski pathway

### Statewide legitimacy
- 75-county coverage path with must-hit / bonus tiers

### September proof
- Delta Gateway Aug 8–9 · Delta River Aug 23–24 before Labor Day forums

### Storytelling
- "We've been to every corner of Arkansas" — **if relationship density targets met**

---

## Phase C refinements applied

1. Sep 26–27 split: **5 must-hit / 3 bonus**
2. Oct 3–4: Ozark Sat only · Air Show Sun short appearance
3. Little River moved to Oct 11 SW backup
4. Oct 18 recovery **protected**

See: \`kelly-time-allocation-audit.md\`, \`must-hit-bonus-tiers.md\`, \`geographic-corrections.md\`

---

## Decisions required (check when answered)

- [ ] 75/75 deadline: Labor Day / October / Early Voting
- [ ] Delta footprint: one touch vs recurring
- [ ] Top 10 city revisit list confirmed
- [ ] Endorsement bump protocol

---

## Sign-off

| Role | Approve Option C + Phase C refinements | Date | Signature |
|------|----------------------------------------|------|-----------|
| Kelly Grappe | | | |
| Ernie | | | |
| Steve (operations) | | | |

**Do not merge to main · Do not publish calendars until all boxes signed.**
`,
  );

  writeFileSync(
    path.join(OUT, "CALENDAR-FILL-PHASE-C.md"),
    `# Calendar Fill Phase C — Operational Lock Review

> ${DISCLAIMER}

## Authorization

Leadership approved **Option C conceptually** and authorized Phase C to resolve conditional blocks before operational lock.

## Deliverables

| File | Purpose |
|------|---------|
| [proposed-calendar-fill-v2.json](./proposed-calendar-fill-v2.json) | Refined proposal |
| [kelly-time-allocation-audit.md](./kelly-time-allocation-audit.md) | Relationship density per block |
| [must-hit-bonus-tiers.md](./must-hit-bonus-tiers.md) | Sep 26–27 tier split |
| [geographic-corrections.md](./geographic-corrections.md) | Little River fix |
| [oct-air-show-resolution.md](./oct-air-show-resolution.md) | Oct 3–4 conflict |
| [leadership-decisions-required.md](./leadership-decisions-required.md) | Four open questions |
| [operational-lock-recommendation.md](./operational-lock-recommendation.md) | Burt recommendation |
| [LEADERSHIP-SIGN-OFF-PACKAGE.md](./LEADERSHIP-SIGN-OFF-PACKAGE.md) | Final approval doc |

## Coverage math

- **Must-hit path:** ${v2.coverage.pathwayMustHit}
- **Full path (all bonus):** ${v2.coverage.pathwayFull}

## Still not done

- Google Calendar
- /events publish
- Merge to main
- CampaignEvent operational write
`,
  );

  console.log(
    `Calendar Fill Phase C: ${refined.length} blocks reviewed · must-hit ${newIfMustHitOnly.size} counties · ${bonusAll.length} bonus · leadership sign-off required`,
  );
}

main();
