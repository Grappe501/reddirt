# Brand and Presentation — Index

**Purpose:** Single index for how the **manual** and a **future manual website** stay aligned with the **Kelly Grappe** campaign and RedDirt product.

## Book / PDF (current)

- **Style:** Owner’s manual; see `MANUAL_STYLE_GUIDE.md`  
- **Color and type:** `src/app/globals.css` — navy/gold, League Spartan + Raleway  
- **Cover treatment (TBD):** Navy field, gold accent rule, no casual illustration unless on-brand and approved

## Public site (reference implementation)

- **Root layout:** `src/app/layout.tsx` — fonts, theme bootstrap  
- **Primary navigation:** `src/config/navigation.ts` — Home, About, Priorities, Counties, Organize (Organizing Intelligence), Conversations & Stories, Get Involved  
- **Footer:** Movement + Privacy & trust clusters  
- **Key public routes:** `/organizing-intelligence`, `/get-involved`, `/onboarding/power-of-5`, `/messages`, `/counties/*`, `/privacy-and-trust`

## Future web manual (see `web-presentation/`)

- **Information architecture:** `web-presentation/WEB_MANUAL_INFORMATION_ARCHITECTURE.md`  
- **Routes (design only):** `web-presentation/WEB_MANUAL_ROUTE_PLAN.md`  
- **Visual design:** `web-presentation/WEB_MANUAL_VISUAL_DESIGN_NOTES.md`  
- **Principle:** Web follows **book order**; adds search, filters, and deep links to dashboards (when authenticated) — no replacement for canonical Markdown in-repo

## Public vocabulary (repeat for consistency)

Campaign Companion; Guided Campaign System; Organizing Guide; Field Intelligence; Message Engine; Campaign Operating System; Workbench; Pathway Guide — see root `README.md`.

## What not to do

- Do not market the system as a generic “AI platform” in public-facing manual copy.  
- Do not introduce off-palette brand colors without documenting source (prefer `globals.css`).

## Related repo docs

- `docs/communications-unification-foundation.md` (COMMS-UNIFY-1)  
- `docs/MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md`  
- `docs/WEBSITE_PASS_01_NAVIGATION_REPORT.md` (navigation UX)
