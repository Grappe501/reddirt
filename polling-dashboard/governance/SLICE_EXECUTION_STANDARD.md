# POLL Slice Execution Standard

Every Bert/Cursor POLL script must be derived from the current `MASTER_BUILD_PLAN.md` and must include the following sections.

## 1. Identity
- slice ID and title
- master-plan version
- dependencies that must already be complete
- allowed paths
- forbidden paths/actions

## 2. Read-first material
Bert must inspect the governing polling docs plus the exact existing Red Dirt files relevant to the slice before editing.

## 3. Objective
One explicit outcome. Do not bundle unrelated cleanup.

## 4. Existing-state evidence
Before changing code, report what exists and how the slice will reuse it.

## 5. Implementation contract
List exact services/models/routes/components/contracts to create or modify, including state transitions and invariants.

## 6. Data safety
State whether the slice may:
- alter Prisma schema,
- create/apply migrations,
- touch production data,
- send calls/texts/emails,
- invoke OpenAI,
- expose respondent-level data.
Anything not explicitly authorized is forbidden.

## 7. Tests
Specify required unit, integration, property/statistical, concurrency, UX, and security tests as relevant.

## 8. Validation commands
Run repository-native validation commands, at minimum typecheck/build/check when available plus slice-specific tests.

## 9. Proof artifacts
Create/update a slice report under `polling-dashboard/develop_notes/` and machine-readable status.

## 10. Git discipline
Commit and push the slice. Do not mix unrelated local changes into the commit.

## 11. Return report
Return:
- status PASS / PASS-WITH-BLOCKER / FAIL,
- summary,
- files changed,
- DB/migration impact,
- tests and commands,
- data touched,
- security/compliance impact,
- unresolved decisions,
- commit SHA,
- pushed branch,
- exact next authorized slice.

## No silent redesign rule
If real repository evidence conflicts with the master plan, Bert must document the conflict and stop at the smallest safe boundary. It must not invent a new architecture and continue.
