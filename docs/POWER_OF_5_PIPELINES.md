# Power of 5 — organizing pipelines

**Lane:** `RedDirt/`. **Source of truth:** `src/lib/power-of-5/pipelines.ts`.

## Purpose

The six **organizing pipelines** are the product-facing funnel we visualize on county, region, state (OIS), personal, and leader dashboards. They describe *how* field work ladders from first relational touch to leadership pipeline — without binding to voter files or PII in this module.

## Canonical stages (in order)

| Order | Dashboard id | UI label   | `PowerPipelineId` (`types.ts`) |
|------:|--------------|------------|--------------------------------|
| 1 | `invite`      | Invite      | `invite` |
| 2 | `activation`| Activation  | `activation` |
| 3 | `volunteer` | Volunteer   | `volunteer` |
| 4 | `event`     | Event       | `event` |
| 5 | `follow-up` | Follow-up   | `followup` |
| 6 | `candidate` | Candidate   | `candidate` |

**Note:** The dashboard uses the slug `follow-up` (hyphenated) for clarity in URLs and UI copy. Persistence and `OrganizingActivity` rows should use the legacy key `followup` from `src/lib/power-of-5/types.ts`. Use `toLegacyPowerPipelineId()` in `pipelines.ts` when emitting activities.

## API (TypeScript)

- **`POWER_OF_5_ORGANIZING_PIPELINES`** — readonly array of `{ id, order, label, summary, legacyPowerPipelineId }`.
- **`PowerOf5OrganizingPipelineId`** — union of the six `id` values.
- **`isPowerOf5OrganizingPipelineId(id)`** — type guard.
- **`getPowerOf5OrganizingPipelineById(id)`** — lookup.
- **`toLegacyPowerPipelineId(id)`** — map dashboard id → `PowerPipelineId`.

## UI visualization

**Component:** `src/components/power-of-5/PowerOf5PipelineVisualization.tsx`

- **`variant="compact"`** — numbered pills + labels (default on county/region Power of 5 panels).
- **`variant="full"`** — includes per-stage `summary` text (state OIS, `/dashboard`, `/dashboard/leader`).
- **`activeId`** — optional highlight for demos (e.g. personal dashboard uses `volunteer`, leader dashboard uses `follow-up`).

### Where it renders

| Surface | Integration |
|---------|-------------|
| County command (e.g. Pope v2) | `CountyPowerOf5Panel` — `showOrganizingPipelines` default **true** |
| Region dashboards | `RegionPowerOf5Panel` — same |
| State `/organizing-intelligence` | `StateOrganizingIntelligenceView` — full variant |
| `/dashboard` | `PersonalDashboardView` — full variant + demo `activeId` |
| `/dashboard/leader` | `PowerOf5LeaderDashboardView` — full variant + demo `activeId` |

Panels accept **`showOrganizingPipelines={false}`** if a future layout needs KPIs only.

## Relationship to other docs

- **`docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`** — system context.
- **`src/lib/power-of-5/types.ts`** — broader `PowerPipelineId` (includes signup, conversation, donor, etc.). The six organizing pipelines are the **dashboard funnel subset**, not a replacement for the full union.

## Data policy

Definitions are **copy and structure only**. Counts and completion percentages on dashboards remain **demo/seed or derived** until field tools connect; do not place individual voter or household identifiers in pipeline configuration or logs referenced from public routes.
