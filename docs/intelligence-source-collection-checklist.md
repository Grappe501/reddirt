# Intelligence source collection checklist (INTEL-4B-2)

**Packet:** **INTEL-4B-2** — Curated, **operator-driven** collection of **public** sources for **Campaign Intelligence / Reporting**. **No** automated scraping in this step, **no** invented bill rows, **no** bulk ingest, **no** publishing claims, **no** AI conclusions.

**Use:** Copy rows into spreadsheets or JSON bundles (`data/intelligence/*.json`) only after each field is filled from a **real** URL or file path. `reviewStatus` stays **`NEEDS_REVIEW`** until human sign-off.

**INTEL-4B-3:** Automated arkleg output is **discovery only**. After `ingest:arkleg-opposition --dry-run --write-shortlist`, use **[`arkleg-intelligence-verification-worksheet.md`](./arkleg-intelligence-verification-worksheet.md)** before treating any bill row as verified.

---

## Field legend (every row)

| Field | Meaning |
|-------|--------|
| **sourceUrl** | Canonical public HTTPS URL |
| **sourcePath** | Host file path if evidence is offline (e.g. under `H:\SOSWebsite\campaign information for ingestion\`) |
| **dateAccessed** | ISO date you pulled or verified the source |
| **confidence** | `VERIFIED` (primary doc open) · `LIKELY` (strong secondary) · `UNVERIFIED` (not yet opened) |
| **notes** | Analyst note (e.g. session, chamber, bill version) |
| **reviewStatus** | Default **`NEEDS_REVIEW`** |

---

## 1. Arkansas Legislature — bills and actions

| # | Checklist item | sourceUrl | sourcePath | dateAccessed | confidence | notes | reviewStatus |
|---|----------------|-----------|------------|--------------|------------|-------|--------------|
| 1.1 | Legislator profile (session dropdown) | | | | | `member` query + `ddBienniumSession` | NEEDS_REVIEW |
| 1.2 | Sponsored bills (Primary) | | | | | Export or copy from profile grid | NEEDS_REVIEW |
| 1.3 | Co-sponsored bills | | | | | Same | NEEDS_REVIEW |
| 1.4 | Bill detail / History (`/Bills/Detail`) | | | | | Per bill | NEEDS_REVIEW |
| 1.5 | Committee actions (from bill History) | | | | | Dates for video lookup | NEEDS_REVIEW |
| 1.6 | Floor actions | | | | | | NEEDS_REVIEW |
| 1.7 | Roll-call votes (if cited) | | | | | Official vote record URL | NEEDS_REVIEW |
| 1.8 | **Direct democracy** bill set (initiative / petition / referendum) | | | | | Tag `impactArea` e.g. `DIRECT_DEMOCRACY` | NEEDS_REVIEW |

**Official entry (bookmark):** [Arkansas State Legislature](https://www.arkleg.state.ar.us/) · [Legislators](https://www.arkleg.state.ar.us/Legislators) · [Bill search](https://www.arkleg.state.ar.us/Bills/Search).

---

## 2. Official video

| # | Checklist item | sourceUrl | sourcePath | dateAccessed | confidence | notes | reviewStatus |
|---|----------------|-----------|------------|--------------|------------|-------|--------------|
| 2.1 | Senate floor / committee (archived) | | | | | Often Sliq links from bill **Meetings** | NEEDS_REVIEW |
| 2.2 | House video (if applicable) | | | | | | NEEDS_REVIEW |
| 2.3 | SOS / state board public meetings | | | | | If race-relevant | NEEDS_REVIEW |
| 2.4 | **Timestamp** (player deep link or `mediaStartTime`) | | | | | First presentation segment | NEEDS_REVIEW |
| 2.5 | **Transcript status** | | | | | `NOT_STARTED` / `PARTIAL` / `COMPLETE` / `N_A` | NEEDS_REVIEW |

**Examples (bookmark only — verify before citing):** [Arkansas Senate](https://senate.arkansas.gov/) (media / archived meetings in site nav).

---

## 3. Campaign finance

| # | Checklist item | sourceUrl | sourcePath | dateAccessed | confidence | notes | reviewStatus |
|---|----------------|-----------|------------|--------------|------------|-------|--------------|
| 3.1 | Arkansas Ethics / AEC filing (candidate or committee) | | | | | Filing ID in notes | NEEDS_REVIEW |
| 3.2 | PAC or IE committee | | | | | | NEEDS_REVIEW |
| 3.3 | Donor / employer (as disclosed) | | | | | Row-level citation | NEEDS_REVIEW |
| 3.4 | Geography (as filed) | | | | | | NEEDS_REVIEW |

---

## 4. News archive

| # | Checklist item | sourceUrl | sourcePath | dateAccessed | confidence | notes | reviewStatus |
|---|----------------|-----------|------------|--------------|------------|-------|--------------|
| 4.1 | Article | | | | | Headline + outlet + date | NEEDS_REVIEW |
| 4.2 | **Sentiment** | — | — | | | **Manual** analyst label only | NEEDS_REVIEW |

---

## 5. County / election pattern sources

| # | Checklist item | sourceUrl | sourcePath | dateAccessed | confidence | notes | reviewStatus |
|---|----------------|-----------|------------|--------------|------------|-------|--------------|
| 5.1 | County results (SOS JSON or summary) | | | | | Align with `electionResults` ingest | NEEDS_REVIEW |
| 5.2 | Turnout / registration denominator | | | | | Define denominator in notes | NEEDS_REVIEW |
| 5.3 | Primary vs general / runoff comparison | | | | | Contest IDs in notes | NEEDS_REVIEW |

---

## Related repo paths

- Seed template: `data/intelligence/opponent-legislative-seed.json`
- Manual JSON import: `npm run ingest:opposition-intel -- --file <path> [--dry-run]`
- Competitor manifest: [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md)
- Ingest backlog: [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md)

---

*INTEL-4B-2 — checklist only unless operator fills verified cells; no auto-approve.*
