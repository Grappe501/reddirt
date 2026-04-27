# Power of 5 — onboarding prototype report

**Lane:** `RedDirt/` only.  
**Date:** 2026-04-27.  
**Status:** Additive prototype — **no** auth changes, **no** database writes, **no** voter or contact collection on the onboarding route.

---

## Files read (protocol)

| # | File | Notes |
|---|------|--------|
| 1 | `README.md` | Quality gate `npm run check`; stack summary. |
| 2 | `docs/RED_DIRT_ORGANIZING_INTELLIGENCE_SYSTEM_PLAN.md` | OIS-1 hierarchy, geography ladder, Power of 5 role. |
| 3 | `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md` | Dashboard URL inventory, intake ↔ workbench context. |
| 4 | `docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md` | P5 spine, principles, pipeline language, privacy posture. |
| 5 | `docs/POPE_COUNTY_DASHBOARD_V2_BUILD_REPORT.md` | Pope v2 sample route, demo vs real labeling pattern. |
| 6 | **Search** | `get-involved`, `VolunteerForm`, `WorkflowIntake`, `/api/forms`, dashboard placeholders, county dashboards. |

---

## Files changed

| File | Change |
|------|--------|
| `src/app/onboarding/layout.tsx` | **New** — public shell (header/footer/`PublicLayoutMain`), aligned with OIS. |
| `src/app/onboarding/power-of-5/page.tsx` | **New** — route + metadata. |
| `src/components/onboarding/power-of-5/PowerOf5OnboardingView.tsx` | **New** — full page composition (11 sections). |
| `src/components/onboarding/power-of-5/PowerOf5NetworkPreview.tsx` | **New** — SVG + ladder labels, no dependencies. |
| `src/components/onboarding/power-of-5/PowerOf5StepCard.tsx` | **New** — reusable titled card with demo badge. |
| `src/components/onboarding/power-of-5/PowerOf5ImpactPanel.tsx` | **New** — impact ladder copy. |
| `src/components/onboarding/power-of-5/PowerOf5FirstActionDemo.tsx` | **New** — client-only 0/5 simulation. |
| `src/components/onboarding/power-of-5/index.ts` | **New** — barrel exports. |
| `src/lib/power-of-5/onboarding-demo.ts` | **New** — static demo copy and structures. |
| `src/app/(site)/get-involved/page.tsx` | **Additive** — one paragraph linking to the prototype (optional path for volunteers). |
| `docs/POWER_OF_5_ONBOARDING_PROTOTYPE_REPORT.md` | **This file.** |

---

## Route created

- **`/onboarding/power-of-5`**  
  - File: `src/app/onboarding/power-of-5/page.tsx`  
  - Layout: `src/app/onboarding/layout.tsx`

---

## Components created

| Component | Role |
|-----------|------|
| `PowerOf5OnboardingView` | Orchestrates all sections; server component. |
| `PowerOf5NetworkPreview` | SVG network + geography ladder chips. |
| `PowerOf5StepCard` | Dense card with optional badge (default “Demo / preview”). |
| `PowerOf5ImpactPanel` | Vertical impact ladder. |
| `PowerOf5FirstActionDemo` | `"use client"` — progress 0–5, local state only. |

---

## Interactive vs static

| Interactive | Static |
|-------------|--------|
| `PowerOf5FirstActionDemo` — “Add first person” increments counter to 5, progress bar, reset. All **in-memory** only. | Hero, copy blocks, reflection slots, training lists, impact ladder, gamification grid, pipeline cards, dashboard preview cards, privacy list, final CTAs. |

---

## Demo / preview only (explicit)

- Entire `/onboarding/power-of-5` page is labeled in hero and cards as **demo / preview / future** where appropriate.
- **Five “slots”** are placeholders — no inputs for real names; no `localStorage` persistence.
- **Network SVG** caption states it is illustrative, not a roster or map.
- **Dashboard preview** marks **future** routes (`cities`, `precincts`) and notes **placeholder** pages for `/dashboard` routes.
- **No** `fetch` to `/api/forms`, **no** Prisma, **no** cookies/session for this feature.

---

## How it ties into Power of 5

- Reinforces the **human spine**: trusted five → geography → rollups (see `POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`).
- **Pipeline** section mirrors product language: signup through GOTV, each with “what / why / how P5.”
- **Gamification** section previews **cooperative** mechanics aligned with plan principles (no shame rankings, no public microdata).
- **Training** section encodes **listen-first** relational norms before technical depth.

---

## How it ties into dashboards

- CTA and preview cards reference:
  - `/dashboard`, `/dashboard/leader` (existing placeholders in repo).
  - `/organizing-intelligence`, `/organizing-intelligence/counties/pope`.
  - Future patterns: `/organizing-intelligence/counties/[countySlug]/cities/[citySlug]`, `.../precincts/[precinctId]` (labeled **future**).
- Pope sample: `/county-briefings/pope/v2`.

---

## Privacy boundaries

- On-page **privacy promise** matches OIS / P5 docs: no public voter microtargeting, no household maps on open web, voter file as **staff reference**, consent and care.
- Prototype **does not** collect PII, **does not** display voter records, **does not** integrate auth.

---

## Build / lint

- Run from `H:\SOSWebsite\RedDirt`: `npm run check` before push (agent environment may not echo full logs).

---

## Next recommended packet

Use the following as a **read-only audit** follow-up (no feature edits in that pass):

---

### P5-1 — Existing code audit (paste into Cursor)

```text
I am working in H:\SOSWebsite\RedDirt.

Protocol:
1. Read README.md.
2. Read docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md.
3. Read docs/POWER_OF_5_ONBOARDING_PROTOTYPE_REPORT.md.
4. Search the codebase for: relational, contact, voter, import, form submission, WorkflowIntake, Power of 5, volunteer profile, signup sheet, /api/forms.
5. Do not make feature changes or refactors. Do not edit auth, permissions, or voter matching logic.
6. Do not add dependencies.
7. Optional: read prisma/schema.prisma only for model names relevant to organizing (no migrations).

Deliverable:
- Create docs/audits/POWER_OF_5_EXISTING_CODE_AUDIT.md

The audit document must include:
- Executive summary (what exists today vs what P5 needs later)
- File paths grouped by: public forms & API, WorkflowIntake / intake pipeline, volunteer & relational admin, voter import & VoterRecord touchpoints, county/OIS UI, dashboard placeholders
- For each group: purpose, key entry points, and “safe home for future P5 schema” notes (conceptual only — no schema edits in this packet)
- Explicit privacy / permission boundaries observed in code
- Gaps and risks (honest, no invented features)
- Recommended packet order after P5-1 (titles only)

Do not create docs/audits/POWER_OF_5_EXISTING_CODE_AUDIT.md if it already exists — instead, append a dated addendum section or ask before overwriting.
```

---

## Completion checklist

- [x] Created `/onboarding/power-of-5`
- [x] Created `docs/POWER_OF_5_ONBOARDING_PROTOTYPE_REPORT.md`
