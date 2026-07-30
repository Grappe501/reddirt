# Transcript editor guide

Open **Admin → Media → YouTube transcripts → [video]**.

## Capabilities

- Bulk plain-text editor (creates a revision on save)
- Segment timeline preview
- Proper-noun flags for review
- Status: Review required / Approve / Archive
- **Publish (explicit)** — only after Approve
- Optional YouTube caption upload (manual)
- Internal AI advisory (not public)
- Restore any prior revision

## Publish checklist

1. Correct names, counties, offices, election terms
2. Status = APPROVED
3. Click Publish
4. Register overlay in `src/content/media/transcripts/overlays.ts` and commit JSON for production
5. Confirm `/kelly-speaks/[slug]` shows disclosure
