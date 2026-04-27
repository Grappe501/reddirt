# Precinct path to victory and canvassing (Manual Pass 3D)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-27**  
**Public language:** **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — not “AI” as a public product name.

**Honesty:** **No** public voter-file rows. **No** public “household targeting” maps. **No** guaranteed electoral outcomes. **Path** to **victory** = **operational** **readiness** and **aggregates** for **staff** — not a **public** **prediction** **of** **who** **wins** **a** **precinct**.

---

## 1. Executive summary

- **Counties** are the **default** **geographic** **shell** in **OIS** and **Field** when **precinct**-**level** **targets** or **completeness** are **absent** **(see** `County`, `CountyCampaignStats` **+** `SYSTEM_READINESS_REPORT.md` **).** **Precinct**-**level** work **is** the **ambition** where **data** and **governance** **allow**.  
- If a strategically important county lacks precinct data (or usable precinct keys), **operators** should see a **plain** flag in **OIS,** **ops** **notes,** or **workbench** **SOP** (manual or future UI): *Precinct data acquisition required before full path-to-victory modeling.* **RACI:** data lead (format + import), county coordinator (local IDs), field manager (turf), CM (prioritization) — to define source, format, import, and verification. (Pass 3D is manual-only; this is not a product commit.)  
- **Canvassing** is **one** **pathway** among **many** (relational, **P5,** **events) **; **not** every **volunteer** is **a** **door**-**knocker**. **Walk** **lists** = **authorized** **users** **only** **(see** **§12).**  
- **Prisma (evidence, not a build claim):** `FieldUnit`, `FieldAssignment`, `VoterRecord`, and election result / precinct result models exist in `prisma/schema.prisma`. Wiring to public UI and OIS is governed (see `SYSTEM_READINESS_REPORT.md` and data policy). This manual does not claim all layers are exposed or current in the product as of Pass 3D.

---

## 2. County-first / precinct-when-available doctrine

| Situation | Operational rule |
|-----------|------------------|
| **Precinct** **data** **complete** and **governed** | **Plan** **door** / **dial** **/ **text** at **precinct** **(policy).** **KPIs** at **precinct** **+** **rollup** **up**. |
| **Only county totals** | Set county goals, capacity, event cadence, sign program at county; flag **precinct TBD** in planning. |
| **Strategic county, no precinct** | Show the acquisition flag (above); timeboxed sprint to acquire or decompose (treasurer/field; not in this file). |

**Public:** OIS and county pages use **aggregates**, not rows of voters (see site privacy stance).

---

## 3. What “path to victory” means operationally (not a prediction)

- **A runnable plan:** (1) enough volunteer capacity in a geography to execute a target contact program (policy-defined), (2) fundraising + comms + visibility to hold message in that geography, (3) GOTV readiness when in window, (4) compliance on all tactics.  
- **Not** a proprietary “score” of who votes how on public surfaces — that belongs in governed, non-public tools if at all.

---

## 4. Required data (concepts)

- **Geography:** FIPS, county slug, optional precinct id, `FieldUnit` graph if used.  
- **Voter file (staff):** as-of, source, match policy, NCOA, opt-out (see `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` and manual ch. 15).  
- **Field assignments:** `FieldUnit` + `FieldAssignment` (who owns what turf).  
- **Results (historical):** election / precinct result models in Prisma where ingested.  
- **No invented precinct data** in this manual — Steve provides source and date.

---

## 5. Current data gap logic (honest)

- **OIS / public:** county + region; some demo or stale panels (see `SYSTEM_READINESS_REPORT.md`).  
- **Prisma:** voter, field, and precinct/result models exist; end-to-end walk-list UI and universal precinct coverage are TBD per readiness.  
- **“Path” in this file** = procedural; filling gaps = SOP + product work later.

---

## 6. Priority county precinct acquisition rule

If county **C** is on a strategic list (Steve) and precinct completeness is low, null, or stale: (1) OIS or ops dashboard should show the *Precinct data acquisition required before full path-to-victory modeling* flag (same as §1); (2) **RACI** — data lead (format + import) + county coordinator (local IDs) + field manager (turf) + CM (prioritization); (3) timebox the sprint (e.g. 14–30 days); (4) if still unsolved, all modeling stays county-first. This pass is **manual and copy** only — not a route or schema commit.

---

## 7. County path to victory model (simulation, aggregate)

- **Inputs:** (a) county-level targets (registration, turnout proxies), (b) county activation ladder stage (Pass 3B), (c) volunteer + event capacity, (d) money (base/stretch pace), (e) OIS / data honesty flags.  
- **Outputs:** readiness score with narrative (“why this moved”); **suggested** human tasks, not auto-execution.  
- **Not** a “we will win county X” output — that requires human narrative and sourcing, not a dashboard alone.

---

## 8. Precinct path to victory model (when data exists)

- Subdivide county readiness into **precinct** slices (aggregate KPIs on public surfaces only).  
- Model capacity vs. doors (policy) per precinct.  
- Flag precincts with data-quality issues (duplicate IDs, stale imports).

---

## 9. Canvassing universe design

- Define **universe** (likely / persuasion / GOTV) per counsel and data lead — this manual does not pick legal universes.  
- If only county totals exist, model at county; if precinct file is ready, **aggregate** up to county for reporting (never the reverse for sensitive voter data).  

---

## 10. Volunteer canvassing readiness

- Training, pairing, safety, ID laws, no trespass (field/sign manuals).  
- Shifts in Workbench and events (existing `CampaignEvent` / task patterns).  
- **Pathway:** canvassing is one track; P5, events, and data are others — not every volunteer is a canvasser.

---

## 11. Turf packet design (staff, non-public)

- Map (authorized) + list (authorized) + script (approved) + safety + compliance + debrief to `WorkflowIntake` or task.  
- No public export of walk lists (`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §6).

---

## 12. Walk-list governance and voter-file privacy

- Row-level `VoterRecord` access: DPA, logging, retention, revoke on exit (see manual ch. 15 and Steve §6).  
- **Public:** no household or voter map on unauthenticated surfaces; workspace rule and privacy pages apply.

---

## 13. Power of 5 integration

- P5 teams may adopt a canvass goal (e.g. *N* doors in a precinct) as one mission type.  
- Do not reduce P5 to “only” canvass — relational and other Pathway missions remain valid.

---

## 14. County coordinator integration

- OIS + county ladder + V.C. + turf assignment (when the build supports it).  
- Deputy for redundancy (Pass 3B).

---

## 15. Precinct captain integration

- When named and reliable, owns local **knowledge** — not a dossier object in a public app.  
- Binds to `FieldUnit` when the product uses that graph.

---

## 16. Sign holder integration

- Complements canvass; safety and local ordinance (see `workflows/PRECINCT_SIGN_HOLDER_AND_VISIBILITY_PROGRAM.md`).

---

## 17. GOTV integration

- Model final contact capacity at **county** first, then **precinct** when data exists.  
- GOTV scripts require compliance + counsel as applicable (not in this file).

---

## 18. Dashboard requirements

- **County:** ladder, capacity, data completeness, acquisition **flag** (§6).  
- **Region / state:** rollups; no mock precision.  
- **Field (staff):** turf load, assignment age, export audit (if exports exist).  
- **List:** “Precinct acquisition blockers” — priority counties on Steve’s list with incomplete precinct data.

---

## 19. Simulation and readiness requirements

- **Add** to **`SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` **(Pass 3D) **: **precinct** **completeness** **score,** **county** **/ **precinct** **path** **models,** **canvass** **capacity,** **walk**-**list** **completion,** **GOTV** **precinct** **readiness. **(Directional,** **rebaseline** on **import).**  

---

## 20. Risks and compliance

- PII leak, wrong universe, unauthorized export, contrast at the door, harassment, false urgency, or claiming precinct readiness when OIS is demo/seeded (`SYSTEM_READINESS_REPORT.md`).

---

## 21. Steve decision list (precinct / field)

- Strategic **priority** counties (ordered).  
- Voter file source, as-of date, and match policies.  
- What counts as a **canvass contact attempt** in reporting.  
- Turf / list access per role (written).  
- Counties where **county-only** modeling is acceptable for a season vs. where precinct acquisition is mandatory before any “path” claim.

## 22. Pass 3E — Campus-to-precinct bridge, youth canvassing, campus volunteers on county teams

- **Campus-to-precinct bridge:** In counties with active or ramping campus work, field may (when policy allows) align student volunteers’ **residence** to turf for **GOTV**-aligned shifts — only under VoterRecord / walk-list **policy**; not a way to hand PII to unauthorized youth (default: **no** walk list for **minors**; see `YOUTH_CAMPUS_AND_STUDENT_ORGANIZING_PLAN.md` §5–6).  
- **Youth canvassing rules:** Age, **parent/guardian**, and compliance first; separate **visibility** and **content** from door-to-door until Steve-approved ladder stage and **written** role rules.  
- **Campus volunteers supporting county / precinct teams:** Youth plan ladder **6–8** should **hand off** to county coordinator; do not inflate OIS “momentum” without ladder truth.  
- **Strategic county + campus:** **Flag** in planning (OIS/ops): joint campus + county **sprint**; use when **precinct** acquisition can use **governed** **non-PII** data tasks (e.g. public boundary QA) with data lead **RACI** — not automatic for every priority county.  
- **Precinct data acquisition in college counties:** Pair acquisition sprints with campus volunteer hours when appropriate; many priority counties are rural or lack a four-year **campus** — **no** one-size default.  

## 23. Pass 3F — County party + rural tour and precinct capacity

- **Rural** **and** **county**-**party**-**forward** **counties** **(see** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` **+** `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` **)** **are** **often** **the** **same** **places** **where** **full** **precinct** **path** **modeling** **is** **blocked** **—** **use** **the** **existing** **county**-**first** **path** **and** **acquisition** **flags** **(§1–2),** **not** **OIS** **“heat** **without** **data**.”**  
- **GOTV** **readiness** **tied** **to** **meeting** **/ **EHC** **/ **P5** **/ **V.C. **ladder** **moves;** **no** **claim** **that** **a** **county** **meeting** **=** **precinct** **dominance.**

**Last updated:** 2026-04-27 (Pass 3D + **3E** + **3F**)
