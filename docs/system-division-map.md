# System division map — Level-3 domains (BLUEPRINT-LOCK-1) (RedDirt)

**Packet BLUEPRINT-LOCK-1 (Part A).** Confirms **major campaign system divisions** (Level-3) for alignment: **purpose** and **success** definitions. Evidence: [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) §6, [`shared-rails-matrix.md`](./shared-rails-matrix.md), [`workbench-build-map.md`](./workbench-build-map.md).

**Cross-ref:** [`system-maturity-map.md`](./system-maturity-map.md) · [`system-integration-map.md`](./system-integration-map.md) · [`goals-system-status.md`](./goals-system-status.md) · [`next-build-sequence.md`](./next-build-sequence.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md)

---

## 0. Cross-cutting rails (not separate “divisions”)

These **span** divisions: **identity** (`User` / `VolunteerProfile`), **assignment** (`assignedToUserId`, open-work read model), **positions** (`positions.ts`, `PositionSeat`), **AI** (advisory), **geography** (`County` vs `FieldUnit`). Maturity is judged **per division** below, not per rail alone.

**Organizing-specific packets** (REL-1, GAME-1, VOL-CORE-1) are **mostly documentation today**; they **belong** under **Field / Organizing** for product ownership, with **Data** and **Comms** as consumers.

---

## 1. Campaign Manager (orchestration)

| | |
|--|--|
| **Purpose** | One **mental model** for “what needs attention next?” across departments: incoming work, triage, routing, closure—without replacing specialized editors. |
| **Success looks like** | Operators live on a **single hub** with **honest** coverage of open work; **deep links** land on the right workbench row; **unfilled seats** roll up visibly; CM docs and **UWR-1** stay in sync. |

**Primary docs:** [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md), [`incoming-work-matrix.md`](./incoming-work-matrix.md), [`unified-incoming-work-read-model.md`](./unified-incoming-work-read-model.md).

---

## 2. Communications (email, text, social, media)

| | |
|--|--|
| **Purpose** | **Execute and review** outbound and reactive comms: plans, sends, threads, social monitoring, press-adjacent flows—under **queue-first** and **human-governed** policy where required. |
| **Success looks like** | **Reliable** send/read state; **review-first** sensitive paths; **traceable** AI assistance; **one glossary** for “intent → execution” across Tier 1/2/social (target, not fully shipped). |

**Primary surfaces:** comms workbench, email workflow queue, social workbench, content/review routes (see [`workbench-build-map.md`](./workbench-build-map.md)).

---

## 3. Field / Organizing (counties, volunteers, PODs)

| | |
|--|--|
| **Purpose** | **Geography-aware** organizing: counties, events, festivals, tasks, volunteer intake, **future** relational program (REL-1), volunteer culture and roles (VOL-CORE-1), earned progression (GAME-1). |
| **Success looks like** | **Clear** county story on public pages; **field units** tied to staffing; volunteers **onboarded** into real actions; relational **data** (REL-2+) supports KPIs without double-count lies. |

**Primary code:** `FieldUnit` / `FieldAssignment` / `field.ts`, public county pages, events/festivals/tasks, forms → `VolunteerProfile`.

---

## 4. Data / Research (targeting, voter strategy)

| | |
|--|--|
| **Purpose** | **Voter file** truth, county metrics, honest **targeting** narrative—what the campaign **knows** vs what it **infers**. |
| **Success looks like** | **Repeatable** import and recompute; **documented** meaning of metrics; **no** invented universes; decisions (comms, field) **cite** the same tables. |

**Primary code:** voter import, `VoterRecord`, `CountyVoterMetrics`, `CountyCampaignStats`, insights routes.

---

## 5. Finance / Fundraising

| | |
|--|--|
| **Purpose** | **Treasury-adjacent** discipline: ledger, budget vs actuals, **future** fundraising operations—without claiming bank or filing automation this repo does not perform. |
| **Success looks like** | **Confirmed** transactions; **budget** variance visible; fundraising **desk** (FUND-1+) when scoped—**governed** call lists and KPIs, not a shadow CRM. |

**Primary code:** `FinancialTransaction`, `BudgetPlan` / `BudgetLine`, `fundraising.ts` types (no fundraising desk route in repo as of packet).

---

## 6. Compliance

| | |
|--|--|
| **Purpose** | **Governance** on comms, data, paperwork: what may be automated, what must be reviewed, how uploads and policy defaults **constrain** execution. |
| **Success looks like** | **No** silent high-risk automation; **audit-friendly** provenance; compliance **docs** ingestible with **explicit** AI/RAG rules when enabled. |

**Primary code:** `compliance.ts`, `ComplianceDocument` + admin intake, `policy.ts`, red lines in handoff/foundation docs.

---

## 7. Talent / Training

| | |
|--|--|
| **Purpose** | **Advisory** development: who is ready for more trust, what training helps—**humans** decide seats and promotion (TALENT-1). |
| **Success looks like** | **Observable** operational signals feed **recommendations** with provenance; **no** auto-promotion or hidden scores as gates. |

**Primary code:** `talent.ts`, `training.ts` (types); **no** LMS or talent UI in repo as of packet.

---

## 8. Youth Pipeline

| | |
|--|--|
| **Purpose** | **Programs and safeguards** for youth engagement: pipelines, chaperone rules, content—aligned with campaign ethics and law (YOUTH-1). |
| **Success looks like** | **Typed** program contracts and ingest maps; **real** youth-facing flows when prioritized—**not** bolted on without governance. |

**Primary code:** `youth.ts` types; **docs** in `docs/youth-*.md`; **no** dedicated youth workbench route in repo as of packet.

---

*Last updated: Packet BLUEPRINT-LOCK-1 (Part A).*
