# Field structure — foundation (FIELD-1) (RedDirt)

**FIELD-1** adds a **minimal, campaign-owned** geographic / field **hierarchy** and **assignments** so **positions**, **seats (SEAT-1)**, and **field leadership** can be tied together **without** GIS, without duplicating the public `County` content model, and without building district maps in v1.

**Code / schema:** `prisma/schema.prisma` (`FieldUnit`, `FieldAssignment`, `FieldUnitType`) · `src/lib/campaign-engine/field.ts` (read-only list / assignment / county-leader helpers) · this doc.

**Cross-ref:** `County` (public pages / voter / workflow `countyId`) · [`position-system-foundation.md`](./position-system-foundation.md) · [`position-seating-foundation.md`](./position-seating-foundation.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md)

---

## 1. North star

- **Operational geography** for **who covers where** in the org tree, **not** a second voter file and **not** a map product.
- **Interlocks** with **ROLE-1** `positionId` strings and optional **`PositionSeat`** rows so staffing metadata stays aligned with field coverage.
- **Safe default:** start with **county-typed** `FieldUnit` nodes and a **region** parent only when the campaign **chooses** to group counties (e.g. “Central”).

---

## 2. Concepts

| Term | Meaning (FIELD-1) |
|------|-------------------|
| **County** | A **jurisdiction** the campaign already names in the real world. In the **public** product this is the canonical `County` table; in **FIELD-1** a **`FieldUnit` with `type = COUNTY`** is a **parallel operational label** that staff can use when a **dedicated** copy is needed (e.g. different naming, or before mapping to a published county row). **Prefer** linking strategies in a later packet over double-entering; FIELD-1 does not enforce `County` FK. |
| **Region** | **`FieldUnit` with `type = REGION`** — multi-county or narrative grouping (e.g. “NWA block”). **Optional** `parent` / `children` give a **shallow** tree. |
| **District (future)** | Congressional / school-board / other boundaries — **out of scope** in FIELD-1. When added, use **`FieldUnitType` extension** or a separate model **after** org adoption of region/county. |
| **Ownership model** | `FieldUnit` is **data**; **no** “owner” column in v1. **Accountability** is expressed via **`FieldAssignment`**: `fieldUnit` + `positionId` (ROLE-1) + optional `userId` and optional `positionSeatId` (SEAT-1). |

---

## 3. Schema (v1)

- **`FieldUnit`:** `id`, `name`, `type` (`COUNTY` \| `REGION`), optional `parentId` → `FieldUnit`, `createdAt`.
- **`FieldAssignment`:** `fieldUnitId`, **`positionId`** (string, matches `PositionId` in `positions.ts`), optional `userId`, optional `positionSeatId` → `PositionSeat`, `createdAt`.

**Purpose:** tie **geography** to **position + seat**; support **one** person **or** seat-backed coverage without inventing a second RBAC system.

---

## 4. Relation to `County` (public)

- **`WorkflowIntake.countyId`**, events, and content already use the **`County`** row where appropriate. **FIELD-1** does not replace that join path.
- **Integration rule of thumb (later packet):** when a `FieldUnit` (COUNTY) should **mirror** a public county, add an optional `countyId` FK **or** a single naming convention; **not** in FIELD-1.

---

## 5. Out of scope (FIELD-1)

- District GIS, shapefiles, precinct walk lists.
- Auto-sync from public `County` to `FieldUnit`.
- Field-only dashboards, heatmaps, or route optimization.

---

*Last updated: Packet FIELD-1.*
