# County Wikipedia reference ingest (RedDirt)

**Purpose:** Pull **English Wikipedia** article text for each **Arkansas county** (75) via the **MediaWiki Action API** (not HTML scraping), store as markdown under `docs/ingested/county-wikipedia/`, and include it in **`npm run ingest`** → `SearchChunk` for **assistant / search** context (marketing + field copy **assist** — not a source of legal or official claims).

**Primary product use (visit prep):** These files supply the **unabridged** lane of the **candidate county brief** — dense **summary** comes from `CountyPublicDemographics`, metrics, and (later) ACS/ADE; Wikipedia fills narrative + communities. See [`candidate-county-brief-foundation.md`](./candidate-county-brief-foundation.md).

**License:** Wikipedia text is under **CC BY-SA 4.0** (or later as marked on article). Generated files include attribution. **Reuse** in public materials may require **share-alike** compliance — see [Wikimedia Reuse policy](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use). When in doubt, **link** to Wikipedia instead of copying long passages.

**Operational:** Run `npm run ingest:county-wikipedia` (optional flags below), then `npm run ingest` with `DATABASE_URL` + `OPENAI_API_KEY` to embed.

**Disclaimer:** Encyclopedia content can be **wrong or incomplete**. **Do not** treat as voter file, census, or SOS data. **Do not** use as sole evidence for targeting decisions.

**Script:** `scripts/ingest-county-wikipedia.ts`  
**County list:** `ARKANSAS_COUNTY_EVENT_DIRECTORY` in `src/lib/festivals/arkansas-county-event-directory.ts` (FIPS + county seats).

## Commands

```bash
# All 75 counties (~30–90s with polite delays)
npm run ingest:county-wikipedia

# Dry run (no writes)
npx tsx scripts/ingest-county-wikipedia.ts --dry-run

# First N counties (smoke test)
npx tsx scripts/ingest-county-wikipedia.ts --limit 3

# Only counties present in DB (matches FIPS)
npx tsx scripts/ingest-county-wikipedia.ts --from-db
```

## Cities / municipalities

**v1** ingests **county** articles only (they mention county seats and many communities). A **follow-up packet** can add curated **city** titles (e.g. `Fayetteville, Arkansas`) or Wikidata-driven lists — not auto-guessed from county seat strings (disambiguation risk).

---

*Last updated: county Wikipedia ingest v1.*
