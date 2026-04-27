# Route — Index

**Purpose:** Map **user-visible routes** to inventory detail. The canonical **admin atlas** is `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md` §18; the canonical **app route list** is generated from `src/app/**/page.tsx` (**139** pages at scan time).

## Buckets

| Bucket | Example patterns | See |
|--------|------------------|-----|
| Public site (marketing, policy) | `/`, `/about`, `/get-involved`, `/privacy` | `inventories/ROUTE_INVENTORY.md` |
| Organizing (OIS) | `/organizing-intelligence`, `/organizing-intelligence/regions/…` | DASHBOARD audit §2–3, `maps/DASHBOARD_MAP.md` |
| County | `/counties`, `/counties/[slug]`, `/county-briefings/…` | County plan, audit |
| Onboarding / member | `/onboarding/power-of-5`, `/dashboard` | P5 plan; dashboards placeholder |
| Relational | `/relational`, `/relational/…` | `inventories/ROUTE_INVENTORY.md` |
| Admin — board shell | `/admin/…` under `(board)` | §18.1–18.2 audit |
| Admin — county workbench | `/admin/counties`, `/admin/counties/[slug]` | Outside `(board)` layout (audit) |
| API | `src/app/api/**/route.ts` | 34+ routes — see `inventories/ROUTE_INVENTORY.md` |

## Critical path (operators)

- **`/admin/login`** then **`/admin/workbench`**  
- **Intake:** `POST` **`/api/forms`** (JSON)  
- **Tasks:** `/admin/tasks`  
- **Comms:** `/admin/workbench/comms/…`  

**Full table:** `inventories/ROUTE_INVENTORY.md` (Pass 1 lists major routes; Pass 2 enumerates all).
