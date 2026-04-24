# Division ↔ workbench alignment (BRAIN-OPS-1) (RedDirt)

**Packet BRAIN-OPS-1 (Part D).** Maps **BLUEPRINT-LOCK-1** divisions to **workbench surfaces**, **intended division head** (position id from [`positions.ts`](../src/lib/campaign-engine/positions.ts) / [`workbench-job-definitions.md`](./workbench-job-definitions.md)), **maturity**, and **gaps**. **Not** an HR assignment—**product** ownership.

**Cross-ref:** [`system-division-map.md`](./system-division-map.md) · [`system-maturity-map.md`](./system-maturity-map.md) · [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md) · [`workbench-build-map.md`](./workbench-build-map.md)

---

## Table

| Division | Intended head (ROLE-1 id) | Core workbench / routes | Maturity (summary) | Already-built surfaces | Biggest gap | Relationship to CM Workbench |
|----------|---------------------------|-------------------------|--------------------|-------------------------|-------------|------------------------------|
| **Campaign Manager** | `campaign_manager` (see job defs) | `/admin/workbench`, UWR-1+**UWR-2**, **CM-2** bands, `getTruthSnapshot` | Partially implemented (thin L3) | `workbench/page.tsx`, **`CampaignManagerDashboardBands`**, `UnifiedOpenWorkSection`, `open-work.ts`, `truth-snapshot.ts` | Unified index for **all** sources; full truth panel per spec | **Top band**; aggregates others |
| **Communications** | `communications_director` | `workbench/comms/*`, `email-queue`, social | Strong | Plans, sends, threads, E-2 queue, social monitoring | Single metadata story (COMMS-UNIFY) | **Subordinate**; deep links from CM **Incoming** |
| **Field / Organizing** | `field_director` / regional leads | Events, tasks, festivals, `field` admin, counties | Partially implemented | `CampaignEvent`, `FieldUnit`/`FieldAssignment`, festival ingest | `FieldUnit`↔`County` FK; REL-2; volunteer shell | **Geographic Command** consumer |
| **Data / Research** | `data_manager` (or CM until staffed) | `voter-import`, insights placeholders, docs | Partially implemented | Voter pipeline, `CountyVoterMetrics`, `targeting.ts` | Election results **in DB**; warehouse model | Feeds **Truth** + **Goals**; no fake scores |
| **Finance / Fundraising** | `finance_director` | `financial-transactions`, `budgets` | Foundation → partial | FIN-1/2, BUDGET-2 admin | Fundraising desk route (FUND-1) | **Truth panel** for CONFIRMED vs planned |
| **Compliance** | `compliance_director` | `compliance-documents`, policy overlay | Foundation → partial | `ComplianceDocument`, `policy.ts` | Rules engine; full desk | **Governance state** gate for AI + comms |
| **Talent / Training** | CM or `assistant_campaign_manager` | *(no dedicated route)* | Conceptual + types | `talent.ts`, `training.ts` | Observation log, UI | **Advisory** cards only on CM |
| **Youth** | youth lead position when defined | *(no dedicated route)* | Conceptual | `youth.ts` types | Program UI, routing | **Blocked** automation; CM shows **policy** links only |

*Position ids are illustrative—confirm against `ALL_POSITION_IDS` and org reality.*

---

## Integration rule

Every division **surface** should **read** the same **authoritative** fields the deterministic brain uses ([`truth-governance-ownership-map.md`](./truth-governance-ownership-map.md)). If a division UI shows a **derived** metric, it **must** label derivation (or link to doc)—**never** silent equivalence to SOS or bank truth.

---

*Last updated: Packet BRAIN-OPS-1; **CM-2** + **UWR-2** alignment (Apr 2026).*
