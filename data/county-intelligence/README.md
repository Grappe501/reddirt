# County intelligence (aggregate only)

**COUNTY-INTEL-2** — CSV template for public Census/ACS-style county metrics. No person-level or voter data.

- **Template:** `acs-bls-import-template.csv` — one row per county per source year; safe to dry-run in CI.
- **Import:** from `RedDirt/`, `npm run ingest:county-demographics -- --file data/county-intelligence/acs-bls-import-template.csv --dry-run`
- **Live import:** only after a human reviews the file and the county exists in `County` (FIPS must match `County.fips`).

Rows write to `CountyPublicDemographics` (upsert by `countyId`) with optional JSON columns for age bands, race/ethnicity, and BLS industry mix as encoded in the template.

**Do not** use this table for individual targeting or party inference. Aggregate reporting only.
