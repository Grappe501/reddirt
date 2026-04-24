# Campaign Manager dashboard bands (CM-2) (RedDirt)

**Packet CM-2** — thin, **read-only** Campaign Manager bands on **`/admin/workbench`**, consuming **`getTruthSnapshot()`** without bypassing the deterministic truth layer.

**PROTO-1 bundle:** Shipped with **UWR-2** (same pass). **Lanes advanced:** BRAIN-OPS consumer surface (L2→**L3** thin UI), UWR read model widening, blueprint/handoff continuity. **Lanes intentionally not disturbed:** E-1/E-2 queue-first execution, comms send paths, schema/migrations, automation routers, ALIGN-1 persistence, DATA-4 election ingest.

**Cross-ref:** [`deterministic-brain-foundation.md`](./deterministic-brain-foundation.md) · [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md) · [`truth-snapshot.ts`](../src/lib/campaign-engine/truth-snapshot.ts) · [`CampaignManagerDashboardBands.tsx`](../src/components/admin/workbench/CampaignManagerDashboardBands.tsx)

---

## 1. What each band now shows

| Band | Content |
|------|---------|
| **Truth + health** | Six `TruthMetric` cards from `snapshot.truth`: county goals, election data, compliance docs, seat coverage, financial ledger, open work. Each shows **label**, **status** (`good` / `partial` / `missing` / `unknown`), **note** (repo-grounded string from snapshot builder), and a one-line **truth class** hint (`AUTHORITATIVE`, `INFERRED`, etc.). |
| **Health warnings** | `snapshot.health.warningGroups`: **goals**, **compliance**, **finance**, **seats**, **pipeline**, **other** — same strings as BRAIN-OPS-3; empty groups render as “None in this group.” |
| **Governance** | `snapshot.governance`: **review required**, **advisory only**, **blocked** — compact lists; empty blocked is normal. |
| **Division command grid** | Eight level-3 divisions (CM, Communications, Field, Data, Finance, Compliance, Talent, Youth): **maturity** label (from [`system-maturity-map.md`](./system-maturity-map.md)), **open work hint** where counts exist (from `snapshot.openWorkCounts`), **gap note** (honest, includes truth/election/compliance cues), **primary workbench link**. |

---

## 2. What is real vs thin/placeholder

| Aspect | Real | Thin / placeholder |
|--------|------|---------------------|
| Truth metrics + notes | Yes — from `getTruthSnapshot()` only | — |
| Warning + governance text | Yes — same objects as JSON block | — |
| Division maturity | Static labels aligned to blueprint (not computed from DB) | No per-division “health score” |
| Division open-work hints | Real **global** counts from `openWorkCounts` (sums by division heuristic) | Not seat-scoped; not “for me”; Data/Finance/Compliance/Talent/Youth often **—** |
| Election / compliance / budget narrative | Mirrors truth band (no duplicate logic) | — |

---

## 3. Which models / helpers feed each band

| Band | Primary code |
|------|----------------|
| Truth + health | `truth-snapshot.ts` → Prisma (`County`, `CountyCampaignStats`, `CountyVoterMetrics`, `ComplianceDocument`, `FinancialTransaction`, …), `getLatestVoterFileSnapshot`, `getCoverageSummary`, `getOpenWorkCountsBySource` |
| Warnings / governance | Built inside `getTruthSnapshot()` (BRAIN-OPS-3 rules) |
| Division grid | `CampaignManagerDashboardBands.tsx` + `snapshot.openWorkCounts` (UWR-2 shape) + static copy |
| Raw JSON (unchanged) | Same snapshot object; collapsible `<details>` below bands |

---

## 4. What is still missing for full L3 CM dashboard

- **Per-operator “for me”** on the hub (actor-scoped open work summary).
- **County / lane filters** applied to unified open work and snapshot context.
- **Time-based staleness** thresholds (explicitly out of scope for BRAIN-OPS-2/3).
- **Command Bar / recommendation band** per full [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md) (not built).
- **Dedicated CM shell** (single-purpose `/admin/cm` or similar) — still using main workbench page.

---

## 5. What CM-3 should do next

- Optional **drill-down** from a truth card to the underlying admin route (e.g. compliance list, seats) with **no** new metrics.
- **Actor-scoped** band row (“your open work” via `getOpenWorkForUser`) when product wants it — still read-only.
- Tighten **division grid** with seat roll-ups (`vacantUnderCampaignManager`, etc.) **only** if sourced from existing `getCoverageSummary` / snapshot fields.

---

*Last updated: Packet CM-2 (with UWR-2 under PROTO-1).*
