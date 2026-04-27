# Workflow — Precinct sign holder and visibility program (design + repo)

**Status:** **Design for manual and future build** — no dedicated `SignHolder` / `VisibilityShift` model located in **Pass 2A** `schema.prisma` grep; use **`CampaignTask`**, **`VolunteerAsk`**, **`CampaignEvent`**, and **OIS aggregates** as interim patterns.

**Public language:** “Visibility,” “neighborhood / precinct,” **Pathway Guide** — not surveillance framing.

## 1. Design intent

- **Recruit** trusted volunteers for **lawn/visibility** in **precinct**-scoped windows (as geography keys exist: county + optional precinct string in DATA-1, not a public map of homes).  
- **Track** which precincts have a **booked** holder without publishing addresses in aggregate views.  
- **Escalate** **safety** and **legal** issues (trespass, right-of-way, local sign ordinances) to **compliance** + **field** leadership.  
- **Roll up** to **county** / **region** / **state** **OIS** or **GOTV** — **only** as approved aggregates and task completion rates.

## 2. How sign holders are recruited (target process)

- **Intake** via `POST /api/forms` (`volunteer` + leadership) → **`WorkflowIntake`** → V.C. or field assigns a **`VolunteerAsk`** or **task** “sign team — {county}.”  
- **P5** path: P5 team leader requests visibility within **team** geography (product **TBD**).

## 3. How precincts are tracked (today vs future)

- **Today:** `County` + engine **top/bottom** lists from `precinct` **strings** on voter/result data where available — **not** a volunteer-facing precinct browser.  
- **Future:** optional **`precinctId`** or county-scoped key (OIS audit); **list-first** OIS, no surprise GeoJSON in v1.  
- **Task rows:** e.g. `CampaignTask` with title/metadata `{ kind: "sign_route", countySlug, precinctKey }` — **convention** until model exists.

## 4. Shifts and materials

- **Shifts:** **Calendar** / **`CampaignEvent`** for big visibility dates; or **tasks** for micro-shifts.  
- **Materials:** mostly **ops** and finance (print, stakes) — `FinancialTransaction` for costs; not automated here.

## 5. Captain confirmation and escalation

- **Sign holder captain** (or **precinct captain**) confirms subunits via **admin tasks** and **roster** (consent) — not public.  
- **Escalation:** field manager → **CM** → **compliance** (legal) and **safety** (incidents).

## 6. Dashboard appearance (by layer)

- **Personal (future):** “My next visibility shift / task” — when `/dashboard` is real.  
- **Leader:** team completion — **P5** rules.  
- **County:** % precincts w **at least** one confirmed visibility task in window (aggregate) — **requires** data discipline.  
- **GOTV / ED command:** use **`gotv` admin** and task queues — **verify** if live panels exist.

## 7. KPIs (examples)

- Precincts “covered” (definition fixed by campaign)  
- Shift fill rate, no-show rate  
- Incident count (should trend **down** with training)  
- Materials spend per 1k **registered** voters (rough)

## 8. Privacy / safety

- **No** public map of **houses** with signs.  
- **No** PII in public OIS.  
- **Harassment** and **safety** route to **compliance** and, if required, **law enforcement** (outside app).

## 9. Current repo support

- **Intake, Workbench, tasks, events, county pages** — **strong**.  
- **Precinct** program — **weak**; needs **SOP** + optional schema.

## 10. Missing features

- First-class **visibility** / **sign** program model and **captain** UI  
- **Proof-of-placement** (photo upload with consent) — `OwnedMediaAsset` or future  
- **Law** checklist per **jurisdiction** in **manual** + `ComplianceDocument` links

**Related:** `DAY_ONE_TO_ELECTION_DAY...` (phase 13) · `chapters/22-election-day-command` · DASHBOARD audit (precinct)

**Last updated:** 2026-04-27
