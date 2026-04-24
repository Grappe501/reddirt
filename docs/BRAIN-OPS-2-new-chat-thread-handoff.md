# BRAIN-OPS-2 — New ChatGPT thread handoff bundle

**Purpose:** Single file to paste or attach when starting a **new ChatGPT thread** so a planner can update the master build blueprint without re-deriving repo facts.

**Work protocol (summary):** Cursor implements repo-grounded packets; you paste results here → ChatGPT advances the master plan and records **deep** system facts surfaced from code/docs.

**Repo:** `RedDirt` (package `reddirt-site`). **Quality:** `npx tsc --noEmit` (and `npm run check` before pushes).

---

## Packet BRAIN-OPS-2 — Truth Snapshot Engine

**Doctrine (unchanged from BRAIN-OPS-1):** read-only, deterministic, repo-grounded, no speculation, no fake AI authority, no UI-heavy work.

### Implemented

- **`getTruthSnapshot(): Promise<TruthSnapshot>`** in `src/lib/campaign-engine/truth-snapshot.ts`.
- Types: `TruthSnapshot`, `TruthMetric`, `TruthMetricStatus`; **`truthClass`** uses **`TruthClassId`** from `truth.ts` (same values as `TruthClass.*` constants).
- **Signals (real DB / existing helpers only):**
  - **County goals:** `prisma.county.count()`, `prisma.countyCampaignStats.count({ registrationGoal: { not: null } })` → good if ≥ half of counties have goals; **truthClass** `AUTHORITATIVE`.
  - **Election data:** No Prisma election-result models (constant `ELECTION_RESULTS_INGESTED_TO_DB = false`); status **missing**, **truthClass** `PROVISIONAL`, note references on-disk JSON path per doctrine (not runtime `fs` check).
  - **Compliance:** `ComplianceDocument` total + `approvedForAiReference` counts → good/partial/missing; **truthClass** `AUTHORITATIVE` when any doc is AI-approved, else `UNAPPROVED_FOR_AI` for uploads not cleared for RAG.
  - **Seat coverage:** `getCoverageSummary()` from `seating.ts` → staffed = filled+acting+shadow vs `totalPositions`; **truthClass** `AUTHORITATIVE`.
  - **Budget / ledger:** `financialTransaction.groupBy({ by: ["status"] })` → CONFIRMED vs DRAFT; **truthClass** `AUTHORITATIVE` when CONFIRMED exists; drafts → `UNAPPROVED_FOR_AI` or partial mix.
  - **Open work:** `getOpenWorkCountsBySource()` from `open-work.ts`; status always **good**, **truthClass** `INFERRED`.
- **Health:** `missingData` lists election ingest gap, no per-volunteer goals in schema, no `RelationalContact`-equivalent; `staleData` empty; `conflicts` empty; `warnings` for vacant seats, drafts, unapproved compliance.
- **Governance:** `blocked` empty; `reviewRequired` for unapproved compliance + draft ledger rows; `advisoryOnly` for election + Wikipedia reference context.
- **UI:** `/admin/workbench` — collapsible `<details>` with `JSON.stringify` of snapshot (`generatedAt` as ISO string).

### Key files

| Path | Role |
|------|------|
| `src/lib/campaign-engine/truth-snapshot.ts` | BRAIN-OPS-2 implementation |
| `src/lib/campaign-engine/truth.ts` | BRAIN-OPS-1 `TruthClass`, `GovernanceState`, … |
| `src/lib/campaign-engine/open-work.ts` | `getOpenWorkCountsBySource` |
| `src/lib/campaign-engine/seating.ts` | `getCoverageSummary` |
| `src/app/admin/(board)/workbench/page.tsx` | Minimal truth snapshot hook |
| `prisma/schema.prisma` | `County`, `CountyCampaignStats`, `ComplianceDocument`, `FinancialTransaction`, `PositionSeat` — **no** election-result tables |

### Doc updates (BRAIN-OPS-2)

- `docs/unified-campaign-engine-foundation.md` — §38
- `docs/email-workflow-intelligence-AI-HANDOFF.md` — §40
- `docs/shared-rails-matrix.md` — deterministic truth row + footer
- `docs/README.md` — table row
- `src/lib/campaign-engine/README.md` — bullet

---

## Part G — Repo inspection answers (for master plan)

1. **Easy vs hard signals:** **Easy:** county goal counts, compliance counts, ledger `groupBy`, open-work counts (existing queries). **Medium:** seat coverage (delegates to `listPositionSeats` + ROLE-1 tree). **Hard / not done:** mirror integrity (`CountyVoterMetrics.countyGoal` vs `registrationGoal`), staleness without a single timestamp convention, election readiness beyond “no tables.”

2. **Missing data (entirely):** Ingested **election results** in DB (DATA-4); **relational contact** model (REL-2); **per-volunteer** goal breakdown in Prisma; unified **open work index** table (FND-1 gap).

3. **Biggest blocker to a real dashboard:** No single **CM shell** truth panel wired to spec bands; many signals still live on separate workbenches; **election** and **relational** domains are structurally empty for “percent-to-goal” style narratives.

4. **BRAIN-OPS-3 candidate:** Deterministic **mirror / conflict** checks (e.g. goals vs latest metrics snapshot), optional **staleness** from `pipelineLastSyncAt` / review enums, and a **typed** export for CM dashboard (without building full UI) — or **UWR-2** slice if unified index is prioritized (orthogonal; matrix lists both).

---

## Download / path

There is no hosted download URL in-repo. Use the workspace file path:

`h:\SOSWebsite\RedDirt\docs\BRAIN-OPS-2-new-chat-thread-handoff.md`

Copy that file into ChatGPT or sync via your drive; same content is also merged into `unified-campaign-engine-foundation.md` §38 and `email-workflow-intelligence-AI-HANDOFF.md` §40.

---

*Generated for continuity with Packet BRAIN-OPS-2 — April 2026.*
