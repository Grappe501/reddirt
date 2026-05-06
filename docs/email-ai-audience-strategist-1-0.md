# EMAIL-AI-AUDIENCE-STRATEGIST-1.0

**Packet:** **EMAIL-AI-AUDIENCE-STRATEGIST-1.0**  
**Lane:** `RedDirt/` only  
**Companion:** [`email-ai-profile-intelligence-2-0.md`](./email-ai-profile-intelligence-2-0.md) · **EMAIL-AUDIENCE-STUDIO-1.0** (`audience-studio.ts`)

## Purpose

Deterministic helpers in **`src/lib/email-command-center/ai-audience-strategist.ts`** recommend audience criteria, message angles, risk posture, and suppression-adjacent notes from **approved Audience Studio building blocks** plus an operator-entered **campaign / message goal**. No OpenAI in this packet; no SendGrid; no queue sends.

## Surfaces

- **Audience Studio** — **AI Audience Strategist** panel: goal inputs, structured output, optional **Create draft audience (explicit submit)** using the existing `createDraftEmailAudienceDefinitionAction` (criteria JSON prefilled from the primary suggestion only).
- **Message Studio** — when **`?audienceDefinitionId=`** is present, a **strategist summary** card renders if the definition row loads (criteria summary + angles + risks + next step).

## Governance

- **No microtargeting** on protected / sensitive attributes — facts and clusters matching sensitive patterns are excluded or flagged.
- **No unsupported political claims** — opponent-heavy goals trigger governance copy; counsel/editorial still own claims.
- **Human approval required** — strategist does not activate audiences, sync SendGrid, or send mail.
- **Suppressions** — strategist text reminds operators to honor ESP suppressions and consent; it does not query suppression tables.

## Key exports

- `generateAudienceStrategyForGoal`, `suggestAudienceDefinitionsFromFacts`, `evaluateAudienceRiskAndUsefulness`, `suggestAudienceMessageAngles`, `detectAudienceTooBroadOrTooThin`, `buildAudienceSuppressionWarnings`, `recommendMicrotargetingClusters`
- `buildAudienceStrategySummaryForDefinition` → `MessageStudioAudienceStrategySummary` for Message Studio.
