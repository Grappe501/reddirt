# Event Verification Index

> Calendar intelligence — 471 events classified

**Effective rank:** `Campaign Impact Score × Verification Confidence`

A score-98 event with no confirmed date (×0.35 = **34**) should not outrank a verified score-92 event (×1.0 = **92**).

---

## Status summary

| Status | Count | Confidence | Meaning |
| ------ | ----: | ---------: | ------- |
| Verified | 122 | 1.00 | Date confirmed |
| Tentative | 250 | 0.75 | Expected but not confirmed |
| Historical | 0 | 0.55 | Last year's date only |
| Missing | 99 | 0.35 | No usable date |

---

## Verification sprint queue

Priority: upgrade **Missing** events in Tier A/B counties first.

- **Arkansas County Fair** (Arkansas) — county_fair
- **Baxter County Fair** (Baxter) — county_fair
- **Boone County Fair** (Boone) — county_fair
- **Bradley County Fair** (Bradley) — county_fair
- **Calhoun County Fair** (Calhoun) — county_fair
- **Carroll County Fair** (Carroll) — county_fair
- **Chicot County Fair** (Chicot) — county_fair
- **Clark County Fair** (Clark) — county_fair
- **Cleburne County Fair** (Cleburne) — county_fair
- **Cleveland County Fair** (Cleveland) — county_fair
- **Columbia County Fair** (Columbia) — county_fair
- **Conway County Fair** (Conway) — county_fair
- **Craighead County Fair** (Craighead) — county_fair
- **Crittenden County Fair** (Crittenden) — county_fair
- **Cross County Fair** (Cross) — county_fair

---

## Verified events (executable now)

- **2026-09-04** · Ashley County Fair (Ashley) — verified
- **2026-09-25** · Benton County Fair (Benton) — verified
- **2026-09-12** · Clay County Fair (Clay) — verified
- **2026-09-12** · Crawford County Fair (Crawford) — verified
- **2026-07-10** · Fulton County Fair (Fulton) — verified
- **2026-08-31** · Lafayette County Fair (Lafayette) — verified
- **2026-08-10** · Lawrence County Fair (Lawrence) — verified
- **2026-08-17** · Little River County Fair (Little River) — verified
- **2026-09-23** · Lonoke County Fair (Lonoke) — verified
- **2026-09-10** · Nevada County Fair (Nevada) — verified
- **2026-08-14** · Newton County Fair (Newton) — verified
- **2026-09-07** · Pike County Fair (Pike) — verified
- **2026-09-15** · Pope County Fair (Pope) — verified
- **2026-08-24** · Randolph County Fair (Randolph) — verified
- **2026-07-23** · Union County Fair (Union) — verified

---

## Field workflow

1. Confirm date in official schedule / county clerk / fair board
2. Update [`data/campaign-brain/event-verification-overrides.json`](../../data/campaign-brain/event-verification-overrides.json):

```json
{
  "overrides": {
    "fair-event-id": { "status": "verified", "date": "2026-08-15" }
  }
}
```

3. `npm run campaign-brain:build`

*Full data:* [`event-verification-index.json`](./event-verification-index.json)
