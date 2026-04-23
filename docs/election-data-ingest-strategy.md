# Election data ingest strategy (DATA-3) (RedDirt)

**Packet DATA-3 (Part B).** **Operational spec** for how results files become **`County`**-linked rows. **No** ingestion code in this packet.

**Cross-ref:** [`election-results-foundation.md`](./election-results-foundation.md) · [`geographic-county-mapping.md`](./geographic-county-mapping.md) · [`county-registration-goals-verification.md`](./county-registration-goals-verification.md) (provenance discipline)

---

## 1. Expected source formats

| Format | Typical use | Notes |
|--------|-------------|--------|
| **CSV** | County or precinct results from SOS, vendor, or research | Prefer **UTF-8**; document delimiter and header row. |
| **XLSX** | Same, when received as spreadsheet | Use **sheet name** and **header row index** in SOP; avoid formula cells for authoritative counts. |
| **PDF** | Official statements of vote | **Out of scope** for automated v1 unless ops provides **extracted** CSV with provenance. |

---

## 2. Normalization steps (pipeline order)

1. **Ingest raw file** — store blob reference (e.g. `ComplianceDocument` or future `ElectionResultsSourceFile`) with **hash**, **filename**, **retrievedAt** — **DATA-4** chooses storage.
2. **Parse rows** — validate integers, reject negative votes, flag **sum(candidate votes) vs reported total** mismatches.
3. **Map geography:**
   - **County:** map source **county name** → **`County.fips`** or **`County.slug`** via a **controlled lookup table** (Arkansas 75 counties — maintain **alias** list for “St. Francis” vs “Saint Francis”, etc.).
   - **Precinct:** retain **`precinctKeyRaw`**; apply **`precinctKeyNormalized`** via **crosswalk** (per county, per election source).
4. **Map contest** — map file **office / race** columns → internal **`raceKey`** enum or string registry.
5. **Map candidates** — map **ballot text** → **`candidateKey`** (stable slug); handle **fusion**, **withdrawals**, and **multi-count** reporting.
6. **Denominators** — if file includes **registered voters** or **turnout %**, store **as provided** plus **`denominatorNote`**; if computing turnout in-app, **require** explicit choice documented per contest.
7. **Review** — `PENDING_REVIEW` → `APPROVED` for public/analytics use (reuse **`CountyContentReviewStatus`** pattern or parallel enum on contest).

---

## 3. Mapping county names → `County.id`

**Authoritative dimension:** **`County`** rows already in DB (`id`, `slug`, `fips`, `displayName`).

**Recommended join order:**

1. Match **FIPS** (5-digit county code) if present in file.
2. Else match **`County.slug`** if file uses URL-safe slug.
3. Else normalize **`displayName`** + **alias table** (ops-maintained).

**Do not** create duplicate county rows for ingest.

---

## 4. Mapping precinct strings

| Step | Action |
|------|--------|
| **Capture** | Store original precinct field **verbatim** in `precinctKeyRaw`. |
| **Normalize** | Trim, uppercase, collapse spaces; apply **per-county** map (e.g. `"03"` → `"PRECINCT_3"`). |
| **Align to voter file** | Compare distribution of **`PrecinctElectionResult.precinctKeyNormalized`** to `SELECT DISTINCT precinct FROM VoterRecord WHERE countyId = ?` — **coverage %** report before trusting joins. |
| **Gap handling** | Unmatched precincts **block** “precinct-level targeting” claims until resolved. |

---

## 5. Idempotency and re-import

- **Same file hash** → skip or replace **only** with operator confirmation.
- **Updated canvass** → new **`reportingBatch`** or bump **`supersededAt`** on prior rows — **DATA-4** defines conflict rules.

---

## 6. Governance

- **Legal/use**: only **public** or **licensed** data in ingest; document **restriction** on redistribution if any.
- **PII**: results tables are **aggregates** — **no** individual voter choices.

---

*Last updated: Packet DATA-3 (Part B).*
