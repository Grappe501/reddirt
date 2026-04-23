# Voter signal inventory — multi-source intelligence (DATA-3) (RedDirt)

**Packet DATA-3 (multi-signal).** Inventory of **voter-related signal sources**: what the **repo’s schema** can represent today, what **must be ingested** from files/lists the campaign holds **outside** this inventory, and **reliability** notes. **No numeric scoring.**

**Evidence:** `prisma/schema.prisma`, [`targeting-data-inventory.md`](./targeting-data-inventory.md) (DATA-2), [`data-targeting-foundation.md`](./data-targeting-foundation.md), [`relationship-data-model-foundation.md`](./relationship-data-model-foundation.md) (REL-2 sketch).

**Cross-ref:** [`voter-strength-model.md`](./voter-strength-model.md) · [`voter-signal-combination.md`](./voter-signal-combination.md) · [`geographic-targeting-model.md`](./geographic-targeting-model.md) · [`targeting-future-layers.md`](./targeting-future-layers.md)

---

## 1. Voter file (`VoterRecord`)

| | |
|--|--|
| **Represents** | **Registration roll** identity: SOS-style key, county, optional `precinct` string, optional name/phone, registration date, in/out of latest file. |
| **Reliability** | **High** for “on roll / not” **as of last completed snapshot** — not for vote choice. |
| **Support / engagement signal** | **Structural only**: geography, contactability (if phone), **registration recency**. **Not** partisan strength. |

---

## 2. Voter history (“vote history files”)

| | |
|--|--|
| **Represents (conceptual)** | Per-voter or aggregate **participation** in past elections (votes cast, not vote choice — depending on source law and file layout). |
| **In Prisma today** | **No** `VoterHistory`, `VoteRecord`, or equivalent model **found** in `schema.prisma`. **`VoterSnapshotChange`** is **registration churn**, not electoral history. |
| **Reliability** | **N/A in-app** until ingest design + migration (DATA-4+). Files **off-repo** are **campaign assets** — must map to `voterFileKey` or PII-safe join. |
| **Support signal (when ingested)** | **Turnout propensity** / **frequency** — still **not** “D vs R” unless source includes party primary or modeled field **explicitly**. |

---

## 3. Ballot initiative signer data

| | |
|--|--|
| **Represents** | People who **signed** a petition / initiative — **strong civic engagement** and possible **issue alignment** (depends on initiative). |
| **In Prisma today** | **No** dedicated `InitiativeSigner` or `PetitionSignature` model. **Possible** partial proxies: **`SignupSheetEntry`** (if sign-in sheets capture petition events), **`Submission`** + `structuredData` (if forms store signer captures), **`User`** created from forms — **each** requires **documented** form types and **human** QA. |
| **Reliability** | **Medium** once rows are **matched** to `VoterRecord` or `User`; **low** until match provenance exists. |
| **Support signal** | **Engagement + issue proximity** — **not** automatic general-election vote. |

---

## 4. Donor / past-campaign contact lists

| | |
|--|--|
| **Represents** | **Financial support** (`FinancialTransaction` **CONTRIBUTION** with optional `relatedUserId`), or **lists** not yet modeled (spreadsheets, prior CRM). |
| **In Prisma today** | **`FinancialTransaction`**: `transactionType` includes **`CONTRIBUTION`**; **`relatedUserId`** → `User` when set. **Not** a full donor CRM; **no** `DonorProfile` table. **Comms** audiences: `CommsPlanAudienceSegmentMember`, `CommunicationCampaignRecipient`, etc. — **membership** as signal, **opaque** rules. |
| **Reliability** | **High** for **confirmed ledger** rows; **variable** for segment membership (depends on ops). |
| **Support signal** | **CONTRIBUTION** → **strong material support**; segment membership → **targetable intent** if SOP defines it. |

---

## 5. Volunteer / contact lists

| | |
|--|--|
| **Represents** | **`VolunteerProfile`** (1:1 `User`), **`EventSignup`**, **`Commitment`**, **`FieldAssignment`**, team roles (`TeamRoleAssignment`), asks (`VolunteerAsk`). |
| **Reliability** | **High** for “is a known volunteer / signed up for event”; **moderate** for `User.county` string vs `County` FK. |
| **Support signal** | **Organizing engagement** — correlates with **support** in practice but is **not** a secret-ballot proof. |

---

## 6. Relational networks (REL-2)

| | |
|--|--|
| **Represents** | **`RelationalContact`** (future) — volunteer-owned relationships, disposition, match to `VoterRecord`. |
| **In Prisma today** | **Not** present (REL-1 docs only). |
| **Support signal** | **Conversation-derived** (when captured) — **high value** for **program** once REL-2 ships. |

---

## 7. Polling or analytics in repo

| | |
|--|--|
| **Represents** | **Social** analytics (`SocialContentItem` scores, `AnalyticsRecommendationOutcome`), **conversation** monitoring — **not** representative samples of the **electorate**. |
| **Reliability** | **High** for “what performed on social”; **not** a substitute for **voter-file** or **survey** targeting. |

---

## 8. County registration goals & metrics

| | |
|--|--|
| **Represents** | **`CountyCampaignStats`**, **`CountyVoterMetrics`**, optional **`CountyPublicDemographics`**. |
| **Reliability** | **High** for **registration** narrative at **county** level. |
| **Support signal** | **Not** voter-level — used for **geographic prioritization** (see [`geographic-targeting-model.md`](./geographic-targeting-model.md)). |

---

## 9. Repo inspection (DATA-3 multi-signal)

1. **Where do voter history signals exist in the repo?** **In code/DB:** **not** as a dedicated model — only **registration** lifecycle on **`VoterRecord`** / **`VoterSnapshotChange`**. **Vote history** requires **future ingest** (DATA-4+).
2. **Is ballot initiative data already stored?** **No** first-class signer table. **Possible** traces in **`SignupSheetEntry`**, **`Submission`**, or **`User`** depending on **which** forms/pipelines ops use — must be **audited per deployment**.
3. **Where are donor/contact lists stored?** **Contributions:** **`FinancialTransaction`** (`CONTRIBUTION`, `relatedUserId`). **Lists:** **`CommsPlanAudienceSegment`**, **`AudienceSegment`**, campaign recipients — **JSON/rules** vary; **not** unified donor warehouse.
4. **Easiest dataset to integrate first?** **Already in DB:** **`User`** + **`VolunteerProfile`** + **`EventSignup`** + **`linkedVoterRecordId`** + **confirmed** **`CONTRIBUTION`** rows — join keys are **defined**. **New file types** (history, initiative) need **schema + ingest**.
5. **Strongest signals *in schema today*?** **Donor (ledger)**, **volunteer/event participation**, **voter roll presence + county**, **comms segment membership** (if governed). **Weakest for “base”:** no party, no GE vote history in Prisma.
6. **DATA-4 next?** **Choose one:** (a) **`VoterParticipationSignal`** / history staging table + ingest from campaign files, (b) **`InitiativeSignature`** / generic **`ExternalPersonSignal`** with `signalType` + provenance, (c) **election results** per [`election-results-foundation.md`](./election-results-foundation.md) — **migration + governance** before any **auto** classification UI.

---

*Last updated: Packet DATA-3 (multi-signal, Part A + F).*
