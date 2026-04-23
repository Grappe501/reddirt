# Volunteer data — gap analysis (DATA-1 / IDENTITY-1) (RedDirt)

**Purpose:** **Exact** read of what **`VolunteerProfile`** (and **nearby** models) support today vs what **goals, geography, targeting, leadership,** and **performance** **need** in a **mature** program — **without** adding columns in this packet.

**Source:** `prisma/schema.prisma` (`VolunteerProfile`, `User`, `Commitment`, `FieldAssignment`, `EventSignup`, `CommsPlanAudienceSegmentMember`, …)

---

## 1. What `VolunteerProfile` currently supports

| Field / relation | Meaning |
|------------------|---------|
| **1:1** **`userId` → `User`** | **Canonical** **volunteer** **spine** |
| **`availability`**, **`skills`** | **Free** **text** — **unstructured** |
| **`leadershipInterest`** | **Boolean** — **not** a **ladder** **stage** |
| **`eventSignups`**, **`communicationThreads`**, **`contactPreference`** | **Participation** and **comms** **consent** **surface** |
| **Broadcast** **`CommunicationCampaignRecipient`**, **workbench** **`CommunicationRecipient`**, **segment** **`CommsPlanAudienceSegmentMember`** | **Inclusion in sends** and **message-plan** **audiences** |
| **`emailWorkflowItems`**, **queue** as **`QueueTargetVolunteer`** | **Ops** **triage** **links** |

**Conclusion:** Strong **as** a **join** point between **`User`**, **comms**, **events**, and **email** **workflow**; **weak** for **program management** **metrics** **without** other tables or **`metadata`**.

---

## 2. Gaps: goals

- **No** per-volunteer **target** (hours, doors, **calls**).
- **County**-level **volunteer** numbers live on **`CountyCampaignStats`**, not **per** **person**.

**Strategic** **gap:** “**Volunteer** **goal** **assignment**” is **not** a **Prisma** **field**; **`Commitment.type` + `metadataJson`** is the **only** **generic** **per-user** **structured** **hook** today — **ad hoc**.

---

## 3. Gaps: geography

- **`User`**: `zip`, **`county`** (string, **not** always FK to **`County`**), `interests[]`.
- **`FieldAssignment`**: can attach a **`User` to** a **`FieldUnit`** (FIELD-1) + **position** — **formal** **geography** **link** for **org**, **opt-in** **data** **entry**.
- **No** **precinct** on **`User` or** **`VolunteerProfile`**; **precinct** only on **`VoterRecord`** and **indirect** via **`linkedVoterRecord`**.

---

## 4. Gaps: targeting

- **Volunteer** is **not** a **VAN**-style **universe** **row**; **targeting** for **sends** uses **`CommsPlanAudienceSegmentMember`** and **`AudienceSegment`** (Tier 2) — **separate** **concepts** from **`VolunteerProfile`** **except** where **the same** `User` / **`volunteerProfileId`** is **a** **member**.

---

## 5. Gaps: leadership

- **Only** `leadershipInterest` **bit**; **no** **role** **enum**, **no** **mentor** **graph**, **no** **youth** **chaperone** **flags** in **schema** (covered in **YOUTH-1** **docs**).

---

## 6. Gaps: performance tracking

- **Event** **attendance** via **`EventSignup`**; **comms** **engagement** via **recipient** **events** (when the volunteer is a **recipient**).
- **No** **unified** **“hours served”** or **canvassing** **stats** on **`VolunteerProfile`**; **tasks** use **`CampaignTask`** **assigned** to **User** — **fragmented** **labor** **accounting**.

---

## 7. What “good” might look like (future packets, not this doc)

- **Optional** `VolunteerProgramEnrollment` (stage, **goal**, **field unit**) **or** **strict** use of **`Commitment`** with **Zod**-validated **metadata**.
- **Link** **FIELD-1** **assignments** to **reporting** **views**; **link** **VoterRecord** for **canvass** **universe** when **ethically** and **compliance-correct**.

---

*Last updated: DATA-1 / IDENTITY-1 volunteer gap **analysis** (no **schema** **changes** in **this** **packet**).*
