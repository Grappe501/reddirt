# Gmail / Contacts / Calendar ingest — design notes

## Architecture

- **Normalization** lives in `src/lib/communications/*` (email + phone parsing; conservative).
- **Gmail API** list/get helpers: `src/lib/google/gmail-ingest.ts` (uses existing staff OAuth + `googleapis` Gmail client).
- **People API**: `src/lib/google/google-contacts-ingest.ts` (connections list; errors surface as readiness failures if scopes missing).
- **Calendar list**: `src/lib/google/google-calendar-ingest.ts` — **does not** touch `CalendarSource.syncToken` to avoid side effects with HQ sync.
- **Orchestration + Prisma writes**: `src/lib/communications/ingest-service.ts`.
- **Admin mutations**: `src/app/admin/communication-ingest-actions.ts` (`requireAdminAction`, actor from `ADMIN_ACTOR_USER_EMAIL`).

## Identity model

- `CommunicationIdentity` is the **pre-voter-file** communication key (unique `normalizedEmail` when present).
- `CommunicationIdentitySignal` stores source-aware hints; **not** approved for audience use by default.
- `CommunicationProfileMatchCandidate` queues **operator** decisions against `EmailContactProfile` / relational / voter targets (voter linkage reserved for future passes).

## Incremental / workers

- This slice is **manual / on-demand** only. Incremental Gmail `historyId` ingestion is a future pass once monitor state is aligned.

## Privacy

- Calendar **private** events: summary replaced with `"Private event"` and description omitted unless operator checks **allow private details** on import.
