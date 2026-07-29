# Homepage rotation cadence

**Doctrine:** [`OPERATION_ARKANSAS.md`](./OPERATION_ARKANSAS.md)  
**Goal:** Returning visitors notice an active campaign — without homepage bloat.

---

## What rotates

| Surface | Source of truth | Cadence |
| --- | --- | --- |
| Latest Campaign Photos (FEATURE set) | `HOMEPAGE_CAMPAIGN_PHOTO_IDS` | When new Gold still is confirmed/approved |
| Across Arkansas stills | `HOMEPAGE_ACROSS_ARKANSAS_PHOTO_IDS` | Prefer confirmed-county stills; expand presence line naturally |
| Across Arkansas / primary videos | `homepage-campaign-videos.ts` | Campaign priority (message vs trail) |
| Endorsements | `confirmed-endorsements.ts` | Only when campaign confirms |
| Events band | published public events | As `/events` publishes |

---

## What does not rotate for decoration

- Hero architecture  
- Meet Kelly principle (substance can tighten; don’t swap for memoir)  
- Regnat Populus Final Action placement (sacred — do not move around for novelty)  
- Office pillars structure  

---

## Suggested weekly rhythm (post-launch)

| Day focus | Evidence type |
| --- | --- |
| Mon | County confirmation batch → matrix |
| Wed | Photo FEATURE rotation (1–2 stills max) |
| Fri | Event / video check |
| As ready | Endorsement addition |

One honest update beats five cosmetic ones.

---

## Engineering note

Rotation is **content list edits**, not a new CMS feature, until Campaign Operating Calendar / media vault warrants an approved packet.
