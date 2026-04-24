# REL-2 — Relational Contact + Power-of-5 Persistence Foundation

Implementation reference for durable relational organizing and Power-of-5 metadata in PostgreSQL (Prisma).

## 1. What REL-2 implements

- **`RelationalContact`**: one row per person in a volunteer’s network, always with a required **owner** (`User.id`) and **display name**.
- Optional links to **`County`**, **`FieldUnit`**, and **`VoterRecord`** (`matchedVoterRecordId`) with explicit **match status** and optional **`ModelConfidence`** (reuse from VOTER-MODEL-1).
- **Power-of-5**: `isCoreFive` and optional `powerOfFiveSlot` (1–5 when set). The schema does not enforce “exactly five” rows per user; gradual entry is allowed.
- **Seams** on **`VoterInteraction`** and **`VoterSignal`**: optional `relationalContactId` for provenance when a touch or signal is intentionally tied to a relational contact.

Helpers live in:

- `src/lib/campaign-engine/relational-contacts.ts` — CRUD + summary + `recordRelationalTouch`
- `src/lib/campaign-engine/relational-matching.ts` — read-only suggestions + `setRelationalContactVoterMatch`

Admin (read-heavy + minimal create): `/admin/relational-contacts`, `/admin/relational-contacts/[id]`.

## 2. How RelationalContact connects to Power-of-5

- **Core five** is represented by `isCoreFive` and optional `powerOfFiveSlot` (validated 1–5 in helpers when provided).
- Counts are **operational** (how many slots the volunteer marked), not projection of votes or turnout.
- No scoring, streaks, or gamification (that is a later packet, e.g. GAME-2).

## 3. How it connects to VoterRecord

- `matchedVoterRecordId` is **optional**; a contact can exist without a voter file row.
- `matchStatus` / `matchConfidence` document human review; **not** “verified registration” unless staff explicitly records that elsewhere.
- **`suggestVoterMatchesForRelationalContact`** returns candidates only; **`setRelationalContactVoterMatch`** is the explicit write path (human actor + confidence + metadata provenance).
- Voter file rows do not carry email; email “match” is documented as N/A in suggestion reasons.

## 4. How it connects to VoterInteraction and VoterSignal

- **`recordRelationalTouch`**: may create a **`VoterInteraction`** when `INTERACTION-1` rules are satisfied (matched voter id and/or `notes` + `contactedByUserId`), and always sets `lastContactedAt` on the contact. Sets `relationalContactId` on the interaction.
- **Signals**: only created when the caller sets `createSignal: true` and supplies full signal fields; `relationalContactId` is set on the new **`VoterSignal`**. No automatic signal from ordinary saves.

## 5. What remains human-confirmed

- Voter file match to a contact (use suggestions + explicit `setRelationalContactVoterMatch` or other staff flows).
- Support level, organizing narrative, and whether someone is “engaged” or invited to power-of-five (all explicit fields; no auto-classification from this table).

## 6. What remains intentionally not built

- No volunteer- or public-facing product UI, no mobile canvass UI, no auto-matching, no auto texts/calls, no message sending, no automatic classification or vote math.
- No requirement that the relational network be complete for other rails to function.

## 7. How this supports GOTV, volunteer workbench, GAME-2, and county goals

- **GOTV / vote plan**: `organizingStatus` and links to `VoterInteraction` / `VoterVotePlan` (via the voter) give a place to **coordinate** follow-ups without treating contacts as vote totals.
- **Workbench**: future volunteer UI can list contacts, show match state, and call `recordRelationalTouch` for consistent logging.
- **GAME-2**: can later attach progression to touches that already exist in the DB without redefining the relational model.
- **County goals**: optional `countyId` on the contact allows filtering and rollups; county registration goals and voter metrics remain on **`CountyCampaignStats`** / **`CountyVoterMetrics`**, not derived from contact counts.
