# Message Engine — types and template registry (MCE foundation)

**Lane:** `H:\SOSWebsite\RedDirt`  
**Date:** 2026-04-27  
**Scope:** Typed foundation only — **no** auth changes, **no** database migrations or writes, **no** voter file access, **no** personalized targeting or fake voter data.

**Reads:** [`README.md`](../README.md) · [`MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`](./MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md) · [`src/lib/power-of-5/types.ts`](../src/lib/power-of-5/types.ts) · [`src/lib/campaign-engine/county-dashboards/types.ts`](../src/lib/campaign-engine/county-dashboards/types.ts)

---

## 1. Deliverables

| Path | Purpose |
|------|---------|
| [`src/lib/message-engine/types.ts`](../src/lib/message-engine/types.ts) | Taxonomy + domain records: template, context, recommendation, feedback, use events, outcomes, objection/story/follow-up snippets, safety levels. |
| [`src/lib/message-engine/templates.ts`](../src/lib/message-engine/templates.ts) | Starter registry + snippet arrays + lookup helpers for scripts. |
| [`src/lib/message-engine/index.ts`](../src/lib/message-engine/index.ts) | Barrel export (types, const unions, registry, helpers). |

---

## 2. Type map (system plan alignment)

| Type | Role |
|------|------|
| `MessagePatternKind` | Fine-grained pattern (conversation starter, bridge, local story, follow-up, invites, asks, GOTV, objection, listening). Matches plan §7. |
| `MessageCategory` | Starter-pack routing: Power of 5 onboarding, county organizing, volunteer recruitment, listening, follow-up, event, petition, GOTV, candidate recruitment. |
| `MessageTone` | Voice control (`warm`, `curious`, `humble`, `urgent_respectful`, `quiet_confidential`, …). |
| `MessageAudience` | Audience **posture** (plan §8) — not model segments. |
| `RelationshipType` | Conversation tuning (plan §9). Distinct from `RelationshipEdgeKind` in P5 graph types. |
| `MessageGeographyScope` | State → precinct scope for examples and compliance (plan §10). |
| `MessageSafetyLevel` | Governance: `public_volunteer` through `election_law_review_required`. |
| `MessageTemplate` | Versioned registry row with `body`, optional `bridge`, typed `slots`, optional `relatedPipelines` (`PowerPipelineId`). |
| `MessageContext` | Optional merge of audience, relationship, tone, display labels, optional `PowerGeographyAttachment` — **no voter ids**. |
| `MessageRecommendation` | Suggested `templateId` + rationale + alternates. |
| `MessageFeedback` | Self-reported / staff coarse `MessageResponseBucket` + optional `ConversationOutcome`. |
| `MessageUseEvent` | Telemetry shape: selected / copied / preview-sent — metadata must stay PII-free on public tiers. |
| `ConversationOutcome` | Follow-up and pipeline-friendly outcome tags (not a grade on a person). |
| `ObjectionResponse` | Grid-friendly objection label + response body. |
| `LocalStoryPrompt` | Place-based listening + bridge hint. |
| `FollowUpPrompt` | Short follow-up line + timing hint. |

---

## 3. Cross-reference: Power of 5 and county dashboards

- **P5:** `MessageContext` may embed `PowerGeographyAttachment` when upstream validation already applied. `MessageTemplate.relatedPipelines` references `PowerPipelineId` for future mission / dashboard wiring (invite, conversation, gotv, etc.).
- **County dashboard types:** KPI and relational bundles (`CountyDashboardPowerOfFiveKpis`, `PowerOf5RelationalChartBundle`) remain the **aggregate** dashboard layer; MCE supplies **language** for next actions — no merge of dashboard numbers into this module.

---

## 4. Starter template registry

Nine primary templates in `MESSAGE_STARTER_TEMPLATES` / `MESSAGE_TEMPLATE_REGISTRY`:

| ID (prefix) | Category | Notes |
|-------------|----------|--------|
| `mce.p5_onboarding.*` | `power_of_5_onboarding` | Listening-first circle invite. |
| `mce.county_organizing.*` | `county_organizing` | Place-based bridge; `{{county_name}}` slot. |
| `mce.volunteer.*` | `volunteer_recruitment` | Single shift, finite ask. |
| `mce.listening.*` | `listening_conversation` | Two-way openers. |
| `mce.followup.*` | `follow_up` | Grateful check-in + one ask. |
| `mce.event.*` | `event_invite` | RSVP path slots. |
| `mce.petition.*` | `petition_ask` | Mechanics + deadline — must stay compliance-true when filled. |
| `mce.gotv.*` | `gotv_ask` | **Tagged `election_law_review_required`**; points users to official sources, no fabricated rules. |
| `mce.candidate_recruit.*` | `candidate_recruitment_ask` | **`leader_visible`** tone; confidential-adjacent language. |

**Additional snippet arrays:** `MESSAGE_STARTER_OBJECTION_RESPONSES`, `MESSAGE_STARTER_LOCAL_STORY_PROMPTS`, `MESSAGE_STARTER_FOLLOW_UP_PROMPTS`.

---

## 5. Script helpers (exported)

- `getMessageTemplateById`, `listMessageTemplatesByCategory`, `listMessageTemplatesByAudience`, `listAllMessageTemplateIds`
- `assertUniqueMessageTemplateIds` — call in CI/scripts when extending the registry.

---

## 6. Guardrails (recap)

- No `VoterRecord` ids or match reasons in these types as **required** fields; public helpers should not accept them.
- Copy uses **placeholders** (`{{slot}}`) for organizer-supplied or approved static strings only.
- No microtargeting vocabulary in starter bodies (see plan §12 and language audit).

---

## 7. Follow-ups (out of scope here)

- MCE-2 style inventory: map pattern ids to `CommunicationPlan` / `CommunicationDraft` / `VolunteerAsk` (read-only audit).
- Zod (or similar) runtime validators if API boundaries need them.
- Admin UI and volunteer UI wiring.

---

**End of report.**
