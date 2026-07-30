# Pass 2 rollback

1. Disconnect YouTube OAuth (`POST /api/admin/youtube/oauth/disconnect` or delete sealed file).
2. Remove workspace drafts under `data/campaign-media/transcript-pipeline/` (gitignored).
3. Unpublish: set overlay status to ARCHIVED or remove from `COMMITTED_TRANSCRIPT_OVERLAYS`.
4. Revert this commit if needed: `feat(media): implement automated YouTube transcript ingestion pipeline`.
5. Pass 1 public foundations (`/kelly-speaks`, disclosure, registry) remain usable without Pass 2 OAuth.
