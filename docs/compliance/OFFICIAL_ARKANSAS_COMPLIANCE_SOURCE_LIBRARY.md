# Official Arkansas Compliance Source Library

Status: initial source-backed ingest packet  
Jurisdiction: Arkansas  
Campaign context: Kelly Grappe for Arkansas Secretary of State  
Retrieved: 2026-05-17  
AI use: reference only; human compliance review required  

This library contains official public sources for Arkansas campaign finance, ethics, candidate filing, reporting calendars, and Secretary of State financial disclosure workflows. It is designed for chunking into `SearchChunk` so internal agents can cite sources when helping staff prepare staged compliance records.

Important guardrails:

- Uploaded or scraped material is not legal advice.
- The AI must not certify filings, approve transactions, or override counsel/compliance officer review.
- The Secretary of State and Arkansas Ethics Commission pages are authoritative only as of retrieval date; verify deadlines and forms before filing.
- Prefer exact source URLs in reviewer notes and generated checklists.

## Source Inventory

### Arkansas Secretary of State Financial Disclosure

Source URL: https://www.sos.arkansas.gov/elections/financial-disclosure/  
Publisher: Arkansas Secretary of State  
Retrieved: 2026-05-17  
Source type: official filing portal, forms, training guides, archived report search  
ComplianceDocumentType: `FILING_INSTRUCTIONS`

Key facts from source:

- The Secretary of State financial disclosure page links the Online Financial Disclosure System at `https://ethics-disclosures.sos.arkansas.gov/login`.
- The page states that the system will be accessible for filing reports once registration has been approved by the Secretary of State office.
- The page links fillable PDFs for Statement of Financial Interest Report and Campaign Contribution and Expenditure Report.
- The page links tutorials for Campaign Finance Training Guide, Ethics Disclosure Training Guide, and Lobbyist Reporting System Training Guide.
- The page links affidavit forms for paper filings by political action committees, exploratory committees, and independent expenditure committees.
- The page links archived financial disclosure report search for Campaign Contribution and Expenditure, Lobbyist, PAC, and Statement of Financial Interest records.

AI use:

- Use this source to explain where filings are submitted and which SOS portal/forms are implicated.
- Do not claim a filing is submitted or accepted unless the human operator confirms the SOS system status.
- In workflow UI, treat SOS registration approval as a prerequisite for online filing access.

### Arkansas Secretary of State For Candidates

Source URL: https://www.sos.arkansas.gov/elections/for-candidates  
Publisher: Arkansas Secretary of State  
Retrieved: 2026-05-17  
Source type: candidate filing forms, election calendar, candidate handbook, portal links  
ComplianceDocumentType: `FILING_INSTRUCTIONS`

Key facts from source:

- Candidate filing forms include Candidate Information Form, Candidate Information Form for Federal Candidates, and Political Practices Pledge.
- The page states: all forms must be completed and signed in duplicate before submission, and two copies of each must be filed with the Secretary of State.
- The page links the 2026 Candidate Search, 2026 Election Calendar, 2026 Running for Public Office Handbook, notice to candidates about the online campaign finance disclosure system, and the Financial Disclosure Portal.
- The page links the Arkansas Ethics Commission for ethics/campaign finance support.

AI use:

- Use this source for candidate filing logistics and duplicate-copy reminders.
- Do not treat this page as a complete campaign finance rulebook; pair with Ethics Commission rules and reporting calendars.

### Arkansas Ethics Commission Forms and Instructions

Source URL: https://www.arkansasethics.com/forms-instructions/  
Publisher: Arkansas Ethics Commission  
Retrieved: 2026-05-17  
Source type: official forms and instructions index  
ComplianceDocumentType: `SOS_ETHICS_FORM`

Key facts from source:

- The page links Statement of Financial Interest.
- It links Campaign Contribution and Expenditure Report for Debt Retirement for all candidates.
- It links Campaign Contribution and Expenditure Report for County, Municipal, and School Board Candidates with instructions.
- It links Campaign Contribution and Expenditure Report for State and District Candidates with instructions.
- It links Final Campaign Contribution and Expenditure Report for State and District Candidates Only with instructions.
- It links forms for ballot question committees, legislative question committees, exploratory committees, independent expenditure committees, PACs, county political party committees, political parties, lobbyists, and other disclosure categories.

AI use:

- Use this page as the primary forms index for Arkansas Ethics documents.
- For Secretary of State candidate compliance, prioritize State and District Candidate contribution/expenditure forms, final reports, debt retirement forms, Statement of Financial Interest, rules, and reporting calendars.
- Before generating a filing checklist, verify the current form revision date on the official page.

### Arkansas Ethics Commission Guidance for Nonpartisan Candidates

Source URL: https://www.arkansasethics.com/guidance-for-nonpartisan-candidates/  
Publisher: Arkansas Ethics Commission  
Retrieved: 2026-05-17  
Source type: candidate guidance page  
ComplianceDocumentType: `FILING_INSTRUCTIONS`

Key facts from source:

- The page links reporting calendars for state or district candidates and for nonpartisan judicial/prosecuting attorney candidates.
- It links Campaign Contribution and Expenditure Report for State and District Candidates and instructions.
- It links Campaign Contribution and Expenditure Report for Debt Retirement for all candidates.
- It links Statement of Financial Interest PDF.
- It links Rules on Campaign Finance and Disclosure.

AI use:

- Use this page to remind operators that state/district candidate materials and reporting calendars must be verified against the current election type.
- Do not assume the nonpartisan judicial/prosecuting attorney calendar applies to Secretary of State; use State or District candidate calendar unless counsel/compliance officer says otherwise.

### Arkansas Ethics Commission Reporting Calendars

Source URL: https://www.arkansasethics.com/reporting-calendars/  
Publisher: Arkansas Ethics Commission  
Retrieved: 2026-05-17  
Source type: official reporting calendar index  
ComplianceDocumentType: `DEADLINE_CALENDAR`

Key facts from source:

- The page links 2026 Reporting Calendar State or District.
- It links 2026 calendars for nonpartisan judicial/prosecuting attorney, county, municipal, school board, exploratory committees, independent expenditures, PACs, county political party committees, and political parties.
- The page says it was updated on November 20, 2025.

AI use:

- Use this page as the starting source for filing deadlines.
- The AI should state the calendar source and retrieval date when summarizing deadlines.
- The AI must not calculate or certify deadline compliance without human review.

### Arkansas Ethics Commission Campaign Contribution Limit

Source URL: https://www.arkansasethics.com/campaign-contribution-limit/  
Publisher: Arkansas Ethics Commission  
Retrieved: 2026-05-17  
Source type: contribution limit notice index  
ComplianceDocumentType: `FILING_INSTRUCTIONS`

Key facts from source:

- The page links the Notice of Campaign Contribution Limit for Candidates for the 2025-2026 Election Cycle.
- The page states the Commission sets the Campaign Contribution Limit for Candidates pursuant to Act 270 of 2025.
- Public search result text for the official notice indicated the 2025-2026 candidate contribution limit is $3,500 per contribution, but the system should verify the linked notice PDF before applying the number.

AI use:

- Treat contribution limits as configurable policy values until the official notice PDF is reviewed and stored.
- Flag over-limit or near-limit contribution risks for human review; never auto-reject or auto-approve.

### Arkansas Ethics Commission Rules on Campaign Finance and Disclosure

Source URL: http://www.arkansasethics.com/wp-content/uploads/2025/03/CAR-RCFD-1.pdf  
Publisher: Arkansas Ethics Commission / Code of Arkansas Rules  
Retrieved: 2026-05-17  
Source type: official rules PDF; extracted text reviewed through search result cache  
ComplianceDocumentType: `FILING_INSTRUCTIONS`

Key facts from source table of contents:

- 7 CAR § 3-101 defines terms including candidate, constitutional office, contribution, election, expenditure, exploratory committee, financial institution, and guarantor.
- Secretary of State is listed as a constitutional office in the definitions section.
- 7 CAR § 3-102 covers loans.
- 7 CAR § 3-103 covers prohibited contributions.
- 7 CAR § 3-104 covers contribution amounts.
- 7 CAR § 3-105 covers limitations on soliciting and accepting contributions.
- 7 CAR § 3-106 covers in-kind contributions, reporting, and value.
- 7 CAR § 3-108 through § 3-124 cover campaign fund use, personal use, expenditures, credit card reporting, and allowable expenditures.
- 7 CAR § 3-118 covers campaign cash expenditures.
- 7 CAR § 3-120 covers reporting expenditures by credit card.
- 7 CAR § 3-126 through § 3-131 cover repayment of loans, remaining campaign funds, and debt retirement.
- 7 CAR § 3-134 covers records of contributions and expenditures.
- 7 CAR § 3-135 covers reporting of candidate personal funds and loans from financial institutions.
- 7 CAR § 3-136 covers verification of contribution and expenditure reports for all candidates.
- 7 CAR § 3-137 through § 3-139 cover reports of contributions and expenditures for candidates for state or district office, including required reports, timing, contents, and exceptions.
- 7 CAR § 3-146 covers prohibited campaign activities concerning public servants and public property, including advertising disclaimer.
- 7 CAR § 3-148 covers penalty schedule for failure to file or late filing of contribution and expenditure reports.
- 7 CAR § 3-149 covers Statement of Financial Interest filing required of candidates.
- 7 CAR § 3-155 covers reporting calendars.

Definitions excerpted from the rules source:

- Candidate means an individual who has knowingly and willingly taken affirmative action, including solicitation of funds, for seeking nomination for or election to public office.
- Contribution includes direct or indirect advances, deposits, transfers of funds, contracts or obligations, payments, gifts, subscriptions, assessments, payment for services, dues, advancements, forbearance, loans, pledges, or promises of money or anything of value to a candidate, committee, or holder of elective office for influencing nomination or election.
- Contribution includes purchases of tickets for fundraising events, certain discounts or rebates not extended equally to all candidates for the same office, payments for services of an agent by someone other than the candidate/committee or reportable persons, and transfers of anything of value from another committee.
- Contribution does not include noncompensated, nonreimbursed volunteer personal services or travel.
- Expenditure means a purchase, payment, distribution, gift, loan, or advance of money or anything of value, and a contract, promise, or agreement to make an expenditure, made for influencing nomination or election.

AI use:

- Use this source as the primary rules map for money movement categories: contributions, in-kind, loans, debt, expenditures, credit cards, cash expenditures, records, verification, reporting, and penalties.
- The AI may cite section numbers and say “review this rule section,” but must not make final legal determinations.
- Compliance UI should link staged transaction types to the relevant rule sections for human review.

### Arkansas Ethics Commission Guidance for County Candidates

Source URL: https://www.arkansasethics.com/county-candidate-guidance/  
Publisher: Arkansas Ethics Commission  
Retrieved: 2026-05-17  
Source type: candidate guidance page  
ComplianceDocumentType: `FILING_INSTRUCTIONS`

Key facts from source:

- The page links 2026 reporting calendars for county candidates under $5,000 and over $5,000.
- It links Campaign Contribution and Expenditure Report for Debt Retirement for all candidates.
- It links county/municipal/school board Campaign Contribution and Expenditure Report and instructions.
- It links Statement of Financial Interest PDF and instructions.
- It links Code of Arkansas Rules / Rules on Campaign Finance and Disclosure.

AI use:

- Use this page as a contrast point for county candidate workflows, not as the primary Secretary of State workflow.
- If an operator asks county-specific questions, cite this page and avoid applying county thresholds to state/district candidates without review.

## Source-to-Feature Map

### Money In

Relevant sources:

- Rules on Campaign Finance and Disclosure: definitions, contribution amounts, prohibited contributions, in-kind contributions, records, state/district reports.
- Ethics Forms and Instructions: State and District Candidate Campaign Contribution and Expenditure Report.
- Campaign Contribution Limit notice page.

Coverage implications:

- Credit card / GoodChange contributions should retain gross, fee, net, transaction date, donor identity, address, employer, occupation, recurring/refund flags, and processor transaction ID.
- Cash and check contributions should be staged for donor information completeness, amount, date, source evidence, and human review.
- In-kind contributions need value, donor identity, description, date, and review.
- Loans need lender, terms, amount, date, repayments, guarantor information where applicable, and rule-section review.

### Money Out

Relevant sources:

- Rules on Campaign Finance and Disclosure: expenditure definition, campaign cash expenditures, reporting expenditures by credit card, allowable expenditures, use/personal use rules, records, verification.
- Ethics Forms and Instructions: Campaign Contribution and Expenditure Report and Final Report.

Coverage implications:

- Vendor payments, staff/1099 payments, debit/ACH/card payments, check payments, reimbursements, bank fees, processor fees, and transfers should be staged as money movements with purpose, payee/vendor, payment method, amount, date, and documentation status.
- Credit card expenditures require explicit review against credit-card reporting rules.
- Cash expenditures should be separately flagged for review under the cash expenditure rule section.

### Reports, Deadlines, and Filing Readiness

Relevant sources:

- SOS Financial Disclosure page.
- Ethics Reporting Calendars page.
- Ethics Forms and Instructions page.
- Rules on Campaign Finance and Disclosure: state/district candidate reporting sections, verification, penalties.

Coverage implications:

- The app should separate filing readiness from final certification.
- The app should store the calendar source URL and retrieval date used for any deadline checklist.
- The app should generate “needs human review” warnings for missing donor fields, missing employer/occupation, missing receipts, unmatched bank deposits, processor fee mismatches, debts/loans, refunds, and corrections.

## Current Database Search Result

Checked via Supabase MCP on 2026-05-17:

- Active likely Kelly project `Kelly-Grappe-App` (`giozeoqulfojhxpywjil`): `ComplianceDocument = 0`, `SearchChunk = 0`, `FinancialTransaction = 0`.
- Older project `supabase-aqua-globe` (`nzrpiugqabmagfdniefi`): matching tables exist but counts are zero.
- Backup clone project `clone_backup` (`fchbcmkedjqeycmhavpq`): matching tables exist but counts are zero for `ComplianceDocument`, `SearchChunk`, `FinancialTransaction`, `submissions`, and `donations`.

Conclusion: the official compliance library was not present in the searched Supabase projects. This markdown file is the first source-backed RedDirt compliance rules library and should be ingested into `SearchChunk`.

## AI Agent Rules

- Always cite source title, source URL, and retrieval date for compliance answers.
- Label all generated summaries “for staff review, not legal advice.”
- Never mark a filing complete, legally compliant, or submitted.
- Never infer missing legal deadlines from memory; retrieve the calendar source.
- Never store SSNs/TINs in JSON fallback or SearchChunk.
- Never expose internal compliance chunks through public Ask Kelly unless explicitly reviewed and allowed.
- For ambiguous items, suggest escalation to campaign treasurer, compliance officer, or counsel.
