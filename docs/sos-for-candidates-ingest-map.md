# SOS For Candidates — ingest map (INGEST-OPS-1) (RedDirt)

**Source page (hub):** `https://www.sos.arkansas.gov/elections/for-candidates` — retrieved 2026-04-23; **re-verify** links before operational use.

**Cross-ref:** [`official-candidate-resource-inventory.md`](./official-candidate-resource-inventory.md) · [`sos-ethics-resource-inventory.md`](./sos-ethics-resource-inventory.md) · [`official-document-ingest-strategy.md`](./official-document-ingest-strategy.md)

**Disclaimer:** **Not** legal advice. **Not** filing automation.

---

## 1. What the page contains

### 1.1 Candidate filing notice (HTML)

**Content:** Filing schedule notes (e.g. Veterans Day closure, partisan vs nonpartisan judicial deadlines as published).

**Nature:** **Time-sensitive** narrative on SOS page.

### 1.2 Candidate filing forms

| Resource | Link (as on page) |
|----------|-------------------|
| Candidate Information Form | `http://www.sos.arkansas.gov/uploads/elections/CandidateInfoForm.pdf` |
| Candidate Information Form (Federal Candidates) | `http://www.sos.arkansas.gov/uploads/elections/FederalCandidateInfoForm.pdf` |
| Political Practices Pledge | `https://www.sos.arkansas.gov/uploads/elections/PolPracPleg_6-2023.pdf` (as linked from SOS For Candidates; **verify** if URL changes) |

### 1.3 General candidate info

| Resource | Link |
|----------|------|
| 2026 Candidate Search | `https://candidates.arkansas.gov/` |
| 2026 Election Calendar | `http://www.sos.arkansas.gov/uploads/elections/2026_Election_Calendar_Rev._6-2025_.pdf` |
| 2026 Running for Public Office Handbook | `https://sbec.arkansas.gov/wp-content/uploads/2025-Running-for-Public-Office-8-13-25-FINAL-small.pdf` |
| Notice: New Online Campaign Finance Disclosure System | `https://www.sos.arkansas.gov/news/detail/notice-to-candidates-new-online-campaign-finance-disclosure-system` |
| Financial Disclosure Portal | `https://ethics-disclosures.sos.arkansas.gov/login` |

### 1.4 Links (external)

- Republican Party of Arkansas — `http://www.arkansasgop.org/`
- Democratic Party of Arkansas — `http://arkdems.org/`
- Libertarian Party of Arkansas — `http://www.lpar.org/`
- Arkansas Ethics Commission — `http://www.arkansasethics.com/`
- Judicial Ethics Advisory Committee — `http://www.state.ar.us/jeac/`
- Arkansas State Board of Election Commissioners (SBEC) — `http://www.arkansas.gov/sbec/`

---

## 2. Ingest treatment

| Resource | Treatment |
|----------|-----------|
| Candidate Information Form PDFs | **Stored file** + metadata (`ComplianceDocument`) + **canonical URL** in notes |
| Political Practices Pledge | **Stored file** + metadata |
| 2026 Candidate Search | **Official link only** (external app) |
| 2026 Election Calendar PDF | **Stored file** + `DEADLINE_CALENDAR` or `FILING_INSTRUCTIONS` + link |
| 2026 Running for Public Office Handbook | **Stored file** (SBEC URL) + same PDF may exist in election results folder — **dedupe by hash** |
| Notice (news article) | **Link + optional** staff summary doc — **not** scraped as legal truth |
| Financial Disclosure Portal | **Link only** |
| Party / ethics / JEAC links | **Link only** (external governance) |
| Filing notice HTML | **Link + optional** copy-paste summary in internal doc — **low** ingest priority |

---

## 3. System use

| Resource | Compliance | Candidate ops | Filing readiness | Calendar / deadlines | Forms prep | Knowledge retrieval |
|----------|------------|----------------|------------------|----------------------|------------|---------------------|
| Candidate forms | ● | ● | ● | | ● | ● if AI approved |
| Pledge | ● | ● | ● | | ● | ● if approved |
| Candidate Search | | ● | ● | | | link only |
| Election calendar | ● | ● | ● | ● | | ● if approved |
| Handbook | ● | ● | ● | ● | ● | ● if approved |
| Notice / news | ● | | ● | | | optional |
| Disclosure portal | ● | | ● | | | no |
| Party links | | ● | | | | no |
| Ethics / JEAC | ● | | ● | | | link |

---

## 4. Provenance (metadata to capture)

| Field | Apply to |
|-------|----------|
| **Source page** | `https://www.sos.arkansas.gov/elections/for-candidates` |
| **Source URL** | Each PDF or external link |
| **Document type** | Form / calendar / handbook / notice |
| **Official agency** | SOS vs SBEC vs Ethics Commission |
| **Retrieved / uploaded date** | Staff timestamp |
| **Authoritative vs reference-only** | PDF mirror = campaign copy; live pages = reference |
| **Approved for AI reference** | Per `ComplianceDocument.approvedForAiReference` |

---

*Last updated: Packet INGEST-OPS-1.*
