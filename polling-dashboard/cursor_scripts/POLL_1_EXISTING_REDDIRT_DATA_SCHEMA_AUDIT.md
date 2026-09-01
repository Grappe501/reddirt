# BERT / CURSOR MISSION — POLL-1: RED DIRT ARCHITECTURE TRUTH AUDIT

**Mission ID:** `POLL-1`  
**Master plan:** `Red Dirt Polling Intelligence MASTER_BUILD_PLAN.md v2.0`  
**Mission type:** READ-ONLY DISCOVERY + DOCUMENTATION  
**Repository root:** `H:\SOSWebsite\RedDirt`  
**GitHub:** `Grappe501/reddirt`  
**Expected branch:** `feature/polling-dashboard-spine`  

---

# 0. AUTHORITY AND PURPOSE

This mission replaces every earlier POLL-1 instruction.

Governing authority, in order:
1. `polling-dashboard/MASTER_BUILD_PLAN.md` v2.0
2. `polling-dashboard/governance/ENGINEERING_INVARIANTS.md`
3. `polling-dashboard/governance/SLICE_EXECUTION_STANDARD.md`
4. `polling-dashboard/architecture/DEPENDENCY_AND_RELEASE_GATES.md`
5. `polling-dashboard/quality/MASTER_ACCEPTANCE_MATRIX.md`
6. `polling-dashboard/methodology/RESEARCH_AND_COMPLIANCE_SOURCE_LEDGER.md`
7. this mission file

If this mission conflicts with a higher governing document, the higher document wins.

## Objective
Replace architectural assumptions with verified facts from the actual Red Dirt repository before any polling schema, migration, API, queue, survey engine, dashboard, or production behavior is built.

POLL-1 answers: **What exactly does Red Dirt already have, what is canonical, what is safe to reuse, what must be extended, and what truly must be polling-specific?**

This is the Architecture Truth Gate. Bert is an auditor in this slice, not an implementer.

---

# 1. HARD READ-ONLY BOUNDARY

## Allowed writes
Only documentation/governance outputs under:
- `polling-dashboard/audit/**`
- `polling-dashboard/develop_notes/**`
- `polling-dashboard/governance/POLL_1_AUDIT_RESULT.json`
- `polling-dashboard/governance/BUILD_STATUS.json` only at closeout and only if the audit gate passes

## Forbidden
Do NOT edit Prisma schema; create/modify/apply migrations; alter database schema or records; create APIs/UI/sampling/calling/survey/AI functionality; invoke OpenAI; send outbound communications; add dependencies; alter auth/RBAC; alter env files; export/copy PII; create examples containing real voter data; change application behavior; perform unrelated cleanup; or discard unrelated work.

Database access, if needed for runtime metadata, must be read-only. Prefer repository evidence first. Never print or commit secrets or PII.

If completing the audit requires a prohibited write, stop and report the blocker.

---

# 2. PRE-FLIGHT

Record:
```bash
cd /d H:\SOSWebsite\RedDirt
git status --short
git branch --show-current
git log -8 --oneline
```

Leave unrelated local changes untouched.

Confirm Master Plan v2.0 and the v2 governance files exist locally. If absent, STOP: the worktree/branch is stale.

---

# 3. READ FIRST

Read completely:
- `polling-dashboard/README.md`
- `polling-dashboard/MASTER_BUILD_PLAN.md`
- `polling-dashboard/architecture/SYSTEM_SPINE.md`
- `polling-dashboard/architecture/DEPENDENCY_AND_RELEASE_GATES.md`
- `polling-dashboard/methodology/POLLING_METHODOLOGY.md`
- `polling-dashboard/methodology/RESEARCH_AND_COMPLIANCE_SOURCE_LEDGER.md`
- `polling-dashboard/governance/ENGINEERING_INVARIANTS.md`
- `polling-dashboard/governance/SLICE_EXECUTION_STANDARD.md`
- `polling-dashboard/governance/BUILD_STATUS.json`
- `polling-dashboard/quality/MASTER_ACCEPTANCE_MATRIX.md`

Then read repository orientation files that exist, including `START_HERE_FOR_AI.md`, `CURSOR_CODEX_COORDINATION_PROTOCOL.md`, `THREAD_HANDOFF_MASTER_MAP.md`, `BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`, `DIVISION_MASTER_REGISTRY.md`, `PROJECT_MASTER_MAP.md`, `workbench-build-map.md`, `README.md`, `package.json`, `.env.example`, and `prisma/schema.prisma`.

Documentation is not proof when implementation disagrees. Trace claims into schema/code/migrations/usages.

---

# 4. AUDIT METHOD

For every material finding capture:
- exact model/service/function/component;
- exact path;
- active/legacy/partial/uncertain status;
- evidence of usage/imports/relations;
- canonical status/confidence;
- polling relevance;
- classification: `REUSE_AS_IS`, `EXTEND_EXISTING`, `CREATE_POLLING_SPECIFIC`, or `UNKNOWN_OPERATOR_DECISION`.

Follow relationships/imports far enough to establish ownership. If competing implementations remain unresolved, classify them UNKNOWN. No silent redesign.

---

# 5. REQUIRED DISCOVERY DOMAINS

## 5.1 Voter/person identity
Identify canonical voter and CRM person/contact models, registration/source IDs, voter-file provenance, relations, active/inactive handling, household support, dedupe/entity resolution, and legacy duplicates. Polling must reference this spine, never create a duplicate voter universe.

## 5.2 Voter history
Identify participation-history models, election representation, primary/general/runoff and party-primary history, derived turnout/propensity logic, ingest path, indexes/scale, and source-vs-derived boundaries. Keep public participation history separate from future self-reported answers.

## 5.3 Phone/contact points
Determine field vs child-model architecture, multiple numbers, normalization, mobile/landline, provenance, confidence/validation, duplicate/shared numbers, bad/disconnected/wrong flags, DNC/opt-out, enrichment, freshness, and existing call logs. Identify how a callable frame can reference canonical records without copying them.

## 5.4 Frame-coverage readiness
Determine whether current architecture can measure total eligible voters, voters with usable phones, statewide callable coverage, coverage by county/district and other reliable geography, missing geography, and shared/duplicate phone incidence. Weighting cannot be treated as a substitute for unknown frame coverage. If actual counts require a later safe aggregate query, specify it rather than guessing.

## 5.5 Geography truth map
Audit state, county, congressional district, city, ZIP, precinct, ward, state House/Senate, school district, and campaign regions. For each: stored/derived, normalized/free text, completeness, provenance, reliability, sampling readiness, dashboard readiness.

## 5.6 Auth/users/volunteers/RBAC
Identify providers, user/volunteer models, roles/capabilities, route protection, server authorization, workbench patterns, and audit logging. Map—not implement—future capabilities for study administration, supervision, calling, respondent-level research access, aggregate analysis, estimate approval, and executive aggregate viewing.

## 5.7 Contact/field operations
Audit phone banking, canvassing, attempts, dispositions, callbacks, retries, DNC, notes, sessions, queues/reservations/locks, concurrency, expiration, supervisor controls. Determine reusable operational primitives versus research-specific records.

## 5.8 Survey/form/question infrastructure
Audit forms, surveys, questions/options, branching, drafts/publishing, versioning, responses, partials, online intake, experiments/randomization, validation, autosave/recovery. Explicitly assess whether existing infrastructure can enforce immutable field-active instrument versions.

## 5.9 Analytics/visualization
Audit dashboard shells, KPI cards, chart/map libraries, Arkansas map assets, aggregate services, date windows, filters, caching, reporting tables/views, exports, and responsive/mobile patterns.

## 5.10 AI/OpenAI
AUDIT ONLY. Find clients/wrappers, env conventions, AI/prompt registries, structured outputs, grounding/uncertainty rules, cost/logging controls, fallback behavior, and data-safety patterns. Map future aggregate-analysis/open-response reuse. Confirm AI is not the sampling selector.

## 5.11 Database/migrations/scale
Determine provider/production architecture, Prisma conventions, DATABASE_URL/DIRECT_URL expectations without values, migration workflow, relevant indexes, large-table patterns, transaction/locking support, reporting views, jobs/cron/queues, caching, audit logs. Identify later scale risks; do not optimize.

## 5.12 Privacy/sensitive research/exports
Map PII controls, sensitive notes, exports, admin boundaries, audit logs, public/private APIs, retention/deletion, minimization. Define the safest future attachment point for respondent political opinions: expected direction is restricted research records linked to canonical identity, not ordinary voter tags.

## 5.13 Calling/compliance infrastructure
Inventory DNC, calling-hour controls, scripts, consent/recording, automated/prerecorded/artificial voice features, TCPA/FCC/Arkansas docs, and volunteer training. Make no legal conclusion; identify missing review gates.

## 5.14 Operational infrastructure
Audit feature flags, kill switches, pause/resume, observability, structured logs, error monitoring, health checks, jobs, retries/idempotency, rate limiting, concurrency tests, deployment/Netlify patterns.

---

# 6. SEARCH COVERAGE

Search `prisma/**`, `src/**`, `scripts/**`, `netlify/**` if present, `data/**`, `develop_notes/**`, root docs, and relevant tests. Search variants of Voter, Person, Contact, Phone, VoterHistory, County, City, ZIP, Precinct, Ward, District, Volunteer, User, Role, Permission, PhoneBank, Canvass, ContactAttempt, Disposition, Callback, Survey, Question, Response, Form, OpenAI, Dashboard, Analytics, Map, Audit, DNC, OptOut, Lock, Lease, Queue, Cron, Job, FeatureFlag.

Maintain a file-inspection/evidence ledger. Do not call the audit complete after inspecting only schema/docs.

---

# 7. REQUIRED DELIVERABLES

Create:

### `polling-dashboard/audit/POLL_1_ARCHITECTURE_TRUTH_AUDIT.md`
Sections: executive finding; method; voter/person; voter history; phones; frame coverage; geography; auth/RBAC; field operations; survey/forms; analytics; OpenAI; DB/scale; privacy; compliance inventory; operational infrastructure; legacy systems; Master Plan conflicts; blockers/decisions; recommended attachment architecture; files inspected.

### `polling-dashboard/audit/POLL_1_REUSE_EXTEND_CREATE_MATRIX.md`
Table: `Polling Capability | Existing Object/Pattern | Exact Evidence | Classification | Future Attachment | Risk/Decision`. Cover identity, registration ID, history, phones/provenance/DNC/bad phone, geography, users/RBAC, sessions/leases/attempts/dispositions/callbacks, study/wave/instrument/version/questions/options/interviews/responses/open responses/randomization, sampling frame/cell/selection/probability, weighting/estimate runs, external/online surveys, AI, simulations, audit events, feature flags, kill switches.

### `polling-dashboard/audit/POLL_1_CANONICAL_OBJECT_REGISTRY.md`
For each reusable canonical object: name/type/path/domain/purpose/identifiers/relations/sensitivity/canonical confidence/legacy alternatives.

### `polling-dashboard/audit/POLL_1_FRAME_AND_PHONE_READINESS.md`
Callable attachment, eligibility signals, missing signals, duplicate/shared numbers, DNC, refresh when phone data changes, frame-coverage measurement, safe aggregate proof needed next, and explicit frame-coverage limitation doctrine.

### `polling-dashboard/audit/POLL_1_GEOGRAPHY_READINESS.md`
`Geography | Canonical Source | Stored/Derived | Completeness Evidence | Reliability | Sampling Ready | Dashboard Ready | Blocker`.

### `polling-dashboard/audit/POLL_1_RBAC_PRIVACY_BOUNDARY.md`
Map caller, supervisor, analyst, polling admin, executive aggregate user, and unauthenticated access. Respondent-level opinions are restricted research data.

### `polling-dashboard/audit/POLL_1_OPERATIONAL_READINESS.md`
Inventory transactions/atomic claims, jobs/queues, retries, feature flags, kill switches, logs, health, rate limits, concurrency tests, responsive workbench patterns.

### `polling-dashboard/audit/POLL_1_PROPOSED_ATTACHMENT_MODEL.md`
NOT a migration design. Show `existing canonical Red Dirt objects -> future polling-specific object families`; for each future family state responsibility, canonical attachment, why existing architecture is insufficient, sensitivity, lifecycle/state-machine ownership. Do not lock final Prisma fields/names until POLL-2.

### `polling-dashboard/audit/POLL_1_RISK_AND_DECISION_REGISTER.md`
IDs `POLL-RISK-###` and `POLL-DECISION-###`; include finding/evidence/impact/severity/POLL-2 blocker?/owner/next action.

### `polling-dashboard/audit/POLL_1_MASTER_PLAN_RECONCILIATION.md`
Compare repo truth to Master Plan v2.0. Classify each mismatch: plan valid; terminology; implementation detail; architecture change needing approval; blocker. Do NOT edit Master Plan in POLL-1.

### `polling-dashboard/develop_notes/POLL_1_CLOSEOUT.md`
Concise closeout with proof and next recommendation.

---

# 8. MACHINE-READABLE RESULT

Create `polling-dashboard/governance/POLL_1_AUDIT_RESULT.json` with real values and at least:

```json
{
  "slice": "POLL-1",
  "master_plan_version": "2.0",
  "mission_type": "read_only_architecture_truth_audit",
  "status": "complete|pass_with_blocker|fail",
  "canonical_objects": {"voter": null, "person": null, "voter_history": null, "phone": null, "user": null},
  "reuse_counts": {"reuse_as_is": 0, "extend_existing": 0, "create_polling_specific": 0, "unknown_operator_decision": 0},
  "frame_coverage": {"measurable_now": false, "aggregate_proof_required": true},
  "geography_sampling_readiness": {},
  "rbac_reusable": false,
  "contact_attempt_infrastructure_reusable": false,
  "survey_infrastructure_reusable": false,
  "openai_infrastructure_reusable": false,
  "atomic_assignment_pattern_exists": false,
  "kill_switch_pattern_exists": false,
  "master_plan_conflicts": [],
  "blockers": [],
  "operator_decisions": [],
  "safety_proof": {
    "prisma_schema_modified": false,
    "migration_created_or_applied": false,
    "database_records_modified": false,
    "outbound_communications_sent": false,
    "openai_invoked": false,
    "pii_committed": false
  },
  "recommended_next_slice": "POLL-2"
}
```

Recommend POLL-2 only if the Architecture Truth Gate passes. Otherwise identify the blocker/decision without inventing an unauthorized slice.

---

# 9. EXIT GATE

PASS requires: canonical identity attachment identified or explicitly unresolved; voter-history attachment identified; phone architecture sufficient for frame-contract design; geography graded; auth/RBAC understood; contact/survey/analytics/AI patterns inventoried; DB/migration conventions documented; respondent-opinion privacy boundary defined; operational primitives inventoried; legacy risks documented; Master Plan conflicts reconciled; all deliverables exist; no prohibited implementation; no PII/secrets committed.

If canonical identity/phone architecture is unresolved, return `PASS WITH BLOCKER`; do not force POLL-2.

---

# 10. VALIDATION

Capture `git status --short` before and after. Run:

```bash
git diff --check
npm run typecheck
```

If available and safe, also `npm run check`.

Do not run migration/seed/reset/destructive DB/outbound commands. If checks already fail, document baseline failure and prove no application code changed. Validate `POLL_1_AUDIT_RESULT.json` parses.

---

# 11. GIT DISCIPLINE

Before commit:
```bash
git status --short
git diff --stat
git diff --check
```

Commit only POLL-1 docs/governance and authorized BUILD_STATUS closeout. No unrelated changes.

Commit message:
`POLL-1 complete read-only Red Dirt architecture truth audit`

Push current polling branch. Do not merge the PR.

---

# 12. BUILD STATUS

Only after the exit gate passes, update `polling-dashboard/governance/BUILD_STATUS.json`: mark POLL-1 complete; preserve v2.0 authority; record audit paths/blockers/decisions; set POLL-2 as next only if unblocked. Do not mark POLL-2 started. Do not modify `MASTER_BUILD_PLAN.md`.

---

# 13. REQUIRED BERT RETURN

## POLL-1 — ARCHITECTURE TRUTH AUDIT

### Status
`PASS`, `PASS WITH BLOCKER`, or `FAIL`

### Canonical architecture discovered
- voter/person:
- voter history:
- phones/contact points:
- geography:
- auth/RBAC:
- contact attempts/field operations:
- survey/forms:
- analytics/maps:
- OpenAI:
- operational primitives:

### Frame readiness
- total voter universe measurable:
- callable universe measurable:
- geographic coverage measurable:
- principal phone/frame gaps:

### Reuse classification
- REUSE AS-IS:
- EXTEND EXISTING:
- CREATE POLLING-SPECIFIC:
- UNKNOWN / OPERATOR DECISION:

### Master Plan v2.0 reconciliation
List every material conflict or `NONE`.

### Critical risks / operator decisions
List register IDs.

### Safety proof
- Prisma schema modified: `NO`
- migration created/applied: `NO`
- DB records modified: `NO`
- outbound communication sent: `NO`
- OpenAI invoked: `NO`
- PII/secrets committed: `NO`

### Validation
Exact command results.

### Files created/updated
List all.

### Git
- branch:
- commit SHA:
- pushed: YES/NO
- PR:

### Architecture Truth Gate
`PASS` / `BLOCKED`

### Next authorized action
Either `POLL-2 — Domain Contracts + Migration Design` or the exact operator decision/blocker first.

---

# FINAL INSTRUCTION

Do not build polling functionality. Do not improve unrelated Red Dirt code. Do not convert audit discoveries into implementation.

**Observe. Trace. Verify. Document. Reconcile. Stop.**

POLL-1 exists to make every later Bert mission safer, faster, and deterministic.