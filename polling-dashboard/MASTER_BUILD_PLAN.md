# RED DIRT POLLING INTELLIGENCE — MASTER BUILD PLAN v2.0

Status: **GOVERNING DESIGN / PRE-BUILD DEPTH PASS COMPLETE**  
Build family: `POLL`  
Repository: `Grappe501/reddirt`  
Expected local root: `H:\SOSWebsite\RedDirt\polling-dashboard\`  
Authority: this document governs all future polling Cursor/Bert build scripts. If a generated script conflicts with this plan, this plan wins.

---

# 0. Mission

Build a production-grade, reusable statewide polling and public-opinion research system inside Red Dirt. The system must use the existing voter/person, voter-history, geography, phone, authentication, analytics, and campaign infrastructure rather than creating a parallel voter universe.

The platform must support:
- probability-oriented live-caller research from a registered-voter phone frame,
- multi-volunteer concurrent calling,
- short scientifically governed questionnaires,
- adaptive geographic sample allocation,
- immutable raw responses,
- transparent weighting and uncertainty,
- statewide/regional/county/city drilldowns only where supportable,
- external poll ingestion,
- opt-in online survey evidence as a separate nonprobability lane,
- OpenAI-assisted aggregate analysis and open-response coding,
- reproducible election simulation,
- strong privacy/RBAC/audit controls,
- campaign-agnostic reuse for future elections and studies.

The product is not simply a poll dashboard. It is a **Polling Research Operating System**.

---

# 1. Non-negotiable engineering doctrine

1. **Canonical Red Dirt voter spine only.** Never duplicate the voter/person universe.
2. **Sampling code, not an LLM, selects cases.** AI may explain or analyze; it does not determine individual eligibility or who receives a call.
3. **Known frame limitation is always visible.** The initial probability frame is registered voters for whom Red Dirt has usable phone data. The system must quantify frame coverage and never imply that weighting magically observes phone-missing voters.
4. **Every draw is auditable.** Persist frame version, cell, eligibility, inclusion probability, draw timestamp, seed/version metadata, and reasons for exclusion.
5. **Raw responses are immutable.** Corrections create superseding records or review flags; they never silently rewrite historical answers.
6. **Observed data, weighted estimates, external polling, opt-in surveys, AI summaries, and simulations remain distinct evidence classes.** No silent blending.
7. **Baseline candidate preference is measured before issue priming.** Any later ballot question is explicitly a post-context/experimental measure.
8. **Candidate/order randomization is software-controlled and stored.** Callers never choose the order.
9. **Small-area estimates are suppressed by policy.** No county/city percentage is displayed merely because a few respondents exist.
10. **Volunteer screens minimize bias.** Callers do not see live candidate results or respondent targeting classifications.
11. **Sensitive respondent opinion data is compartmentalized.** Individual political opinions do not become casual campaign CRM tags or individualized persuasion profiles.
12. **Live manual calling is the initial operating mode.** Any future autodialer, prerecorded voice, artificial voice, AI voice, or texting integration requires a separate compliance and architecture gate before implementation.
13. **No production calling before legal/compliance review.** Federal, Arkansas, voter-file, privacy, calling-time, consent/recording, opt-out, retention, and campaign rules must be documented and approved.
14. **Instrument versions are immutable after field launch.** Material wording/order/branching changes create a new version/wave and comparability marker.
15. **Every statistical output is reproducible.** Every weight run, estimate run, trend run, and simulation run stores versioned inputs and assumptions.
16. **No false precision.** Display uncertainty, effective sample, coverage warnings, and model assumptions.
17. **Mobile/iPad/desktop from day one.** Caller and supervisor flows are responsive, accessible, and thumb-friendly.
18. **Fail closed on sensitive writes.** If assignment, permissions, survey version, or database state is uncertain, the system stops rather than guessing.
19. **Every slice closes with proof.** Tests, generated artifacts, typecheck/build, data safety proof, and Git commit/push are mandatory.
20. **Bert executes the plan; Bert does not redesign the product.** Architecture changes discovered during implementation return to the operator/design lane as explicit decisions.

---

# 2. Finished product — five workspaces

## 2.1 Caller Workbench
Purpose: allow a trained volunteer to complete high-quality live interviews with minimal cognitive load.

Primary loop:
`Sign in → Start session → Claim next case → Call manually → Record disposition → If answered, run exact script → Save → Next case`

Caller sees only:
- respondent first/last name only if operationally necessary,
- phone number,
- broad geography needed for verification,
- exact approved introduction/script,
- current question and valid answers,
- callback controls,
- help/escalation,
- session progress.

Caller must not see:
- statewide candidate results,
- how that voter is expected to vote,
- partisan targeting scores,
- donor history unless explicitly required for another non-polling workflow,
- weighting variables,
- sample-cell deficit logic,
- AI-generated persuasion advice.

## 2.2 Supervisor Command Center
Purpose: operate the field period.

Shows:
- callers online/offline,
- active assignment leases,
- attempts/completes/partials/refusals,
- callbacks due,
- cell coverage deficits,
- interviewer completion-time distributions,
- disposition anomalies,
- script deviation/QA flags,
- soft-launch status,
- study pause/kill switch,
- training/certification status,
- unresolved cases and stale leases.

## 2.3 Polling Analyst Workbench
Purpose: inspect data quality and produce defensible estimates.

Includes:
- sample-frame health,
- frame coverage,
- inclusion probabilities,
- raw distributions,
- weighting diagnostics,
- effective sample size/design effect,
- response/disposition rates,
- geographic coverage,
- interviewer effects,
- instrument/order effects,
- trend comparability,
- external poll comparison,
- estimate-run creation/versioning,
- downloadable internal methodology report.

## 2.4 Executive Polling Intelligence Command Center
Purpose: answer campaign leadership questions without hiding uncertainty.

Default surfaces:
- current statewide baseline estimate,
- undecided/other,
- uncertainty band,
- nominal and effective sample,
- data-quality confidence state,
- coverage map,
- trend by comparable wave/window,
- issue attitudes,
- external-poll comparison,
- clear last-updated/methodology banner,
- scenario/simulation access kept visually separate from observed polling.

## 2.5 Research Administration
Purpose: configure studies without code forks.

Manage:
- elections/offices/candidate sets,
- studies and waves,
- target population definition,
- frame rules,
- sampling cells/targets,
- call-attempt protocol,
- instruments and versions,
- randomized form rules,
- benchmark sets,
- weighting recipes,
- suppression rules,
- external poll sources,
- online survey forms,
- roles/permissions,
- retention/compliance settings,
- launch approvals and audit history.

---

# 3. Evidence taxonomy

Every analytical object must carry an evidence class.

`PHONE_PROBABILITY_FRAME` — controlled live-call sampling from a documented voter/phone frame.

`ONLINE_OPT_IN` — self-selected/nonprobability online response. Never receives conventional probability-sample MOE unless a separately justified model is documented.

`EXTERNAL_POLL` — externally produced poll with captured methodology/source metadata.

`ADMINISTRATIVE_VOTER_DATA` — voter-file facts such as registration/geography/turnout history; never infer candidate vote from participation history.

`MODEL_ESTIMATE` — derived estimate from one or more approved evidence classes with documented methodology.

`SIMULATION` — modeled election outcomes under explicit assumptions.

`AI_ANALYSIS` — natural-language or categorical analysis derived from approved stored inputs.

UI, exports, and APIs must never obscure this classification.

---

# 4. Target population and frame doctrine

The system must distinguish:
- target population,
- sampling frame,
- selected sample,
- contacted sample,
- eligible respondents,
- completed interviews,
- analysis sample.

Initial intended target population may be Arkansas registered voters or a separately defined likely-voter population. That choice is study configuration, not hard-coded.

Initial live-call frame is expected to be a subset of registered voters with at least one usable phone number. Therefore every frame build must calculate:
- total voters in target population,
- voters with any phone,
- voters with callable phone,
- coverage percentage statewide,
- coverage by county/region/city/other approved strata,
- phone-source mix,
- known mobile/landline/unknown where available,
- missingness patterns by available administrative variables,
- duplicate/shared-phone rates,
- invalid/disconnected rates from field outcomes.

**Hard rule:** if frame coverage differs meaningfully across geography or voter characteristics, the dashboard must surface that limitation. Post-stratification can reduce some imbalances but cannot be described as curing unknown coverage/nonresponse bias.

---

# 5. Conceptual data model

Exact reuse/create decisions wait for POLL-1/POLL-2 audit, but the polling domain must ultimately support these concepts.

## Core configuration
- `PollingElection`
- `PollingStudy`
- `PollingWave`
- `TargetPopulationDefinition`
- `Instrument`
- `InstrumentVersion`
- `Question`
- `QuestionOption`
- `BranchRule`
- `RandomizationScheme`
- `RandomizationArm`

## Sampling
- `SamplingFrame`
- `SamplingFrameMember` (prefer reference/link to canonical voter, not voter duplication)
- `SamplingCellDefinition`
- `SamplingCellSnapshot`
- `SampleDraw`
- `SampleDrawMember`
- `InclusionProbabilityRecord`
- `EligibilityDecision`

## Calling operations
- `PollingCase`
- `AssignmentLease`
- `CallerSession`
- `ContactAttempt`
- `Disposition`
- `CallbackRequest`
- `RefusalRecord`
- `ContactSuppression`
- `CallerCertification`
- `QAReview`

## Interviews
- `Interview`
- `InterviewEvent`
- `QuestionPresentation`
- `Response`
- `VerbatimResponse`
- `OpenResponseCode`
- `OpenResponseCodingRun`
- `InstrumentDeviation`

## Statistics
- `PopulationBenchmarkSet`
- `WeightingRecipe`
- `WeightRun`
- `RespondentWeight`
- `EstimateDefinition`
- `EstimateRun`
- `EstimateValue`
- `TrendSeries`
- `SuppressionDecision`
- `QualityDiagnostic`

## External/online
- `ExternalPoll`
- `ExternalPollResult`
- `ExternalPollSource`
- `OnlineSurveySubmission`
- `OnlineSurveyQualityFlag`

## Simulation/AI
- `TurnoutScenario`
- `SimulationSpecification`
- `SimulationRun`
- `AIAnalysisRun`
- `ResearchMemo`

## Governance
- `PollingAuditEvent`
- `ComplianceApproval`
- `DataRetentionAction`
- `ReleaseApproval`

Every object must have created/updated timestamps where appropriate, actor/source metadata, study/wave scope, and stable identifiers.

---

# 6. Required state machines

## 6.1 Polling case state
`ELIGIBLE → DRAWN → AVAILABLE → LEASED → ATTEMPTED → {CALLBACK, RETRY_ELIGIBLE, COMPLETE, PARTIAL, REFUSED, DNC, INVALID, INELIGIBLE, EXHAUSTED}`

No illegal transitions. Every transition produces an audit event.

## 6.2 Assignment lease state
`ACTIVE → COMPLETED | RELEASED | EXPIRED | SUPERVISOR_REVOKED`

Lease creation must be atomic. Two callers can never own the same active case.

## 6.3 Interview state
`STARTED → IN_PROGRESS → COMPLETE | PARTIAL | TERMINATED | INVALIDATED_BY_QA`

Responses persist incrementally so browser/device failure does not erase completed answers.

## 6.4 Instrument lifecycle
`DRAFT → QA → SOFT_LAUNCH_APPROVED → FIELD_ACTIVE → CLOSED → ARCHIVED`

Once `FIELD_ACTIVE`, the version content is immutable.

## 6.5 Study/wave lifecycle
`DRAFT → READY → SOFT_LAUNCH → FIELD_ACTIVE → PAUSED | CLOSED → WEIGHTED → RELEASE_APPROVED → ARCHIVED`

## 6.6 Estimate lifecycle
`DRAFT_SPEC → COMPUTED → QA_REVIEWED → APPROVED → SUPERSEDED`

Executive surfaces only use approved estimate runs unless explicitly in analyst-preview mode.

---

# 7. Sampling architecture in depth

## 7.1 Frame creation
A frame build is versioned and reproducible. It stores the query/rules used, benchmark timestamp, source table versions where available, counts, exclusions, and a hash/signature of configuration.

Eligibility may include:
- active registration or study-defined registration status,
- valid Arkansas geography,
- usable phone,
- not globally suppressed,
- not already completed in an incompatible wave,
- attempt/recontact policy eligibility.

## 7.2 Sampling cells
Primary allocation cells should begin with geography because statewide coverage is a core objective. Initial hierarchy:
`State → Region → Congressional District → County → City/local area where numerically useful`.

Do not explode into sparse multidimensional cells prematurely. Demographic/turnout variables may enter balancing/weighting only after audit proves reliable benchmarks and adequate cell sizes.

Each cell snapshot stores:
- target share or target completes,
- frame count,
- selected count,
- attempt count,
- contact count,
- eligible interview count,
- completed count,
- current deficit/surplus,
- selection multiplier,
- floor/cap constraints.

## 7.3 Adaptive allocation
Adaptive allocation may change the probability that the next draw comes from a cell based on coverage deficits, but selection inside the chosen cell remains randomized among eligible frame members.

The controller must:
- have bounded multipliers,
- never make eligible members unknowably selectable/nonselectable,
- record the allocation policy version,
- record inclusion probabilities or sufficient data to reconstruct them,
- include a dry-run simulator,
- prevent runaway oversampling of tiny cells,
- stop adapting if diagnostics fail.

## 7.4 Draw strategy
Prefer batch draws or controlled replenishment over an opaque per-click random query. A draw batch should be inspectable and reproducible.

Possible layers:
1. calculate cell allocation for the next batch,
2. sample randomly within each cell,
3. create polling cases,
4. release cases to assignment queue,
5. replenish when queue thresholds are reached.

## 7.5 Recontact doctrine
The system must distinguish:
- fresh cross-sectional respondents,
- callbacks for an incomplete contact,
- approved panel/recontact studies.

A tracking poll must not accidentally become a panel because the same reachable people are repeatedly surveyed.

Configurable rules:
- minimum days before a completed respondent may enter a new eligible wave,
- maximum attempts per case,
- maximum attempts per day,
- attempt windows/days,
- hard refusal suppression,
- soft refusal policy,
- callback overrides,
- wrong-number/disconnected suppression.

## 7.6 Time-of-day/day-of-week bias
Field operations must avoid only calling at one convenient volunteer time. The system should report attempts and completes by daypart/day-of-week and support randomized/allocated attempt windows where operationally feasible.

---

# 8. Calling operations doctrine

## 8.1 Initial dialing mode
Phase 1 production mode is **human live calling with manual or compliance-approved click-to-call behavior**. Do not implement predictive dialing, prerecorded voice, artificial/AI voice, automated political calling, or automated text follow-up in the core build.

Any future dialing provider integration is a separate slice requiring:
- legal review,
- provider terms review,
- caller-ID policy,
- consent/opt-out design,
- mode-specific TCPA/Arkansas review,
- abuse-rate monitoring,
- kill switch.

## 8.2 Contact attempt protocol
Each attempt stores:
- case,
- caller,
- timestamp,
- local-time classification,
- number used,
- attempt sequence,
- disposition,
- duration where available,
- callback date/time if requested,
- structured notes only where necessary,
- whether interview began,
- technical errors.

## 8.3 Standard dispositions
At minimum:
- complete,
- partial,
- refused-hard,
- refused-soft,
- no-answer,
- voicemail,
- busy,
- callback-requested,
- wrong-person,
- wrong-number,
- disconnected,
- language-barrier,
- respondent-ineligible,
- duplicate/shared-number issue,
- do-not-contact request,
- technical failure,
- other-supervisor-review.

Map dispositions to a methodology-reporting taxonomy and calculate consistent outcome/response metrics.

## 8.4 Caller QA
System must detect/report:
- implausibly fast interviews,
- unusually high completion rates,
- unusual refusal/disposition patterns,
- excessive missing answers,
- repeated answer strings,
- instrument deviations,
- high invalidation rates,
- caller-specific candidate distributions materially different after controlling for assignment mix.

Flags never automatically accuse or delete. They enter supervisor/analyst review.

---

# 9. Survey instrument doctrine

## 9.1 Core tracking instrument goals
Keep routine instrument short enough that ordinary voters will finish it.

Initial conceptual order:
1. introduction/eligibility,
2. **unprimed Secretary of State ballot preference**,
3. direct-democracy/citizen-initiative attitude,
4. election-security/accuracy confidence,
5. low-confidence open-ended reason branch,
6. one concise Secretary of State duty/priorities item (e.g. business filing/service competence),
7. political baseline variables near end,
8. optional post-context ballot preference, explicitly classified as post-battery/experimental.

Exact wording is not frozen in the master plan; it is a research-design deliverable.

## 9.2 Candidate order
Candidate options such as Kelly, Kim Hammer, Michael Pakko/Packo (exact ballot spelling must be verified before launch) must be presented under a balanced software randomization scheme. Store the actual order presented for every interview.

Use balanced permutations/position allocation rather than ad hoc random choice if sample size allows, so each candidate appears in each position approximately equally.

## 9.3 Ordinal scales
For ordered scales, preserve meaningful order. Where methodologically useful, randomly reverse scale direction across respondents and store orientation.

## 9.4 Direct democracy wording
Do not embed campaign advocacy into the measurement question. Separate any factual description from evaluative language; pretest comprehension; freeze wording after soft launch.

## 9.5 Election-confidence wording
Use a balanced confidence scale. Low-confidence follow-up should initially permit verbatim open response. AI may code categories after collection, but original text remains authoritative.

## 9.6 Political baselines
Party identification should use a conventional branch structure rather than forcing every respondent into an arbitrary single 1–5 scale. Store enough detail to derive strong/weak/lean categories.

Past presidential vote is self-report and must be labeled as such. Voter history can validate turnout participation where legally/technically available but does not reveal candidate choice.

## 9.7 Baseline vs post-context ballot
The first ballot item is the tracking baseline. A second ballot item after issue questions measures post-context response and is never substituted into the baseline series. It cannot be described as persuasion impact unless a randomized experimental design supports that inference.

## 9.8 Soft launch
Every materially new instrument version receives a soft launch before full fielding. Soft launch checks:
- script comprehension,
- average duration,
- branch logic,
- randomization balance,
- missing/error rates,
- caller feedback,
- unexpected respondent confusion,
- database event integrity.

Soft-launch interviews are flagged. Whether they enter final analysis is an explicit decision.

---

# 10. Statistics and weighting doctrine

## 10.1 Raw first
Every dashboard can reconstruct unweighted counts before any adjustment.

## 10.2 Base weights
For probability-oriented draws, base weight starts from inverse inclusion probability where inclusion probabilities are valid/reconstructible.

## 10.3 Nonresponse/calibration
Any adjustment for nonresponse or calibration must document:
- benchmark variables,
- benchmark source/date,
- algorithm,
- convergence criteria,
- trimming/capping,
- missing-category handling,
- diagnostics before/after,
- sensitivity alternatives.

Potential methods include post-stratification/raking only after benchmark quality is validated.

## 10.4 Weight diagnostics
Every run stores and displays:
- min/max weight,
- mean/median,
- percentile distribution,
- coefficient of variation,
- trimming count,
- effective sample size,
- design effect attributable to weighting where calculated,
- target-vs-achieved margins,
- failed/converged status.

## 10.5 Estimate runs
An estimate run is an immutable package containing:
- study/wave/window,
- eligible interviews,
- exclusions/QA rules,
- weight run,
- estimator version,
- confidence/uncertainty method,
- suppression policy,
- timestamp,
- code/version identifier.

## 10.6 Rolling windows
7/14/30/60/90-day windows are allowed only when the instrument is comparable and sample size/field conditions support them. The system must mark questionnaire or methodology breaks.

## 10.7 Small-area suppression
Suppression is rule-based and configurable. Inputs may include:
- unweighted n,
- effective n,
- weight concentration,
- cell coverage,
- time span,
- geographic frame coverage,
- uncertainty width.

The UI should show `INSUFFICIENT DATA` rather than a seductive but unstable percentage.

## 10.8 Likely-voter modeling
Do not silently convert a registered-voter poll into a likely-voter poll. Likely-voter modeling is a separate model specification using documented inputs such as turnout history and self-reported likelihood. It produces a distinct labeled estimate.

---

# 11. Data quality and bias monitoring

Build a quality scorecard covering:
- frame coverage,
- sample allocation deviation,
- phone reachability,
- response/disposition rates,
- nonresponse patterns,
- interview duration,
- caller effects,
- candidate-order effects,
- question-order effects,
- missingness,
- duplicate/shared-number issues,
- weight concentration,
- effective sample,
- benchmark mismatch,
- wave comparability,
- online-survey fraud/duplicate signals,
- external-poll source completeness.

Quality states:
`GREEN / YELLOW / RED / NOT ENOUGH INFORMATION`.

A red quality gate can automatically prevent executive publication while preserving analyst access.

---

# 12. Online survey lane

Online surveys are useful for engagement, issue exploration, message testing, and high-volume feedback, but self-selected links are not silently treated as probability polls.

Requirements:
- unique study/form versions,
- source/UTM/referral tracking,
- rate limiting,
- duplicate/device/session heuristics where lawful,
- bot/abuse defenses,
- completion-time checks,
- response-pattern flags,
- optional invitation-token mode for controlled samples,
- evidence class `ONLINE_OPT_IN` unless a distinct probability recruitment design exists.

Keep online estimates separate from phone tracking by default.

---

# 13. External polling lane

Store complete source metadata:
- pollster,
- sponsor,
- source URL/document,
- field dates,
- target/sample population,
- sample size,
- mode,
- frame/recruitment description,
- weighting description if reported,
- margin/error/precision language as reported,
- candidate question wording/order if available,
- results,
- undecided/other treatment,
- quality notes.

External polling average methodology must be transparent and versioned. Do not invent missing methodology.

---

# 14. OpenAI/AI architecture

Allowed uses:
- code open-ended verbatim responses into analyst-defined categories,
- summarize aggregate themes,
- explain data-quality diagnostics,
- compare approved aggregate estimates,
- identify sampling holes from aggregate cell data,
- generate internal research memos from approved evidence,
- surface uncertainty and contradictions.

Required controls:
- minimum necessary data sent to model,
- no full voter profile payload when not required,
- prompt/version logged,
- model/version logged,
- structured outputs where appropriate,
- source record IDs retained,
- human-review status,
- uncertainty/confidence,
- original verbatim preserved,
- no autonomous deletion or respondent-level persuasion tagging.

Prohibited core uses:
- selecting individual voters for political persuasion,
- inventing missing responses,
- imputing an individual's political opinion as if observed,
- changing raw answers,
- automatically publishing conclusions,
- deciding legal/compliance eligibility.

---

# 15. Election simulation architecture

Simulation is downstream of approved polling estimates and turnout assumptions.

Separate inputs:
- approved poll estimate distributions,
- turnout scenario/model,
- geography relationships,
- undecided allocation assumptions,
- correlation assumptions,
- model error/uncertainty,
- external benchmark assumptions.

Every run stores:
- complete specification,
- random seed,
- number of simulations,
- source estimate IDs,
- turnout model version,
- assumptions,
- outputs.

Outputs may include:
- median vote share/margin,
- percentile bands,
- probability-like win frequency under the stated model,
- geography contribution summaries,
- sensitivity analysis.

Never present simulation probability as a poll result or certainty.

---

# 16. Security, privacy, RBAC, retention

Roles should resolve from existing Red Dirt RBAC rather than create a shadow auth system. Proposed capabilities:

`polling_admin` — configure studies, launch/pause, manage permissions.

`polling_analyst` — respondent-restricted analytical access, weighting, estimates, QA.

`polling_supervisor` — caller operations, callbacks, QA flags, no unrestricted exports.

`polling_caller` — only assigned case and active questionnaire.

`polling_executive` — approved aggregate dashboards only.

Additional controls:
- row/query scoping by study and role,
- no unrestricted respondent-level CSV export by default,
- audit all sensitive reads/exports where feasible,
- secrets remain server-side,
- OpenAI key never reaches client,
- redact/minimize logs,
- retention policy for verbatim and operational notes,
- explicit deletion/suppression workflows,
- backups/restore proof for new polling tables,
- environment separation and no production experiments from local scripts.

---

# 17. Compliance architecture

Compliance is a launch gate, not a footnote.

Maintain a versioned compliance matrix covering:
- live manual political/research calls,
- automated dialing,
- prerecorded/artificial/AI voice,
- SMS/text,
- caller ID,
- calling hours,
- do-not-contact requests,
- federal TCPA/FCC rules,
- Arkansas automated/political call provisions,
- campaign-finance/disclaimer implications where applicable,
- recording consent if any recording is ever proposed,
- voter-file contractual restrictions,
- volunteer access/privacy,
- data retention,
- vendor terms.

Initial production approval should cover **live volunteer calls only** unless legal counsel/operator explicitly approves additional modes.

---

# 18. Observability and operator safety

Build operational metrics:
- queue depth,
- lease contention/failures,
- stale leases,
- assignment latency,
- save failure rate,
- interview autosave errors,
- API error rates,
- database latency,
- OpenAI error/cost usage,
- weighting job failures,
- estimate job failures,
- dashboard query performance,
- audit-log failures.

Kill switches:
- pause entire polling system,
- pause study,
- pause wave,
- stop new assignments while preserving active interviews,
- disable OpenAI layer,
- disable online submissions,
- disable estimate publication.

All kill switches must be reversible and auditable.

---

# 19. Test strategy

## Unit tests
- eligibility logic,
- disposition transitions,
- branching,
- randomization allocation,
- inclusion-probability math,
- weighting math,
- suppression rules,
- RBAC helpers.

## Property/statistical tests
- sampler approximates configured probabilities over large simulations,
- candidate order is balanced,
- no case is simultaneously leased twice,
- adaptive controller improves deficits without violating caps,
- weights reproduce benchmark margins within tolerance,
- effective sample calculations are stable.

## Integration tests
- canonical voter → frame → draw → case → assignment → attempt → interview → estimate,
- callback lifecycle,
- refusal/DNC suppression,
- wave closure,
- instrument immutability,
- OpenAI structured-output fallback,
- external poll ingestion.

## Concurrency/load tests
- many callers requesting cases simultaneously,
- assignment expiration/reclaim,
- autosave under load,
- dashboard reads during active calling,
- weighting jobs against production-scale synthetic counts.

## UX tests
- phone portrait,
- iPad/tablet,
- desktop,
- keyboard navigation,
- screen-reader labels,
- interrupted network recovery,
- long names/open responses,
- caller error correction.

## Safety tests
- caller cannot access another case,
- executive cannot access respondent-level records,
- client cannot access secrets,
- logs do not leak phone/opinion data,
- invalid instrument version cannot field,
- red quality state blocks publication.

---

# 20. Build artifact contract

Every slice must create/update as appropriate:
- implementation code,
- tests,
- `polling-dashboard/develop_notes/` slice report,
- machine-readable status,
- architecture/data-contract docs when changed,
- migration only when that slice explicitly permits it.

Every Bert return must state:
- slice ID,
- files changed,
- migrations/schema effects,
- commands run and pass/fail,
- tests added,
- data touched,
- security/compliance implications,
- unresolved blockers,
- next allowed slice,
- Git commit SHA and push status.

No slice is complete merely because UI renders.

---

# 21. Phase and slice roadmap

## PHASE A — Pre-build truth and architecture

**POLL-0 — Domain + master-plan foundation** — COMPLETE.

**POLL-1 — Read-only Red Dirt schema/code audit**  
Inventory canonical voter/person, voter history, phones, geography, auth/RBAC, users/volunteers, contact attempts, surveys/forms, analytics, OpenAI, admin route patterns, migrations, deployment conventions. No schema edits.

**POLL-2 — Reuse/extend/create decision map**  
For every conceptual object in Section 5, map to existing model, extension, or new polling-specific object. Identify conflicts/debt.

**POLL-3 — Polling domain contracts v1**  
Machine-readable contracts for study, wave, frame, case, assignment, interview, response, estimate, audit events.

**POLL-4 — RBAC/data-classification design**  
Exact permission matrix, respondent-data boundary, exports, audit needs.

**POLL-5 — Compliance mode matrix**  
Document live-manual initial mode and explicitly block unapproved automated modes.

**POLL-6 — Migration plan + rollback plan**  
Design migrations without applying production changes; indexes, FK strategy, retention, rollback.

**POLL-7 — Architecture review gate**  
Operator reviews POLL-1–6. Only after PASS may migrations begin.

## PHASE B — Database foundation

**POLL-8 — Core study/wave schema**

**POLL-9 — Instrument/version schema**

**POLL-10 — Sampling/frame schema**

**POLL-11 — Case/assignment/contact schema**

**POLL-12 — Interview/response schema**

**POLL-13 — Statistics/estimate schema**

**POLL-14 — Audit/compliance schema**

**POLL-15 — Database indexes/constraints/retention foundations**

**POLL-16 — Database migration proof + rollback proof**

## PHASE C — Frame and sampling engine

**POLL-17 — Callable-universe eligibility service**

**POLL-18 — Phone normalization/dedup/shared-number handling**

**POLL-19 — Frame builder + frame versioning**

**POLL-20 — Frame-coverage diagnostics**

**POLL-21 — Geography hierarchy + sampling-cell builder**

**POLL-22 — Target allocation configuration**

**POLL-23 — Probability draw engine**

**POLL-24 — Inclusion-probability/audit ledger**

**POLL-25 — Adaptive allocation controller**

**POLL-26 — Sampling simulation/property-test harness**

**POLL-27 — Queue replenishment service**

## PHASE D — Multi-caller operations

**POLL-28 — Atomic assignment lease service**

**POLL-29 — Case state machine**

**POLL-30 — Caller session service**

**POLL-31 — Contact attempt/disposition engine**

**POLL-32 — Callback scheduler**

**POLL-33 — Refusal/DNC/recontact policy engine**

**POLL-34 — Stale lease recovery + supervisor controls**

**POLL-35 — Concurrency/load proof**

## PHASE E — Survey research engine

**POLL-36 — Question/branch renderer engine**

**POLL-37 — Randomization allocation engine**

**POLL-38 — Incremental interview autosave/event ledger**

**POLL-39 — Instrument immutability + lifecycle controls**

**POLL-40 — Initial Secretary of State instrument research draft**

**POLL-41 — Neutral wording/pretest review**

**POLL-42 — Soft-launch workflow and QA report**

**POLL-43 — Final tracking instrument v1 freeze**

**POLL-44 — Open-ended verbatim pipeline**

## PHASE F — Caller and supervisor UI

**POLL-45 — Caller mobile shell**

**POLL-46 — Assigned-case/call workflow**

**POLL-47 — Survey UI + branching/randomization display**

**POLL-48 — Callback/refusal/error recovery UX**

**POLL-49 — Training/certification mode**

**POLL-50 — Supervisor live operations dashboard**

**POLL-51 — Caller QA/anomaly review queue**

**POLL-52 — Accessibility/mobile/iPad hardening**

## PHASE G — Statistical engine

**POLL-53 — Raw tabulation service**

**POLL-54 — Benchmark registry**

**POLL-55 — Base-weight engine**

**POLL-56 — Calibration/raking engine**

**POLL-57 — Weight trimming + diagnostics**

**POLL-58 — Effective-sample/design-effect service**

**POLL-59 — Estimate-run engine**

**POLL-60 — Suppression/insufficient-data engine**

**POLL-61 — Rolling-window/comparability service**

**POLL-62 — Registered-voter vs likely-voter estimate separation**

**POLL-63 — Statistical validation battery**

## PHASE H — Intelligence dashboards

**POLL-64 — Analyst sample-health dashboard**

**POLL-65 — Raw vs weighted results dashboard**

**POLL-66 — Arkansas coverage map**

**POLL-67 — Geographic drilldowns with suppression**

**POLL-68 — Trend/wave dashboard**

**POLL-69 — Instrument/order-effect diagnostics**

**POLL-70 — Executive Polling Intelligence Command Center**

**POLL-71 — Methodology/explanation drawer**

**POLL-72 — Publication approval gate**

## PHASE I — Online and external evidence

**POLL-73 — External poll registry/import**

**POLL-74 — External methodology/quality record**

**POLL-75 — External poll aggregation v1**

**POLL-76 — Online survey builder**

**POLL-77 — Online abuse/data-quality controls**

**POLL-78 — Evidence comparison dashboard**

## PHASE J — AI research layer

**POLL-79 — Open-response coding taxonomy manager**

**POLL-80 — OpenAI structured coding service**

**POLL-81 — Aggregate polling analyst assistant**

**POLL-82 — Data-quality/anomaly explainer**

**POLL-83 — Grounded research memo generator**

**POLL-84 — AI privacy/cost/fallback hardening**

## PHASE K — Election simulation

**POLL-85 — Turnout-scenario specification**

**POLL-86 — Turnout model v1**

**POLL-87 — Monte Carlo engine**

**POLL-88 — Seed/reproducibility/run registry**

**POLL-89 — Scenario laboratory UI**

**POLL-90 — Sensitivity/assumption diagnostics**

**POLL-91 — Simulation vs observed-evidence separation audit**

## PHASE L — Production hardening

**POLL-92 — Full RBAC penetration/access review**

**POLL-93 — PII/log/export privacy review**

**POLL-94 — Compliance approval for live calling**

**POLL-95 — Backup/restore/disaster-recovery proof**

**POLL-96 — Production-scale load test**

**POLL-97 — Operator runbook + incident/kill-switch drills**

**POLL-98 — Volunteer training package**

**POLL-99 — Analyst methodology runbook**

**POLL-100 — Executive interpretation guide**

**POLL-101 — Production launch gate**

## PHASE M — Campaign OS generalization

**POLL-102 — Remove Kelly-specific hard-coding audit**

**POLL-103 — New election/study configuration wizard**

**POLL-104 — Reusable template library**

**POLL-105 — Campaign activity aggregate overlay**

**POLL-106 — Event/time-series observational analysis**

**POLL-107 — Archive/export/research reproducibility package**

**POLL-108 — Campaign OS polling module certification**

---

# 22. Critical dependency chain

The shortest safe path to first live fielding is not the shortest path to the entire platform.

First-live-call critical path:
`POLL-1 → 2 → 3 → 4 → 5 → 6 → 7 → 8–16 → 17–27 → 28–35 → 36–43 → 45–52 → 53 → 60 → 64 → 94 → 101(partial live-call readiness gate)`

Weighted public/internal estimate path additionally requires:
`POLL-54 → 55 → 56 → 57 → 58 → 59 → 63 → 65 → 70 → 72`.

AI, online surveys, external polls, and simulation are not prerequisites for collecting the first scientifically governed phone interviews.

This sequencing prevents beautiful dashboards from outrunning data quality.

---

# 23. Definition of done for first operational release

The first operational release is ready only when:
- canonical voter/phone reuse is proven,
- callable frame coverage is quantified,
- sampling draw and inclusion probability are auditable,
- concurrent caller assignment cannot duplicate cases,
- call dispositions/recontact rules work,
- instrument v1 has passed soft launch and is immutable,
- candidate order randomization is validated,
- baseline/post-context measures are separated,
- caller UI works mobile/iPad/desktop,
- respondent opinions are access-restricted,
- supervisor can pause the study,
- raw tabulations and sample-health dashboard work,
- small-area suppression works,
- live-call compliance gate is approved,
- backups/rollback and error recovery are proven,
- all required tests/build/typecheck pass,
- production deployment is traceable to Git.

Weighted executive reporting is a later gate unless the statistical engine has also passed validation.

---

# 24. Decisions intentionally deferred until evidence exists

Do not guess these during POLL-1:
- exact Red Dirt model names to reuse,
- exact database indexes until schema/query patterns are audited,
- exact benchmark variables for weighting,
- exact city-level display thresholds,
- exact likely-voter formula,
- exact questionnaire wording,
- exact number of contact attempts,
- exact field hours beyond legal/operational constraints,
- whether click-to-call provider integration is used,
- whether Spanish-language fielding is launch-v1 or a subsequent instrument version,
- exact external-poll averaging coefficients.

Each deferred decision has a designated slice where evidence is available. Bert must not silently make these decisions earlier.

---

# 25. Research/methodology references that inform the plan

The engineering plan should maintain a living source ledger. Initial governing concepts are informed by:
- AAPOR disclosure/transparency guidance: explicitly distinguish probability vs nonprobability samples, document frames and coverage, sampling/recruitment, weighting, and design-effect/precision implications.
- Pew survey-method guidance: answer order and question order can change responses; randomization/reversal is used to distribute order effects; questionnaire logic/randomization should be tested before field launch.
- Current Pew methodology examples: probability weights begin from selection probability, may be calibrated to benchmarks and trimmed, and reported uncertainty accounts for weighting effects; phone fielding uses soft launch and repeated attempts.
- FCC rules/guidance: political calls using autodialed/prerecorded/artificial voice have materially different restrictions from live manually dialed calls; AI-generated voices are treated as artificial/prerecorded voice for TCPA purposes.
- Arkansas law requires a separate legal review for automated political-call behavior.

This file is engineering doctrine, not legal advice. Legal conclusions must be validated at POLL-94 before production calling.

---

# 26. Immediate next action

Do **not** build the first poll yet.

The next executable Bert slice after operator approval of this v2.0 plan is:

## POLL-1 — READ-ONLY RED DIRT SCHEMA/CODE AUDIT

POLL-1 must not create migrations, models, routes, or UI. Its job is to replace assumptions in this master plan with verified Red Dirt implementation facts. POLL-2 then converts that audit into the definitive reuse/extend/create architecture.

No other slice is authorized until POLL-1 closes and its findings are reconciled with this master plan.
