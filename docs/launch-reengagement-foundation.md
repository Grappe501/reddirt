# Launch re-engagement — foundation (LAUNCH-1) (RedDirt)

**LAUNCH-1** describes how to **wake** the **existing** **campaign** **engine** with a **first** **wave** of **honest, consent-aware** re-engagement to **~100+** **known** **people**—using **only** **models** and **surfaces** **already in** **the** **repo** (see [`database-table-inventory.md`](./database-table-inventory.md), [`data-targeting-foundation.md`](./data-targeting-foundation.md), [`communications-unification-foundation.md`](./communications-unification-foundation.md)).

**Cross-ref:** [`launch-segmentation-and-response-foundation.md`](./launch-segmentation-and-response-foundation.md) · [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) · `src/lib/campaign-engine/launch.ts` (types + **read-only** **counts**)

---

## 1. North star

**“Launch”** here means **re-engaging** **known** **supporters** / **volunteers** / **email** **followers**, **capturing** **renewed** **intent** (in reply, form, or **staff**-coded follow-up), **routing** **responses** into the **right** **rails** (`WorkflowIntake`, `EmailWorkflowItem`, `CommunicationThread`, tasks), and **only** then letting **downstream** **work** **(comms,** **field,** **events)** **activate** on **real** **human** **signal**. The system **strengthens** as **replies** **arrive**—**not** because a **model** **guessed** **who** **cares**.

---

## 2. Launch audience (grounded in Prisma)

| Cohort (concept) | **Repo grounding** | Notes |
|------------------|--------------------|--------|
| **Users with `VolunteerProfile`** | `VolunteerProfile` 1:1 `userId` | **Strong** volunteer spine; `availability`/`skills` are **unstructured** text. |
| **Users linked to a voter file row** | `User.linkedVoterRecordId` → `VoterRecord` | **Assistance** and **geography** (county, **optional** `precinct` string on **voter**). |
| **Event signups (may or may not have resolved `User`)** | `EventSignup` has **`userId`**, `volunteerProfileId`, and **always** `email` (and names) | Use **as** a **re-engagement** **source** for **“met** us **at** an **event”**; **dedupe** by **email** in **ops**. |
| **Form submissions (historical intent)** | `Submission` with optional `userId` | Route **new** **responses** into **`WorkflowIntake`** **per** **existing** **patterns**; **not** **auto**-blast **all** `Submission` **rows** **without** **review**. |
| **Comms / segment members (if already built)** | `CommsPlanAudienceSegmentMember`, `CommunicationCampaignRecipient` | **Only** if **consent** and **list** **provenance** are **known**; **no** **assumed** **opt-in**. |
| **Unregistered or unresolved** | **`User`** with **no** **voter** **link** **or** **only** `EventSignup` / **`Submission` **without **merge** | **Separate** **SOP**; **may** **need** **manual** **thread** or **intake** **to** **attach** **identity** **(IDENTITY-1** **doc**). |

---

## 3. Re-engagement motion (conceptual, no new automation)

1. **Identify** a **bounded** **list** (export **from** **DB** **or** **read-only** **helpers** on **`User`**, **`VolunteerProfile`**, **`EventSignup`**—see `launch.ts`).
2. **Send** a **re-engagement** **message** through an **existing** **execution** **path** **with** **human** **review** ( **[`communications-unification-foundation.md`](./communications-unification-foundation.md)**: **Comms** **workbench** **`CommunicationSend`**, or **Tier-2** **`CommunicationCampaign`**, or **1:1** **thread**—**not** all three **for** **the** **same** **audience** **without** **policy**).
3. **Capture** **response**: **inbound** **email** / **form** / **admin**-logged call → **`Submission`**, **`WorkflowIntake`**, **`EmailWorkflowItem`**, or **`CommunicationThread` **per **E-1** and **intake** **patterns**.
4. **Classify** **intent** ( **human** **+** **optional** **E-2A** on **`EmailWorkflowItem`**, **or** **structured** **form** **field**s)—see **Part** **4** **below** **and** [`launch-segmentation-and-response-foundation.md`](./launch-segmentation-and-response-foundation.md).
5. **Route**: **assign** **`WorkflowIntake`**, create **`CampaignTask`**, or **triage** **`EmailWorkflowItem` **—**position** / **seat** **labels** in **docs** only **(ROLE-1) **until **routing** **fields** **exist** **on** **rows**.
6. **Update state** (`VolunteerProfile`, `ContactPreference`, `Commitment`, or notes on intake / E-1 item)—not a new status enum in LAUNCH-1 (no schema change in this packet).

---

## 4. First response types (vocabulary for ops + future metadata)

Tie **inbound** **to** one **of** **these** **(staff**-labeled **at** **first,** **not** **ML** **segmentation** **defaults**):

- **Wants** to **volunteer** (time / skills) → field / volunteer **coord** **intake** **narrative** .
- **Wants updates only** (low-touch) → comms list + `ContactPreference` honesty (email `OPT_IN` where appropriate and policy allows).
- **Wants** **event** **info** → **`CampaignEvent`**, **maybe** `EventSignup` or **`WorkflowIntake` **with** **event** **request** **pattern** **.**
- **Donate** **later** / **not** **now** → **fundraising** **desk** **story** **(FUND-1** **);** **no** **auto** **charge** **.**
- **Local** / **county** **involvement** → **`User.county`**, **`County`**, or **`FieldAssignment` **(FIELD-1) **+** **tasks** **.**
- **Not** **interested** / **suppress** → **`ContactPreference`**, **global** **unsubscribe** **patterns**; **no** **re**-**add** **without** **consent** **.**
- **Unclear** → **`EmailWorkflowItem` **(E-1) **or** **intake** **awaiting** **info** **.**

**Types** in **`src/lib/campaign-engine/launch.ts` **( **`LaunchResponseIntent`**) are **naming** **only**—**persistence** **in** a **future** **LAUNCH-2** **packet** **if** **needed** **.**

---

## 5. Existing system support (by model / surface)

| Need | **Use** |
|------|--------|
| **Who** | `User`, `VolunteerProfile`, `ContactPreference`, `VoterRecord` **via** `linkedVoterRecordId` |
| **What** they **did** | `Submission`, `EventSignup`, `CommsPlanAudienceSegmentMember` / **`CommunicationCampaignRecipient` **(if** **applicable) |
| **Send** (reviewed) | `CommunicationPlan` + **`CommunicationSend`** + **recipients** **OR** `CommunicationCampaign` **+** **recipients** **OR** **1:1** `CommunicationMessage` + **`StaffGmailAccount` **(reply** path) **—** **pick** **one** **primary** **path** **per** **wave** **(COMMS-UNIFY-1) **. |
| **Triage** | `EmailWorkflowItem` **(E-1)**, `WorkflowIntake` **,** **`CommunicationThread` **(Tier** **1) |
| **Work** | `CampaignTask` **,** **`VolunteerAsk` **,** **calend** / **event** **objects** as **appropriate** **. |

---

## 6. What is out of scope (LAUNCH-1)

- A **new** **marketing** **automation** **or** **journey** **builder** **.**
- **ML** **segmentation** or **“** **smart** **lists** **”** **without** **provenance** **.**
- **Hidden** **opt-in,** **auto**-**send** **to** **cold** **lists,** **or** **unsupervised** **SMS** **(Tier** **1** **still** **needs** **Twilio** **+** **consent** **truth** **).**
- **Merging** **all** **comms** **products** **into** **one** **send** **codepath**—see **COMMS-UNIFY-1** **;** **LAUNCH-1** **chooses** **per** **wave** **.**
- **Schema** **changes** **(LAUNCH-1) **;** **status** **for** **re-engagement** **waves** **can** **live** **in** **runbooks** **or** **`CommunicationPlan` **`metadataJson` **later** **.**

---

*Last updated: Packet LAUNCH-1.*
