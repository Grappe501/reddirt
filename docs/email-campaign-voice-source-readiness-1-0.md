# EMAIL-CAMPAIGN-VOICE-SOURCE-READINESS-1.0

**Lane:** `RedDirt/` only  
**Division:** Comms / Email Command Center — Message Studio  
**Goal:** Campaign Voice **source-awareness** so operators see what material is available as static repo docs, what is not bundled, what depends on **semantic RAG ingest**, and what must be **pasted** from approved systems.

## Shipped behavior

| Area | Change |
|------|--------|
| **`campaign-voice.ts`** | Expanded **`SOURCE_MATERIAL_READINESS`** with slots: mission, values, issue frames, candidate bio, prior writings (no bundled doc), fundraising / volunteer / press / voter-education / compliance language (repo paths only), semantic RAG row, queue/audience/profile posture. New helpers: **`partitionCampaignVoiceSourceReadiness`**, **`computeCampaignVoiceContextHealth`**, **`buildDeterministicAiSourceLimitationLines`**, **`mergeModelSourceLimitations`**, **`MISSING_DOC_OPERATOR_GUIDANCE`**, **`OPERATOR_PROMPT_TEMPLATES`**. |
| **`MessageStudioCampaignPanels.tsx`** | **Source readiness** panel (`#message-studio-source-readiness`): four buckets (static / missing bundled / not indexed / operator paste), **paste templates** (copy to clipboard), **thin context warning** when heuristics fire, AI advisory shows **source limitations first** + reminder above **body draft**. |
| **`message-draft-ai.ts`** | After each generate/revise parse, **`sourceLimitations`** is merged with deterministic registry + toggle + thin-context lines (**no** new model calls). |
| **`message-studio-ai-actions.ts`** | Optional **`complianceNotes`** on revise payload for better merge input. |

## Hard constraints (this packet)

- **No invented campaign claims** — templates are scaffolds; registry describes paths, not live facts.  
- **No web scraping** — unchanged.  
- **No DB ingestion** — Message Studio does not query **`SearchChunk`**; ingest remains a separate operator workflow per **`src/lib/openai/README.md`**.  
- **No sends** — advisory AI only; **`EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`** unchanged.

## Operator checks

From `RedDirt/`:

- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

## Ledger impact

- **OpenAI Email Intelligence** — reflects deterministic merge + UX (**~78%** in ledger).  
- **Message Studio / Drafting** — source readiness + templates (**~99%** maintained).
