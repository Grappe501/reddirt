# Official candidate & compliance resource inventory (INGEST-OPS-1) (RedDirt)

**Purpose:** Single **practical** table for resources discovered from **SOS For Candidates**, **SOS Financial Disclosure**, the **uploaded SBEC handbook PDF**, and **co-located election JSON** in the campaign intake folder. **Repo-grounded** models: `ComplianceDocument` (`prisma/schema.prisma`).

**Disclaimer:** **Not** legal advice. URLs **must** be re-verified before reliance.

**Cross-ref:** [`sos-for-candidates-ingest-map.md`](./sos-for-candidates-ingest-map.md) · [`sos-ethics-resource-inventory.md`](./sos-ethics-resource-inventory.md) · [`official-source-ingest-foundation.md`](./official-source-ingest-foundation.md)

---

## Inventory

| Resource name | Format | Source page | Likely storage mode | Domain owner (conceptual) | Searchable official knowledge? |
|---------------|--------|-------------|---------------------|---------------------------|--------------------------------|
| Candidate Information Form | PDF | For Candidates | `ComplianceDocument` + URL in notes | Compliance / candidate ops | If `approvedForAiReference` |
| Federal Candidate Information Form | PDF | For Candidates | `ComplianceDocument` | Compliance | If approved |
| Political Practices Pledge | PDF | For Candidates | `ComplianceDocument` | Compliance | If approved |
| 2026 Candidate Search | Web app | For Candidates | **Link catalog** only | Candidate ops | No |
| 2026 Election Calendar | PDF | For Candidates | `ComplianceDocument` (`DEADLINE_CALENDAR`) | Compliance / ops | If approved |
| Running for Public Office handbook (2025-08-13) | PDF | SBEC URL on For Candidates; copy may also sit in `H:\SOSWebsite\campaign information for ingestion\electionResults` | `ComplianceDocument` — **dedupe** uploads by hash | Compliance / training | **Yes** when approved |
| Notice: New Online Campaign Finance Disclosure | SOS news HTML | For Candidates | **Link** + optional memo PDF | Compliance | Optional memo only |
| Online Financial Disclosure System | Portal | For Candidates + Financial Disclosure | **Link only** | Compliance | No |
| Statement of Financial Interest | PDF | Financial Disclosure | `ComplianceDocument` | Compliance | If approved |
| CC&E fillable + variants | PDF | Financial Disclosure | `ComplianceDocument` | Compliance | If approved |
| Training guides (CF / Ethics / Lobbyist) | PDF | Financial Disclosure | `ComplianceDocument` (`FILING_INSTRUCTIONS` / `OTHER`) | Ops training | If approved |
| Affidavits (PAC / Exploratory / IE) | PDF | Financial Disclosure | `ComplianceDocument` | Compliance | If approved |
| Archived filing search | Web | Financial Disclosure | **Link** | Compliance research | No |
| Ethics Commission forms index | Web | Financial Disclosure | **Link** | Compliance | No |
| Party links (R/D/LP) | Web | For Candidates | **Link** | Candidate ops | No |
| Election results JSON (2016–2026) | JSON | Local `electionResults` folder | **Raw file store** + future **`Election*` tables** | Data / targeting | **No** (structured ingest, not RAG) |

**Detail rows for Financial Disclosure PDFs:** see [`sos-ethics-resource-inventory.md`](./sos-ethics-resource-inventory.md).

---

## Repo inspection (INGEST-OPS-1 §E)

1. **What official candidate/compliance resources can be ingested immediately from the SOS pages?**  
   **PDFs** the campaign chooses to mirror: candidate forms, pledge, calendar, SFI, CC&E, training guides, affidavits — as **`ComplianceDocument`** rows with **`storageKey`**. **Links** can be tracked in **`notes`** until a `sourceUrl` column exists.

2. **What should remain link-only for now?**  
   **`candidates.arkansas.gov`** search app, **`ethics-disclosures.sos.arkansas.gov`** portal, **archived** `sosweb.state.ar.us` search, **party** and **ethics.com** sites, SOS **news** HTML (unless staff uploads a snapshot PDF intentionally).

3. **What current models can already hold official-resource metadata or files?**  
   **`ComplianceDocument`** is the **only** first-class fit for **uploaded** official PDFs. **`MediaAsset`** is URL/image oriented for editorial content — **not** the compliance vault. **`CalendarSource`** is for Google sync — **not** a substitute for storing the SOS PDF calendar.

4. **Is `ComplianceDocument` enough for first-pass official resource ingest?**  
   **Yes** for **file + type + AI flag + period notes + URL in notes**. **No** for a full **link-only catalog** at scale — add **`OfficialResource`** or extend schema in a later packet.

5. **What do the uploaded JSON files prove we can ingest now?**  
   **Turnout**, **contests**, **candidates/choices**, **county** and **precinct/location** vote splits — see [`election-results-ingest-foundation.md`](./election-results-ingest-foundation.md).

6. **Was the raw `electionResults` folder accessible from Cursor’s environment?**  
   **Yes** (2026-04-23): `H:\SOSWebsite\campaign information for ingestion\electionResults` listed **14** files (JSON + handbook PDF). **Other environments** may differ — [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md) records the snapshot.

7. **What should the next ingest packet be?**  
   **Election:** `DATA-4` / **`ELECTION-INGEST-1`** — schema + JSON loader + validation report. **Official docs:** **`OFFICIAL-INGEST-2`** — optional link catalog + `sourceUrl` on `ComplianceDocument` or new model.

---

*Last updated: Packet INGEST-OPS-1.*
