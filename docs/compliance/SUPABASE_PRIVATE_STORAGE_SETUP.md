# Supabase private storage — compliance documents

## Bucket

- Name: `COMPLIANCE_STORAGE_BUCKET` env (default `compliance-private`)
- Visibility: **private** (no public URLs)

## Environment (`RedDirt/.env` only)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never commit)
- `COMPLIANCE_STORAGE_BUCKET`
- `COMPLIANCE_STORAGE_RLS_VERIFIED=true` after manual RLS verification

## RLS (apply in Supabase SQL editor)

```sql
-- Service role bypasses RLS; policies restrict anon/authenticated direct access.
alter table storage.objects enable row level security;

create policy "compliance_private_service_only"
on storage.objects for all
using (bucket_id = 'compliance-private')
with check (bucket_id = 'compliance-private');
```

Adjust `bucket_id` to match your bucket name. Campaign staff access should flow through Next.js server routes using the service role and signed URLs (`src/lib/compliance/storage/signed-url.ts`).

## Health check

```bash
npm run compliance:storage:check
```

Reports: env present, bucket reachable, signed URL capability, local fallback active, RLS manual flag.

## Local fallback

When Supabase is not configured, files land under `data/compliance/documents/` with a warning banner in admin UI. Production must not rely on local disk without backup policy.
