# Campaign Email Command Center — Data Model (Design Only)

**Packet:** **REDDIRT-EMAIL-OS-MASTERPLAN-1.0**  
**Status:** **Mixed** — design narrative below; **`EMAIL-CONTACT-PROFILE-GRAPH-1.0`** + **`EMAIL-AUDIENCE-STUDIO-1.0`** ship focused Prisma models (see § implemented). When implementing further packets, reconcile with `prisma/schema.prisma` and prefer **additive** migrations.

**Related:** [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md)

## Implemented in repo (reconcile with `prisma/schema.prisma`)

### EMAIL-CONTACT-PROFILE-GRAPH-1.0 (2026-05-05)

Additive migration: `prisma/migrations/20260505203000_email_contact_profile_graph/migration.sql`.

| Model | Role |
|-------|------|
| `EmailContactProfile` | Optional links to `User` / `VolunteerProfile` / `RelationalContact`; `primaryEmail` / `displayName` hints from queue context; **not** an auto-synced CRM mirror. |
| `EmailContactProfileFact` | **ACTIVE** facts **after** operator approval; provenance in `sourceMetadataJson`; **does not** auto-update `User`/`VolunteerProfile` in this packet. |
| `EmailContactProfileFactSuggestion` | **PENDING** from stored `metadataJson.emailAiAnalysis.output.profileFactSuggestions`. |
| `EmailAudienceHint` | Staged from AI `audienceHints`; **not** SendGrid / `CommsPlanAudienceSegment`. |

`EmailWorkflowItem.emailContactProfileId` — optional link from `findOrCreateEmailContactProfileForQueueItem`.

**Why `Email*` prefix:** Scopes this graph to the email workflow lane; generic `ContactProfileFact` in the proposal table below remains a **design** north star for future unified CRM facts.

### EMAIL-AUDIENCE-STUDIO-1.0 (2026-05-05)

Additive migration: `prisma/migrations/20260505220000_email_audience_studio_foundation/migration.sql`.

| Model | Role |
|-------|------|
| `EmailAudienceDefinition` | Operator-saved **DRAFT** / **ACTIVE** / **ARCHIVED** audience criteria (`criteriaJson`). **No** SendGrid list id fields — broadcast sync is a future packet. |
| `EmailAudiencePreviewRun` | Audit row for each **preview** (criteria + `matchCount`); **no** send side effects. |

**Reuse:** `CommsPlanAudienceSegment` / `AudienceSegment` remain **separate** message-plan and Tier-2 broadcast constructs — Audience Studio does **not** write them.

---

**Existing anchors in code today:** `EmailWorkflowItem`, `CommunicationThread`, `CommunicationMessage`, `CommunicationPlan`, `CommunicationSend`, `CommunicationRecipient`, `StaffGmailAccount`, `User`, `VolunteerProfile`, `RelationalContact`, `CommsPlanAudienceSegment`, enums in `CommsSendProvider`, engagement fields on send models.

---

## Design principles

1. **Triage ≠ send** — Queue rows are **not** send records; link via FK when useful.  
2. **Suggestions ≠ truth** — AI/vendor signals → suggestion or engagement tables before overwriting canonical profile.  
3. **Audit everything sensitive** — Especially automation runs, approvals, suppression bypass attempts.  
4. **Minimize raw content** — Store previews/hashes where possible; full bodies only with retention policy.  
5. **No secrets in DB** — Provider keys, OAuth client secrets, raw refresh tokens belong in **vault/env** patterns — store **scoped references** only.

---

## Entity reference

### CampaignEmailAccount / GmailConnection

| | |
|--|--|
| **Purpose** | One connected mailbox (monitoring or send-capable) with OAuth identity, scopes, sync cursors. May **wrap or complement** `StaffGmailAccount` — implementation must avoid two conflicting truths for the same human operator without explicit product rule. |
| **Key fields (proposed)** | `id`, `userId?` (staff owner), `provider` (GOOGLE), `googleSub` / email address, `scopes[]`, `status` (ACTIVE / REVOKED / ERROR), `lastSyncAt`, `lastHistoryId` or API cursor, `syncError`, `createdAt`, `updatedAt` |
| **Existing links** | `User`; optional FK from `SyncedEmailThread`. |
| **Why it exists** | Distinct **sync state** and **health** from the triage queue; supports multiple mailboxes if campaign policy allows. |
| **Do not store** | OAuth **client secret**; long-lived plaintext refresh tokens without encryption strategy; arbitrary third-party API keys. |

### SyncedEmailThread

| | |
|--|--|
| **Purpose** | Normalized Gmail thread for UI + linking to `CommunicationThread` / `EmailWorkflowItem`. |
| **Key fields** | `id`, `gmailConnectionId`, `providerThreadId`, `subjectPreview`, `snippet`, `labelIds` (JSON), `firstMessageAt`, `lastMessageAt`, `communicationThreadId?`, `emailWorkflowItemId?`, `metadataJson` |
| **Existing links** | `CommunicationThread`, `EmailWorkflowItem`, `CampaignEmailAccount`. |
| **Why** | Operators need thread identity **without** opening Gmail for every triage pass. |
| **Do not store** | Full MIM body for every participant indefinitely without retention rules; **BCC** on other people’s mail beyond policy. |

### SyncedEmailMessage

| | |
|--|--|
| **Purpose** | Single message in a thread; quoted text optionally truncated. |
| **Key fields** | `id`, `syncedThreadId`, `providerMessageId`, `internalDate`, `fromAddress`, `toAddresses` (JSON), `direction`, `bodyPreview`, `bodyStorageKey?` (external blob), `headersJson?`, `hash` |
| **Existing links** | `SyncedEmailThread`; optional `communicationMessageId`. |
| **Why** | Enables classification, deduplication, and “reply received” triggers. |
| **Do not store** | Unredacted sensitive attachments by default; virus-prone executables. |

### EmailIdentity

| | |
|--|--|
| **Purpose** | Map email addresses to `User` / `VolunteerProfile` / external prospect rows — supports dedupe and “same person, many addresses.” |
| **Key fields** | `id`, `normalizedEmail`, `userId?`, `volunteerProfileId?`, `relationalContactId?`, `confidence`, `source`, `verifiedAt?` |
| **Existing links** | Core people tables. |
| **Why** | Stitching Gmail ↔ CRM ↔ SendGrid recipient. |
| **Do not store** | Invented emails; unverified **marketing** third-party dumps without consent documentation in the compliance process. |

### CampaignContactProfile (vs extend User / VolunteerProfile)

| | |
|--|--|
| **Purpose** | **Strategy choice:** (A) extend `VolunteerProfile` / `User` JSON for email-ops flags, or (B) add `CampaignContactProfile` with **1:1** to `User` when fields explode. Prefer **A** until B is justified. |
| **Key fields (if dedicated model)** | `userId` unique, `primaryEmailIdentityId?`, `engagementSummaryJson`, `riskFlagsJson`, `lastProfileReviewAt`, `metadataJson` |
| **Existing links** | `User`, `VolunteerProfile`. |
| **Why** | Keeps **operational** email-centrics from polluting legal identity fields. |
| **Do not store** | Raw voter file snapshots duplicated here — **link** to `VoterRecord` / relational rows. |

### ContactProfileFact

| | |
|--|--|
| **Purpose** | Canonical, operator- or system-approved **attribute** about a person (structured). |
| **Key fields** | `id`, `subjectUserId?`, `subjectVolunteerProfileId?`, `key` (enum or namespaced string), `valueJson`, `confidence`, `source` (OPERATOR / WEBHOOK / IMPORT), `approvedByUserId?`, `approvedAt?`, `createdAt` |
| **Existing links** | People tables. |
| **Why** | Machine-readable profile for segments (“interested in poll watching”). |
| **Do not store** | Unverified opponent research as “facts”; free-text **health** or **protected-class** inference in production without legal review. |

### ContactProfileFactSuggestion

| | |
|--|--|
| **Purpose** | AI/vendor proposed fact pending merge into `ContactProfileFact`. |
| **Key fields** | `id`, same subject FKs, `key`, `proposedValueJson`, `evidenceSnippets[]` (bounded), `modelProvenanceJson`, `status` (PENDING / ACCEPTED / REJECTED), `reviewedByUserId?` |
| **Existing links** | Optional FK to `EmailWorkflowItem` or `SyncedEmailMessage`. |
| **Why** | **Governance** — **never** auto-merge sensitive keys. |
| **Do not store** | Long chat logs; secrets; **full** email bodies unless policy requires. |

### ContactTag

| | |
|--|--|
| **Purpose** | Lightweight labels (“press”, “high volunteer intent”, “donor prospect”). |
| **Key fields** | `id`, `slug`, `label`, `color?`, `description?`, `createdAt` |
| **Links** | M2M `ContactTagAssignment` → `User` / identities. |
| **Why** | Fast operator filtering without full segment SQL. |
| **Do not store** | Covert **surveillance** tags on private individuals beyond campaign-legitimate purposes. |

### ContactGroup / EmailAudienceGroup

| | |
|--|--|
| **Purpose** | Named static audience bucket for sends and reporting. |
| **Key fields** | `id`, `name`, `description`, `ownerUserId?`, `createdAt`, `externalListId?` (SendGrid), `metadataJson` |
| **Links** | M2M membership or separate membership table. |
| **Why** | Human-managed lists (“county captains”). |
| **Do not store** | People who have **unsubscribed** as if still active — must reconcile with suppression. |

### DynamicSegmentDefinition

| | |
|--|--|
| **Purpose** | Declarative rule or query spec producing **dynamic** audience membership. |
| **Key fields** | `id`, `name`, `definitionJson` (query DSL or SQL-safe builder IR), `version`, `lastComputedAt?`, `rowCountApprox?`, `ownerUserId?` |
| **Links** | Optional `EmailAutomationRule` consumers. |
| **Why** | Microtargeting without manual list churn. |
| **Do not store** | Executable raw SQL from client — **only** server-built or validated IR. |

### EmailAudienceMembership

| | |
|--|--|
| **Purpose** | Materialized `userId` / identity in group or segment snapshot for a point in time. |
| **Key fields** | `id`, `groupId?`, `segmentId?`, `userId?`, `emailIdentityId?`, `snapshotAt`, `suppressed` (bool), `reason?` |
| **Links** | Groups/segments; identities. |
| **Why** | Explain “why was this person included?” at send time. |
| **Do not store** | **Permanent** history without TTL if counsel requires minimization. |

### EmailDraft / CampaignEmailDraft

| | |
|--|--|
| **Purpose** | Versioned content before approval; may mirror or join existing draft structs on `CommunicationPlan`. |
| **Key fields** | `id`, `planId?`, `title`, `subject`, `bodyMdxOrHtml`, `variantLabel`, `status`, `createdByUserId`, `approvedByUserId?`, `metadataJson` |
| **Links** | `CommunicationPlan`, `CommunicationSend` (once scheduled). |
| **Why** | Separates authoring from triage queue semantics. |
| **Do not store** | **Unapproved** copy as if it were sent; personal musings in shared drafts without access control (implement RBAC later). |

### EmailSendPlan

| | |
|--|--|
| **Purpose** | Human-approved execution record: **who**, **what**, **when**, **which audience**. |
| **Key fields** | `id`, `planId?`, `communicationSendId?`, `audienceType` (GROUP / SEGMENT / ADHOC), `audienceRefId`, `scheduledAt?`, `approvedAt`, `approvedByUserId`, `status`, `metadataJson` |
| **Links** | `CommunicationSend`, audience tables. |
| **Why** | Audit anchor for mass send. |
| **Do not store** | Secret **bcc** lists for hidden targeting — compliance risk; if used, restricted visibility + explicit policy. |

### EmailSendRecipient

| | |
|--|--|
| **Purpose** | Per-recipient expansion row if not fully covered by `CommunicationRecipient` today — **or** extend existing model instead of duplicating**. |
| **Key fields** | `sendId`, `emailIdentityId?`, `userId?`, `providerRecipientId?`, `personalizationJson`, `status`, `failureReason?` |
| **Links** | `CommunicationSend`; align with existing recipient bridge. |
| **Why** | Deterministic preview + reconciliation with webhooks. |
| **Do not store** | **Excessive** personalization vectors that imply hidden surveillance. |

### EmailEngagementEvent

| | |
|--|--|
| **Purpose** | Normalized engagement fact (open, click, bounce, spam, unsubscribe). |
| **Key fields** | `id`, `communicationSendId?`, `recipientId?`, `emailIdentityId?`, `eventType`, `occurredAt`, `url?`, `providerEventId?` (unique), `rawMetadataJson` |
| **Links** | Send/recipient; optional profile updates via governed jobs. |
| **Why** | Analytics + automation triggers (“clicked RSVPing”). |
| **Do not store** | **Full** clickstream across unrelated sites; only campaign-tracked links. |

### SendGridWebhookEvent

| | |
|--|--|
| **Purpose** | Raw payload landing zone before normalization + **idempotency**. |
| **Key fields** | `id`, `receivedAt`, `eventTypeRaw`, `payloadJson`, `signatureValidated`, `processedAt?`, `error?` |
| **Links** | None required initially; processing enqueues `EmailEngagementEvent`. |
| **Why** | Debug + retry + vendor truth. |
| **Do not store** | Secrets from headers; unbounded duplicate rows without unique key strategy. |

### EmailAutomationRule

| | |
|--|--|
| **Purpose** | Declarative automation: trigger + conditions + **allowed actions**. |
| **Key fields** | `id`, `name`, `enabled`, `trigger`, `conditionJson`, `actionJson`, `requiresApproval`, `createdByUserId`, `metadataJson` |
| **Links** | Optional segment/group FKs. |
| **Why** | Productize “if bounced → suggest alternate channel” patterns. |
| **Do not store** | **Hidden** rules outside admin visibility; rules that send without `requiresApproval=false` **and** org policy (future). |

### EmailAutomationRun

| | |
|--|--|
| **Purpose** | One execution attempt of a rule; success/partial/fail + side effects list. |
| **Key fields** | `id`, `ruleId`, `startedAt`, `finishedAt`, `status`, `inputRefJson`, `outputJson`, `error?`, `dryRun` |
| **Links** | `EmailAutomationRule`; optional `EmailWorkflowItem` created. |
| **Why** | Audit and replay analysis. |
| **Do not store** | Full PII dumps in `outputJson` — reference IDs. |

### EmailSuppression / ConsentPreference

| | |
|--|--|
| **Purpose** | Global “do not email” / category opt-down / SendGrid suppression sync. |
| **Key fields** | `id`, `emailIdentityId?`, `userId?`, `kind` (GLOBAL_UNSUB / BOUNCE / SPAM_COMPLAINT / MANUAL), `source`, `effectiveAt`, `expiresAt?`, `metadataJson` |
| **Links** | Identity; optional webhook FK. |
| **Why** | **Fail-closed** mass send prerequisite. |
| **Do not store** | **False** suppressions that erase lawful communication without process — use status + review for disputes. |

### EmailAuditLog

| | |
|--|--|
| **Purpose** | Append-only security/compliance-oriented events (not full application log). |
| **Key fields** | `id`, `occurredAt`, `actorUserId?`, `action`, `entityType`, `entityId`, `diffJson?`, `ip?`, `metadataJson` |
| **Links** | Polymorphic refs by type/id. |
| **Why** | Prove who approved sends and who changed automation. |
| **Do not store** | Secrets; entire email bodies unless legally required. |

---

## Consolidation opportunities (implementation note)

Before migrating, **prefer** extending:

- `CommunicationRecipient` instead of parallel `EmailSendRecipient` if schemas align.  
- `CommunicationMessage` for outbound copy snapshots where already present.  
- `metadataJson` on `EmailWorkflowItem` for **transitional** provenance until tables exist.

---

*Design only — REDDIRT-EMAIL-OS-MASTERPLAN-1.0.*
