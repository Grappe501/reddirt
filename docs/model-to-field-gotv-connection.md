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

- **Code:** `src/lib/campaign-engine/gotv-read-model.ts` — `getGotvPriorityUniverse`, `getGotvSummary` (filters: `countyId`, `precinct`, `FieldUnit` via **relational** links). **Reasons** are **only** from **relational** count, **interaction** recency, **geography** filter context, and **missing** **history** — **no** AI **scoring**, **no** support **inference**, **no** **turnout** **math** **unless** **explicit** **historical** **fields** **already** **exist** **elsewhere** (this packet does **not** add any).
- **`gotv-contact-plan.ts`:** `buildGotvContactPlanPreview` — **scope** **summary** + **suggested** **buckets** (**relational-first**, **needs-touch**, **recently-contacted**, **missing-data**); **no** **send**, **no** **queue** **rows**, **no** **assignments** (**GOTV-2** **seam**).
- **Admin:** `/admin/gotv` (read-only table + **links** to `…/voters/[id]/model` and **relational** **contact** when present).

**Forward path:** **GOTV-2** = queues + assignment review · **GOTV-3** = field execution dashboard · **GOTV-4** = governed automation only after approval rails.

---

*Last updated: REL-2 + **REL-3** + **GOTV-1** (read model + preview seam + `…/gotv`).*
