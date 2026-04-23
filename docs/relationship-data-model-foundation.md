# Relationship data model — foundation (REL-1) (RedDirt)

**Packet REL-1 (Part C).** Conceptual spec for a **future** **Relationship / RelationalContact** entity. **No** `schema.prisma` change in REL-1; this doc is the contract for **REL-2** implementation review.

**Cross-ref:** [`relational-organizing-foundation.md`](./relational-organizing-foundation.md) · [`relational-voter-integration.md`](./relational-voter-integration.md) · [`identity-and-voter-link-foundation.md`](./identity-and-voter-link-foundation.md)

---

## 1. Entity: Relationship (working name)

**Purpose:** Represent **one named person** in a volunteer’s outreach universe with enough structure to match voters, track outreach state, and roll up KPIs—without requiring that person to be a `User`.

**Suggested Prisma name (REL-2):** `RelationalContact` or `VolunteerRelationship` (final name in migration review).

---

## 2. Conceptual fields

| Field | Type (conceptual) | Notes |
|-------|-------------------|--------|
| **id** | stable PK | cuid/UUID |
| **volunteerUserId** | FK → `User` | **Owner** of this relationship row; must align with `VolunteerProfile.userId` for active organizers |
| **displayName** | string | Human-entered; may be partial for privacy |
| **phone** | string? | Normalized in app layer (match to `VoterRecord` patterns) |
| **email** | string? | Optional; consent-sensitive |
| **relationshipType** | enum or string | e.g. `FAMILY`, `FRIEND`, `COWORKER`, `FAITH`, `NEIGHBOR`, `OTHER` |
| **inCoreFive** | boolean | Member of Power-of-5 core for this cycle |
| **podGroupId** | optional FK or string | Future: tie to POD cluster (REL-2+) |
| **matchedVoterRecordId** | optional FK → `VoterRecord` | Set only after **human-confirmed** or high-confidence policy |
| **matchConfidence** | enum? | e.g. `UNMATCHED`, `SUGGESTED`, `CONFIRMED`, `AMBIGUOUS` |
| **registrationStatusKnown** | enum? | `UNKNOWN`, `LIKELY_REGISTERED`, `LIKELY_UNREGISTERED`, `CONFIRMED_REGISTERED`, `CONFIRMED_UNREGISTERED` — **campaign-reported** or file-backed; not SOS legal truth unless sourced |
| **persuasionLevel** | enum? | e.g. `UNKNOWN`, `HARD_NO`, `LEAN_NO`, `PERSUADABLE`, `LEAN_YES`, `HARD_YES` — **volunteer judgment** |
| **contactStatus** | enum | e.g. `NOT_CONTACTED`, `ATTEMPTED`, `REACHED`, `COMMITTED`, `DECLINED`, `DO_NOT_CONTACT` |
| **lastContactedAt** | datetime? | Optional log; channel in separate field in REL-3 if needed |
| **notes** | text? | Operator-only; minimize PII in free text |
| **metadataJson** | JSON | Namespaced extensions (`roe*`) for AI provenance, import IDs, etc. |
| **createdAt / updatedAt** | datetime | Standard |

**Privacy:** This model handles **PII**; REL-2 must align with campaign privacy policy, retention, and **no** training on raw message bodies unless explicitly governed.

---

## 3. Connections

### To `User` (volunteer)

- **Required:** `volunteerUserId` → the organizing volunteer.
- **Optional future:** `subjectUserId` if the relational contact **later** creates a `User` (merge story; IDENTITY-1).

### To `VoterRecord`

- **Optional:** `matchedVoterRecordId` when file match is accepted.
- **Do not** assume every contact becomes a voter row—many contacts will stay **unmatched** or **unregistered**.

---

## 4. What not to model yet

- Full **graph** edges (multi-hop) unless product requires it.
- **Automated** scraping of phone contacts from devices (consent nightmare)—out of scope for REL-1.

---

*Last updated: Packet REL-1.*
