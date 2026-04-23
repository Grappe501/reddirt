# AI agent brain — system map (RedDirt)

**Packet BRAIN-1.** **Architecture** artifact: where the **digital Campaign Manager brain** **already** **lives** in code, data, and prompts; how it should **relate** to the **unified campaign engine**; what stays **human-governed**. **No** new orchestrator runtime; **no** autonomous sends or role changes.

**Cross-ref:** [`ai-integration-matrix.md`](./ai-integration-matrix.md) · `src/lib/openai/` · `src/lib/assistant/` · `src/lib/campaign-engine/ai-brain.ts` · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) · [`talent-intelligence-foundation.md`](./talent-intelligence-foundation.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md)

---

## 1. North star

- **The AI agent** is the **default cognitive layer** for **public education**, **RAG** **grounding**, **operator** **triage** **assist** (comms thread rail), and **(future)** **advisory** **recommendations** **across** **rails**—**not** a **sidebar** **chat** only.
- **Always-on** **evaluator** / **strategist** (within **retrieval** and **task**-shaped **surfaces**): when **OpenAI** is configured, the **stack** can **answer**, **classify**, **summarize** **threads**, **refine** **mentions**—**always** with **stated** **inputs** and **(where** **relevant**)** **persistence** on **domain** **rows** or **`SearchChunk`**.
- **Not** the **unquestioned** **authority** on: **sends**, **voter/PII** **exports**, **compliance** **lines**, **seat** **changes**, or **talent** **promotion**—**per** handoff, **FND-1** **,** and **TALENT-1**.

---

## 2. Current AI surfaces in repo (concrete)

| Surface | Key files | Purpose | Inputs | Outputs | Centrality |
|--------|-----------|---------|--------|---------|------------|
| **OpenAI client** | `src/lib/openai/client.ts` | Singleton, env `OPENAI_API_KEY` / `OPENAI_MODEL` / embedding model | Env | `OpenAI` instance | **Central** for all call sites |
| **Embeddings** | `src/lib/openai/embeddings.ts` | `embedQuery` / `embedTexts`, cosine | Text | Vectors; DB stores JSON in `SearchChunk.embedding` | **Central** |
| **RAG / search** | `src/lib/openai/search.ts` | `searchChunks` (keyword + semantic blend), `buildContextBlock`, `prioritizeHitsForAssistant`, `assistantPathTier` | User query, DB `SearchChunk` | Ranked hits, context string | **Central** for public + assistant |
| **Public search API** | `src/app/api/search/route.ts` | `POST` search + optional `includeAnswer` (grounded) | `query`, `includeAnswer` | `results[]`, `answer?` | **Central** entry |
| **Campaign assistant (Ask Kelly / guide)** | `src/app/api/assistant/route.ts` | RAG + **tool-calling** (`runCampaignAssistantCompletion`); SSE; journey/path hints | `message`, `history?`, `journeyBeat*`, `pathname?`, `stream?` | `reply`, **suggestions**, tool trace | **Central** public brain |
| **Assistant core** | `src/lib/assistant/run-completion.ts` | System prompt = `RAG_ANSWER_SYSTEM_PROMPT` + tools + v2/v3 supplements | RAG user block (built in route) | Chat completion | **Central** |
| **Assistant tools** | `src/lib/assistant/tools.ts` | `list_upcoming_events`, `get_content_by_slug`, `get_office_priorities_summary`, **etc.** (reads content modules) | Tool args (JSON) | **Public** data strings | **Central** (ties assistant to `src/content/`) |
| **Playbooks / journey** | `src/lib/assistant/playbooks.ts` | `detectPlaybook`, `playbookPromptBlock`, merge | Pathname, beats | Extra prompt text | **Journey-aware** (partial) |
| **Prompts (policy + voice)** | `src/lib/openai/prompts.ts` | `ASSISTANT_SYSTEM_PROMPT`, `RAG_ANSWER_SYSTEM_PROMPT`, `INTAKE_CLASSIFIER_PROMPT`, `SEARCH_DIALOG_GUIDE_PROMPT`, tools supplement, v2 multi-turn, response style, **data** **governance** supplements | N/A (constants) | Strings consumed by API routes | **Where “training” and guardrails are encoded** in-repo |
| **Intake classification** | `src/lib/openai/classify.ts` + `handlers.ts` | `classifyIntake` → JSON: intent, interestArea, urgency, `leadershipPotential`, tags | Form type + `summaryText` (from submission) | `IntakeClassification` / null; stored on submission path | **On form post**; **isolated** to CRM intake |
| **Comms / workbench thread AI** | `src/lib/comms/ai.ts` | `generateThreadSummaryAndNextAction` (JSON summary + next action); `draftOutboundMessage`; `rewriteMessage` | **Thread** **lines** (in-app messages) | **Persists** on `CommunicationThread` **`aiThreadSummary`**, `aiNextBestAction` via `workbench-comms-actions.ts` | **Core ops** **brain** for **1:1** rail |
| **Workbench UI** | `src/app/admin/(board)/workbench/page.tsx` | Displays `aiThreadSummary` / `aiNextBestAction`; “Refresh AI summary” | Thread selection | Comms **rail** **(human-triggered** **refresh**)** | **Integrated** in CM hub |
| **Email workflow intelligence** | `src/lib/email-workflow/intelligence/*` | **E-2A/B:** **heuristic** **(no** **LLM**)** **interpretation**; **stubs** `extension-points.ts` for E-3/E-4 | `EmailWorkflowItem` + linked Prisma | Written summaries + `metadataJson.emailWorkflowInterpretation` | **Parallel** “brain” **slot**; **ready** to **swap** heuristics for **LLM** **per** handoff **(not** **done** in E-1/E-2) |
| **Email context** | `src/lib/email-workflow/intelligence/context.ts` | Loads thread; `aiThreadSummary` is a **field** in context | Thread id | `EmailWorkflowInterpretationContext` including **`aiThreadSummary`** | **Bridges** comms **AI** into **email** **workflow** **fragments** |
| **Media monitor** | `src/lib/media-monitor/openai-mention-refine.ts` + `run-ingest.ts` | `refineMentionWithOpenAi` — tier, type, opinion flags | Title, URL, summary | **Refined** **classification** on ingest | **Isolated** **per** **monitoring** **pipe** |
| **Planning: suggest dates** | `src/app/api/planning/suggest-dates/route.ts` | OpenAI for **suggested** event dates (if configured) | Request body | Suggestions | **Narrow** feature |
| **Search UI** | `src/components/search/SearchDialog.tsx` | Calls `POST /api/search` | User query | Snippets + optional answer | **Public** **entry** to **RAG** |
| **Campaign guide dock** | `src/components/campaign-guide/CampaignGuideDock.tsx` + `src/lib/campaign-guide/assistant-sse.ts` | Client for `/api/assistant` (SSE) | User messages | Streamed reply | **Public** **entry** to **tool** **assistant** |
| **Social** | `src/lib/social/social-analytics-ai-stubs.ts` | **Explicit** **stub** — **no** **OpenAI** **yet** | N/A | Placeholder return | **Gap** (documented) |
| **Ingest: site docs** | `scripts/ingest-docs.ts` (via `npm run ingest`) | Chunks + embeds **docs** and wired content | Markdown / pipeline | `SearchChunk` rows | **Index** for **RAG** |
| **Ingest: campaign “brain”** | `scripts/ingest-campaign-brain.ts` | Folder ingest with **path**-derived “brain” tags; voter/field/briefing presets | **Local** **folder** path (see script) | `SearchChunk` / related (see script + Prisma) | **Primary** locus for **“trained** **corpus**” **outside** **raw** **prompts** |
| **Ingest: volunteer, DNC, etc.** | `package.json` — `ingest:volunteer-onboarding`, `ingest:dnc-playbook`, `ingest:briefings`, **etc.** | Additional **corpus** into index | **Paths** in scripts | `SearchChunk` (or same pipeline) | **Scattered** **but** **same** **DB** **primitive** |
| **Content chunks for search** | `src/lib/content/fullSiteSearchChunks.ts` | Merges **static** `DocChunk` from **narrative/background** modules | **TS** **content** | Fed into `ingest` / chunk pipeline | **Bridges** **code**-authored** **content** to **RAG** |
| **Photo / owned-media AI scripts** | `scripts/ai-curate-kelly-groups-images.ts`, `ai-privatize-sensitive-owned-media.ts` | **Batch** **admin** **(optional** **apply)**; **not** **runtime** workbench | Files / DB | **Mutations** when `--apply` | **Offline** **“brain”** **assists** **,** not **online** **CM** **loop** |

---

## 3. Trained brain / where prior training “lives”

**Concrete:**

1. **`src/lib/openai/prompts.ts`** — **Long-form** `RAG_ANSWER_SYSTEM_PROMPT`, **search** **dialog** **narration**, **intake** **classifier** **text**, **tool** **supplements** **,** **tightening** and **governance** **appendices**. This is the **highest-entropy** in-repo “personality and policy for the model” in **static** form.
2. **`SearchChunk` (Postgres)** — **Embeddings** + text **after** `npm run ingest` and related scripts. The **ingested** “campaign information” folder and **DNC/ volunteer** **pipelines** (see `scripts/ingest-campaign-brain.ts`, `package.json` **ingest:***) are where **proprietary** **/ extensive** user **training** is **most** **likely** **materialized** for **RAG** **(if** those **ingests** **were** **run** in **their** **environment**). **The** **repo** **does** **not** **contain** the **binary** **corpus**—only **how** to **ingest** it.
3. **`src/content/background/*`** — **Strategic** **messaging** **modules** **referenced** in **full** **site** **search** (e.g. `stand-up-arkansas`, `strategic-messaging`, `forevermost-farms`) with **“run** **npm** **run** **ingest**” **comments**—**code**-adjacent** **knowledge** **,** not **ChatGPT** **memory**.
4. **Assistant** **tools** (`src/lib/assistant/tools.ts`) — **Hand-copied** `OFFICE_PRIORITIES_TEXT` and **readers** for **stories** **/** **editorials** / **events**—**bespoke** **bridge** from **TypeScript** **content** to **model** **context**.
5. **Heuristic** **email** **workflow** “brain” is **in** code (`heuristics.ts` **,** `composer.ts`)**—** **not** **LLM**; **E-3+** may **point** the **interpreter** at **the** **same** **`client.ts`** path **with** **strict** **provenance**.

**Unclear** **without** **your** **runtime** **(honest** **gaps**): **Whether** a **separate** **vector** **store** or **custom** **GPT** **exists** **outside** **this** **repo**; **this** **map** **only** **covers** **RedDirt** **sources**.

---

## 4. AI touchpoints across the unified system

| System area | Current evidence | Future **digital** **CM** **brain** **role** |
|-------------|------------------|-----------------------------------------------|
| **Public** **voter** **edu** **/** **query** | `/api/assistant` **,** **search** **,** **guide** **dock** | **Primary**—grounded RAG, tools, **journey** **hints**; keep **read-only** to CRM **unless** **product** **adds** **capture** |
| **Incoming** **work** **interpretation** | **Heuristic** `EmailWorkflowItem` **;** **optional** `aiThreadSummary` in **context** | **Unify** **narrative** with **one** **provenance** **standard**; **LLM** **optional** **per** **E-3+** with **no** **auto**-**act** |
| **Queue** **triage** | **Comms** **JSON** **summary** **+** **next** **action** on **thread**; **E-2B** per-field **write** | **Consistent** “suggest, operator decides” **across** **EmailWorkflow** **and** **thread** **rails** |
| **Tasks** **/** **workflow** | **Deterministic** **(mostly**); **stubs** in **social** | **Advisory** **“next** **task”** **from** **unified** **list** (FND-2) **+** **talent** (TALENT-*) **—** not **autonomous** **assignment** |
| **Comms** **support** | **`comms/ai.ts`** **draft/rewrite** **(staff**); **workbench** **actions** | **Same** **client** + **governance**; **no** **auto**-**send** |
| **Email** **workflow** | **Heuristics** **+** **metadata** **provenance** | **E-3** **policy** **hooks** in **`extension-points.ts`** may **call** **shared** **“brain”** **abstraction** (thin **wrapper** **,** not **a** **god** **class**) |
| **Position** **workbenches** | **N/A** **(ROLE-1** **is** **docs**)** | **Inbox** **+** **position** **hints** from **RAG+policies** **(future**)** |
| **Talent** **/** **training** | **Types** in **`talent.ts`**, **`IntakeClassification.leadershipPotential`** **(optional** **from** **forms**)** | **LLM** **for** **reason** **text** **only**; **no** **auto**-**promote** (TALENT-1) |
| **CM** **orchestration** | **Workbench** **cards** are **data**-**driven**; **AI** **=** **thread** **+** **email** **interpretation** **fragments** | **Aggregate** **“what** **to** **look** **at** **next**” **synthesis** (future) must **read** **from** **same** **rails** **,** not **replace** them |
| **Content** **/** **review** **/** **media** | **Ingest** **scripts** **(offline**); **refineMention** **on** **ingest** | **Assistant**-style **suggestions** **in** **review** **queue** **(future)**, **human** **approve** |
| **Analytics** | **stubs** **(social)**, **dashboards** **(non**-**LLM) **| **Narration** of **metric** **deltas** **(future)**, **grounded** in **data** **queries** |

---

## 5. Central brain vs local agents

**Centralize (single module family, already started):**

- **`src/lib/openai/client.ts`** + **`embeddings.ts`** + **`search.ts` **+** `prompts.ts` **—** **one** **governance** and **one** **retrieval** **stack** for **public** **assistant** and **(future)** **ops** **assist**.
- **Provenance** **pattern** (email **`metadataJson`**, **PR** to **add** for **comms** **AI** **if** not **present**).  
- **Rate** **limits** **on** **API** **routes** (`src/lib/rate-limit` **in** **search/assistant**).

**Local** to **domain** **(keep** **isolated** **implementations,** **common** **interfaces** **only** in **`campaign-engine`):

- **Heuristic** **vs** **future** **LLM** **email** **interpreter** **(E-2** **vs** **E-3)**.
- **Mention** **refine** (media) **,** **planning** **suggest**-**dates**—**separate** **prompts** **OK** as long as **they** use **`client`** and **log** **model** **id** **+** **version** **(pattern** **from** **email**).
- **Comms** **draft** **(tone-**shaped**)**—**keep** **review** before **send** **(policy**).  

---

## 6. Human governance boundaries (do not automate)

- Outbound send (SendGrid, Twilio, Gmail), broadcast approvals, Tier-2 comms.
- Voter/PII export; voter-file ingest to production.
- Role, position, promotion, discipline (TALENT-1).
- Final public messaging on Oppo+Compliance+Comms (per job matrix).
- Any override of queue-first email workflow policy (this handoff).

---

## 7. Build sequence (post BRAIN-1)

1. **BRAIN-2:** Provenance helper for comms thread AI (model, version, reason codes), aligned with email workflow (metadata on thread or separate audit row).
2. **BRAIN-3:** One shared RAG context builder; reuse `assistantPathTier` from `search.ts` for any ops SOP panel.
3. **E-3 (or joint packet):** Optional LLM in email interpreter, behind flag, same provenance as E-2.
4. **FND-2 + brain:** Advisory “open work / focus next” card on workbench, from unified list plus optional SOP RAG.

---

*Last updated: Packet BRAIN-1.*
