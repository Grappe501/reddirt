# Campaign Email Command Center — Automation Map (Policy-Gated)

**Packet:** **REDDIRT-EMAIL-OS-MASTERPLAN-1.0**  
**Mode:** Design only — describes **intended** automations **with gates**, not shipped behavior.

**Related:** [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md) · [`campaign-email-command-center-cursor-protocol.md`](./campaign-email-command-center-cursor-protocol.md)

**Doctrine:** **Automation everywhere in design, execution only behind gates.** Default posture remains **queue-first** until a packet explicitly enables a narrower auto-path.

### Column legend

| Column | Meaning |
|--------|---------|
| **Trigger** | Event that starts evaluation |
| **Input source** | Systems providing data |
| **AI involvement** | None / assist / classify / draft / cluster |
| **Data mutation** | What may change in DB |
| **Human gate** | Operator/manager approval before continuing |
| **Send gate** | Separate approval for **any** outbound message |
| **Audit event** | What gets logged |
| **Failure fallback** | Safe degrade path |

---

## Automation catalog

| Trigger | Input source | AI involvement | Data mutation | Human gate | Send gate | Audit event | Failure fallback |
|---------|--------------|----------------|---------------|------------|-----------|-------------|------------------|
| **New Gmail thread** | Gmail sync, `SyncedEmailThread` | Classify + summarize (optional) | Create/skip `EmailWorkflowItem`; store provenance | **Yes** for sensitive classification buckets (press/legal) | **N/A** (no auto-send) | `EmailAuditLog` + `metadataJson.emailWorkflowInterpretation` | Queue as `NEW` without AI if model unavailable |
| **Reply received** | Gmail message ingest | Thread delta summary | Update thread timestamps; possibly bump queue status | **Yes** if escalation suggested | **N/A** | Interpretation provenance + message link | Log sync error; do not lose thread |
| **Volunteer inquiry** | Form / thread classifier | Intent detect → routing hint | Tag suggestions; link `VolunteerProfile` | **Yes** before mass template | **N/A** for queue creation | Routing decision logged | Default triage queue |
| **Donor inquiry** | Form / thread | Tone + sensitivity flag | **Suggestion** rows only | **Yes** (finance coupling) | **N/A** | Fact suggestions + flags | Escalate to operator task |
| **Press inquiry** | Gmail / monitoring | Priority + topic draft | `EmailWorkflowItem` **ESCALATED** candidate | **Mandatory** human ack | **N/A** | Escalation reason | Never auto-close press thread |
| **Event RSVP** | Calendar / form webhook | Cluster “same event” | Link event + segment hints | Optional for thank-you templates | **Yes** if thank-you **email** | `EmailSendPlan` approval stub | Queue item only |
| **Angry / escalated message** | Sentiment + lexicon | Risk score + calm draft (optional) | `escalationLevel` suggestion | **Mandatory** | **N/A** | risk + provenance | No auto-reply; notify on-call |
| **Stale no-reply** | SLA timer / `occurredAt` | Suggest next touch | Create **task** or workflow suggestion | **Yes** for nudge scripts | **Yes** if nudge is email | SLA breach event | Disable noisy rule on repeated failures |
| **Clicked link** | SendGrid webhook | Infer interest tag (optional) | `EmailEngagementEvent` + **suggestion** tag | No for event row; **Yes** for profile merge | **N/A** | Idempotent ingest | Dead-letter raw webhook |
| **Opened email** | SendGrid webhook | Optional engagement score | Engagement counters | No for counter; **Yes** for sensitive targeting story | **N/A** | Engagement + batch id | Treat opens as weak signal |
| **Bounced email** | SendGrid webhook | None | Suppression row; send failure on `CommunicationSend` | **Yes** if removing large cohort | **N/A** | bounce_type + recipient | Retry transient only with caps |
| **Unsubscribed / spam complaint** | SendGrid webhook | None | **Suppression** + halt automation for that address | **Yes** if disputing list hygiene issue | **Hard no** | `EmailSuppression` + audit | Page ops if spike |
| **High engagement** | Aggregates | Recommend “ask ladder” | **Suggestion** for next action | **Yes** | **Yes** for follow-up send | Recommendation provenance | Read-only insight if automation off |
| **Audience segment changed** | Segment job | Re-evaluate rule targets | Refresh `EmailAudienceMembership` | **Yes** before any **auto** outreach rule fires | **Yes** | Segment refresh audit | Disable rule if count explodes |
| **Campaign send approved** | human approval + plan | Personalization assist | Transition `CommunicationSend` → queued | Already satisfied | **Implied** by approval path | `EmailAuditLog` approve row | Rollback plan if provider rejects |
| **Send failed** | Provider API error | Classify error (optional) | Retry count++, status | **Yes** after N failures | **Yes** for final channel switch | failure payload ref | Open `EmailWorkflowItem` for ops |
| **Similar message cluster detected** | Embedding batch | Cluster + shared draft | **Draft** suggestion for batch | **Mandatory** before batch send | **Yes** per recipient or explicit broadcast approval | cluster_id + members | Fall back to individual triage |

---

## Gate tiers (reference)

| Tier | Automation allowed (example) | Not allowed without next packet |
|------|------------------------------|--------------------------------|
| **T0** | Log + sync + counters | Any outbound |
| **T1** | AI summaries into suggestions | Auto-merge profile facts |
| **T2** | Create queue items + internal tasks | Mass send |
| **T3** | Scheduled **single-hop** follow-ups **with** explicit approvals stored | SMS/voice (out of email scope) |
| **T4** | *(Future)* Policy-defined narrow auto-send exceptions | **Requires** counsel + explicit packet |

**EMAIL-SENDGRID-FOUNDATION-1.0** adds **receive-only** webhook ingestion (**`POST /api/sendgrid/events`**) into **`SendGridEvent`** / **`SendGridSuppression`** — **not** queue automation, **not** sends, **not** OpenAI. **Current code** is roughly **T0–T2** for email workflow (interpretation + queue) and **manual** comms sends elsewhere. **EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4** adds an **explicit manual** operator path: Gmail **METADATA** review UI → button → **`EmailWorkflowItem`** with **`gmailReviewSource`** provenance — **not** Pub/Sub automation and **not** L4. **EMAIL-AI-INTELLIGENCE-1.0** adds **operator-triggered** OpenAI **`json_object`** analysis on existing queue fields (**T1-style assist**): writes **`metadataJson.emailAiAnalysis`** only; **no** auto status changes, **no** send, **no** profile/audience mutations. **EMAIL-CONTACT-PROFILE-GRAPH-1.0** stages **`EmailContactProfileFactSuggestion`** / **`EmailAudienceHint`** from **stored** AI output only; **approve** creates **`EmailContactProfileFact`** — still **manual** gates (**no** auto-merge to `User`/`VolunteerProfile`, **no** SendGrid lists). **EMAIL-AUDIENCE-STUDIO-1.0** adds **operator-driven** **`/audiences`** previews + **`EmailAudienceDefinition`** drafts over **ACTIVE** facts + optional **`EmailAudiencePreviewRun`** audit rows — **no** SendGrid sync, **no** sends, **no** auto segment membership. **Gmail Command Center** otherwise adds **manual T3-adjacent** external sync (**watch** + **history preview** + **Pub/Sub metadata-only**) without auto queue creation — **do not** claim full **T3–T4** email automation until governed packets ship.

---

## Audit + kill switch

- **Every** rule in `EmailAutomationRule` must have: **`enabled` flag**, **`dryRun` mode**, **owner**, **lastModifiedAt**.  
- **Global** automation kill switch in Settings (implementation packet) flips **all** rules off except ingestion.  
- **Shadow mode**: write `EmailAutomationRun` with `dryRun=true` before enabling side effects.

---

*Design only — REDDIRT-EMAIL-OS-MASTERPLAN-1.0.*
