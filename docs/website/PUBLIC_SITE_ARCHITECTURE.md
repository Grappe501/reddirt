# Public site architecture — stable baseline

**Declared:** 2026-06-10 (after Pass 3)  
**Scope:** `RedDirt/` public routes only — internal Victory OS continues to evolve separately.

## Public stack (frozen for campaign season)

| Layer | Route(s) | Purpose |
|-------|----------|---------|
| Trust | `/` | Homepage trust funnel |
| Trust | `/about`, `/about/journey`, `/about/community`, `/about/why-im-running` | Meet Kelly |
| Competence | `/understand`, `/office/*` | Secretary of State explainer (3 levels) |
| Visibility | `/arkansas`, `/arkansas/counties` | County presence — verified visits only |
| Action | `/get-involved`, `/events/request`, `/schedule` | Volunteer + invite Kelly |

## Do not add to public site without approval

- Victory Map, Decision Engine, Mission Brief UI
- County workbench / intelligence (`/counties/[slug]` command metrics)
- Deployment priorities, volunteer strength, internal scores
- Unverified visit counts or invented endorsements

## Development priority (post-freeze)

1. Path to Victory  
2. Victory Map  
3. Decision Engine  
4. County Mission System  
5. Election Day Operations Center  

## Integrity docs

- [`KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md`](./KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md)
- [`PUBLIC_CONTENT_APPROVAL_QUEUE.md`](./PUBLIC_CONTENT_APPROVAL_QUEUE.md)
- [`WEBSITE_CONTENT_INTEGRITY_AUDIT.md`](./WEBSITE_CONTENT_INTEGRITY_AUDIT.md)
