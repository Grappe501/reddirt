# Pass P2 — Claim Ledger + Citation Engine — Build Report

**Active lane:** RedDirt/  
**Pass:** P2  
**Date:** 2026-05-31  
**Status:** Complete

---

## 1. Executive summary

Pass P2 delivers a **persistent, auditable claim and citation ledger** connecting P1 evidence packets, governed briefs, and LLM review drafts. Every claim is traceable to sources, scored for evidence depth, reviewable by humans, and gated for public adaptation.

**Readiness estimate:** Intelligence OS **~78% → ~84%**

---

## 2. What was built

| Component | Status |
|-----------|--------|
| Claim ledger types (Postgres-ready interfaces) | Complete |
| JSON store (ledger, sources, anchors, audit log) | Complete |
| Claim normalization + deduplication | Complete |
| Evidence depth scoring | Complete |
| Citation depth policy | Complete |
| Ingest from P1 evidence packets | Complete |
| Human review + promotion workflow | Complete |
| Review queue claim summary integration | Complete |
| Admin claim trace UI + detail + review actions | Complete |
| Ingest script | Complete |
| Validation tests | Complete (19/19) |

---

## 3. Files changed

### New — `src/lib/intelligence/claims/`
- `claimLedgerTypes.ts`
- `claimLedgerStore.ts`
- `claimNormalization.ts`
- `evidenceDepthScoring.ts`
- `citationDepthPolicy.ts`
- `claimLedgerIngest.ts`
- `claimReviewWorkflow.ts`
- `claimLedgerSummary.ts`

### New — Admin + API
- `src/app/admin/(board)/intelligence/claims/page.tsx`
- `src/app/admin/(board)/intelligence/claims/[claimId]/page.tsx`
- `src/app/admin/(board)/intelligence/claims/[claimId]/ClaimReviewActions.tsx`
- `src/app/api/admin/intelligence/claim-review/route.ts`

### New — Scripts + docs
- `scripts/ingest-claims-from-current-briefs.ts`
- `scripts/test-claim-ledger-citation-engine.ts`
- `docs/intelligence/pass-reports/PASS-P2-CLAIM-LEDGER-CITATION-ENGINE-INVENTORY.md`
- `docs/intelligence/pass-reports/PASS-P2-CLAIM-LEDGER-CITATION-ENGINE-BUILD-REPORT.md`

### Updated
- `src/lib/intelligence/briefs/governedLlmBriefService.ts` — auto-ingest on prepare
- `src/app/admin/(board)/intelligence/llm-review-queue/page.tsx`
- `src/components/admin/intelligence/PublicBriefGradeIntelligencePanel.tsx`
- `package.json`

### Generated (on ingest)
- `data/intelligence/claims/claim-ledger.json`
- `data/intelligence/claims/citation-sources.json`
- `data/intelligence/claims/citation-anchors.json`
- `data/intelligence/claims/claim-ledger-audit-log.json`

---

## 4–11. Subsystem status

| Area | Status |
|------|--------|
| Claim ledger | **Persistent JSON** — Postgres-ready interfaces |
| Citations/sources/anchors | **Persistent** |
| Evidence depth scoring | **Real** — 0–100 with strength bands |
| Claim ingest | **Real** — from evidence packets + briefs |
| Human review workflow | **Real** — approve internal/public/reject/retire |
| Review queue integration | **Claim summary rollup on LLM queue page** |
| Admin UI | **`/admin/intelligence/claims` + detail + review actions** |
| Citation depth policy | **Enforced** — sensitive claims, county goals, opposition risk |
| Governance | **NOT_PUBLISHABLE default; UNSUPPORTED blocked; INFERRED blocked from public adaptation** |
| County goal safety | **Policy requires CountyCampaignStats citation for reg goal claims** |

---

## 12. Public adaptation controls

- Default: `NOT_PUBLISHABLE`
- Internal approval: requires non-UNSUPPORTED + reviewer notes for NEEDS_REVIEW
- Public adaptation: requires VERIFIED classification, depth ≥40, reviewer notes
- Public release: **blocked** — KH-4 export control gate returns false
- INFERRED claims: **cannot** be approved for public adaptation

---

## 13. What remains deferred

- Postgres migration (interfaces ready)
- Batch KH-4 citation locker sync
- Full 75-county ingest performance tuning (batch upsert added)
- Message intelligence layer wiring (Pass P5)
- Opposition archive closure (Pass P3)

---

## 14. Commands run and results

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run agents:test-claim-ledger-citation-engine` | PASS (19/19) |
| `npm run agents:test-governed-llm-evidence-packets` | PASS (20/20) |
| `npm run intelligence:claims:ingest` | Run after deploy to populate ledger |

---

## 15. Known failures

None for Pass P2 scope.

---

## 16. Next recommended pass — P3: Opposition Archive Closure MVP

Ernie should script:
1. Retrieval task workflow completion paths
2. Speech/writings/video archive indexing
3. Quote extraction with citation locker binding
4. Opposition brief confidence lift target ≥75

**Horizon:** P4 Debate War Room · P5 Message Intelligence Engine

---

## Handoff for Ernie

**Next pass to script:** `PASS-P3-OPPOSITION-ARCHIVE-CLOSURE-MVP.md`

**For Steve:** Run `npm run intelligence:claims:ingest` once after deploy to populate ledger from all 75 county + opposition briefs.
