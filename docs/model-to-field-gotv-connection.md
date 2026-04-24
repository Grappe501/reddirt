# Model → field → GOTV — connection map (RedDirt)

**Purpose:** Ties **voter modeling** (VOTER-MODEL-1), **field geography** (FIELD-1, counties), and **GOTV readiness** (planning docs + `VoterVotePlan` / `VoterInteraction`) without implying automated outreach or vote counts.

## REL-2 — Relational contact layer

- **`RelationalContact`** links a **volunteer owner** (`User`) to **named** people in their network, with optional **`County`** / **`FieldUnit`** and optional **`VoterRecord`** after **human** match (`setRelationalContactVoterMatch` or staff flows).
- **`recordRelationalTouch`** is the write seam for a logged touch: it can create **`VoterInteraction`** (with `relationalContactId`) and optionally **`VoterSignal`** when explicitly requested—**no** auto-classification, **no** message send.
- **GOTV use:** `organizingStatus` and interaction/vote-plan data on the **matched** voter (when present) support **narrative** and **work planning**; relational contact counts are **not** ballot totals or modeled vote math.

## REL-3 — Volunteer relational home (field activation)

- **`/relational`** (after email sign-in to an existing **`User`**) is the first **volunteer-facing** surface: **CRUD** for **own** contacts, **rollups** (`getUserRelationalSummary`), **light dedupe** signals (`findPotentialDuplicates` — **no** merge), interaction logging with **notes** when no voter is matched.
- **Field / GOTV bridge:** named people and touches now have a **product path** for organizers; still **no** auto-messaging, **no** support classification in this packet.

**See:** [`relational-contact-implementation-foundation.md`](./relational-contact-implementation-foundation.md) · [`gotv-strategic-readiness-foundation.md`](./gotv-strategic-readiness-foundation.md)

## GOTV-1 — Turnout priority read model (operational, not predictive)

- **Code:** `src/lib/campaign-engine/gotv-read-model.ts` — `getGotvPriorityUniverse`, `getGotvSummary`, `getGotvExplainablePriorityReasons` (filters: `countyId`, `precinct`, `FieldUnit` via **relational** links). **Reasons** are **only** from **relational** count, **interaction** recency, **geography** filter context, and **missing** **history** — **no** AI **scoring**, **no** support **inference**, **no** hidden ranking.

## GOTV-2 — Contact plan review (read-only operator preview)

- **`gotv-contact-plan.ts`:** `buildGotvContactPlanPreview` — overlapping **discussion** buckets (counts can overlap). **`buildGotvContactPlanReview`** — **mutually** **exclusive** **review** **buckets** (**relational_first**, **needs_first_touch**, **needs_follow_up**, **recently_contacted**, **missing_data**) with **capped** row samples; **`priorityReason`** on each row matches **GOTV-1** explainability rules.
- **Admin:** `/admin/gotv` — **summary** cards, **bucket** counts, **per-bucket** tables, **CSV preview** (read-only string for copy; `formatGotvContactPlanReviewAsCsv`), **banner**: review-only (no send, no assignment, no support prediction).
- **Not built:** persisted queues, volunteer assignment, governed file download / outbound sheet rail (**optional GOTV-3+** if product requires it).

**Forward path:** **GOTV-3** = reviewed assignment workflow · **GOTV-4** = field execution dashboard · **GOTV-5** = governed automation only after approval rails.

---

## COUNTY-PROFILE-ENGINE-1 — County political profile (read path)

- **`buildCountyPoliticalProfile`** in **`src/lib/campaign-engine/county-political-profile.ts`** joins **DATA-4** election rows (by **County.id** or **FIPS** / **countyNameRaw** fallback) with **aggregate** **relational** / **voter** / **volunteer** **ask** **counts** when a real **County** **id** exists.
- **Power of Five** / **`isCoreFive`** / **`powerOfFiveSlot`** on **`RelationalContact`** are referenced in **`engagementPlan.relationalOrganizing`** for **briefing** **text** — **no** **PII** on **public** **`/county-briefings/pope`** or **static** **zip**.
- **GOTV bridge:** profile’s **pathToVictory** and **volunteerAndContactProfile** are **planning** **only**; **GOTV-1/2** remain the **operational** **read** **models** for **contact** **plan** **previews**.

## COUNTY-INTEL-2 — Workbench + static (aggregate)

- **Workbench:** **`/admin/county-intelligence`** — 50K progress, file registration summary, **aggregate** **drop-off**, “how we win” narrative, Hammer title buckets — **not** a substitute for person-level field lists (those stay in governed tools).
- **Static zip:** all volunteer CTAs point to **kellygrappe.com**’s volunteer URL — no local intake.
- **GOTV:** unchanged — **GOTV-1/2** for operational review; **COUNTY-INTEL-2** does **not** add public voter scores.

*Last updated: REL-2 + **REL-3** + **GOTV-1** + **GOTV-2** + **COUNTY-PROFILE-ENGINE-1** + **COUNTY-INTEL-2** (`…/gotv` contact-plan review + read-only CSV preview; election gate `COMPLETE` on local dev before this slice — verify per DB).*
