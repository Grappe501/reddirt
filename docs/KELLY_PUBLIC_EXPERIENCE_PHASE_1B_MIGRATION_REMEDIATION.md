# KELLY-PUBLIC-EXPERIENCE-FOUNDATION-1.0 — Phase 1B

**Database Migration Remediation and Operator Proof**  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Start HEAD:** `7a6c69fda839653bfe5e11656af3805233dde3d0`  
**Date:** 2026-07-28 (UTC)

---

## 1. Baseline (redacted)

| Item | Value |
|------|--------|
| Prisma | 5.22.0 |
| DB target | Hosted Supabase via **session pooler** `aws-1-us-east-1.pooler.supabase.com:5432` |
| DATABASE_URL / DIRECT_URL | Same pooler host (port 5432); credentials redacted |
| Unrelated dirty files (not staged) | `scripts/netlify-enforce-env-scopes.cjs`, election-plan auth, volunteer middleware, `src/middleware.ts` |
| Open failed migrations (before) | Cleared earlier in session via `migrate resolve --rolled-back` |
| Open failed migrations (after) | **0** |

## 2. Repository migration intent vs DB / history

### Failed migration: `20260719160000_google_oauth_and_routes`

| Fact | Evidence |
|------|----------|
| Folder in this branch / main / available remotes | **Absent** — not in `prisma/migrations/`, not recoverable from git history on fetched remotes |
| Not in current `schema.prisma` | No `GoogleConnectionStatus` / Google OAuth models |
| `_prisma_migrations` rows | Two rows; both `applied_steps_count = 0`; both now `rolled_back_at` set |
| Failure log | PostgreSQL `42710`: `type "GoogleConnectionStatus" already exists` |
| Operator note on first row | `[kccc] marked rolled_back — objects already applied in kelly_calendar` |
| Current DB oauth objects from that migration | **None** — no `GoogleConnectionStatus` enum; no GoogleOAuth / GoogleConnection tables |

### Interpretation

Prisma never committed any step of that migration (`applied_steps_count = 0`). The CREATE TYPE failed because the enum transiently existed (likely from a parallel kelly-calendar apply). The enum is **not** present now. The migration folder was removed from the repo lineage this branch builds from.

## 3. Selected reconciliation path: **PATH B** (effects absent / not durable)

**Why Path B is correct**

1. `applied_steps_count = 0` ⇒ no durable effects from that migration transaction.  
2. Intended OAuth objects are **not** present in the linked DB now.  
3. Path A (`--applied`) would falsify history (claiming a migration applied when its objects are gone and the SQL is not in this repo).  
4. Path C (partial repair) does not apply — there is nothing partial *from this migration* to finish.  
5. Re-running the migration is impossible and out of scope: folder absent; Phase 1B explicitly forbids expanding Google OAuth.

**Actions taken**

```text
npx prisma migrate resolve --rolled-back 20260719160000_google_oauth_and_routes
```

(Already completed before Phase 1B formal start; verified `open_failed = 0`.)

**Not done (correctly):** recreate OAuth migration; mark `--applied`; edit historical SQL.

## 4. Phase 1 migration application

```text
npm run stack:migrate
```

**Result:** Applied `20260727200000_public_experience_foundation_phase1`.  
**Status after:** `Database schema is up to date!` (for this branch’s 94 local migrations).

### Phase 1 object proof

| Object | Present |
|--------|---------|
| `OwnedMediaAsset.focalX` / `focalY` | Yes (`double precision`, nullable) |
| `PublicMediaPlacement` table | Yes |
| `PublicMediaPlacementKind` enum | Yes |
| Open failed migrations | 0 |

## 5. Media operator proof (synthetic `phase1b-proof` assets)

Script: `scripts/phase1b-operator-proof.cjs` — **24/24 PASS** (includes intake items below).

| Check | Result |
|-------|--------|
| Approve + focal on OwnedMediaAsset | PASS |
| Plan WEB/THUMB jobs | PASS |
| Persist WEB + THUMB derivative **rows** (width/height/mime/bytes/type) | PASS |
| Assign `home.personality.primary` + placement focal override | PASS |
| Resolver owned provenance + object-position `20% 80%` | PASS |
| Public URL pattern `/api/owned-campaign-media/...` (no storage key leak) | PASS |
| Disable placement → static fallback | PASS |
| Unapprove → fail closed | PASS |
| Re-enable → owned again | PASS |
| Leave placement **disabled** after proof | PASS |
| TS `resolvePublicMediaSlot` while disabled → static-content-image | PASS |

**Note on WEB/THUMB worker:** Proof persisted derivative **metadata rows** and job SUCCEEDED payloads matching the contract. A live `sharp` binary render was not run against a real image file in this pass (synthetic assets have no bytes on disk). Code path: `src/lib/owned-media/process-derivative-jobs.ts`.

## 6. Intake operator proof

| Check | Result |
|-------|--------|
| User upsert (PascalCase `"User"`) | PASS (raw SQL; Prisma client blocked by missing `linkedVoterRecordId` on linked DB) |
| WorkflowIntake create | PASS |
| ContactPreference email OPT_IN | PASS |
| WorkflowAction create | PASS |
| SMS consent without phone stays non-OPT_IN | PASS |
| Email OPT_OUT preserved | PASS |
| Missing consent → no preference row | PASS |
| No RelationalContact auto-create | PASS |
| **Prisma `Submission` → `submissions`** | **BLOCKED** — documented collision |

### Pre-existing schema collision (Track C blocker)

Linked DB has **legacy** `public.submissions` (`module_id`, `raw_data`, …) while Prisma `Submission` is `@@map("submissions")` expecting `userId` / `type` / `content`.  
Also: Prisma client expects `User.linkedVoterRecordId` which is **absent** on linked `"User"`.

These are **pre-existing** production drift issues, not introduced by Phase 1. They prevent a full Prisma `persistFormSubmission` E2E on this database until a separate schema-reconciliation slice.

## 7. Commands run

| Command | Result |
|---------|--------|
| Forensic scripts (`phase1b-db-forensics.cjs`) | Pass |
| `migrate resolve --rolled-back …google_oauth…` | Applied (open failures cleared) |
| `npm run stack:migrate` | Pass — Phase 1 applied |
| `npx tsx scripts/phase1b-operator-proof.cjs` | Pass — 24/24 |
| `npm run typecheck` | Pass |
| `npx tsx scripts/test-public-experience-foundation-phase1.ts` | Pass |
| `npm run build` | Not re-run in 1B (typecheck + migrate + proofs prioritized); Netlify still needs remote redeploy |

## 8. Rollback / recovery

1. **Phase 1 DDL:** reverse by dropping `PublicMediaPlacement` / enum and focal columns only with an explicit DBA-approved down script (not shipped). Prefer leaving additive columns.  
2. **OAuth failed row:** already rolled back; do not mark applied.  
3. **Proof data cleanup:** delete rows where `operatorNotes` / `notes` / metadata contain `phase1b-proof`, or emails matching `*@example.test`. Disable any leftover placement (proof left `home.personality.primary` **disabled**).

## 9. Track C gate table

| Gate | Status |
|------|--------|
| Failed migration accurately reconciled | **PASS** (Path B) |
| Migration history not falsified | **PASS** |
| `stack:migrate` completes | **PASS** |
| Phase 1 migration applied | **PASS** |
| Prisma migration status clean for this branch | **PASS** |
| PublicMediaPlacement R/W | **PASS** |
| WEB/THUMB derivative rows + resolver | **PASS** (metadata; sharp binary pending real file) |
| Focal-point behavior | **PASS** |
| Static fallback | **PASS** |
| Unapproved fail closed | **PASS** |
| Join / volunteer spine (User, Intake, Consent, Action) | **PASS** |
| Prisma Submission end-to-end | **FAIL** (legacy collision) |
| No automatic outreach | **PASS** |
| Typecheck / focused tests | **PASS** |
| Unrelated worktree untouched | **PASS** |

## 10. Final recommendation

```text
KEEP TRACK C CLOSED
```

**Reason:** Phase 1 media foundation is **operationally proven** on the linked DB. Full public-form `Submission` persistence is **not** proven due to pre-existing `submissions` table collision and `User.linkedVoterRecordId` drift. Open Track C only after a dedicated **schema reconciliation** slice for Prisma `Submission`/`User` parity (or a verified alternate DATABASE_URL that already has RedDirt-shaped tables).

**Safe next work before homepage personality:**

1. Schema reconciliation for `submissions` vs Prisma `Submission` (and `User.linkedVoterRecordId`).  
2. Optional: run sharp WEB/THUMB worker on one real approved image file.  
3. Netlify production redeploy (P3009 cleared).  
4. Then reopen **KELLY-HOMEPAGE-PERSONALITY-1.0**.
