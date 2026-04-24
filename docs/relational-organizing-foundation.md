# Relational organizing — foundation (REL-1) (RedDirt)

**Packet REL-1** defines the **Relational Organizing Engine (ROE)** as a **first-class** concept: volunteer-owned networks, structured scaling (Power of 5, PODs), honest voter-file touchpoints, and **AI-assisted** (never auto-sent) messaging. **Packet REL-2** (see [`relational-contact-implementation-foundation.md`](./relational-contact-implementation-foundation.md)) adds **minimal** Prisma + helpers + admin list/detail—no volunteer product UI, no auto-matching.

**Cross-ref:** [`relational-contact-implementation-foundation.md`](./relational-contact-implementation-foundation.md) (REL-2) · [`pod-system-foundation.md`](./pod-system-foundation.md) · [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md) · [`relational-voter-integration.md`](./relational-voter-integration.md) · [`relational-kpi-foundation.md`](./relational-kpi-foundation.md) · [`relational-ai-assist-foundation.md`](./relational-ai-assist-foundation.md) · [`unified-campaign-engine-foundation.md`](./unified-campaign-engine-foundation.md) · [`shared-rails-matrix.md`](./shared-rails-matrix.md) · [`identity-and-voter-link-foundation.md`](./identity-and-voter-link-foundation.md) · [`field-structure-foundation.md`](./field-structure-foundation.md) · [`county-registration-goals-verification.md`](./county-registration-goals-verification.md)

---

## 1. North star

**Relational organizing** is the campaign’s **primary growth engine** in this model: growth comes from **people the campaign did not buy or rent**—from **trust graphs** volunteers already have.

- **Volunteer-driven, relationship-based outreach** — The unit of work is “my cousin / coworker / neighbor,” not an anonymous row in a purchased list. Outreach is **conversation-shaped**, even when tools log it.
- **More trusted than cold outreach** — Same message from a stranger vs. a friend lands differently; the system should **measure** and **support** that difference without pretending every contact is high-trust.
- **Scalable through structured systems** — **Power of 5** (each volunteer focuses on a small core) and **PODs** (leaders + cores + extended layers) turn ad hoc texting into **repeatable** org math, county by county. See [`pod-system-foundation.md`](./pod-system-foundation.md).

**Boundary:** Uploaded training decks (Power of 5, POD diagrams) are **conceptual inputs** for these docs—not evidence of implementation in code until a later packet ships schema/UI.

---

## 2. Core model

| Concept | Definition (system terms) |
|---------|---------------------------|
| **Volunteer** | A **`User`** with a **`VolunteerProfile`** (and optional `linkedVoterRecordId`). Owns outreach intent, commitments, and (future) a **network** of relational contacts. Not every `User` is a volunteer; not every relational contact is a `User`. |
| **Relationship (relational contact)** | A **person the volunteer names** as part of their outreach universe. **REL-2:** persisted as **`RelationalContact`** (owner `User`, optional `VoterRecord` match, power-of-5 flags). `Commitment.metadata` remains a poor substitute for ad hoc only. |
| **Network** | The **set of relational contacts** attributed to one volunteer (plus optional nested attribution under POD structure). **Measurable** as counts, match rates, and funnel stages—not as surveillance of private message text by default. |
| **Power-of-5 structure** | Each volunteer maintains a **core** of ~5 high-intent relationships they will actually work; the system plans coaching and reminders around that **small** set to protect quality. |
| **POD structure** | A **POD Leader** supports multiple volunteers; each volunteer holds a **Core 5**; **extended** layers (e.g. 25 → 125) are **organizing math** for capacity planning, not a requirement that every volunteer hit exact multiples. See [`pod-system-foundation.md`](./pod-system-foundation.md). |

---

## 3. System principles

1. **Every volunteer owns a network** — Attribution defaults to **one volunteer owner** per relational contact (with exceptions for handoffs documented in ops, not hidden in schema yet).
2. **Networks are measurable** — Counts, match status to `VoterRecord`, registration flags, and contact attempts (when logged) roll up for **county** and **campaign** narrative—without micromanaging wording.
3. **Outreach is tracked but not over-controlled** — The system logs **facts** (who, when channel, outcome bucket) compatible with consent and policy; it does **not** replace volunteer judgment in the conversation.
4. **AI assists but does not replace human relationships** — Draft scripts, tone hints, and follow-up plans are **suggestions**; send/press/send-button stays **human** and **policy-bound** (see [`relational-ai-assist-foundation.md`](./relational-ai-assist-foundation.md), [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)).
5. **County leaders aggregate networks** — **County** (`County`, `CountyCampaignStats`, field roles) is the primary **rollup** geography; POD leaders align with **positions** / **field** story in [`field-structure-foundation.md`](./field-structure-foundation.md) and ROLE-1—implementation of “leader dashboard” is future work.

---

## 4. Repo inspection answers (Part G)

### 1. What existing models could support relational organizing today?

- **`User` + `VolunteerProfile`** — spine for **who** is organizing.
- **`RelationalContact` (REL-2)** — first-class **owner** FK, optional **county/field** and **voter** match, interaction/signal **seams**; see [`relational-contact-implementation-foundation.md`](./relational-contact-implementation-foundation.md).
- **`Commitment`** — generic `type` + **`metadata` JSON** for **ad hoc** blobs only; not the primary relational contact store once REL-2 is in use.
- **`VoterRecord` + `User.linkedVoterRecordId`** — voter spine for **volunteer** and (future) **contact** match.
- **`County`, `CountyCampaignStats`, `CountyVoterMetrics`** — county goals and progress for **rollup narrative**.
- **`FieldUnit` / `FieldAssignment` (FIELD-1)** — geographic/team structure for **where** PODs sit operationally.
- **Comms:** `CommunicationThread`, `CommunicationPlan`, `CommsPlanAudienceSegmentMember`, Tier-2 broadcast — **execution** rails when outreach is operationalized as comms (distinct from “private SMS to cousin” unless product chooses to model it).
- **`SignupSheetEntry` + intake flows** — pattern for **name/phone/county** rows with **`buildMatchCandidatesForEntry`** voter matching.

### 2. Does `VolunteerProfile` already support any of this?

**Partially, minimally.** Fields today: `availability`, `skills`, `leadershipInterest` (text/boolean)—useful for **segmenting** volunteers, **not** for storing named relational contacts or POD membership. Relations tie volunteers to **events**, **threads**, **comms segments**, **email workflow**—operational rails, not a **network graph**.

### 3. What voter file capabilities exist for matching/search?

- **Voter import** and **`VoterRecord`** warehouse with `inLatestCompletedFile` and name/phone/county matching in **`buildMatchCandidatesForEntry`** (`src/lib/volunteer-intake/match-entries-to-voters.ts`).
- **Public** registration hub links to **official** state lookup (`getArVoterRegistrationLookupUrl`)—campaign does not replace SOS for **authoritative** registration status.
- **`campaign-assist-lookup.ts`** — **stub only**; not a live person-facing matcher.

### 4. What communication tools already exist for outreach?

- **Comms workbench:** plans, drafts, sends, recipients; Tier-2 broadcast; segment members.
- **Threads / messages** for operational 1:1 comms where modeled.
- **Email workflow (E-1/E-2)** for **queue-first** triage—not for volunteer SMS auto-blast.

### 5. What is missing for a full REACH-like system?

- **First-class relational contact** model with stable FKs, dedupe, and consent posture.
- **Volunteer ↔ contact** ownership and **POD** grouping in DB.
- **Mobile-first volunteer UX** for add-contact → match → script → log outcome.
- **Rollups** from contacts to county goals (beyond aggregate voter file metrics).
- **Optional:** native integration with third-party relational apps (import/export, webhooks)—not in repo today.

### 6. What REL-2 implemented (persistence + seams)

**Shipped in REL-2** (see [`relational-contact-implementation-foundation.md`](./relational-contact-implementation-foundation.md)):

- **Schema:** `RelationalContact` + optional `VoterInteraction.relationalContactId` / `VoterSignal.relationalContactId`.
- **Helpers:** `relational-contacts.ts` (CRUD, summary, `recordRelationalTouch`); `relational-matching.ts` (read-only suggestions, `setRelationalContactVoterMatch`).
- **Admin:** `/admin/relational-contacts` (list + minimal create) and `/admin/relational-contacts/[id]` (read + suggestions; **not** auto-apply).

**Likely next (REL-3+):** county rollups, dedupe when two volunteers name the same person, volunteer-facing UI, XP hooks (GAME-2).

---

*Last updated: Packet REL-1 (concepts) + **REL-2** (persistence and docs cross-links).*
