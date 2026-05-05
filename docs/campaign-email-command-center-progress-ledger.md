# Email Command Center — Progress Ledger

**Packet:** **EMAIL-COMMAND-CENTER-PROGRESS-LEDGER-1.0**  
**Lane:** `RedDirt/` only · **Division:** Comms / Email Workflow Intelligence  
**Companion:** [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md) · [`campaign-email-command-center-cursor-protocol.md`](./campaign-email-command-center-cursor-protocol.md)

## Rules (Steve / Cursor protocol)

1. **Until the Email Command Center is considered complete**, every **Comms / Email OS** Cursor return must include the **EMAIL COMMAND CENTER PROGRESS LEDGER** block (15 layers + Overall below). This is the **primary** progress bar for email work — **not** the full multi-division campaign bargraph.
2. **Full-campaign** progress may be included **secondarily** only when it helps steering; it does **not** replace this ledger.
3. **Percentages move only** when **code, operators-visible runtime behavior, or honest documentation of shipped reality** changes — not from aspiration or roadmap text alone.
4. **No secrets** in ledger updates: env **names** only; never token values, client secrets, or webhook strings.

---

## Milestone rubric (all layers)

Use the same anchors when scoring any layer:

| % | Meaning |
|---|--------|
| **0%** | Not started — no intentional repo seam for operators. |
| **25%** | Scaffold — types, docs, or env gates; little or no operator UI. |
| **50%** | **Partial** — real path exists; notable gaps, manual steps, or policy not productized. |
| **75%** | **Strong** — operators can complete the core job repeatedly; governance/edge cases still thin. |
| **100%** | **Production-grade** for this layer — trusted, documented, with clear failure modes and compliance posture (where applicable). |

---

## Tracked layers (15 + overall)

Percentages below reflect **repo reality after EMAIL-AUDIENCE-STUDIO-1.0** (2026-05-05).

| Layer | ~% | What moves the needle |
|-------|---:|------------------------|
| **1. Command Center Shell / Cockpit** | **92** | Cockpit read models; OpenAI readiness; **profile graph** + **Audience Studio** counts/links (`/profiles`, `/audiences`); Gmail strip + **Gmail Review**; migrate/check honesty; preflight. |
| **2. Email Queue / Triage Workflow** | **88** | `EmailWorkflowItem` queue, E-2, assignment/status; **AI Email Intelligence** + **Contact / Profile Intelligence** panels on detail; manual Gmail metadata → queue; no send from item. |
| **3. Gmail OAuth Connection** | **80** | Staff Gmail OAuth, sealed tokens, metadata-first scopes, optional composer send via env. |
| **4. Gmail Metadata Sync** | **82** | Manual INBOX metadata sync; **Gmail Review** list + re-fetch on create. |
| **5. Gmail Watch / Push Sync** | **65** | `users.watch`; Pub/Sub scaffold; hardened `history.list` preview; renewal preview tooling (**no** in-app cron). |
| **6. SendGrid Foundation** | **10** | Env + routes elsewhere; no Command Center send execution; **no** Audience Studio list sync. |
| **7. OpenAI Email Intelligence** | **55** | Advisory `json_object` → `metadataJson.emailAiAnalysis`; fuels **profile graph staging** when operator runs generate; **no** auto-merge to CRM. |
| **8. Contact/Profile Graph** | **55** | **EMAIL-CONTACT-PROFILE-GRAPH-1.0:** Prisma models + migration; queue + Command Center + **`/profiles`** review; **no** auto `User`/`VolunteerProfile` writes. |
| **9. Audience / Microtargeting Studio** | **45** | **EMAIL-AUDIENCE-STUDIO-1.0:** **`/audiences`** previews + **`EmailAudienceDefinition`** drafts + **`EmailAudiencePreviewRun`** audit; **no** SendGrid segments. |
| **10. Message Studio / Drafting** | **32** | Comms workbench + queue reply drafts (advisory). |
| **11. Automation Studio** | **42** | T0–T3 partial; profile + audience staging = **manual** governance surfaces, **not** auto-actions. |
| **12. Analytics / Deliverability** | **24** | Engagement/deliverability product still thin; preview runs add **audit** surface only. |
| **13. Governance / Compliance Rails** | **80** | **Audience Studio** warnings + **no auto profile merge** / **hints ≠ segments** copy on queue + cockpit + profiles + audiences pages. |
| **14. Deployment / Env Readiness** | **64** | Migrations **`20260505203000_email_contact_profile_graph`** + **`20260505220000_email_audience_studio_foundation`** per env; `npm run check` ≠ migrate proof. |
| **15. Overall Email Command Center** | **64** | Queue AI + governed **profile graph** + **Audience Studio preview**; broadcast SendGrid execution still early. |

---

## Cursor return — paste block

Every **email packet** return must end with:

```text
EMAIL COMMAND CENTER PROGRESS LEDGER
- Overall Email Command Center:
- Command Center Shell / Cockpit:
- Email Queue / Triage Workflow:
- Gmail OAuth Connection:
- Gmail Metadata Sync:
- Gmail Watch / Push Sync:
- SendGrid Foundation:
- OpenAI Email Intelligence:
- Contact/Profile Graph:
- Audience / Microtargeting Studio:
- Message Studio / Drafting:
- Automation Studio:
- Analytics / Deliverability:
- Governance / Compliance Rails:
- Deployment / Env Readiness:
```

---

## Related implementation packets (grounding)

- **EMAIL-COMMAND-CENTER-SHELL-1.0** — cockpit route.  
- **EMAIL-GMAIL-CONNECT-1.0** — OAuth + Monitor shell.  
- **EMAIL-GMAIL-SYNC-1.1** — metadata sync + history dry-run cursor.  
- **EMAIL-GMAIL-WATCH-1.2** — `users.watch`, `gmailSyncState` watch fields, Pub/Sub receiver scaffold, manual history preview.  
- **EMAIL-GMAIL-OPS-HISTORY-1.3** — DB preflight; honest migrate/check docs; hardened history processor; watch renewal preview tooling; Pub/Sub parse helper.  
- **EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4** — **`/admin/workbench/email-command-center/gmail/review`**: metadata-only INBOX review; **manual** `createEmailWorkflowItemFromGmailMetadataAction`; `metadataJson.gmailReviewSource` provenance (`bodyStored: false`); Postgres JSON duplicate guard; **no** bodies, **no** send, **no** auto-queue from Gmail.  
- **EMAIL-AI-INTELLIGENCE-1.0** — **`src/lib/email-workflow/ai/*`**, **`runEmailWorkflowAiAnalysisAction`**; queue detail **AI Email Intelligence** panel; Command Center readiness + count of rows with `metadataJson.emailAiAnalysis`; **advisory-only** structured output; **no** Gmail body reads, **no** send, **no** automatic queue approval or profile merges.  
- **EMAIL-CONTACT-PROFILE-GRAPH-1.0** — Prisma **`EmailContactProfile*`** + **`EmailAudienceHint`**; **`profile-graph.ts`**, **`email-profile-graph-actions.ts`**; queue detail **Contact / Profile Intelligence**; **`/admin/workbench/email-command-center/profiles`**; **no** auto CRM merge, **no** SendGrid segments from hints. **Migration:** `20260505203000_email_contact_profile_graph`.  
- **EMAIL-AUDIENCE-STUDIO-1.0** — **`audience-studio.ts`**, **`email-audience-actions.ts`**, **`/admin/workbench/email-command-center/audiences`**; **`EmailAudienceDefinition`** + **`EmailAudiencePreviewRun`**; previews over **ACTIVE** facts; **no** SendGrid sync, **no** sends. **Migration:** `20260505220000_email_audience_studio_foundation`.  
- **Next (named):** governed **auto**-processing from Pub/Sub (explicit packet only; **no** silent `messages.get`).

---

*Last updated: EMAIL-AUDIENCE-STUDIO-1.0 + progress ledger.*
