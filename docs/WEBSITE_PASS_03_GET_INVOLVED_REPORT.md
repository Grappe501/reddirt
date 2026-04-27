# Website Pass 03 — Get Involved / volunteer journey upgrade

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Depends on:** `docs/WEBSITE_PASS_02_HOMEPAGE_REPORT.md` (home pathways into organizing); public form → `WorkflowIntake` chain (`src/lib/forms/handlers.ts`)

**Pass 2 recap:** Homepage `HomePathwayGateway` sends “Bring this to your community” to `/get-involved`; this pass makes that destination a structured pathway grid instead of a single undifferentiated volunteer pitch.

---

## 1. Mission

Turn `/get-involved` from a **generic volunteer landing page** into a **pathway system**: seven clear on-ramps (what you do, why it matters, time required, next action), each wired only to **existing** public routes and forms—**no** backend or `/api/forms` behavior changes. The **captain** pathway uses `?leadership=1#volunteer`: a **server-rendered callout** prompts users to confirm the existing leadership checkbox (same submit payload as today; no form component changes required).

---

## 2. Pathway map

| Pathway | What / why / time (summary) | Primary next action | Secondary | Form / persistence |
|--------|-----------------------------|---------------------|-----------|-------------------|
| **Start Power of 5** | Guided relational ladder (demo/seed in-browser); builds shared language; ~15–25 min | `/onboarding/power-of-5` | `/organizing-intelligence` | No form on onboarding page |
| **Join a county team** | Local team intake; county-scoped organizing; ~10–15 min to submit | `/start-a-local-team` (`local_team` → `WorkflowIntake`) | `/counties` | `POST /api/forms` `formType: local_team` |
| **City / precinct captain** | Leadership lane; stabilizes turf; ~15–20 min form | `/get-involved?leadership=1#volunteer` | `/local-organizing` | `volunteer` + user confirms `leadershipInterest` (callout when `leadership=1`) |
| **Conversations & stories** | Message hub + optional story draft | `/messages` | `/stories#share` (`story_submission`) | Story form → `WorkflowIntake` |
| **Attend an event** | Calendar + optional event representation | `/events` | `?lane=event_representation#volunteer` | `volunteer` + `lane:event_representation` interest token |
| **Recruit candidates** | SOS filing/calendar context; widen the bench | `/priorities#candidate-access-heading` | `#volunteer` (skills note) | `volunteer` or `join_movement` |
| **Petitions / GOTV** | Commitment network + field shifts | `/direct-democracy#commitment-network` | `#volunteer` | `direct_democracy_commitment` + `volunteer` |

---

## 3. WorkflowIntake and forms (no new persistence paths)

- Successful `POST /api/forms` for supported types creates **`Submission`** and a linked **`WorkflowIntake`** (see `persistFormSubmission` / `createWorkflowIntakeForSubmission` in `src/lib/forms/handlers.ts`).
- Operators triage from **`/admin/workbench`** and related surfaces (see `docs/KELLY_SOS_COMMS_READINESS.md`, `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md` §19).
- Pass 3 does **not** add form types, API routes, or Prisma writes.

---

## 4. Onboarding route

- **Power of 5:** `src/app/onboarding/power-of-5/page.tsx` → `PowerOf5OnboardingView` (trust-first flow; no contact capture on that flow).

---

## 5. Files touched (intended)

| File | Change |
|------|--------|
| `src/config/navigation.ts` | `getInvolvedVolunteerCaptainHref`, `getInvolvedPathwaysHref` |
| `src/content/journey/get-involved-pathways.ts` | **New** — seven pathway definitions |
| `src/components/journey/GetInvolvedPathwaySystem.tsx` | **New** — pathway grid + intake transparency note |
| `src/app/(site)/get-involved/page.tsx` | `#pathways` section; hero CTA; `pickLeadership`; captain callout when `?leadership=1`; `VolunteerForm` unchanged |
| `src/components/journey/HomePathwayGateway.tsx` | Community pathway deep-links to `#pathways` via `getInvolvedPathwaysHref` |
| `docs/WEBSITE_PASS_03_GET_INVOLVED_REPORT.md` | This report |

---

## 6. Public wording guardrails

- No “AI” branding on these surfaces.
- Petition / ballot language defers to counsel (consistent with `/direct-democracy`).

---

## 7. Verification

From `RedDirt/`:

```bash
npm run check
```

(Lint + `tsc --noEmit` + `next build`.)

**Agent run (2026-04-27):** `npm run check` completed with **exit code 0** from `RedDirt/` (terminal capture did not echo build logs in this environment).

---

## 8. Follow-ups (not in this pass)

- Analytics events per pathway click (if desired).
- Admin CMS block for reordering pathways without deploy.
- Dedicated `join_movement` deep links with `interests` prefill (mirror `VolunteerForm` pattern; requires client-only `JoinMovementForm` extension).
