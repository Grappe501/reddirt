# Email AI — Source Grounding Ledger

**Packet:** **EMAIL-AI-SOURCE-GROUNDING-LEDGER-1.0**  
**Lane:** `RedDirt/` only · **Scope:** Message Studio Campaign Voice AI advisory — **no** sends, **no** external fact-checking, **no** invented citations or URLs.

## Purpose

Operators need a consistent way to see what is:

1. **Source-backed** (aligned with operator paste, template summary, or campaign voice excerpt),
2. **Operator-provided context** (echo of fields the model relied on),
3. **Inference** (framing or recommendations, not asserted facts),
4. **Unsupported** (needs verification, removal, or citation before governance).

The ledger is **deterministic** code layered on the same inputs the model saw, plus the model’s structured JSON buckets. It does **not** call third-party fact APIs and does **not** fabricate document titles or links.

## Code

| Piece | Path |
|--------|------|
| Types + builders | `src/lib/email-command-center/ai-source-grounding.ts` |
| OpenAI parse + enrichment | `src/lib/email-command-center/message-draft-ai.ts` |
| Client parse of stored advisory | `src/lib/email-command-center/message-studio-advisory-json.ts` |
| UI — Campaign Voice / AI panel | `src/components/admin/email-command-center/MessageStudioCampaignPanels.tsx` |
| UI — Editorial summary | `src/components/admin/email-command-center/MessageStudioEditorialReviewPanel.tsx` |
| Output contract text | `getEmailAiOutputContract("messageStudioDraft")` in `ai-brain-registry.ts` |

## JSON shape (stored in `lastAiAdvisoryJson`)

In addition to existing keys (`sourceBackedBullets`, `sourceLimitations`, etc.), the advisory object may include:

- `sourceBackedClaims`: `{ text, grounding?, note? }[]`
- `operatorProvidedContext`: `string[]`
- `inferences`: `{ text, rationale? }[]`
- `unsupportedClaims`: `{ text, reason? }[]`
- `recommendedEdits`: `string[]`
- `evidenceLedger`: server-built `AiEvidenceLedger` (ISO timestamp, summary line, references, notices, classified rows)

If `evidenceLedger` is missing (older local drafts), the UI reconstructs a ledger from the same helpers using current draft fields and the parsed advisory.

## Honesty rules

- **No sources:** ledger summary and notices state explicitly that the operator corpus was empty or too thin.
- **No SearchChunk / semantic RAG** on this path: notices repeat registry posture.
- **Heuristic unsupported** lines run only when the model supplied **no** `unsupportedClaims` rows, are capped (five), and are labeled as heuristic — not journalism-grade extraction.

## Related docs

- [`email-ai-brain-registry.md`](./email-ai-brain-registry.md) — shared doctrine.  
- [`email-ai-intelligence-architecture-audit.md`](./email-ai-intelligence-architecture-audit.md) — path inventory.  
- [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) — layer scores.
