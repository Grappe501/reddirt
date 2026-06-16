# Coalition Command → Community Workbench Migration

**Status:** Structural doctrine · **Lane:** `RedDirt/` · **Audience:** Burt, coalition leads  
**Updated:** 2026-06-16  
**Related:** [`ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md), [`COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`](./COMMUNITY_WORKBENCH_PPEN_ROADMAP.md)

---

## Problem

**Coalition Command** today is a war-room dashboard:

```text
Coalition Command Center
├── NAACP card (contacted / meetings — snapshot zeros)
├── Labor card
├── Hispanic card (framework status text)
├── Muslim card
└── …
```

Those are **cards and KPIs**, not operating systems. They violate [data integrity doctrine](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md): numbers without openable records.

---

## Target architecture

Coalition Command becomes a **hub** into first-class **Coalition Workbenches** — same OS as Sherwood, Jacksonville, Bentonville:

```text
Coalition Command (hub)
├── African American Outreach Workbench
├── Hispanic Outreach Workbench
├── Faith Communities Workbench
├── Muslim Community Workbench
├── Women's Leadership Workbench
├── Labor Workbench
├── Veterans Workbench
├── Youth Engagement Workbench
├── Disability Community Workbench
├── Rural Arkansas Workbench
├── Small Business Workbench
└── Educators Workbench
```

Registry: `data/campaign-brain/coalition-workbenches.registry.source.json`

---

## One engine, five workbench kinds

| Kind | Example |
|------|---------|
| **City** | Sherwood, Jacksonville |
| **County** | County hub (future) |
| **Coalition** | Hispanic Outreach |
| **Campus** | UCA Campus |
| **Program** | Election Integrity, Direct Democracy |

Same shell:

```text
Overview · Community leadership · Events · Committees · Relationships
Record counts · Community goals (planning) · Field log · Intel · Notes
```

PPEN layers (when pilot gate clears):

```text
My Five · My Ten · Volunteer pathways · Onboarding · Training · Documents
```

**Different content. Same engine.**

### PPEN A.0b — same operating template as County v4

Each coalition workbench inherits the unified template (see [`ELECTION_PLAN_OPERATING_SYSTEM_DOCTRINE.md`](./ELECTION_PLAN_OPERATING_SYSTEM_DOCTRINE.md)):

```text
Leadership · Open Positions · Interested Candidates · Volunteer Pipeline
Training · Events · Relationships · Communications · My Five · Help 10 Participate
```

Coalition workbenches become **collections of people** — not coalition KPI cards.

---

Build **framework slots** local leaders fill — not assumptions about every member of a community.

| Coalition | Framework examples (slots) |
|-----------|----------------------------|
| Hispanic | Community leaders, church, family networks, soccer leagues, festivals; pathways in natural Arkansas Spanish where leads choose |
| Muslim | Community leadership, faith leaders, **women's leadership** (visible section), youth, community service |
| African American | Faith, NAACP, Greek life, HBCU, civic orgs, business, youth |
| Youth | Campus leaders, peer recruitment, civic challenges, content creation |
| Veterans | VFW, American Legion, story corps |
| Labor | Union relationships, worksite captains, worker story corps |

Rule: **sections and pathways are optional containers** — coalition leads define names, relationships, and language inside them.

---

## Events are not communities (still applies)

Coalition **community leadership** (workbench roles) ≠ event chair / hosts / committee on a specific event.

Example: Grassroots & Guitar Strings leadership lives on the **Sherwood event**, not on Hispanic Outreach workbench.

---

## Migration phases (Burt)

### Phase 1 — Structural (in progress)

- [x] `coalition` kind in Prisma enum
- [x] Coalition registry JSON (12 workbenches)
- [x] Registry sync via `buildCommunityWorkbenchRegistry()`
- [x] Coalition Command tab → workbench hub links (deprecate KPI cards)
- [x] Workbench hub `coalition` filter
- [ ] Sherwood/Jacksonville pilot smoke still gates PPEN features

### Phase 2 — Cultural profiles in shell

- [x] Load profile per coalition slug (intel section labels, pathway framework)
- [ ] Localized volunteer pathway UI (EN / ES where `labelEs` set)
- [ ] Intel pages pre-seeded from profile section keys (empty until lead fills)

### Phase 3 — Record-backed coalition metrics

- Endorsement / NAACP / labor counts only from **relationship + field entry records**
- Remove `coalitionPowerMap` snapshot cards from primary UI
- Drill-down on every count ([data integrity](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md))

### Phase 4 — PPEN on coalition workbenches

- My Five / My Ten per participant
- Volunteer activation workflow
- Access levels L1–L6 + audit log

---

## Coalition Command becomes

```text
Coalition Command
├── 40 Cities          → city workbenches
├── 75 Counties        → county playbooks / hubs
├── 12 Coalition       → coalition workbenches
├── Campus             → campus workbenches
└── Program            → election integrity, DD, fairs, …
```

Entry points:

- War Room tab: **Coalition Command** → hub grid
- `/election-plan/workbenches?kind=coalition`
- `/election-plan/workbenches/{slug}` per coalition

---

## What this is not

- **Not a content pass** — do not paste generic outreach copy into workbenches
- **Not a KPI dashboard pass** — no coalition cards with assumed totals
- **Not PPEN yet** — My Five / activation wait on pilot gate unless explicitly approved

---

## Files

| File | Role |
|------|------|
| `data/campaign-brain/coalition-workbenches.registry.source.json` | 12 coalition workbench definitions |
| `src/lib/election-plan/community-workbench/load-coalition-workbench-profile.ts` | Profile loader |
| `src/lib/election-plan/community-workbench/build-registry.ts` | Merges coalition into DB sync |
| `src/components/election-plan/WarRoomPanels.tsx` | `CoalitionCommandPanel` → hub |
| `docs/ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md` | Record-backed counts rule |
