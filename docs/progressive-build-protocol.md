# Progressive build protocol (PROTO-1) (RedDirt)

**Packet:** **PROTO-1** — how every future pass **thickens** the master blueprint without loosening guardrails, and how packet batching scales.

**Cross-ref:** [`master-blueprint-expansion-rules.md`](./master-blueprint-expansion-rules.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md)

---

## 1. NORTH STAR

The build method is **progressive**, not big-bang:

- **One level at a time** — advance a rail or packet along the lane scale (L0→L5) with a **named** outcome; avoid “do everything” passes.
- **The blueprint gets denser on every pass** — each packet **updates** the master map: what exists in code, what is docs-only, what is blocked, what reuses what.
- **Guardrails must tighten, not loosen** — queue-first comms, deterministic truth classes, no fake authority, campaign-safe boundaries are **defaults**; relaxing them requires an **explicit** governance/doc decision, not drift.
- **Foundations and rules before scope** — doctrine (`deterministic-brain-foundation.md`, PROTO-1, rails matrix) and **read models** precede large UI, automation, or schema expansion.

---

## 2. PACKET RULES

Every packet **must**:

1. **Update the master blueprint** — at minimum: `PROJECT_MASTER_MAP.md` (or the repo’s agreed continuity file), plus any packet-specific foundation section in `unified-campaign-engine-foundation.md` / handoff docs.
2. **Restate source-of-truth boundaries** — cite authoritative fields vs mirrors (e.g. `CountyCampaignStats.registrationGoal` vs `CountyVoterMetrics.countyGoal` per [`county-registration-goals-verification.md`](./county-registration-goals-verification.md)); do not imply dashboards or AI outputs override those rules.
3. **Identify lanes advanced and lanes not to disturb** — name rails touched (from [`shared-rails-matrix.md`](./shared-rails-matrix.md)) and **explicitly** list adjacent lanes that are **out of scope** for this pass.
4. **Inspect the repo for reuse** — before adding types, queries, or routes, search for existing helpers (`open-work.ts`, `seating.ts`, `budget-queries.ts`, `truth-snapshot.ts`, etc.); prefer **extension** over parallel implementations.
5. **Identify what this packet unlocks** — one short “next packet” or “next pair” pointer (dependency-aware).
6. **Distinguish delivery mode** — label the packet (and PR) as **docs-only**, **code (no schema)**, or **schema/migration**; mixed packets must **section** each part.

---

## 3. PACKET SCALING RULES

| Batch size | When to use |
|------------|----------------|
| **1 packet** | Default. Single clear outcome; minimal review surface; unknown risk or new lane. |
| **2 related packets** | Allowed when **one** is a **read model / doctrine** extension and the other is a **thin consumer** (e.g. BRAIN-OPS-2 snapshot + workbench JSON), or when **two docs** formalize one protocol (e.g. PROTO-1 + blueprint expansion rules). Both must cite the same rails and **not** widen scope mid-flight. |
| **3 within one lane family** | Only when all three advance the **same** rail family (e.g. truth + handoff + matrix row) and **no** migration; requires short drift checklist in the PR description. |
| **5+ items** | **Not** default. Only after proven discipline (several clean 1–2 packet merges, CI green, no guardrail regressions). Split into reviewable PRs or document **why** bundling reduces risk. |

---

## 4. LANE LEVELS

Formal scale for **any** rail or packet (FND-1 / matrix rows):

| Level | Meaning |
|-------|--------|
| **L0 — Not started** | No doc or code; idea only. |
| **L1 — Doctrine / foundation** | Architecture doc, vocabulary, guardrails; may be **docs-only** (`truth.ts`, PROTO-1). |
| **L2 — Read model / scaffolding** | Deterministic queries, DTOs, aggregates; **no** heavy UI, **no** automation side effects (`truth-snapshot.ts`, UWR-1 lists). |
| **L3 — Usable product surface** | Operator can complete a job on one path (admin page, workbench section) with clear limits. |
| **L4 — Integrated with adjacent lanes** | Same object or read model consumed across 2+ domains (e.g. seats + assignment narrative + workbench). |
| **L5 — Automated and governed** | Machines may act **only** under explicit policy, audit, and rollback; **not** the default target for campaign-core rails. |

**Rule:** Skip levels **only** with an explicit exception note in the blueprint (e.g. emergency hotfix), and plan backfill to the missing level.

---

## 5. DRIFT CHECK

Future packets (and PR descriptions) should report:

| Question | What to write |
|----------|----------------|
| **Where did Cursor / implementers stay in the rails?** | List rails touched; cite files; confirm queue-first / truth posture unchanged. |
| **Where did implementation drift or overreach?** | Any UI beyond “thin consumer,” new automation, speculative fields, or schema without packet approval. |
| **What needs correction?** | Follow-up doc issue, revert plan, or **next** packet to realign (e.g. move logic from UI into read model). |

**PROTO-1 expectation:** A short **Drift check** subsection in packet notes or PR body becomes **habitual**, not optional for architecture-first work.

---

*Last updated: Packet PROTO-1.*
