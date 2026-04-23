# Targeting integration foundation (DATA-3) (RedDirt)

**Packet DATA-3 (Part D).** How **election results** (once stored) **connect** to existing campaign rails—**conceptually** and **for future read models**. **No** automatic merging of incompatible metrics.

**Cross-ref:** [`election-results-foundation.md`](./election-results-foundation.md) · [`data-targeting-foundation.md`](./data-targeting-foundation.md) · [`goals-system-status.md`](./goals-system-status.md) · [`field-structure-foundation.md`](./field-structure-foundation.md) · [`relational-kpi-foundation.md`](./relational-kpi-foundation.md)

---

## 1. `CountyCampaignStats.registrationGoal`

| Topic | Rule |
|-------|------|
| **Semantic** | **Registration organizing** target — **not** vote share. |
| **With election data** | Show **side-by-side**: “registration goal progress” vs “last SOS / Gov **D vote %**” — **never** imply one equals the other without explicit methodology doc. |
| **Future** | Optional **`CountyTargetingBrief`** view (DATA-5+) that **joins** stats + latest results — **read-only**. |

---

## 2. `CountyVoterMetrics`

| Topic | Rule |
|-------|------|
| **Semantic** | **Voter file snapshot** rollups: registrations, churn, **`progressPercent`** vs **`countyGoal`** (registration mirror). |
| **With election data** | **Turnout** from results may use **different denominator** than `totalRegisteredCount` — label **“election turnout (source X)”** vs **“active registrants on file date Y.”** |
| **Join key** | **`countyId`** + **time** (contest date vs snapshot `asOfDate`) — comparisons are **analyst** decisions. |

---

## 3. FIELD system (`FieldUnit`, `FieldAssignment`)

| Topic | Rule |
|-------|------|
| **Today** | **No FK** from `FieldUnit` to `County`. |
| **With results** | County-level results **attach** to **`County`**; field leaders **view** results for counties they cover once **mapping** from `FieldUnit` → `County` is **documented** (FIELD-GEO-2 / VOL-CORE). |
| **Precinct** | Only after precinct ingest + normalization — then **turf** discussions can reference **precinct keys**, not just `FieldUnit` names. |

---

## 4. REL-1 and volunteer targeting (later)

| Topic | Rule |
|-------|------|
| **REL-2 `RelationalContact`** | **Person-level** program — **not** derived from election totals. |
| **Use of results** | **County** or **precinct** **context** for coaches (“our historical share here is X”) — **narrative** and **prioritization**, not **auto** contact lists from results. |
| **GAME-1** | **No** XP for “winning a county” from results ingest — unless **explicitly** scoped as **staff** milestone (out of scope DATA-3). |

---

## 5. Comms and segments

- **`AudienceSegment.definitionJson`** **could** reference **county** or **precinct lists** generated **from** approved results analysis — **contract** must be **documented** (COMMS-UNIFY / DATA-4).
- **Do not** auto-build **Tier-2** sends from raw ingest without human review.

---

## 6. AI / analytics

- **AnalyticsRecommendationOutcome** remains **social** workflow — **not** election results storage.
- Future **AI** may **summarize** county result tables **with provenance** — **ALIGN-1** applies.

---

*Last updated: Packet DATA-3 (Part D).*
