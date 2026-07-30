# KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0 — Implementation map

**Status:** AUTHORIZED · in progress  
**Starting branch:** `feature/kelly-schedule-settlement-dashboard`  
**Starting commit:** `976b3a41`  
**Local review:** http://127.0.0.1:3456/  
**Production:** BLOCKED (Netlify Lambda) — do not stop local completion.

**Launch bar:** A voter arrives knowing little about Kelly, understands who she is and why she is running, sees credible evidence she is active across Arkansas, hears her speak directly, trusts the presentation, and knows exactly what to do next.

---

## Sprint override (locked)

Prior `HOMEPAGE_FORWARD_PLAN` Slice 5 / Track C stills-only lock is **overridden for two approved homepage videos only**:

| YouTube ID | Title | Homepage slot |
|------------|-------|---------------|
| `eKVz5pFJxtk` | This Office Belongs to the People! | Primary message (after Government That Works) |
| `aO712RsR0pQ` | Creating the Ripples in Hot Springs Village | Kelly Across Arkansas |

Still blocked: Shorts carousel, autoplay, unrelated personality embeds, inventing geography/endorsements.

---

## Hours 0–6 forensic — as-built inventory (pre-rebuild)

### Section order (before)

1. Hero — H1 “Government That Works…” · 6 CTAs · optional autoplay env video  
2. Four Pillars  
3. Office Serves strip (8 cards)  
4. Proven Executive Leadership  
5. Direct Democracy  
6. Meet Kelly  
7. Latest Campaign Photos (eyebrow “Kelly Across Arkansas”)  
8. Invite Kelly  
9. Get Involved roles  
10. Listening  
11. Trust band  
12. On the Road / Upcoming Events  
13. Final CTA  

### Desired narrative order (target)

1. Opening impression (Hero)  
2. Government That Works  
3. Primary message video  
4. Meet Kelly  
5. Kelly Across Arkansas (momentum video + selected stills)  
6. Latest Campaign Photos  
7. Endorsements (structure; confirmed only)  
8. Campaign news / updates (no fabricated activity)  
9. Final action band  

### CTA problems (before)

- Hero crowded with 6 secondary CTAs  
- Volunteer destinations already aligned (Slice 1)  
- Floating donate gate already delayed  
- Mid-page Invite / Listening / Roles duplicate the final ask  

### Disclosure audit (`/` live tree)

| Page | Section | Current label | Hidden length | Decision | New destination or content | Reason |
|------|---------|---------------|---------------|----------|----------------------------|--------|
| `/` | Trust-funnel mounted sections | — | 0 (no disclosures) | — | Keep INLINE | Live home has no Read More accordion |
| `/` | Orphan `TrustFunnelOfficeExplainerSection` | “A bit more detail” | ~1 sentence | REMOVE from home path | Already unmounted; if revived → INLINE or LINK `/office/*` | One-sentence expand prohibited |
| `/` | `CampaignTranscriptDisclosure` (when video mounts) | “Read the transcript” | Full transcript when PUBLISHED | EXPAND | Keep `<details>` only when transcript public | Legitimate depth |
| `/` | On the Road hint | “Swipe sideways…” | N/A | INLINE | UX hint only | Not a content disclosure |

*(Full public-site disclosure audit continues in connected-page pass.)*

---

## Build decisions

| Beat | Decision |
|------|----------|
| Hero photo | Keep existing `media.heroHome` still; **no** autoplay hero video; **no** forced weak trail still |
| Hero CTAs | Meet Kelly (`/about`) + Join the Campaign (volunteer signup href) |
| Government That Works | Upgrade pillars with concrete substance; drop redundant Office Serves strip |
| Videos | `CampaignVideoFeature` + registry selectors; nocookie; click-to-play |
| Across Arkansas stills | Curated geo-confirmed subset beside Ripples video |
| Photos band | Keep 8 FEATURE curation; remove Across Arkansas eyebrow (own section) |
| Endorsements | Shell + empty confirmed list (no AFL-CIO until record confirmed) |
| News | Restrained band driven by real On the Road / events data only |
| Mid-page action clutter | Remove Invite / Listening / Roles / Executive / Direct Democracy from `/` spine; recover via final CTA + destinations |

---

## Parallel Netlify note

Continue Support escalation for `kgrappe` Lambda 400. Local sprint does not wait on production.
