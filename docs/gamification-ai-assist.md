# Gamification — AI assist (GAME-1) (RedDirt)

**Packet GAME-1 (Part F).** Defines how **AI** supports the **Volunteer Progression Engine** without **manipulation** or **autonomous authority**. Consistent with REL-1 AI assist, BRAIN-1, ALIGN-1, and TALENT-1 **human finality**.

**Cross-ref:** [`relational-ai-assist-foundation.md`](./relational-ai-assist-foundation.md) · [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) · [`volunteer-xp-model.md`](./volunteer-xp-model.md) · [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`ai-agent-brain-map.md`](./ai-agent-brain-map.md)

---

## 1. AI capabilities (allowed)

| Capability | Description |
|------------|-------------|
| **Suggest next actions (“quests”)** | Propose **1–3** concrete steps derived from **open work**, **REL-2** contact states, and **county** context—framed as **organizing choices**, not chores. |
| **Highlight progress** | Summarize **meaningful** deltas: “You moved two contacts to reached this week”; tie to REL-1 KPIs. |
| **Coach volunteers** | Scripts, tone, follow-up prompts; **human** sends. |
| **Personalize encouragement** | Adjust tone to **stage** (base / active / leader) from [`volunteer-identity-evolution.md`](./volunteer-identity-evolution.md)—**never** shame for low velocity. |
| **Recommend advancement** | **Advisory** only: “Consider asking your county lead about Team Leader path”—mirrors TALENT-1 recommender, not auto-promotion. |

---

## 2. Constraints (required)

| Constraint | Rationale |
|------------|-----------|
| **No manipulation** | No dark patterns, **no** hidden social pressure from fabricated comparisons. |
| **No fake urgency** | No **false** deadlines (“expires in 1 hour”) for XP or unlocks; real event windows may be stated honestly. |
| **No deceptive tactics** | No impersonation of humans; no **misleading** progress bars; XP explanations must map to **real events** ([`volunteer-xp-model.md`](./volunteer-xp-model.md)). |
| **No auto-send** | Same as REL-1: AI **drafts**; volunteer **commits**. |
| **Provenance** | Log suggestions with model/version/reasons when product stores them (pattern: `metadataJson` namespaced e.g. `vpeAiAssist`). |

---

## 3. Relationship to other AI rails

- **Email workflow (E-1/E-2):** VPE suggestions **do not** bypass queue review; they may **reference** queue items as **organizing context** only.
- **Alignment:** Encouragement and quests **must** respect [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) red lines.
- **Talent:** Advancement **recommendations** feed **human** reviewers; never **mutate** `PositionSeat`.

---

## 4. Future implementation touchpoints

- Register VPE assist in `ai-brain.ts` when GAME-2 introduces APIs.
- Reuse **user context** builders so coaching is **scoped** to volunteer’s county and unlocked content.

---

*Last updated: Packet GAME-1 (Part F).*
