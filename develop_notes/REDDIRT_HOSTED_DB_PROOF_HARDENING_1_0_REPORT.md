# REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0 — Report

**Lane:** `RedDirt/` only  
**Date:** 2026-05-07  
**Purpose:** Strengthen bearer `GET /api/admin/production-readiness/hosted-db` so a passing response implies the Netlify-hosted app is using **canonical production** Supabase Postgres (**ref `giozeoqulfojhxpywjil`**) with the expected **additive + Prisma** surface, not merely any reachable Postgres.

## Safety posture

- **Read-only:** `SELECT 1`, `information_schema` existence checks, `COUNT(*)` on `_prisma_migrations` only; optional `User` count probe still boolean-only in `safeCounts`.
- **No** `migrate deploy`, `db push`, `migrate reset`, or DDL from this packet.
- **No** secrets in JSON: env reports **presence**, **ref confirmation**, and **parse hints** only — never full URIs, passwords, or tokens.
- **Auth unchanged:** route still accepts `Authorization: Bearer` vs `EMAIL_DIAGNOSTICS_TOKEN` or `ADMIN_DIAGNOSTIC_TOKEN` (unchanged).

## Code changes

| Area | Change |
|------|--------|
| `src/lib/email-command-center/hosted-db-proof.ts` | `env` expanded per contract; `extractSupabaseProjectRefFromDatabaseUrl` (pooler + `db.*.supabase.co`); `productionSchemaContract` (legacy + new public tables aligned with `run-migration-history-production-preflight.mjs`, `auth.users`, `_prisma_migrations` count **71**); stricter `ok`; exports table/ref constants for audits. |
| `src/app/api/admin/production-readiness/hosted-db/route.ts` | **No change** (still delegates to `getHostedDbProofSummary`). |

## Offline scripts and data

| Artifact | Role |
|----------|------|
| `scripts/validate-hosted-db-proof-contract.mjs` | Asserts TS table lists + ref constant match `scripts/run-migration-history-production-preflight.mjs` and expected migration count **71** vs `data/migration-history-production-preflight.json` when present. |
| `scripts/build-hosted-db-proof-hardening-report.mjs` | Regenerates machine-readable report + next-steps JSON (no DB). |
| `data/hosted-db-proof-contract-validation.json` | Output of validate script (`status: pass` when run in this repo). |
| `data/hosted-db-proof-hardening-report.json` | Contract summary for operators/automation readers. |
| `data/communication-command-center-hosted-proof-next-steps.json` | Post-proof operator checklist pointers. |

## Operator interpretation

- **`ok: true`** requires: `DATABASE_URL` parses to ref **`giozeoqulfojhxpywjil`**, `SELECT 1` succeeds, every listed legacy + new public table exists, `auth.users` exists in `auth` schema metadata, `_prisma_migrations` row count equals **71**, and if **`DIRECT_URL`** is set its ref must also match (wrong clone URL on direct channel fails the contract).
- **`productionCanonical`** remains **false** in code; operator paste into `develop_notes/REDDIRT_EMAIL_HOSTED_DB_PROOF_1_0_REPORT.md` is still the documentation gate for “canonical” language outside JSON.

## Commands run (agent)

- `npm run typecheck` — **pass** (after `buildHostedDbUrlEnvReport` narrowing fix).
- `node scripts/validate-hosted-db-proof-contract.mjs` — **pass** (wrote `data/hosted-db-proof-contract-validation.json`).

## Remaining / not in scope

- **`User` table probe:** still supplementary; legacy stack may not expose Prisma `User` — contract does **not** depend on `User`.
- **Email-hosted-db-proof.md:** not in this packet’s allowed-edit list; operators should treat the new JSON fields as additive to that procedure until a doc slice updates the PowerShell section verbatim.

## Days 4–7 compression

Safe to **plan** next slices only after a **live** hosted `GET` shows `ok: true` and operators agree counts match production truth; this packet does not unlock live send or Netlify automation.
