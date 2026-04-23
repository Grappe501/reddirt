# Identity & voter link — foundation (IDENTITY-1) (RedDirt)

**IDENTITY-1** defines a **durable** way to think about **who** a row refers to: **voter file identity** (when available), **campaign contact** identity (`User`), and **volunteer** / **youth** / **unregistered** fallbacks — **as implemented today**.

**Evidence:** `prisma/schema.prisma` (`User`, `VolunteerProfile`, `VoterRecord`, `ContactPreference`, `SignupSheetEntry`, `VolunteerMatchCandidate`) · `src/lib/voter-file/*` · workbench DTOs.

**Cross-ref:** [`data-targeting-foundation.md`](./data-targeting-foundation.md) · [`youth-pipeline-foundation.md`](./youth-pipeline-foundation.md) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md)

---

## 1. Voter_id as **primary** identity (when available)

- **`VoterRecord.id`** (Prisma) is the **internal** primary key; **`VoterRecord.voterFileKey`** is the **canonical, unique** import key from the **SOS / vendor** file (see model comments in schema).
- In documentation, **“voter id”** should mean: **either** the **`VoterRecord.id`** **or** the **`voterFileKey`**, with **`voterFileKey`** as the **durable** match to **repeated imports**; **clarify in UI** and **ETL** which one is **shown** to **staff**.

**When available:** a **person** who appears on the **voter file** is **best** represented by **`VoterRecord`** for **assistance** and **geography** (county, **optional** precinct string).

---

## 2. Fallbacks when **not** a registered voter (or not linked)

| Persona | How the repo models “identity” | Notes |
|---------|----------------------------------|--------|
| **Volunteer** | **`User`** (email **unique**) + optional **`VolunteerProfile`** 1:1 | No `VoterRecord` **required** |
| **Youth** | Same as volunteer unless **policy** adds **separate** flows; **YOUTH-1** is **governance** **doc**; **no** `isMinor` on **`User`** in **schema** at IDENTITY-1 time | **Do not** invent age fields in product without **compliance** **review** |
| **Non-registered** / **unknown voter** | **`User`**, **`primaryEmail` / `primaryPhone` on** `CommunicationThread` **without** `userId` | Or **`crmContactKey`** on **comms** **recipient** rows |
| **Content-only / inbound** | **`InboundContentItem`** (public content) has **no** `User` | Not “constituent identity” in **CRM** **sense** |

**Rule:** **One** real person may have **`User`**, **optional** `VoterRecord` **link**, and **many** **threads** / **sends** — **merge** story is **email** **upsert** + **admin** **linking** to **voter** **row**, **not** automatic **in all** **paths**.

---

## 3. Linking `User` → voter record

- **`User.linkedVoterRecordId` → `VoterRecord`** (optional; **onDelete SetNull**).
- **Signup & sheet intake:** `SignupSheetEntry` **matches** to **`VoterRecord`** via **`matchedVoterRecordId`** and **`VolunteerMatchCandidate`** **scored** **candidates** (not auto-trusted for **every** use case without **review**).
- **No** reverse required **unique** constraint on `VoterRecord` → **one** `User` **only**; **in practice** campaigns **enforce** 1:1 by **SOP** — **code** has **`User` links** to **one** **voter** **row** when set.

---

## 4. Login strategy (concept only)

- This repo is **not** a full **voter** **portal** product spec in IDENTITY-1. **Typical** pattern implied by code: **NextAuth**-style or **app** **auth** for **public** `User` **sessions**; **admin** is **separate** **`ADMIN_SECRET`** **cookie** session.
- **Voter** **identity** in **VAN**-sense **(My Voter)** is **not** the same as **web login**; **any** “**I am on the roll**” **self-service** **link** is **out of scope** in **this** **foundation** **doc** until **a** **packet** **lands**.

---

## 5. Unification with **COMMS-UNIFY-1**

- **All** high-leverage comms should **resolve** a **spine** where possible: **`User.id`**; **if** the contact is **only** a **raw** **address**, use **`CommunicationThread`** and **`CommunicationRecipient`** provenance — **not** a second pretend **`User`**.

---

*Last updated: Packet IDENTITY-1.*
