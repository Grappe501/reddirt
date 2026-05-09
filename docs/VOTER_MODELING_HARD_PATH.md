# Voter modeling for AI — aggregate today, hard path tomorrow

**Lane:** `RedDirt` only. **No cross-lane imports.**

This doc matches what we ship today and the **harder route** if you intentionally move toward row-level or embedding-heavy voter modeling.

---

## What ships today (Tier 0 — safe default)

- **Endpoint:** `GET /api/admin/voter-modeling/chunks` (admin session cookie, same bar as other board APIs).
- **Payload:** **Aggregate only** — one chunk per county from `CountyVoterMetrics` for the latest **COMPLETE** `VoterFileSnapshot`, plus one **state rollup** chunk (unless `?state=0`).
- **No** `VoterRecord` rows, names, phones, or addresses in this response.
- **Query params:** `countySlug` (filter to one county), `state=0` (drop statewide summary).

Use this with strategy or field agents when you want **jurisdiction pace / registration totals** without touching microdata.

---

## Harder route — ordered steps (technical + governance)

Each step assumes the previous one’s access controls and retention policy are documented.

### Tier 1 — Enriched aggregates (medium engineering)

1. **Design slice:** Add precinct, media market, or turf IDs to **rollup tables** (new materialized metrics or scheduled jobs), still **no row export**.
2. **DB:** Migrations for rollup tables or JSON stats on existing county rows; index by `snapshotId` + geography key.
3. **API:** Extend or add `?grain=precinct` (example) returning only counts and denominators.
4. **Risk:** Low if every cell is still a count and small geos are suppressed when below k-anonymity thresholds.

### Tier 2 — Redacted / banded micro-samples (medium–high)

1. **Legal:** Written minimum-necessary review (vendor SOS terms, internal campaign policy, who may prompt).
2. **Engineering:** Offline job samples `VoterRecord` with **allowed columns only** (e.g. county + precinct + flags), **drop** name/phone, round or bucket dates, **suppress** rare precinct combinations.
3. **Storage:** Separate schema or encrypted bucket; **no** co-mingling with public site env vars.
4. **API:** Separate service account; audit log on every export; rate limits.

### Tier 3 — Full row warehouse + embeddings (highest)

1. **Governance:** Data retention schedule, DLP, prohibitions on exfiltration, training-data policy for third-party models.
2. **Engineering:** Dedicated warehouse; batch ETL from `VoterFileSnapshot` lineage; chunking strategy (by turf, hash bucket, or fixed size); vector index with **no public egress**.
3. **Operations:** Key rotation, break-glass access, monitoring for unusual query volume.
4. **Cost / time:** Often **weeks** of engineering plus **ongoing** compliance cost — not a single sprint.

---

## Practical recommendation

- **Modeling** that supports **strategy and finance** usually stalls in **Tier 0–1** (aggregates + richer rollups).
- **Tier 3** is rarely justified for a “strategy partner”; if you go there, treat it as a **program decision**, not a feature ticket.

---

## Related code

- Aggregate chunk builder: `src/lib/voter-modeling/aggregate-chunks.ts`
- API route: `src/app/api/admin/voter-modeling/chunks/route.ts`
- Strategy manual chunks (narrative, not voter): `/api/admin/campaign-strategy/chunks`
