# Model → field → GOTV — connection map (RedDirt)

**Purpose:** Ties **voter modeling** (VOTER-MODEL-1), **field geography** (FIELD-1, counties), and **GOTV readiness** (planning docs + `VoterVotePlan` / `VoterInteraction`) without implying automated outreach or vote counts.

## REL-2 — Relational contact layer

- **`RelationalContact`** links a **volunteer owner** (`User`) to **named** people in their network, with optional **`County`** / **`FieldUnit`** and optional **`VoterRecord`** after **human** match (`setRelationalContactVoterMatch` or staff flows).
- **`recordRelationalTouch`** is the write seam for a logged touch: it can create **`VoterInteraction`** (with `relationalContactId`) and optionally **`VoterSignal`** when explicitly requested—**no** auto-classification, **no** message send.
- **GOTV use:** `organizingStatus` and interaction/vote-plan data on the **matched** voter (when present) support **narrative** and **work planning**; relational contact counts are **not** ballot totals or modeled vote math.

**See:** [`relational-contact-implementation-foundation.md`](./relational-contact-implementation-foundation.md) · [`gotv-strategic-readiness-foundation.md`](./gotv-strategic-readiness-foundation.md)

---

*Last updated: REL-2 (relational contact + power-of-5 persistence).*
