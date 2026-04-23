# Geographic unification — foundation (GEO-1) (RedDirt)

**Scope:** **Conceptual** alignment for future work. **No Prisma migrations in GEO-1.**

---

## 1. North star

**One mental model of geography** — state → (optional) region → **county** (primary) → (optional) **precinct** as import string — so that **voter file**, **field**, **comms**, **media**, and **data targeting** can be discussed without each team inventing a different “where.”

**Reality check:** the database already has **multiple technical representations** (FK, slug, FIPS, free text, JSON, `FieldUnit` without FK). Unification in GEO-1 means **naming the spine and the gaps**, not pretending one row type exists everywhere.

---

## 2. Levels (hierarchy)

| Level | What exists in Prisma today | Notes |
|-------|-----------------------------|--------|
| **State** | Implied (single-tenant AR campaign) | No `State` model; not required for v1. |
| **Region** | `County.regionLabel` | Human grouping for pages and maps. |
| **County** | **`County`** + FK from many models | **Canonical operational unit** for public pages and voter rollups. |
| **Precinct** | **`VoterRecord.precinct`** (string) | **No** master precinct table; **not** a GIS layer in schema. |
| **Field sub-unit** | **`FieldUnit`** tree (`COUNTY` / `REGION`) | **Organizational** — **must be aligned** to `County` by **naming/ops**, not DB constraint. |

---

## 3. Principles (non-negotiable for future design)

1. **County = canonical operational unit** for anything that is **voter**-, **public-page**-, or **stats**-shaped. Prefer **`County.id`** when adding **new** nullable FKs to operational rows (follow patterns like `WorkflowIntake`, `CommunicationThread`).

2. **`VoterRecord` county = source of truth for that voter** — from SOS import (`countyId` + FIPS + slug denorm). `User.county` or form text can **diverge**; linking uses **`linkedVoterRecordId`** when present.

3. **`FieldUnit` with `type = COUNTY` = field ownership** — not automatically the same as `County` row; **product** should treat “field lead for Pulaski” as **joining** `FieldUnit` name/slug to `County` in app or by future optional FK (not in GEO-1).

4. **Comms and media “should reference county when relevant”** — today **many** tables use **inference** (event, intake) or **JSON**. New features should **prefer explicit FK** where staff expect filtering (e.g. thread, intake) and **document JSON** where flexibility is intentional (broadcast segments).

5. **Strings (`countySlug`, `countyFips`)** remain valid for **ingest, connectors, and denormalized exports** — but **dashboards** that slice by county should **resolve** to `County` when possible to avoid split-brain.

---

## 4. What to unify later (no schema in GEO-1)

| Area | Current state | Unification direction (future packets) |
|------|----------------|----------------------------------------|
| **Comms targeting** | JSON in segments, indirect via event/intake | Document **one** rule format for `ruleDefinitionJson` / `audienceDefinitionJson` when product is ready; optional materialized “county” on sends for reporting. |
| **Social workbench** | No `countyId` on `SocialContentItem` | Optional FK or guaranteed join path via intake/event; or explicit county on publish. |
| **Volunteer routing** | `User` string, `EventSignup`/`TeamRoleAssignment` FKs, `FieldAssignment` | **Join rules**: prefer voter-linked county → `County` → field assignment. |
| **Media Center** | Strong on `OwnedMediaAsset`; weak on `MediaOutreachItem` | Backfill `countyId` on assets; add **optional** county on outreach or enforce via plan/intake. |
| **Dashboards** | Metrics split across `CountyVoterMetrics`, `CountyCampaignStats`, `EventAnalyticsSnapshot` | **One county dashboard read model** (view or app layer) that joins documented tables — see [`county-dashboard-foundation.md`](./county-dashboard-foundation.md). |

---

*GEO-1 — conceptual unification. Inventory: [`geographic-county-mapping.md`](./geographic-county-mapping.md).*
