# Data quality report

Overall score: **36/100**

| Domain | Complete % | Confidence | Records | Filing impact |
|--------|-------------|------------|---------|---------------|
| checks | 0 | medium | 44 | blocking |
| ledger_expenditures | 14 | medium | 56 | blocking |
| receipts | 50 | low | 21 | high |
| in_kind | 80 | medium | 49 | high |
| goodchange | 90 | high | 52 | medium |
| vendor_addresses | 0 | low | 72 | blocking |
| rule_topics | 40 | low | 44 | blocking |
| approval_queue | 10 | medium | 221 | high |
| reconciliation | 40 | medium | 12 | blocking |

### checks
10 SOS rows incomplete; 36 unmatched
Evidence: SOS workbook + April26 images

### ledger_expenditures
48 without documentation
Evidence: bank-april-2026.csv

### receipts
Receipt-to-expense pairing incomplete
Evidence: April26 receipt images

### in_kind
Photo sign-off pending
Evidence: Ozark auction CSV

### goodchange
Per-row approval in queue
Evidence: GoodChange CSV

### vendor_addresses
72 gaps — do not invent
Evidence: Vendor docs only

### rule_topics
Topics need Rules page review
Evidence: Rule corpus

### approval_queue
Use focused workflows not queue alone
Evidence: approval-items.json

### reconciliation
14 ambiguous, 10 unmatched bank
Evidence: Bank rehearsal

Regenerate: `npm run compliance:ai-data-quality`