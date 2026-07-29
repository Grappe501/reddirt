# Remaining launch craftsmanship board

**Status:** LOCKED priority order — 2026-07-28  
**Phase:** Campaign craftsmanship (not feature completion)  
**Authority:** [`CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md`](./CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md) · [`PUBLIC_SITE_EDITORIAL_DOCTRINE.md`](./PUBLIC_SITE_EDITORIAL_DOCTRINE.md)

## Launch Principle

> When faced with a choice between saying more and proving more, prove more.

## Filter

> Easier to trust, easier to understand, easier to use — without making it bigger.

---

## Priority order (next passes)

### 1. Production confidence — HIGHEST

Goal: deployed experience matches polished local experience.

Final launch report must answer:

| Question | Target |
| --- | --- |
| Is the production build clean? | Yes |
| Does every public route render correctly? | Yes |
| Are all forms functional? | Yes |
| Are all media assets loading properly? | Yes |
| Any hydration, console, or runtime errors? | No |
| Does Netlify behave differently than local? | Documented; no silent mismatch |

Until all are “yes” (or Netlify platform gap is explicitly separated), launch confidence stays **below 100%**.

Suggested pass name when authorized: `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`

### 2. Media audit

Keep-or-remove force for every homepage / feature image and video. Produce a media ledger. Nothing stays only because it exists.

### 3. Reporter pass

Identify questions that still require email/phone (dates, press contact, media kit, downloadable photos if appropriate). Prefer transparency over promotional volume.

### 4. Consistency audit

Buttons, intro tone, card chrome, video framing, caption voice — subconscious professionalism.

### 5. Final hesitation hunt (ongoing in every CER)

Every remaining pass lists:

- Top three hesitations **removed**
- Top three hesitations **remaining**

---

## Current hesitation snapshot (baseline for next pass)

### Removed (recent)

1. Endorsements no longer feel unfinished — confirmed coalition published.  
2. Meet Kelly reads more conversationally (rhythm, not more biography).  
3. CTA / chrome language more consistent across the homepage spine.

### Remaining

1. Production deployment proof pending (quiet `next build` + HTTP + Netlify separation).  
2. Endorsement announcement dates / public source URLs pending when available.  
3. Equal-card endorsement layout may evolve only if additional confirmations arrive — not for decoration.

---

## Do not

- Add major sections or features  
- Invent dates, quotes, endorsements, or geography  
- Enlarge copy to fill empty feelings  
- Treat Netlify platform failure as a homepage code bug without evidence  

---

## Related

- [`PUBLIC_SITE_LAUNCH_STATUS.md`](./PUBLIC_SITE_LAUNCH_STATUS.md) — Netlify operator status  
- [`CAMPAIGN_EXPERIENCE_REVIEW_ENDORSEMENT_FRAMING.md`](./CAMPAIGN_EXPERIENCE_REVIEW_ENDORSEMENT_FRAMING.md)  
