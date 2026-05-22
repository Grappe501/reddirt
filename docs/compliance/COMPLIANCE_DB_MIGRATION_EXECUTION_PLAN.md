# Compliance DB migration execution plan

## Current state

- Authoritative store: JSON under `data/compliance/**`
- Feature flag: `COMPLIANCE_DB_MIGRATED=true` (staging only, after backfill)
- Draft models: `prisma/compliance-ops-draft.prisma` (not applied to `schema.prisma`)

## Target models (additive, v1)

1. `ComplianceApprovalQueue`
2. `ComplianceApprovalItem`
3. `ComplianceApprovalAuditLog`
4. `ComplianceTask`
5. `ComplianceReconciliationMatch` (mirror JSON)
6. `ComplianceDocument` (extends existing document metadata)

## Migration order

1. Approval audit log + queue metadata (lowest coupling)
2. Compliance tasks (needs-info linkage)
3. Reconciliation matches (read-heavy)
4. Money movement mirrors (last — highest blast radius)

## JSON → DB script outline

```bash
# Future — not run in production without Steve approval
tsx scripts/compliance/migrate-json-to-db.ts --dry-run
tsx scripts/compliance/migrate-json-to-db.ts --entity approval-audit
tsx scripts/compliance/migrate-json-to-db.ts --verify
```

Steps per entity: read JSON → validate schema → upsert DB → compare counts → write manifest.

## Rollback

- Keep JSON export nightly until one full filing cycle on DB
- `COMPLIANCE_DB_MIGRATED=false` reverts reads to JSON adapters
- No destructive migrations; additive columns only

## Production safety checklist

- [ ] `prisma migrate deploy` clean on staging
- [ ] Backfill dry-run counts match JSON
- [ ] Approval QA + filing QA pass on DB mode
- [ ] RLS/storage verified for documents
- [ ] Netlify env vars set (no secrets in repo)

## Preflight packet

See `docs/compliance/COMPLIANCE_DB_MIGRATION_PREFLIGHT.md` for Steve approval checklist.

## Do not

- Reorder or edit applied migrations
- Break existing Prisma models used by Kelly site core
- Cut over during active approval session without export snapshot
