# Message Engine & Narrative Distribution — final audit and stabilization report

**Lane:** `H:\SOSWebsite\RedDirt`  
**Date:** 2026-04-27  
**Classification:** Stabilization snapshot after sequential MCE/NDE implementation packets (types, registry, recommendation engine, feedback helpers, personal panel, dashboard intelligence, voter/contact admin tools, narrative types + demo registry, packet builder, public member hub, admin command center, cross-system integration).  
**Quality gate:** `npm run check` (lint + `tsc --noEmit` + `next build`) — run from `RedDirt/` before release; executed in audit session with exit code 0 (re-run locally if logs are needed).

---

## 1. Protocol read-in (this audit)

| Item | Status |
|------|--------|
| `README.md` | Read — lane context, `npm run check`, doc index |
| Message Engine & Narrative Distribution docs/reports | Read — system plans, integration reports, types/recommendation/personal/feedback/voter-profile reports, narrative public hub + admin command + packet builder + types + POWER5 integration + language audit |
| “Scripts 1–14” / build packets | Interpreted as the **documented sequential packets** in `MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md` (MCE-1…MCE-8 + Script 3 scaffold) and `NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md` (NDE-1…NDE-8 + Script 10 scaffold), plus the **implementation reports** that landed in `src/` (see §3–§6). Repo implementation consolidated under `src/lib/message-engine/` (not the plan’s hypothetical `message-content-engine/` path). |
| Public “AI” language grep | Re-run §7 |

---

## 2. Executive summary

The **Message Content Engine (MCE)** and **Narrative Distribution Engine (NDE)** are implemented as **deterministic, registry-first** TypeScript modules plus **React surfaces** on public organizing pages, volunteer dashboards, onboarding, and a **read-only admin narrative prototype**. There is **no** automated publishing, **no** voter identifiers on public helpers, and **no** live telemetry replacing demo payloads on OIS/region/county dashboards.

**Stabilization posture:** Safe for demos and IA wiring; **unsafe** to treat demo numbers, MOTW copy, or admin KPI strips as operational truth until COMMS/REL/P5 data feeds connect.

---

## 3. Routes created or materially integrated

### Public / volunteer (`(site)` and adjacent)

| Route | Role |
|-------|------|
| `/messages` | Public **message hub** — `buildPublicMemberHubModel()` + `NarrativeMemberHubView` |
| `/dashboard` | **Personal** Power of 5 dashboard — `PersonalDashboardView` + `WhatToSayPanel` + `MessageHubLinkCard` |
| `/dashboard/leader` | **Leader** rollup — `PowerOf5LeaderDashboardView` + `MessageHubLinkCard` |
| `/onboarding/power-of-5` | P5 flow — `WhatToSayPanel` (compact), `MessageHubLinkCard`, preview grid rows |
| `/organizing-intelligence` | State OIS — `MessageIntelligencePanel` + `NarrativeDistributionSummaryPanel` |
| `/organizing-intelligence/regions/*` | Region dashboards — `RegionDashboardView` embeds `MessageIntelligencePanel` |
| `/organizing-intelligence/counties/[countySlug]` | **County OIS placeholder** — static shell; links to `/counties/[slug]` and Pope v2 |
| `/county-briefings/pope/v2` | Gold-sample county — `MessageIntelligencePanel` + `MessageHubLinkCard` |

### Admin (gated)

| Route | Role |
|-------|------|
| `/admin/narrative-distribution` | `requireAdminPage` + `AdminBoardShell` + `NarrativeDistributionCommandCenter` (demo registry) |
| `/admin/organizing-intelligence` | Operator **placeholder** hub — links only; no NDE execution |
| `/admin/relational-contacts/[id]` | REL-2 profile — `AdminProfileConversationToolsSection` |
| `/admin/voters/[id]/model` | Voter model (read-only staff) — same conversation tools block |

**Navigation:** `AdminBoardShell` includes **Narrative distribution** and **Organizing intelligence (OIS)** under Campaign operations.

---

## 4. Components created

### Message Engine (`src/components/message-engine/`)

| Component | Role |
|-----------|------|
| `WhatToSayPanel` | Volunteer **Conversation Tools** — starters, follow-ups, local story, context controls |
| `MessageCard` | Presentational template card |
| `MessageContextControls` | Audience / relationship / mission / place (display-only narrowing) |
| `MessageIntelligencePanel` | Composed **state/region/county** intelligence section |
| `MessagePerformancePreview` | Themes, categories, pipeline movement (demo) |
| `NarrativeGapPanel` | Gaps, suggested MOTW, follow-up table (demo) |
| `ConversationOutcomeDemo` | Demo UI for outcomes (exported; **not** mounted on a public route in current tree) |
| `AdminProfileConversationToolsSection` | Staff **Conversation Tools** on voter/contact profiles |

### Narrative Distribution — public (`src/components/narrative-distribution/public/`)

| Component | Role |
|-----------|------|
| `NarrativeMemberHubView` | Full **message hub** layout (MOTW, counties, P5 prompts, share packets, listening) |

### Narrative Distribution — admin (`src/components/narrative-distribution/admin/`)

| Component | Role |
|-----------|------|
| `NarrativeDistributionCommandCenter` | Composes KPI strip, queue, pipeline, county/region lists, channels, editorial board, feedback |
| `NarrativeAdminSection` | Section header pattern |
| `NarrativeAdminKpiStrip` | KPI cards |
| `NarrativeAmplificationQueue` | Queue table |
| `NarrativeStoryPipeline` | Intake list |
| `NarrativeCountyPacketList` | County table |
| `NarrativeRegionPacketList` | Region table |
| `NarrativeChannelReadinessGrid` | Channel cards |
| `NarrativeEditorialStatusBoard` | Status columns |
| `NarrativeFeedbackNeedsPanel` | Feedback list |
| `PowerOf5LaunchIntegrationPanel` | Admin **P5 × MCE × NDE** cross-links |

### Cross-cutting integrations (`src/components/integrations/`)

| Component | Role |
|-----------|------|
| `MessageHubLinkCard` | CTA card to `/messages` |
| `NarrativeDistributionSummaryPanel` | Server-safe OIS **narrative shelf** excerpt + link to hub |

---

## 5. Types created (canonical modules)

### `src/lib/message-engine/types.ts`

Core taxonomy: `MessagePatternKind`, `MessageCategory`, `MessageTone`, `MessageAudience`, `RelationshipType`, `MessageGeographyScope`, `MessageSafetyLevel`, `MessageTemplate`, `MessageContext`, `MessageRecommendation`, `MessageFeedback`, `MessageUseEvent`, `ConversationOutcome`, `ObjectionResponse`, `LocalStoryPrompt`, `FollowUpPrompt`, `RecommendedMessage`, and related const arrays (`MESSAGE_CATEGORIES`, `CONVERSATION_OUTCOMES`, …).

### `src/lib/narrative-distribution/types.ts`

NDE shapes: `NarrativeChannel`, `NarrativeAssetKind`, `NarrativeAsset`, `NarrativePacket`, `EditorialStatus`, geography plans (`CountyNarrativePlan`, `RegionNarrativePlan`), `NarrativeCalendarItem`, `StoryIntake`, `AmplificationQueueItem`, `MessageToNarrativeBridge`, etc.

### Packet builder surface types (`packet-builder.ts`)

`NarrativeDistributionPacket`, `NarrativePacketBuildContext` — **view models** for UI, not DB tables.

### Public hub model (`public-member-hub.ts`)

`PublicMemberHubModel` and nested types (`PublicMemberHubMessageOfWeek`, `PublicMemberHubCountyCard`, `PublicMemberHubSharePacket`, …).

### Admin command center model (`demo-admin-command-center.ts`)

`NarrativeAdminCommandCenterModel`, `NarrativeAdminKpi`, `ChannelReadinessDemo`, `FeedbackNeedDemo`.

### Message intelligence dashboard (`message-intelligence-dashboard.ts`)

`MessageIntelligenceScope`, demo DTOs for `getMessageIntelligenceDemoModel()`.

### Admin profile tools (`admin-profile-conversation-tools.ts`)

`AdminProfileConversationToolsPayload` and builder output types.

### REL → MCE bridge (`src/lib/campaign-engine/relational-message-context.ts`)

Staff-facing mapping types/functions from REL-2 enums to message `RelationshipType` (see voter profile integration report).

---

## 6. Helpers / libraries created

| Path | Role |
|------|------|
| `src/lib/message-engine/templates.ts` | `MESSAGE_TEMPLATE_REGISTRY`, lookups, starter prompt arrays |
| `src/lib/message-engine/recommendations.ts` | Deterministic filter + rank + packs (`getMessageRecommendations`, `getConversationStarterSet`, …) |
| `src/lib/message-engine/feedback.ts` | `createMessageUseEvent`, `summarizeMessageFeedback`, `calculateMessageCategoryMovement`, `getFollowUpNeeds`, pipeline hints |
| `src/lib/message-engine/message-intelligence-dashboard.ts` | `getMessageIntelligenceDemoModel` |
| `src/lib/message-engine/admin-profile-conversation-tools.ts` | `buildAdminProfileConversationToolsPayload` |
| `src/lib/narrative-distribution/assets.ts` | `DEMO_NARRATIVE_*`, bridges, invariant assert |
| `src/lib/narrative-distribution/packet-builder.ts` | `buildNarrativePacket`, `getCountyNarrativePacket`, `getRegionNarrativePacket`, `getPowerOf5LaunchPacket`, bridge from MCE templates |
| `src/lib/narrative-distribution/public-member-hub.ts` | `buildPublicMemberHubModel`, `STATIC_MESSAGE_OF_WEEK` |
| `src/lib/narrative-distribution/demo-admin-command-center.ts` | `buildNarrativeAdminCommandCenterModel` |
| `src/lib/campaign-engine/relational-message-context.ts` | REL-2 → conversation context helpers |
| `scripts/message-recommendation-engine-self-check.ts` | Dev invariant check for recommendation engine |

---

## 7. Public language audit status

**Reference:** `docs/MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md` (2026-04-27).

**Regression grep (this audit):** Under `src/app/(site)/**`, no matches for public marketing patterns `\bAI\b`, `OpenAI`, `ai-powered`, or `Artificial Intelligence` in user-visible copy paths sampled via search.

**Caveats (unchanged from language audit):**

- **API JSON keys:** e.g. `/api/search` and client status may still expose `openai: boolean` for **semantic index** capability — not the word “AI” in UI strings, but technically identifies the integration.
- **Model-generated text:** Search/assistant answer bodies can still contain the word “AI” depending on model behavior; prompts were out of scope for the copy pass.
- **Staff-only UI:** `src/components/admin/**` still contains “AI draft”, calendar “AI briefing”, social analytics placeholders, etc. — **intentionally** excluded from the public vocabulary pass; future optional admin alignment per language audit §5.

**Narrative/MCE UI copy:** Message hub, OIS panels, and What to Say use **conversation tools**, **message support**, **demo/seed** badges — consistent with the audit.

---

## 8. Integration with Power of 5

| Integration point | Status |
|-------------------|--------|
| Onboarding | Screen 5 **What to Say**; completion **Message hub** card; MOTW/shelf language tied to P5 copy in hub model |
| Personal dashboard | Pipeline viz, gamification, **What to Say**, **Message hub** card, **MyTasksPanel** (missions framing) |
| Leader dashboard | Demo rollup + **Message hub** card after pipeline visualization |
| Hub model | `POWER_OF_5_ORGANIZING_PIPELINES` / P5 prompts in `buildPublicMemberHubModel()` |
| Admin narrative | `PowerOf5LaunchIntegrationPanel` + `getPowerOf5LaunchPacket()` |
| Template registry | `MessageTemplate.relatedPipelines` / categories align with P5 invite → conversation → GOTV language |

**Gap:** No authenticated roster, no real mission assignment, no write-back of “message used” or outcomes to Postgres.

---

## 9. Dashboard integration status

| Surface | Message Engine | Narrative distribution |
|---------|----------------|------------------------|
| State OIS | `MessageIntelligencePanel` (`scope: state`) | `NarrativeDistributionSummaryPanel` |
| Region OIS (8 pages) | `MessageIntelligencePanel` (`scope: region`) | Indirect via hub + packet builders (no per-region NDE panel on every page) |
| County (Pope v2 sample) | `MessageIntelligencePanel` + hub link | Hub cards / county packets in `/messages` for select slugs |
| County OIS stub | None (placeholder route only) | Links only |
| Personal `/dashboard` | `WhatToSayPanel` + hub card | Hub is separate route |
| Leader `/dashboard/leader` | Hub card | Same |
| Admin narrative | N/A | Full command center (demo) |

---

## 10. What is demo / preview only

- **All** `getMessageIntelligenceDemoModel()` figures and labels on public dashboards.
- **All** `buildNarrativeAdminCommandCenterModel()` KPIs, queues, pipelines, readiness, editorial columns.
- **Message of the week** and most **share packet** copy in `buildPublicMemberHubModel()` (`STATIC_MESSAGE_OF_WEEK`, checklist excerpts).
- **County cards** on `/messages` for demo slugs (`pope`, `washington`, `jefferson`) via `getCountyNarrativePacket`; other counties get **generic** packet views in builders without DB.
- **Personal and leader dashboards** — explicit **Demo mode** banners; synthetic names and counts.
- **`/dashboard` and `/dashboard/leader`** — public routes without session (any visitor can view).
- **Admin narrative page** — labeled prototype; **not** a publish or send surface.

---

## 11. What needs real data

| Need | Target source (conceptual) |
|------|---------------------------|
| Message performance, themes, category mix | Aggregate conversation / send / engagement events (privacy-preserving) |
| Narrative gaps & MOTW | Editorial workflow + approved weekly narrative record |
| Amplification queue & story pipeline | `CommunicationPlan` / `WorkflowIntake` / social items — COMMS-UNIFY-1 rails |
| Channel readiness | Per-channel send/post state + compliance flags |
| County/region packet tables | CMS + plan metadata + geography-scoped approvals |
| MOTW on public hub | Approved CMS or plan field — replace `STATIC_MESSAGE_OF_WEEK` |
| Feedback loop | Persist `MessageUseEvent` / outcomes (REL-2, tasks) with RBAC |
| Dashboard auth | Sessions + P5 roster scopes for `/dashboard*` |

---

## 12. Privacy risks

| Risk | Mitigation today | Residual |
|------|------------------|----------|
| Voter / contact PII on public routes | No voter ids in MCE/NDE public builders; geography is slugs + display | Future APIs must not accept raw voter keys on volunteer tiers |
| Over-sharing on staff profiles | Conversation tools use **leader** tier templates; copy warns against dossier framing | Staff could misuse snippets; training + logging |
| Metadata leakage in `MessageUseEvent` | `createMessageUseEvent` strips sensitive key patterns | Caller misuse or new key names |
| Search / assistant | Semantic search may surface ingested content; separate RAG governance | Prompt + corpus review |
| Public dashboards | Aggregate-only policy in reports; demo data is synthetic | Live data must stay aggregate |

---

## 13. Content governance risks

| Risk | Notes |
|------|--------|
| **Misinformation** | Demo copy must not be quoted as fact; live MOTW needs sourcing discipline per NDE plan §9 |
| **Impersonation** | Community-leader and local-voice tracks need opt-in and attribution when real |
| **Unreviewed “official” tone** | Templates look authoritative; finance/election-law categories require counsel workflow |
| **Slug / URL drift** | County cards use short slugs; county briefings may use different paths — harmonize before scaling |
| **Staff “AI” tooling** | Workbench/social/calendar AI labels may confuse staff about what is automated vs approved |
| **No write path** | Reduces blast radius now; future sends must stay on governed workbench rails |

---

## 14. Next 10 website upgrade passes

See companion doc: [`docs/WEBSITE_UPGRADE_PASSES_AFTER_MESSAGE_SYSTEM.md`](../WEBSITE_UPGRADE_PASSES_AFTER_MESSAGE_SYSTEM.md).

---

## 15. Artifact index (reports merged into this audit)

- `docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`
- `docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md`
- `docs/MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md`
- `docs/MESSAGE_ENGINE_TYPES_AND_TEMPLATE_REGISTRY_REPORT.md`
- `docs/MESSAGE_RECOMMENDATION_ENGINE_REPORT.md`
- `docs/MESSAGE_ENGINE_PERSONAL_PANEL_REPORT.md`
- `docs/MESSAGE_ENGINE_FEEDBACK_LOOP_REPORT.md`
- `docs/MESSAGE_ENGINE_DASHBOARD_INTEGRATION_REPORT.md`
- `docs/MESSAGE_ENGINE_VOTER_PROFILE_INTEGRATION_REPORT.md` (+ PLAN)
- `docs/NARRATIVE_DISTRIBUTION_TYPES_REPORT.md`
- `docs/NARRATIVE_PACKET_BUILDER_REPORT.md`
- `docs/NARRATIVE_PUBLIC_MEMBER_HUB_REPORT.md`
- `docs/NARRATIVE_ADMIN_COMMAND_CENTER_REPORT.md`
- `docs/POWER5_MESSAGE_NARRATIVE_INTEGRATION_REPORT.md`
- `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md` (dashboard shell context)

---

**End of audit.**
