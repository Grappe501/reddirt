# Narrative distribution — admin command center (prototype)

**Lane:** `H:\SOSWebsite\RedDirt` only.  
**Date:** 2026-04-27.  
**Scope:** Additive admin UI prototype — **demo/seed data only**. **No** live publishing, **no** external APIs, **no** private voter data, **no** changes to auth/session code paths (reuses existing `requireAdminPage`).

---

## 1. Purpose

Ship a **read-only command-layout** so staff can visualize how narrative distribution orchestration could appear in admin: KPI strip, amplification queue, story pipeline, geography lists, channel readiness, editorial columns, and feedback needs. Vocabulary follows the narrative distribution types report (**story**, **packet**, **distribution**, **organizing insights**) — not vendor hype or implied machine authorship of campaign copy.

---

## 2. Route and access

| URL | File |
|-----|------|
| `/admin/narrative-distribution` | `src/app/admin/narrative-distribution/page.tsx` |

The page lives **outside** the `(board)` route group (per routing preference) but **wraps** `AdminBoardShell` and calls **`await requireAdminPage()`** so behavior matches other gated admin surfaces. **`export const dynamic = "force-dynamic"`** preserves cookie/session reads.

**Navigation:** `AdminBoardShell` → Campaign operations → **Narrative distribution**.

---

## 3. Data sources

| Layer | Source |
|-------|--------|
| Packet + asset titles | `DEMO_NARRATIVE_PACKETS`, `getDemoNarrativePacketById` in `src/lib/narrative-distribution/assets.ts` |
| Command center-only seeds | `buildNarrativeAdminCommandCenterModel()` in `src/lib/narrative-distribution/demo-admin-command-center.ts` |
| Region labels | `ARKANSAS_CAMPAIGN_REGIONS` in `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` |

Amplification rows, story intakes, county/region plans, channel readiness, editorial column overrides, and feedback needs are **synthetic** for layout and typing exercise only.

---

## 4. UI blocks (built)

1. **Overview KPI strip** — counts from demo registry + seed rows (not telemetry).  
2. **Amplification queue** — ordered table: ask title, packet, script reference (template or asset id), channel hints, due date.  
3. **Story pipeline** — `StoryIntake` cards (theme summary + geography + categories).  
4. **County packet list** — `CountyNarrativePlan` table with gap chips; link to public OIS county stub `/organizing-intelligence/counties/[slug]`.  
5. **Region packet list** — `RegionNarrativePlan` for all eight campaign regions; link to `/organizing-intelligence/regions/[slug]`.  
6. **Channel readiness cards** — one card per `NarrativeChannel` with demo posture (`ready`, `needs_asset`, `blocked_compliance`, `scheduled`).  
7. **Editorial status board** — horizontal columns for each `EditorialStatus`; packets placed using a **demo-only** `editorialStatusView` map (mixed statuses for layout).  
8. **Feedback needs panel** — staff handoffs (owner role label, due date, linked packet title).

**Prototype banner** at top states: no publishing actions, no sends, no voter-linked fields.

---

## 5. Components

| Path | Role |
|------|------|
| `src/components/narrative-distribution/admin/NarrativeDistributionCommandCenter.tsx` | Composes all sections |
| `src/components/narrative-distribution/admin/NarrativeAdminSection.tsx` | Section header pattern |
| `src/components/narrative-distribution/admin/NarrativeAdminKpiStrip.tsx` | KPI cards |
| `src/components/narrative-distribution/admin/NarrativeAmplificationQueue.tsx` | Queue table |
| `src/components/narrative-distribution/admin/NarrativeStoryPipeline.tsx` | Intake list |
| `src/components/narrative-distribution/admin/NarrativeCountyPacketList.tsx` | County table |
| `src/components/narrative-distribution/admin/NarrativeRegionPacketList.tsx` | Region table |
| `src/components/narrative-distribution/admin/NarrativeChannelReadinessGrid.tsx` | Readiness cards |
| `src/components/narrative-distribution/admin/NarrativeEditorialStatusBoard.tsx` | Status columns |
| `src/components/narrative-distribution/admin/NarrativeFeedbackNeedsPanel.tsx` | Feedback list |
| `src/components/narrative-distribution/admin/index.ts` | Barrel exports |

---

## 6. Explicit non-goals (this packet)

- No **publish**, **send**, or **post** buttons; no enqueue to email/social execution.  
- No Prisma or WorkflowIntake wiring.  
- No voter file or relational roster fields.  
- No new environment variables or third-party HTTP calls.  
- No **“AI”** product wording in the UI copy for this prototype.

---

## 7. Verification

From the RedDirt folder:

```bash
npm run check
```

---

## 8. Related docs

- [`NARRATIVE_DISTRIBUTION_TYPES_REPORT.md`](./NARRATIVE_DISTRIBUTION_TYPES_REPORT.md)  
- [`NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md`](./NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md)  
- [`docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`](./audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md) (admin route conventions)

---

**End of report.**
