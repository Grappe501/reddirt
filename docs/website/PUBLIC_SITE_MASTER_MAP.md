# Public site master map

**Pass:** `KELLY-PUBLIC-FORENSIC-LAUNCH-REVIEW-1.0`  
**Lane:** RedDirt public experience only  
**Source of truth:** `src/app/(site)/**/page.tsx` + `src/config/navigation.ts` + `next.config.ts` redirects  
**Date:** 2026-07-29

---

## How to read this map

| Symbol | Meaning |
| --- | --- |
| ★ | Primary or footer nav entry |
| ○ | Reachable from homepage / in-page CTA |
| ◌ | Exists on disk; weak or no nav |
| → | Redirect / alias |
| ⚠ | Nav or CTA currently misleading (see Trust / Recommendations) |

---

## Canonical mental model (launch)

| Intent | Canonical path |
| --- | --- |
| Trust + interest | `/` |
| Who / qualifications | `/about` |
| Why running | `/about/why-im-running` |
| Listening proof | `/about/journey` |
| Governing approach | `/priorities` |
| Hear Kelly | `/kelly-speaks` |
| Trail photos | `/campaign-photos` |
| Third-party support | `/endorsements` |
| Participate | `/get-involved` (forms) · `/volunteer` (onboarding) |
| Office explainer | `/understand` → `/office/[slug]` |
| Direct democracy | `/direct-democracy` |
| News / trail notes | `/from-the-road` (not `/updates`) |
| Events calendar | `/events` (not `/campaign-calendar`) |
| Invite Kelly | `/events/request` |
| Vote | `/voter-registration` |
| Donate | external GoodChange (page `/donate` explains) |
| Contact | `/contact` |

---

## Hierarchy (public marketing)

```
/
├── Meet Kelly
│   ├── /about
│   ├── /about/journey · /about/community · /about/why-im-running
│   ├── /about/[slug] chapters
│   ├── /about/why-kelly → /about/why-im-running
│   ├── /about/deep-dive/* → /about (depth gate)
│   ├── /biography → /about
│   ├── /endorsements ★
│   ├── /priorities ★
│   ├── /campaign-photos ★
│   └── /kelly-speaks ★ (+ /search, /[slug])
│
├── The Office
│   ├── /understand ★
│   ├── /office/why-this-race-matters ★
│   └── /office/[slug] → why-it-matters · full-picture→why-it-matters
│
├── Direct Democracy
│   ├── /direct-democracy ★
│   └── /direct-democracy/ballot-initiative-process ★
│
├── News & media
│   ├── /from-the-road ★  (/updates → from-the-road)
│   ├── /press-coverage ★ · /editorial · /explainers · /stories
│   └── /blog ◌ · /messages ◌
│
├── Events & calendar
│   ├── /events ★ (+ [slug], request, tours, fairs, party meetings)
│   ├── /schedule ★ · /listening-sessions ★
│   ├── /arkansas ★ (+ /arkansas/counties)
│   └── /campaign-calendar ◌ (parallel tree — not nav-canonical)
│
├── Get involved
│   ├── /get-involved ★ (Join + Volunteer forms) — Critical: redirects removed this pass
│   ├── /volunteer ○ (onboarding)
│   ├── /host-a-gathering · /start-a-local-team (restored from redirect)
│   ├── /donate ★ · /voter-registration ○ · /contact ◌
│   └── /local-organizing → /about (still redirected — unfinished OS surface)
│
├── Counties
│   ├── /counties ◌ (+ [slug], media, intelligence, tools)
│   └── Photo geography links → /counties/{slug}-county
│
└── Legal
    └── /privacy ★ · /accessibility ★ · /terms ★ · /disclaimer ★
        /privacy-and-trust ◌ (near-duplicate)
```

---

## Navigation entry points

| Destination | Primary nav | Footer | Homepage trust-funnel |
| --- | --- | --- | --- |
| `/about` (+ children) | ★ Meet Kelly | ★ | Hero / Meet Kelly |
| `/kelly-speaks` | ★ Meet Kelly + News | ★ | — |
| `/campaign-photos` | ★ | ★ | Latest photos CTA |
| `/endorsements` | ★ | ★ | Endorsements band |
| `/priorities` | ★ | ★ | Final Action |
| `/understand` + office areas | ★ The Office | ★ | Pillars |
| `/direct-democracy` | ★ | ★ | — |
| `/from-the-road` | ★ News | ★ | News band |
| `/updates` | ★ listed | ★ | → redirects to From the Road |
| `/events` | ★ Events | ★ | News / calendar CTA |
| `/get-involved` | ★ Get Involved | ★ | Final Action volunteer |
| `/volunteer` | — (header utility often) | Volunteer CTA | Join CTA when native form on |
| `/contact` | — | — | — |
| `/counties` | — | — | County chips from photos |
| `/campaign-calendar` | — | — | — |

---

## Orphans / hidden / duplicates

### Orphans (high signal)

`/contact`, `/campaign-calendar`, `/counties` (+ tools), `/what-we-believe`, `/privacy-and-trust`, `/blog`, `/messages`, `/civic-depth`, `/field-playbook/**`, most `/volunteer/resources/*`, `/resources` toolkit tree.

### Hidden / always redirect

| Path | Behavior |
| --- | --- |
| `/biography`, `/about/deep-dive/*` | → `/about` |
| `/about/why-kelly` | → `/about/why-im-running` |
| `/updates` | → `/from-the-road` |
| `/labor-and-work` | → `/priorities` |
| `/office/*/full-picture` | → layer-2 |
| `/local-organizing/*` | → `/about` (kept) |
| `/organizing-intelligence/*` | → `/priorities` (kept) |
| `/dashboard` | → `/about` (exact) |

### Duplicate trees

| Pair | Recommendation |
| --- | --- |
| `/events` vs `/campaign-calendar` | Keep `/events` canonical; retire or merge calendar UI post-launch |
| `/volunteer` vs `/get-involved` | Both earn a place: onboarding vs participation hub — clarify in nav copy |
| `/from-the-road` vs `/updates` | Drop `/updates` from nav (already redirects) |
| `/privacy` vs `/privacy-and-trust` | Prefer `/privacy`; fold or redirect duplicate |
| `/arkansas` vs `/counties` | Presence marketing vs command pages — do not merge before calendar OS |

### Dead ends (pre-fix)

Homepage Final Action and nav “Get Involved” previously hit `next.config` redirects to `/about`. **Removed this pass** for `/get-involved`, `/host-a-gathering`, `/start-a-local-team`.

---

## Dashboard under `(site)`

~50 `/dashboard/**` routes share public chrome but are not marketing. Exact `/dashboard` redirects to `/about`; nested paths may still resolve. **Recommendation:** keep out of public nav; treat as Future hardening (middleware / layout split).

---

## Related

- Forensic CER: [`CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_LAUNCH_1.0.md`](./CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_LAUNCH_1.0.md)
- County media: [`COUNTY_MEDIA_COVERAGE_LEDGER.md`](./COUNTY_MEDIA_COVERAGE_LEDGER.md)
