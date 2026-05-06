# EMAIL-AI-DRAFT-CRITIC-1.0 — Message Studio AI Draft Critic

**Lane:** `RedDirt/` only · **Surface:** Message Studio → Editorial Review Desk (`#editorial-review-desk`)

## Purpose

Operators run a **red-team critique** on a draft before editorial approval: scorecard, red flags, and a **revision plan**. This complements Campaign Voice AI (generation) and the editorial checklists — it does **not** replace human review.

## Governance (hard)

- **AI cannot approve** a draft for send or governance.
- **AI cannot send** email or trigger providers.
- **AI cannot overwrite** subject/body/preheader without an explicit operator edit elsewhere in Message Studio.
- **Unsupported claims:** the critic and optional OpenAI layer may flag items and use **“needs source”** language — they **must not** invent citations or “correct” facts.

## Implementation

| Piece | Location |
|--------|-----------|
| Deterministic critic + types | `src/lib/email-command-center/ai-draft-critic.ts` |
| Optional OpenAI JSON pass | `src/lib/email-command-center/message-studio-draft-critic-ai.ts` |
| Server actions | `src/app/admin/message-studio-draft-critic-actions.ts` |
| UI | `src/components/admin/email-command-center/MessageStudioDraftCriticPanel.tsx` (wired from `MessageStudioEditorialReviewPanel.tsx`) |

**Actions:** `critiqueMessageStudioDraftAction`, `generateRevisionPlanAction`, `persistCritiqueToServerDraftMetadataAction` (metadata merge only).

## Persistence

- **Local:** `MessageStudioLocalDraft.lastDraftCritiqueJson` (browser `localStorage` with the rest of the draft).
- **Server (optional):** when a draft is linked to a shared `MessageStudioDraft`, operators may save the same JSON into `metadataJson.lastDraftCritiqueJson` via the explicit **Save critique to shared draft** control — **no** subject/body mutation.

## Checks

Run from `RedDirt/`:

- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`
