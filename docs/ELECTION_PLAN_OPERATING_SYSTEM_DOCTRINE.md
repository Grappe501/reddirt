# Election Plan Operating System — Unified Doctrine

**Status:** Locked architectural snapshot · **Lane:** `RedDirt/` · **Audience:** Burt, Steve, all build lanes  
**Updated:** 2026-06-16  
**Related:** [`PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md`](./PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md), [`PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md`](./PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md), [`COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`](./COMMUNITY_WORKBENCH_PPEN_ROADMAP.md)

---

## Stop thinking in separate projects

County Workbench, Community Workbench, Coalition Workbench, CCH, and PPEN are **not separate products**.

They are **views into the same operating system** — different lenses on one graph.

---

## Locked layer model

```text
Participant Layer (Center)
        ↓
Relationship Layer
(My Five, Help 10, Contacts, Trust)
        ↓
Work Layer
(Events, Committees, Assignments, Training)
        ↓
Organization Layer
(Community, Coalition, County, Region)
        ↓
Communications Layer
(CCH, Substack, Social, Email, SMS)
        ↓
Campaign Layer
(Statewide visibility, reporting, strategy)
```

Wrong direction: dashboards → more dashboards → even more dashboards.  
Right direction: **people → relationships → work → organization → comms → campaign**.

---

## Four first-class objects

Everything else is built on top of these:

| Object | Question |
|--------|----------|
| **Person** | Who they are |
| **Participation** | How they are involved (in a specific context) |
| **Relationship** | Who they know and influence |
| **Impact** | What changed because of them |

Registry: `data/campaign-brain/ppen-participant-framework.source.json`

### Person vs Participation

A **Person** is one human (e.g. Steve Grappe).

A **Participation Record** is their involvement in one context. One person, many participations:

```text
Steve Grappe
├── Faulkner County Volunteer Lead
├── Sherwood Event Committee Member
├── Direct Democracy Coalition Participant
├── Veterans Outreach Contributor
└── Substack Insider Member
```

Critical for permissions, reporting, communications, and leadership development later.

---

## Views (not products)

| View | What it shows |
|------|----------------|
| **My Journey** | Participant home — the movement's most important screen |
| **County Workbench** | People + work in a county org context |
| **Community Workbench** | People + work in a city/program context |
| **Coalition Workbench** | People + work in a coalition context |
| **CCH / SMOS** | Communications layer — messages to/from people |
| **Election Plan / Campaign** | Statewide rollup and strategy |

Same engine. Different lens.

---

## Real front door

The system does **not** begin at County Workbench, Community Workbench, or PPEN admin.

It begins at:

```text
Website Volunteer Form
```

After pilot gate, first production-grade build:

- **PPEN A.0b** — Identity & Access Layer  
- **PPEN A.0c** — Volunteer Intake & Activation Layer  

See [`PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md`](./PPEN_A0C_VOLUNTEER_INTAKE_ACTIVATION.md).

Only after activation do they enter the OS.

---

## Most important future screen: My Journey

Not a dashboard. Not a county page. Not a coalition page.

When a volunteer logs in:

```text
Welcome Back

My Five                    3 / 5
Help 10 Participate        6 / 10
Events Worked              2
Volunteer Hours            14
Leadership Opportunities   3

County Assignment          Faulkner
Current Role               Volunteer
Next Step                  Community Captain Training
```

If participant experience is right, every other surface is a lens on the same underlying system.

---

## Unified org-context template

County, community, and coalition **views** share operating sections:

```text
Leadership · Open Positions · Interested Candidates · Volunteer Pipeline
Training · Events · Relationships · Communications · My Five · Help 10
```

County Workbench v4 implements this structurally today.

---

## Protected build order (locked)

| Step | Phase | What |
|------|-------|------|
| **1** | Pilot smoke | Prove the OS works live — Sherwood + Jacksonville |
| **2–3** | **A.0b + A.0c together** | Person Layer + front door (form → activation → L1 → My Journey) |
| **4** | A.0 | Leadership workflow — open roles, candidates, onboarding |
| **5** | A.1 | My Five relationship engine |
| **5b** | A.1b | Help 10 Participate relationship engine |
| **6** | A.2 | Impact engine — HCI / Because of You |
| **7** | ACS/BLS | Faulkner or Saline pilot only — then scale to 75 |

**Steps 2 + 3 ship together.** Identity without intake is incomplete; intake without identity creates another disconnected volunteer form.

**Hard rules:** No fake movement numbers · no dashboard totals without records · no PPEN **code** before pilot smoke passes.

Structural v4 shell ✓ (pre-step-1). Do not scale census imports before Person + Participation exist.

---

## Data integrity

- Person, Participation, Relationship, and Impact counts drill to records — **0** until they exist.
- No placeholder movement metrics on org views.

See [`ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md).

---

## Burt — one paragraph

One OS, four objects, six layers. County/Community/Coalition/CCH are views. Front door = website volunteer form. After pilot smoke: ship **A.0b + A.0c together** (Person + Participation + intake/activation → My Journey). Then A.0 leadership, A.1/A.1b relationships, A.2 impact. ACS only after step 7 pilot. No fake numbers. No PPEN code before smoke green.
