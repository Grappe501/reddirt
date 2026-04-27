# Feature inventory (Pass 1)

| Feature | Location (primary) | Maturity 0–6 | Audience | Manual |
|---------|--------------------|-------------|----------|--------|
| Public site & nav | `src/app/(site)`, `src/config/navigation.ts` | 5 | Public | Y |
| State OI dashboard | `organizing-intelligence`, `StateOrganizingIntelligenceView` | 4 | Public, staff | Y |
| Region OI (8) | `organizing-intelligence/regions/…` | 4 | Public | Y |
| County command | `counties/[slug]`, `getCountyPageSnapshot` | 5 | Public | Y |
| Pope county v2 | `county-briefings/pope/v2` | 4 | Public | Y |
| OIS county stub | `organizing-intelligence/counties/[countySlug]` | 2 | Public | Y |
| Get Involved + pathways | `get-involved` | 5 | Public | Y |
| Power of 5 onboarding | `onboarding/power-of-5` | 3–4 | Public | Y |
| Messages hub | `messages` | 4 | Public | Y |
| Form API + intake | `api/forms`, `lib/forms` | 5 | System | Y |
| Open work + Workbench | `admin/workbench`, `open-work.ts` | 5 | Admin | Y |
| Comms plans & drafts | workbench comms, Prisma | 4–5 | Admin | Y |
| Broadcasts + email | workbench, cron | 4 | Admin | Y |
| Social workbench + monitor | workbench/social, media-monitor, APIs | 4 | Admin | Y |
| Narrative distribution | `admin/narrative-distribution`, `lib/narrative-distribution` | 3 | Admin | Y |
| Message engine (MCE) plan | `docs/`, comms models | 2 | Comms | Y |
| Orchestrator + inbox | `admin/orchestrator`, `inbox`, review | 4 | Admin | Y |
| Owned media + ingest | `owned-media`, scripts | 4 | Admin | Y |
| Voter import + model | `voter-import`, voters | 4 | Data | Y (restricted) |
| County intel + profiles | admin county tools | 4–5 | Field, data | Y |
| Relational | `relational/*` | 3 | Member | Y |
| Member dashboards | `dashboard/*` | 2 | Member | Y |
| Author studio | `api/author-studio` | 3 | Staff/tech | Partial |
| Search / RAG | `api/search`, ingest | 3–4 | Mixed | Partial |

**Last updated:** 2026-04-27
