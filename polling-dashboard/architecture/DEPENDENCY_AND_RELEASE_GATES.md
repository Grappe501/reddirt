# Polling Dependency and Release Gates

This document converts the master roadmap into hard gates so Bert can walk the build in order without accidentally skipping foundational work.

## Gate A — Architecture truth
Required: POLL-1 through POLL-7.

PASS means:
- canonical Red Dirt models are mapped,
- reuse/extend/create decisions are explicit,
- polling contracts are versioned,
- RBAC/data classification is approved,
- initial live-calling modality is defined,
- migrations and rollback are designed but not yet applied.

No polling migration is authorized before Gate A.

## Gate B — Database foundation
Required: POLL-8 through POLL-16.

PASS means:
- study/wave/instrument/sampling/case/interview/statistics/audit concepts have durable schema support,
- FK/unique/check/index constraints enforce critical invariants,
- migration deploy and rollback/recovery have been proven in a safe environment.

No sampling/caller UI is considered production-capable before Gate B.

## Gate C — Sampling integrity
Required: POLL-17 through POLL-27.

PASS means:
- callable universe is derived from canonical voters,
- phone normalization and shared-number behavior are understood,
- frame coverage is measurable,
- geographic cells/targets exist,
- sample draws and inclusion probability are auditable,
- adaptive allocation passes simulation/property tests,
- queue replenishment cannot create duplicate cases.

No live field work before Gate C.

## Gate D — Calling concurrency and recontact safety
Required: POLL-28 through POLL-35.

PASS means:
- assignment leasing is atomic,
- case transitions are enforced,
- callbacks/refusals/DNC rules are enforced,
- stale leases recover safely,
- production-scale concurrency tests pass.

## Gate E — Instrument research readiness
Required: POLL-36 through POLL-44.

PASS means:
- survey branching/randomization works,
- autosave survives interruption,
- field-active instrument is immutable,
- initial instrument underwent wording review and soft launch,
- baseline and post-context outcomes are separated,
- verbatim answers are preserved.

## Gate F — Field UI readiness
Required: POLL-45 through POLL-52.

PASS means:
- caller workflow works phone/tablet/desktop,
- callers cannot see prohibited analytics,
- supervisor can monitor/pause/recover,
- training/certification exists,
- accessibility and failure recovery pass.

## Gate G — First live-call approval
Requires Gates A–F plus POLL-94 live-call compliance approval, backup/recovery proof relevant to field data, and an operator go/no-go.

Initial mode: trained human volunteer live calls only unless separately approved.

## Gate H — Statistical release readiness
Required: POLL-53 through POLL-63.

PASS means:
- raw counts reconcile,
- benchmark provenance is recorded,
- weighting converges and diagnostics are visible,
- effective n/design effects are calculated where applicable,
- estimates are immutable/reproducible,
- small-area suppression and likely-voter separation work,
- validation battery passes.

No weighted executive result is released before Gate H.

## Gate I — Executive dashboard readiness
Required: POLL-64 through POLL-72.

PASS means approved estimates feed leadership surfaces with visible methodology/quality/uncertainty and publication approval controls.

## Gate J — Additional evidence readiness
POLL-73 through POLL-78. External and online evidence remains source-labeled.

## Gate K — AI readiness
POLL-79 through POLL-84. AI can analyze approved data without leaking respondent-level data or changing observed answers.

## Gate L — Simulation readiness
POLL-85 through POLL-91. Simulation is reproducible, sensitivity-tested, and visually separated from observed evidence.

## Gate M — Production certification
POLL-92 through POLL-101. Security/privacy/compliance/backup/load/operator/training gates all pass.

## Gate N — Campaign OS certification
POLL-102 through POLL-108. No Kelly-specific hardcoding remains and a new election/study can be configured without code forks.
