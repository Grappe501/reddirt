# EMAIL-AI-PROFILE-INTELLIGENCE-2.0

**Packet:** **EMAIL-AI-PROFILE-INTELLIGENCE-2.0**  
**Lane:** `RedDirt/` only  
**Companion:** [`email-ai-brain-registry.md`](./email-ai-brain-registry.md) · [`email-ai-intelligence-architecture-audit.md`](./email-ai-intelligence-architecture-audit.md) · **EMAIL-CONTACT-PROFILE-GRAPH-1.0**

## Purpose

Deterministic helpers (`src/lib/email-command-center/ai-profile-intelligence.ts`) turn **queue triage fields** plus **stored** `metadataJson.emailAiAnalysis.output` into **evidence-labeled** profile fact and audience hint suggestions. Staging still flows through **`profile-graph.ts`** → `EmailContactProfileFactSuggestion` / `EmailAudienceHint` with **`suggestionType` / `hintType` = `EMAIL_AI_PROFILE_INTEL_2`** and `metadataJson.profileIntelligenceV2` / `audienceIntelligenceV2`.

## Governance (non-negotiable)

- **No auto-approve** of profile facts or hints.
- **No inference** of protected characteristics; regex guard downgrades risky AI lines to compliance rows with `shouldNotStoreReason`.
- **No SendGrid segments** and **no sends** from this path.
- **Sensitive attributes** require explicit operator approval after human verification; rows may carry **`shouldNotStoreReason`** — treat as **do not store** until counsel/ops rewrites.

## Operator UI

- **Profile review:** `/admin/workbench/email-command-center/profiles` — grouped suggestions, evidence, “why suggested”, do-not-store warnings, filter chips.
- **Queue item:** Contact / Profile panel shows a **live preview** (recomputed, not DB) of the same suggestion family before/after staging.

## Key exports

- `analyzeQueueItemForProfileSignals`, `suggestProfileFactsWithEvidence`, `suggestAudienceHintsWithEvidence`
- Classifiers: `classifyRelationshipType`, `classifyIssueInterest`, `classifyVolunteerPotential`, `classifyDonorPotentialCarefully`, `detectDoNotContactOrSuppressionRisk`, `buildProfileConfidenceScore`
- Metadata builders: `buildProfileIntelligenceV2Metadata`, `buildAudienceIntelligenceV2Metadata`, `buildQueueItemProfileContextFromRow`
- Parsers for staged JSON: `parseProfileIntelligenceV2FromSuggestionMetadata`, `parseAudienceIntelligenceV2FromHintMetadata`
- `getStoredEmailAiOutputFromMetadata` in **`profile-graph.ts`** — reads persisted queue AI without calling OpenAI.

## Suggestion row shape (conceptual)

Each staged fact aligns with: `suggestedFact` (stored as `factValue`), `factType`, `confidence`, `evidenceText`, `sourceType`, `riskLevel`, `needsHumanReview`, optional `shouldNotStoreReason`, plus operator copy in `whySuggested` (mirrored into DB `rationale` / `metadataJson`).
