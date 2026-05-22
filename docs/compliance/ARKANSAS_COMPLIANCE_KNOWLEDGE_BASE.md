# Arkansas compliance knowledge base (internal)

**Not legal advice.** This is campaign workflow structure for the RedDirt compliance app. Official Arkansas Ethics Commission sources must be linked and reviewed by humans on `/admin/compliance/rules`.

## Knowledge status labels

| Label | Meaning |
|-------|---------|
| `source_backed` | Tied to an official or campaign-linked source in the rules corpus |
| `confirmed_in_app` | Enforced by app gates (approval, filing, guards) |
| `app_policy` | Product safety rule (not a statute) |
| `campaign_policy` | Kelly campaign decision documented internally |
| `needs_human_verification` | Operator must confirm on Rules page |
| `legal_review_needed` | Requires counsel — app does not certify |

## Filing concepts (workflow)

- **Reporting period** — configured under compliance settings; due dates require human verification.
- **Staged vs filed** — records in the app are staged until approved and exported through filing gates.
- **Hard gates** — filing readiness red/yellow/green aggregates source-backed checks, not legal conclusions.

## Contribution handling

- GoodChange CSV, checks, cash, in-kind each have intake → approval queue paths.
- Donor identity and amount must match evidence before high confidence scores.
- **Human boundary:** Treasurer confirms legality and completeness before filing export.

## Expenditure handling

- Receipt images + AI intake → expense approval items.
- Tips, payment method, and category affect classification — human approves.

## In-kind handling

- Separate image intake; fair market value requires human sign-off.

## Reconciliation expectations

- Bank CSV (date, amount, memo) matched to GoodChange payout batches.
- Unmatched bank, unmatched payouts, and ambiguous matches require operator decisions.
- **App policy:** No invented bank data; missing file is non-fatal but blocks recon completion.

## Rule review concepts

- Corpus topics map to `rule_review` queue items.
- Topics must be marked reviewed for **campaign workflow** — not legal certification.
- Batch approval never includes `rule_review`.

## Official sources humans must review/link

See `src/lib/compliance/ai/knowledge/arkansas-compliance-knowledge.ts` and run `npm run compliance:rule-topic-packet`.

1. ACE campaign finance reporting guidance (current URL on Rules page)  
2. Contribution limits and disclosure rules  
3. Filing deadlines and amendments for active period  
4. In-kind valuation and reporting  
5. Expenditure documentation and reimbursements  
6. Recordkeeping and bank reconciliation for committees  

## How rules map to app checks

| Topic | App checks |
|-------|------------|
| Contributions | GoodChange/check/cash approval, confidence ≥98% for batch |
| Expenditures | Receipt intake, receipt_expense approval |
| In-kind | in_kind_contribution approval |
| Reconciliation | bank CSV readiness, reconciliation workbench, rehearsal |
| Reporting | filing-readiness hard gates, blocker burn-down |
| Rule review | Rules page, rule_review guard, topic packet |

## Still needs legal/human confirmation

- Whether specific transactions meet Arkansas statutory definitions  
- Final filing package accuracy before submission to the state  
- Any opponent or third-party claims (never unsourced in product)  

Machine-readable topics: `ARKANSAS_COMPLIANCE_TOPICS` in `arkansas-compliance-knowledge.ts`.
