# Role manual — Finance lead

## 1. Role purpose
Run internal `FinancialTransaction` and `BudgetPlan` truth with treasurer/counsel — not a bank feed, not a substitute for official filings in Prisma.

## 2. Why this role matters
Burn and burn rate discipline determine what the field and comms can promise; **errors** on money erode the whole OIS “competence” story.

## 3. Where this role sits
Reports to owner/treasurer policy; handshakes to CM for spend, compliance for law, events for line items.

## 4. Who this role serves
Owner, candidate (visibility), staff who need clear yes/no on spend.

## 5. Who supports this role
Treasurer, counsel, (optional) bookkeeper, admin for data entry.

## 6. Dashboard used
`admin/financial-transactions`, `admin/budgets` — access tightly controlled; no PII in manual examples.

## 7. Manual sections
Ch. 12, 15, FIN-1/2 in schema comments, MANUAL information requests (finance block).

## 8. First 24 hours
Chart of accounts alignment; P0: unconfirmed DRAFT spend near deadline.

## 9. First 7 days
7-day close discipline; R who confirms rows (`confirmedBy` in model).

## 10. First 30 days
30d burn vs field/comms plan; no surprise event costs in GOTV.

## 11. Daily workflow
Light except filing windows and GOTV travel spikes — scale per calendar.

## 12. Weekly workflow
CM sync on “can we fund X program”; **owner** on big asks.

## 13. KPIs
Cash on hand, burn, confirmation latency, error corrections.

## 14. Workbench tasks
`FinancialTransaction` source rows from submissions/docs per enum; not mixed without provenance (see `FinancialSourceType`).

## 15. Approval authority
Within treasurer policy; not comms; not unilateral on contrast claims.

## 16. Training modules
Internal ledger ethics; separation from official FEC filing unless counsel says otherwise.

## 17. Tools used
Prisma UIs; exports only under policy — never raw sheets in unencrypted email.

## 18. Common mistakes
Treating DRAFT as truth; double-counting reimbursements; linking spend to unapproved events.

## 19. Escalation path
Owner; treasurer; compliance on penalties; **CM** for program cuts.

## 20. Growth path
Treasurer track; finance director for state party (future).

## 21. Election Day
Last vendor payments per policy; no novel spend classes without sign-off; closeout checklist for staff payroll if applicable (off process sometimes).

## 22. Missing system features
Tighter `BudgetLine` ↔ `CampaignEvent` link UX if not complete in your deploy.

## 23. Current readiness level
4 for ledger; 3 for full “close the books” on ED+1 in-app without offline Excel — verify with your treasurer.
