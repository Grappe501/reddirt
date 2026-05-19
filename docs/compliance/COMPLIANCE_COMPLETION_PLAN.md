# Compliance completion plan

Phased path from **current state** (filing red, bank missing, 133 open items) to **operator launch** and optional **DB cutover**. See `COMPLIANCE_STATE_OF_BUILD.md` for live metrics.

## Phase 1 — Source completion

**Goal:** All April26 sources inventoried and bank CSV present.

- [ ] Add `H:\SOSWebsite\Compliance\April26\bank-april-2026.csv` (date, amount, memo; credits positive)  
- [ ] Optional: ethics workbook if campaign uses it  
- [ ] Confirm April26 folder: GoodChange, images, counts on `/admin/compliance/april26`  
- [ ] `npm run compliance:april26:dry`  
- [ ] `npm run compliance:april26:qa`  
- [ ] `npm run compliance:bank:qa` (expect `ok` when file valid)  

**Exit:** Bank readiness `readyForReconciliation: true`; parse issues resolved.

## Phase 2 — Reconciliation

**Goal:** Source-backed bank ↔ GoodChange payout matching.

- [ ] Run reconciliation rehearsal on April26 page  
- [ ] Work `/admin/compliance/reconciliation` — unmatched bank, unmatched payouts, ambiguous  
- [ ] Lock high-confidence matches; document ambiguous decisions  
- [ ] `npm run compliance:qa-reconciliation`  

**Exit:** Unmatched lists empty or explicitly accepted with operator notes.

## Phase 3 — Rule review

**Goal:** Human review of rule corpus topics; guarded queue items.

- [ ] `npm run compliance:rule-topic-packet`  
- [ ] Review each unverified topic on `/admin/compliance/rules` (initials + note)  
- [ ] Do **not** batch-approve `rule_review` items  
- [ ] Per-item approve only with override + documented topic review  

**Exit:** `unverifiedCount` → 0 in rule packet; QA confirms batch still excludes rule_review.

## Phase 4 — Queue burn-down

**Goal:** Reduce 133 open items intelligently.

- [ ] `npm run compliance:operator-review-export-v2`  
- [ ] Start order: rule_review → source_update_pending → low_confidence → …  
- [ ] Use next-best-item on April queue  
- [ ] Resolve `source_update_pending` and missing evidence  
- [ ] Raise confidence to ≥98% only with real field/evidence fixes  

**Exit:** Open count → 0 or documented exceptions; batch eligible >0 only for safe items.

## Phase 5 — Filing readiness

**Goal:** Filing page green only when hard gates pass.

- [ ] Work `/admin/compliance/filing-readiness` blocker cards  
- [ ] Each blocker: meet `greenCondition` in source system  
- [ ] `npm run compliance:qa-filing` (command passes; status may stay red until fixed)  
- [ ] Treasurer sign-off — not automated  

**Exit:** `overall: green` with zero source-backed blockers.

## Phase 6 — Storage production

**Goal:** Private evidence on Supabase with RLS.

- [ ] Configure env per `SUPABASE_PRIVATE_STORAGE_SETUP.md`  
- [ ] Private bucket, no public read  
- [ ] Manual RLS verification → `COMPLIANCE_STORAGE_RLS_VERIFIED=true`  
- [ ] `npm run compliance:storage-preflight` · `qa-storage`  
- [ ] Local dev may keep `local_private`  

**Exit:** `storage.ready: true` in brain snapshot.

## Phase 7 — DB migration packet

**Goal:** Optional persistence cutover (Steve approval).

- [ ] Read `COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md` + preflight  
- [ ] Backup · rehearsal · rollback plan  
- [ ] Steve approval  
- [ ] Apply migration · backfill · `COMPLIANCE_DB_MIGRATED=true`  
- [ ] Post-migration full QA  

**Exit:** JSON and DB consistent OR explicit decision to remain JSON-only.

## Phase 8 — Launch rehearsal and production verification

**Goal:** Prove operators can run the program end-to-end.

- [ ] `COMPLIANCE_OPERATOR_LAUNCH_REHEARSAL.md` in browser  
- [ ] `COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md` on production URL  
- [ ] `npm run compliance:ai-brain` && `ai-brain:qa`  
- [ ] Full QA chain (see `COMPLIANCE_AI_BRAIN_PASS.md`)  
- [ ] Signoff packet for campaign leadership  

**Exit:** `launchReadiness.overall: launch_ready` in brain JSON + human sign-off.

## Daily operator rhythm

```bash
npm run compliance:ai-daily-brief
npm run compliance:ai-thread-handoff
```

Open `/admin/compliance/command-center` for dashboard.
