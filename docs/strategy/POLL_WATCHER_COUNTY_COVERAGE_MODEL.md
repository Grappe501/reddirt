# Poll Watcher County Coverage Model

Phase 5A introduces a read-only coverage model template for county poll watcher planning.

## Required fields

- county
- polling location
- early vote site
- election day site
- required observers
- backup observers
- training status
- credentialing status
- legal guidance status
- county captain
- coverage status
- gaps
- confidence score

## Current state

- Model template exists in `data/strategy-doctrine/poll-watcher-coverage-model.json`.
- County-level rows remain `MISSING` until operational intake data is added.

## Guardrails

- All poll watcher planning requires legal/compliance review.
- No voter-level data enrichment.
- No automated assignment/execution.

