# Email AI Brain Registry

**Packet:** **EMAIL-AI-BRAIN-REGISTRY-1.0**  
**Lane:** `RedDirt/` only  
**Code:** `src/lib/email-command-center/ai-brain-registry.ts`  
**Version constant:** `AI_BRAIN_REGISTRY_VERSION` (`ai-brain-registry-v1`)

## Purpose

Centralize **campaign doctrine**, **source grounding**, **safety**, **advisory posture**, and **output contracts** so Message Studio draft AI and email queue analysis share one brain — without implying live **SearchChunk** retrieval where none exists.

## Roles (`AiRoleId`)

| Role id | When used in code today |
|---------|-------------------------|
| `campaignCommsDirector` | Message Studio `message-draft-ai.ts` system preamble |
| `dataIntelligenceAnalyst` | Email queue `runEmailWorkflowAiAnalysis` (`analyzer.ts`) |
| `fieldOrganizer` | Reserved for volunteer-heavy prompts / future routing |
| `complianceReviewer` | Reserved for finance/suppression-heavy assists |
| `editorialReviewer` | Reserved for claim/source review assists |
| `schedulerTaskPlannerFuture` | **Reserved** — not for autonomous scheduling until a future packet |
| `donorCommsReviewer` | Reserved for donor-facing revision modes |
| `pressCommsReviewer` | Reserved for press-facing revision modes |

Use `getAiRoleDefinition(role)` for title, mission, tone, boundaries, and routing hints.

## Doctrine blocks (readonly arrays)

- **`sharedCampaignPrinciples`** — Kelly SOS values and comms posture.
- **`sourceGroundingRules`** — no fake RAG; distinguish source-backed vs suggested language; Gmail metadata honesty.
- **`uncertaintyRules`** — label gaps; avoid plausible invention.
- **`prohibitedClaims`** — stats, matching funds, unsourced attacks, delivery claims, etc.
- **`outputQualityStandards`** — JSON discipline, bounded arrays, plain language.
- **`escalationRules`** — when to suggest human roles (not automation).
- **`advisoryOnlyRules`** — no send, no queue mutation, no profile merge from model text.
- **`humanApprovalRules`** — externalization and staged suggestions require humans.
- **`noSendRules`** — SendGrid/Gmail/worker send prohibition language.

## Helper API

| Function | Returns |
|----------|---------|
| `getAiRoleDefinition(role)` | `AiRoleDefinition` |
| `getSharedAiSystemRules()` | Newline string (principles + advisory + human approval + no-send) |
| `getSourceGroundingRules()` | Newline string |
| `getUncertaintyRules()` | Newline string |
| `getEmailAiOutputContract(kind)` | `messageStudioDraft` \| `emailQueueAnalysis` contract text |
| `getAiRiskEscalationRules()` | Newline string |
| `buildAiSystemPromptForRole(role, context?)` | Bounded system preamble for OpenAI `system` messages |

`buildAiSystemPromptForRole` accepts optional `modeDescription` and `extraOperatorNotes` (clipped) for caller-specific context.

## Wiring (this packet)

- **`message-draft-ai.ts`** — prepends `buildAiSystemPromptForRole("campaignCommsDirector", …)` + `getEmailAiOutputContract("messageStudioDraft")` before legacy drafting discipline lines.
- **`email-workflow/ai/analyzer.ts`** — prepends `buildAiSystemPromptForRole("dataIntelligenceAnalyst", …)` + `getEmailAiOutputContract("emailQueueAnalysis")` before queue JSON discipline.
- **`email-workflow/ai/config.ts`** — `getEmailAiPolicySummary()` includes `AI_BRAIN_REGISTRY_VERSION` pointer for operators.

## Non-goals (explicit)

- **No DB migration** — doctrine is code + docs only.
- **No SearchChunk retrieval** added by this packet.
- **No send paths** — registry reinforces no-send doctrine only.

## Related docs

- [`email-ai-intelligence-architecture-audit.md`](./email-ai-intelligence-architecture-audit.md) — full path inventory  
- [`email-ai-source-grounding-ledger.md`](./email-ai-source-grounding-ledger.md) — Message Studio evidence ledger + structured advisory buckets (**EMAIL-AI-SOURCE-GROUNDING-LEDGER-1.0**)  
- [`email-ai-task-intelligence-1-0.md`](./email-ai-task-intelligence-1-0.md) — queue **AI Task Intelligence** + `emailTaskIntelligence` contract (**EMAIL-AI-TASK-INTELLIGENCE-1.0**)  
- [`email-ai-profile-intelligence-2-0.md`](./email-ai-profile-intelligence-2-0.md) — queue **AI Profile Intelligence 2.0** + evidence staging metadata (**EMAIL-AI-PROFILE-INTELLIGENCE-2.0**)  
- [`email-ai-audience-strategist-1-0.md`](./email-ai-audience-strategist-1-0.md) — **AI Audience Strategist** over approved facts + goals (**EMAIL-AI-AUDIENCE-STRATEGIST-1.0**)  
- [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md) — layer scores  
- [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) — email OS context  

---

**Status:** **EMAIL-AI-BRAIN-REGISTRY-1.0** shipped as registry + wiring + this doc; extend roles in code when new surfaces adopt `buildAiSystemPromptForRole`.
