# Power of 5 and voter profile integration

**Lane:** `RedDirt/`  
**Scope:** How relational organizing and Power of 5 metadata surface on **admin-only** voter and REL-2 contact profiles — without exposing private operational data on public routes.

## Goals

- Give operators a single place to see **who brought someone into the relational network**, **field team assignment**, **recent activity**, and **pipeline stage**.
- Keep voter file keys, organizer details, and pipeline states **off** public pages, marketing dashboards, and unauthenticated APIs.

## Where it lives (UI)

| Surface | Route | Guard |
|--------|--------|--------|
| Voter model (read-only) | `/admin/voters/[id]/model` | `requireAdminPage` via `(board)` layout |
| Relational contact | `/admin/relational-contacts/[id]` | Same |

Public county briefings, organizing intelligence pages, and volunteer relational UI (`/relational/*`) are **not** extended by this packet to show matched voter pipeline rows.

## Data mapping

Implementation: `src/lib/campaign-engine/voter-relational-organizing.ts` and `src/components/admin/RelationalOrganizingAdminCard.tsx`.

| UI label | Source | Notes |
|----------|--------|--------|
| **Who invited them** | `RelationalContact.owner` (`User.name` fallback `email`) | Interpreted as the **volunteer who owns the REL-2 row** — the person who added the contact to the relational network. There is no separate “inviter” foreign key today; if product needs “invited by someone other than owner,” add a nullable FK later. |
| **Team assignment** | `RelationalContact.fieldUnit` | FIELD-1 unit name + type (`COUNTY` / `REGION`). If null, UI shows unassigned. |
| **Activity** | `lastContactedAt`, `nextFollowUpAt`, count of `VoterInteraction` rows linked to this contact, latest interaction type/channel/date | Counts and “latest” are **REL-linked** interactions on the contact. Interactions logged only on the voter without `relationalContactId` appear in the voter model’s general interaction list but not in this REL activity summary. |
| **Pipeline stage** | `RelationalContact.organizingStatus` (`RelationalOrganizingStatus`) | Display string is a humanized form of the enum (admin still shows raw enum for auditing). |
| **Power of 5** | `isCoreFive`, `powerOfFiveSlot` | Shown in the same card for quick scanning. |

### Voter model page

- Loads all `RelationalContact` rows where `matchedVoterRecordId` equals the current `VoterRecord.id`.
- Multiple rows are possible (e.g. duplicate network entries or data fixes); each renders its own card with a link back to the REL-2 admin detail.

### Contact detail page

- Builds the same card shape from the already-loaded contact (including `_count.voterInteractions` for accurate totals when more than 50 touches exist).

## Privacy and safety rules

1. **No new public surfaces** for this bundle: do not import `RelationalOrganizingAdminCard` or `listRelationalOrganizingLinksForVoter` from `src/app/(site)/**`, `organizing-intelligence/**`, or API routes intended for anonymous users.
2. **Aggregates on public pages** stay aggregate-only (existing county / OIS pattern); no per-person pipeline or organizer identity.
3. **Volunteer-facing REL UI** (`/relational/*`) continues to enforce owner scope via `getRelationalContactDetailForOwner`; do not leak other owners’ labels or stages there without an explicit product decision and RLS review.

## Related schema (reference)

- `RelationalContact` — owner, `fieldUnit`, `organizingStatus`, Power of 5 flags, match fields, `matchedVoterRecordId`.
- `VoterInteraction` — optional `relationalContactId` for touches tied to a REL row.
- `TeamRoleAssignment` — **not** used in this packet for the contact’s “team”; it assigns roles to **users**, not to voter records. If team views should reflect staff roles as well as `fieldUnit`, spec a join in a future pass.

## Follow-on work (not in this change)

- Optional `invitedByUserId` distinct from `ownerUserId` if onboarding flows need it.
- Surface REL activity on GOTV queue rows only inside admin, with the same guards.
- When auth-gated `/dashboard` ships, mirror **non-identifying** rollups only; never copy admin card payloads to public JSON.
