# RED DIRT POLLING INTELLIGENCE — MASTER BUILD PLAN v1.0

Status: **DESIGN FROZEN / READY FOR REPO AUDIT**  
Build family: `POLL`  
Repository: `Grappe501/reddirt`  
Expected local root: `H:\SOSWebsite\RedDirt\polling-dashboard\`  
Primary governing artifact: this file  

---

# 1. NORTH STAR

Build a production-grade, continuous Arkansas polling and public-opinion research system inside Red Dirt. The system must use the campaign's existing voter-registration, voter-history, geography, phone, authentication, volunteer, and analytics infrastructure rather than create a parallel voter universe.

Multiple authenticated volunteers must be able to call simultaneously from a shared statewide sample. The platform continuously evaluates where the achieved sample is strong or weak, assigns the next eligible respondent through auditable probability rules, records every contact attempt, conducts versioned surveys, computes defensible estimates, and presents statewide and geographic intelligence with visible uncertainty.

This is not a one-off Kelly survey. It is a reusable Campaign OS research subsystem whose election, office, candidate field, questionnaire, study, wave, geography, sampling design, and reporting configuration can be changed without forking the application.

The system exists to answer five questions:

1. What are voters telling us?
2. How much confidence should we place in the estimate?
3. Where is our sample strong or weak?
4. How is opinion changing over time and geography?
5. What range of election outcomes is plausible under explicit assumptions?

---

# 2. ENGINEERING DOCTRINE

## 2.1 Existing Red Dirt data is canonical

Do not build a second voter table, second phone directory, second geography hierarchy, or second identity model if Red Dirt already has one. Polling-specific objects reference canonical Red Dirt entities.

## 2.2 Probability selection is code, not AI judgment

OpenAI may summarize, code open-ended answers, explain aggregate trends, and detect quality anomalies. It may not decide which individual voter should be selected because of inferred political characteristics or choose respondents in a way that cannot be reproduced and audited.

The sampling engine uses explicit rules, deterministic randomization where useful, stored seeds/selection metadata, inclusion probabilities, and testable allocation logic.

## 2.3 Raw research is immutable

Original answers, interview timestamps, question order, candidate order, dispositions, and verbatim text are never overwritten by weighting, recoding, modeling, or AI output. Every derived transformation is versioned.

## 2.4 Political opinions are restricted research data

Individual survey answers are stored in a compartmentalized research layer. They do not automatically become general CRM persuasion tags or individualized targeting profiles. Aggregate research may inform campaign strategy; respondent-level political opinions remain access-controlled.

## 2.5 Evidence streams stay separate

The platform must never silently blend:

- controlled phone samples,
- online opt-in surveys,
- external/public polls,
- historical election data,
- modeled estimates,
- simulated outcomes.

Every chart and number carries a source/methodology identity.

## 2.6 Small samples do not become fake precision

City, county, regional, demographic, or subgroup estimates are hidden or explicitly marked insufficient until minimum statistical and methodological thresholds are met.

## 2.7 Every estimate carries its health information

The executive result is never just `Kelly 43%`. It must be paired with the underlying evidence quality: completed interviews, effective sample size, field dates, weighting state, coverage health, uncertainty method, and warnings.

## 2.8 Mobile is first-class

Caller and supervisor workflows must work on phone, iPad/tablet, laptop, and desktop from the first production slice.

## 2.9 Questionnaire changes are controlled changes

Questions, wording, answer choices, order logic, candidate order logic, branching, and experimental forms are versioned and frozen per wave. Trend lines must know when comparability breaks.

## 2.10 Live calling requires a compliance gate

No production calling launch occurs until applicable federal, Arkansas, voter-file contractual, privacy, recording/consent, opt-out, volunteer training, and campaign-law requirements have been reviewed and documented.

---

# 3. FINISHED PRODUCT

At 100% completion, Red Dirt contains five coordinated workspaces.

## 3.1 Caller Workbench

The volunteer experience is intentionally simple:

`Sign in → Start Session → Receive Assigned Voter → Call → Record Disposition → Run Survey if Answered → Save → Next`

The caller does not search the voter database, choose a county, cherry-pick contacts, calculate sample needs, or see campaign analytics that could bias interviewing.

The workbench displays only the minimum information needed to complete the call. It supports:

- exact interviewer introduction and script,
- randomized candidate presentation order controlled by software,
- branching questions,
- callbacks,
- refusal/no-answer/wrong-number/disconnected states,
- language and accessibility flags,
- pause/end session,
- practice mode,
- recovery if connection or browser state fails,
- clear warning if an assignment lease expires.

## 3.2 Supervisor Command Center

Supervisors see operations rather than respondent opinions unless their role also authorizes research access.

Core views:

- callers currently active,
- active assignment leases,
- attempts and completes,
- callback inventory,
- disposition distributions,
- completion times,
- interviewer QA flags,
- coverage deficits by sampling cell,
- study/wave status,
- pause/resume controls,
- supervisor reassign/release controls,
- training certification.

## 3.3 Polling Analyst Workbench

Analysts receive the research system:

- raw/unweighted results,
- weighted results,
- question-level distributions,
- crosstabs,
- sample health,
- coverage maps,
- weighting diagnostics,
- design effect/effective sample,
- experimental form comparisons,
- open-ended coding,
- external-poll comparison,
- methodology export,
- longitudinal wave comparison.

## 3.4 Executive Polling Intelligence Command Center

The campaign manager/executive sees a concise decision surface:

- current statewide estimate,
- undecided share,
- trend direction,
- issue measures,
- sample-health grade,
- geographic coverage map,
- regional/county drilldowns when supportable,
- external polling average,
- internal-vs-external comparison,
- modeled election range,
- methodology/change warnings.

Every executive tile drills into evidence rather than hiding it.

## 3.5 Research Administration

Administrators manage:

- studies,
- elections,
- candidate fields,
- waves,
- instruments,
- experimental variants,
- sample designs,
- weighting configurations,
- minimum display thresholds,
- user roles,
- methodology notes,
- external poll sources,
- data-retention policy,
- launch gates.

---

# 4. SYSTEM ARCHITECTURE

```text
CANONICAL RED DIRT PERSON/VOTER DATA
          │
          ├── voter registration
          ├── voter history
          ├── phone/contact records
          ├── geography
          └── auth / users / volunteers
          │
          ▼
CALLABLE UNIVERSE BUILDER
          │
          ▼
VERSIONED SAMPLING FRAME
          │
          ▼
SAMPLING CELLS + TARGETS
          │
          ▼
PROBABILITY / ADAPTIVE ALLOCATION ENGINE
          │
          ▼
ATOMIC ASSIGNMENT QUEUE
          │
          ▼
CALLER WORKBENCH
          │
          ├── contact attempt ledger
          └── survey interview engine
          │
          ▼
IMMUTABLE RESPONSE STORE
          │
          ├── raw answers
          ├── verbatim open text
          ├── question/candidate order
          └── interview metadata
          │
          ▼
QUALITY + WEIGHTING + ESTIMATION
          │
          ├── raw estimate
          ├── weighted estimate
          ├── effective N / design effect
          ├── suppression rules
          └── uncertainty
          │
          ▼
POLLING INTELLIGENCE COMMAND CENTER
          │
          ├── external polls
          ├── online surveys
          ├── AI aggregate analyst
          └── turnout/election simulator
```

---

# 5. CONCEPTUAL DATA MODEL

Exact table/model names are not frozen until POLL-1 audits the real Prisma schema. The conceptual domain, however, is frozen.

## 5.1 Reused canonical entities

Expected references, subject to audit:

- Person/Voter
- VoterRegistration or voter identity key
- VotingHistory
- Phone/ContactMethod
- County
- City/Municipality
- Precinct
- Congressional/legislative geography
- User
- Role/Permission
- Volunteer/Staff profile

## 5.2 Polling-specific domain objects

The final implementation must support equivalents of:

- PollStudy
- PollWave
- PollInstrument
- PollInstrumentVersion
- PollQuestion
- PollChoice
- PollBranchRule
- PollFormVariant
- PollSamplingFrame
- PollSamplingFrameMember/reference
- PollSamplingCell
- PollSamplingTarget
- PollSelectionEvent
- PollAssignment
- PollCallerSession
- PollContactAttempt
- PollInterview
- PollResponse
- PollOpenResponseCode
- PollWeightingRun
- PollRespondentWeight
- PollEstimateSnapshot
- PollSuppressionRule
- ExternalPoll
- ExternalPollResult
- OnlineSurveySubmission
- PollModelRun
- PollSimulationRun
- PollAuditEvent

These names are illustrative. POLL-1 determines which can reuse or extend existing Red Dirt models.

---

# 6. CALLABLE UNIVERSE AND SAMPLE DESIGN

## 6.1 Callable universe

The callable universe is a versioned view/derived set of eligible registered voters with a usable phone record.

Eligibility must be rule-driven and reproducible. Possible exclusions include invalid phone, DNC/research opt-out where required, known bad contact, ineligible voter status where relevant to study definition, and active assignment lock.

When new phone data is ingested into canonical Red Dirt records, eligible voters enter a future frame refresh automatically. No manual spreadsheet copy is required.

## 6.2 Frame versioning

Every sampling frame stores:

- frame creation timestamp,
- study/wave,
- target population definition,
- source data snapshot/version where available,
- inclusion/exclusion rules,
- total eligible count,
- geography counts,
- coverage limitations,
- refresh lineage.

Historical poll results always retain the frame used at collection time.

## 6.3 Sampling hierarchy

The engine must support nested coverage views:

`State → Region → Congressional District → County → City/local geography`

Additional strata may be added only when supported by reliable frame variables and benchmark data.

## 6.4 Allocation strategy

The system combines probability selection with controlled oversampling/stratification where necessary to ensure usable statewide coverage.

A sampling cell has:

- target share or target completes,
- eligible frame count,
- attempted count,
- completed count,
- deficit/surplus,
- selection probability or allocation weight,
- last completion time,
- quality warnings.

The allocation controller may increase the chance of drawing from an under-covered cell, but the actual respondent inside the selected cell is chosen randomly from eligible members.

## 6.5 Adaptive coverage

Adaptive sampling is based on sample-health variables, not individual political opinions.

Valid inputs can include:

- geography deficit,
- attempt/completion deficit,
- elapsed time since recent completes,
- frame availability,
- approved design strata.

Invalid selection inputs include a respondent's prior candidate preference or sensitive survey answer for purposes of individualized persuasion or political targeting.

## 6.6 Recontact policy

The system differentiates:

- fresh cross-sectional sample,
- callback/retry,
- deliberate panel/recontact study.

A respondent cannot silently become a repeated panelist in a tracker. Recontact rules are explicit per study.

---

# 7. QUESTIONNAIRE ENGINE

## 7.1 Instrument architecture

A study contains waves. A wave points to an immutable instrument version. Instruments contain questions, choices, branching logic, validation rules, presentation instructions, and optional randomized variants.

Publishing a wave freezes its instrument. Changes require a new version.

## 7.2 Initial Secretary of State tracker

The first production instrument should remain short enough for volunteer phone completion.

Proposed sequence:

1. Eligibility/introduction.
2. **Unprimed ballot preference** for Arkansas Secretary of State.
3. Direct-democracy / citizen-initiative measure using neutrally researched wording.
4. Confidence in Arkansas election security/accuracy.
5. If confidence is low, concise open-ended main reason.
6. One concise Secretary of State responsibility/priorities item, including business-service responsibilities without turning the survey into a civics quiz.
7. Prior presidential vote recall, with appropriate nonresponse options.
8. Party identification followed by strength/lean where applicable.
9. **Post-battery ballot preference**, explicitly stored as a post-context/experimental measure rather than substituted for baseline preference.

Exact wording is not frozen by this master plan. It must pass instrument research and pretest before field launch.

## 7.3 Candidate order

Candidate names are rotated/randomized by software. The exact presented order is persisted per interview.

The system should balance presentation positions over the sample and allow analysts to test whether order materially affected answers.

## 7.4 Ordered scales

Ordered response scales remain semantically ordered; where methodology calls for it, direction may be reversed across randomized forms rather than arbitrarily shuffled.

## 7.5 Experimental forms

The platform supports randomized assignment to form variants for legitimate survey-method experiments such as:

- candidate-order balance,
- question-order effects,
- wording experiments,
- issue framing research.

Experimental results remain labeled separately from unprimed tracking measures.

## 7.6 Open-ended answers

Verbatim answers are preserved. AI may propose codes or summaries, but:

- original text remains untouched,
- model/version is logged,
- code confidence can be stored,
- humans can review/override coding,
- aggregate reporting is the default surface.

---

# 8. MULTI-VOLUNTEER CALLING ENGINE

## 8.1 Atomic assignments

A caller requests the next assignment. The server atomically claims one eligible sampling unit and creates a lease.

No two callers can hold the same voter simultaneously.

Assignments contain:

- caller/session,
- voter reference,
- wave/frame reference,
- sampling cell,
- selection event/probability metadata,
- assigned timestamp,
- lease expiry,
- completion/release state.

## 8.2 Assignment recovery

If a browser closes or network fails, the system can recover or expire the lease without permanently losing that unit.

## 8.3 Contact attempt ledger

Every attempt is retained, including unsuccessful attempts. Standard states include:

- complete,
- partial,
- refused,
- no answer,
- voicemail,
- callback,
- wrong number,
- disconnected,
- language barrier,
- ineligible,
- do not contact/research opt-out where applicable,
- other controlled note.

Attempts are essential for response-rate and quality analysis.

## 8.4 Interviewer neutrality

The caller interface should not show live candidate polling results during an interview session. Interviewers receive the script, not strategic talking points. Training emphasizes consistent reading and neutral recording.

---

# 9. STATISTICAL INTELLIGENCE

## 9.1 Raw first

Every dashboard begins with the actual achieved sample. Analysts can inspect unweighted counts and distributions before adjustments.

## 9.2 Weighting

Weighting is introduced only after population benchmarks and frame variables are verified.

Every weighting run stores:

- version/method,
- input frame/wave,
- variables used,
- benchmark source,
- probability-of-selection adjustment,
- nonresponse/post-stratification/raking/calibration steps as applicable,
- trimming/capping rules,
- weight distribution diagnostics,
- design effect/effective-sample impact,
- created timestamp and operator/version.

## 9.3 Effective sample and uncertainty

Headline results expose:

- nominal completes,
- weighted/unweighted status,
- effective sample size where appropriate,
- design effect where appropriate,
- uncertainty method,
- field dates,
- coverage warnings.

Nonprobability online samples do not receive a conventional probability-sample margin of error unless a defensible model-based precision method has been explicitly specified and disclosed.

## 9.4 Suppression

Subgroup/geographic output requires both sample-size and quality gates. The engine can return:

- publishable,
- directional/internal only,
- insufficient sample,
- suppressed.

The UI must prefer `insufficient data` over a misleading percentage.

## 9.5 Trend comparability

Trend services know the instrument version. If a question changed materially, the system marks the historical series as a methodology break instead of drawing a continuous line without warning.

---

# 10. DASHBOARD FAMILY

## 10.1 Sample Health Dashboard

Shows:

- frame size,
- attempts,
- completes,
- response/disposition mix,
- coverage by geography,
- selection/allocation pressure,
- weighting readiness,
- effective sample,
- interviewer QA,
- under-covered cells.

## 10.2 Statewide Tracker

Shows baseline ballot preference, undecided, field window, raw/weighted toggle for authorized analysts, trend, and uncertainty/health.

## 10.3 Geography Explorer

Interactive Arkansas map with state, region, district, county, and city/local drilldown when thresholds are met.

## 10.4 Issue Dashboard

Tracks direct democracy, election confidence, Secretary of State priorities, and future versioned issue measures.

## 10.5 Movement Dashboard

Compares unprimed baseline ballot preference with post-battery experimental ballot preference without treating the latter as the normal horse-race estimate.

## 10.6 External Poll Center

Stores and compares pollster, sponsor, mode, sample population, sample size, field dates, methodology, reported uncertainty, candidate results, and source documentation.

## 10.7 Evidence Comparison

Side-by-side:

- internal controlled phone sample,
- external polling average,
- online opt-in evidence,
- modeled estimate.

No source is silently blended into another.

---

# 11. ONLINE SURVEY LANE

Red Dirt may host online surveys, but the system classifies each recruitment source.

Possible source types:

- probability-recruited,
- authenticated invited sample,
- opt-in link,
- event QR,
- email/social campaign audience,
- other nonprobability source.

Anti-abuse and quality controls should include rate limiting, duplicate heuristics, completion-time checks, attention/consistency checks where methodologically justified, source parameters, and anomaly flags.

Online opt-in results remain visibly distinct from probability-based telephone tracking.

---

# 12. OPENAI / AI RESEARCH LAYER

AI is a research assistant operating over controlled data products.

## Approved roles

- summarize aggregate changes,
- explain sample-health deficits,
- cluster/code open-ended responses,
- draft research memos from stored aggregates,
- detect unusual interviewer or submission patterns,
- identify conflicting evidence streams,
- explain model assumptions,
- answer natural-language questions about aggregate polling data.

## Required controls

- source-grounded prompts,
- no invented observations,
- uncertainty language,
- model/version logging for persisted AI outputs,
- human review for durable classifications,
- no autonomous deletion or correction of raw data,
- no AI-generated synthetic respondents mixed with human poll respondents,
- no individualized political persuasion profile derived from protected survey answers.

---

# 13. ELECTION MODEL AND SIMULATION

The election model is downstream of polling. It never overwrites or disguises observed data.

## 13.1 Turnout model

Uses voter-history data and approved benchmarks to define low/base/high or probabilistic turnout distributions.

## 13.2 Monte Carlo engine

Repeated simulations may incorporate:

- polling estimate distributions,
- turnout distributions,
- geographic relationships,
- undecided assumptions,
- model uncertainty,
- correlation assumptions where defensible.

Outputs include:

- median modeled result,
- percentile intervals,
- distribution of outcomes,
- probability-style outputs,
- assumptions and model version.

## 13.3 Scenario laboratory

Analysts may change assumptions without changing observed poll data. Scenarios are saved separately and compared side-by-side.

---

# 14. SECURITY, PRIVACY, AND ACCESS

Expected role classes:

- Polling Admin
- Research Analyst
- Polling Supervisor
- Caller
- Executive Read-Only

RBAC must enforce least privilege.

Caller access: minimum voter/contact data necessary for assigned call plus survey script.  
Supervisor access: operational calling data and QA.  
Analyst access: respondent-level research only where necessary and authorized.  
Executive access: aggregate results by default.  
Admin access: configuration and governance.

Sensitive respondent opinions require access logging and must not be broadly exposed through ordinary voter-profile pages.

---

# 15. OBSERVABILITY AND AUDITABILITY

Every critical action should be reconstructable.

Audit classes include:

- frame creation,
- frame refresh,
- sample target changes,
- selection events,
- assignment claims/releases,
- contact attempts,
- interview submission,
- instrument publication,
- weighting run,
- estimate publication,
- model run,
- admin configuration changes,
- access to restricted research where appropriate.

Operational monitoring should detect assignment contention, database failures, abnormal queue latency, failed saves, unusual interviewer speeds, and dashboard-query degradation.

---

# 16. TESTING STRATEGY

The polling system requires more than UI tests.

## Statistical tests

- uniform/random selection tests within cells,
- allocation-target convergence tests,
- deterministic seed/replay tests where used,
- exclusion/recontact tests,
- weighting fixture tests,
- suppression-threshold tests,
- simulation reproducibility tests.

## Concurrency tests

- multiple callers requesting next voter simultaneously,
- lease expiry,
- retry/recovery,
- callback assignment,
- duplicate-prevention proof.

## Survey tests

- branch logic,
- instrument immutability,
- candidate-order balancing,
- form-variant assignment,
- partial interview handling,
- nonresponse vs `not sure` distinction.

## Security tests

- caller cannot browse respondent research,
- unauthorized role cannot access respondent answers,
- executive views return aggregates only,
- admin mutations are permission-gated.

## Performance tests

- statewide callable universe scale,
- concurrent caller sessions,
- dashboard aggregations,
- weighting/model jobs,
- geographic drilldowns.

---

# 17. BUILD PHASES AND EXECUTION SLICES

No implementation slice may redefine the doctrine above without updating this master plan and recording an architectural decision.

## PHASE 0 — Governance, audit, and contracts

### POLL-0 — Repository + master system plan
**Status: COMPLETE**

Creates canonical domain and v1.0 architecture.

### POLL-1 — Existing Red Dirt schema/code audit
**Status: NEXT AFTER MASTER-PLAN FREEZE**

Read-only audit of Prisma, migrations, voter/person data, voter history, phone/contact data, geography, auth/RBAC, volunteers, contact attempts, surveys, analytics, OpenAI, admin/workbench patterns, and deployment conventions.

**No migrations. No production data writes. No UI build.**

Exit artifacts:
- existing-data reuse map,
- canonical identity/key map,
- phone-source map,
- geography map,
- RBAC/auth map,
- survey/contact overlap inventory,
- proposed relational model mapped to actual Red Dirt objects,
- migration impact forecast,
- POLL-2 implementation recommendation.

### POLL-2 — Domain contracts + migration design

Turn POLL-1 findings into reviewed schema contracts, table/model ownership, indexes, retention classes, permissions, and migration plan. Still no production migration until gate approval.

### POLL-3 — Polling database foundation

Create only the approved polling-specific domain objects and relations. Add migrations, seed/config scaffolding, repository/service boundaries, and database tests.

---

## PHASE 1 — Callable universe and sampling

### POLL-4 — Callable universe builder
### POLL-5 — Sampling-frame versioning
### POLL-6 — Sampling cells + statewide target model
### POLL-7 — Probability selector
### POLL-8 — Adaptive allocation controller
### POLL-9 — Selection audit + simulation harness

Exit gate: statistical test suite demonstrates expected selection behavior and no LLM-driven individual selection.

---

## PHASE 2 — Assignment and calling operations

### POLL-10 — Atomic assignment/lease service
### POLL-11 — Contact-attempt/disposition ledger
### POLL-12 — Caller session service
### POLL-13 — Caller workbench shell
### POLL-14 — Callback/retry workflow
### POLL-15 — Supervisor command center
### POLL-16 — Caller training + QA mode

Exit gate: many callers can operate concurrently without duplicate assignment.

---

## PHASE 3 — Survey research engine

### POLL-17 — Study/wave/instrument manager
### POLL-18 — Question/choice/branching engine
### POLL-19 — Randomized form + candidate-order engine
### POLL-20 — Secretary of State tracker research/pretest
### POLL-21 — Secretary of State tracker v1 freeze
### POLL-22 — Interview execution + immutable response store
### POLL-23 — Open-ended coding pipeline

Exit gate: instrument version is frozen, tested, neutrally reviewed, and reproducible.

---

## PHASE 4 — Statistical engine

### POLL-24 — Raw aggregation service
### POLL-25 — Sample-health metrics
### POLL-26 — Weighting benchmark/contract design
### POLL-27 — Weighting engine
### POLL-28 — Design effect/effective-N/uncertainty
### POLL-29 — Small-area suppression engine
### POLL-30 — Trend comparability/version engine

Exit gate: every published estimate has traceable inputs and methodology metadata.

---

## PHASE 5 — Dashboard family

### POLL-31 — Analyst raw-results dashboard
### POLL-32 — Sample Health Dashboard
### POLL-33 — Statewide Tracker
### POLL-34 — Geography Explorer
### POLL-35 — Issue + experimental-movement dashboards
### POLL-36 — Executive Polling Intelligence Command Center

Exit gate: executive view cannot display an estimate without evidence-health context.

---

## PHASE 6 — External and online evidence

### POLL-37 — External poll registry
### POLL-38 — External polling average
### POLL-39 — Online survey engine
### POLL-40 — Online quality/anti-abuse controls
### POLL-41 — Evidence Comparison dashboard

---

## PHASE 7 — AI research

### POLL-42 — Aggregate Polling Analyst
### POLL-43 — Open-response coding assistant
### POLL-44 — Quality/anomaly assistant
### POLL-45 — Research memo generator

Exit gate: AI outputs are source-grounded, versioned when persisted, and cannot alter raw research.

---

## PHASE 8 — Election simulation

### POLL-46 — Turnout scenario engine
### POLL-47 — Monte Carlo simulator
### POLL-48 — Scenario laboratory
### POLL-49 — Model explanation + audit view

---

## PHASE 9 — Compliance, security, and production hardening

### POLL-50 — Federal/Arkansas calling + campaign compliance review
### POLL-51 — Data classification/retention/privacy implementation
### POLL-52 — RBAC/security audit
### POLL-53 — Load/concurrency/failure testing
### POLL-54 — Methodology disclosure/export package
### POLL-55 — Production operator runbook
### POLL-56 — Launch-readiness gate

No live statewide operation before this phase's required launch gates are complete.

---

## PHASE 10 — Campaign OS generalization

### POLL-57 — Election/candidate configuration generalization
### POLL-58 — Reusable study templates
### POLL-59 — Cross-election archive and historical comparison
### POLL-60 — Campaign OS polling module certification

Exit gate: a new race can be configured without Kelly-specific schema forks or hard-coded candidate logic.

---

# 18. SLICE COMPLETION STANDARD

Every build slice must return:

1. scope completed,
2. files changed,
3. schema/migration impact,
4. privacy/security impact,
5. methodology impact,
6. tests run and results,
7. typecheck/build/check results as applicable,
8. screenshots or route proof for UI slices,
9. unresolved blockers,
10. explicit next slice,
11. Git commit SHA,
12. push/PR status.

A slice is not complete because code exists. Its stated exit gate must pass.

---

# 19. MASTER PLAN GOVERNANCE

This document is the governing product/build contract.

Changes that alter any of the following require a recorded architecture decision and master-plan update:

- canonical voter identity,
- political-opinion data exposure,
- sampling philosophy,
- AI's role in individual selection,
- source blending,
- raw-data immutability,
- weighting methodology ownership,
- suppression rules,
- production compliance gate,
- core role/access boundaries.

Cursor implementation scripts are generated **from this plan**, not the other way around.

---

# 20. FIRST EXECUTION SEQUENCE

With v1.0 frozen, the correct immediate sequence is:

`POLL-1 repo/schema audit`
→ `POLL-2 domain contracts + migration design`
→ operator review
→ `POLL-3 database foundation`
→ callable-universe/sampling implementation.

The existing POLL-1 Cursor script may now be revised against this v1.0 plan before execution. It is not the governing artifact; this master plan is.

---

# 21. EXTERNAL METHODOLOGY BASELINE

Engineering and methodology should remain aligned with current professional survey-research norms, including transparent sampling-frame definition, probability/nonprobability labeling, question/order controls, weighting disclosure, uncertainty limitations, and explicit reporting of methodology changes. The project's methodology documentation should be reviewed against current AAPOR/Pew guidance before each major production release.
