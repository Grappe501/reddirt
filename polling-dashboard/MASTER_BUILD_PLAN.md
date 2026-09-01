# RED DIRT POLLING INTELLIGENCE — MASTER BUILD PLAN

Status: **SPINE ESTABLISHED / DESIGN PHASE**  
Build family: `POLL`  
Repository: `Grappe501/reddirt`  
Expected local root: `H:\SOSWebsite\RedDirt\polling-dashboard\`

## North Star

Build a continuous, statewide Arkansas polling and public-opinion intelligence system inside Red Dirt that uses the campaign's existing voter-registration, voter-history, geography, phone, authentication, and analytics infrastructure. Multiple volunteers will work from shared authenticated calling dashboards while the system continuously measures sampling coverage, records standardized survey interviews, preserves research quality, and produces transparent statewide/regional estimates and simulations.

The system is not a one-off Kelly poll. It must become a reusable Campaign OS polling subsystem whose election, office, candidates, questionnaires, geography, and study waves are configurable.

---

# Governing product principles

1. **Existing voter database first.** Do not build a parallel voter universe.
2. **Probability and auditability first.** Sampling logic is statistical code with saved metadata, not LLM judgment.
3. **Fast volunteer workflow.** Caller signs in, receives the next assigned contact, follows the script, records disposition/answers, and advances.
4. **One shared truth.** All callers use the same database and concurrency-safe queue.
5. **Raw data remains raw.** Weighting/modeling never changes the original response.
6. **Sensitive research is compartmentalized.** Individual political-opinion responses do not become casual CRM targeting tags.
7. **Methodology is visible.** The dashboard shows sample size, effective sample, coverage, response quality, weighting status, and uncertainty.
8. **Small-area restraint.** County/city results are suppressed until quality thresholds are met.
9. **Evidence streams stay labeled.** Controlled phone samples, online opt-in surveys, external polls, and simulations remain distinguishable.
10. **AI assists analysts.** OpenAI analyzes aggregate trends and open responses; it does not individually choose voters or invent data.
11. **Mobile/iPad ready.** Volunteer and supervisor workbenches must work cleanly on phones, tablets, and desktop.
12. **Human-controlled research changes.** Questionnaire, methodology, sampling, and release decisions are versioned and reviewable.

---

# System spine

`Red Dirt voter/person data`
→ `Callable universe`
→ `Sampling frame`
→ `Sampling cells + targets`
→ `Probability selector`
→ `Assignment queue`
→ `Volunteer caller workbench`
→ `Survey/questionnaire engine`
→ `Attempt/disposition ledger`
→ `Interview/response store`
→ `Quality + weighting engine`
→ `Polling Intelligence Command Center`
→ `External/online evidence lanes`
→ `AI research layer`
→ `Election simulation`

---

# Build phases and slices

## PHASE 0 — Governance and architecture

### POLL-0 — Repository + master spine
**Status: COMPLETE / CURRENT COMMIT SERIES**

Deliverables:
- canonical `polling-dashboard/` domain,
- README and scope,
- system spine,
- governing methodology draft,
- master build plan,
- machine-readable build status.

Exit gate:
- project exists in GitHub and can be pulled into `H:\SOSWebsite\RedDirt\polling-dashboard\`.

### POLL-1 — Existing Red Dirt data/schema audit
**Status: NEXT**

Goal: understand exactly what already exists before adding a single polling table.

Audit:
- Prisma schema and migrations,
- voter/person models,
- voter registration identifiers,
- voting-history models,
- phone/contact records and source/quality metadata,
- county/city/precinct/district geography,
- volunteer/user/auth/RBAC models,
- existing admin route/workbench patterns,
- AI registry/OpenAI patterns,
- existing reporting/analytics utilities,
- any prior survey/poll/contact-attempt models.

Deliverables:
- `architecture/RED_DIRT_EXISTING_DATA_REUSE_MAP.md`
- `architecture/POLLING_RELATIONAL_MODEL_PROPOSAL.md`
- `data-contracts/polling-domain-v0.1.json`
- `compliance/DATA_CLASSIFICATION_AND_ACCESS_PLAN.md`
- explicit list of models/fields to reuse vs. create,
- no migration yet unless separately approved after audit.

Exit gate:
- no duplicated voter/person/phone/geography architecture,
- relational model reviewed against real repo.

---

## PHASE 1 — Sampling foundation

### POLL-2 — Callable universe

Build a versioned eligible sampling frame from existing voters with usable phone data.

Requirements:
- eligibility rules,
- phone availability/quality,
- geography mapping,
- exclusion/do-not-contact controls,
- frame versioning,
- counts by county/city/region/district,
- frame-refresh process when new phone data arrives.

### POLL-3 — Sampling cells and targets

Create target allocation architecture for statewide coverage.

Support:
- statewide population/sample targets,
- region,
- congressional district,
- county,
- city/local geography where defensible,
- later demographic/turnout strata when validated.

Store:
- target definition,
- actual attempts,
- completes,
- deficits/surpluses,
- selection probability metadata.

### POLL-4 — Auditable probability selector

Build deterministic/probability sampling service.

Requirements:
- randomness from application/statistical code,
- reproducible seed/audit metadata where appropriate,
- adaptive allocation toward under-covered cells,
- random selection within eligible cells,
- exclusion of currently locked/assigned/ineligible units,
- no LLM voter-selection decisions,
- simulation/test harness proving distribution behavior.

### POLL-5 — Atomic caller assignment queue

Enable multiple callers concurrently.

Requirements:
- atomic claim/lease,
- assignment expiration/recovery,
- no duplicate simultaneous assignment,
- caller permissions,
- supervisor override,
- callback queue separation,
- audit ledger.

---

## PHASE 2 — Survey research engine

### POLL-6 — Instrument/version manager

Create configurable:
- studies,
- waves,
- questionnaires,
- questions,
- choices,
- branching,
- required/optional responses,
- version locking,
- form variants.

### POLL-7 — Secretary of State tracking instrument v1

Research, pretest, and freeze the first short core instrument.

Planned domains:
1. unprimed Secretary of State ballot preference,
2. Arkansas direct democracy/citizen initiative attitude,
3. confidence in Arkansas election security/accuracy,
4. follow-up reason for low confidence,
5. concise Secretary of State priorities/business-services item,
6. previous presidential vote recall,
7. party identification + strength/lean,
8. post-battery ballot measure classified as post-context/experimental.

Candidate names/order must be rotated/randomized by software and stored.

### POLL-8 — Experimental form engine

Support randomized form assignment for:
- candidate-order balance,
- question-order experiments,
- wording experiments,
- future message/testing research.

Never mix experimental post-treatment measures into baseline horse-race estimates without labeling.

### POLL-9 — Open-ended research pipeline

Store respondent language verbatim. Add analyst-reviewed coding taxonomy and optional OpenAI-assisted coding/summarization with:
- original text preserved,
- model/version logged,
- confidence/uncertainty,
- human review capability,
- aggregate output by default.

---

## PHASE 3 — Volunteer calling center

### POLL-10 — Caller workbench

Primary UX:

`Sign in → Start calling → Assigned voter → Script → Disposition/Interview → Save → Next call`

Requirements:
- phone/tablet/desktop responsive,
- minimal exposed voter information,
- exact script display,
- question branching,
- progress counter,
- callbacks,
- pause/end session,
- accessibility,
- fast error recovery.

### POLL-11 — Disposition/contact-attempt system

Standard dispositions:
- completed,
- partial,
- refused,
- no answer,
- voicemail,
- callback,
- wrong number,
- disconnected,
- language barrier,
- ineligible,
- do-not-contact,
- other with controlled note.

All attempts remain part of quality measurement.

### POLL-12 — Supervisor command center

Show:
- callers online,
- active assignments,
- attempts/completes,
- response/disposition mix,
- callback inventory,
- suspicious/abnormal patterns,
- training/quality flags,
- sample coverage needs,
- ability to pause a study/wave.

### POLL-13 — Training + QA mode

Add:
- practice interviews,
- script certification,
- interviewer notes/rubric,
- completion-quality checks,
- speed/outlier flags,
- supervisor review queue.

---

## PHASE 4 — Statistical intelligence

### POLL-14 — Raw polling dashboard

First analyst dashboard:
- attempts,
- completes,
- raw candidate preference,
- undecided,
- issue responses,
- response/disposition metrics,
- geography coverage,
- time trends.

Raw numbers must be labeled unweighted.

### POLL-15 — Weighting engine

Implement only after methodological review.

Potential dimensions depend on verified frame/benchmark availability. Every weighting run stores:
- method/version,
- inputs/targets,
- weights,
- trimming/capping rules,
- design effect/effective sample implications,
- output timestamp.

### POLL-16 — Uncertainty + effective sample

Dashboard shows:
- nominal completes,
- effective sample size,
- design effect where applicable,
- uncertainty interval/method,
- sample/coverage warnings,
- weighting warnings.

### POLL-17 — Arkansas geographic intelligence

Map hierarchy:
`State → Region → Congressional District → County → City/local area where supportable`

Add hard suppression/insufficient-data states instead of fake precision.

### POLL-18 — Continuous coverage controller

Use current completed/attempted sample against target cells to alter future allocation probabilities while maintaining documented selection rules.

This is the adaptive statewide calling brain.

---

## PHASE 5 — Polling Intelligence Command Center

### POLL-19 — Executive dashboard

Core surfaces:
- current statewide estimate,
- trend,
- undecided,
- favorability/issue metrics as instruments add them,
- data quality,
- coverage map,
- regional/county drilldowns,
- sample health,
- methodology/version banner.

### POLL-20 — Trend/wave analysis

Support:
- 7/14/30/60/90-day windows where sample supports them,
- study waves,
- before/after event comparisons,
- stable-question longitudinal trends,
- alerting when a questionnaire change breaks comparability.

### POLL-21 — Campaign activity overlay

Connect aggregate campaign activity to time/geography for research questions such as whether awareness/favorability changes after county visits or major events.

This layer is observational and must not claim causal impact without an appropriate design.

---

## PHASE 6 — External polls and online surveys

### POLL-22 — External poll registry

Store:
- pollster,
- sponsor,
- field dates,
- sample population,
- sample size,
- mode,
- methodology notes,
- reported margin of error,
- candidate/issue results,
- source URL/document,
- quality assessment.

### POLL-23 — External polling average

Create transparent recency/sample/methodology-aware aggregation with published assumptions and source drilldown.

### POLL-24 — Online survey engine

Create Red Dirt-hosted survey forms with anti-abuse controls, source/campaign parameters, and explicit classification as probability or nonprobability/opt-in evidence.

### POLL-25 — Evidence comparison dashboard

Side-by-side:
- internal controlled phone tracking,
- external polling average,
- online survey evidence,
- model estimate.

No silent blending.

---

## PHASE 7 — AI research layer

### POLL-26 — Polling analyst assistant

OpenAI-powered aggregate analyst capable of answering:
- what changed,
- where sampling holes exist,
- what respondents say in open answers,
- where results disagree across evidence streams,
- which estimates are currently weak.

### POLL-27 — Data-quality/anomaly assistant

Detect/report—not autonomously delete—patterns such as:
- abnormal interviewer completion times,
- repeated response patterns,
- sample-cell anomalies,
- sudden disposition shifts,
- suspicious online submissions.

### POLL-28 — Research memo generator

Produce versioned internal summaries grounded only in stored polling aggregates/methodology with uncertainty and source references.

---

## PHASE 8 — Election simulation

### POLL-29 — Turnout scenario engine

Build low/base/high or probabilistic turnout assumptions using voter history and approved external benchmarks.

### POLL-30 — Monte Carlo election simulator

Run repeated election simulations using:
- polling distributions,
- turnout distributions,
- geographic relationships,
- undecided assumptions,
- model uncertainty.

Outputs:
- outcome distribution,
- median result,
- percentile bands,
- probability-style model outputs with assumptions clearly displayed.

### POLL-31 — Scenario laboratory

Allow analysts to alter assumptions without changing observed poll data and compare scenarios side by side.

---

## PHASE 9 — Production hardening and reusable Campaign OS module

### POLL-32 — Compliance/privacy launch gate

Complete documented review of:
- federal/Arkansas calling rules,
- campaign restrictions,
- voter-file terms,
- privacy/access,
- recording/consent where relevant,
- opt-outs,
- retention/deletion,
- volunteer training,
- methodology disclosure.

### POLL-33 — Security/RBAC audit

Roles may include:
- polling admin,
- research analyst,
- supervisor,
- caller,
- read-only executive.

Protect individual contact/research data from unnecessary exposure.

### POLL-34 — Scale/concurrency/load proof

Test large callable frame, many concurrent callers, assignment contention, dashboard queries, weighting jobs, and failures.

### POLL-35 — Reusable election configuration

Prove the system can create a new election/study/candidate field without code forks or hard-coded Kelly-specific assumptions.

### POLL-36 — Production launch

Launch only after statistical, compliance, security, and operator gates pass.

---

# Master dashboard target

The mature Polling Intelligence Command Center should answer five questions immediately:

1. **What are voters telling us?**
2. **How much confidence should we place in that estimate?**
3. **Where is our sample strong or weak?**
4. **How is opinion changing over time and geography?**
5. **What range of election outcomes is plausible under explicit assumptions?**

---

# Initial questionnaire research target

The initial survey should be intentionally short. Baseline candidate preference occurs before the issue battery. Candidate ordering is balanced/randomized. Direct-democracy and election-confidence items use neutral language. Low-confidence election responses may branch to a concise open-ended reason. Political baselines come near the end. A second ballot question after the issue battery is stored as a post-context measure rather than substituted for the unprimed baseline.

Exact wording remains a future research deliverable and must be frozen/versioned before trend reporting.

---

# Immediate next slice

## POLL-1 — Existing Red Dirt Data/Schema Audit

Do **not** start by creating polling migrations.

The next Cursor/build pass should read the actual repository, enumerate the existing voter/person/phone/history/geography/auth structures, search for any existing polling/survey/call-attempt functionality, and map the proposed polling objects onto what already exists.

Only after that audit should POLL-2+ schema implementation be designed.
