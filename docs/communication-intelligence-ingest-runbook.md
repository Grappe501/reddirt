# Communication Intelligence ingest — operator runbook

## What this lane does

- Pulls **read-only** data from **Gmail** (metadata by default; optional full bodies), **Google People contacts** (same OAuth client as staff Gmail when scopes allow), and **Google Calendar** (`events.list` only — **no** `insert` / `update` / `patch`).
- Writes durable rows in RedDirt: `ExternalIngestRun`, `GmailMessageRecord`, `GmailMessageParticipant`, `GoogleContactRecord`, `GoogleCalendarEventRecord`, `GoogleCalendarEventParticipant`, `CommunicationIdentity`, `CommunicationIdentitySignal`, `CommunicationProfileMatchCandidate`.
- Surfaces review in **Workbench → Communication Intelligence Center**, **Cockpit** summary, **Calendar HQ** imported events panel, and **ECC route list**.

## What it does **not** do

- **No sends** (SendGrid, Gmail send, queue send, SMS).
- **No ACTIVE audience** creation from imports.
- **No automatic voter scoring** or auto-approved voter matches.
- **No Google Calendar writes** from ingest.
- **Signals** default `approvedForAudienceUse: false` — they are **not** governed `EmailContactProfileFact` rows.

## Confirmation phrases

| Action | Phrase |
|--------|--------|
| Gmail import over 500 messages | `IMPORT GMAIL HISTORY` |
| Gmail full body storage | `IMPORT FULL EMAIL BODY` |
| Contacts import over 1000 | `IMPORT GOOGLE CONTACTS` |
| Calendar import over 500 events | `IMPORT CALENDAR HISTORY` |

## Body storage

- Default: **metadata + snippet** (no full MIME bodies).
- **Full text** requires explicit mode + confirmation phrase; still **no** attachment binaries in this slice.

## Suppression

- If an address appears in **SendGrid suppression**, the linked `CommunicationIdentity` is marked **SUPPRESSED**; match suggestions for audience use stay off until product policy changes elsewhere.

## Match review

- **Approve / Reject** only flips `CommunicationProfileMatchCandidate.status`; it does **not** auto-merge profiles or alter voter data.

## Emergency posture

- Stop running new imports from Communication Intelligence.
- Existing rows are audit artifacts — coordinate with Steve before bulk delete (this runbook does not prescribe SQL deletes).

## Routes

- Hub: `/admin/workbench/communication-intelligence`
- Search: `/admin/workbench/communication-intelligence/search?q=`
- Identity: `/admin/workbench/communication-intelligence/identities/[id]`

## Guardrail script

```bash
npm run communication-ingest:guardrails
```
