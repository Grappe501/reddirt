# Additive schema clone / shadow test plan

**Slice:** `REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0`  
**Hardening:** `REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-HARDENING-1.0`  
**Lane:** `RedDirt/` only

## **The raw Prisma diff is not safe to execute.**

Use only the **additive candidate** (`data/sql/additive-schema-install-candidate.sql`) on a disposable database after offline validation passes.

## Production-like clone (required)

An **empty** or **auth-only** Postgres (e.g. fresh Supabase project with default `auth` but no campaign warehouse) **cannot** pass clone proof.

Before the runner executes candidate SQL, the clone must already contain:

| Requirement | Detail |
|---------------|--------|
| **Minimum public breadth** | `information_schema` count of `public` tables **≥ 100** |
| **Required `public` tables** | `ar02_voters`, `contacts`, `counties`, `event_requests`, `message_audiences`, `path_to_victory`, `people`, `person_profiles` |
| **Required `auth` table** | `auth.users` |
| **Not production URL** | `REDDIRT_SCHEMA_INSTALL_TEST_DATABASE_URL` ≠ `DATABASE_URL` |
| **Not production Supabase project** | URL must **not** use Supabase project ref `giozeoqulfojhxpywjil` (forbidden clone target) |
| **Not same ref as `DATABASE_URL`** | If both are Supabase `db.<ref>.supabase.co`, refs must differ |

If any precondition fails, the runner **does not** apply candidate SQL, sets `ok: false`, `attempted: false`, `attemptedPhase: "false_precondition_failed"`, and `recommendation.nextRecommendedSlice: "REDDIRT-RESTORE-PRODUCTION-LIKE-CLONE-1.0"`.

## Post-apply checks

After a successful `prisma db execute`, the runner re-probes and requires:

- All required `public` tables still present  
- `auth.users` still present  
- `publicTableCount` still **≥ 100**  
- `highValueProtection.voterTablesStillPresent`, `legacyTablesStillPresent`, `authTablesStillPresent`, and `publicTableCountStillAdequate` all **true**

Only then are `ok: true`, `recommendation.cloneProofPassed: true`, and `productionLikeCloneProof: true` written.

## Environment

- **`REDDIRT_SCHEMA_INSTALL_TEST_DATABASE_URL`** — disposable Postgres URI (never production).

## Blocked (no URL)

If the env var is unset, the runner writes `configured: false`, does not connect, and exits **0**.

## Artifact

- [`data/additive-schema-clone-test-result.json`](../data/additive-schema-clone-test-result.json)
