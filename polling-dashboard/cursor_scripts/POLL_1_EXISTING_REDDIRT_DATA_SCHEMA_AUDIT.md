# CURSOR MISSION — POLL-1 Existing Red Dirt Data / Schema Audit

## Mission ID
POLL-1

## Parent system
Red Dirt Polling Intelligence

## Repository
`H:\SOSWebsite\RedDirt`

## GitHub
`Grappe501/reddirt`

## Working branch
Use the current polling build branch if present:
`feature/polling-dashboard-spine`

If that branch has already been merged, create a new branch from current `main` named:
`feature/poll-1-schema-audit`

## Mission objective
Perform a complete evidence-based audit of the existing Red Dirt codebase and database architecture so the polling system can reuse the current voter/person/contact/phone/geography/auth/analytics/OpenAI infrastructure instead of creating duplicate systems.

This slice is AUDIT + DESIGN ONLY.

Do not create database migrations.
Do not alter Prisma schema.
Do not create production tables.
Do not create polling API routes.
Do not build UI.
Do not write to production voter data.
Do not change live calling behavior.

The output of this mission is a verified reuse map and proposed polling relational model grounded in what actually exists in Red Dirt.

---

# 1. Read first — mandatory orientation

Before changing anything, inspect the repository and read the relevant architecture/governance files already present. At minimum inspect:

- `README.md`
- `START_HERE_FOR_AI.md` if present
- `CURSOR_CODEX_COORDINATION_PROTOCOL.md` if present
- `THREAD_HANDOFF_MASTER_MAP.md` if present
- `BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md` if present
- `DIVISION_MASTER_REGISTRY.md` if present
- `PROJECT_MASTER_MAP.md` if present
- `workbench-build-map.md` if present
- `polling-dashboard/README.md`
- `polling-dashboard/MASTER_BUILD_PLAN.md`
- `polling-dashboard/architecture/SYSTEM_SPINE.md`
- `polling-dashboard/methodology/POLLING_METHODOLOGY.md`
- `polling-dashboard/governance/BUILD_STATUS.json`
- `prisma/schema.prisma`
- `.env.example`
- `package.json`

Also inspect the current Git state before work:

```bash
git status
git branch --show-current
git log -5 --oneline
```

Do not discard unrelated local changes.
Do not reset, clean, or overwrite work from another lane.

---

# 2. Governing architectural rule

The existing Red Dirt voter/person database is the system of record.

The polling system must attach to that spine.

Do NOT invent duplicate core entities unless the audit proves no suitable existing object exists.

Examples of duplication to avoid:

- `PollingVoter` when Red Dirt already has a voter/person entity
- `PollingPhoneNumber` when Red Dirt already stores phones
- `PollingCounty` when Red Dirt already models county geography
- `PollingVolunteer` when Red Dirt already has users/volunteers/auth
- `PollingContact` when a reusable contact-attempt model already exists

For every polling need, classify the solution as exactly one of:

1. REUSE AS-IS
2. EXTEND EXISTING
3. CREATE POLLING-SPECIFIC OBJECT
4. UNKNOWN / REQUIRES OPERATOR DECISION

Do not guess.

---

# 3. Audit scope

Systematically inspect the codebase and identify the real implementation for every category below.

## A. Core voter / person identity

Find:

- canonical voter entity
- canonical person/contact entity
- voter registration identifiers
- voter-file source identifiers
- relationships between voter and CRM person/contact records
- dedupe/matching logic
- source provenance fields
- archival/inactive handling
- any existing household model

Document exact model names, fields, relations, file paths, and relevant functions.

## B. Voter history

Find:

- election participation history tables/models
- election/date/type representation
- primary/general election indicators
- party-primary history if present
- turnout history calculations
- vote propensity/scoring logic if present
- any derived turnout fields

Important: distinguish actual public voter-history participation records from self-reported survey responses. Do not conflate them.

## C. Phone infrastructure

Find:

- phone number fields/models
- mobile vs landline classification if present
- multiple-number support
- phone source/provenance
- validation status
- bad-number/disconnected flags
- opt-out/DNC flags
- phone normalization utilities
- duplicate phone handling
- phone enrichment imports
- existing call/contact logs

Determine how to define the future `callable voter universe` without copying the voter table.

## D. Geography

Find the canonical source for:

- state
- congressional district
- county
- city
- ZIP
- precinct
- ward
- school district if present
- legislative district if present
- other campaign geographic units

Document whether each is stored directly, derived, normalized, or inconsistently represented.

Identify which geography is reliable enough for sampling strata today.

## E. Campaign users / volunteers / auth / RBAC

Find:

- authentication provider
- user model
- volunteer model if separate
- admin roles
- organizer roles
- viewer/data-entry roles
- permission helpers
- admin route protection
- server-side auth helpers

Determine how future polling roles should attach to existing RBAC.

Candidate future roles/capabilities to map, not necessarily create yet:

- polling_admin
- polling_supervisor
- polling_caller
- polling_analyst
- polling_read_only

Prefer capability mapping onto existing roles rather than role explosion.

## F. Contact attempt / canvass / call history

Search for existing reusable models and flows for:

- phone banking
- canvassing
- contact attempts
- call dispositions
- callbacks
- wrong number
- refused
- voicemail
- completed conversation
- contact notes
- assignment queues
- locks/leases/reservations

Determine whether polling should reuse, extend, or remain isolated from ordinary campaign contact history.

## G. Survey / forms / question systems

Find any existing infrastructure for:

- surveys
- questionnaires
- form builders
- intake forms
- questions
- answer choices
- branching
- response storage
- form versioning
- online surveys

Determine what can be reused for a scientifically controlled polling questionnaire and what cannot.

## H. Analytics / dashboards / charts

Find:

- existing dashboard components
- chart libraries
- map libraries
- county maps
- data visualization helpers
- KPI cards
- date-range utilities
- aggregate query patterns
- reporting APIs
- caching patterns

Identify the best existing visual/component conventions for the future Polling Intelligence Command Center.

## I. OpenAI / AI infrastructure

Find:

- OpenAI client setup
- environment variable naming
- API wrappers
- model-selection utilities
- prompt registries
- AI role registries
- structured JSON-output helpers
- cost/logging controls
- error/fallback handling
- source-grounding rules

Document what the polling AI layer can safely reuse later for:

- open-ended response categorization
- aggregate trend summaries
- anomaly explanations
- sample-coverage explanations
- natural-language analyst queries

Do NOT implement any AI logic in this slice.

## J. Database / Prisma / migration conventions

Audit:

- Prisma provider and datasource
- migration naming patterns
- production deployment expectations
- `DATABASE_URL`
- `DIRECT_URL`
- hosted database conventions
- Supabase/Neon usage if applicable in current branch
- indexes on major voter/person tables
- any especially large tables
- any existing materialized views or reporting tables

Estimate which future polling queries may require new indexes, but DO NOT add them yet.

## K. Privacy / sensitive data boundaries

Identify current handling for:

- voter PII
- role-based access
- audit logs
- sensitive notes
- private vs public routes
- exports
- admin-only analytics

The proposed design must NOT casually attach sensitive survey opinion labels to ordinary voter-profile tags.

Individual survey answers should be designed as restricted research records linked to the voter/person record through a controlled relation.

---

# 4. Repository search expectations

Use broad code search. Do not only inspect Prisma.

At minimum search for terms comparable to:

```text
Voter
Person
Contact
Phone
PhoneNumber
VoterHistory
ElectionHistory
County
Precinct
City
Zip
Ward
District
Volunteer
User
Role
Permission
Call
PhoneBank
Canvass
ContactAttempt
Disposition
Survey
Question
Response
Form
Intake
OpenAI
AI
Dashboard
Chart
Map
Analytics
```

Search schema, `src/`, `scripts/`, `netlify/`, `data/`, `develop_notes/`, and docs as appropriate.

Do not rely on filenames alone. Follow imports/usages far enough to identify which objects are canonical versus abandoned/legacy.

---

# 5. Deliverables

Create the following artifacts under `polling-dashboard/audit/`.

## 5.1 `POLL_1_EXISTING_SYSTEM_AUDIT.md`

This is the primary human-readable audit.

Required sections:

1. Executive finding
2. Canonical voter/person spine
3. Voter history
4. Phone architecture
5. Geography architecture
6. User/auth/RBAC architecture
7. Existing contact/call infrastructure
8. Existing survey/form infrastructure
9. Analytics/dashboard infrastructure
10. OpenAI infrastructure
11. Database/migration conventions
12. Privacy/security findings
13. Legacy/duplicate systems discovered
14. Risks/blockers
15. Recommended polling attachment points
16. Files inspected

Every architectural claim should cite an exact repository path and preferably the model/function/component name.

## 5.2 `POLL_1_REUSE_EXTEND_CREATE_MATRIX.md`

Create a table with columns:

| Polling Need | Existing Red Dirt Object | Exact Path | Classification | Proposed Use | Risk/Notes |

Cover at minimum:

- voter identity
- person identity
- voter registration ID
- voter history
- phone number
- phone provenance
- bad phone flag
- opt-out/DNC
- county
- city
- ZIP
- precinct
- congressional district
- user identity
- RBAC
- caller assignment
- contact attempt
- disposition
- callback
- survey definition
- survey version
- question
- answer option
- survey response
- open-ended response
- candidate-order randomization
- sample frame
- sampling cell
- sample selection event
- weighting record
- external poll
- online survey
- dashboard aggregate
- AI analysis record
- election simulation run

## 5.3 `POLL_1_PROPOSED_DATA_MODEL.md`

Design the proposed relational model AFTER the audit.

Do not write Prisma syntax unless useful as pseudocode.

Separate models into:

### Existing objects reused

List exact existing objects.

### Existing objects requiring extension

List proposed future additions without implementing them.

### New polling-specific objects likely required

Evaluate objects comparable to:

- PollingProgram
- PollingWave
- PollingQuestionnaire
- PollingQuestionnaireVersion
- PollingQuestion
- PollingAnswerOption
- PollingSamplingFrame
- PollingSamplingCell
- PollingSelection
- PollingAssignment
- PollingContactAttempt
- PollingInterview
- PollingResponse
- PollingOpenResponse
- PollingWeight
- PollingAggregateSnapshot
- PollingExternalPoll
- PollingExternalPollResult
- PollingOnlineSurveySource
- PollingAiAnalysis
- PollingSimulationRun

These names are NOT mandatory. Reconcile them with existing conventions.

For every proposed new object include:

- purpose
- core fields
- foreign keys
- indexes likely needed
- retention/privacy classification
- whether it contains PII or political-opinion data

## 5.4 `POLL_1_CALLABLE_UNIVERSE_DESIGN.md`

Define exactly how future code should identify callable voters.

Include:

- source voter relation
- phone eligibility rules
- unusable phone conditions
- dedupe behavior
- DNC/opt-out behavior
- repeat-contact cooldown concept
- sampling eligibility state
- no-data-copy rule

No implementation yet.

## 5.5 `POLL_1_GEOGRAPHY_READINESS.md`

Create a readiness matrix:

| Geography | Available? | Canonical Source | Coverage | Reliability | Sampling Ready? | Notes |

Include:

- statewide
- congressional district
- region if one exists
- county
- city
- ZIP
- precinct
- ward
- legislative district

Do not claim city-level polling readiness if city data is incomplete or inconsistent.

## 5.6 `POLL_1_RBAC_PRIVACY_PLAN.md`

Design access boundaries for future polling.

At minimum distinguish:

- caller-visible data
- supervisor-visible data
- analyst-visible individual records
- admin-only settings
- aggregate dashboard data
- prohibited public exposure

Explicitly state that individual political-opinion survey responses are sensitive research data and should not become ordinary campaign profile tags by default.

## 5.7 `POLL_1_NEXT_SLICE_RECOMMENDATION.md`

Based on actual findings, recommend the exact scope for POLL-2.

POLL-2 should normally be `Callable Universe + Sampling Frame Foundation`, but if the audit uncovers a blocking data-model problem, document the blocker and recommend the smallest foundational correction first.

---

# 6. Machine-readable audit artifact

Create:

`polling-dashboard/governance/POLL_1_AUDIT_RESULT.json`

Suggested shape:

```json
{
  "slice": "POLL-1",
  "status": "complete",
  "audit_date": "YYYY-MM-DD",
  "canonical_voter_model": null,
  "canonical_person_model": null,
  "phone_model": null,
  "voter_history_model": null,
  "geography_ready": {
    "state": false,
    "congressional_district": false,
    "county": false,
    "city": false,
    "zip": false,
    "precinct": false
  },
  "existing_survey_engine_reusable": false,
  "existing_contact_attempt_model_reusable": false,
  "existing_rbac_reusable": false,
  "existing_openai_infrastructure_reusable": false,
  "migration_created": false,
  "schema_modified": false,
  "production_data_modified": false,
  "blockers": [],
  "recommended_next_slice": "POLL-2"
}
```

Use actual discovered model names/values.

---

# 7. Update polling build status

After the audit is complete, update:

`polling-dashboard/governance/BUILD_STATUS.json`

Mark POLL-1 complete only if all required audit artifacts exist and are internally consistent.

Set the next slice based on findings.

Do not falsely mark POLL-2 started.

---

# 8. Validation requirements

Run appropriate non-destructive validation for this repository.

At minimum:

```bash
git diff --check
npm run typecheck
```

If repository conventions provide stronger safe validators such as `npm run check`, run them too.

Do not run migration deployment.
Do not run destructive seed/reset commands.
Do not modify production data.

If typecheck/check already fails on untouched code, document the pre-existing failure with exact output and prove your audit-only changes did not introduce code failures.

Because this slice should contain documentation/governance artifacts only, application behavior must remain unchanged.

---

# 9. Git discipline

Before committing:

```bash
git status
git diff --stat
git diff --check
```

Confirm that changes are limited to the polling audit/build-plan domain unless an unavoidable documentation link elsewhere is necessary.

Expected changed paths should primarily be:

```text
polling-dashboard/audit/**
polling-dashboard/governance/**
```

Do NOT commit secrets, `.env`, database dumps, voter exports, phone-number exports, or PII samples.

Commit with a clear message comparable to:

```text
POLL-1 audit existing Red Dirt data and schema architecture
```

Push the branch to GitHub.

If working on an open polling PR branch, update that branch rather than opening unnecessary duplicate PRs.

---

# 10. Required final Cursor report

Return a concise but substantive completion report containing:

## POLL-1 RESULT

### Status
PASS / PASS WITH BLOCKERS / FAIL

### Canonical objects discovered
- voter/person:
- voter history:
- phones:
- geography:
- users/RBAC:
- contact attempts:
- survey/forms:
- OpenAI:

### Reuse summary
- reuse as-is count:
- extend-existing count:
- new polling-specific object count:
- unknown/operator-decision count:

### Critical findings
List the most important architectural findings.

### Privacy findings
State where individual survey answers should live and who should be able to access them.

### Database safety proof
- Prisma schema modified: YES/NO
- migration created: YES/NO
- production data modified: YES/NO

All three should be NO for POLL-1.

### Validation
Report exact command results.

### Git
- branch:
- commit SHA:
- pushed: YES/NO
- PR number if applicable:

### Next slice
Give the exact recommended POLL-2 mission.

---

# 11. Hard stop conditions

STOP and report instead of improvising if any of these occur:

- the apparent voter data exists in more than one competing canonical schema and authority cannot be determined
- phone records appear to come from multiple incompatible systems without a clear source of truth
- polling work would require exposing restricted PII to ordinary volunteers
- current RBAC cannot safely isolate polling research
- the working tree contains substantial unrelated uncommitted changes that would be endangered
- the database target cannot be confidently identified
- a proposed action would require destructive migration/reset behavior

Do not solve ambiguity by inventing a new parallel architecture.

---

# 12. Definition of done

POLL-1 is done only when we can answer, with repository evidence:

1. What exact Red Dirt object represents a voter?
2. What exact object stores voter history?
3. Where do callable phone numbers come from?
4. How are bad/duplicate/opted-out numbers handled today?
5. Which geographic fields are reliable enough for sampling?
6. How will callers authenticate and what can they see?
7. What existing contact-attempt infrastructure can be reused?
8. What existing survey/form infrastructure can be reused?
9. What OpenAI infrastructure can later support aggregate analysis?
10. Which new polling-specific tables are genuinely necessary?
11. How will sensitive individual political-opinion responses be isolated?
12. What exactly should POLL-2 build first?

No implementation beyond audit/design artifacts is authorized in this slice.
