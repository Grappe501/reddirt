# Feature Area — Index

**Purpose:** Rollup to `inventories/FEATURE_INVENTORY.md`. **Maturity** uses 0–6 (see `SYSTEM_READINESS_REPORT.md`).

| Feature area | Primary paths | Serves | Maturity (Pass 1) | In manual? |
|--------------|---------------|--------|-------------------|------------|
| Public site | `(site)/*` | Public | 5 | Yes |
| Organizing intelligence | `organizing-intelligence/*` | Public, org | 4 | Yes |
| County command | `counties/*`, `County` model | Public, leaders | 5 | Yes |
| County v2 (Pope) | `county-briefings/pope/v2` | Demo + pattern | 4 | Yes |
| Get Involved / pathways | `get-involved` | Public | 5 | Yes |
| Power of 5 onboarding | `onboarding/power-of-5` | Public, members | 3–4 | Yes |
| Conversations & Stories | `messages` | Public | 4 | Yes |
| Relational | `relational/*` | Members | 3 | Yes, gated |
| Member dashboards | `dashboard/*` | Vol / leader | 2 | Yes, stub |
| Admin Workbench | `admin/workbench/*` | Admin, CM | 5 | Yes |
| Form / intake API | `api/forms` | System | 5 | Yes |
| WorkflowIntake | Prisma, open-work | Ops | 5 | Yes |
| Comms workbench | plans, broadcasts, email | Comms | 4–5 | Yes |
| Social workbench + monitor | workbench/social, media-monitor | Comms, digital | 4 | Yes |
| Narrative distribution | `admin/narrative-distribution`, lib | Comms | 3 | Yes |
| Message engine (MCE) | plans + `docs/…SYSTEM_PLAN` | Comms | 2 | Yes |
| Orchestrator + inbox | `orchestrator`, `inbox`, `review-queue` | Content ops | 4 | Yes |
| Owned media + ingest | `owned-media`, scripts | Content, data | 4 | Yes |
| Voter + import + model | `voter-import`, `voters/[id]/model` | Data, ops | 4 | Yes (restricted) |
| County intel / profiles | `county-intelligence`, `county-profiles` | Data, field | 4–5 | Yes |
| Events + tasks + calendar | `events`, `tasks`, workbench/calendar | Field, ops | 4–5 | Yes |
| Search / assistant RAG | `api/search`, `api/assistant` | Staff / public search | 3–4 | Limited (not volunteer product) |
| Author studio APIs | `api/author-studio/*` | Internal | 3 | Internal chapter only |
| Financial / budget | `financial-transactions`, `budgets` | Finance | 4 | Yes, restricted |
| Compliance docs | `compliance-documents` | Compliance | 4 | Yes, restricted |
| Webhooks + cron | `api/webhooks/*`, `api/cron/*` | Technical | 5 | Technical chapter |

**Detail:** `inventories/FEATURE_INVENTORY.md`, `inventories/DASHBOARD_INVENTORY.md`, `inventories/COMPONENT_INVENTORY.md`.
