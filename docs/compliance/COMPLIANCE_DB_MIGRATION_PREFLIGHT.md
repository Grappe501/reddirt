# Compliance DB migration preflight (Steve approval required)

Companion to `COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md`. **Do not apply migrations** until this packet is signed off.

## Preflight checklist

- [ ] JSON export snapshot of `data/compliance/**` (excluding gitignored PII uploads)
- [ ] Staging `prisma migrate deploy` clean
- [ ] Schema diff reviewed (`prisma/compliance-ops-draft.prisma` → `schema.prisma`)
- [ ] Rollback tested: `COMPLIANCE_DB_MIGRATED=false` reads JSON
- [ ] Approval QA + filing QA pass on staging with DB flag
- [ ] No production cutover during active approval session

## Backup / export steps

1. Copy `data/compliance` to dated backup folder (off-repo).
2. Run `npm run compliance:approval:build` and archive queue JSON counts.
3. Export audit log JSON separately.

## Cutover risks

- Dual-write drift if JSON and DB updated in parallel
- Evidence files remain on disk/Supabase — DB stores metadata only
- Rule review state must match `rule-reviews-storage` JSON during backfill

## Post-migration QA

```bash
npm run compliance:qa-approval
npm run compliance:qa-filing
npm run compliance:qa-reconciliation
npm run compliance:qa-full
npm run typecheck
npm run build
```

## Rollback

1. Set `COMPLIANCE_DB_MIGRATED=false`
2. Restore JSON backup if DB writes occurred
3. Redeploy previous Netlify build
