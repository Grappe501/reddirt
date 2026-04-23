# Automation override and impact — foundation (RedDirt)

**Packet ALIGN-1** companion. An **override** is a signal when a human (or policy) diverges from the suggested or default automated path—not an automatic admission of model failure. Learning from overrides informs conservatism and training; it must not silently rewrite governance or promote people (TALENT-1). ALIGN-1 adds no new database tables or jobs.

**Cross-ref:** [`campaign-brain-alignment-foundation.md`](./campaign-brain-alignment-foundation.md) · [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) · `src/lib/campaign-engine/overrides.ts` · [`ai-integration-matrix.md`](./ai-integration-matrix.md)

---

## 1. Why overrides matter

- The default path in RedDirt is increasingly machine-assisted: RAG assistant, comms thread summary + next action, heuristic email interpretation (E-2), webhook-driven retries (comms), and future routing rules (FND-2+).
- When a human changes a suggestion, draft, assignment, or hold/ship decision, we learn where automation was wrong, incomplete, or incomplete for *this* context (risk, relationship, timing).
- Causality is rarely provable; treat overrides as hypothesis-generating signal and audit input, not as ground truth for a single global “model weight.”

---

## 2. What counts as an override (justified for current or near-future architecture)

| Kind (`AutomationOverrideKind` in `overrides.ts`) | When it fires | Repo / near-future evidence |
|---------------------------------------------------|---------------|----------------------------|
| `changed_recommendation` | Human accepts different suggested text (summary, next action) than model/heuristic | Comms: rewrite vs `draftOutboundMessage` output; workbench (future diffs) |
| `changed_routing` | Different queue or intake path than classifier or default | Form `classifyIntake` vs staff re-categorize; future auto-route to `EmailWorkflow` |
| `changed_draft` | Saved body ≠ last AI draft | `comms/ai` when we store “last AI draft” id (future) |
| `changed_send_hold` | Hold or send ≠ what automation or suggestion implied | Send after comms review; no auto-send from email workflow (this handoff) |
| `changed_assignment` | `assignedToUserId` or future position route ≠ suggestion | E-2B `assigneeUserIdHint` (stub); `assignedToUserId` on schema |
| `changed_escalation` | Operator sets escalation / triage after interpreter | `EmailWorkflowItem` + metadata provenance `preservedOperatorFields` / `overwrittenFields` |
| `changed_training_recommendation` | Dismiss/ack of TALENT rec (future) | TALENT-2+ |
| `changed_task_priority` | Manual priority/due ≠ template or suggestion | `CampaignTask` (future) |
| `changed_public_response` | Different from `/api/assistant` + RAG (no public write path today) | If we log published answer variants (future) |

**Do not** label a path an “override” when it is already 100% human-only with no prior machine suggestion (low contrast).

---

## 3. What to track (conceptual event shape)

Future `AutomationOverrideEvent` (or namespaced `metadataJson` on the affected object first):

- `systemArea` / `touchpoint` — e.g. `comms_draft`, `email_workflow_triage` (see `CampaignBrainTouchpoint`).
- `originalPath` / `originalSuggestion` — snapshot or hash of model/heuristic output (do not rely on re-query; content may drift).
- `humanChange` — diff or categorical label (e.g. “cleared escalation”).
- `actorUserId` — from session / `getAdminActorUserId` pattern (future).
- `at` — timestamp.
- `reasonNote?` — optional “why I overrode” (UX nudge, not required).
- `affectedObject` — `{ type, id }` (Prisma model + key).
- `governanceClass` — maps to `HumanGovernanceBoundary` and domain (comms, voter, etc.).
- `outcomeLinks[]` (later) — pointers to outcome rows (send delivered, task done, complaint).

**E-2B** already logs `overwrittenFields` and `preservedOperatorFields` on `metadataJson.emailWorkflowInterpretation`—a proven pattern to extend to other domains (ALIGN-2+).

---

## 4. Impact model (outcome classification)

- **Improved** — Downstream metric moved favorably (e.g. faster reply, no complaint); hard to prove causation.
- **Neutral** — No detectable change.
- **Degraded** — Bounced send, double message, compliance flag, missed SLA (even if not the overrider’s “fault”).
- **Unknown** — Insufficient data or time horizon; default honest state.

**Limits:** Field events, press, and other confounders; attribute at most plausible contribution, not court-level causation.

---

## 5. Learning loop (governance-safe)

1. Aggregate per-kind override rates (dashboard; not a per-user public “score”).
2. Tighten automation in system areas with frequent overrides plus bad outcomes: more conservative suggestions, extra required fields (human-signed policy, not silent model tuning).
3. Training (TALENT): nudge modules when overrides cluster on a role or workbench.
4. Never auto-tune model weights in production without CM + eng review (alignment governance).

---

## 6. Human governance

- Overrides are observations. “The model was wrong” is not the same as “automation was bad policy” (human may overrule for taste or local context).
- Product must not publicly shame by override count (TALENT-1 human dignity).

---

## 7. Build sequence (post ALIGN-1)

1. **OVR-1** — Append-only event + minimal internal admin view for one domain first (e.g. email workflow provenance only).
2. **OVR-2** — Link to outcome events (send result, task close).
3. **ALIGN-2 + OVR-2** — Correlate override clusters with alignment version (e.g. did a prompt update reduce overrides?) as analytics only.

---

*Last updated: Packet ALIGN-1.*
