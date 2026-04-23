# Volunteer system — philosophy foundation (VOL-CORE-1) (RedDirt)

**Packet VOL-CORE-1 (Part A).** Converts campaign **culture and tone** into **system behavior** for how volunteers **exist** in RedDirt: trust, calm leadership, and people-powered organizing—**not** a workflow engine and **not** UI. **No** schema changes in this packet.

**Authoritative tone source (“the guide”):** In-repo philosophy corpus—[`philosophy/core-principles.md`](./philosophy/core-principles.md), [`philosophy/vision-and-goals.md`](./philosophy/vision-and-goals.md), [`philosophy/positioning-and-coalition.md`](./philosophy/positioning-and-coalition.md). VOL-CORE-1 **does not** paraphrase for edge; engineering and AI behavior **must** stay consistent with those documents.

**Cross-ref:** [`volunteer-role-system.md`](./volunteer-role-system.md) · [`volunteer-onboarding-flow.md`](./volunteer-onboarding-flow.md) · [`power-of-5-system-integration.md`](./power-of-5-system-integration.md) · [`volunteer-county-integration.md`](./volunteer-county-integration.md) · [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md) · **REL-1:** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) · [`pod-system-foundation.md`](./pod-system-foundation.md) · **GAME-1:** [`volunteer-progression-foundation.md`](./volunteer-progression-foundation.md) · **ROLE-1 / FIELD-1:** [`position-system-foundation.md`](./position-system-foundation.md) · [`field-structure-foundation.md`](./field-structure-foundation.md)

---

## 1. Core beliefs

These **anchor** volunteer-facing system behavior and must match public philosophy.

| Belief | Grounding in movement docs | One-line system meaning |
|--------|----------------------------|-------------------------|
| **People-powered campaign** | Power “**organized, trained, measurable, and owned by the people**”; grassroots + technology loop ([`vision-and-goals.md`](./philosophy/vision-and-goals.md), [`core-principles.md`](./philosophy/core-principles.md)). | The product **centers volunteer agency**; data and rails **serve** organizers, not the reverse. |
| **Trust over control** | Accountability as feature; **plain-language** engagement; **community-centered** shift ([`core-principles.md`](./philosophy/core-principles.md)). | **Default yes** to safe, legal organizing actions; **governance** targets risk (PII, sends, compliance), not micromanagement of relationships. |
| **Alignment over hierarchy** | Candidate as **connector**; **structure and participation** over rhetoric alone ([`core-principles.md`](./philosophy/core-principles.md), [`vision-and-goals.md`](./philosophy/vision-and-goals.md)). | **Positions** (ROLE-1) clarify **accountability**; they do **not** substitute for **shared mission alignment** or **relational trust**. |
| **Action over permission** | “**If the people can act, power has to listen**”; contrast with barriers and opacity ([`vision-and-goals.md`](./philosophy/vision-and-goals.md), [`core-principles.md`](./philosophy/core-principles.md)). | Onboarding and nudges **prioritize a first real step**; **policy gates** apply where law, safety, or queue-first comms require—**not** generic bureaucracy. |
| **Calm, steady leadership tone** | **Clarity and contrast** without “anger as the only fuel”; **identity and history** anchor; homepage spine emphasizes **steady** movement build ([`core-principles.md`](./philosophy/core-principles.md), [`positioning-and-coalition.md`](./philosophy/positioning-and-coalition.md)). | **No** panic framing in system copy or AI; **steady, invitational** cadence. |

**Campaign line the product must embody:** Organizers should feel **trusted to lead** in their own networks—consistent with *participants → advocates → leaders* and **leadership development as strategy** ([`core-principles.md`](./philosophy/core-principles.md)).

---

## 2. System implications

Philosophy **translates** into **rules** for product, data, and AI—not slogans.

| Principle | System rule |
|-----------|-------------|
| **Volunteers can act without rigid approval** | **Low-friction** paths for: sign up, choose an organizing lane, log intent, take a **first** relational or field action. **Approval** applies to **high-risk** surfaces (bulk outreach, voter exports, auto-send-class behaviors)—already **review-first** elsewhere in FND-1—not to “talk to my five.” |
| **The system suggests, it does not command** | **Copy, prompts, and AI** use invitational language (“Consider…”, “When you’re ready…”). **No** imperative shaming; **no** fake scarcity. Assignments from staff remain **human** decisions on ASSIGN-1 rails; the **machine** does not **order** volunteers. |
| **Onboarding must feel empowering** | **Entry** foregrounds *why you’re here* and *what you care about*; **path selection** is **choice**, not a single funnel; **first action** is **small, immediate, and trust-reinforcing** (see [`volunteer-onboarding-flow.md`](./volunteer-onboarding-flow.md)). |
| **AI must reinforce tone, not override it** | Models **coach** within ALIGN-1 and [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md): calm, people-first, **human sends** for relational comms (REL-1). AI **never** overrides volunteer judgment on **who** to talk to or **what** to promise. |

---

## 3. VOL-CORE-1 is not a separate silo

Volunteer culture **binds** REL-1, GAME-1, ROLE-1, FIELD-1, and AI. The following **integration spine** is **normative** for all VOL-CORE docs.

### 3.1 Philosophy → system behavior

- **“Trusted to lead”** ⇒ low-friction onboarding; **suggest-don’t-command** UX and AI; **volunteer-chosen paths** (not rigid assignment of identity).
- **Steady tone** ⇒ no **alarmist** notifications; celebrate **meaningful** organizing milestones (GAME-1), not noise.

### 3.2 Power-of-5 → REL-1

- Core 5 commitments map to **future `RelationalContact` ownership** (REL-2), **network size**, and **relational KPIs** ([`relational-kpi-foundation.md`](./relational-kpi-foundation.md)).
- See [`power-of-5-system-integration.md`](./power-of-5-system-integration.md).

### 3.3 Volunteer roles → positions (ROLE-1)

- Titles like **County Captain** and **Evangelist** map to **`PositionId`** nodes and **`PositionSeat`** (SEAT-1)—**organizational accountability**, not GAME-1 levels.
- See [`volunteer-role-system.md`](./volunteer-role-system.md).

### 3.4 Progression (GAME-1) → access and responsibility

- **Levels** determine **what they can see, do, and lead** in-product **once implemented**—unlocks are **earned capability**, not seat title.
- Example alignment: **Organizer** → own network; **Network Builder** → mentor others; **Team Leader** → scoped assignment / POD-adjacent leadership per GAME-1 + staff confirmation.

### 3.5 AI guidance → consistent tone

- Reinforce **calm**, **people-first**, **trust-based** messaging; use **approved** scripts and ALIGN-1 layers.
- **Never:** override judgment, push **aggressive** tactics, or invent **urgency** that contradicts [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md) and philosophy docs.

### 3.6 County structure → FIELD-1

- Volunteers roll up through **`User.county` / `County`**, **`FieldUnit`**, **`FieldAssignment`**, and captain-style **`PositionId`** coverage.
- **`CountyCampaignStats.registrationGoal`** connects to **relational rollups** only with **honest** attribution language (REL-1, DATA-1).

---

## 4. Repo inspection (VOL-CORE-1)

### 4.1 What existing models support volunteer roles today?

| Evidence | Role relevance |
|----------|----------------|
| **`VolunteerProfile`** (1:1 `User`) | Canonical **volunteer** record; comms, events, segments—**not** org chart titles. |
| **`User`** | Identity spine; `county`, `zip`, `linkedVoterRecordId`. |
| **`FieldAssignment`** | Binds **`fieldUnitId`** + **`positionId`** (`PositionId` from `positions.ts`) + optional `userId` / `positionSeatId`—**field + role** coverage (FIELD-1, SEAT-1). |
| **`PositionSeat`** | **Who** occupies a position key—**staffing metadata**, not RBAC. |
| **`Commitment`** | Typed per-user pledges (`type`, `metadata`)—**ad hoc** program hooks (e.g. organizing pledges). |
| **`EventSignup`** | Participation signal for field/events. |
| **`positions.ts` `PositionId` tree** | **Named** operational roles for **accountability** and workbench hints—volunteer-facing titles **map** here (see [`volunteer-role-system.md`](./volunteer-role-system.md)). |

**Gap:** No first-class “County Captain” string in Prisma—**naming** is **overlay** on `county_regional_coordinator` + geography + seat.

### 4.2 How does `VolunteerProfile` currently work?

- **Fields:** `availability`, `skills` (free text), `leadershipInterest` (boolean); relations to `EventSignup`, comms recipients, queue targets, segment membership ([`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md)).
- **Meaning today:** Strong **join** point for **comms and events**; **weak** for program stage, county captaincy, or ROE metrics without REL-2 or VOL-CORE-2 fields.

### 4.3 What parts of onboarding already exist?

- **Public forms** → **`POST /api/forms`** → `User` + `Submission` + optional **`VolunteerProfile`** / **`Commitment`** ([`public-site-system-map.md`](./public-site-system-map.md)); paths like get-involved / host-a-gathering / local team.
- **Gaps:** No **single** VOL-CORE **journey** object; **no** mandatory **Power-of-5** step in code; **no** volunteer-facing progression shell (GAME-1 docs only).

### 4.4 What systems can already support Power-of-5?

- **Conceptual / docs:** [`pod-system-foundation.md`](./pod-system-foundation.md) (Core 5 definition, POD leader, county rollups).
- **Data precursors:** `Commitment.metadata` could record a **pledge** structure until REL-2; **`VolunteerProfile`** has no Core-5 columns.
- **Field / county:** `User.county`, `FieldAssignment` for **where** the organizer sits in geography.

### 4.5 What gaps exist between philosophy and system?

- **Trust and calm tone** are **not** yet enforced by product mechanics everywhere—much is **operator-dependent**.
- **Action-over-permission** can **collide** with **admin-gated** workbenches (`requireAdminPage`)—volunteers are **mostly** off workbench today.
- **Alignment-over-hierarchy** requires **clear** distinction between **PositionId** (accountability) and **GAME-1 level** (earned capability)—easy to conflate without docs (this packet).

### 4.6 What should VOL-CORE-2 implement next?

- **Volunteer-facing home** (minimal): path selection, Core 5 intro, link to first action—**without** full ROE schema if needed phased.
- **REL-2 `RelationalContact`** + owner FK—**enables** honest Power-of-5 and KPIs.
- **Structured `Commitment` or enrollment** types (Zod-validated) for “my five” until REL-2 mature.
- **PositionSeat + FieldAssignment** patterns for **County Captain** coverage in **admin** tooling.
- **AI:** register VOL-CORE tone in prompts / `user-context.ts` per [`volunteer-ai-guidance.md`](./volunteer-ai-guidance.md).

### 4.7 Where do REL-1, GAME-1, and Position systems overlap or conflict?

| Overlap / tension | Resolution |
|-------------------|------------|
| **REL-1 KPIs vs GAME-1 XP** | Same events should **feed** both; **one** idempotent event log (future) avoids double semantics. |
| **GAME-1 “Team Leader” vs ROLE-1 seat** | **Progression** does **not** grant org authority; **seats** still human-assigned (TALENT-1). |
| **POD Leader vs `county_regional_coordinator`** | May be **same person** or not; **two lenses**—relational coaching vs field staffing—document both in [`volunteer-role-system.md`](./volunteer-role-system.md). |
| **TALENT-1 vs GAME-1** | Both address growth; **TALENT** = advisory to **staff**; **GAME** = volunteer-facing **earned unlocks**—keep **human finality** in both. |

### 4.8 Clean separation of roles, progression, and networks

| Layer | Owns | Connects via |
|-------|------|--------------|
| **Roles (positions)** | **Who is accountable** on the org chart for a geography or function | `PositionId`, `PositionSeat`, `FieldAssignment`, parent/child in `positions.ts` |
| **Progression (GAME-1)** | **What a volunteer has earned** to see/do/lead | Future progression state + unlock rules tied to **same** `User` / `VolunteerProfile` |
| **Networks (REL-1)** | **Who they organize** | Future `RelationalContact.volunteerUserId` (REL-2), KPI rollups |

**Glue:** One **`User`**; **optional** links from relational rows to **`County`** / voter file; **FieldAssignment** explains **where** positional accountability sits; **GAME-1 never replaces `PositionSeat`**.

---

*Last updated: Packet VOL-CORE-1 (Parts A, G, I, J).*
