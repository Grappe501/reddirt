# RCIP Data Boundary and Security Model

## Principle

RedDirt is the shared engine, not one unrestricted database.

## Isolated schemas (target)

```text
public_statistics   — civic public data warehouse (RCIP)
campaign_private    — campaign ops (existing public/campaign models; do not export)
people_private      — contacts / PII (never export)
research_evidence   — optional research-only projections
education_public    — ACU instructional projections (later)
county_profiles     — county workbench projections (later)
auth                — existing Supabase/auth (untouchable by RCIP exports)
```

Phase 1 implements `public_statistics` and keeps all campaign/people/auth data out of exports.

## Prohibited from crossing into Constitutional Capitalism

- campaign contacts; voter files; petition records
- donors; volunteers; relationship records
- email / Gmail metadata; calendar data
- internal strategy; administrative users; authentication tables
- private notes; AI campaign intelligence
- personal addresses; phone numbers
- API keys; database credentials; connection strings

## Credential rules

- `CENSUS_API_KEY` / `BLS_API_KEY` remain server-side in RedDirt only
- Never copy into CC, GitHub public files, Astro clients, or browser calls
- Source-query records store secret-free canonical query representations only

## Phase 1 access pattern

Constitutional Capitalism consumes **validated snapshot exports** only.

Future role design: `cc_public_statistics_reader` on approved views — not Version 1.0.

## Threat notes

| Threat | Control |
|---|---|
| Arbitrary table dump | Explicit projection allowlist + privacy scanner |
| Key leakage in logs | Safe logging; never log Authorization headers or key values |
| Demo data as proof | Reject seed/demo demographics in export validation |
| Broad CC DB access | Forbidden in Phase 1 |
