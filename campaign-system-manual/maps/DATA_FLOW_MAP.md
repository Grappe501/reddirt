# Data flow map

## Public intake (non-PII marketing copy)

- Browser → `POST /api/forms` → `FormSubmission` / `Submission` chain per `handlers` → `WorkflowIntake`.  
- Optional classification when OpenAI configured.

## Voter / relational (restricted)

- Import scripts / `admin/voter-import` → `VoterFileSnapshot` / `VoterRecord` — **stewarded**.  
- `RelationalContact` (REL-2) — **staff/ops** paths.

## Comms

- `CommunicationPlan` → `CommunicationDraft` → `CommunicationSend` / broadcast rails per COMMS-UNIFY-1.

## Social

- Ingestion / monitoring → `SocialContentItem` → opportunities → **optional** `WorkflowIntake`.

## Search / RAG

- `ingest` scripts → `SearchChunk` — site search and assistant; **not** a volunteer dossier tool.

**Aggregate rollups to OIS:** builders in `state-organizing-intelligence/`, `regions/`, `county-dashboards/` — check panel for seed vs live.

**Last updated:** 2026-04-27
