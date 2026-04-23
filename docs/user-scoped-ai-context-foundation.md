# User-scoped AI context — foundation (RedDirt)

**Packet ALIGN-1** companion. **North star:** the brain can *conceive* the whole campaign (alignment + RAG), but *interactions* with each user should be scoped to what that person is permitted to see and act on (future RBAC). **Today:** all admin users effectively see all workbenches (except org-level auth). This document defines the target and ties to TALENT-1.

**Cross-ref:** [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`position-system-foundation.md`](./position-system-foundation.md) · [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) · `src/lib/campaign-engine/user-context.ts`

---

## 1. North star

- **Know the whole** (alignment + public + internal RAG where ingested).
- **Speak in a constrained window** for the user’s role and (future) permissions: e.g. a county organizer should not receive comms plan secrets in a “help me reply” flow unless policy allows.
- **Not a second CRM in the model** — identity is `User` + `VolunteerProfile` and linked tables (TALENT signals), not a shadow database in the LLM.

---

## 2. User understanding model (conceptual, TALENT-1–aligned)

From [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) (what to observe) and current repo hooks:

| Facet | Evidence today | Future use |
|--------|----------------|------------|
| Preferences | County filter on workbench; optional form tags from `classifyIntake` | Narrow RAG to SOPs for turf (when scoping exists) |
| Reliability | `CampaignTask` + comms outcomes | Simpler language in nudges or more checklists (not a hidden “score”) |
| Communication style | Thread + message cadence | Draft suggestions tone-aligned (still reviewed) |
| Skill / comprehension | Triage and error patterns (sparse today) | Training tracks (TALENT) |
| Role readiness | TALENT recs (future) + intake `leadershipPotential` | Advisory only |

No hidden numeric “fit score” in the product UI (ALIGN-1 and TALENT-1).

---

## 3. Context boundaries

| Layer | Global to staff (CM policy) | Scoped to user / (future) position | Extra governance |
|-------|----------------------------|--------------------------------------|------------------|
| Alignment | Yes (mission + red lines) | Plus SOP layer for field when RAG-tagged | Compliance for Oppo+legal |
| RAG | All `SearchChunk` (today) | Filter by path prefix or tag (future) | PII-bearing ingests may be admin-only (product decision) |
| Comms / email | N/A for public; workbench is admin today | Thread-by-county; (future) “only your assigned” | Sends = governed (this handoff) |
| Talent | CM+director feeds (future) | Individual sees own nudges; managers see rollups (design) | No auto-promote |

**Today’s evidence:** `requireAdminPage` is not per-position; all scoping is “naming-time” in code and docs (ALIGN-1). RBAC and workbench-scoped RAG are explicitly not built here.

---

## 4. Personalized workbench (future behavior, not built)

- **Guidance** — “What’s next” from FND-2+ plus override history (conservatism) plus alignment.
- **Training** — TALENT track + one or two sentences of *why* from provenance, not a lecture.
- **Explanations** — E-2B-style: what stayed, what the operator did not touch (pattern already in UI).
- **Priority help** — advisory re-order of tickets; never auto-reassign or auto-send.

---

## 5. Risks

- **Over-personalization** — stereotyping or creepy UX.
- **Invisible bias** when override patterns drive automation without outcome and diversity review.
- **Leaking across roles** if RAG or tool context is too wide before RBAC.
- **Authority confusion** if the model sounds like it can approve sends (always clarify human gate).

---

## 6. Human governance

- Any new user-visible personalization on `User` (or `metadata`) is opt-in and reviewable (future product decision).
- Managers + CM see aggregates, not a single subordinate’s opaque “score” (if an index ever exists, it must be explainable).

---

*Last updated: Packet ALIGN-1.*
