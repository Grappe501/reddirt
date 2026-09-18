# V2-11 — Market Brain + Opportunity Engine

Status: IMPLEMENTED v1 foundation
Date: 2026-09-18

Market Brain turns market-wide evidence into regime context and investigation priorities.

The first regime contract accepts normalized breadth, trend, volatility, dispersion, liquidity and correlation evidence. It returns SUPPORTIVE, MIXED, DEFENSIVE, LOW_CONFIDENCE, STALE or UNKNOWN with explicit coverage.

The Opportunity Engine evaluates each candidate using Premium acceleration, relative strength, volume expansion, trend alignment, regime fit and historical support. Missing evidence reduces coverage. Stale market state or unavailable Premium gates the candidate.

The resulting ranking is an INVESTIGATION PRIORITY, not a trade recommendation. A high-ranked symbol means multiple configured conditions deserve attention and research.

Each surfaced opportunity carries whySurfaced and full evidence reasons so the interface can answer “Why did this appear?”

This engine is intentionally data-provider agnostic. Existing V1 market breadth, Market Memory, strategy evidence and Premium outputs can feed it without being rewritten.

Later phases can add sector rotation, catalyst/event evidence, opening-range conditions, VWAP reclaim, unusual activity and asset-specific scanners as explicit signal modules rather than opaque ranking magic.
