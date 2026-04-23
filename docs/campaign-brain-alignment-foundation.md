# Campaign brain alignment — foundation (RedDirt)

**Packet ALIGN-1** defines how the **digital Campaign Manager brain** stays intentionally aligned with mission, culture, goals, and operating posture—as governed inputs, not emergent model behavior. It is not a substitute for human decision on sends, PII, compliance, or seats (see `HumanGovernanceBoundary` in `ai-brain.ts` and [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)). This packet is documentation and types only; it adds no new automation.

**Cross-ref:** [`automation-override-and-impact-foundation.md`](./automation-override-and-impact-foundation.md) · [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) · [`ai-agent-brain-map.md`](./ai-agent-brain-map.md) · `src/lib/openai/prompts.ts` · `src/lib/campaign-engine/alignment.ts`

---

## 1. North star

- **Deliberate alignment:** Vision, voice, and red lines are authored or curated by the campaign (Campaign Manager accountability) and injected into model context as versioned layers—not left to the base model’s defaults.
- **Governable and updateable:** Alignment sources (see §2) change with strategy; each change should be attributable (who, when, which version of the layer).
- **Alignment is not permission to act:** Correct tone and factual grounding do not override queue-first email policy, send approval, or TALENT-1 human-finality on advancement—governance rails are orthogonal to narrative alignment.

---

## 2. Alignment sources (categories + repo evidence)

| Category | What it is | Repo evidence (today) | Gap |
|----------|------------|------------------------|-----|
| Mission / vision | Why the campaign exists | RAG corpus: `SearchChunk` after `npm run ingest`; `src/lib/content/fullSiteSearchChunks.ts` and `src/content/background/*` (e.g. `strategic-messaging-trust-reform.ts`); “represent a statewide campaign” in `RAG_ANSWER_SYSTEM_PROMPT` (`src/lib/openai/prompts.ts`) | No single `AlignmentRegistry` table |
| Philosophy / principles | Non-negotiable values | `prompts.ts` hard rules (e.g. no break law, no invent deadlines); `docs/philosophy/*` (brand copy; not in RAG unless ingested) | Philosophy not in `SearchChunk` unless ingest includes those docs |
| Campaign goals / priorities | What we optimize for in messaging | `ASSISTANT_TOOLS_SYSTEM_SUPPLEMENT` and `get_office_priorities_summary`; `OFFICE_PRIORITIES_TEXT` in `tools.ts` | Duplication risk vs live public pages |
| Voice / tone | How we sound | `ASSISTANT_SYSTEM_PROMPT`, `SEARCH_DIALOG_GUIDE_PROMPT`, `RAG_ANSWER_SYSTEM_PROMPT`; intake `INTAKE_CLASSIFIER_PROMPT` | Comms draft in `comms/ai.ts` uses separate shorter system strings |
| Issue / policy stance | What we will claim in public | RAG chunks + tool allowlists; “never invent” in major prompts | Oppo+compliance remains human (job definitions) |
| CM strategic preferences | How we run *this* race (non-public ops) | Heuristic email and workbench behavior spread across code; not one file; candidate for `brief:`-tagged `SearchChunk` or internal `docs/` | Not yet a named layer |
| Operating rules / red lines | Queue-first, consent, PII | [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md); `ASSISTANT_DATA_GOVERNANCE_SUPPLEMENT` in `prompts.ts` (if present); `HumanGovernanceBoundary` in `ai-brain.ts` | Red lines duplicated across prompts—consolidation target for ALIGN-2 |
| Escalation posture | When to hand to human or director | `EmailWorkflowEscalationLevel` in schema; tool text (e.g. press → `get_public_contact_info`) | No unified “escalation RAG” yet |
| Department guidance | Field vs comms SOPs | [`workbench-job-definitions.md`](./workbench-job-definitions.md) (human-written); DNC/volunteer chunks in `SearchChunk` if ingested | RAG retrieval only; no per-position mask in code until RBAC+masking (future) |

**Principle:** `prompts.ts` is the most concentrated static alignment for the model; `SearchChunk` is the evidence base; `metadataJson` email provenance (E-2) is triage alignment (“what the interpreter did”). All three should eventually reference a shared version or source id (not in ALIGN-1).

---

## 3. Alignment assembly model (layering, not one blob)

Order of composition (conceptual; a future builder assembles in code):

1. **Global campaign alignment** — Identity (candidate/office), value lines, global tone (from `prompts` plus “constitution” chunk set when defined).
2. **System area / touchpoint** — `CampaignBrainTouchpoint` in `ai-brain.ts`: public search vs email queue vs comms differ in red-line emphasis (e.g. public: no PII; ops: no unsupervised send).
3. **Position / workbench** (future; RBAC off in ALIGN-1) — Omit or de-emphasize SOPs outside the role; include position-relevant snippets from RAG (e.g. tagged `brief:field/…`).
4. **User / person** — TALENT-1 signals as narrative addenda (reading level, not a hidden score); see [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md).
5. **Current object** — Thread text, `EmailWorkflowItem` row, `SearchChunk` hit list (existing pattern in `/api/assistant` and E-2 context).

This is **context layering** (structured prefixes and slices), not dumping all markdown into one system string.

---

## 4. What must be versioned (future requirement)

- `prompts.ts` (or extracted modules): Git + PR review is already a form of versioning; for ops, consider frozen snapshots per release (ALIGN-2).
- Ingest batches: `MediaIngestBatch` and ingest scripts already tag some sources (see `ingest-campaign-brain`); RAG answers should cite batch or content id when we add stability (BRAIN-2+).
- Email interpretation: `metadataJson.emailWorkflowInterpretation` already has `version`, `engineId` (E-2B handoff).
- Alignment layer ids: `AlignmentSourceKind` + `CampaignAlignmentLayer` in `alignment.ts` (scaffolding for audit hooks).

---

## 5. Human governance on alignment

- Campaign Manager (or delegate with a defined title) authorizes changes to the “campaign constitution” (public voice + red lines) and internal SOP RAG when messaging risk is affected.
- Compliance + comms sign-off for Oppo+legal–sensitive wording in any new prompt block.
- Engineering-only changes to wiring (how layers assemble) do not change wording without CM or a designated content owner.
- No silent auto-update of prompt text from model output; only from reviewed PR or admin CMS tied to a version (future).

---

## 6. Build sequence (post ALIGN-1)

1. **ALIGN-2** — Single module (or doc + types) listing alignment layer ids and which prompts/chunks they map to (refactor, no behavior change by itself).
2. **ALIGN-3** — Optional Postgres `CampaignAlignmentVersion` (id, name, `promptHash` / `ingestBatchId` refs) for audit.
3. **OVR-1** (with override doc) — append-only `AutomationOverrideEvent` + UI to add optional reason.
4. **User-scoped masking** (with user-context doc) — when RBAC and position seating exist, filter RAG by `AlignmentSourceKind` + position.

---

*Last updated: Packet ALIGN-1.*
