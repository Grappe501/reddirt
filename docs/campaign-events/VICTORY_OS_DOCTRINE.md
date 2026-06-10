# Victory OS — Canonical Doctrine

**Lane:** `RedDirt/` only  
**Audience:** Steve, Campaign Manager, field leadership, Cursor (Burt)  
**Canonical path:** `RedDirt/docs/campaign-events/VICTORY_OS_DOCTRINE.md`  
**Status:** Doctrine locked for build (June 2026) — supersedes ad-hoc calendar redesign notes  
**Data:** `data/strategy-doctrine/victory-map-v1.json` · `data/strategy-doctrine/victory-os-seasons-v1.json`  
**Types:** `src/lib/victory-os/types.ts` · `src/lib/victory-os/score-maps.ts`

---

## Product principle

If someone opens the system on a Monday morning, the first screen must **not** ask:

> What is on the calendar this week?

It must answer:

> **What are the ten most important decisions we must make this week to reach 50% + 1?**

Everything else — missions, deployments, events, calendars, maps, dashboards, fairs, volunteer shifts — is **downstream** from that answer.

This platform is **not** a CRM and **not** a calendar. It is a **statewide campaign operating system** that manages **victory**, not activities.

---

## North star

> **What is the shortest path to 50% + 1?**

Every county profile, weekly decision, mission, resource assignment, calendar tactic, and hot-wash result must trace back to this question.

---

## System hierarchy (build order)

```text
Layer 0 · Victory Map          → what combination of counties wins?
Layer 1 · Decision Generator   → what must leadership decide this week?
Layer 2 · Regional Operations  → how do regions execute decisions?
Layer 3 · County Workbenches   → what does each county need?
        ↓
County Mission stack           → long-term → monthly → weekly → daily
        ↓
Resource allocation          → Kelly · volunteers · chairs · media · phone bank · $
        ↓
Calendar tactics             → fairs, forums, call time, canvass shifts (byproduct)
        ↓
Execution & hot wash
        ↓
Results feed Layer 0 + next Decision Generator run
```

**The calendar becomes almost invisible.** Operators live in decisions and missions; the calendar records what happened.

---

## Layer 0 — Victory Map

### Purpose

Before the system decides what a county needs, it must understand **what combination of counties wins the election**.

Layer 0 is **not** a single A–E label. Each county carries **three independent dimensions**.

### Dimension 1 — Electoral importance

*How important is this county to winning statewide?*

| Value | Meaning |
|-------|---------|
| **Critical** | Must perform — failure here breaks the path to victory |
| **Important** | Significant contribution to statewide margin |
| **Helpful** | Adds value; not decisive alone |
| **Maintenance** | Maintain presence; do not overinvest candidate time |

**Examples (leadership must lock in `victory-map-v1.json`):**

| County | Electoral importance |
|--------|---------------------|
| Pulaski | Critical |
| Washington | Critical |
| Benton | Critical |
| Faulkner | Critical |
| Saline | Critical |
| Craighead | Critical |
| Montgomery | Maintenance |

### Dimension 2 — Opportunity level

*How much room exists for growth?*

| Value | Meaning |
|-------|---------|
| **High** | Significant persuasion or turnout headroom |
| **Medium** | Moderate upside with focused investment |
| **Low** | Limited marginal gain per dollar or hour |

**Examples:**

| County | Opportunity |
|--------|-------------|
| Benton | High |
| Pulaski | Medium |
| Montgomery | Low |

### Dimension 3 — Organizational readiness

*Can we actually execute there today?*

| Value | Meaning |
|-------|---------|
| **Strong** | Chair, captain, volunteer bench, event pipeline in place |
| **Moderate** | Partial infrastructure — gaps remain |
| **Weak** | Shell county — little verified field capacity |

**Examples:**

| County | Readiness |
|--------|-----------|
| Pulaski | Strong |
| Benton | Moderate |
| Montgomery | Weak |

### Worked example — Benton vs Montgomery

| Dimension | Benton | Montgomery |
|-----------|--------|------------|
| Electoral importance | Critical | Maintenance |
| Opportunity | High | Low |
| Readiness | Moderate | Weak |

**Interpretation:** Benton needs intervention (critical + high opportunity + readiness gap). Montgomery may need a volunteer touch but **not** Kelly — weak readiness does not override low electoral importance.

### County victory profile (Layer 0 record)

Each of 75 counties stores:

- Three dimension values (above)
- Numeric scores for the decision engine (see `score-maps.ts`)
- Vote math from `kelly-win-target-scenario-v1.json`: `targetVotes`, `baselineDemVotes`, `targetVoteGain`, `countyWinContribution`
- `classificationStatus`: `draft` | `leadership_locked` | `needs_review`
- `lockedBy` / `lockedAt` when CM signs off

**Seeding rules (draft only until leadership locks):**

1. Electoral importance — derive from `countyWinContribution` percentile + manual overrides for known Critical counties  
2. Opportunity — derive from `countyOpportunityScore` + `turnoutHeadroomScore` in win-target scenario  
3. Readiness — derive from `CountyNormalizedKpi.countyReadinessScore`, workbench depth, chair/captain flags  

### Statewide victory status

Pulled from win-target scenario (planning — not a forecast):

- `workingTargetWithCushion` — votes needed to win with cushion  
- `statewideVoteGap` — gap to close vs baseline  
- Pace indicator: ahead / on pace / behind (once progress metrics connect)

---

## Deployment priority formula

**Do not** rank counties by operational redness alone.

```text
Deployment Priority =
  Victory Importance × Opportunity × Readiness Gap × Urgency
```

Each factor is normalized to **0.0–1.0** before multiplication. Display score = product × 100 (0–100 scale).

| Factor | Source | Notes |
|--------|--------|-------|
| **Victory importance** | Electoral importance dimension | Critical highest |
| **Opportunity** | Opportunity dimension | High opportunity = higher priority |
| **Readiness gap** | Organizational readiness (inverted) | **Strong readiness = lower gap score** — county may not need Kelly even if critical |
| **Urgency** | Ops signals | Status red/yellow/green, neglect days, trending backward, unmet needs |

**Why readiness gap is inverted:** A Critical county with Strong readiness may need **surrogate or volunteer** coverage, not Kelly. A Critical county with Weak readiness may need **immediate** infrastructure + candidate where Tier 1 applies.

Implementation: `src/lib/victory-os/score-maps.ts` · `resolveDeploymentPriority()` (Sprint 1).

---

## Layer 1 — Decision Generator (not “mission generator”)

### Purpose

Every **Monday morning** (daily during Final 14 Days), produce **Top 10 Decisions** for the Campaign Manager.

The system is a **decision engine**, not a list of events.

### Decision object

Each decision includes:

| Field | Example |
|-------|---------|
| Rank | 1–10 |
| County | Benton |
| Current status | Yellow |
| **Recommendation** | Deploy Kelly to County Fair |
| Resource type | Kelly · volunteer · surrogate · fundraising · media · phone bank |
| Kelly tier | 1 = required · 2 = preferred · 3 = volunteer covers · 4 = decline |
| Expected outcome | +300 contacts |
| **Reason** | Critical county, high opportunity, readiness gap |
| Linked mission | Weekly mission ID (when Sprint 2 exists) |
| Approval | `pending` · `approved` · `declined` · `modified` |

### Example decisions

**Decision #1 — Benton County**  
Status: Yellow · Recommend: Deploy Kelly to County Fair · Outcome: +300 contacts · Reason: Critical, high opportunity, readiness gap  

**Decision #2 — White County**  
Status: Yellow · Recommend: Assign volunteer captain · Outcome: Infrastructure improvement · Reason: Important county, moderate opportunity, weak readiness  

**Decision #3 — Craighead County**  
Status: Green · Recommend: No Kelly — send surrogate · Outcome: Maintain visibility without candidate time · Reason: Critical but strong readiness  

### Monday brief sections (decision-centric)

| # | Section | Output |
|---|---------|--------|
| 1 | **Statewide victory status** | Ahead / behind · gap · pace |
| 2 | **Top 10 decisions** | Ranked recommendations — **primary UI** |
| 3 | Kelly deployment | Tier 1 (and Tier 2 if capacity) from approved decisions |
| 4 | Volunteer deployment | Highest leverage volunteer actions |
| 5 | Fundraising deployment | What **funding unlocks** — not merely who to call |
| 6 | Counties at risk | Trending backward × victory importance |
| 7 | Strategic opportunities | Outperform potential — high opportunity, momentum |

Sections 3–7 are **views on the decision set**, not separate ranking systems.

### Governance

- Brief status: `INTERNAL_DRAFT`  
- Human review required before any external action  
- AI may recommend; **never** auto-schedule Kelly, send comms, or commit resources  
- Snapshot: `data/mission-briefs/YYYY-Www.json` for week-over-week delta  

**Route (Sprint 3):** `/admin/mission-brief` — default Campaign OS Monday home  

**CLI (Sprint 1):** `npm run victory:decisions`  

---

## Layer 2 — Regional operations

Arkansas campaign regions (display layer): `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts`

Each region maintains:

- Regional captain (human assignment — future field)  
- Volunteer team roll-up  
- Regional goals vs statewide gap allocation  
- Weekly regional swing balance (Season 2: NW + Central + E/S per week)

Regions **do not** override Layer 0 county math; they aggregate county decisions for travel planning.

---

## Layer 3 — County workbenches

**True operational center** — one workbench per county.

Canonical sister product: `countyWorkbench` when `NEXT_PUBLIC_COUNTY_WORKBENCH_URL` set.  
RedDirt bridge: `/admin/counties/[slug]` · `county-workbench-adapter.ts`

Each county workbench shows:

- Victory profile (three dimensions)  
- Deployment priority & status (green / yellow / red)  
- County needs (deterministic inference)  
- Mission stack (long → monthly → weekly → daily)  
- Tactics / calendar rows linked to missions  

---

## County mission hierarchy

Continuity from June through Election Day. Every county maintains **four horizons**:

| Horizon | Question | Example |
|---------|----------|---------|
| **Long-term mission** | Election Day goal | Increase turnout by 3% vs baseline |
| **Monthly mission** | This month’s objective | Recruit volunteer leadership |
| **Weekly mission** | Immediate action | Staff county fair |
| **Daily tasks** | Execution | Call chair · order literature · confirm booth |

```text
Long-term (Nov 3 outcome)
    ↓
Monthly (season objective)
    ↓
Weekly (Decision Generator output)
    ↓
Daily tasks (field execution)
    ↓
Calendar tactics (timestamped rows)
```

Types: `CountyMissionHorizon` in `src/lib/victory-os/types.ts`

---

## Resource allocation — Kelly tiers

| Tier | Label | Who |
|------|-------|-----|
| **1** | Kelly required | Debate, editorial board, major fundraiser, flagship fair in Critical county |
| **2** | Kelly preferred | Chamber, rotary, community festival — if capacity |
| **3** | Volunteer can cover | Booth, county meeting, community event |
| **4** | Decline | Low impact, ceremonial, no strategic value |

Tier comes from **decision engine** (Layer 0 × readiness × season), not event title alone.

October (Turnout Season): auto-suggest Tier 4 for low deployment-priority tactics. Critical + weak readiness may still produce Tier 1 infrastructure decisions **without** Kelly.

---

## Campaign seasons (June 10 → Election Day)

Seasons change **decision rules** and **success measures**, not Layer 0 dimensions.

| Season | Window | Mode | Primary measure |
|--------|--------|------|-----------------|
| **1** | Jun 10 – Jul 4 | Build organization | County chairs · captains · event inventory |
| **2** | Jul 5 – Aug 31 | Build familiarity | Counties visited · contacts · volunteers recruited |
| **3** | September | Build confidence | Debate reach · media reach · persuasion contacts |
| **4** | October | Build turnout | Vote commitments · early votes · volunteer shifts |
| **5** | Final 14 days | Build urgency | Daily turnout progress · county gaps · deployment |
| **ED** | Nov 3 | Execute | Votes — **Election Operations Center**, not calendar |

Data: `data/strategy-doctrine/victory-os-seasons-v1.json`

Decision Generator cadence:

- Seasons 1–4: **Weekly** (Monday)  
- Season 5: **Daily**  
- Election Day: **Operations Center** — calendar ends midnight prior  

---

## Election Day — Arkansas Election Operations Center

**Separate surface** — not a calendar.

County cards: Goal · Actual · Gap · Status  

Side panels: poll issues · volunteer deployment · legal escalation · transportation · media · rapid response  

Goals from win-target scenario until live turnout feed connects (labeled advisory).

**Route (Sprint 7+):** `/admin/election-day`

---

## Four operating tracks (cross-cutting)

Every tactic may contribute to one or more tracks. Tracks inform **expected outcome** on decisions, not Layer 0 ranking.

| Track | Question |
|-------|----------|
| Visibility | How many Arkansans saw Kelly or the campaign? |
| Volunteer infrastructure | Did we increase capacity? |
| Voter contact | How many voters moved toward voting? |
| Fundraising | Did we increase resources? |

Media is a **modifier** on visibility and voter contact in Season 3+.

---

## Relationship to existing Campaign OS

| Existing asset | Role in Victory OS |
|----------------|-------------------|
| `CampaignEventLedgerRecord` / calendar views | Tactic storage + execution |
| Kelly cockpit | Mobile decision approval |
| `kelly-win-target-scenario-v1.json` | Layer 0 vote math |
| `county-workbench-adapter` | Layer 3 readiness inputs |
| `county-priority-snapshot.json` | Legacy priority — superseded by Victory Map for ranking |
| Intelligence morning brief | **Parallel** — debate/opposition; link, do not merge |
| `MASTER_CAMPAIGN_OS_ROADMAP.md` | Travel/reimbursement/ledger sprints — orthogonal rails |

---

## Build sprints (doctrine order)

| Sprint | Name | Deliverable |
|--------|------|-------------|
| **0** | Victory Map | 75 county profiles · three dimensions · baseline vote math · leadership lock workflow |
| **1** | Decision Engine | `generate-weekly-decisions.ts` · Top 10 · snapshot JSON · `npm run victory:decisions` |
| **2** | County mission framework | Long / monthly / weekly / daily types · persistence · link to decisions |
| **3** | Mission Brief UI | `/admin/mission-brief` · decision-first layout · nav default |
| **4** | Victory Board | Maps · charts · displays intelligence from decisions — not raw data |
| **5+** | Tactic linkage · Season 5 daily · Election Day ops center | Calendar as byproduct |

**Do not build Victory Board, choropleth, or calendar redesign before Sprints 0–1.**

---

## Leadership lock checklist (Sprint 0 gate)

Before Decision Engine runs in production:

1. [ ] Critical counties list confirmed (electoral importance)  
2. [ ] All 75 counties reviewed — at least draft classification  
3. [ ] Statewide scenario selected (low / mid / high turnout)  
4. [ ] Kelly Tier 1 weekly capacity set (max candidate days per week)  
5. [ ] Early voting dates confirmed for countdown (counsel / SOS calendar)  
6. [ ] CM signs `victory-map-v1.json` → `classificationStatus: leadership_locked`  

---

## Agent guardrails

- Recommend only — no auto-send, auto-schedule, auto-publish  
- No voter PII in briefs or public surfaces  
- Win-target and gap numbers labeled **planning scenario — not forecast**  
- Opponent claims remain governed by intelligence citation rules  

---

## Document history

| Date | Change |
|------|--------|
| 2026-06-09 | Doctrine locked: Layer 0 three dimensions · Decision Generator · mission hierarchy · sprint order |
