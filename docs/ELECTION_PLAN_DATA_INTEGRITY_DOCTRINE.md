# Election Plan Data Integrity Doctrine

**Status:** System doctrine · **Lane:** `RedDirt/` · **Audience:** Burt, operators, PPEN build  
**Updated:** 2026-06-16  
**Related:** [`COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`](./COMMUNITY_WORKBENCH_PPEN_ROADMAP.md), [`COMMUNITY_WORKBENCH_PILOT_OPERATOR_RUNBOOK.md`](./COMMUNITY_WORKBENCH_PILOT_OPERATOR_RUNBOOK.md)

---

## The one rule

> **No dashboard number should exist unless there is a corresponding record set that can be opened and viewed.**

This single rule keeps the PPEN ecosystem honest as it scales.

---

## Principle 1 — Nothing Exists Until It Exists

If the campaign does **not** have 25 active volunteers in Sherwood, the system must **never** display:

```text
Active Volunteers: 25
```

unless there are 25 volunteer **records** attached to Sherwood.

Same for:

- leaders
- hosts
- captains
- My Five
- Help 10 Participate
- committee members

**Forbidden on live dashboards:**

- Placeholders
- Projections shown as counts
- Assumed numbers from planning JSON mixed with live metrics
- `current / target` patterns that read like achievement

**Allowed display:**

```text
Count = actual records
```

or

```text
Count = 0
```

**Planning targets** (vote targets, registration goals, host goals from chapter-05 / campaign-brain) live in a **separate, labeled** “Community goals (planning)” section — never as live counts.

### Implementation (workbench v1.4+)

| Surface | Record-backed | Planning (separate) |
|---------|---------------|---------------------|
| Record counts panel | `fieldEntry` rollups, leadership rows, events, relationships | — |
| Community goals panel | — | `city-location-numeric-targets`, `win-sherwood-operation`, `special-kpi-goals` |
| War room / snapshot | Built SOS math when snapshot exists | Zeros = unfed, not fake progress |

---

## Principle 2 — Events Are Not Communities

### Wrong model

```text
Sherwood
├── Leaders      ← conflates community + event
├── Hosts
└── Event
```

### Correct model

```text
Sherwood Workbench
│
├── Community Leadership     ← workbench roles (OPEN until assigned)
│   ├── Community Lead
│   ├── Volunteer Lead
│   ├── Events Lead
│   └── …
│
├── Events
│   └── Grassroots & Guitar Strings   ← Sept 17
│       ├── Event Chair
│       ├── Event Committee
│       ├── Hosts
│       └── Volunteers
│
└── Community Goals (planning)   ← strategic targets, not live counts
```

**Grassroots & Guitar Strings leadership ≠ Sherwood community leadership.**

An event team may later become city leadership — **not automatically**.

### Schema direction (Burt)

| Today | Target |
|-------|--------|
| `CommunityWorkbenchLeadership` (workbench-scoped) | Keep — community roles only |
| `CommunityWorkbenchEvent.leadName`, `assignmentsJson` | Keep — event-scoped team |
| Hosts on city leadership | **Remove** — hosts belong to event or house-party program |
| House parties | **Separate program/event records** (e.g. Jeanie Gray · Completed) |

### Sherwood corrections

| Object | Rule |
|--------|------|
| Sherwood community leadership | Every role **OPEN** until a person record is assigned |
| Grassroots & Guitar Strings | Event dated **Sept 17**; chair, committee, hosts, volunteers on **event** |
| House parties | Own goal track: Goal 10 / Completed 1 with named host records |
| Active volunteers | Count of volunteer **records** only — **0** until import/activation |

---

## Principle 3 — Everything Clickable To Records

When the UI shows:

```text
Active Volunteers: 18
```

The operator must click through to:

```text
Volunteer Name · Phone · Email · County · Last Activity
```

**Chain:**

```text
KPI (count)
  ↓
People (records)
  ↓
Actions
```

### Implementation phases

| Phase | Scope | Status |
|-------|-------|--------|
| **A** | Record counts link to in-page anchors (`#field-log`, `#leadership`, `#events`, `#relationships`) | Workbench shell |
| **B** | Field log entries list filtered by category on drill | Next |
| **C** | Full participant profile (volunteer activation workflow) | PPEN A.0+ |

---

## Volunteer activation workflow (PPEN)

Target flow — **not yet built**; doctrine for next passes:

1. **Website volunteer form** — Name, Address, Email, Phone, County, Interests → Submit  
2. **Activation email** — Welcome + one-time code → Activate account  
3. **Username** — `Steve Grappe` → `sgrappe`; `John Smith` → `jsmith`; `John A Smith` → `jasmith` (uniqueness + suggestions)  
4. **Password** → Account activated  
5. **Auto-create:** Volunteer Record · Participant Record · Journey Record · Security audit row  

Volunteer records become the **source of truth** for active-volunteer metrics (Principle 1).

---

## Security & access levels

### Audit log (Level 2+ required)

Track for authenticated users:

- Login / logout  
- Profile edits  
- Volunteer additions  
- Leadership changes  
- Committee changes  
- Role changes  

### Access levels (redefine now)

| Level | Role |
|-------|------|
| 1 | Participant |
| 2 | Team Leadership |
| 3 | County Leadership |
| 4 | Regional Leadership |
| 5 | State Leadership |
| 6 | Executive |

Every page declares required level. Enforce in middleware + API.

---

## Burt — data integrity pass (not a feature pass)

Priority order:

1. Separate community leadership from event leadership (UI + docs now; schema hardening next)  
2. Separate hosts from house-party hosts (event/program records)  
3. Remove assumed volunteer counts from all dashboards  
4. Make all counts record-backed (Principle 1)  
5. Make every KPI drill into underlying records (Principle 3 — phase B/C)  
6. Volunteer activation workflow (form → email → username → profile)  
7. Participant identity model (Volunteer + Participant + Journey)  
8. Access-level framework (L1–L6 on routes + API)  
9. Audit logging for all authenticated users (L2+ actions)  
10. Volunteer records = source of truth for active-volunteer metrics  

**Gate:** Sherwood + Jacksonville pilot smoke must pass with record counts at **0** until real records exist — not plan numbers.

---

## What changed in code (2026-06-16)

- Workbench **Record counts** panel — record-backed only, clickable drill anchors  
- **Community goals (planning)** — separated from live counts, sourced from campaign-brain  
- Community leadership shows **OPEN** until assigned  
- Events section documents event-scoped leadership  
- Readiness scoring no longer uses planning JSON denominators  
- Fallback snapshot shows `—` / `0` when unbuilt (no duplicated statewide numbers)  

---

## Files

| File | Role |
|------|------|
| `src/lib/election-plan/community-workbench/load-community-kpi-targets.ts` | `recordCountsForWorkbench`, `planningGoalsForSlug` |
| `src/components/election-plan/CommunityWorkbenchShell.tsx` | Record counts + planning goals UI |
| `docs/COMMUNITY_WORKBENCH_PPEN_ROADMAP.md` | PPEN phasing after pilot |
| `data/campaign-brain/city-location-numeric-targets.source.json` | Planning targets only |
