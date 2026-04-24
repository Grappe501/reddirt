# System maturity map (BLUEPRINT-LOCK-1) (RedDirt)

**Packet BLUEPRINT-LOCK-1 (Part B).** **Repo-grounded** maturity per **Level-3 division** ([`system-division-map.md`](./system-division-map.md)). Ratings: **Not Started** · **Conceptual** · **Foundation Built** · **Partially Implemented** · **Strong** · **Advanced**.

**Evidence base:** [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) §5–8, [`workbench-build-map.md`](./workbench-build-map.md), `src/app/admin/**`, `src/lib/campaign-engine/**`, `prisma/schema.prisma`, packet list in foundation doc.

---

## 1. Division maturity table

| Division | Rating | What exists **in code** | What exists **docs-only** | What is **missing** |
|----------|--------|------------------------|---------------------------|---------------------|
| **Campaign Manager** | **Partially Implemented** (thin **L3** bands) | `/admin/workbench` hub, **CM-2** **`CampaignManagerDashboardBands`**, **`UnifiedOpenWorkSection`**, **UWR-2** `open-work.ts` (festival pending + actionable threads), `getTruthSnapshot` + **`openWorkCounts`** | CM-1 orchestration maps, incoming work matrix | **Unified index in DB**; **`Submission`** queue; **positionId** on work rows; actor-scoped hub (**CM-3**) |
| **Communications** | **Strong** | Comms plans/broadcasts/media, threads, **`EmailWorkflowItem`** queue + E-2 interpretation, social monitoring UI, substantial send/read paths | COMMS-UNIFY-1 (single message story) | **End-to-end metadata** linking every intent to execution; some **Tier 1/2** seams still separate |
| **Field / Organizing** | **Partially Implemented** | Counties (public + admin), events/festivals/tasks, forms → `User`/`VolunteerProfile`, **`FieldUnit`/`FieldAssignment`**, `field.ts` | REL-1, GAME-1, VOL-CORE-1, POD, county integration **blueprints** | **`FieldUnit`↔`County`** FK or enforced mapping; **REL-2** relational rows; **volunteer journey** UI; ROE workbench |
| **Data / Research** | **Partially Implemented** | Voter import, `VoterRecord`, **`CountyVoterMetrics`**, recompute pipeline, insights hooks, county snapshots for public pages | DATA-1, DBMAP-1 | **Warehouse/universe** model in Prisma; **precinct GIS**; persuasive modeling **as claimed product** |
| **Finance / Fundraising** | **Foundation Built** → **Partial** | `FinancialTransaction` + confirm, `BudgetPlan`/`BudgetLine` + admin UI, ledger ingest seams | FUND-1 desk **blueprint**, fundraising KPI **types** | **Fundraising desk route**; donor lifecycle **persistence**; dialer/call-time **product** |
| **Compliance** | **Foundation Built** → **Partial** | `ComplianceDocument` admin, `policy.ts` defaults, `compliance.ts` types | COMP-1 extensive docs | **Rules engine**; filing automation; **full** compliance workbench |
| **Talent / Training** | **Conceptual** + **Foundation Built** (types) | `talent.ts`, `training.ts` | TALENT-1 docs, position development matrix | **Observation log**, recommendations UI, LMS integration |
| **Youth Pipeline** | **Conceptual** | `youth.ts` types | YOUTH-1 docs | **Program UI**, routing, content pipeline execution |

---

## 2. Cross-cutting packets (honest status)

| Packet | Rating | Notes |
|--------|--------|-------|
| **REL-1** | **Conceptual** | No `RelationalContact`; no ROE admin route |
| **GAME-1** | **Conceptual** | No XP ledger; no progression columns |
| **VOL-CORE-1** | **Conceptual** | Philosophy/roles/onboarding **specified**; no volunteer shell |
| **ROLE-1** | **Foundation Built** | `positions.ts` + docs; **no** Prisma `Position` table |
| **SEAT-1** | **Partially Implemented** | `PositionSeat` + `/workbench/seats`; **not** RBAC |
| **UWR-1 + UWR-2** | **Partially Implemented** | Five **count** dimensions + merged lists (email, intake, task, **actionable thread**, **festival pending** in CM merge); **bounded** |
| **ALIGN-1** | **Foundation Built** (types) | **No** persisted override log as first-class table |
| **GOALS-VERIFY-1** | **Partially Implemented** | DB fields + admin write + public display path; **see** [`goals-system-status.md`](./goals-system-status.md) |

---

## 3. Ahead vs behind (plain language)

- **Ahead:** **Communications** and **orchestration-adjacent** operator tooling (email workflow, comms workbench, unified open work **slice**).
- **Behind:** **Volunteer/relational execution layer** (REL-2, volunteer home), **fundraising desk**, **talent observation**, **youth execution**, **tight geography** unification (`FieldUnit` vs `County`).
- **Risk:** **Over-investing in comms/AI** while **field + identity + goals attribution** stay **doc-only**—integration map below.

---

## 4. Repo inspection (BLUEPRINT-LOCK-1)

1. **Strongest divisions right now?** **Communications** (breadth of routes + models) and **Data** (voter file + metrics pipeline) relative to **volunteer/relational** depth.
2. **Weakest?** **Youth** and **Talent** (types/docs only); **Fundraising** (no desk); **REL/GAME/VOL** as **executable** product.
3. **Overbuilt relative to others?** **Comms + email workflow + social** surface area **exceeds** **unified assignment**, **volunteer experience**, and **field↔county** hard links.
4. **Blocking full integration?** **No relational contact model**; **no `positionId`/unified routing** on work items; **geography fragmentation** (`User.county` string vs `County` vs `FieldUnit`); **GAME-1 not wired** to permissions/unlocks; **county goals** not tied to volunteers or field units in schema.
5. **Ready to build volunteer experience?** **Not** as a **complete** VOL-CORE/REL/GAME vision—**partially** ready for **thin** shell (forms already create `VolunteerProfile`) **if** scope is **narrow** and **does not** pretend KPIs exist.
6. **Next 3 packets (recommended)?** See [`next-build-sequence.md`](./next-build-sequence.md) — default: **REL-2** (or minimal relational MVP), **GEO/FIELD-2** (unit↔county), **UWR-3** / **CM-3** or **assignment seam**—balanced, not comms-only.

---

*Last updated: Packet BLUEPRINT-LOCK-1 (Part B); **CM-2** + **UWR-2** lane note.*
