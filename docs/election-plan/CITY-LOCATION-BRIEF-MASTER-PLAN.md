# City & County Location Brief — Master Plan

**Project:** Replace Top 10 / Top 40 split with one priority city list and full drill-down location pages.  
**Owner:** Campaign leadership + field ops (content); engineering (structure).  
**Source of truth for narratives:** `data/campaign-brain/city-location-briefs.source.json`

## Goal

Each **city** opens a full location page with narrative brief-board copy (not bullet lists on the landing board):

- What is going on here
- How we penetrate
- What we are trying to accomplish
- Messaging in this location
- Kelly talking points
- House party goals
- Volunteer goals
- Registration goals

Each **county** in the election plan drills down to the **full county workbench** (sister app dashboard when configured, else RedDirt admin bridge).

## Routes

| Route | Purpose |
|-------|---------|
| `/election-plan?tab=cities` | Priority cities tab in workbench |
| `/election-plan/cities` | Standalone priority cities hub |
| `/election-plan/cities/[slug]` | City location brief |
| `/election-plan/locations/master-plan` | This plan in the app |

## Phases

### Phase 0 — Structure ✅

- Unified Priority Cities tab (replaces Top 10 + Top 40 tabs)
- City list links to location brief pages
- County cards link to county workbench
- Scaffold narratives for all 40 cities from snapshot

### Phase 1 — City narrative content ✅ (draft complete)

1. ~~Review drafts: Little Rock, Sherwood, Fayetteville~~
2. ~~Write remaining 37 cities in `city-location-briefs.source.json`~~
3. Move each city through: `scaffold` → `draft` → `review` → `approved` — **all 40 at `draft`**

**Content fields per city:**

| Field | Purpose |
|-------|---------|
| `briefBoard` | Landing brief board — leadership reads first |
| `situation` | What is going on here |
| `penetration` | How we penetrate |
| `accomplishment` | What we are trying to accomplish |
| `messaging` | Localized message frame |
| `kellyTalkingPoints` | Kelly-ready quotes |
| `housePartyGoals` | Host / house party narrative |
| `volunteerGoals` | Captains and volunteer depth |
| `registrationGoals` | Registration contribution |

### Phase 2 — County workbench integration ✅

- Expanded county KPIs on in-app playbook entry (VCI, coverage %, registration, Lane 2, GOP conversion, guardrail, field stop count)
- Bidirectional links: field calendar ↔ county playbook ↔ city location briefs
- County strike team panel (captain + roles from `county-strike-teams.json`) on county and city pages
- Priority cities listed on each county playbook with brief links

### Phase 3 — Numeric targets from LANE budget ✅

- `city-location-numeric-targets.source.json` — locked targets for all 40 cities
- Registration allocated from chapter-05 county `registrationGoal` by priority-city vote share
- House party / volunteer math from Power of 5; Sherwood overrides from `win-sherwood-operation.json`
- **Locked numeric targets** panel on city briefs; registration allocation table on county playbooks

### Phase 4 — Calendar & week plan binding

- Next locked visit and revisit flags on city pages
- Event approvals portal linked per location
- Week plan roll-up from brief completion status

## How to add a city brief

1. Open `data/campaign-brain/city-location-briefs.source.json`
2. Add or edit entry under `briefs` keyed by city slug (see `election-plan-workbench.snapshot.json` → `cities[].slug`)
3. Set `"status": "draft"` when narrative is ready for review
4. Verify at `/election-plan/cities/[slug]`

## Definition of done

- All 40 cities at `draft` or `approved`
- County cards open workbench for all 75 counties
- Phase 3 numeric targets populated for all 40 priority cities
- Week plan and calendar show location links (Phase 4)
