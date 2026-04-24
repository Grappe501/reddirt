# Manual opposition intelligence (INTEL-4A)

This folder holds **JSON bundles** for **source-backed** competitor intelligence, imported with:

```text
npm run ingest:opposition-intel -- --file data/intelligence/<file>.json --dry-run
```

Remove `--dry-run` only on the **intended** database after review.

## Rules

- **Public / source-backed only** — Use lawful public records, published URLs, and documents the campaign may lawfully cite. No private surveillance data or unverified bulk dumps.
- **No unsupported claims** — Rows store **cited** facts and metadata; the importer does **not** generate narrative conclusions or “intel summaries.”
- **Provenance** — Every **non-DRAFT** row in production use should be tied to an **`OppositionSource`** with **`sourceUrl`** and/or **`sourcePath`**. Set `reviewStatus: "DRAFT"` in JSON only for scratch rows that are explicitly not evidence yet; otherwise treat missing URLs/paths as a gap to fix before external use. (The CLI mirrors helpers: missing links log warnings, never auto-approval.)
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
