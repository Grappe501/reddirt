# Communications unification — foundation (COMMS-UNIFY-1) (RedDirt)

**COMMS-UNIFY-1** is a **map** of **how many communication products** already coexist and how a **single orchestration *concept*** — **one campaign message, many channels, one governance story** — can sit **above** them **without** replacing working code in one packet.

**Evidence:** `prisma/schema.prisma` · `src/lib/comms/*` · `src/lib/comms-workbench/*` · `src/lib/social/*` · `src/lib/conversation-monitoring/*` · admin routes under `src/app/admin/(board)/workbench/*`

**Cross-ref:** [`message-workbench-analysis.md`](./message-workbench-analysis.md) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md)

---

## 1. North star (conceptual)

| Layer | Role |
|-------|------|
| **Intent / message** | **What** we are trying to say (one **plan** or **campaign** narrative — human-owned). |
| **Targeting input** | **Who** it is for: segments, lists, county context, **optional** `VoterRecord` via **`User`**, consent flags — **varies by rail**. |
| **Execution output** | **What actually went out** per channel: **messages**, **sends**, **posts**, **provider ids** — **append-only** truth from vendors where wired. |

The repo **does not** have one `UnifiedMessage` table; **COMMS-UNIFY-1** names **convergence points** (FKs, `metadataJson`, shared **`User`**) **instead of** pretending one table already exists.

---

## 2. Channel map (what exists)

| Channel / surface | Primary models (examples) | Notes |
|-------------------|---------------------------|--------|
| **Email (1:1 / thread)** | `CommunicationThread`, `CommunicationMessage` (`CommsSendProvider` includes **GMAIL** for staff mail) | Tier 1 **conversational**; **not** the same as broadcast |
| **Email (broadcast / bulk)** | `CommunicationCampaign`, `CommunicationTemplate`, `AudienceSegment`, `CommunicationCampaignRecipient` | Tier 2; SendGrid path in product history |
| **SMS** | `CommunicationThread` / `CommunicationMessage` (`CommunicationChannel.SMS`), Twilio on provider side | **Consent** via `ContactPreference` |
| **Comms workbench (planned sends)** | `CommunicationPlan` → `CommunicationDraft` → `CommunicationVariant` → `CommunicationSend` → `CommunicationRecipient` (+ `CommunicationRecipientEvent`) | **Ops** layer: **objective** enum (`CommunicationObjective`), **multi-channel** via **drafts** (email/sms/notice/scripts/talking points) |
| **Social (outbound post work)** | `SocialContentItem`, `SocialPlatformVariant`, `SocialAccount` | Publishes to networks; **not** 1:1 DMs in this schema |
| **Inbound social / UGC (listen)** | `ConversationItem` / `ConversationCluster` / `ConversationOpportunity` | Drives **intakes** and **social** work items; **not** “send” |
| **Content hub (site / feeds)** | `InboundContentItem`, `ContentDecision`, `PlatformConnection` | **Earned/owned** **content** routing to site, **not** person-to-person comms |
| **Earned media / press tracking** | `MediaOutreachItem` | Links to **`CommunicationPlan`**, **`WorkflowIntake`**, **`ConversationOpportunity`** |
| **Email workflow (triage, not send-all)** | `EmailWorkflowItem` | **Queue-first**; links **threads**, **plans**, **sends**, **opportunities**, **social** — **orchestration hub** in *review* space |

**Internal / staff coordination:** `CommunicationObjective` includes **`INTERNAL_COORDINATION`**; `CommsWorkbenchChannel` includes **`INTERNAL_NOTICE`**, **`TALKING_POINTS`**, **`PHONE_SCRIPT`** on drafts.

---

## 3. “Single message → multiple channels” (how close the repo gets)

- **`CommunicationPlan`** is the **strongest** “one **intent**” object: one **title**, **`objective`**, **`summary`**, optional **provenance** (`sourceSocialContentItem`, `sourceEvent`, `sourceWorkflowIntake`, …).
- Under it, **multiple** `CommunicationDraft` rows (each has **`CommsWorkbenchChannel`**) = **one plan**, **many** channel-specific bodies.
- **`CommunicationVariant`** can segment (**`targetSegmentId` / `targetSegmentLabel` — opaque in schema comments**) or hold copy/channel overrides.
- **`CommunicationSend`** is **per** **draft/variant** + **channel** execution unit with **recipient** rows.

**Duplication to acknowledge:**

- **Tier 2** `CommunicationCampaign` is a **parallel** broadcast system to **Comms workbench** sends — both can email/SMS at high level; **unification** means **naming** when to use which and **linking** in UI/metadata — **not** done in one DB merge in COMMS-UNIFY-1.

- **1:1** `CommunicationMessage` is **not** the same row type as `CommunicationSend` — **unification** is **conceptual** (same **contact**, same **`User`**) and **E-1** links **workflow items** to **sends** when staff wire them.

---

## 4. Targeting layer input (reality)

| Source | What it provides |
|--------|------------------|
| **`AudienceSegment`** (Tier 2) | `definitionJson` + optional **`estimatedCount`** — **not** schema-validated as voter SQL |
| **`CommsPlanAudienceSegment`** + **members** | `User` / `VolunteerProfile` / **`crmContactKey`** — list membership |
| **`CommunicationSend.targetSegmentId`** | Opaque string for **traceability** on a **send** (see schema note) |
| **County** | `countyId` on **threads**, **opportunities**, **intakes** — **geographic** context, not a full targeting engine |
| **`VoterRecord`** | **Not** a direct **send** list in the workbench ERD; access is usually via **`User`** link or **manual** file processes |

**COMMS-UNIFY-1** conclusion: **targeting** is **fragmented** but **mappable** — future **DATA-*** packets should attach **one** “targeting contract” to **`CommunicationPlan`** or **`CommunicationCampaign`** as **metadata**, not a third parallel list store.

---

## 5. Execution layer output (reality)

- **Sends:** `CommunicationSend` status, **`CommunicationRecipient`**, **`CommunicationRecipientEvent`** (engagement) for **workbench**.
- **Broadcast:** `CommunicationMessage` + **`CommunicationCampaignRecipient`** and campaign counters.
- **Threads:** `CommunicationMessage` **per** thread; delivery **`MessageDeliveryStatus`**; **webhooks** in codebase for **SendGrid** (broadcast engagement).
- **Social:** **`SocialContentItem.status`** and platform **variants**; **not** merged into `CommunicationSend` **unless** staff **link** `EmailWorkflowItem` / **`CommunicationPlan.sourceSocialContentItem`**.

---

## 6. What can be unified (next implementation packets — not in COMMS-UNIFY-1)

1. **Glossary** in admin: **Plan** (workbench) vs **Campaign** (Tier 2) vs **Thread** (1:1).
2. **Cross-links** in UI: from **`EmailWorkflowItem`** to **plan** + **send** (already in schema) — **visibility** not **one table**.
3. **Optional** shared **`campaignMessageKey`** in **`metadataJson`** on **Plan** + **Campaign** + **Social** item for **traceability** — **convention** only, **no** migration in COMMS-UNIFY-1.

---

*Last updated: Packet COMMS-UNIFY-1.*
