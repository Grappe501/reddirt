# April 2026 compliance ingest (RedDirt)

RedDirt is the authoritative compliance interface for April 2026. Source files remain in `H:\SOSWebsite\Compliance\April26` (external folder; not committed).

## Commands

```bash
cd RedDirt
npm run compliance:april26:dry    # structure only, no OpenAI vision
npm run compliance:april26:ingest # full ingest when OPENAI_API_KEY is set
npm run compliance:april26:qa     # folder + ingest summary checks
npm run compliance:approval:build # refresh Lightning Approval queue
```

## Mapped sources

| Source | RedDirt staging |
|--------|-----------------|
| GoodChange CSV | `contribution_credit_card` money movements + processor fees |
| Ethics workbook — Good Change | Cross-check vs CSV; extra rows staged |
| Ethics — Checks/Cash | `contribution_check` / `contribution_cash` |
| Ethics — In Kind | `contribution_in_kind` |
| Ethics — Expenditures | `vendor_payment` / `staff_1099_payment` / reimbursements |
| Check images (HEIC/JPG) | Source document registry + optional vision OCR |
| Receipt images | Registry + OCR chunks (human review required) |
| In-kind images (`att.*.jpg`) | Registry + OCR chunks |
| GoodChange payout IDs | Payout batch expectations |
| `bank-april-2026.csv` | Bank import staging + deposit match candidates |

## Storage

Local artifacts: `data/compliance/april26/` (gitignored). No PII in git.

## Dashboard

`/admin/compliance/april26` — ingest status, review queue links, bank CSV blocker panel.

## Privacy

Do not commit April26 CSV/XLSX, images, `Compliance/data/dev.db`, or ingest JSON containing donor details.
