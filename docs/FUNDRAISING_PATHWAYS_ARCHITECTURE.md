# Fundraising Pathways Architecture

> **Status:** Planning inventory only — **do not implement** until PPEN A.0b/A.0c, Leadership Workbench gates, Fundraising Opportunity Architecture, and this registry are locked.  
> **Registry:** `data/campaign-brain/fundraising-pathways-registry.source.json`  
> **Parent systems:** [Fundraising Operating System](./FUNDRAISING_OPERATING_SYSTEM_ARCHITECTURE.md) (FOS) · [Fundraising Opportunity Architecture](./FUNDRAISING_OPPORTUNITY_ARCHITECTURE.md) (FOP)  
> **Lane:** RedDirt / election-plan / campaign-brain only

---

## What this layer solves

| System | Question |
|--------|----------|
| **FOS** | **How much?** — vote-target dollar allocation |
| **Fundraising Opportunity Architecture** | **How do we get there?** — executable opportunities with owners |
| **Fundraising Pathways Architecture (this doc)** | **Who participates how?** — self-select intake → routing → records |
| **Donation Record Layer (later)** | **What actually came in?** — compliance-backed receipts |

FOS without opportunities is a number on a card. Opportunities without pathways is a pipeline with no people entering it. Pathways connect **participants** to **lanes** without inventing raised totals or donor counts.

---

## Four-layer stack (locked sequence)

```text
Election Math          →  Votes    (VCI · chapter-05 · numeric targets)
Fundraising OS (FOS)   →  Dollars  (vote-target allocation)
Opportunity Pipeline   →  Execution (meetings · events · house parties · sponsors)
Pathways (this doc)    →  People   (self-select · intake · training · placement)
        ↓
Leadership Workbenches + Donation Records
```

A county or community leader still answers from one workbench:

```text
How many votes?
How many people?
How many dollars?
```

Pathways answer: *How does a new volunteer become a house party host, business connector, campus fundraiser, or peer asker — with honest records at every step?*

---

## A.0c integration — where pathways enter

Base A.0c (see [`PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md`](./PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md)) ends at:

```text
Volunteer signup → activation → Person + Participation (county) → L1 → My Journey
```

**Fundraising pathways extend A.0c** — they do not replace it. After county assignment (required) and optional community/coalition assignment, the participant may self-select one or more fundraising pathways.

```text
A.0c base activation (Person · county Participation · L1)
        ↓
Fundraising interest gate (optional but prompted on My Journey + intake follow-up)
        ↓
Pathway self-select (1 primary + optional secondary)
        ↓
Pathway-specific intake questions
        ↓
Routing decision
        ├─ Participation record(s)     — L1 pathway tag
        ├─ Leadership candidate queue  — A.0 review when lead-capacity indicated
        └─ Workbench deep link         — section anchor on community/county/coalition/campus surface
        ↓
Required training checklist (before elevated actions)
        ↓
Program lead / county fundraising lead notification (future — not auto-promote)
```

**Hard rules:**

- Pathway self-select **never** grants L2+ automatically.
- Pathway self-select **never** creates fake KPI increments — only `Participation`, `FundraisingPathwayEnrollment` (preview), or leadership-candidate staging rows.
- Donor-only paths (recurring sustainer via donate page) stay **outside** volunteer activation — documented as parallel lane in registry.
- No Prisma, UI, donation processing, or forecasting in this pass.

---

## Routing outcomes (three destinations)

Every pathway resolves to one or more of:

| Destination | When | Record preview |
|-------------|------|----------------|
| **Participation record** | Default for all pathway enrollments | `ppen_participation.context=fundraising_pathway`, `pathwayKey`, `status=interested\|active` |
| **Leadership candidate list** | Self-assessment + intake signals lead capacity | A.0 staging — `leadership_opportunity_interest.roleKey` pending staff review |
| **Connected workbench** | Geographic or program surface for execution | Deep link to community `#fundraising`, county `#fundraising-pipeline`, coalition lane, campus workbench, or future Fundraising Leadership Workbench |

**Anti-pattern:** Self-select "House Party Host" → immediately counted as `active_hosts` KPI.  
**Target pattern:** Self-select → enrollment record → training complete → host opportunity record created by program lead → then KPI.

---

## Pathway inventory (10 lanes)

Full field detail: **registry JSON** (`pathways[]`).

| # | Pathway | Primary audience | Maps to opportunity type |
|---|---------|------------------|--------------------------|
| 1 | House Party Host | Neighbors willing to open their home | `house_party_program` |
| 2 | Fundraising Committee Member | Event committee volunteers | `grassroots_events` |
| 3 | Business Outreach | Connectors to Main Street / local business | `business_outreach` |
| 4 | Major Donor Introductions | Validators who open doors (not closers) | `major_donor_meetings` |
| 5 | Campus Grassroots Fundraising Team | Students / campus organizers | `campus_fundraising` |
| 6 | Online Fundraising Team | Comms volunteers — email/social CTAs | `online_fundraising` |
| 7 | Recurring Donor Program | Sustainer recruiters (volunteer lane) | `recurring_donor_program` |
| 8 | Event Sponsor Recruitment | Business sponsors for forums/events | `event_sponsorships` |
| 9 | Coalition Fundraising | Coalition-aligned fundraisers | `coalition_fundraising` |
| 10 | Small-Dollar Peer Fundraising | Friend-to-friend / neighbor asks | `small_dollar_program` |

---

## Shared pathway schema

Every pathway in the registry defines:

| Field | Purpose |
|-------|---------|
| **Who it is for** | Audience, capacity, geography constraints |
| **Intake questions** | A.0c extension form fields (staging until UI) |
| **Required training** | Modules before elevated actions (`ppen_training_completion`) |
| **Access level** | Starting L1; escalation thresholds |
| **Connected workbench** | Route + section anchor |
| **KPIs** | Participant-visible progress — record-backed only |
| **Participation records created** | PPEN preview objects |
| **Leadership escalation path** | When flagged → who reviews → target role |
| **Rollup logic** | community → county → cluster → state (or statewide / coalition-isolated rules) |

---

## Access levels (pathway defaults)

| Level | Typical pathway participant |
|-------|----------------------------|
| **L1 Participant** | All pathways at enrollment — host interest, peer asker, committee member |
| **L2 Leader** | After A.0 placement — house party lead, business lead, campus lead, etc. |
| **L3 County** | County Fundraising Lead sees aggregated pathway enrollments + escalations |
| **L5 State** | State Fundraising Director — statewide lanes (online, recurring, major donor program) |

Pathway enrollment at L1 may include `elevatedActionBlockedUntilTraining: true`.

---

## Rollup logic (pathways vs opportunities vs FOS)

Three rollups stay distinct:

```text
FOS rollups              — dollars allocated by vote target (base · stretch · gap)
Opportunity rollups      — pipeline counts (scheduled · held · meetings)
Pathway enrollment rollups — people interested · trained · active in lane
```

| Geography | Pathway enrollment rollup |
|-----------|---------------------------|
| **Community** | Count `Participation` where `communitySlug` matches and `pathwayKey` set |
| **County** | Sum community enrollments in county + county-level pathway participants |
| **Cluster** | Sum counties in cluster execution group |
| **State** | Sum non-isolated communities; **online / recurring volunteer recruitment** may be statewide bucket |
| **Coalition** | Roll within coalition workbench — do not double-count in county totals |
| **Campus** | Attribute to campus workbench slug → campus county for FOS context only |
| **Bonus cities (#41+)** | Isolated — same as FOS Quitman rule |

**Hard rule:** Enrollment count ≠ opportunity held count ≠ dollars raised. Never merge the three in one KPI bar.

---

## Leadership escalation (shared pattern)

```text
Participant self-selects pathway
        ↓
Intake suggests lead capacity? ──no──→ L1 enrollment only
        │
       yes
        ↓
Leadership candidate queue (A.0)
        ↓
Community / county / program lead review
        ↓
Placement → Participation roleKey upgrade + L2 grant
        ↓
Fundraising Leadership Workbench (future) or Community Leadership slot
        ↓
Escalation to County Fundraising Lead if slot OPEN > 14 days
```

Program-specific escalation targets are in the registry per pathway (`leadershipEscalationPath`).

---

## Relationship to Leadership Workbenches

| Leadership workbench | Pathways that feed it |
|---------------------|----------------------|
| **Community Leadership** | Business outreach, peer fundraising, house party hosts (community-scoped) |
| **Event Leadership** | Fundraising committee member |
| **Coalition Leadership** | Coalition fundraising |
| **Communications Leadership** | Online fundraising team |
| **Fundraising Leadership (future)** | All program leads — county fundraising lead rollup |

Cross-reference: `leadership-workbench-registry.source.json` · `fundraising-opportunity-registry.source.json` → `leadershipWorkbenchLink`.

---

## Relationship to My Journey

After A.0c, My Journey gains a **Fundraising** section (planning only):

```text
Your pathways (enrolled)
Training due
Next step (deep link to workbench)
Connect with your program lead (when assigned — else OPEN)
```

Empty state: *"No fundraising pathway selected — browse lanes"* — not fake progress.

---

## Data integrity (non-negotiable)

- No fake donor or raised totals on pathway surfaces.
- No forecasting or projected revenue from enrollment counts.
- KPIs on pathway cards show **enrollment · training complete · active in lane** — not dollars until donation layer.
- Click enrollment count → list of Person / Participation rows.
- House party hosts ≠ event committee chairs ≠ business validators — separate pathway keys.

---

## Build sequencing

```text
1. Sherwood + Jacksonville pilot smoke
2. PPEN A.0b          Person + Participation + L1–L6
3. PPEN A.0c          Intake → activation → My Journey
4. A.0                Leadership opportunities + candidate review
5. Leadership Workbenches (role shells)
6. Fundraising Opportunity Architecture (FOP planning lock) ✓
7. Fundraising Pathways Architecture (this doc) ✓ planning lock
8. FOP-1 runtime      Opportunity records
9. Pathways UI        A.0c extension + My Journey fundraising section
10. Fundraising Leadership Workbenches
11. Donation Record Layer
```

**Do not build** pathway UI before A.0c Person/Participation exists. **Do not build** pathway UI before opportunity record model is specified — routing targets must be stable.

---

## Phase map

| Phase | Scope | Build? |
|-------|-------|--------|
| **FPA-plan** | This doc + registry | **Now (planning lock)** |
| **FPA-1** | A.0c pathway self-select + enrollment records | After A.0c |
| **FPA-2** | Training gates + program lead notifications | After FOP-1 |
| **FPA-3** | Leadership candidate automation + county rollup panels | After Leadership Workbenches |

---

## Related docs

- `docs/FUNDRAISING_OPERATING_SYSTEM_ARCHITECTURE.md`  
- `docs/FUNDRAISING_OPPORTUNITY_ARCHITECTURE.md`  
- `docs/LEADERSHIP_WORKBENCH_ARCHITECTURE.md`  
- `docs/PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md`  
- `docs/PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md`  
- `docs/ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`  
- `data/campaign-brain/fundraising-operating-system.source.json`  
- `data/campaign-brain/fundraising-opportunity-registry.source.json`  
- `data/campaign-brain/fundraising-pathways-registry.source.json`  
- `data/campaign-brain/leadership-workbench-registry.source.json`
