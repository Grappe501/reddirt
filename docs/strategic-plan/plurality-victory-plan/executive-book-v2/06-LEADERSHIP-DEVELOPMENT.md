# Chapter 6 — Leadership Development System

> **Executive Book 2.0** · Campaign Operating System manual · Internal leadership briefing  
> **Replaces:** Executive Book 1.x "Who Owns What" — ownership matrix remains, now embedded in a **Leadership Workbench doctrine**

**Live system:** [Leadership hub](/election-plan/leadership) in the Election Plan portal.

---

## Why leadership is a system, not a spreadsheet

Executive Book 1.x listed **names next to functions**. That was necessary at launch. Campaign OS 2.0 requires more:

- **Onboarding without execution** leaves leaders asking: *What do I do Monday?*
- **Slots without people** look like progress but produce no field motion
- **Shared ownership** creates accountability gaps — one primary owner per function, always

The Leadership Development System answers six questions on every leader login:

```text
Who owns this?
What are they supposed to do?
Who are their people?
What numbers prove progress?
What is overdue?
What needs escalation?
```

**Leadership Workbenches** are the command surfaces that answer those questions — one workbench type per leadership domain, same shell, role-specific KPIs.

---

## Leadership Workbench doctrine

### The bridge from volunteer to leader

```text
Website volunteer form → Activation (A.0c) → Person + Participation (A.0b)
→ Leadership application → Review → Placement → Leadership Workbench unlocked
```

PPEN (Chapter 5) owns **who** is in the movement. Leadership Workbenches own **what leaders do** after placement.

### Not one generic dashboard

**Wrong:** One "Leader Dashboard" mixing county, city, event, and coalition KPIs.

**Right:** Ten workbench **types**, each with the same navigation skeleton but **role-specific** duties, people lists, and connected surfaces.

| # | Workbench type | Primary user |
|---|----------------|--------------|
| 1 | County Leadership | County chair / county captain |
| 2 | Volunteer Leadership | Volunteer lead / captain |
| 3 | Community Leadership | City / community lead |
| 4 | Event Leadership | Event chair / committee |
| 5 | Voter Engagement | Help 10 / registration / vote-plan team |
| 6 | Network Growth / My Five | Every participant + lead rollups |
| 7 | Coalition Leadership | Coalition / cultural outreach leads |
| 8 | Communications Leadership | CCH / Substack / social coordination |
| 9 | Media Creator | Writers, photographers, editors |
| 10 | Training / Onboarding | Onboarding managers |

### Shared shell (learn once, use everywhere)

```text
Overview · Role Description · Current Leader · Deputy / Backup
Responsibilities · KPI Dashboard · Task Board · People List
Calendar · Training · Documents · Notes · Reports · Escalations
```

**Data integrity rule:** KPI Dashboard shows **record counts only**. Planning targets (hosts, VIP tables, vote-share stretch goals) stay in separate panels — never mixed into live KPI bars.

---

## County leadership

**Route:** `/election-plan/counties/{countySlug}` — County Workbench v4 operating center.

**Who:** County chair, county captain, strike team leads.

**Owns:**

- County leadership slots and open positions  
- Child community workbenches  
- County calendar and event rollups  
- Volunteer pipeline (PPEN participations)  
- Relationships and field log  
- County intelligence (demographics, officials, economy — reference panels)

### County strike roles (9)

| Role | Field responsibility |
|------|---------------------|
| County Captain | Overall county coordination |
| Volunteer Captain | Recruitment and activation |
| Faith Captain | Faith community outreach |
| Postcard Captain | Handwritten mail program |
| Phone Bank Captain | Trusted-messenger calls |
| Canvass Captain | Door and neighborhood contact |
| Events Captain | County event calendar |
| Media Captain | Local storytelling and LTE |
| Candidate Liaison | Kelly visit coordination |

**Today:** 6 roles visible in v4 UI; 3 additional strike roles exist in JSON pending UI wiring. Counts show **OPEN** or assigned names — never fabricated pipeline numbers.

### County leadership KPIs (record-backed when live)

- Leadership roles filled  
- Active volunteers (field entry + PPEN Person)  
- Events scheduled  
- My Five / Help 10 rollups (post A.0b)  
- County contact universe  
- Overdue follow-ups  

---

## Community leadership

**Route:** `/election-plan/workbenches/{slug}` — Community Workbench.

**Who:** Community Lead and eight standard community roles:

| Role key | Responsibility |
|----------|----------------|
| `community_lead` | City plan owner |
| `deputy_lead` | Backup and succession |
| `volunteer_lead` | Local recruitment |
| `events_lead` | City event calendar |
| `faith_lead` | Faith institutions |
| `business_lead` | Chamber and small business |
| `youth_lead` | Campus and young voter pipeline |
| `data_lead` | Field log integrity and reporting |

**Owns:** City plan, local events, relationships, community goals, special KPI projects (e.g. Quitman #41 bonus metrics — isolated from generic city rollups).

**Critical doctrine:** **Event leadership ≠ city leadership.** Sherwood Community Workbench holds city/org leadership. Grassroots & Guitar Strings event chair, committee, and hosts live on the **event record**, not community_lead slots.

---

## Coalition leadership

**Route:** `/election-plan/workbenches?kind=coalition` — Coalition Command.

Each coalition workbench (African American, Hispanic, Muslim, Youth, Veterans, Labor, Educators, Disability, Faith, Small Business) uses the **same operating sections** as county v4:

```text
Leadership · Open Positions · Interested Candidates · Volunteer Pipeline
Training · Events · Relationships · Communications · My Five · Help 10
```

Different content. Same OS.

**KPIs:** pathway slots filled, trusted messengers identified, coalition events held, organizations mapped, volunteer conversions from coalition relationships.

Coalition leadership is **validator and door-opener work** — surrogates open rooms Kelly cannot reach alone (see Chapter 4).

---

## Event leadership

**Route:** `/election-plan/workbenches/{slug}/events/{eventId}` — Event Operations panel (extends to Event Leadership Workbench).

**Who:** Event chair, committee members, assignment owners — **not** city community leads.

### Event assignment roles (7)

Registration table · AV team · Greeters · Media · Security · Food · Cleanup

**KPIs:** event status, roles filled, expected/actual attendance, volunteers assigned, post-event follow-ups (AAR).

**Doctrine fixes (non-negotiable):**

1. **Event leaders ≠ city leaders** — enforce on Sherwood G&G immediately  
2. **Event hosts ≠ house-party hosts** — separate field categories and UI copy  
3. Co-chairs and ops leads are **event metadata** until seeded as event participation records  

---

## Volunteer leadership

**Who:** Volunteer Lead, Volunteer Captain, shift captains.

**Owns:** Onboarding funnel, active volunteer list, shift assignments, training completion, retention follow-up.

**KPIs:** new signups, activated accounts, trained volunteers, assigned to shifts, hours logged, inactive needing follow-up.

**Connected surfaces:** Community `volunteer_lead` slot, county pipeline, event assignments, Training / Onboarding workbench.

---

## Communications leadership

**Who:** Comms Lead, Editor, Publisher, Kelly (approver).

**Route:** CCH workbenches — `/election-plan/workbenches?kind=communications`

**Owns:** Kelly source posts → Substack canonical → platform adaptations (SMOS) → publish workflow.

**KPIs:** drafted, approved, published, replies needing response, platform adaptations, creator tasks.

**Min access:** L5 state (Kelly + comms team).

PPEN links comms access: L1 volunteer → public feed; active + trained → insider feed.

---

## Fundraising leadership

Fundraising leadership roles (Chapter 17) connect to FOS rollups:

- **County fundraising leads** — county pipeline and opportunity ownership  
- **Community fundraising leads** — city/chapter goals and house-party hosts  
- **Event fundraising leads** — G&G revenue, VIP tables, sponsorships  

Fundraising Leadership Workbench ships **after** PPEN A.0b/A.0c and base Leadership Workbench shells (see `docs/FUNDRAISING_LEADERSHIP.md` architecture — planning inventory only until gates pass).

---

## Succession planning

Every leadership slot requires:

1. **Primary owner** — one name, accountable for weekly deliverable  
2. **Backup / deputy** — named before primary is unavailable, not instead of naming a primary  
3. **Documented handoff** — role description, people list, open tasks, escalation path  

TBD owners are the **#1 execution risk**. Assign before field week begins.

When a leader steps down: Participation record status → `ended`; new Participation created for successor; Leadership Workbench transfers with audit trail.

---

## Leadership accountability

### Operating rules (from ownership matrix — still binding)

1. One primary owner per function — no shared ownership  
2. Backup is named before the owner is unavailable  
3. Weekly deliverable is due before Monday leadership call  
4. TBD owners escalate to Campaign Manager same day they are identified  
5. **Sherwood Event:** John Duke & Jay Powell are **co-chairs**; Steve Grappe is backup / operations support  

### Weekly leadership rhythm

| Cadence | Activity |
|---------|----------|
| **Weekly** | Function owners report deliverable + blockers |
| **County reviews** | County chairs report pipeline, open roles, next events |
| **Coalition reviews** | Coalition leads report validators, meetings, conversions |
| **Leadership reviews** | Executive team reviews TBD slots, succession gaps, escalations |

Source scorecard: Chapter 20 — Accountability & Reporting.

### Current ownership matrix (executive functions)

| Function | Primary Owner | Backup | Weekly Deliverable |
|----------|---------------|--------|--------------------|
| Campaign Manager | **Steve Grappe** | TBD | Ops routing · event promotion · counties touched |
| Volunteer Leadership | **TBD** | TBD | Founding 20 progress |
| Sherwood Event | **John Duke & Jay Powell** | Steve Grappe | Hosts + VIP tables |
| Labor Program | **Danny Brown / Team** | TBD | Union meetings |
| AEA Program | **April Reisma liaison** | TBD | Teacher network |
| NAACP Program | **Barry Jefferson** | TBD | Branch contacts |
| Muslim Outreach | **Ali Khan / Ebrahim** | TBD | Community meetings |
| Hispanic Outreach | **Jasmine Serano** | TBD | Hispanic engagement |
| Motion & Storytelling | **Leann Solice** | TBD | Weekly content |
| Endorsements | **TBD** | TBD | Validator pipeline |
| Calendar Truth | **TBD** | TBD | Verified events + guardrails closed |
| Candidate Partnerships | **TBD** | TBD | Shared event dates |

**Update path:** Edit `data/campaign-brain/operations/ownership-registry.source.json` → `npm run campaign-brain:executive-book:completion`

| Status | Count |
|--------|------:|
| Functions | 12 |
| **Primary owner still TBD** | **4** |

---

## Access levels and placement flow

| Level | Leadership surfaces unlocked |
|-------|------------------------------|
| L1 Participant | My Journey only |
| L2 Leader | Community, Event, Volunteer, Coalition, Creator workbenches |
| L3 County | County Leadership Workbench |
| L4 Regional | Multi-county rollups |
| L5 State | CCH hub, SMOS hub, statewide programs |
| L6 Executive | War room, escalations, cross-workbench reports |

### Assignment flow (target state)

```text
Volunteer form → WorkflowIntake → A.0c Activation → PpenPerson (L1)
→ My Journey → Leadership application → County/Community lead reviews
→ PpenParticipation created → Leadership Workbench unlocked → KPIs from records
```

**Interim:** `CommunityWorkbenchLeadership.personName` and strike JSON remain editable until Participation sync replaces duplicate name strings.

---

## Build order (do not skip)

```text
A.0   Pilot smoke — Sherwood + Jacksonville
A.0b  Person + Participation + L1–L6 access
A.0c  Volunteer intake → activation → My Journey
B.1   County + Community Leadership Workbench shells
B.2   Volunteer, Event, Coalition, Training (+ seed G&G as Sherwood event)
B.3   Voter Engagement + My Five rollups
B.4   Communications + Media Creator leadership views
```

**Hard gate:** No PPEN Prisma models until pilot smoke green.

---

## Hard rules (non-negotiable)

1. **No fake counts** — zeros until records exist  
2. **No placeholders presented as live** — OPEN slots, not "3 volunteers"  
3. **Event leaders ≠ city leaders**  
4. **Event hosts ≠ house-party hosts**  
5. **Active volunteers from participant records** — not planning JSON  
6. **Every KPI drills to records**  
7. **Power of 5 Lead is not a role key** — use My Five journey (Chapter 5)  

---

## Connected surfaces map

```text
War Room (executive rollups — drill to workbenches)
├── County Leadership → /election-plan/counties/{slug}
├── Community Leadership → /election-plan/workbenches/{city}
├── Coalition → /election-plan/workbenches?kind=coalition
├── CCH → /election-plan/workbenches?kind=communications
├── SMOS → /election-plan/workbenches?kind=media
└── My Journey → participant home (post A.0c)
```

---

## Related build docs

- `docs/LEADERSHIP_WORKBENCH_ARCHITECTURE.md`
- `docs/PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md`
- `docs/PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md`
- `docs/COUNTY_WORKBENCH_V4_DOCTRINE.md`
- `docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md`
- `data/campaign-brain/leadership-workbench-registry.source.json`

## Rebuild

```bash
npm run campaign-brain:executive-book:completion
npm run election-plan:build
```

Legacy V1 URL `/election-plan/executive-book/ownership` redirects to this chapter.
