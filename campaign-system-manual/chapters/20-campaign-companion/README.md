# Chapter 20 — Campaign Companion and Guided Campaign System

**Part:** *(add to Part — book second volume or extension after Part XV)*  
**Audience:** Owner, CM, product builders, **not** the public marketing name in isolation — this is **how the system should behave** when the **Guided Campaign System** is described to volunteers.

## 1. Public vocabulary (binding for product copy)

Use **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide**. **Do not** use **“AI”** as the public brand of the guidance layer.

## 2. How guidance works (operating model, not a single button)

- **Intake** (`/api/forms`) creates **`WorkflowIntake`** rows with **human** triage on **`/admin/workbench`**.  
- **Future** member surfaces should show **one next best action** from **permitted** task templates (volunteer asks, events, training), not from raw model scores on a person.  
- **Internal** classifiers in `metadata` (implementation detail) may assist **staff**; map labels to **Organizing Guide** categories in UI for operators.

## 3. How it “learns” the cycle and role (target)

- **Role:** from `VolunteerProfile`, **TeamRoleAssignment**, **FieldAssignment** over time.  
- **Phase:** from **date windows** and **GOTV** / **ED** (manual config or future `CampaignPhase` config).  
- **Wins/losses:** only through **KPIs** and **stated** program outcomes, not moralized scoring on individuals.

## 4. How it queues tasks

- **Today:** `CampaignTask`, `VolunteerAsk`, email workflow items, intakes.  
- **Unifier:** `open-work` read model; **not** a single `MasterWork` table (by design in code comments).

## 5. How approvals should route (target)

- **Comms / financial / legal** — **human**; **comms** draft **review** relations exist.  
- **Strategy** — **CM/owner**; **not** an automated router in the repo for policy decisions.

## 6. Next best action (public-safe definition)

- A **time-bound, ethical** action with **no** hidden grades on the supporter; can compare **self vs last week**; **leaders** see **consent-scoped** rosters.

## 7. One-person campaign startup

- **Owner/CM** uses **Workbench** + **site CMS**; **no** volunteer dashboard required on day 0. **Guided** material is **SOPs** in manual until in-app nudges ship.

## 8. Handing work to humans as they join

- **WorkflowIntake** + **tasks**; **V.C.** and **field** replace pure CM throughput.

## 9. Privacy boundaries

- **Aggregate-first** in public; **voter** rows **stewarded**; **relational** notes **gated**; `Submission` content is **sensitive** — treat as **PII** operationally.

## 10. Technical gaps (honest)

- **No** unified **auth** for `/dashboard*`. **No** public **Campaign Companion** chat in repo as a single product. **Author studio** and **classify** are **operator tools**, not the volunteer **Pathway** UI.

**Cross-links:** `chapters/21-adaptive-campaign-strategy` · `SYSTEM_CROSS_WIRING_REPORT.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`

**Status:** **Pass 2B** design chapter — 2026-04-27
