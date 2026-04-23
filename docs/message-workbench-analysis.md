# Message workbench — analysis (COMMS-UNIFY-1) (RedDirt)

**Purpose:** Describe **what the comms (message) workbench does** in this repo, **how outputs are structured**, **reuse**, and **plausible** connections to **targeting**, **execution**, and **AI** — **from code + schema only**.

**Primary routes:** `/admin/workbench/comms` (hub), `/admin/workbench/comms/plans/*`, `…/comms/broadcasts/*`, `…/comms/media/*` (media library under comms)  
**Code:** `src/lib/comms-workbench/*`, `src/components/admin/comms-workbench/*`

---

## 1. What the message creation system does

1. **Plans (`CommunicationPlan`)** — Container for a **coherent** comms **effort** with:
   - **`CommunicationObjective`** (e.g. `EVENT_PROMOTION`, `RAPID_RESPONSE`, `DONOR_ENGAGEMENT`, `INTERNAL_COORDINATION`, …)
   - **Status** lifecycle (`DRAFT` → `PLANNING` → `READY_FOR_REVIEW` → `APPROVED` / `SCHEDULED` / `ACTIVE` / `COMPLETED` / …)
   - **Optional** **source** links: `WorkflowIntake`, `CampaignTask`, `CampaignEvent`, **`SocialContentItem`**
2. **Drafts (`CommunicationDraft`)** — **Per-channel** **copy** (`CommsWorkbenchChannel`: `EMAIL`, `SMS`, `INTERNAL_NOTICE`, `PRESS_OUTREACH`, `PHONE_SCRIPT`, `TALKING_POINTS`). Each draft has **bodyCopy**, **subject/preview** for email-like channels, **tone/tactic** fields aligned with **social** learning dimensions, **review** state.
3. **Variants (`CommunicationVariant`)** — Optional **audience** or **copy** **forks** (`AUDIENCE_SEGMENT`, `COPY_ALT`, `CHANNEL_OVERRIDE`, `AB_TEST`, …) with **opaque** `targetSegmentId` / **label** (schema: no CRM engine).
4. **Sends (`CommunicationSend`)** — **Execution** request: ties **plan** + **draft** + optional **variant**, **status** (DRAFT → **QUEUED** → SENT/FAILED/…), **scheduling**, **recipients** (`CommunicationRecipient`), **events** for engagement, **link** to **`EmailWorkflowItem`** for **queue** handoff.
5. **Media outreach** — **`MediaOutreachItem`** can point at a **plan** (press / earned workflow).

The **comms workbench page** itself (`workbench/comms/page.tsx`) presents a **dashboard** plus **links** to **legacy** **1:1** workbench, **broadcasts**, and **social** workbench — acknowledging **multiple** systems still adjacent.

---

## 2. How outputs are structured

| Artifact | Main fields / children |
|----------|------------------------|
| **Plan** | `title`, `objective`, `summary`, `status`, `priority`, **FK** sources, `metadataJson` |
| **Draft** | `channel`, `bodyCopy`, `subjectLine`, `previewText`, `shortCopy`, `messageToneMode`, `messageTacticMode`, `ctaType`, **review** fields |
| **Variant** | `variantType`, optional **overrides** (subject, body, CTA, channel), **target** string ids/labels, **review** |
| **Send** | `status`, `scheduledAt`, `queuedAt`, `sentAt`, `targetSegmentId`, **`CommunicationRecipient`[]** |
| **Recipient** | `addressUsed`, `channel`, **optional** `userId` / `volunteerProfileId` / **`comsPlanAudienceSegmentId`**, `crmContactKey`, delivery health, link to **events** |

**Execution truth** for a **workbench** blast is: **`CommunicationSend` + `CommunicationRecipient` (+ events)** — not **`CommunicationMessage`** (Tier 1) unless a **separate** path **also** posts to threads.

---

## 3. How reusable messages are

- **Within** a plan: **drafts** and **variants** are **reusable** as **editing** **units**; **primary** draft flagged via **`isPrimary`**.
- **Across** plans: **no** first-class “template library” table **dedicated** to workbench in the same way as `CommunicationTemplate` **for Tier 2** — staff may **copy** in UI or **duplicate** plans (product behavior not fully specified here); **schema** does not enforce **deduplication**.
- **Alignment with social:** `messageToneMode` / `messageTacticMode` on **draft** **mirror** **social** enums for **consistency** — **reuse of *dimensions***, not automatic **content** **sync**.

---

## 4. Connection to **targeting**

- **Direct:** `CommunicationSend.targetSegmentId` + **`CommsPlanAudienceSegment`** + **members** (User / volunteer / CRM key) — **list-based**.
- **Indirect:** `CommunicationPlan` **does not** query **`VoterRecord`** directly; **targeting** is **operational** **lists** + **county** **context** on other rails (see **DATA-1**).
- **Future:** a **targeting** **contract** (DATA-2+) could **populate** segment members or **set** `targetSegmentId` from **voter** **filters** — **not** in current foundation.

---

## 5. Connection to **comms execution**

- **Path is already wired:** `CommunicationSend` → **queue** → provider execution (see **`CommsSendProvider`**, workbench **execute** modules, webhooks for events).
- **Thread**-based email (`CommunicationMessage` + **Gmail**) is **separate** from **SendGrid**-style **sends** for **workbench**; **E-1** **workflow** is how staff choose the right path.

---

## 6. Connection to **AI agent**

- **Email workflow:** E-1/E-2 **interpretation** on `EmailWorkflowItem` — **suggest** response **narratives**; **queue-first**, **no** auto-send (see handoff).
- **Threads:** `aiThreadSummary` / `aiNextBestAction` on **`CommunicationThread`** (comms **AI** in `comms/ai` pattern).
- **Comms workbench:** draft copy may be **author-assisted** in UI (product-specific; **not** a single `aiDraftBody` on **`CommunicationDraft`** in **all** envs) — check **`metadataJson`** and **comms** **components** for feature flags.
- **Unification** story: **AI** should **read** **plan objective + known recipient segment + thread context** and **suggest** **drafts** or **E-1** **summaries** — **human** approves on the **right** **execution** rail.

---

*Last updated: Packet COMMS-UNIFY-1 (message workbench analysis).*
