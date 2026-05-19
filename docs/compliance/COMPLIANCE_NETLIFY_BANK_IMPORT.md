# Netlify bank import path

## Summary

Production bank data can come from **either**:

1. **Admin upload** — `/admin/compliance/imports/bank` → `POST /api/admin/compliance/imports/bank` → `data/compliance/imports/bank/{batchId}.analysis.json`
2. **April26 file** — `COMPLIANCE_APRIL26_DIR` or `../Compliance/April26/bank-april-2026.csv` on the host (if mounted)

The source-truth adapter treats **validated import chunks** the same as a CSV file for reconciliation readiness.

## Netlify constraints

| Topic | Guidance |
|--------|----------|
| Filesystem | Serverless deploys use an **ephemeral** filesystem. Import JSON is lost on redeploy unless restored. |
| Git | Never commit `data/compliance/imports/bank/*.analysis.json` or raw CSV (gitignored). |
| After deploy | Treasurer re-uploads bank CSV via admin import **or** ops restores analysis JSON from secure backup to the host. |
| Env | Optional `COMPLIANCE_APRIL26_DIR` for a persistent mount path to April26 sources. |
| Optional | `COMPLIANCE_BANK_CSV_PATH` for a single absolute CSV path on the host. |

## Operator checklist (production)

1. Log in to admin → **Compliance → Bank import**.
2. Upload the same bank export used for April 2026 (ledger CSV with Date, Description, Amount is supported).
3. Run locally or in CI: `npm run compliance:source-truth-audit` and `npm run compliance:bank:qa` on a machine with the import present.
4. Open **Reconciliation workbench** — resolve ambiguous/unmatched credits (treasurer pick; no auto-resolve).
5. Document import date and batch id in treasurer notes (not in git).

## API

- **Route:** `POST /api/admin/compliance/imports/bank`
- **Auth:** Admin session required (`assertAdminApi`)
- **Body:** `multipart/form-data` with `file` (CSV) and optional `uploadedByInitials`
- **Response:** `201` with `analysis` object (sanitized sample rows only in UI)

## Related commands

```bash
npm run compliance:source-truth-audit
npm run compliance:bank:qa
npm run compliance:reconciliation-review-report
npm run compliance:deploy-readiness
```

## DB migration (future)

When `COMPLIANCE_DB_MIGRATED=true`, bank batches should persist in Postgres with the same provenance fields. This pass does **not** apply migrations.
