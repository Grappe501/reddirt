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

### 0. Forensic launch review — DONE (audit) + Critical CTA restore

Pass: `KELLY-PUBLIC-FORENSIC-LAUNCH-REVIEW-1.0`  
→ [`CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_LAUNCH_1.0.md`](./CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_LAUNCH_1.0.md)  
→ [`PUBLIC_SITE_MASTER_MAP.md`](./PUBLIC_SITE_MASTER_MAP.md)  
→ [`COUNTY_MEDIA_COVERAGE_LEDGER.md`](./COUNTY_MEDIA_COVERAGE_LEDGER.md)

**Critical fix shipped:** removed soft redirects that sent `/get-involved`, `/host-a-gathering`, and `/start-a-local-team` to `/about`.

### 1. Production confidence — DONE (local binary) / Netlify still open

Pass completed: `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0` → see [`PRODUCTION_CONFIDENCE_REPORT.md`](./PRODUCTION_CONFIDENCE_REPORT.md).

| Question | Result |
| --- | --- |
| Is the production build clean? | **Yes** (quiet `next build`) |
| Does every public route render correctly? | **Yes** on local `next start` |
| Are all forms functional? | Routes 200; dedicated POST smoke optional |
| Are all media assets loading properly? | **Yes** (FEATURE set) |
| Any hydration, console, or runtime errors? | County 500 fixed; primary surfaces clean |
| Does Netlify behave differently than local? | **Yes — documented** (live URL still old) |

**Recommendation:** `READY AFTER MINOR REMEDIATION` = successful Netlify (or alternate) publish of this binary, then live URL re-smoke.

### Parallel track (not ahead of publish without authorization)

**Campaign Operating Calendar** — promote calendar into RedDirt OS (one event, many outputs; Public / Internal / Kelly-only). Doctrine: [`../calendar/CAMPAIGN_OPERATING_CALENDAR_ARCHITECTURE.md`](../calendar/CAMPAIGN_OPERATING_CALENDAR_ARCHITECTURE.md). Do **not** embed Kelly-calendar as a separate app in the marketing site.

### 2. High craftsmanship from forensic register (remaining ~1.5 days)

Prefer: nav cleanup (`/updates`), footer `/contact`, one Regnat lockup, restrained gold accents, campaign geography confirms — see forensic CER register H1–H8.

### 3. Media audit (ongoing with county ledger)

Keep-or-remove force for every homepage / feature image and video. Ledger: [`COUNTY_MEDIA_COVERAGE_LEDGER.md`](./COUNTY_MEDIA_COVERAGE_LEDGER.md).

### 4. Reporter pass

Identify questions that still require email/phone (dates, press contact, media kit). Prefer transparency over promotional volume.

### 5. Final hesitation hunt (ongoing in every CER)

Every remaining pass lists:

- Top three hesitations **removed**
- Top three hesitations **remaining**

---

## Current hesitation snapshot

### Removed (forensic)

1. Get Involved / host / team CTAs soft-redirected to About.  
2. Confusion that archive size equals on-site county representation.  
3. Assumption forensic work must enlarge the homepage.

### Remaining

1. Production deployment proof on live URL (Netlify).  
2. Endorsement announcement dates / public source URLs.  
3. Confirmed geography still thin (5 photo counties + Garland video).

---

## Do not

- Add major sections or features  
- Invent dates, quotes, endorsements, or geography  
- Enlarge copy to fill empty feelings  
- Redesign the site around gold  
- Treat Netlify platform failure as a homepage code bug without evidence  
- Claim “50+ counties” on-site without confirmed metadata

---

## Related

- [`PUBLIC_SITE_LAUNCH_STATUS.md`](./PUBLIC_SITE_LAUNCH_STATUS.md) — Netlify operator status  
- [`CAMPAIGN_EXPERIENCE_REVIEW_ENDORSEMENT_FRAMING.md`](./CAMPAIGN_EXPERIENCE_REVIEW_ENDORSEMENT_FRAMING.md)  
- [`PRODUCTION_CONFIDENCE_REPORT.md`](./PRODUCTION_CONFIDENCE_REPORT.md)
