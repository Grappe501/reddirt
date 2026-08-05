# Public Statistics Export Standard

## Phase 1 delivery

Versioned snapshot files under:

```text
H:\SOSWebsite\RedDirt\exports\constitutional-capitalism\
```

Required files:

- manifest.json
- national-baseline.json
- arkansas-baseline.json
- county-baselines.json
- series-metadata.json
- source-registry.json
- source-citations.json
- cross-check-results.json
- limitations.json
- validation-report.json

## Contract

`contract_version: "1.0"` — TypeScript contract in `src/lib/civic-intelligence/contracts/`.

## Rules

1. Explicit public-safe projections only (no arbitrary table dumps)
2. Privacy scanner must pass (schema allowlist + prohibited patterns)
3. `contains_private_data` must be false
4. Fail closed on demo/placeholder observations
5. Checksum in manifest covers the export payload set
