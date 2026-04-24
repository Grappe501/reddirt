# Arkleg intelligence — human verification worksheet (INTEL-4B-3)

**Purpose:** Move **automated arkleg discovery** (`ingest:arkleg-opposition` dry-run / generated shortlist) into the **curated** opposition workflow. Nothing in [`data/intelligence/generated/arkleg-review-shortlist.json`](../data/intelligence/generated/arkleg-review-shortlist.json) is verified until a reviewer completes this sheet.

**Related:** [`intelligence-source-collection-checklist.md`](./intelligence-source-collection-checklist.md) · [`data/intelligence/README.md`](../data/intelligence/README.md) · `npm run ingest:opposition-intel` with `--require-approved` for governed live import.

---

## Instructions

1. Open the **official bill URL** for each row (arkleg bill detail page from the shortlist).
2. Confirm **sponsor / role** on the official page matches the row’s `role` / sponsor list (legislator grids can summarize roles; the bill page is authoritative).
3. Confirm **title** matches the official short title or your campaign’s agreed citation string.
4. Skim **bill text** or the official summary on the portal — do not rely on grid titles alone for claims.
5. If citing **speech**, open the **official video URL**, confirm the **timestamp** (`timestampLabel` or manual note), and capture the label you will use in internal notes.
6. Set **`approvedForSeed`** to **yes** only after the above are satisfied for that row; otherwise leave **no** and keep **`verificationStatus`** as **NEEDS_HUMAN_VERIFICATION** or **REJECTED**.
7. After review, promote approved rows into a **separate** curated JSON (or edit the legislative seed) with `reviewStatus: APPROVED` where appropriate. **`opponent-legislative-candidates.json`** stays **DRAFT** until you replace it or copy verified rows elsewhere.

---

## Worksheet

| shortlistLocalKey | billNumber | official bill URL | official video URL | verified title | verified role | verified session | direct democracy relevance | county/finance relevance | human notes | verificationStatus | approvedForSeed | reviewer | reviewedAt |
|-------------------|------------|-------------------|--------------------|----------------|---------------|------------------|----------------------------|----------------------------|-------------|---------------------|-----------------|----------|------------|
| | | | | | | | | | | NEEDS_HUMAN_VERIFICATION | no | | |
| | | | | | | | | | | | | | | |

_Add rows as needed (shortlist has at most 25 machine-picked candidates)._

---

## Live import reminder

- **`npm run ingest:opposition-intel -- --file … --require-approved`** refuses a **live** import if any entity, source, or record row is not **`APPROVED`**.
- **`--dry-run`** with **`--require-approved`** still validates JSON and prints **`blockedRowCount`** and the list of rows that would block a live run.
