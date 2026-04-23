# POD system + Power of 5 — foundation (REL-1) (RedDirt)

**Packet REL-1 (Part B).** Translates **Power of 5** and **POD** concepts from organizing practice into **system terms** that can later map to Prisma and UI—without claiming those tables exist today.

**Cross-ref:** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) · [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md) · [`field-structure-foundation.md`](./field-structure-foundation.md) · [`position-system-foundation.md`](./position-system-foundation.md) · [`relational-kpi-foundation.md`](./relational-kpi-foundation.md)

---

## 1. Definitions (system vocabulary)

| Role | Meaning |
|------|---------|
| **POD Leader** | A volunteer or staff **User** accountable for **coaching, check-ins, and rollups** for a small set of volunteers (their “POD”). In ROLE-1 terms, often overlaps with **field** / **county lead** positions—**not** a separate Prisma type in REL-1. |
| **Core 5** | The **five** (approximate; policy can allow 4–6) relational contacts a volunteer commits to **personally** prioritize this cycle. System treats this as the **atomic** coaching unit for reminders and KPIs—not the entire extended network. |
| **Extended network** | Additional layers beyond Core 5 used for **capacity math** (e.g. “each of 5 knows ~5 more → ~25,” then “~125”)—**planning** and **training** constructs. The database should not **force** exact 25/125 counts; optional targets only. |
| **Reporting structure** | **Volunteer → POD Leader → County / Field leadership → Campaign Manager** (conceptual). Matches human accountability; **future** FKs might link `volunteerUserId` to `leaderUserId` or `PositionSeat`. |
| **Scaling logic** | Growth is **multiplicative at the organizing layer**: add volunteers → each brings a Core 5 → extended layers inform **goals**, not vanity metrics. Tech supports **honest** rollups (unique people where dedupe exists) and **warns** when the same contact appears under multiple volunteers (REL-3+). |

---

## 2. Power of 5 in product behavior

- **Default UI mental model:** “Who are your five?” — not “paste 500 numbers.”
- **Cadence:** System may suggest **follow-ups** per contact (REL-2+) without auto-messaging.
- **Quality guardrail:** If KPIs only reward **volume**, organizers game the count; KPIs should pair **reach** with **match quality** and **registration help outcomes** where known (see [`relational-kpi-foundation.md`](./relational-kpi-foundation.md)).

---

## 3. How PODs connect to counties, field units, and positions

### Counties

- **Primary rollup geography:** volunteer’s **`User.county`** string and/or resolved **`County`** row should drive “this POD belongs to **Washington County**” for dashboards.
- **Alignment with goals:** County registration targets live in **`CountyCampaignStats.registrationGoal`**; relational rollups **contribute narrative** (“volunteers named N contacts in county”)—they do **not** replace voter-file-based **`CountyVoterMetrics`** without explicit product rules.

### Field units (FIELD-1)

- **`FieldUnit` / `FieldAssignment`** can anchor **which geographic or team slice** a POD operates in once `FieldUnit`↔`County` mapping is clarified (GEO-1 gap). Optional: `FieldAssignment.positionSeatId` ties a leader to a **seat** for reporting.

### Positions (ROLE-1 / SEAT-1)

- **POD Leader** is a **job**, not necessarily a `PositionSeat` row today—but the org should use the same vocabulary as [`workbench-job-definitions.md`](./workbench-job-definitions.md) so future seating covers “County relational lead” without a parallel hierarchy.
- **`PositionSeat`** can record **who** is the accountable leader for a county POD cluster when REL-2+ wires staffing.

---

## 4. Intentionally not specified in REL-1

- Exact numeric tiers (5 vs 25 vs 125) as **enforced** schema constraints.
- Automatic promotion of volunteers to POD Leader based on metrics (human decision; TALENT-1 advisory only).
- Cross-POD reassignment workflows.

---

*Last updated: Packet REL-1.*
