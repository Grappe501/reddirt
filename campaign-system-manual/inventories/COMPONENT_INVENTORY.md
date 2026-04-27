# Component inventory — **Pass 2A**

**Method:** `src/components` focus on **organizing**, **county**, **regions**, **admin/workbench**, **narrative-distribution**, **theme**, **journey**; **not** every UI atom.

| Path / component | Role | Used on / by | Reusable | Scope | Mat | Manual |
|------------------|------|--------------|----------|--------|-----|--------|
| `StateOrganizingIntelligenceView` | State OIS | `/organizing-intelligence` | Yes | **Global** OIS | 4 | 6 |
| `RegionDashboardShell` / `regions/dashboard/*` | Region OI | 8 region pages + `[slug]` | Yes | **Region** | 4 | 6 |
| `CountyDashboard` family `county/dashboard/*` | County v2 | Pope v2, patterns | Yes | **County** (Pope used as template) | 4 | 6,11 |
| `StateOrganizingIntelligenceView` deps | builders | `lib/campaign-engine/state-organizing-intelligence` | Yes | global | 4 | 6 |
| `NarrativeDistributionCommandCenter` + admin panels | NDE | `/admin/narrative-distribution` | Partial | **Admin** | 3–4 | 9,20 |
| `NarrativeMemberHubView` | Public narrative | **Messages** or embeds | Partial | public | 3–4 | 9,23 |
| `AdminBoardShell` | Nav chrome | `admin/(board)` | Yes | **Admin** | 5 | 16 |
| `UnifiedOpenWorkSection` | Workbench | workbench | Yes | admin | 5 | 7,20 |
| `ThemeProvider` + `globals.css` tokens | Brand | root | Yes | **Global** | 5 | style guide |
| `GetInvolvedPathwaySystem` / journey | Pathways | get-involved | Yes | public | 4 | 3,23 |
| Social workbench components | Social | `workbench/social` | Partial | admin | 4 | 8,9 |
| Comms workbench components | Comms | comms routes | Partial | admin | 5 | 8 |

**Pope-specific vs global:** **Pope v2** uses **shared** shell; **data** builder is **Pope-named** (`pope-county-dashboard`) — treat as **gold sample**, not magic import for all counties without data.

**Region-specific:** each of 8 **static** pages may import **shared** `RegionDashboardView` with **slug** switch.

**Dead / low use:** search `components` for `TODO` in Pass 3; not exhaustively grepped in Pass 2A.

**Last updated:** 2026-04-27 (Pass 2A)
