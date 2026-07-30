# Media verification ledger

**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`  
**Authority:** Campaign Experience Review + prove-more principle  
**Method:** Filesystem existence → production HTTP HEAD on `next start` → registry caption/alt review  
**Base:** `http://127.0.0.1:3457` (production build)

## Homepage campaign photos (FEATURE set)

| Asset | File | HTTP | Bytes | Alt present in registry | Caption discipline | Crop intent |
| --- | --- | --- | ---: | --- | --- | --- |
| afl-cio-pre-event-networking-20260629 | ✅ | 200 | 182541 | ✅ | Pre-address networking — **does not claim endorsement** | Portrait → upper third |
| mena-polk-meet-greet-20260411 | ✅ | 200 | 312822 | ✅ | Mena / Polk confirmed | Portrait → upper third |
| war-memorial-stadium-concourse-20260320 | ✅ | 200 | 181197 | ✅ | War Memorial / Pulaski | Stadium → 35% vertical |
| toad-suck-daze-toad-race-20260501 | ✅ | 200 | 172389 | ✅ | Toad Suck / Faulkner | Center |
| johnson-county-peach-festival-parade-20260718 | ✅ | 200 | 300800 | ✅ | Johnson County parade | Center |
| watermelon-festival-booth-service-20260725 | ✅ | 200 | 176437 | ✅ | Watermelon Festival / Sharp | Center |
| stone-porch-door-conversation-20260301 | ✅ | 200 | 237248 | ✅ | Door conversation; Unknown geo stays Unknown | Portrait → upper third |
| elks-lodge-breakfast-table-20260228 | ✅ | 200 | 198308 | ✅ | Elks breakfast table | Portrait → upper third |

**Files present:** 8/8  
**HTTP load on production server:** 8/8

## Videos

| Surface | YouTube ID | Role | Embed approach | Mobile | Transcript status |
| --- | --- | --- | --- | --- | --- |
| Homepage primary message | `eKVz5pFJxtk` | Voice / accountability | Frame + YouTube destination (homepage HTML references ID) | Responsive frame pattern | **Not campaign-published on-site** — YouTube closed captions only until campaign supplies transcript |
| Homepage Across Arkansas | `aO712RsR0pQ` | Listening / Hot Springs Village trail | Same | Same | Same |
| `/kelly-speaks` library | curated slugs | Purpose-organized clips | Page lists / deep links; iframe may load on play routes | Mobile-friendly layout | Same transcript policy |

## Caption / alt discipline (verified)

- AFL-CIO homepage caption must **not** claim endorsement (endorsement lives on `/endorsements` with distinguishing photo note). ✅
- Unknown geography stays Unknown — no invented counties on stills. ✅
- Related AFL-CIO photo on `/endorsements` notes meeting attendance ≠ endorsement moment. ✅

## Gallery breadth note

`public/media/campaign-photos/` holds a larger archive (~70 PNGs). Launch confidence for this pass is scoped to **homepage FEATURE set + endorsement-related still**. Broader gallery remains file-backed for `/campaign-photos` curation — not every archive file was HTTP-probed.

## Keep / remove

No removals this pass (architecture + editorial frozen). Every FEATURE still earns its place as trail evidence.
