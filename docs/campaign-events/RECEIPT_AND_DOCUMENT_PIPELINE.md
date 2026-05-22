# Receipt & Document Pipeline (Sprint 8)

**Index:** `data/campaign-events/finance/finance-documents-index.json`  
**Files:** `data/campaign-events/finance/{period}/{eventId}/pending|approved/`

## Document types

receipt, invoice, reimbursement_form, expense_memo, hotel_confirmation, fuel_receipt, event_invoice, other

## Metadata (no OCR V1)

- uploader, linked event, period, county  
- approval status, reimbursement link status  
- optional linked expense id  

## Upload

Event drilldown → Financial Ops → Receipt tracking → upload (server action `uploadFinanceDocumentAction`).

## V2

OCR, auto-categorization, FIN-1 transaction bridge.
