# REDDIRT_PRISMA_SCHEMA_MAP_PATCH_PLAN_AND_SHADOW_PROOF_1_0_REPORT

**Slice:** `REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-AND-SHADOW-PROOF-1.0`  
**Lane:** `RedDirt/` only  
**Generated:** 2026-05-06 (Cursor agent run)

## 1. Slice summary

Offline engineering pass: load baseline audit + plan + reconciliation + prior alignment JSON; parse `schema.prisma` and all migration SQL; scan `src/**` for `prisma.<Model>` / `db.<Model>` usage; emit full review and patch plan; apply **only** high-confidence, reconciliation-backed `@@map` directives that do not target voter warehouse or governance-blocked models; validate with `npx prisma validate` inside the patch validator script; produce shadow proof plan, draft production baseline execution packet (not runnable), test readiness doc, and this report. **No** production database writes, **no** `migrate deploy` / `db push` / `migrate resolve` / `reset`, **no** migration history fakery.

## 2. Files created

| Path |
|------|
| `RedDirt/scripts/full-review-prisma-schema-map.mjs` |
| `RedDirt/scripts/validate-prisma-schema-map-patch.mjs` |
| `RedDirt/scripts/generate-production-baseline-execution-packet.mjs` |
| `RedDirt/data/prisma-schema-map-full-review.json` |
| `RedDirt/data/prisma-schema-map-patch-plan.json` |
| `RedDirt/data/prisma-schema-map-patch-validation.json` |
| `RedDirt/data/production-db-shadow-proof-plan.json` |
| `RedDirt/data/production-baseline-execution-packet-draft.json` |
| `RedDirt/docs/prisma-schema-map-patch-plan.md` |
| `RedDirt/docs/production-db-shadow-proof-plan.md` |
| `RedDirt/docs/production-baseline-execution-packet-draft.md` |
| `RedDirt/docs/production-db-test-readiness.md` |
| `RedDirt/develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_PATCH_PLAN_AND_SHADOW_PROOF_1_0_REPORT.md` (this file) |

## 3. Files modified

| Path |
|------|
| `RedDirt/prisma/schema.prisma` — `@@map("submissions")`, `@@map("media_assets")`, `@@map("counties")`; governance comment on `VoterRecord` |
| `RedDirt/docs/prisma-schema-map-alignment.md` — follow-on cross-links |
| `RedDirt/docs/production-db-schema-reconciliation.md` — cross-links |
| `RedDirt/docs/production-db-baseline-plan.md` — cross-links |
| `RedDirt/docs/production-db-baseline-audit.md` — cross-links |
| `RedDirt/docs/email-command-center-launch-hardening.md` — cross-cut links |
| `RedDirt/docs/campaign-email-command-center-progress-ledger.md` — cross-cut links |
| `RedDirt/docs/PROJECT_MASTER_MAP.md` — new packet bullet |
| `RedDirt/docs/THREAD_HANDOFF_MASTER_MAP.md` — new section + links |

## 4. Inputs inspected

- `data/production-db-baseline-audit.json`
- `data/production-db-baseline-plan.json`
- `data/production-db-schema-reconciliation.json`
- `data/prisma-schema-map-alignment.json`
- `docs/production-db-baseline-audit.md`, `docs/production-db-baseline-plan.md`, `docs/production-db-schema-reconciliation.md`, `docs/prisma-schema-map-alignment.md`
- `prisma/schema.prisma`
- `prisma/migrations/**/migration.sql` (via script)
- `src/**` (usage scan via script)

`.env` was not read.

## 5. Full review summary

See `data/prisma-schema-map-full-review.json` for `modelReview`, `tableReview`, `migrationReview`, `srcUsageReview`, and `reviewSummary`. Production audit lists **no** `workflow_*` table; **`WorkflowIntake`** remains a **new Prisma-owned / shadow-create** candidate relative to the audited public catalog, not a confident legacy map.

## 6. Patch plan summary

- **Section A (auto-eligible / applied in repo):** `County` → `counties`, `Submission` → `submissions`, `MediaAsset` → `media_assets` (reconciliation: `prisma_managed_candidate`, low risk, audited table present).
- **Section B (human review):** **`EventRequest` → `event_requests`** left out of auto-apply because reconciliation marks **`needs_mapping_review`** / **high** risk; **`User`**, **`WorkflowIntake`**, **`RelationalContact`**, **`CampaignEvent`** remain governance-blocked for auto-map in script rules.
- **Section C (do-not-map):** **`VoterRecord`** and voter warehouse tables; **`auth.*`**; spatial reference tables per plan JSON.
- **Section D:** New Prisma-owned candidates listed in full-review JSON.

## 7. Prisma schema changes applied

- `model Submission` — `@@map("submissions")`
- `model MediaAsset` — `@@map("media_assets")`
- `model County` — `@@map("counties")`
- `model VoterRecord` — documentation-only comment: production warehouse `@@map` blocked pending DBA review
- **Not applied:** `EventRequest` → `event_requests` (human review required per reconciliation)

## 8. Patch validation status

`data/prisma-schema-map-patch-validation.json`: **pass** (includes embedded **`npx prisma validate`**).

## 9. Shadow proof plan summary

Plan-only JSON + markdown under `data/production-db-shadow-proof-plan.json` and `docs/production-db-shadow-proof-plan.md`: clone/shadow → validate → migrate status/diff → **`migrate deploy` on shadow only** → verify no destructive DDL against preserved tables → build + optional hosted diagnostic against shadow.

## 10. Production baseline execution draft summary

`docs/production-baseline-execution-packet-draft.md` + JSON: prerequisites, backup/PITR, shadow artifacts, forbidden commands, example command **patterns** for human review only, rollback, Netlify retry, hosted DB proof — all prefixed with **draft / do not execute** disclaimer.

## 11. High-value data protection status

No production SQL executed from this packet. No row export. **`VoterRecord`** was not mapped to `ar02_voters` or any warehouse table. **`auth.*`** not claimed as RedDirt-owned migration targets.

## 12. Netlify / hosted DB readiness impact

**Improved** naming alignment for three models against audited snake_case tables; **Netlify still not fully unblocked** until migration history / baseline strategy is resolved on an approved target DB (see test readiness doc). Do not point production deploy at live DB with **`migrate deploy`** until shadow proof + explicit approval.

## 13. Email Command Center readiness impact

No send paths changed. DB-dependent email diagnostics remain **use non-production or shadow** until baseline governance closes.

## 14. Governance status

Production migrate / push / resolve / reset **not** approved. Live send **not** approved.

## 15. Checks

Commands run from `H:\SOSWebsite\RedDirt`:

- `node scripts/full-review-prisma-schema-map.mjs` — OK
- `node scripts/generate-production-baseline-execution-packet.mjs` — OK
- `node scripts/validate-prisma-schema-map-patch.mjs` — **PASS** (runs `npx prisma validate`)
- `npm run typecheck` — OK
- `npm run check` — OK (lint + typecheck + `next build`)
- `npm run email:no-send-scan` — exit 0 (**WARN** baseline for integration paths; scan does not fail)
- `node scripts/validate-selfbuild-slice.mjs` — PASS
- `node scripts/validate-selfbuild-boundaries.mjs` — PASS
- `node scripts/validate-selfbuild-dependency-graph.mjs` — PASS
- `node scripts/validate-selfbuild-queue.mjs` — PASS

## 16. Risks / limitations

- **`@@map`** assumes audited **public** table columns match Prisma models; **column proof** was not in offline JSON — **shadow introspection / diff** remains mandatory before production DDL.
- **Local Docker** DBs that applied migrations creating **`"County"`** / **`"Submission"`** PascalCase tables will **diverge** from production snake names until local uses the same physical names or a shadow clone.

## 17. Next recommended slice

Run **shadow Supabase clone** (or branch) proof: `prisma migrate diff`, then **`migrate deploy` on shadow only**; then human review for **`EventRequest`**, **`User`**, **`WorkflowIntake`**, and remaining reconciliation **`needs_mapping_review`** rows before any production baseline packet execution.

---

## Governance quick answers

```text
Is production baseline execution approved? NO.
Is production migrate deploy approved? NO.
Is production db push approved? NO.
Is production reset approved? NO.
Is live send approved? NO.
Is schema map patch plan complete? YES.
Is shadow proof ready to run? YES (plan ready; execution is operator-owned).
Is Netlify ready to retry? NO (not against production DB until DB/migrate governance clears).
```

## WorkflowIntake / `/api/forms`

This packet did **not** add or change API routes. **`WorkflowIntake`** has **no** matching table name in `production-db-baseline-audit.json`; end-to-end “form → Kelly DB → queue” remains dependent on a DB that actually contains Prisma-managed tables (or future shadow migrations). Confirm **`WorkflowIntake`** table existence with introspection on the **intended** target before claiming production parity.
