# Master blueprint expansion rules (PROTO-1 companion) (RedDirt)

**Purpose:** Every pass **strengthens** the continuity artifacts so ChatGPT / humans / Cursor share one evolving map—**concrete** obligations, not vibes.

**Cross-ref:** [`progressive-build-protocol.md`](./progressive-build-protocol.md) · [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)

---

## What must get stronger each pass

### 1. Doctrine layer

- **Truth + governance:** Pointers to [`deterministic-brain-foundation.md`](./deterministic-brain-foundation.md), [`truth-governance-ownership-map.md`](./truth-governance-ownership-map.md), `truth.ts`, `truth-snapshot.ts` when code changes.
- **Build method:** PROTO-1 (`progressive-build-protocol.md`) and this file referenced from `docs/README.md` and engine README when packets land.
- **Non-goals:** Re-affirm **no** blind auto-send, **no** inference presented as authority.

### 2. Structural map

- **FND-1:** New § in `unified-campaign-engine-foundation.md` for each significant packet (or explicit edit to existing §).
- **Tables / models:** If code touches Prisma, ensure [`database-table-inventory.md`](./database-table-inventory.md) or packet doc lists affected models (DBMAP-1 hygiene).

### 3. System rails

- **`shared-rails-matrix.md`:** Update the row for each rail **materially** touched—**evidence** (file paths), **gaps**, **first step**, **footer** “Last updated” packet list.
- **Do not** leave “planned” language where “shipped” is true; **do not** claim shipped without a path.

### 4. Delivery lanes

- **Workbench / routes:** `workbench-build-map.md`, `campaign-manager-orchestration-map.md`, or packet doc must mention new **operator paths** (e.g. `/admin/workbench` truth JSON).
- **Lane level (L0–L5):** State the **new** level for the rail or feature (see PROTO-1 §4).

### 5. Packet progression map

- **`PROJECT_MASTER_MAP.md`** (or single continuity file): Add packet id, one-line outcome, dependency, and **unlock**.
- **`next-build-sequence.md`** / **`email-workflow-intelligence-AI-HANDOFF.md`:** Align “what shipped” / “not built” bullets so the next thread does not re-litigate.

### 6. Source-of-truth notes

- Per domain: **authoritative field**, **mirror**, **provisional** (e.g. raw JSON on disk), **advisory** (Wikipedia chunks).
- When adding read models (`truth-snapshot.ts`), **document** which Prisma fields power each signal—**no** mystery metrics.

### 7. Known reuse opportunities

- Explicit bullet: “Prefer `getCoverageSummary` over duplicating seat SQL,” “extend `truth-snapshot` not new `health.ts`,” etc.
- If a packet **duplicates** logic, the blueprint must say **why** (temporary) and the **dedupe** owner packet.

---

## Concrete checklist (copy into PR / packet close-out)

- [ ] Master map / handoff updated with packet id + unlock
- [ ] FND-1 or packet § added
- [ ] Rails matrix row + footer updated
- [ ] `docs/README.md` table row if operators need to find the work
- [ ] `src/lib/campaign-engine/README.md` if under campaign-engine
- [ ] Source-of-truth sentence for any new metric
- [ ] Lane level (L?) stated
- [ ] PROTO-1 drift check answered

---

*Last updated: Packet PROTO-1 (master blueprint expansion rules).*
