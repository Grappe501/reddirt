# Public Statistics Cross-Validation Standard

## Purpose

Cross-checking is a defining RCIP capability. A difference does not automatically mean one source is wrong.

## Compatibility statuses

- `directly_comparable`
- `conceptually_related`
- `not_comparable`
- `period_mismatch`
- `geography_mismatch`
- `definition_mismatch`
- `requires_review`

## Cross-check outcomes

- `confirmed`
- `within_expected_variance`
- `material_difference`
- `conflict`
- `insufficient_data`
- `not_applicable`

## When cross-checking is valid

Only when geography, period, and definition compatibility are assessed and recorded.

ACS employment estimates vs BLS labor-force series are typically `conceptually_related`, not `directly_comparable`, due to survey design, universe, period, and methodology differences.

## Tolerance

Tolerance is metric-specific and must be documented in the indicator manifest. Default Phase 1 behavior: surface variance honestly; do not auto-resolve conflicts.

## Confidence effects

- Confirmed / within variance → may raise to `verified_with_corroboration` when definitions allow
- Material difference / conflict → `conflicting_sources` or `verified_with_limitations`
- Insufficient data → leave primary confidence unchanged; mark cross-check `insufficient_data`

## Public language

Use restrained phrasing:

- "The source directly establishes…"
- "This may suggest…"
- "Constitutional Capitalism concludes…" (consumer layer only)
