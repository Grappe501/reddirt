# Dashboard inventory

| Name | URL | Data source | Produces |
|------|-----|------------|----------|
| State organizing intelligence | `/organizing-intelligence` | `buildStateOrganizingIntelligenceDashboard` + seed/sections | State KPI strip, drill to regions |
| Region OI (×8) | `/organizing-intelligence/regions/{slug}` | `buildRegionDashboard` family | County peer tables, narrative |
| OIS county (stub) | `/organizing-intelligence/counties/[countySlug]` | Static/validator | Links only; no v2 shell |
| County command | `/counties/[slug]` | `County`, metrics, events | Public county hub |
| Pope v2 | `/county-briefings/pope/v2` | `buildPopeCountyDashboardV2` | Full shell example |
| Personal | `/dashboard` | **Placeholder** | TBD authed user |
| Leader | `/dashboard/leader` | **Placeholder** | TBD team |
| Workbench (operator) | `/admin/workbench` | `open-work`, intakes, threads | **Primary ops** home |
| Admin OIS | `/admin/organizing-intelligence` | **Placeholder** | Links to public OIS |
| County intel (admin) | `/admin/county-intelligence` | Prisma, engines | **Staff** only |
| Narrative NDE | `/admin/narrative-distribution` | NDE types/queries | Admin |

**Source:** DASHBOARD hierarchy audit, component paths in same doc §12.

**Last updated:** 2026-04-27
