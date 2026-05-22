# Campaign Compliance Readiness (Sprint 8)

## Per-event readiness

Computed on save/refresh (`enrichEventFinanceFromRow`):

- Receipt completeness  
- Reimbursement / travel completeness  
- Documentation band (Audit-ready / Nearly ready / …)  
- Warning level: low | medium | high  
- Gap list (e.g. approved travel without receipt)

## Treasurer view

`TreasurerReadinessPanel` on reimbursement page — export-ready heuristic from pending approvals, missing mileage, exception count.

## Boundaries

- No FIN-1 auto-post  
- No compliance filing export this sprint  
- Human-gated pipeline status changes  

## AI tools

`compliance-risk-detector`, `receipt-gap-detector`, `missing-documentation-detector`, `treasurer-review-preparer` (lifecycle `campaign_finance_sprint8`).
