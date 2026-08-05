# Public Statistics Revision Standard

## Rules

1. Never silently overwrite a previously published observation.
2. On change: create new observation; link `revisedFromObservationId`; write revision record.
3. Record reason, source release, detected timestamp, materiality, public-impact status.
4. Exports should prefer latest non-rejected observation per (series, geography, period) while retaining lineage metadata.
5. Material public-impact revisions must appear in limitations/export notes.
