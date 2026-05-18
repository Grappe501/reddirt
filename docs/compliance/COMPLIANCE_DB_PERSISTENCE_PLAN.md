# Compliance DB persistence plan

## Current state

- JSON repositories under `data/compliance/**` are authoritative today.
- `loadWithDbFallback` in `src/lib/compliance/persistence/compliance-repository.ts` switches when `COMPLIANCE_DB_MIGRATED=true`.
- Draft Prisma models: `prisma/compliance-ops-draft.prisma` (not applied).

## Target models

ComplianceMoneyMovement, ComplianceContribution, ComplianceExpense, ComplianceReceipt, ComplianceVendor, ComplianceBankTransaction, ComplianceReconciliationMatch, ComplianceFilingPackage, ComplianceTask, ComplianceAuditLog, ComplianceDocument (extends existing), ComplianceRuleSource, ComplianceRuleChunk, ComplianceApproval.

## Migration steps (additive)

1. Copy draft models into `schema.prisma` in a single migration packet approved by Steve.
2. `prisma migrate dev --name compliance_ops_v1`
3. Implement repository adapters per entity (read DB, write DB, JSON fallback on empty).
4. Set `COMPLIANCE_DB_MIGRATED=true` in staging only after backfill script runs.
5. Keep JSON export path for disaster recovery until one full filing cycle on DB.

## Do not

- Break existing JSON flows during cutover.
- Mutate production DB without passing migrations locally first.
