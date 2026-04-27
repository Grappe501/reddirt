# Message engine — typed feedback loop

**Lane:** `H:\SOSWebsite\RedDirt`  
**Date:** 2026-04-27  
**Status:** **Implemented (library + demo UI)** — persistence intentionally **out of scope** in this packet.

---

## 1. Purpose

Close the loop between **message use** (which template was selected/copied/sent) and **conversation outcomes** (how the touch landed) so organizers can:

- Summarize aggregate reactions without person-level shaming.
- Nudge **message category** emphasis (which buckets to surface in training/UI).
- Map outcomes to **Power pipeline** hints (`PowerPipelineId`) for dashboards that already speak Power of 5 language.
- Produce a logical **follow-up need** list for future routing (Workbench / tasks / `WorkflowIntake` — not wired here).

**Hard constraints for this packet:**

- **No** writes to Postgres or `WorkflowIntake` from these helpers.
- **No** voter ids, match keys, or raw PII in `MessageUseEvent.metadata` (keys matching sensitive patterns are stripped in `createMessageUseEvent`).
- **No** connection to `VoterRecord` or relational graph persistence.

---

## 2. Source types

| Artifact | Location |
|----------|----------|
| Outcome union | `CONVERSATION_OUTCOMES` / `ConversationOutcome` in `src/lib/message-engine/types.ts` |
| Feedback row | `MessageFeedback` in `src/lib/message-engine/types.ts` |
| Use event | `MessageUseEvent` in `src/lib/message-engine/types.ts` |
| Power pipelines | `PowerPipelineId`, `OrganizingActivityType` in `src/lib/power-of-5/types.ts`; ladder copy in `src/lib/power-of-5/pipelines.ts` |

**Canonical conversation outcomes (relational touch):**

`listened` · `interested` · `needs_follow_up` · `wants_event` · `wants_volunteer` · `wants_petition` · `wants_candidate_info` · `not_now` · `opposed` · `unknown`

These replace the earlier placeholder ops-style outcome list that was never consumed elsewhere in code.

---

## 3. API (`src/lib/message-engine/feedback.ts`)

| Function | Role |
|----------|------|
| `createMessageUseEvent(input)` | Validates kind, template id, ISO time; trims metadata size; drops sensitive key names. Returns `{ ok, event }` or `{ ok: false, error }`. |
| `summarizeMessageFeedback(feedback[])` | Counts by `MessageResponseBucket` and `ConversationOutcome`; distinct template ids; aggregate **coaching** strings. |
| `calculateMessageCategoryMovement(feedback[])` | Applies deterministic weights to the **template’s** `MessageCategory` plus small boosts to related categories (e.g. `wants_event` → `event_invite`). |
| `getFollowUpNeeds(feedback[])` | Lists logical follow-ups with **priority** and **reason** (high/medium/low). |
| `mapConversationOutcomeToPipelineMovement(outcome)` | Returns `PipelineMovementHint[]` (`PowerPipelineId` + `momentum` + `strength`), a **headline**, and **suggested** `MessageCategory[]` ordering. |
| `isConversationOutcome(value)` | String guard for forms and APIs. |

**Momentum vocabulary:** `advance` · `maintain` · `cool` · `park` — interpret as UX/coaching, not automatic CRM stage writes.

---

## 4. Relationship to forms and `WorkflowIntake`

Public form persistence (`src/lib/forms/handlers.ts` → `WorkflowIntake`) is the **existing** safe pattern for capturing structured intent with DB writes. **This feedback loop does not extend that path yet.**

A **future** packet could:

1. Add an **admin-only** or **authenticated volunteer** API that accepts **aggregate-safe** payloads (template id, outcome, optional plan id).
2. Map high-priority follow-ups to `WorkflowIntake` **only** after compliance review and explicit product approval.

Until then, operators should rely on manual workbench practice plus any local notes — not on automatic intake creation from this library.

---

## 5. Demo UI

`src/components/message-engine/ConversationOutcomeDemo.tsx` (**client component**) lets staff or trainers click an outcome and see **pipeline hints** and **category suggestions** from `mapConversationOutcomeToPipelineMovement`. It does **not** POST data or store PII.

Export: add to `src/components/message-engine/index.ts` if a page imports the barrel.

---

## 6. Power of 5 alignment

Organizing activity types (`conversation`, `door`, `text`, etc.) describe **how** work happened; pipeline ids describe **where** someone sits in funnel narratives. Outcome mapping in `mapConversationOutcomeToPipelineMovement` favors:

- `conversation` / `invite` / `activation` for early relational signals.
- `followup` for loop-closing.
- `event`, `volunteer`, `petition`, `candidate` for explicit asks.

This stays **typed and explainable** — not a learned model.

---

## 7. Files touched (this packet)

- `src/lib/message-engine/types.ts` — conversation outcome union aligned to §2.
- `src/lib/message-engine/feedback.ts` — **new** logic module.
- `src/lib/message-engine/index.ts` — re-exports.
- `src/components/message-engine/ConversationOutcomeDemo.tsx` — **new** demo.
- `docs/MESSAGE_ENGINE_FEEDBACK_LOOP_REPORT.md` — this document.

---

## 8. Verification

From `RedDirt/`:

```bash
npm run check
```

Manual: render `ConversationOutcomeDemo` on a style-guide or internal page (optional — component is safe to drop into admin copy review only if desired).
