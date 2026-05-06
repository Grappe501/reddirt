# Email + AI Intelligence — Architecture Audit

**Packet:** **EMAIL-AI-INTELLIGENCE-ARCHITECTURE-AUDIT-1.0**  
**Lane:** `RedDirt/` only  
**Scope:** Inventory of **OpenAI**, **campaign voice**, **SearchChunk / RAG**, **email Command Center intelligence**, **queue AI**, **profile / audience helpers**, and **related Prisma**. Cross-lane imports: none.  
**Out of scope:** Live sends, automation worker activation, secret values, `.env` contents.

**Purpose:** Single map for engineers before deeper **EMAIL-AI-INTELLIGENCE-*** upgrades — what calls the model, what reads `SearchChunk`, what is static guidance only, and where gaps or coupling risks live.

**Shared doctrine (roles + grounding + contracts):** [`email-ai-brain-registry.md`](./email-ai-brain-registry.md) — **`src/lib/email-command-center/ai-brain-registry.ts`** (**EMAIL-AI-BRAIN-REGISTRY-1.0**) composes `buildAiSystemPromptForRole` into Message Studio draft AI and queue email analysis.

---

## 1. Executive summary

| Area | OpenAI? | DB / SearchChunk? | Notes |
|------|-----------|-------------------|--------|
| **`src/lib/openai/*`** | Client + embeddings + classify + search blend | `SearchChunk` read/write via Prisma in `search.ts` / ingest scripts | Shared foundation for site + admin; **not** email-specific. |
| **Email queue AI** (`email-workflow/ai/*`) | Yes (`analyzer.ts`) | Persists to `EmailWorkflowItem.metadataJson.emailAiAnalysis` | **No** Gmail bodies; **no** `SearchChunk`; system preamble from **`ai-brain-registry.ts`** (`dataIntelligenceAnalyst`). |
| **Email queue task intelligence** (`email-command-center/ai-task-intelligence.ts`) | Yes | Persists to `metadataJson.emailTaskIntelligence` | **No** auto `CampaignTask`; **no** calendar API; optional use of prior `emailAiAnalysis` summary text only. |
| **Message Studio draft AI** (`message-draft-ai.ts`) | Yes | None | Uses `campaign-voice.ts` excerpt + operator text + **`ai-brain-registry.ts`** (`campaignCommsDirector`); **no** automatic RAG. |
| **Campaign voice** (`campaign-voice.ts`) | No | No | Static registry, readiness partitions, deterministic `sourceLimitations` merge helpers. |
| **Profile graph** (`profile-graph.ts`) | No | Prisma suggestions/hints/facts | Consumes **stored** queue AI JSON only. |
| **Audience Studio** (`audience-studio.ts`, `email-audience-actions.ts`) | No | Prisma previews / definitions | Deterministic criteria over facts. |
| **Forms intake classify** (`classify.ts` + `forms/handlers.ts`) | Yes | No | Optional classification on form persist; adjacent to email OS, not queue. |
| **Public Ask Kelly / search** (`/api/assistant`, `/api/search`) | Yes | `SearchChunk` + embeddings | **Public** safety path (`searchChunksForAskKelly`); not Message Studio. |
| **Comms workbench AI** (`comms/ai.ts`) | Yes | Not SearchChunk in-file | Separate comms drafting surface. |

**Headline risk:** Multiple independent `chat.completions` call sites share one `OPENAI_API_KEY`; email intelligence does **not** reuse `SearchChunk` today — operators must paste context or rely on queue summaries.

---

## 2. `src/lib/openai/*` (shared stack)

| File | Role |
|------|------|
| `client.ts` | `getOpenAIClient`, `getOpenAIConfigFromEnv`, `isOpenAIConfigured`, `formatOpenAIErrorForClient` — **server env** only. |
| `embeddings.ts` | `embedDocuments`, `embedQuery` — used by semantic search and ingest. |
| `search.ts` | `keywordSearchChunks`, `semanticSearch`, `searchChunks` (blend), `searchChunksForAskKelly` (path-allowlisted pool for public assistant), `prioritizeHitsForAssistant`, etc. Reads **`SearchChunk`** via Prisma. |
| `classify.ts` | `classifyIntake` — JSON object intake classification for forms. |
| `prompts.ts` | System strings for classifier + RAG-style answer helpers used by API routes. |
| `types.ts` | Shared types for search / assistant where applicable. |
| `README.md` | Operator doc: env vars, ingest (`npm run ingest`), `/api/search` vs `/api/assistant`. |

**Where embeddings are written:** Ingest scripts (e.g. `scripts/ingest-docs.ts`, campaign ingest pipelines) upsert `SearchChunk` — not done from Message Studio or queue AI.

---

## 3. `src/lib/email-command-center/*` (email OS library)

| Module | AI / OpenAI | DB / RAG | Static guidance |
|--------|-------------|----------|-----------------|
| `campaign-voice.ts` | No | No | Principles, frames, **`SOURCE_MATERIAL_READINESS`**, `buildCampaignVoicePromptExcerpt`, `mergeModelSourceLimitations`, context health heuristics. |
| `message-draft-ai.ts` | **Yes** — generate + revise | No | Imports `buildCampaignVoicePromptExcerpt`; merges deterministic limitations after model return. |
| `message-studio-advisory-json.ts` | No | No | Client-safe parse/normalize of `lastAiAdvisoryJson` (no OpenAI import). |
| `message-studio-editorial-review-model.ts` | No | No | Client-side editorial tier + checklists. |
| `message-templates.ts` | No | No | Production template registry (structure / risk hints). |
| `message-studio-drafts.ts` | No | Prisma shared drafts | Secret-pattern hygiene on payloads; **no** OpenAI. |
| `profile-graph.ts` | No | Prisma | **`createProfileFactSuggestionsFromEmailAiAnalysis`** reads `metadataJson.emailAiAnalysis.output` only; merges AI uncertainty/tasks into suggestion `sourceLimitations`. |
| `audience-studio.ts` | No | Prisma | Previews over **ACTIVE** facts; definitions / preview run audit. |
| `audience-preview-form-state.ts` | No | No | UI state types. |
| `read-model.ts` | No (uses `isOpenAIConfigured` only) | Many ECC tables | Snapshot for cockpit; **openaiApiKeyPresent** flag. |
| `hosted-db-readiness-assistant.ts` | No | No | URL parse / hostname classification — **no** LLM. |
| `analytics-operator-drilldown.ts`, `automation-policy-*.ts`, `send-execution*.ts`, `sendgrid-*.ts`, `gmail-production-watch.ts`, `contact-import.ts`, `ecc-migration-gate.ts` | No | Various | Operational / governance; not OpenAI intelligence paths. |

---

## 4. Entry points (routes, actions, UI)

### 4.1 Email queue — OpenAI analysis

| Layer | Path |
|--------|------|
| **Server action** | `src/app/admin/email-ai-actions.ts` → `runEmailWorkflowAiAnalysisAction` · `src/app/admin/email-task-intelligence-actions.ts` → `generateTaskRecommendationsForQueueItemAction` |
| **Engine** | `src/lib/email-workflow/ai/analyzer.ts` → `runEmailWorkflowAiAnalysis` (system preamble from **`ai-brain-registry.ts`**, role `dataIntelligenceAnalyst`) |
| **Types / contract** | `src/lib/email-workflow/ai/types.ts` (`EmailAiAnalysisV1`, `EMAIL_AI_PROMPT_VERSION`, stored envelope) |
| **Config / copy** | `src/lib/email-workflow/ai/config.ts` (`isEmailAiConfigured`, `getEmailAiPolicySummary`) |
| **UI** | `src/components/admin/email-workflow/EmailWorkflowAiIntelligencePanel.tsx`, `RunEmailWorkflowAiAnalysisButton` |

**Persistence:** `EmailWorkflowItem.metadataJson` JSON field — no separate `EmailAiRun` table.

### 4.2 Message Studio — campaign voice + draft AI

| Layer | Path |
|--------|------|
| **Server actions** | `src/app/admin/workbench/email-command-center/message-studio-ai-actions.ts` (`generateCampaignVoiceDraftAction`, `reviseCampaignVoiceDraftAction`) |
| **Engine** | `src/lib/email-command-center/message-draft-ai.ts` |
| **UI** | `MessageStudioCampaignPanels.tsx`, `MessageStudioView.tsx`, `message-studio/page.tsx` (passes `isOpenAIConfigured`) |
| **Local state** | `message-studio-local-drafts.ts` — `lastAiAdvisoryJson`, `campaignVoice`, etc. |

### 4.3 Profile + audience (no OpenAI)

| Layer | Path |
|--------|------|
| **Profile graph actions** | `src/app/admin/email-profile-graph-actions.ts` |
| **Audience actions** | `src/app/admin/email-audience-actions.ts` |

### 4.4 Readiness / snapshot

| Layer | Path |
|--------|------|
| **ECC read model** | `read-model.ts` → `getEmailCommandCenterSnapshot` (OpenAI **presence** only) |

### 4.5 Adjacent RedDirt OpenAI (not “email intelligence” but same key)

| Entry | Path |
|--------|------|
| **Forms** | `src/lib/forms/handlers.ts` → `classifyIntake` when `isOpenAIConfigured()` |
| **Public assistant** | `src/app/api/assistant/route.ts` + `searchChunksForAskKelly` |
| **Site search** | `src/app/api/search/route.ts` + `searchChunks` + optional answer |
| **Comms AI** | `src/lib/comms/ai.ts` |
| **Calendar / events / festivals / media monitor / volunteer extract** | `calendar/ai-insights.ts`, `event-comms-drafts.ts`, `festivals/ai-weekend-planner.ts`, `media-monitor/openai-mention-refine.ts`, `volunteer-intake/extract-signup-sheet.ts`, `assistant/run-completion.ts` |

These share **`OPENAI_API_KEY`** and model env but **do not** write to `EmailWorkflowItem` or Message Studio drafts unless explicitly integrated later.

---

## 5. Prisma models (AI-adjacent email lane)

| Model | Purpose |
|-------|---------|
| **`SearchChunk`** | `path`, `title`, `content`, `embedding` (string storage) — **RAG corpus** for `/api/search` and assistant retrieval; **not** referenced from `message-draft-ai` or `email-workflow/ai/analyzer`. |
| **`EmailWorkflowItem`** | Queue row; **`metadataJson`** holds `emailAiAnalysis`, `gmailReviewSource`, interpretation payloads, etc. |
| **`EmailContactProfile`**, **`EmailContactProfileFact`** | Approved contact facts. |
| **`EmailContactProfileFactSuggestion`** | **PENDING** staging from queue AI (`EMAIL_AI_V1`) — operator approve/reject. |
| **`EmailAudienceHint`** | **PENDING** staging from queue AI — not segments. |
| **`EmailAudienceDefinition`**, **`EmailAudiencePreviewRun`** | Audience Studio drafts + audit. |
| **`MessageStudioDraft`**, **`MessageStudioDraftRevision`** | Shared server drafts — **no** OpenAI on CRUD paths in current design. |

No first-class `EmailAiRun` or `MessageStudioAiRun` table — provenance lives in JSON blobs or suggestion rows.

---

## 6. What uses campaign voice

- **`message-draft-ai.ts`** — `buildCampaignVoicePromptExcerpt(settings)` in system/user context for generate and revise.
- **`MessageStudioCampaignPanels.tsx`** — full Campaign Voice UI: tone/issue/audience/CTA, source layers, source readiness buckets, paste templates, quality checklist.
- **`message-studio-send-packet.ts`** — serializes `campaignVoice` + labels into send packet for operator review.
- **`MessageStudioProductionTemplatesPanel.tsx`** — can queue `templateSummary` into generate action (structure only).
- **Docs:** `campaign-voice.ts` header comments reference repo doc paths (static, not live file reads from the app).

**Does not use campaign voice today:** `email-workflow/ai/analyzer.ts` (queue summaries only), `profile-graph.ts`, `audience-studio.ts`.

---

## 7. What uses DB / RAG (`SearchChunk`)

| Consumer | Uses `SearchChunk`? |
|----------|-------------------|
| `src/lib/openai/search.ts` | **Yes** — keyword + semantic blend. |
| `POST /api/search` | **Yes** — optional AI answer over hits. |
| `POST /api/assistant` | **Yes** — via `searchChunksForAskKelly` + allowlist. |
| **Message Studio / queue AI / profile graph / audience studio** | **No** automatic retrieval in current code. |

**Ingest:** `npm run ingest` and related scripts populate chunks — see `src/lib/openai/README.md`.

---

## 8. What is static guidance only

- **`campaign-voice.ts`** — principles, prohibited patterns, compliance strings, `SOURCE_MATERIAL_READINESS`, operator paste templates, `computeCampaignVoiceContextHealth`, deterministic limitation builders.
- **`message-studio-editorial-review-model.ts`** — editorial checklists and tier math (client-side).
- **`message-templates.ts`** — template metadata and placeholders.
- **`email-workflow/ai/config.ts`** — policy summary strings for UI.
- **Docs** referenced from campaign voice (paths listed in registry; app does not auto-read file contents into prompts except via operator paste).

---

## 9. What is missing (honest gaps)

1. **No unified “email intelligence bus”** — queue AI, Message Studio AI, comms AI, and forms classify are separate call sites with overlapping governance concerns.
2. **No optional SearchChunk retrieval** for Message Studio or queue analysis — by design today; operators must bring context.
3. **No versioned prompt A/B or eval harness** in-repo for email prompts (`EMAIL_AI_PROMPT_VERSION` is a string constant, not migration).
4. **No structured audit log table** for AI runs (only JSON on workflow item + localStorage for drafts).
5. **Campaign voice not fed into queue AI** — triage and drafting can drift unless operators align manually.
6. **Cross-surface OpenAI** (calendar, comms, festivals, etc.) — capacity, cost, and incident blast radius not centralized for email-focused ops.

---

## 10. Risks

| Risk | Mitigation today | Residual |
|------|------------------|----------|
| **Hallucinated facts in drafts or reply suggestions** | Prompt rules + `unsupportedClaimsTagged` / source limitation merges + editorial checklists + **EMAIL-AI-SOURCE-GROUNDING-LEDGER-1.0** (`ai-source-grounding.ts`, structured advisory buckets, UI ledger) | Operator must still verify; Gmail metadata-only rows are especially thin. |
| **Secret leakage in logs / UI** | `formatOpenAIErrorForClient`, strip patterns in analyzer, draft payload secret scan | New code must preserve patterns. |
| **Public assistant vs internal email** | Path allowlist for Ask Kelly search | Do not pipe unrestricted `SearchChunk` into public routes (documented in `assistant/route.ts`). |
| **Key shared across unrelated features** | Single env var | Rate limits / quotas / failure modes are shared. |
| **Stale `SearchChunk` index** | Keyword fallback without OpenAI | Semantic tier empty or misleading if ingest not run. |

---

## 11. Upgrade plan (suggested sequence — design only here)

1. **Contract freeze** — Treat `types.ts` (`EmailAiAnalysisV1`) + `CampaignVoiceDraftAiResult` as public contracts; document breaking-change policy.
2. **Optional retrieval module (gated)** — If product approves: small server-only helper `searchChunksForEmailOperatorContext` with strict token budget, allowlisted paths, **explicit** UI toggle (“Run retrieval for this draft”), never auto on send paths.
3. **Unify readiness** — Single `getEmailAiStackReadiness()` combining OpenAI + DB + chunk count (read-only) for cockpit + Message Studio banner.
4. **Campaign voice in queue AI** — Optional slim excerpt from `buildCampaignVoicePromptExcerpt` behind feature flag to align triage tone with Message Studio.
5. **Eval / regression** — Offline fixture tests for JSON shape + golden `normalizeAnalysisFromJson` behavior (no live API in CI unless stubbed).
6. **Observability** — Log `promptVersion` + item id (no PII) on success/failure for operator support.

All of the above require **explicit packets** and **no** change to `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM` unless Steve approves a separate execution packet.

---

## 12. File index (quick grep anchors)

```
src/lib/openai/client.ts
src/lib/openai/embeddings.ts
src/lib/openai/search.ts
src/lib/openai/classify.ts
src/lib/openai/prompts.ts
src/lib/email-workflow/ai/analyzer.ts
src/lib/email-workflow/ai/types.ts
src/lib/email-workflow/ai/config.ts
src/lib/email-command-center/campaign-voice.ts
src/lib/email-command-center/ai-brain-registry.ts
src/lib/email-command-center/message-draft-ai.ts
src/lib/email-command-center/ai-source-grounding.ts
src/lib/email-command-center/ai-task-intelligence.ts
src/lib/email-command-center/message-studio-advisory-json.ts
src/lib/email-command-center/profile-graph.ts
src/lib/email-command-center/audience-studio.ts
src/app/admin/email-ai-actions.ts
src/app/admin/workbench/email-command-center/message-studio-ai-actions.ts
src/app/admin/email-audience-actions.ts
src/app/admin/email-profile-graph-actions.ts
```

---

## 13. Related documentation

- [`email-ai-brain-registry.md`](./email-ai-brain-registry.md) — centralized doctrine + role registry (**EMAIL-AI-BRAIN-REGISTRY-1.0**)  
- [`src/lib/openai/README.md`](../src/lib/openai/README.md) — env + ingest + API overview  
- [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) — vision + packet map  
- [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md) — blueprint status  
- [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) — layer scores  
- [`email-campaign-voice-source-readiness-1-0.md`](./email-campaign-voice-source-readiness-1-0.md) — source readiness packet notes (if present)

---

**Audit complete:** **EMAIL-AI-INTELLIGENCE-ARCHITECTURE-AUDIT-1.0** — documentation only; no runtime behavior change in this packet.
