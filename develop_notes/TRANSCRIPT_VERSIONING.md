# Transcript versioning

Every editorial save appends a revision:

- `revisionId`, `author`, `date`, `reason`
- Snapshot of `plainText`, `segments`, `status`, `source`
- File copy under `data/campaign-media/transcript-pipeline/versions/{videoId}/`

Editors can **Restore** any revision from the admin editor (restored work returns to `DRAFT` for re-approval).
