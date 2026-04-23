# Talent / training intelligence — foundation (RedDirt)

**Packet TALENT-1.** Defines the **Talent & adaptive training rail** as a core part of the unified campaign engine: operational intelligence on capability, reliability, and development—not an HR module. People keep final say on trust, promotion, and power. **Delivered as documentation + types in** `src/lib/campaign-engine/talent.ts` **and** `training.ts` **only**—no scoring engine, no auto-promotion, no permissions.

**Cross-ref:** [`talent-recommendation-flow.md`](./talent-recommendation-flow.md) · [`position-development-matrix.md`](./position-development-matrix.md) · [`position-system-foundation.md`](./position-system-foundation.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)

---

## 1. North star

| Principle | System meaning |
|-----------|----------------|
| **Campaign can run without people** | Unfilled positions roll up (ROLE-1). Automation and policy—webhooks, cron, queue defaults—keep rails moving (FND-1, CM-1). Work does not depend on a volunteer being online for paths that are already machine-bounded. |
| **People make it exponentially better** | Humans triage, contextualize, and close high-entropy work (comms, field, compliance). Outcomes are measured through the same domain objects: tasks, queues, sends, intakes. |
| **AI develops people; humans decide advancement** | Models may observe, summarize, and recommend training and upward candidates. Only humans commit seat changes, trust expansion, or discipline. No silent role mutation. |

This coexists with queue-first email and review-first sensitive paths: talent outputs are **advisory** (like E-2 interpretation)—provenance-backed, never authoritative for send or access.

---

## 2. Talent as a system function (not a final judge)

| Function | Definition | **Not** |
|----------|------------|--------|
| **Evaluator** | Derive signals from observable events: task completion, time-to-action, error or retry patterns, operator overrides. Bounded features, not hidden psychometric scores. | A black-box “fit score” that gates features without explanation. |
| **Recommender** | Propose training modules, shadow opportunities, or “consider for position X” packets to managers. | Auto-assign seats or promote. |
| **Trainer / development director** | Curate learning paths by position + observed gaps (see §5). | Replace human coaching; mandatory training without policy/consent. |
| **Pattern recognizer** | Surface clusters (e.g. reliable county volunteer, repeated SLA miss on a sensitive queue) for supervisor review. | Sole basis for removal or public ranking. |

**Invariant:** Any ML/LLM output that shapes operator judgment should be stored with provenance (same pattern as `metadataJson.emailWorkflowInterpretation`) or a future `TalentRecommendation` record with `reasons[]`, `modelId`, `version`, `timestamp`.

---

## 3. What the system should observe

Signals are **operational evidence** in RedDirt, not off-platform personality inference. Gaps are stated honestly.

| Category | Observable in repo (now or near) | Gap |
|----------|----------------------------------|-----|
| **Reliability / consistency** | `CampaignTask` status and due dates; overdue rollups on workbench; send retry / failure patterns in comms. | Shifts and work done only in side channels. |
| **Responsiveness** | Time to first action on `assignedToUserId` rows (`EmailWorkflowItem`, intakes) when timestamps exist. | Not unified across all queues. |
| **Completion behavior** | Task done vs cancelled; intake status transitions. | Partial work without a schema. |
| **Comprehension / system understanding** | Invalid action or validation errors; (future) in-app micro-checks. | No standard quiz or certification layer yet. |
| **Position understanding** | Whether the user uses the right workbench/queue for the object—only if events are logged. | No centralized click/audit stream. |
| **Communication patterns** | `CommunicationMessage` / thread cadence for staff; not volunteer DMs unless captured in-app. | Off-platform social. |
| **Initiative** | Self-created `WorkflowIntake` or tasks where allowed; quality of `ArkansasFestivalIngest` or similar suggests. | Ambiguous without explicit policy. |
| **Judgment signals** | Escalation choices; `EmailWorkflowItem` triage fields (tone, spam, etc.) as operator-labeled data. | Subjective—prefer human-originated fields. |
| **Specialization affinity** | County filter usage; mix of comms- vs field-shaped tasks. | Optional preference forms not wired. |
| **Leadership / upward potential** | Delegated tasks (future); referrals / recruits if modeled on `VolunteerProfile` or intakes. | No “leads others” graph. |
| **Coaching responsiveness** | Completion of assigned training (future); behavior change after feedback. | Training content rail not built. |

**Rule:** Prefer sparse, high-confidence signals. Avoid a single rolled-up “talent score” as a hard gate; if scores ever exist, they must be explainable and inspectable.

---

## 4. Talent recommendations chain

1. **Generation** — Batch or streaming jobs read observations (§3) and position fit hints ([`position-development-matrix.md`](./position-development-matrix.md)) → draft recommendation (type + reasons + evidence refs). See [`talent-recommendation-flow.md`](./talent-recommendation-flow.md).
2. **Local first** — Training nudges and small skill gaps go to the direct manager position (Volunteer Coordinator, County lead, Email/Comms Manager, etc.).
3. **Escalate for seat change** — “Ready for Field Organizer” or “not ready for sensitive comms” routes to the parent in [`position-hierarchy-map.md`](./position-hierarchy-map.md); cross-department or trust expansion to Campaign Manager.
4. **Advisory only** — UI: “Suggested — requires human decision.” No `User`↔`Position` mutation without explicit admin action (future packet).
5. **Provenance** — `reasons[]`, `signalIds[]`, `model`, `promptVersion` (if LLM), `timestamp`, `createdBy` = `system` | `user`.

**Never silently change role**—same product ethic as email workflow (no auto-send / no auto-promote).

---

## 5. Adaptive training model

| Dimension | Adaptation |
|-----------|------------|
| **Position** | Curriculum fork per `PositionId` (ROLE-1) and parent chain (e.g. Field → County → Organizer). |
| **Current skill** | Start from observed errors and missed SLAs in that domain, not a generic “Level 1” for everyone. |
| **Reliability level** | High reliability → shorter recaps; low → checklists and supervised shadowing. |
| **Strengths / weaknesses** | Remediate weak rails (e.g. skip logging); stretch strengths for advancement candidates. |
| **Campaign stage** | Early: rails and tools; late: turnout windows, legal cutoffs, crisis comms playbooks—content in CMS/docs, not hardcoded in a talent module. |

**Training content rail (conceptual):** Versioned modules (markdown, video links, sims later) keyed by `TrainingTrackType` + `positionId`. No DB table in TALENT-1—contract only.

---

## 6. Automation vs human augmentation

| Mode | Behavior |
|------|----------|
| **Unfilled seat** | Automation + parent roll-up (ROLE-1). Baseline behavior is machine-bounded: retries, cron, queue visibility. |
| **Human fills seat** | Same automation stays underneath; human adds judgment and throughput. |
| **Human outperforms baseline** | Surface “this operator exceeds automation on queue X” to inform assignment and teaching—not default public leaderboards. |

**Core rule:** Do not remove automation when a person joins; layer human priority and recommendations over it.

---

## 7. Talent rail dependencies

| Dependency | Why |
|------------|-----|
| **Assignment** | Attribute outcomes to the responsible user on `assignedToUserId` rows. |
| **Incoming work** | Per-person / per-position view of open work (FND-2+). |
| **Provenance** | Model-assisted recommendations and human ack/dismiss. |
| **Position system (ROLE-1)** | Map recommendations to seats and escalation path. |
| **Identity / contact** | Stable `User`, `VolunteerProfile`, voter links as appropriate. |
| **Status / priority** | Consistent “open vs done” for trends. |
| **Recommendation (AI assist) rail** (FND-1) | Same “suggest + evidence” ethic; extends to talent types. |
| **Training content rail** (conceptual) | Addressable modules + completion events (future). |

---

## 8. What must remain human

- Promotions and any formal `PositionId` / seat change.
- Trust-sensitive expansion: voter data access, send authority, compliance veto overrides.
- Discipline, removal, or no-longer-volunteer (may include off-system legal/HR).
- Compliance-sensitive authority increases: paid media, coordination exposure, vendor keys.
- Final approval on leadership roles (e.g. deputy CM, regional director)—Campaign Manager, plus party rules off-system where applicable.

---

## 9. Build sequence (post TALENT-1)

1. **TALENT-2 (example):** Observation event contract—append-only `TalentObservation` or namespaced `metadataJson` on existing rows, strict schema; no ML training, just structured logging from 1–2 domains (e.g. tasks + email workflow).
2. **TALENT-3:** Recommendation DTO + read path for managers (CM or position panel); human ack / dismiss / snooze with audit.
3. **TALENT-4:** Training content IDs + completion events; adaptive path v1 (rules or LLM-assisted *content pick*, not LLM-as-grader for people).
4. **TALENT-5:** Integrate with unified incoming (FND-2) so recommendations are not a parallel universe to real work.

*Numbering is indicative.*

---

*Last updated: Packet TALENT-1.*
