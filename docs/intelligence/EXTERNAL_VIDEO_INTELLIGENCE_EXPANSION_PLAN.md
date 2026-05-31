# External Video Intelligence Expansion Plan

**Status:** CONTRACT ONLY — not implemented in Pass P4  
**Governance:** INTERNAL_DRAFT · NON_PUBLISHABLE

## Purpose

Define future-ready types for non-Arkleg video sources without falsely marking ingestion complete.

## Future source types

| Type | Examples |
|------|----------|
| YOUTUBE_CHANNEL | County GOP, campaign channel |
| CAMPAIGN_VIDEO | hammerforarkansas.com media |
| MEDIA_INTERVIEW | KATV, local TV |
| FACEBOOK_VIDEO | Event livestreams |
| PUBLIC_FORUM | Town halls |
| LOCAL_GOVERNMENT | School board, city council |

## Contract types (implemented)

- `ExternalVideoSourceCandidate`
- `ExternalVideoTranscriptSource`
- `ExternalSpeakerVerification`
- `ExternalVideoChunk`

See `src/lib/legislature/externalVideoSourceTypes.ts`.

## P4 scope boundary

- Arkansas legislative Sliq pipeline only
- YouTube/social expansion deferred to P5+ with same governance: no fabrication, human review, claim ledger binding

## Recommended next pass

1. Wire YouTube Data API or RSS with rate limits
2. Reuse `legislativeTranscriptionPipeline` provider abstraction
3. Reuse `speakerVerification` + `legislativeClaimIngest` paths
4. Do not merge external clips into export-ready tier without KH-4 review
