# Launch segmentation & response — foundation (LAUNCH-1) (RedDirt)

**Companion** to [`launch-reengagement-foundation.md`](./launch-reengagement-foundation.md). **Segmentation** here means **honest,** **defensible** **buckets** **from** **existing** **columns**—**not** **synthetic** **scores** **or** **implied** **permission** **to** **message** **everyone** **.**

**Cross-ref:** [`data-targeting-foundation.md`](./data-targeting-foundation.md) · [`volunteer-data-gap-analysis.md`](./volunteer-data-gap-analysis.md) · `src/lib/campaign-engine/launch.ts` (types + `countLaunchAudienceByKind`)

---

## 1. Launch segments (v1—simplest defensible)

| Segment id (concept) | **Rule (database)** | **Caution** |
|---------------------|----------------------|------------|
| **`has_volunteer_profile`** | `VolunteerProfile` **exists** **for** **`userId` **| Still **check** **ContactPreference** / **bounces** **before** **blast** **.**
| **`has_linked_voter`** | `User.linkedVoterRecordId` **is** **not** **null** | **Voter** **row** **does** **not** **imply** **email** **consent** **;** **consent** **is** **separate** **.**
| **`email_opt_in`** (user rows) | `ContactPreference` **for** `userId` **with** **`emailOptInStatus = OPT_IN` **| **Unknown** = **treat** **as** **not** **opted** **in** **for** **broadcast**-**scale** **;** **confirm** **policy** **with** **ops** **.**
| **`event_attendee_merged_user`** | `EventSignup.userId` **not** **null** | **Good** **warmth** **;** **dedupe** **emails** **.**
| **`all_users` (counting only)** | `User` **count** | **Not** a **send** **segment** **by** **itself** **.**
| **`comms_segment_member`** (if used) | `CommsPlanAudienceSegmentMember` **row** | **Provenance** **required**—**how** **did** **they** **get** **on** **the** **list** **?**

**There is** **no** **“** **launch** **score** **”** **column** **;** **LAUNCH-1** **does** **not** **add** **one** **.**

---

## 2. Response capture model

| Path | Lands in | When to use |
|------|----------|-------------|
| Public form (volunteer / movement / generic) | `Submission` → optional `WorkflowIntake` | Clear CTA to one form per wave. |
| Reply to a campaign email (human mailbox or tracked thread) | `CommunicationMessage` (INBOUND) + `CommunicationThread`; may spawn `EmailWorkflowItem` manually | 1:1 feel; E-1 for triage. |
| Staff-logged work | `EmailWorkflowItem` (manual) or note on `WorkflowIntake` | Unclear inbound. |
| “Want to help” but no form | `WorkflowIntake` + `assignedUserId` | Messy replies default here. |

Volunteer state remains `VolunteerProfile` + `EventSignup` + future pipeline (no single enum in LAUNCH-1).

---

## 3. Response-triggered “engine activation” (principle)

- **The** **engine** **(UWR-1,** **E-1,** **intakes,** **tasks)** **only** **“** **wakes** **”** **when** **there** **is** **a** **durable** **row**: **intake,** **workflow** **item,** **thread** **message,** **or** **task** **created** **from** **real** **response** **or** **staff** **commitment** **.**
- **Each** **response** **should** **ideally** **strengthen**: **`User` **(identity) **,** **intent** **(in** **summary** **/ **intake) **,** **assignment** **(`WorkflowIntake.assignedUserId`**, **`EmailWorkflowItem.assignedToUserId`**, **tasks) **,** **and** **consent** **(`ContactPreference`)** **—** **even** **if** **only** **one** **of** **these** **updates** **per** **reply** **.**
- **No** **silent** **profile** **mutation** **from** **LLM** **;** **E-2A/B** **rules** **apply** **on** **email** **queue** **.**

---

## 4. Human governance (non-optional)

- **List** **selection** for **sends** **(who** **is** **in** **the** **~100) **: **human** **approved** **.**
- **Message** **copy** and **Send** / **Campaign** / **Gmail** **path** **: **human** **approved** **(COMMS-UNIFY-1) **.**
- **First** **interpretation** **of** **reply** **: **operator** **or** **E-2A** **with** **review** **—** **not** **auto**-**file** **to** **volunteer** **without** **policy** **.**
- **Suppression** / **unsubscribe** **: **honor** **`ContactPreference` **and** **SendGrid** /** **provider** **state** **;** **no** **“** **re-engagement** **”** **to** **suppressed** **addresses** **.**
- **Youth** / **sensitive** **: **see** **YOUTH-1** **and** **compliance** **rails** **—** **LAUNCH-1** **does** **not** **bypass** **.**
---

*Last updated: Packet LAUNCH-1.*
