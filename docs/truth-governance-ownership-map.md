# Truth, governance, and ownership map (BRAIN-OPS-1) (RedDirt)

**Cross-ref:** [`deterministic-brain-foundation.md`](./deterministic-brain-foundation.md) · [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md) · [`goals-system-status.md`](./goals-system-status.md) · [`county-registration-goals-verification.md`](./county-registration-goals-verification.md) · `src/lib/campaign-engine/truth.ts`

---

## 1. Key source-of-truth examples (repo-grounded)

| Topic | Authoritative | Mirrored / derived | Notes |
|-------|---------------|-------------------|--------|
| **County registration goal** | `CountyCampaignStats.registrationGoal` | `CountyVoterMetrics.countyGoal` (per snapshot, from recompute) | See [`county-registration-goals-verification.md`](./county-registration-goals-verification.md) |
| **New registrations since baseline** | `CountyCampaignStats.newRegistrationsSinceBaseline` (campaign) vs pipeline | `CountyVoterMetrics` counters | Align semantics when both populated; document which UI uses which |
| **Budget spend actuals** | `FinancialTransaction` rows with **`CONFIRMED`** + cost-bearing wire kinds | `budget-queries.ts` aggregates | **`CONTRIBUTION`** excluded from spend actuals per BUDGET-2 |
| **Seat occupancy** | `PositionSeat` (+ user FK / vacant) | `seating.ts` read helpers | Staffing metadata, **not** RBAC |
| **Compliance doc → AI** | Human sets `ComplianceDocument.approvedForAiReference` | Default **false** | Until true, treat as **UNAPPROVED_FOR_AI** for RAG authority |
| **Voter roll presence** | `VoterRecord` + latest snapshot linkage | `CountyVoterMetrics.totalRegisteredCount` | Per snapshot; not vote history |
| **County dimension** | `County` (`id`, `slug`, `fips`, `displayName`) | `VoterRecord.countySlug` denorm | **`User.county`** is free text — **not** canonical |
| **Policy defaults** | `policy.ts` `CAMPAIGN_POLICY_V1` | — | **Not** legal conclusions; versioned defaults |
| **Email workflow interpretation** | Operator-confirmed fields + `metadataJson` provenance | E-2 suggestions | Suggestions **advisory** until operator accepts |
| **Raw election JSON** | **None in DB until ingest** | Files under `H:\SOSWebsite\campaign information for ingestion\electionResults` | **Provisional** campaign-held input; DB post-migration = authoritative for in-app results |

---

## 2. Ownership resolution

| Layer | Source | Roll-up when vacant |
|-------|--------|---------------------|
| **Position owner (concept)** | `PositionId` / workbench job definition | Campaign Manager or documented backup per [`workbench-job-definitions.md`](./workbench-job-definitions.md) |
| **Seat occupant** | `PositionSeat` → `userId` / status | `seating.ts` coverage summary; position workbench **vacant** banner |
| **User assignee** | `assignedToUserId` on `EmailWorkflowItem`, `WorkflowIntake`, `CampaignTask`, etc. | Appears in UWR-1 **unassigned** lists (`open-work.ts`) |
| **Escalation** | **Not auto** in BRAIN-OPS-1 | Human reassign; future router must log **deterministic** rule fired |

**Rule:** Recommendations may **name** a suggested owner but **must not** reassign without an explicit human action (or a future packet that defines **auditable** auto-rules).

---

## 3. AI eligibility rules

| Context | May reference as authoritative? | May summarize? | Must not |
|---------|--------------------------------|----------------|----------|
| **SearchChunk / RAG (general docs)** | Only for **internal** copy assist | Yes, with caveats | Imply legal/compliance approval |
| **`ComplianceDocument` with `approvedForAiReference === false`** | **No** | Only “upload exists” if operator asks | Quote as filing guidance |
| **`ComplianceDocument` with `approvedForAiReference === true`** | Still **not** “filed” | Yes, with attribution | Certify compliance |
| **Goals / metrics** | Yes **if** sourced from authoritative fields | Yes | Invent county numbers |
| **Targeting / voter strength (DATA-3)** | Only **documented** tiers; no numeric scores in DB | Yes, as **planning** language | Imply modeled voter file scores |
| **Inferred inbox priority** | **No** | Yes, as **heuristic** | Present as SLA or guarantee |

---

## 4. Repo inspection (BRAIN-OPS-1 §F)

1. **What existing code/docs already resemble a deterministic truth layer?**  
   **`county-goals.ts`** (explicit registration goal read model); **`budget-queries.ts`** (CONFIRMED + wire filter); **`policy.ts`** (governed defaults); **`compliance-documents.ts`** + schema flags; **GOALS-VERIFY-1** / **DATA-2** inventory docs; **ALIGN-1** layering (context assembly); **email workflow** provenance patterns—not one executable “engine” yet, but **pieces**.

2. **What source-of-truth rules are explicit vs implied?**  
   **Explicit:** registration goal vs metrics mirror; budget actuals definition; contribution exclusion; compliance AI flag. **Implied / folklore:** which assignee wins when multiple FKs exist on related objects; full cross-queue “one owner”—needs **BRAIN-OPS-2** consolidation.

3. **Which parts of the Campaign Manager Workbench already exist in code?**  
   **`/admin/workbench`** hub; **UWR-1** `UnifiedOpenWorkSection`; **position** + **seats** routes; **email-queue**; **comms**; **tasks**; **calendar**; **county** admin; **budgets**; **financial-transactions**; **compliance-documents**—see [`workbench-build-map.md`](./workbench-build-map.md).

4. **Which parts are still only conceptual?**  
   **Truth + Health Panel** (single deterministic classification UI); **Division Command Grid** tied to maturity; **Goals + Path** unified strip; **Strategic Recommendations** lane with **eligibility** badges; **global** truth resolver service.

5. **How should Discord connect first without compromising source-of-truth discipline?**  
   **Outbound notifications only** (read from DB, link deep into workbench); **no** accepting Discord messages as **authoritative** state writes without a gated bot + same validation as web actions. See [`discord-integration-foundation.md`](./discord-integration-foundation.md).

6. **What should BRAIN-OPS-2 implement next?**  
   **Thin `resolveTruthSnapshot` read model** (one server module): county goal + pipeline health + open-work counts + seat vacancies + budget variance flags—**read-only**, fed to workbench; optional **metadata** on UWR-1 rows for `TruthClass` / `GovernanceState`; **no** auto-actions.

---

*Last updated: Packet BRAIN-OPS-1.*
