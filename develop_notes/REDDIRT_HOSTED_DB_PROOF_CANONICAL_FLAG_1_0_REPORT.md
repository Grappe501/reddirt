# REDDIRT-HOSTED-DB-PROOF-CANONICAL-FLAG-1.0 — Report

**Lane:** `RedDirt/` only · **Date:** 2026-05-07

## Mission

Align **`proof.productionCanonical`** with the hardened hosted DB proof: it must reflect when the **canonical RedDirt production** read-only contract is satisfied, instead of staying **`false`** in all code paths while the doc claimed “canonical” elsewhere.

## Change

In **`getHostedDbProofSummary()`** (`src/lib/email-command-center/hosted-db-proof.ts`):

- **`proof.productionCanonical`** is set to **`productionSchemaContract.contractSatisfied`** (boolean).
- **`HostedDbProofPayload`** type updated: **`productionCanonical: boolean`** with JSDoc describing the contract (ref **`giozeoqulfojhxpywjil`**, legacy + new tables, **`auth.users`**, **71** `_prisma_migrations` rows, **`DIRECT_URL`** ref match when **`DIRECT_URL`** is present).

When **`ok: true`**, **`productionCanonical`** is **`true`** (same structural gates).

## Docs

- **`docs/email-hosted-db-proof.md`** — interpretation and “what this proves” updated for **`productionCanonical`** and hardened **`env`** / **`productionSchemaContract`**.
- **`docs/hosted-db-proof-after-baseline.md`** — short note on **REDDIRT-HOSTED-DB-PROOF-CANONICAL-FLAG-1.0**.

## Safety

- **Read-only** behavior unchanged; no migrations, no writes, no secrets in JSON.

## Commands

- **`npm run typecheck`** — run after edit (expect pass).
