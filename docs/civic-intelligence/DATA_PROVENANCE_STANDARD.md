# Data Provenance Standard

## Chain of custody (required for publication-ready metrics)

```text
Consumer metric
→ canonical RedDirt series
→ observation
→ official release
→ source query
→ raw response checksum
→ ingestion run
→ RedDirt commit
→ export
→ consumer import
→ consumer commit
```

## Rules

1. No public metric is publication-ready without this chain.
2. Raw responses (or lawful reproducible equivalents) must be checksummed.
3. API keys must never appear in source-query records.
4. Revisions must retain prior observation IDs; never silent overwrite.
5. Exports must record generator commit and validation status.
6. Consumers must record import commit and export ID.

## Minimum export provenance fields

- source agency + dataset + series codes
- geography (FIPS/GEOID where applicable)
- reference period
- release / retrieval timestamps
- definition + limitations
- cross-check status
- confidence classification
- RedDirt export_id + generator_commit
