# Final pre-launch checklist

**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`  
**Date:** 2026-07-28 / 2026-07-29 (local)  
**Branch:** `feature/kelly-schedule-settlement-dashboard`

Use this as the operator gate before telling Kelly the site is live.

## Engineering gates

| # | Check | Status |
| --- | --- | --- |
| 1 | Quiet `next build` exit 0 (no concurrent `dev`/`start`) | ✅ Proven this pass |
| 2 | `tsc --noEmit` exit 0 | ✅ |
| 3 | Primary public routes HTTP 200 on `next start` | ✅ 17/17 (+ launch crawl 16/16) |
| 4 | Homepage outbound sample — zero broken links | ✅ |
| 5 | Homepage FEATURE photos load (HTTP 200) | ✅ 8/8 |
| 6 | YouTube IDs present on homepage | ✅ |
| 7 | County CTAs resolve (`*-county` slugs + short-slug alias + schema degrade) | ✅ Stabilized this pass |
| 8 | `/voter-registration` degrades on schema lag (prior) | ✅ |
| 9 | Zero fatal hydration evidence in SSR route crawl | ✅ (no SSR crash); full browser hydration not automated |
| 10 | Netlify publishes **this** binary | ❌ Platform gap — see environment differences |

## Editorial / campaign gates

| # | Check | Status |
| --- | --- | --- |
| 11 | Architecture / messaging / features frozen (no new sections) | ✅ |
| 12 | Confirmed endorsements match campaign records | ✅ 4/4 |
| 13 | No inferred endorsement dates / quotes | ✅ |
| 14 | AFL-CIO photo ≠ endorsement claim | ✅ |
| 15 | Announcement dates / source URLs supplied when available | ⏳ Campaign |
| 16 | Spell transcripts for primary videos | ⏳ Campaign / ops |

## Launch communication gates

| # | Check | Status |
| --- | --- | --- |
| 17 | Live URL content smoke matches local (“Government That Works”, photos, endorsements) | ❌ Until Netlify publish |
| 18 | Kelly briefed: local polish ≠ live URL until publish | Required |
| 19 | Freeze public site except factual / approved endorsements / events / critical bugs | After READY |

## Sign-off

| Role | Question | Answer for this pass |
| --- | --- | --- |
| Engineering | Can we deploy this binary? | **Yes** (local proof) |
| Platform | Is the public URL updated? | **No** — Netlify blocked |
| Campaign | Are public claims defendable? | **Yes** within blank-date honesty |
| Burt | Recommendation | See `PRODUCTION_CONFIDENCE_REPORT.md` |
