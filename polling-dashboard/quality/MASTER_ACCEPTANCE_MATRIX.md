# Polling Master Acceptance Matrix

This matrix defines what must be proven, not merely implemented.

| Capability | Minimum acceptance proof |
|---|---|
| Canonical voter reuse | Audit shows polling frame references existing voter/person identity; no duplicate voter universe |
| Frame coverage | Statewide and geographic counts reconcile to target population and callable-phone subset |
| Eligibility | Deterministic tests cover all include/exclude reasons |
| Random sampling | Large simulation matches configured selection probabilities within defined tolerance |
| Adaptive allocation | Under-covered cells receive increased allocation without violating caps or destroying reconstructibility |
| Inclusion probability | Every drawn case can reconstruct or retrieve its probability metadata |
| Queue uniqueness | Concurrency test proves no two active leases for one case |
| Lease recovery | Expired/crashed sessions safely return cases according to policy |
| Recontact | Completed/refused/DNC cases obey study/wave-specific recontact rules |
| Candidate order | Balance test shows approximately equal position exposure and stored presented order |
| Branching | Instrument test fixtures cover every legal branch and prevent illegal branch paths |
| Instrument freeze | Mutation attempt against field-active version fails |
| Autosave | Simulated browser/network interruption preserves previously committed answers |
| Dispositions | Every operational outcome maps to one controlled disposition and valid next case state |
| Caller privacy | Caller cannot access non-assigned cases, aggregate horse-race results, or restricted respondent research |
| Supervisor control | Pause stops new assignments without destroying active saved interviews |
| Raw tabulation | Reconciles exactly with approved interview-response records |
| Weighting | Reproduces benchmark margins within tolerance; failed convergence cannot publish |
| Weight diagnostics | Min/max/percentiles/trimming/effective n/design-effect diagnostics available |
| Estimate reproducibility | Same approved inputs/version reproduce same estimate within deterministic tolerance |
| Small-area suppression | Synthetic sparse geographies never render publishable percentages |
| Trend comparability | Instrument/method break creates visible discontinuity marker |
| External polls | Missing methodology is stored as unknown, never invented |
| Online opt-in | UI/API marks source as nonprobability unless explicitly configured otherwise |
| AI coding | Original verbatim preserved; coding run/model/prompt/version/review status recorded |
| AI privacy | Test confirms model payload excludes unnecessary voter-profile fields |
| Simulation | Seed + specification reproduce result distribution; observed poll data remains untouched |
| RBAC | Role test matrix denies every unauthorized respondent-level action |
| Logging | Logs do not contain raw phone numbers + political responses together |
| Backup/restore | Safe-environment restore reproduces polling tables and relationships |
| Load | Defined concurrent caller and dashboard workloads remain within accepted latency/error thresholds |
| Kill switch | Study/system pause is immediate, auditable, reversible, and safe |
| Deployment | Production version maps to Git commit and passed gates |

## Slice completion rule

A slice may only claim a capability above when its acceptance proof exists in automated tests or a reproducible operator proof artifact. Narrative assertion is not sufficient.
