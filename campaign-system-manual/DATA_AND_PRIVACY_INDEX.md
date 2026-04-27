# Data, Privacy, and Permissions — Index

**Purpose:** Entry point to **Data, Privacy, and Permissions** in the manual (`chapters/15-data-privacy-and-permissions/`). This index summarizes **where policy lives in repo docs** and **where enforcement lives in code** (see inventories for tables).

## Principles (non-negotiable in product)

- **Aggregate-first** on public and most volunteer surfaces — no public voter microtargeting (DATA-1, OIS plans).  
- **Voter file** is **stewarded reference** for authorized roles — not a public people browser.  
- **Relational** data carries **consent and visibility** rules (Power of 5 plan; `RelationalContact` in Prisma).  
- **Honest segments** in comms — see `docs/launch-segmentation-and-response-foundation.md` and `docs/identity-and-voter-link-foundation.md` where applicable.

## Key documents (RedDirt `docs/`)

| Topic | Document |
|--------|----------|
| Data targeting / county goals | `docs/data-targeting-foundation.md` (DATA-1) |
| Identity ↔ voter | `docs/identity-and-voter-link-foundation.md` (IDENTITY-1) |
| Volunteer data gaps | `docs/volunteer-data-gap-analysis.md` |
| Privacy & trust (site) | `docs/WEBSITE_PASS_05_PRIVACY_TRUST_REPORT.md` |
| Public trust page | `src/app/(site)/privacy-and-trust/` |
| Database inventory | `docs/database-table-inventory.md` (DBMAP-1) |

## Key implementation surfaces (see `inventories/DATA_MODEL_INVENTORY.md`)

- `VoterRecord`, `VoterFileSnapshot`, `CountyVoterMetrics` — file-driven reference data  
- `ContactPreference` — suppression and channel consent  
- `RelationalContact` — REL-2 relational graph (staff/ops)  
- `FormSubmission` + `WorkflowIntake` — public intake; operator review  
- `User`, `VolunteerProfile` — member context (incomplete for full P5 product until future packets)

## Manual chapters to complete

- Retention and deletion policy (legal/counsel)  
- Data Processing Agreement (DPA) and vendor list (ops)  
- **Role → permission** matrix: who may see voter rows, exports, and PII  
- **Escalation** for suspected breach or misuse

**Cross-link:** `chapters/15-data-privacy-and-permissions/README.md`, `workflows/TASK_QUEUE_AND_APPROVALS.md`, `inventories/ROUTE_INVENTORY.md` (admin-gated routes).
