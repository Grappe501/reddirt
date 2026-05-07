# REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT

**Slice:** REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0  
**Generated:** 2026-05-07T01:17:42.593Z

## Slice summary

Built the **gated** production baseline execution **packet** (JSON + docs) from validated review and shadow artifacts. **No** production database mutation; **no** Netlify retry; **no** live send approval.

## Files created / overwritten

| Output | Path |
|--------|------|
| Packet | `data/production-baseline-execution-packet.json` |
| Approval gates | `data/production-baseline-approval-gates.json` |
| Netlify post-plan | `data/post-baseline-netlify-test-plan.json` |
| Docs | `docs/production-baseline-execution-packet.md`, `production-baseline-approval-gates.md`, `production-baseline-execution-runbook.md`, `post-baseline-netlify-test-plan.md`, `hosted-db-proof-after-baseline.md` |

## Files modified

- `scripts/build-production-baseline-execution-packet.mjs` (this generator)
- `scripts/validate-production-baseline-execution-packet.mjs`
- `scripts/run-production-baseline-execution-preflight.mjs`
- `scripts/run-production-baseline-execution-guarded.mjs`
- Hub docs per Phase 8 (production-db-test-readiness, netlify-production-retry-readiness, email-command-center-launch-hardening, campaign-email-command-center-progress-ledger, PROJECT_MASTER_MAP, THREAD_HANDOFF_MASTER_MAP) — verify links in those files.

## Source artifacts inspected

Relative paths embedded in `data/production-baseline-execution-packet.json` → `sourceArtifacts`.

## Execution packet status

`executionPacketStatus: ready` — **prepared**, not executed.

## Approval gates status

All gates `status: "pending"` in `data/production-baseline-approval-gates.json`.

## Preflight status

**PASS** (2026-05-07): `node scripts/run-production-baseline-execution-preflight.mjs` with **non-production** URL shape smoke only (`DATABASE_URL` / `DIRECT_URL` set in session — **never** echoed by script). Operator production runs: set real URLs in a secure shell only.

## Guarded runner status

**Dry-run only** in automation. **Do not** run with `--execute` from Cursor. With `--execute` and all env flags, the script still **does not** spawn Prisma — operator runs commands in a separate terminal.

**PowerShell env for guarded `--execute` gate check (example):**

```powershell
$env:REDDIRT_PRODUCTION_BASELINE_EXECUTION_APPROVED='STEVE_APPROVES_REDDIRT_PRODUCTION_BASELINE_EXECUTION'
$env:REDDIRT_BACKUP_PITR_CONFIRMED='YES'
$env:REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED='YES'
$env:REDDIRT_MAINTENANCE_WINDOW_CONFIRMED='YES'
$env:REDDIRT_SHADOW_PROOF_CONFIRMED='YES'
$env:REDDIRT_ACKNOWLEDGE_CHECKSUM_RISK='YES'
# Plus DATABASE_URL and DIRECT_URL set in the same session (never echo).
```

## Netlify / hosted DB test plan

See `data/post-baseline-netlify-test-plan.json` and `docs/post-baseline-netlify-test-plan.md`. Hosted DB proof detail: `docs/hosted-db-proof-after-baseline.md`.

## Email Command Center readiness impact

Packet keeps `emailCommandCenterProofPlan.liveSendApproved: false`. Hosted proof and diagnostics are **planned after** baseline + deploy, not approved here.

## Governance status

| Question | Answer |
|----------|--------|
| Did this mutate production? | **NO** |
| Did this run production migrate deploy / resolve / db push / reset? | **NO** |
| Did this approve Netlify retry? | **NO** |
| Did this approve live send? | **NO** |
| Is an execution packet prepared? | **YES** |
| Are approval gates pending? | **YES** |
| Is automatic execution allowed? | **NO** |

## What Steve must approve next

Backup/PITR proof, correct production Supabase project + URL intent, maintenance window, written baseline execution approval (phrase `STEVE_APPROVES_REDDIRT_PRODUCTION_BASELINE_EXECUTION`), DBA checksum acknowledgment, then operator manual Prisma in a separate terminal.

## Checks

| Command | Result |
|---------|--------|
| `node scripts/build-production-baseline-execution-packet.mjs` | **PASS** |
| `node scripts/validate-production-baseline-execution-packet.mjs` | **PASS** |
| `node scripts/run-production-baseline-execution-guarded.mjs --dry-run` | **PASS** (writes `data/production-baseline-execution-guarded-dry-run.json`) |
| `node scripts/run-production-baseline-execution-preflight.mjs` | **PASS** (with session URLs for shape check; script does not print secrets) |
| `npx prisma validate` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run check` | **PASS** |
| `npm run email:no-send-scan` | **WARN** (integration/comms baseline only per script; not a failure) |
| `node scripts/validate-selfbuild-slice.mjs` | **PASS** |
| `node scripts/validate-selfbuild-boundaries.mjs` | **PASS** |
| `node scripts/validate-selfbuild-dependency-graph.mjs` | **PASS** |
| `node scripts/validate-selfbuild-queue.mjs` | **PASS** |

**Not run:** `node scripts/run-production-baseline-execution-guarded.mjs --execute` (forbidden from Cursor automation).

## Risks / limitations

- Edited migration checksum risk — see packet `checksumRisk`.
- This repo does not execute `migrate deploy`; operator discipline required.

## Next recommended slice

Operator execution after Steve approval + backup proof — **not** another Cursor build slice until baseline is done or blocked on new inputs.
