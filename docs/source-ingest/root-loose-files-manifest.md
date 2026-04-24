# Source ingest manifest — root loose files (no subfolders)

**Packet:** SOURCE-INGEST-LOOSE-FILES  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned scope:** **Files only** at the ingest root ( **no** subfolders — e.g. `electionResults\` **excluded** from this table).  
**Scan time (UTC):** 2026-04-23

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (`13` / `13` JSONs on audited DB; verified before scan).

**Folder summary:** **72** loose files — mixed **finance** exports (committee donors/transactions, SOS-style templates, contribution workbooks), **volunteer / field** spreadsheets, **communications** and **compliance** DOCX (Substack drafts, Save Act explainers, civic strategy), **biography** DOCX, **media** (PNG/JPG, ~100 MB `.mov`, ~5 MB `.pptx`). **Two** **`Unconfirmed *.crdownload`** files (~3.9 GB combined) are **incomplete downloads** — **quarantine**, do not treat as final sources.

**Dry-run / DB ingest:** **Not performed** for this packet — manifest and classification only. **Do not** ingest **finance** rows into DB until a **dedicated** finance packet and policy exist. **`ingest-campaign-folder`** for raw **CSV/XLSX** transactions is **not recommended** (same posture as February/March filing manifests).

---

## Summary counts

| By extension | Count |
|--------------|------:|
| `.docx` | 36 |
| `.xlsx` | 19 |
| `.png` | 8 |
| `.csv` | 4 |
| `.crdownload` | 2 |
| `.jpg` | 1 |
| `.mov` | 1 |
| `.pptx` | 1 |
| **Total** | **72** |

| likely_domain | Count | Notes |
|---------------|------:|-------|
| finance | 17 | Donors, transactions, SOS templates, contribution templates — **blocked_sensitive** |
| compliance | 16 | Civic / organizing / Save Act / strategy DOCX (incl. civics event brief) |
| communications | 15 | Substack, press, comms training, scripts |
| media | 11 | PNG/JPG, **`DAB promo 1.mov`** (~100 MB), **`The Hub 12-16-25.pptx`** (~5 MB) |
| volunteer | 6 | Field spreadsheets + welcome kit DOCX |
| biography | 4 | Bio + letter + survey response |
| unknown | 3 | **2×** `.crdownload` + **`Untitled spreadsheet.xlsx`** |
| **Total** | **72** |

*Domains are **heuristic** from filenames only — no document body was read for this manifest.*

---

## Media notes

- **`DAB promo 1.mov`:** ~100 MB — prefer **transcode** or **link-only** in product; avoid bloating default media sync.  
- **`The Hub 12-16-25.pptx`:** ~5 MB — extract slides or PDF handoff if RAG-bound; otherwise **asset library** only.  
- **Large PNGs:** e.g. **`sos pull up banner.PNG`** ~14 MB — consider **compression** or **WebP** for web.

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_donors_ (1).xlsx` | `_Committee to Elect Kelly Grappe_donors_ (1).xlsx` | `.xlsx` | 17490 | 2026-04-21T21:23:20.485Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_donors_ (2).xlsx` | `_Committee to Elect Kelly Grappe_donors_ (2).xlsx` | `.xlsx` | 23580 | 2026-04-21T21:23:26.193Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_donors_.csv` | `_Committee to Elect Kelly Grappe_donors_.csv` | `.csv` | 23270 | 2026-04-21T21:23:16.184Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_donors_.xlsx` | `_Committee to Elect Kelly Grappe_donors_.xlsx` | `.xlsx` | 17490 | 2026-04-21T21:23:12.617Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_transactions_Dec 1, 2025_Dec 31, 2025_.csv` | `_Committee to Elect Kelly Grappe_transactions_Dec 1, 2025_Dec 31, 2025_.csv` | `.csv` | 4152 | 2026-04-21T21:23:05.871Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_transactions_Dec 1, 2025_Dec 31, 2025_.xlsx` | `_Committee to Elect Kelly Grappe_transactions_Dec 1, 2025_Dec 31, 2025_.xlsx` | `.xlsx` | 8470 | 2026-04-21T21:23:07.574Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_transactions_Feb 1, 2026_Feb 17, 2026_.csv` | `_Committee to Elect Kelly Grappe_transactions_Feb 1, 2026_Feb 17, 2026_.csv` | `.csv` | 6811 | 2026-04-21T21:22:56.298Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_transactions_Feb 1, 2026_Feb 17, 2026_.xlsx` | `_Committee to Elect Kelly Grappe_transactions_Feb 1, 2026_Feb 17, 2026_.xlsx` | `.xlsx` | 10135 | 2026-04-21T21:22:58.945Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_transactions_Jan 1, 2026_Jan 31, 2026_.csv` | `_Committee to Elect Kelly Grappe_transactions_Jan 1, 2026_Jan 31, 2026_.csv` | `.csv` | 9180 | 2026-04-21T21:22:53.452Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\1 (1).png` | `1 (1).png` | `.png` | 2328305 | 2026-04-21T21:22:49.715Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\2026 Bio.docx` | `2026 Bio.docx` | `.docx` | 7703 | 2026-04-21T21:22:41.119Z | biography | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Angie Maxwell letter.docx` | `Angie Maxwell letter.docx` | `.docx` | 8079 | 2026-04-21T21:22:37.144Z | biography | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Apa survey response.docx` | `Apa survey response.docx` | `.docx` | 10424 | 2026-04-21T21:22:31.367Z | biography | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\arkansas_county_visits_FINAL.xlsx` | `arkansas_county_visits_FINAL.xlsx` | `.xlsx` | 13963 | 2026-04-21T21:22:24.485Z | volunteer | Future volunteer/field parser — **not** auto-ingest PII; review columns | needs_review | | |
| `H:\SOSWebsite\campaign information for ingestion\arkansas_county_voter_tracker_partial.xlsx` | `arkansas_county_voter_tracker_partial.xlsx` | `.xlsx` | 25614 | 2026-04-21T21:22:20.310Z | volunteer | Future volunteer/field parser — **not** auto-ingest PII; review columns | needs_review | | |
| `H:\SOSWebsite\campaign information for ingestion\ArvoterRegistration_Power_of_5_Team_Goals.xlsx` | `ArvoterRegistration_Power_of_5_Team_Goals.xlsx` | `.xlsx` | 20086 | 2026-04-21T21:22:16.382Z | volunteer | Future volunteer/field parser — **not** auto-ingest PII; review columns | needs_review | | |
| `H:\SOSWebsite\campaign information for ingestion\Camden overview.docx` | `Camden overview.docx` | `.docx` | 9586 | 2026-04-21T21:22:10.932Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Campaign_Team_Culture_Charter.docx` | `Campaign_Team_Culture_Charter.docx` | `.docx` | 20816 | 2026-04-21T21:22:08.010Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Carroll county substack.docx` | `Carroll county substack.docx` | `.docx` | 9076 | 2026-04-21T21:22:05.891Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Civic engagement platform.docx` | `Civic engagement platform.docx` | `.docx` | 9989 | 2026-04-21T21:22:01.595Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Comm channel launch.docx` | `Comm channel launch.docx` | `.docx` | 9551 | 2026-04-21T21:21:56.764Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Comms team training.docx` | `Comms team training.docx` | `.docx` | 14748 | 2026-04-21T21:21:50.129Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Community Organizing Strategy Overview.docx` | `Community Organizing Strategy Overview.docx` | `.docx` | 10007 | 2026-04-21T21:21:38.382Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Community organizing.docx` | `Community organizing.docx` | `.docx` | 9970 | 2026-04-21T21:21:45.218Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\composed.jpg` | `composed.jpg` | `.jpg` | 609368 | 2026-04-21T21:21:36.530Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\ContributionTemplate (2).xlsx` | `ContributionTemplate (2).xlsx` | `.xlsx` | 10985 | 2026-04-21T21:21:34.243Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\Copy of sos business cards.PNG` | `Copy of sos business cards.PNG` | `.png` | 999428 | 2026-04-21T21:21:30.382Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\Corrections on 2_25 Report for past months.xlsx` | `Corrections on 2_25 Report for past months.xlsx` | `.xlsx` | 5079 | 2026-04-21T21:21:27.435Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\Counties visited.docx` | `Counties visited.docx` | `.docx` | 7802 | 2026-04-21T21:21:23.534Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Culture is the strategy.docx` | `Culture is the strategy.docx` | `.docx` | 10563 | 2026-04-21T21:21:18.679Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\DAB promo 1.mov` | `DAB promo 1.mov` | `.mov` | 105158763 | 2026-04-21T21:21:35.953Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\Final Contributions Jan 2026.xlsx` | `Final Contributions Jan 2026.xlsx` | `.xlsx` | 13278 | 2026-04-21T21:21:10.782Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\Hot Springs substack.docx` | `Hot Springs substack.docx` | `.docx` | 10513 | 2026-04-21T21:21:05.058Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\I ❤️ Arkansas- History, Civics & Community Feb 14th 2026 Event .docx` | `I ❤️ Arkansas- History, Civics & Community Feb 14th 2026 Event .docx` | `.docx` | 188120 | 2026-04-21T21:21:02.207Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\IMG_8147.PNG` | `IMG_8147.PNG` | `.png` | 442628 | 2026-04-21T21:20:55.948Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\Kelly Grappe - Abbrev Bio_Priorities.docx` | `Kelly Grappe - Abbrev Bio_Priorities.docx` | `.docx` | 8286 | 2026-04-21T21:20:34.767Z | biography | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Listening Session Brief.docx` | `Listening Session Brief.docx` | `.docx` | 11445 | 2026-04-21T21:20:31.729Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\MEGA substack.docx` | `MEGA substack.docx` | `.docx` | 11246 | 2026-04-21T21:20:28.482Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\MLK naacp speech.docx` | `MLK naacp speech.docx` | `.docx` | 7836 | 2026-04-21T21:20:25.365Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\MLK reflections.docx` | `MLK reflections.docx` | `.docx` | 8727 | 2026-04-21T21:20:22.281Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Mountain home press release.docx` | `Mountain home press release.docx` | `.docx` | 7642 | 2026-04-21T21:20:18.020Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Nov 2025 Cash_Check donations.xlsx` | `Nov 2025 Cash_Check donations.xlsx` | `.xlsx` | 10893 | 2026-04-21T21:20:15.750Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\Nov 2025 Good Change Donations.xlsx` | `Nov 2025 Good Change Donations.xlsx` | `.xlsx` | 21730 | 2026-04-21T21:20:12.434Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\November 2025 Contributions - SOS Template.xlsx` | `November 2025 Contributions - SOS Template.xlsx` | `.xlsx` | 63368 | 2026-04-21T21:20:08.263Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\November 2025 Expenditures - SOS Template.xlsx` | `November 2025 Expenditures - SOS Template.xlsx` | `.xlsx` | 41469 | 2026-04-21T21:20:05.069Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\November 2025 Expenses.xlsx` | `November 2025 Expenses.xlsx` | `.xlsx` | 10791 | 2026-04-21T21:20:00.905Z | finance | **None approved** — no structured finance DB ingest (see [`february-filing-details-…`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-…`](./march-filing-details-20260421t211053z-manifest.md)) | blocked_sensitive | | |
| `H:\SOSWebsite\campaign information for ingestion\Regnat Populus session.docx` | `Regnat Populus session.docx` | `.docx` | 11712 | 2026-04-21T21:19:56.832Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Run of show at the table.docx` | `Run of show at the table.docx` | `.docx` | 1008311 | 2026-04-21T21:19:45.122Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Save act demystified.docx` | `Save act demystified.docx` | `.docx` | 12413 | 2026-04-21T21:19:41.882Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Save act explainer pt 2.docx` | `Save act explainer pt 2.docx` | `.docx` | 12537 | 2026-04-21T21:19:38.539Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Save act final substack.docx` | `Save act final substack.docx` | `.docx` | 11575 | 2026-04-21T21:19:35.447Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Script.docx` | `Script.docx` | `.docx` | 7870 | 2026-04-21T21:19:31.642Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Sherwood Homecoming Planning.xlsx` | `Sherwood Homecoming Planning.xlsx` | `.xlsx` | 19011 | 2026-04-21T21:19:29.087Z | volunteer | Future volunteer/field parser — **not** auto-ingest PII; review columns | needs_review | | |
| `H:\SOSWebsite\campaign information for ingestion\Social SOS Teamplate (1).PNG` | `Social SOS Teamplate (1).PNG` | `.png` | 427055 | 2026-04-21T21:19:04.519Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\Social SOS Teamplate.PNG` | `Social SOS Teamplate.PNG` | `.png` | 995998 | 2026-04-21T21:19:01.707Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\sos pull up banner.PNG` | `sos pull up banner.PNG` | `.png` | 14319120 | 2026-04-21T21:18:59.577Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\sos push card.PNG` | `sos push card.PNG` | `.png` | 3040553 | 2026-04-21T21:18:55.011Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\Steady leadership op Ed.docx` | `Steady leadership op Ed.docx` | `.docx` | 8093 | 2026-04-21T21:18:51.403Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\substack cover (1).PNG` | `substack cover (1).PNG` | `.png` | 268120 | 2026-04-21T21:18:48.205Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\Substack welcome.docx` | `Substack welcome.docx` | `.docx` | 7283 | 2026-04-21T21:18:39.099Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Substack_ Community Strategy - Trust Before Turnout.docx` | `Substack_ Community Strategy - Trust Before Turnout.docx` | `.docx` | 11804 | 2026-04-21T21:18:35.511Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Talk business national election response.docx` | `Talk business national election response.docx` | `.docx` | 7651 | 2026-04-21T21:18:32.079Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\The Hub 12-16-25.pptx` | `The Hub 12-16-25.pptx` | `.pptx` | 5094529 | 2026-04-21T21:18:30.640Z | media | `media:index-roots` / owned-media after review — see **Media notes** (large `.mov` / `.pptx`) | candidate_media_index | | |
| `H:\SOSWebsite\campaign information for ingestion\The people rule civic Ed outline.docx` | `The people rule civic Ed outline.docx` | `.docx` | 9799 | 2026-04-21T21:18:25.893Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Unconfirmed 25897.crdownload` | `Unconfirmed 25897.crdownload` | `.crdownload` | 2012557928 | 2026-04-21T21:24:40.724Z | unknown | **None** — quarantine; complete or delete download | quarantine_incomplete_download | | |
| `H:\SOSWebsite\campaign information for ingestion\Unconfirmed 590833.crdownload` | `Unconfirmed 590833.crdownload` | `.crdownload` | 1891073048 | 2026-04-21T21:24:41.278Z | unknown | **None** — quarantine; complete or delete download | quarantine_incomplete_download | | |
| `H:\SOSWebsite\campaign information for ingestion\Untitled spreadsheet.xlsx` | `Untitled spreadsheet.xlsx` | `.xlsx` | 13092 | 2026-04-21T21:18:21.777Z | unknown | Manual triage | needs_review | | |
| `H:\SOSWebsite\campaign information for ingestion\Van buren county.docx` | `Van buren county.docx` | `.docx` | 9499 | 2026-04-21T21:18:11.066Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Volunteer Welcome Kit (1).docx` | `Volunteer Welcome Kit (1).docx` | `.docx` | 10708 | 2026-04-21T21:18:07.477Z | volunteer | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | needs_review | | |
| `H:\SOSWebsite\campaign information for ingestion\Voter Registration Strategy.docx` | `Voter Registration Strategy.docx` | `.docx` | 14232 | 2026-04-21T21:18:04.169Z | compliance | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Writing team welcome.docx` | `Writing team welcome.docx` | `.docx` | 9679 | 2026-04-21T21:18:00.515Z | communications | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review** first | candidate_comms_or_briefing | | |
| `H:\SOSWebsite\campaign information for ingestion\Yard Sign Request Form_ Campaign for Kelly Grappe (Responses).xlsx` | `Yard Sign Request Form_ Campaign for Kelly Grappe (Responses).xlsx` | `.xlsx` | 9834 | 2026-04-21T21:17:49.145Z | volunteer | Future volunteer/field parser — **not** auto-ingest PII; review columns | needs_review | | |

---

## Parser / backlog

| Domain | Recommendation |
|--------|----------------|
| **finance** | **None approved** for structured DB ingest. Align with February/March filing manifests: [`february-filing-details-20260421t211056z-manifest.md`](./february-filing-details-20260421t211056z-manifest.md), [`march-filing-details-20260421t211053z-manifest.md`](./march-filing-details-20260421t211053z-manifest.md). |
| **DOCX** (comms / compliance / bio / volunteer kit) | `ingest-campaign-folder` / `ingest:docs` subset with **`--comms`** or briefing preset — **human review**; do not publish unreviewed extracts. |
| **Volunteer XLSX** | Future **volunteer/field** parser — review columns for **PII** before any automation. |
| **Media** | `media:index-roots` / owned-media path after **license** and **usage** review. |
| **`.crdownload`** | **None** — complete download or delete; exclude from inventories until renamed to a real extension. |

---

## Safety

- **No** voter targeting or finance DB writes from this packet.  
- **No** inference of private personal data from filenames.  
- **No** production mutations or migrations.  
- Treat **finance** exports as **controlled**; treat **volunteer** spreadsheets as **PII**-risk until reviewed.
