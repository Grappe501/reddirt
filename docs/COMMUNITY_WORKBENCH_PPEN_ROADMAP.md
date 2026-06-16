# People Power Execution Network (PPEN) — Roadmap

**Status:** Planning · **Gate:** Sherwood + Jacksonville live pilot complete (v1.3) before Phase A.0 code  
**Updated:** 2026-06-16 (My Five + Help 10 Participate doctrine)  
**Related:** Community Workbench OS v1–v1.3 (`3436c531`), [`COMMUNITY_WORKBENCH_PILOT_OPERATOR_RUNBOOK.md`](./COMMUNITY_WORKBENCH_PILOT_OPERATOR_RUNBOOK.md)

---

## Two different things

| | Community Workbench OS | PPEN |
|--|------------------------|------|
| **What** | Container — workbenches, events, committees, field log, pilot proof | Movement machinery inside the container |
| **State** | Structurally real | Mostly empty counters and doctrine |
| **Wrong fix** | More dashboards | Execution systems |

The headline zeros (0/500 leaders, 0/60,000 network, 0/150 house parties, etc.) are **execution-system problems**, not KPI display problems.

---

## Core doctrine — two engines, three journeys

### Power of 5 is not a role

**Wrong:** Power of 5 Lead on the org chart → special class of recruiters.

**Correct:** Power of 5 = **core operating doctrine**. Everyone participates. Nobody graduates from recruitment.

### My Five (mandatory) vs Help 10 Participate (civic mission)

**Related but different.** Do not merge them.

| | **Network Growth Journey** | **Civic Engagement Journey** |
|--|---------------------------|------------------------------|
| **Object** | **My Five** (mandatory for every participant) | **My Ten** — civic service mission |
| **Question** | Who am I building relationships with? | Who am I helping participate? |
| **Goal** | **5 / 5 active relationships** | **10 people helped** |
| **Nature** | Movement growth | Civic participation |
| **Language** | My Five · Network Growth | **Help 10 People Participate** — not “Register 10 Voters” |

Some people overlap between the two lists. Many won't. That distinction matters for reporting, HCI, and compliance later.

**Avoid:** Register 10 Voters · voter registration as transactional metric  
**Use:** Help 10 People Participate · 10 People Helped

Civic workflow can include: registration verification · polling location · election reminders · vote planning · absentee info where appropriate · election-day assistance information.

### First-class PPEN objects

Elevate beside Leadership Journey:

1. **My Five** — network growth (mandatory)  
2. **My Ten** — civic engagement (Help 10 Participate mission)  
3. **Leadership Journey** — optional specialization  

These three systems are the backbone of how every participant engages — volunteer, county leader, or executive.

---

## My Five — Network Growth Journey

**Every participant.** Mandatory.

| Field | Purpose |
|-------|---------|
| Name | |
| Phone | |
| Email | |
| Relationship | How you know them |
| Interest | |
| Last contact | |
| Next step | |

**Goal:** `5 / 5 Active Relationships`

**First mission on join:** five people **not** already in the network — new people, not the usual suspects.

### Multiplication

```text
Steve
├── Person A → (when A joins) A's Five
├── Person B … E
```

---

## My Ten — Civic Engagement Journey

**Every participant.** Civic service mission (not a replacement for My Five).

| Field | Purpose |
|-------|---------|
| Name | |
| Phone | |
| Email | |
| Address | |
| Registration status | |
| Verification status | |
| Vote plan status | |
| Requested assistance | |

**Goal:** `10 People Helped` (assisted toward participation)

---

## My Journey — three parallel tracks

```text
Every participant
├── Leadership Journey          (optional — Volunteer → Team Member → Captain → County Leadership)
├── Network Growth Journey      (universal — My Five, referrals, network expansion)
└── Civic Engagement Journey    (universal mission — Help 10 Participate, reg verify, vote plan, election info)
```

Do **not** conflate leadership ladder with growth or civic tracks.

---

## Every dashboard shows both engines

**Network Growth**

```text
My Five           3 / 5
People Joined     2
Network Expansion 7
```

**Civic Engagement**

```text
People Assisted           6 / 10
Registration Verified     4
Vote Plans Completed      3
Election Information Sent 5
```

Same widgets for volunteer, county chair, regional, state, executive.

---

## Workbench readiness — two movement engines

**Current (v1):** Leadership · Events · Relationships · Data · Organization  

**Future (PPEN):**

```text
Leadership         70%
Events             80%
Relationships      65%
Network Growth     42%   ← My Five completion / active relationships
Civic Engagement   38%   ← Help 10 progress / verified participation assists
Organization       55%
Overall            64%
```

The movement now has **two engines:** Growth and Participation.

---

## PPEN navigation (target)

```text
People Power Network
├── Leadership Opportunities
├── Join a Team
├── My Journey                 (3 tracks)
├── My Five                    (mandatory — every user)
├── Help 10 Participate        (My Ten — civic mission)
├── Training
├── Certifications
├── Community Captains
└── Leadership Directory
```

**Language:** Join a Team · Leadership Opportunities · My Five · **Help 10 People Participate** · Get Involved  

**Avoid:** Apply · Application · Job Posting · Power of 5 Leader · Register 10 Voters

---

## Phase A.0 — Leadership Opportunity & Onboarding Engine

**Front door** — how interested citizens enter specialized leadership paths.

```text
Citizen → discovers opportunity → self-assessment → pipeline → review →
onboarding → training → certification → access → promotion (Leadership Journey)
```

### A.0 build list

1. Leadership Opportunity Registry (per workbench/county)  
2. County recruitment timelines (visit / immersion calendar)  
3. Auto open/close (e.g. recruiting closes 6 weeks before county arrival)  
4. Self-assessment pathway wizard  
5. Participant pipeline: Prospect → … → Active  
6. Training + certification status  
7. Role assignment from certified pool  
8. County leadership templates (**no Po5 Lead slot**)  
9. Leadership ladder (specialization only)  

---

## Phase A.0b — Identity, Access, and Journey System

**Foundation before HCI, captains, and accountability.** Build alongside or immediately after A.0.

The platform must answer for every person:

```text
Who is this person?
What role do they hold?
What training have they completed?
What workbench can they see?
What county are they assigned to?
What committees do they belong to?
What is their My Five status?
What is their My Ten status?
```

### A.0b build list

1. Participant identity record (linked to operator account when applicable)  
2. Access levels L1–L6 (Volunteer → Executive)  
3. Workbench + county assignment scoping  
4. Committee membership links  
5. Journey state store (Leadership / Network Growth / Civic Engagement tracks)  
6. My Five + My Ten placeholders (status summary on profile)  
7. **My Journey** page shell (three tracks)  
8. Permission gates for Election Plan / workbench sections  

Today: operator whitelist + `field_entry` only. A.0b replaces ad-hoc assumptions.

---

## Phase A.1 — Network Growth Engine

After A.0 / A.0b. **My Five mandatory for every account.**

- Full My Five CRUD (7 fields)  
- Status pipeline: identified → contacted → interested → joined → active  
- Multiplication graph (5 → 25 → 125 visualization)  
- Workbench + county rollups for Network Growth readiness  
- Dashboard widget (universal)  

---

## Phase A.1b — Civic Engagement Engine

After A.0b identity exists. **Separate from A.1.**

- **My Ten** / Help 10 Participate workflow  
- Registration verification · vote plan · election info tracking  
- `10 People Helped` metric  
- Civic Engagement readiness dimension  
- Dashboard widget (universal)  
- **No transactional “register 10 voters” framing**  

---

## Phase A.2 — HCI Engine

Rewards **both** engines:

| Action | Points (example) |
|--------|------------------|
| Joined | 5 |
| Attended event | 10 |
| Volunteer shift | 15 |
| My Five complete (5/5 active relationships) | 25 |
| One of My Five joined | 50 |
| One of My Five recruited their Five | 100 |
| One person assisted toward participation (My Ten) | 15 |
| Registration verified (My Ten) | 20 |
| Vote plan completed (My Ten) | 25 |

Individual civic profile · community growth + participation charts.

---

## Phase B–D (unchanged scope)

**B:** Community Captain Network · Relationship Mapping · Meeting Accountability  
**C:** Direct Democracy · Story Corps · Mobilization  
**D:** Executive Book rollups · statewide command · forecasting (**defer**)

---

## Build gate

1. v1.3 pilot — Sherwood → Jacksonville → defect log  
2. v1.4 — defect fixes only  
3. **PPEN A.0 + A.0b** — onboarding front door + identity/journey foundation  
4. **A.1 + A.1b** — Network Growth + Civic Engagement engines  
5. **A.2** — HCI  
6. No Executive Book rollups until field data exists  

---

## PPEN vs Workbench OS (today)

| PPEN | Workbench today |
|------|-----------------|
| Leadership Engine | 8 named slots; manual entry |
| My Five / My Ten | Not built |
| Identity / journeys | Operator initials only |
| HCI | Field log categories; no scoring |
| Events | **Strong** (v1.1) |
| Relationships | Basic rows (workbench intel) |

---

## Message for Burt (doctrine + build order)

```text
PPEN doctrine update — lock before build:

1. My Five is MANDATORY for every participant (Network Growth Journey).
   Power of 5 is not a role or org-chart title. Everyone recruits. Nobody graduates from recruitment.

2. Help 10 People Participate is a separate CIVIC mission (My Ten / Civic Engagement Journey).
   Do NOT call it "Register 10 Voters." Metric: 10 People Helped.
   Workflows: reg verification, vote plan, polling info, election reminders, assistance info.

3. Three parallel tracks on My Journey:
   - Leadership Journey (optional specialization)
   - Network Growth Journey (My Five)
   - Civic Engagement Journey (My Ten)

4. Every dashboard shows BOTH engines (Network Growth + Civic Engagement).

5. Workbench readiness adds Network Growth + Civic Engagement dimensions.

Build order after pilot:
- A.0 Leadership Opportunity & Onboarding Engine
- A.0b Identity, Access, and Journey System (who is this person, what can they see, journey state, My Five/My Ten status)
- A.1 Network Growth Engine (My Five)
- A.1b Civic Engagement Engine (Help 10 Participate / My Ten)
- A.2 HCI (rewards both engines)
- Phase D rollups deferred

My Five and My Ten are first-class objects beside Leadership Journey.
They are the backbone of PPEN — not dashboards, not KPI labels.

Gate: Sherwood/Jacksonville live smoke complete. No PPEN code until pilot done.
```
