# Pass P1 — Governed LLM + Evidence Packets — Inventory

**Date:** 2026-05-31  
**Lane:** RedDirt/  
**Pass:** P1

---

## Files inspected

| File | Role |
|------|------|
| `src/lib/intelligence/llmDraftGateway.ts` | NSI-12 draft queue, append, governance validation |
| `src/lib/intelligence/llmDraftReviewWorkflow.ts` | Review status transitions, workflow promotion |
| `src/lib/intelligence/llmGovernanceSafety.ts` | Unsupported claim / hallucination detectors |
| `src/lib/intelligence/llmDraftAuditLog.ts` | Audit trail for draft events |
| `src/lib/intelligence/briefs/llmBriefDraftContracts.ts` | Prior contracts (extended in P1) |
| `src/lib/intelligence/briefs/governedBriefTypes.ts` | Governed brief schema |
| `src/lib/opposition/kimHammerEvidenceIndex.ts` | Export-ready claims, retrieval tasks |
| `src/app/admin/(board)/intelligence/llm-review-queue/` | Review queue UI |
| `scripts/test-llm-governed-drafting.ts` | NSI-12 validation suite |

---

## Safe reuse points

- **`appendDraftToReviewQueue()`** — P1 routes governed brief drafts through existing queue
- **`LlmDraftReviewEntry`** — extended via `sourceContext` for evidence packet metadata
- **`assertAdminApi()`** — operator API gate
- **Governed brief generators** — evidence packet source of truth
- **NSI-12 review UI** — no new publish path required

---

## Risky areas (handled in P1)

| Risk | Mitigation |
|------|------------|
| Autonomous LLM generation | Blocked — `operatorTriggered: true` required |
| Auto-publish / auto-send | All outputs `NON_PUBLISHABLE`; no send routes |
| Hallucinated county goals | Evidence packets flag unverified goals; no goal mutation |
| Shell counties presented as ready | Sparse-evidence warnings + public-ready blockers |
| Live LLM without governance | Gated by `INTELLIGENCE_LLM_BRIEF_ENABLED=1` + operator button |

---

## Live LLM configuration

| Check | Status |
|-------|--------|
| `OPENAI_API_KEY` | Environment-dependent |
| `INTELLIGENCE_LLM_BRIEF_ENABLED=1` | **Not set by default** |
| P1 default | Evidence synthesis + review queue only |

---

## Operator UI locations

- `/admin/intelligence` — opposition, debate, rapid response buttons
- `/admin/intelligence/debate-command` — debate prep button
- `/admin/intelligence/llm-review-queue` — review destination
