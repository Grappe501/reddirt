# Victory OS — Phase 2: Decision Infrastructure

**Status:** Blocked until Leadership Lock Session completes  
**Prerequisite:** [`VICTORY_OS_PHASE_1_COMPLETE.md`](./VICTORY_OS_PHASE_1_COMPLETE.md)  
**Draft leadership input:** [`LEADERSHIP_DRAFT_INPUT_KELLY.md`](./LEADERSHIP_DRAFT_INPUT_KELLY.md)

---

## What Phase 2 is

**Decision Infrastructure** — trustworthy math leadership can explain in 30 seconds.

Not AI. Not predictions. Not automation. Not fancy dashboards.

---

## Phase 2 deliverables

| Deliverable | Description |
|-------------|-------------|
| Leadership-locked Victory Map | Overrides applied; `leadershipStatus: locked` |
| Leadership-locked assumptions | Readiness, opportunity, capacity, victory inputs |
| `resolveDeploymentPriority()` | Deterministic function — no ML |
| Scoring | Importance × Opportunity × Readiness Gap × Urgency |
| Traceability | Every score cites lock sheet + map version |
| Auditability | Assumption Change Log for any post-lock change |

---

## Phase 2 is not

- AI recommendations
- Predictive modeling
- Automated deployment orders
- Black-box rankings
- County tactic AI (registration vs postcard vs festival) — **later**, after infrastructure proves explainable

---

## Success test — Benton vs White

Kelly asks:

> "Why is Benton ranked above White this week?"

**Required answer shape:**

```text
Benton County — Priority 84

Why:
- Electoral importance: Critical (locked urban center)
- Opportunity: High (locked definition — marginal vote headroom)
- Readiness gap: Moderate → needs field bench
- Urgency: Season 2 immersion window

Source: Victory Map v1 (locked) · Leadership Lock v1 · Week of [date]
```

If a campaign manager cannot explain a score in **30 seconds**, the engine is too complicated.

**County chair bar:** If a county chair cannot understand the same explanation, Phase 2 is not ready.

Passing line:

> Benton is ranked above White because it is Critical, has high opportunity, moderate readiness, and higher urgency this week.

---

## Success test — Monday morning

Can county chair, campaign manager, or candidate answer:

> What are the most important decisions we need to make this week to win?

Phase 2 exists to make that answer **evidence-based**, not gut-based.

---

## How to measure progress in Phase 2

Measure **decision quality**, not feature completion:

1. Which counties are truly critical?
2. Which counties are truly movable?
3. What does readiness actually mean?
4. How much Kelly capacity exists?
5. What assumptions power the model?
6. What is the campaign's winning theory?

---

## Sequence (unchanged)

```text
Leadership Lock Session
        ↓
Six decisions LOCKED
        ↓
Victory Map re-seed
        ↓
resolveDeploymentPriority()  ← Phase 2 starts here
        ↓
Decision Engine (Phase 3+)
        ↓
Mission Brief · Victory Board (when governance allows)
```

---

## Engineering discipline

Keep Phase 2 **boring, deterministic, and explainable.**

That discipline is what makes later AI and automation layers useful instead of a black box.
