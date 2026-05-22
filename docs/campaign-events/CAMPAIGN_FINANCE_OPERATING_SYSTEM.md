# Campaign Finance Operating System (Sprint 8)

**Lane:** `RedDirt/`  
**Storage:** `factCard._eventFinance` + `data/campaign-events/finance/`

## Purpose

Campaign-native operational finance: budget, expenses, receipts, compliance readiness, and approval chain on each event — connected to travel reimbursement and month packets.

## Event drilldown

Tab **Financial Ops** (`/admin/campaign-events/[recordId]`):

1. Event budget  
2. Expense tracking  
3. Receipt tracking (upload → pending approval)  
4. Compliance readiness  
5. Approval chain  

## Code

- `src/lib/campaign-events/finance/` — types, persist, helpers, documents, reimbursement ops  
- `EventFinancialOperationsWorkspace.tsx`  
- `event-finance-actions.ts`, `finance-document-actions.ts`

## Test

```bash
npm run campaign-events:test-finance-operations
```
