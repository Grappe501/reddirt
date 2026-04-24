# SOS / Ethics resource inventory (OFFICIAL-INGEST-1) (RedDirt)

**Evidence:** Arkansas Secretary of State — **Financial Disclosure** page, retrieved 2026-04-23: `https://www.sos.arkansas.gov/elections/financial-disclosure` (content and links as published; **verify** URLs before reliance).

**Cross-ref:** [`official-source-ingest-foundation.md`](./official-source-ingest-foundation.md) · [`official-candidate-resource-inventory.md`](./official-candidate-resource-inventory.md) · [`sos-for-candidates-ingest-map.md`](./sos-for-candidates-ingest-map.md)

**Disclaimer:** Operational inventory only; **not** legal advice.

---

## Online filing system

| Resource name | Official source | Format | Likely ingest/storage | Likely system use | AI-searchable? | Structured later? |
|---------------|-----------------|--------|------------------------|-------------------|----------------|-------------------|
| Online Financial Disclosure System | `https://ethics-disclosures.sos.arkansas.gov/login` | Web portal | **Reference link** in catalog/metadata; **never** store credentials | Compliance / filing readiness | **No** (live system) | **No** — use portal APIs only if SOS provides and a future packet authorizes |

---

## Statement of Financial Interest (SFI)

| Resource name | Official source | Format | Likely ingest/storage | Likely system use | AI-searchable? | Structured later? |
|---------------|-----------------|--------|------------------------|-------------------|----------------|-------------------|
| Statement of Financial Interest Report (fillable) | `http://www.sos.arkansas.gov/uploads/elections/Statement-of-Financial-Interest.pdf` | PDF | **Upload mirror** → `ComplianceDocument` (`SOS_ETHICS_FORM` or `FILING_INSTRUCTIONS`) + URL in notes | Forms prep / compliance | **If** `approvedForAiReference` | Unlikely field-level without dedicated product scope |

---

## Campaign Contribution and Expenditure Report (CC&E)

| Resource name | Official source | Format | Likely ingest/storage | Likely system use | AI-searchable? | Structured later? |
|---------------|-----------------|--------|------------------------|-------------------|----------------|-------------------|
| Campaign Contribution and Expenditure Report (fillable) | `https://www.sos.arkansas.gov/uploads/elections/Campaign_Contribution_and_Expenditure_Report.pdf` | PDF | **Upload mirror** + metadata | Forms prep / compliance | **If** approved | **No** in this packet — ledger remains `FinancialTransaction`, not filing clone |
| Campaign Contribution and Expenditure Report (alternate static) | `http://www.sos.arkansas.gov/uploads/elections/06_Final_CE_-2017.pdf` | PDF | **Link + optional mirror** — label **version** in title/notes | Historical reference | If approved | No |
| Final CC&E (State, Dist) Report | `http://www.sos.arkansas.gov/uploads/elections/05_CE_%28State%2C_Dist%29_Report.pdf` | PDF | **Link + optional mirror** | Reference | If approved | No |

---

## Training guides

| Resource name | Official source | Format | Likely ingest/storage | Likely system use | AI-searchable? | Structured later? |
|---------------|-----------------|--------|------------------------|-------------------|----------------|-------------------|
| Campaign Finance Training Guide | `http://www.sos.arkansas.gov/uploads/elections/AR-SOS_Training_Guide_CF.pdf` | PDF | **Upload mirror** (`FILING_INSTRUCTIONS` or `OTHER`) | Staff training / filing readiness | **If** approved | No |
| Ethics Disclosure Training Guide | `https://www.sos.arkansas.gov/uploads/elections/AR-SOS_Training_Guide_Ethics.pdf` | PDF | **Upload mirror** | Staff training | If approved | No |
| Lobbyist Reporting System Training Guide | `https://www.sos.arkansas.gov/uploads/elections/AR-SOS_Training_Guide_Lobbyist.pdf` | PDF | **Upload mirror** | Staff training (if lobbyist work) | If approved | No |

---

## Affidavit forms

| Resource name | Official source | Format | Likely ingest/storage | Likely system use | AI-searchable? | Structured later? |
|---------------|-----------------|--------|------------------------|-------------------|----------------|-------------------|
| Affidavit — Political Action Committee | `https://www.sos.arkansas.gov/uploads/elections/Blank_Affidavit_for_PAC.pdf` | PDF | **Upload mirror** | Compliance (PAC path) | If approved | No |
| Affidavit — Exploratory Committee | `http://www.sos.arkansas.gov/uploads/elections/Blank_Affidavit_for_Exploratory_Committees.pdf` | PDF | **Upload mirror** | Compliance | If approved | No |
| Affidavit — Independent Expenditure Committee | `https://www.sos.arkansas.gov/uploads/elections/Blank_Affidavit_for_Independent_Expenditure.pdf` | PDF | **Upload mirror** | Compliance | If approved | No |

---

## Paper-filer lists (historical)

| Resource name | Official source | Format | Likely ingest/storage | Likely system use | AI-searchable? | Structured later? |
|---------------|-----------------|--------|------------------------|-------------------|----------------|-------------------|
| 2020 Candidates / Exploratory / IE / PAC lists | SOS-hosted XLSX links on same page (e.g. `May_Candidates.xlsx`, …) | XLSX | **Reference or download** to `OTHER` / notes — **not** auto-import | Reference | Usually **no** | Optional if PAC research needs |

---

## Additional forms

| Resource name | Official source | Format | Likely ingest/storage | Likely system use | AI-searchable? | Structured later? |
|---------------|-----------------|--------|------------------------|-------------------|----------------|-------------------|
| County BEC Financial Disclosure Statement | `http://www.sos.arkansas.gov/uploads/elections/CBECFinancialDisclosure.pdf` | PDF | **Upload mirror** | Niche compliance | If approved | No |
| Extra Income Statement | `https://www.sos.arkansas.gov/uploads/elections/ExtraIncomeForm.pdf` | PDF | **Upload mirror** | Compliance | If approved | No |
| Arkansas Ethics Commission Reporting Forms | `http://www.arkansasethics.com/` | Web (external) | **Link only** | Compliance routing | **No** until mirrored | No |

---

## Archived disclosure search

| Resource name | Official source | Format | Likely ingest/storage | Likely system use | AI-searchable? | Structured later? |
|---------------|-----------------|--------|------------------------|-------------------|----------------|-------------------|
| Search Archived Financial Disclosure Reports | `http://www.sosweb.state.ar.us/filing_search/index.php/filing/search/new` | Web portal | **Link only** | Human research | No | Only if specific filings downloaded + classified |
| Registered PACs and Lobbyists (2006–2017) | `https://www.sos.arkansas.gov/elections/financial-disclosure/registered-lobbyists-political-action-committees` | SOS page | **Link** | Reference | No | No |

---

## Candidate handbook (cross-page)

The **2026 Running for Public Office** handbook PDF is linked from **For Candidates** (SBEC host), not the Financial Disclosure table. See [`official-candidate-resource-inventory.md`](./official-candidate-resource-inventory.md) for one combined view.

---

*Last updated: Packet OFFICIAL-INGEST-1 (SOS Financial Disclosure snapshot).*
