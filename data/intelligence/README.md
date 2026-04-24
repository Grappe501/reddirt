# Manual opposition intelligence (INTEL-4A + INTEL-4B-1)

This folder holds **JSON bundles** for **source-backed** competitor intelligence, imported with:

```text
npm run ingest:opposition-intel -- --file data/intelligence/<file>.json --dry-run
```

**INTEL-4B-1 curated seeds (legislative + video, placeholders only until verified):**

- `opponent-legislative-seed.json` — entity stub + official **portal** `sources[]` only (**INTEL-4B-2**); `billRecords[]` empty until operator adds verified rows per [`intelligence-source-collection-checklist.md`](../docs/intelligence-source-collection-checklist.md).
- `opponent-video-seed.json` — entity stub + optional **DRAFT** `videoRecords` scaffold (`transcriptStatus: NOT_STARTED`).

Remove `--dry-run` only on the **intended** database after review and when at least one record has real provenance (see CLI provenance warnings for non-**DRAFT** rows).

**Automated arkleg ingest (operator-governed):** `npm run ingest:arkleg-opposition -- [--dry-run] [--replace] [--deep-bills primary|all|none]` — HTML via system `curl` (arkleg is picky about `member=K.+Hammer` encoding). Pulls Senate biography + all bill rows from the official session dropdown (2019+ for Hammer; includes House-era **Primary Sponsor for House** rows). Tags **heuristic** “controversial” topics from bill titles only (not conclusions). With `--deep-bills primary` (default), resolves first committee-style **Sliq** video link per primary bill. Requires `curl` on `PATH`. Re-run with `--replace` to drop prior rows tagged `ingestPipeline=arkleg-legislator-v1`.

**INTEL-4B-3 (discovery bridge):** Dry-run with **`--write-shortlist`** or **`--write-summary`** emits **`generated/arkleg-review-shortlist.json`** (≤25 prioritized candidates) and refreshes **`opponent-legislative-candidates.json`** — both are **unverified** until human review ([`docs/arkleg-intelligence-verification-worksheet.md`](../docs/arkleg-intelligence-verification-worksheet.md)). Optional **`--shortlist-probe-videos`** fetches bill-detail pages for official video URLs (rate-limited). **Live** opposition JSON import for reviewed bundles: add **`--require-approved`** so only **`APPROVED`** rows are written.

**Full grid export (brief / RAG):** **`--write-summary`** also writes **`generated/arkleg-hammer-all-bills.dryrun.json`** (every unique bill-grid row). **`npm run ingest`** indexes those rows into **`SearchChunk`** (plus shortlist candidate overlays on the same path keys).

**SOS candidate brief (INTEL-BRIEF-2):** After the full-grid JSON exists, run **`npm run brief:kim-hammer`** to regenerate **`generated/kim-hammer-sos-brief-source-report.json`**, **`docs/kim-hammer-sos-brief-source-report.md`**, and **`docs/briefs/kim-hammer-*.md`** — internal use only until verified.

## Rules

- **Public / source-backed only** — Use lawful public records, published URLs, and documents the campaign may lawfully cite. No private surveillance data or unverified bulk dumps.
- **No unsupported claims** — Rows store **cited** facts and metadata; the importer does **not** generate narrative conclusions or “intel summaries.”
- **Provenance** — Every **non-DRAFT** record row should have **`sourceUrl`** and/or **`sourcePath`** either on a linked row in **`sources[]`** or inline on the record (the importer copies inline URLs into `metadataJson` as `recordSourceUrl` / `recordSourcePath`). The CLI **warns loudly** when `reviewStatus` is not **DRAFT** and provenance is missing. Set `reviewStatus: "DRAFT"` only for scratch rows. Entity `reviewStatus` is stored in `metadataJson.entityReviewStatus` (there is no separate entity review column).
- **Defaults** — If `confidence` or `reviewStatus` is omitted, the importer and DB default to **`UNVERIFIED`** and **`NEEDS_REVIEW`**. Nothing is auto-approved; there are no `APPROVED` shortcuts in the importer.
- **No scraping** — This path is for **curated, operator-authored** files. Automated web scraping and bulk unvetted external ingest belong to future **gated** work (**INTEL-4B+**), not this CLI.

## Shape

Top-level keys match `manual-opposition-intel-template.json`:

- `entities` — each row needs **`localKey`** (string, unique in file) and **`name`**, **`type`** (`CANDIDATE`, `OFFICEHOLDER`, `PAC`, …).
- `sources` — each row needs **`localKey`**, **`title`**, **`sourceType`**.
- All record arrays use **`entityLocalKey`** (references an entity in this file) **or** **`entityId`** (existing DB id). Use **`sourceLocalKey`** and/or **`sourceId`** the same way for sources.

ISO-8601 strings are accepted for date fields. See `scripts/import-opposition-intelligence-json.ts` (Zod schema) for the full field list per record type.

## Related

- `docs/COMPETITOR_INTELLIGENCE_MANIFEST.md` — source manifest
- `docs/opposition-intelligence-engine.md` — engine guardrails
- `src/lib/campaign-engine/opposition-intelligence.ts` — create helpers
