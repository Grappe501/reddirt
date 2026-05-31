# Pass P1 — Governed LLM + Evidence Packets — Build Report

**Active lane:** RedDirt/  
**Pass:** P1  
**Date:** 2026-05-31  
**Status:** Complete

---

## 1. Executive summary

Pass P1 delivers the campaign's first **governed LLM intelligence layer**: structured evidence packets, claim classification, unsupported-claim detection, safe prompt payloads, and review-queue routing — all **operator-triggered** and **NON_PUBLISHABLE** by default.

Live OpenAI inference is **available but deferred** unless `OPENAI_API_KEY` + `INTELLIGENCE_LLM_BRIEF_ENABLED=1` + explicit operator action.

**Readiness estimate:** Intelligence OS **~72% → ~78%**

---

## 2. What was built

| Component | Status |
|-----------|--------|
| Evidence packet types | Complete |
| Evidence packet generator (county/opposition/debate/rapid/weekly) | Complete |
| Claim classification (VERIFIED/INFERRED/UNSUPPORTED/NEEDS_REVIEW) | Complete |
| Unsupported claim detector + public-ready blocker | Complete |
| LLM prompt packet builder | Complete |
| Review queue routing (NSI-12 integration) | Complete |
| Operator API + UI buttons | Complete |
| Validation script | Complete (20/20) |

---

## 3. Files changed

### New
- `src/lib/intelligence/briefs/evidencePacketTypes.ts`
- `src/lib/intelligence/briefs/evidencePacketGenerator.ts`
- `src/lib/intelligence/briefs/claimClassification.ts`
- `src/lib/intelligence/briefs/unsupportedClaimDetector.ts`
- `src/lib/intelligence/briefs/llmPromptPacketBuilder.ts`
- `src/lib/intelligence/briefs/llmBriefReviewQueue.ts`
- `src/lib/intelligence/briefs/governedLlmBriefService.ts`
- `src/app/api/admin/intelligence/governed-llm-brief/route.ts`
- `src/components/admin/intelligence/PrepareLlmEvidencePacketButton.tsx`
- `scripts/test-governed-llm-evidence-packets.ts`
- `docs/intelligence/pass-reports/PASS-P1-GOVERNED-LLM-EVIDENCE-PACKETS-INVENTORY.md`
- `docs/intelligence/pass-reports/PASS-P1-GOVERNED-LLM-EVIDENCE-PACKETS-BUILD-REPORT.md`

### Updated
- `src/lib/intelligence/briefs/llmBriefDraftContracts.ts`
- `src/components/admin/intelligence/PublicBriefGradeIntelligencePanel.tsx`
- `src/app/admin/(board)/intelligence/debate-command/page.tsx`
- `package.json`

---

## 4. Evidence packet system status

**Real.** Packets generated from governed briefs with source anchors, research gaps, confidence scoring, and governance labels. Shell counties produce sparse-evidence warnings. Opposition/debate packets flag thin archives.

---

## 5. Claim classification status

**Real.** Every claim candidate classified with evidence strength, public-use risk, and recommended human action.

---

## 6. Unsupported claim detection status

**Real.** Detects UNSUPPORTED and NEEDS_REVIEW claims; blocks public adaptation when gaps exist.

---

## 7. LLM prompt packet status

**Real.** Safe prompt payload with forbidden behaviors, citation map, claim ledger preview, and deterministic synthesis fallback.

---

## 8. Review queue routing status

**Real.** All operator actions append to `llm-draft-review-queue.json` as `governed_brief_evidence` drafts with evidence metadata in `sourceContext`.

---

## 9. Operator button status

**Live** at:
- `/admin/intelligence` — opposition, debate, rapid response
- `/admin/intelligence/debate-command` — debate prep

Labels: "Prepare LLM Evidence Packet" / "Generate Internal LLM Draft for Review"

---

## 10. Live LLM status

| Setting | Value |
|---------|-------|
| Default | **Deferred** — evidence synthesis only |
| Enable | `OPENAI_API_KEY` + `INTELLIGENCE_LLM_BRIEF_ENABLED=1` |
| Trigger | Operator button only |
| Output | Review queue only — never auto-published |

---

## 11. Governance status

- All outputs: INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED
- No auto-send / auto-publish paths
- County goals not mutated
- Operator trigger required

---

## 12. Citation depth status

Citation anchors required on packets; missing anchors produce warnings. Full claim ledger DB (Pass P2) not yet built.

---

## 13. County goal safety status

**Pass.** Evidence packets flag unverified canonical goals; no writes to CountyCampaignStats or workbench goals.

---

## 14. What remains deferred

- Pass P2: Persistent claim ledger + citation engine
- Live LLM by default (env-gated)
- County packet buttons on all 75 counties (can add in P2/P6)
- Message Intelligence Engine expansion (Pass P5 in master plan)

---

## 15. Commands run and results

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run agents:test-governed-llm-evidence-packets` | PASS (20/20) |
| `npm run agents:test-governed-brief-governance` | PASS (17/17) |
| `npm run agents:test-intelligence-agent-daily-run` | PASS |
| `npm run email:no-send-scan` | WARN (expected baseline) |

---

## 16. Known failures

None for Pass P1 scope. Pre-existing `agents:test-opposition-workbench-debate-prep` bill drift not re-run.

---

## 17. Next recommended pass — P2: Claim Ledger + Citation Engine

Ernie should script Pass P2:
1. Persistent claim ledger schema (Postgres-ready)
2. Source ↔ claim linking
3. Evidence depth score
4. Human promotion workflow (DRAFT → HUMAN_APPROVED)
5. Admin UI: "Show me every source for this claim"
6. Wire ledger into evidence packets and LLM review promotion

**Horizon:** P3 Opposition Archive Closure MVP · P4 Debate War Room Expansion

---

## Handoff for Ernie

**Next pass to script:** `PASS-P2-CLAIM-LEDGER-CITATION-ENGINE.md`  
**Burt ready to execute** when script is delivered.

**Netlify push (when Steve approves commit):**
1. `cd RedDirt && npm run check`
2. Commit in RedDirt repo
3. Push branch → Netlify build
4. Smoke: `/admin/intelligence`, operator button → review queue
