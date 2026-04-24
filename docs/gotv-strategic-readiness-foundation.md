# GOTV strategic readiness foundation (planning blueprint)

**Purpose:** Describe how a **full statewide Arkansas GOTV** program could align with RedDirt’s **read models and geography** over time. This is **doctrine and sequencing**, not a product build.

**Out of scope for this doc:** GOTV UI, schedulers, precinct assignment engines, automated turnout math, volunteer-facing flows, comms automation.

**Companion:** [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md) (DATA-4 + ELECTION-INGEST-1).

---

## 1. NORTH STAR

The future GOTV system is **statewide**, **human-led**, and **time-phased**:

- **Statewide events** — `CampaignEvent` and field rails support distributed visibility and training; counties anchor local execution.
- **Two-week push** — sustained activation: registration checks, relational follow-through, visible presence.
- **96-hour push** — final week intensity: confirm plans, fill gaps, escalate uncovered areas.
- **48-hour push** — last miles: calm, concrete instructions, people-first contact.
- **Election Day / same-day operations** — polls open to close: help, visibility, reporting, **no** panic messaging.
- **Every precinct covered where possible** — aspiration tied to **lists**, **assignments**, and honest **gaps** (not fake 100% coverage in data).
- **Signs, visibility, volunteers, relational outreach** — complementary tactics; training builds habit before crunch time.

The **operating system** stores **who**, **where**, and **what was officially reported**—not invented vote propensities.

---

## 2. REQUIRED DATA INPUTS

| Asset | Use in GOTV planning (honest) |
|-------|-------------------------------|
| **`ElectionResultSource` + tabulation children** | Historical **reported** margins and turnout-style fields at county / sub-location grains; **not** individual votes. |
| **`County`** | Canonical geography for goals, dashboards, and rollups. |
| **`VoterRecord`** | Registration universe; **optional** `precinct` string—**not** normalized to SOS precinct ids yet. |
| **`CountyCampaignStats.registrationGoal`** | Campaign **authoritative** registration target (GOALS-VERIFY-1). |
| **`CountyVoterMetrics`** | Snapshot rollups for progress narratives (derived, not a second opinion on goals). |
| **`FieldUnit` / `FieldAssignment`** | Operational geography and staffing (may not FK to `County`; GEO/FIELD packets close gaps). |
| **`CampaignEvent`** | Scheduled training and visibility; backbone for “events all over Arkansas.” |
| **`VolunteerProfile`** | Who can be assigned and trained; no XP/GOTV automation in this foundation. |
| **Future `RelationalContact` (REL-2)** | Named relational universes for Power of 5–style work. |
| **Future precinct normalization (PRECINCT-1)** | Stable precinct ids and crosswalks to voter file strings and SOS location keys. |

---

## 3. GOTV PHASES

| Phase | Intent |
|-------|--------|
| **Build** | County captains, field units, event cadence, data hygiene (goals, voter file snapshots, election ingest refreshed after elections). |
| **Training** | Power of 5, registration checking, event staffing, visibility, escalation—**before** crunch windows. |
| **Two-week push** | Scale touches and visibility; track open work and human-reported gaps (not auto-routing). |
| **96-hour push** | Tighten assignments; prioritize uncovered precincts **as identified by people + lists**. |
| **48-hour push** | Final confirmations; calm, repeatable scripts; reduce cognitive load for volunteers. |
| **Election Day** | Same-day registration awareness where lawful, poll visibility, incident escalation paths, dignity-first comms. |

---

## 4. PRECINCT COVERAGE MODEL (EVENTUAL)

A mature precinct model needs:

- **Precinct list** — authoritative or campaign-maintained; today voter file has **strings** only.
- **Precinct turnout history** — from **`ElectionPrecinctResult`** / related rows **when** SOS keys and ingest align; **no** guarantee yet that JSON location ids match voter file labels.
- **Sign-holding coverage** — human assignments + maps; future **FIELD-2** may tie seats/units to counties/precincts.
- **Volunteer assignments** — `FieldAssignment` and relational networks (REL-2) as persistence lands.
- **Escalation if uncovered** — operational playbooks (county captain → state ops); product may surface **gaps** later without automating staffing.

**Honest limits today:** Precinct strings exist on **`VoterRecord`**; election ingest stores **raw** precinct/location names and ids. **Do not** assume cross-file precinct equality without PRECINCT-1.

---

## 5. TRAINING TOWARD GOTV

Volunteers should grow capability over cycles:

- **Power of 5** — relational depth beats raw blast volume.
- **Voter registration checking** — point to **official** tools; campaign assists within policy (see voter registration center patterns).
- **Event staffing** — arrivals, roles, safety, accessibility.
- **Visibility / sign holding** — lawful placement, tone, de-escalation.
- **Escalation and reporting** — when to pull in staff; incident channels.
- **Calm, people-first communication** — especially under time pressure (96h / 48h / ED).

---

## 6. WHAT IS NOT BUILT YET

- **GOTV scheduler** or calendar automation tied to phases.
- **Precinct assignment engine** or optimization.
- **Election Day ops UI** or real-time turnout dashboards.
- **Automated turnout math** or modeled “who will vote.”
- **REL-2** relational contact persistence.
- **Normalized precinct master** and crosswalk.

---

## 7. NEXT PACKETS (RECOMMENDED)

1. **PRECINCT-1** — Precinct normalization / crosswalk design + honest migration strategy.
2. **GOTV-1** — Phase plan as **read model** + doc (still no heavy UI if scoped tight).
3. **FIELD-2** — County/precinct staffing patterns; optional `FieldUnit`↔`County` alignment (see GEO-2).
4. **REL-2** — Persist relational contacts + owner FK + governed voter match.
5. **GOALS-BREAKDOWN-1** — County goals → field/ volunteer decomposition without fake precision.

---

## Drift check (this packet)

- **Stayed** read-model / ingest-first for election data.
- **No** GOTV automation, turnout models, volunteer product UI, comms sends, or fake precinct normalization.

---

*GOTV strategic readiness foundation — doc only; Last updated: 2026-04-23.*
