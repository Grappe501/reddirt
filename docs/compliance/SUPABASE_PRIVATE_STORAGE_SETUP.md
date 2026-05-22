# Supabase private storage — compliance documents

## Bucket name (recommended)

- **`compliance-private`** (default via `COMPLIANCE_STORAGE_BUCKET`)
- Visibility: **private** — no public bucket URLs for donor/receipt files

## Required environment variables (`RedDirt/.env` only)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only uploads/downloads (never commit, never expose to browser) |
| `COMPLIANCE_STORAGE_BUCKET` | Bucket id (default `compliance-private`) |
| `COMPLIANCE_STORAGE_RLS_VERIFIED` | Set to `true` after you apply and verify RLS in Supabase SQL editor |

## RLS SQL (Supabase → SQL Editor)

```sql
-- Service role bypasses RLS; policies block anon/authenticated direct object access.
alter table storage.objects enable row level security;

create policy "compliance_private_service_only"
on storage.objects for all
using (bucket_id = 'compliance-private')
with check (bucket_id = 'compliance-private');
```

Replace `compliance-private` if you use a different bucket name.

## Netlify env checklist

1. Add the four variables above in Netlify → Site → Environment (Production + Preview).
2. Redeploy after changing env.
3. Run `npm run compliance:storage:check` in a Netlify build hook or locally with production env.
4. Confirm `/admin/compliance/settings` shows **Supabase env: set** and **RLS verified: yes**.

## Local fallback warning

When `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing:

- Files land under `data/compliance/documents/` on disk.
- Admin UI shows **local fallback active**.
- This is fine for dev; **production must use private object storage** with backup policy.
- Signed URLs are not available in local mode — use server-side download routes only.

## Storage health checklist

```bash
npm run compliance:storage:check
```

Expect:

- `envPresent` — both Supabase vars set
- `bucketReachable` — list probe succeeds
- `signedUrlCapable` — signed URL probe succeeds (Supabase only)
- `localFallbackActive` — true when Supabase not configured
- `rlsConfiguredManual` — true only after `COMPLIANCE_STORAGE_RLS_VERIFIED=true`
- `ready` — true when env + bucket + (signed URLs or explicit local dev acceptance)

## Health UI

`/admin/compliance/settings` — storage metric cards and summary text.
