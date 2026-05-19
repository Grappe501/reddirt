# Supabase storage production checklist

Tied to `/admin/compliance/settings#storage-setup`. Local QA works with `local_private` fallback — Supabase not required for `compliance:qa-storage`.

## Required environment (Netlify / production)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never client)
- `COMPLIANCE_STORAGE_BUCKET` (private bucket name)
- `COMPLIANCE_STORAGE_RLS_VERIFIED=true` after manual RLS check

## Bucket expectations

- Private bucket (no public read)
- Server uploads via service role
- Signed URLs for short-lived download when probe succeeds
- Evidence/receipt paths under campaign-controlled prefixes

## RLS policy expectations

- Deny anonymous read/write
- Service role used only on server routes
- Document human procedure in `docs/compliance/SUPABASE_PRIVATE_STORAGE_SETUP.md`

## Verify without exposing files

```bash
npm run compliance:qa-storage
npm run compliance:storage:check
```

Expect `local_private` locally without env; `ready: true` only when bucket probe passes in staging.

## Local fallback behavior

- Metadata under `data/compliance/documents/`
- No signed URLs — server download only
- Warning shown on compliance dashboard and filing readiness

## Do not

- Commit bucket keys, service role, or donor files
- Mark RLS verified without dashboard review
