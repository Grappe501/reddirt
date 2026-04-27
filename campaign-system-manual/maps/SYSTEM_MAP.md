# System map

**See also:** `../SYSTEM_MAP_INDEX.md` (Mermaid) · `DASHBOARD_MAP.md` (URLs)

## Layers (conceptual)

1. **Public** — site, OIS, counties, get-involved, P5 onboarding, messages.  
2. **Member (planned)** — `/dashboard` / `/dashboard/leader` (auth TBD).  
3. **Admin / Workbench** — `ADMIN` session, operator queues.  
4. **Data** — Postgres/Prisma; voter reference; comms; social; content.

## Intake spine

`POST /api/forms` → persistence → **`WorkflowIntake`** → workbench, tasks, comms, social (linked).

## Cross-domain links

- **County** public pages ↔ **admin** county editors ↔ **OIS** (partial).  
- **Comms** plans may reference **`sourceWorkflowIntakeId`**.  
- **Narrative distribution** may reference **`linkedWorkflowIntakeId`** in types per `narrative-distribution/types`.

**Last updated:** 2026-04-27
