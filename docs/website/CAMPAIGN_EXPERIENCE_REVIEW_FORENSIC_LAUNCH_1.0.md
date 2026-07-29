# CAMPAIGN EXPERIENCE REVIEW

**Pass:** `KELLY-PUBLIC-FORENSIC-LAUNCH-REVIEW-1.0`  
**Mode:** Forensic audit + Critical dead-end repair (not a feature sprint)  
**Filter:** easier to trust / understand / use — without making it bigger  
**Launch Principle:** When faced with a choice between saying more and proving more, prove more.  
**Note on perfection:** Perfect does not mean finished. Capture non-essential wins in the register; do not delay launch for polish that does not undermine trust.

**Authority:** [`PUBLIC_SITE_EDITORIAL_DOCTRINE.md`](./PUBLIC_SITE_EDITORIAL_DOCTRINE.md) · [`CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md`](./CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md)

**Appendices**

1. [`PUBLIC_SITE_MASTER_MAP.md`](./PUBLIC_SITE_MASTER_MAP.md)  
2. [`COUNTY_MEDIA_COVERAGE_LEDGER.md`](./COUNTY_MEDIA_COVERAGE_LEDGER.md)  
3. Trust Ledger (this document)  
4. Recommendation Register (this document)  
5. Launch readiness summary (this document)

**Baseline:** `2e19f4f0` (production confidence)  
**Branch:** `feature/kelly-schedule-settlement-dashboard`

---

## Executive Summary

Treating the public site as an independent campaign review board would find a polished homepage spine and honest endorsements — and also a **participation dead end**: nav and Final Action pointed at `/get-involved`, while `next.config` redirected that hub (and host/team pages) to `/about`. That is the kind of hesitation that loses volunteers before launch copy ever gets blamed.

The forensic pass maps ~150 `(site)` routes, separates marketing from OS residue, inventories county media (5 confirmed photo counties of 75; 59 Unknown stills), evaluates Regnat Populus and gold accent posture, and produces a prioritized register. One Critical code change shipped: **restore public participation routes** by removing the soft redirects to `/about`.

Netlify publish of the polished binary remains the open platform remediation from the prior confidence pass.

---

## What I noticed

1. The site is **two products wearing one layout**: a calm trust-funnel public campaign, and a large residue of dashboard/organizing/calendar trees under the same `(site)` chrome.  
2. **Get Involved was architecturally present and operationally amputated** by temporary redirects labeled “discovery-only.”  
3. Statewide trail **feeling** outruns statewide trail **metadata** — archive depth is real; confirmed geography is thin (5 counties + Garland video).  
4. **Regnat Populus** lives in `siteConfig` and legacy merge CTAs more than in the live trust-funnel chrome — the motto is under-placed for a unifying principle.  
5. Gold already exists as `kelly-gold` (primary CTAs, focus rings, footer borders) — the risk is **overuse as fill**, not absence.

---

## Why it matters to a voter

A careful Arkansan who decides “I’ll help” and lands on About instead of a signup form concludes the campaign is confused. A reporter who cannot find press contact or announcement dates emails someone — or publishes without the campaign. A county chair who sees only five named counties wonders whether the trail is real. Honesty about Unknown geography is correct; silence about broken CTAs is not.

---

## What exactly changed (this pass)

| Change | Why |
| --- | --- |
| Removed `next.config` redirects: `/get-involved`, `/host-a-gathering`, `/start-a-local-team` | Restore intended participation destinations |
| Wrote master map, county media ledger, this CER + register | Forensic deliverable for launch decisions |
| Updated craftsmanship board | Reflect forensic pass + Critical fix |

No homepage redesign. No gold theme redesign. No invented counties.

---

## What still doesn’t feel right

- Live Netlify URL still ≠ local production experience.  
- Endorsement dates/sources blank (honest; still unfinished to reporters).  
- Regnat Populus not yet given one high-impact home on the trust-funnel close.  
- `/campaign-calendar` vs `/events` twin.  
- `/contact` orphaned from nav.  
- 59 Unknown photos awaiting campaign confirmation.

---

## Journey audit

| Persona | Enter | Natural next | Hesitation | Get lost | Stop reading |
| --- | --- | --- | --- | --- | --- |
| First-time voter | `/` | Meet Kelly → Priorities → Join | “Can she do the job?” | Deep about chapters | Long office trees |
| Reporter | `/` or `/press-coverage` | Endorsements, videos, contact | Missing dates / press kit | Dashboard residue if searched | Empty press tooling |
| Volunteer | Header Volunteer / Final Action | `/get-involved` or `/volunteer` | **Was dead-end to About** | Two hubs without labels | Forms mid-page |
| County chair | Journey / Events / County link | Invite Kelly, events | Thin county proof | `/counties` tools feel OS | Intelligence subpages |
| Donor | Donate CTA | GoodChange external | Trust of redirect | `/donate` explainer easy to miss | — |
| Returning visitor | `/` or From the Road | Updates / events | Stale Netlify if live | Dual calendars | Repeated Meet Kelly |

---

## Structural audit (homepage + key hubs)

| Section / page | Belong? | Order OK? | Compress? | Verdict |
| --- | --- | --- | --- | --- |
| Homepage trust-funnel spine | Yes | Yes | Leave | Keep frozen |
| Office Serves cards on home | Yes | OK | Watch length | Keep |
| Direct Democracy (nav) | Yes for Kelly | Heavy vs homepage | Don’t add to home | Keep off home |
| `/get-involved` | **Yes — critical** | Long but purposeful | Later | Restored |
| `/campaign-calendar` | Parallel | — | Merge into `/events` post-launch | Hide from launch mindshare |
| `/dashboard/**` | No for public | — | Gate / split | Future |
| About deep-dive | Gated correctly | — | Keep gated | Keep |
| News: `/updates` in nav | Duplicate | — | Remove from nav | High |

---

## Page-by-page (core public)

| Page | One-sentence purpose | Hierarchy | Breath | Confidence | Voice | Evidence | CTA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Build trust and interest | Strong | Good | Strong | Calm Kelly | Photos/video/endorsements | Join / Volunteer / Priorities |
| `/about` | Qualifications | Good after compression | OK | Strong | Guide not memoir | Journey link | Priorities / Join |
| `/about/journey` | Listening proof | Good | Media-heavy | Strong | Trail | Photos + HSV video | Invite |
| `/priorities` | Governing approach | Good | Dense | Strong | Serious | Office links | Join |
| `/endorsements` | Third-party validation | Good | Spare | High if dates added | Disciplined | Confirmed set | Join |
| `/campaign-photos` | Trail authenticity | OK | Gallery | Medium (Unknown heavy) | Factual | FEATURE set | Journey |
| `/kelly-speaks` | Hear Kelly | OK | OK | High | Direct | YouTube | Play |
| `/get-involved` | Convert to participation | Long | Busy | High once reachable | Practical | Forms | Sign up |
| `/volunteer` | Field onboarding | Tool-like | Dense | Medium | Ops | Form | Signup |
| `/events` | See public stops | OK | Variable | Medium | Ops | Calendar data | Request |
| `/contact` | Reach campaign | Thin | Thin | High if linked | Plain | mailto | Email |
| `/understand` | Office literacy | Deep | Long | High for serious voters | Civic | Layers | Explore |

---

## Design audit + gold accent

**Current:** `kelly-navy` / `kelly-gold` tokens; gold already on primary CTAs, focus outlines, footer border. That is **distinction**, not a gold theme — keep it.

**Do not:** Redesign around gold wash, gold heroes, or gold card wallpaper.

**Restrained accent opportunities (High / Medium — presentation only):**

| Placement | Treatment | Impact |
| --- | --- | --- |
| Section dividers | 1px `border-kelly-gold/25` | Quiet hierarchy |
| Quote / Regnat mark | Gold typographic accent | Principle without slogan spam |
| Endorsement policy callout | Left border gold | Trust block |
| Progress / form steps | Gold indicator | Volunteer clarity |
| Underlines on active nav | Gold soft | Consistency |

**Typography / rhythm:** Trust-funnel chrome is the standard; avoid new card chrome. Watch header wrap after 48px CTAs (prior polish note).

---

## Regnat Populus audit

| Surface | Present today? | Emotional impact if used |
| --- | --- | --- |
| Header | No Latin motto | Low — keep clean |
| Footer | Description only; no motto | **High** — quiet close |
| Homepage Final Action | English “The next step is yours”; merge CTA defaults include Regnat eyebrow (may not be live wireframe) | **Highest** — one closing principle |
| Volunteer / Get Involved | Not featured | Medium — optional one-line |
| Journey | Evidence over motto | Leave |
| About | Qualifications first | Optional once, not chorus |

**Recommendation:** Place **one** intentional Regnat Populus moment — prefer homepage closing or footer lockup (“Regnat Populus · The People Rule.”) — not header chrome and not every page. Doctrine: unifying principle, not slogan wallpaper.

---

## Calendar & events audit

| Area | Status | Note |
| --- | --- | --- |
| Public display | `/events` canonical in nav | Keep |
| Parallel UI | `/campaign-calendar` | Duplicate mindshare |
| Invite / request | `/events/request`, `/schedule` | Both exist — clarify labels |
| Journey integration | Soft CTA | Architecture wants “Next Stops” from OS |
| Creation workflow | Staff / OS | Out of public scope |
| Migration | Locked architecture doc | Parallel track; don’t embed Kelly-calendar app |

**Before launch:** Prefer clarity (`/events` only in nav). **After launch:** Campaign Operating Calendar OS feeds public “Next Stops.”

---

## Volunteer experience audit

```
Discover (nav / Final Action / footer)
  → Learn (/get-involved lanes)
  → Sign up (VolunteerForm / JoinMovementForm or /volunteer#signup)
  → Confirmation (form success UX)
  → Next steps (resources / team invite)
```

| Friction | Severity | Action |
| --- | --- | --- |
| `/get-involved` redirected to `/about` | Critical | **Fixed this pass** |
| Dual hubs (`/get-involved` vs `/volunteer`) without explanation | High | Clarify labels: Participate vs Onboarding |
| Native form flag default off → href `/get-involved#volunteer` | High | Ensure env `NEXT_PUBLIC_USE_NATIVE_VOLUNTEER_FORM` for Netlify **or** keep get-involved forms as default path |
| Host / start-team also redirected | Critical | **Fixed this pass** |
| Confirmation / next-steps copy | Medium | Post-launch craftsmanship |

---

## Trust Ledger

| Item | Issue | Recommended action | Priority |
| --- | --- | --- | --- |
| Get Involved → About redirect | CTA lie | Removed redirects | Critical (done) |
| Host / Start team redirects | Dead ends from get-involved | Removed | Critical (done) |
| Netlify live ≠ local | Voters see old site | Publish binary; re-smoke | Critical |
| Endorsement dates blank | Reporter hesitation | Add when Steve supplies | High (campaign) |
| Endorsement source URLs | Same | Add when approved | High (campaign) |
| 59 Unknown photo counties | Thin statewide proof | Campaign confirm metadata | High (campaign) |
| Claim risk “50+ counties” | Unsupported if published | Do not publish without ledger | Critical (editorial) |
| `/updates` still in nav | Duplicate / redirect | Remove from nav | High |
| `/contact` not in nav | Reporter friction | Footer + Meet Kelly link | High |
| Press kit / downloadable assets | Missing | Reporter pass | High |
| `/privacy-and-trust` vs `/privacy` | Ambiguous | Redirect or merge | Medium |
| All photos DRAFT status | Ops inconsistency | Publish curated set | Medium |
| Transcripts on-site | Missing | Document YT CC; add later | Medium |
| Dashboard under public layout | Confusing if discovered | Future gate | Future |
| Regnat under-placed | Principle soft | One intentional placement | High |
| Gold overuse risk | Decoration | Accent rules above | Medium |
| Calendar twin | Confusion | Nav discipline | High |
| Volunteer env flag | Wrong signup path if mis-set | Netlify checklist | High |

---

## Recommendation Register

### Critical (before launch)

| ID | What | Why | User impact | Effort | Doctrine? |
| --- | --- | --- | --- | --- | --- |
| C1 | Restore `/get-involved` (+ host/team) from About redirects | Participation must work | Volunteer conversion | S — **done** | Presentation / routing |
| C2 | Publish polished binary to public URL | Local ≠ live | Statewide trust | Ops | Platform |
| C3 | Never claim unconfirmed county counts on-site | Honesty | Trust | S | Doctrine |
| C4 | Verify volunteer CTA env on Netlify (native form or get-involved) | Signup path | Volunteers | S | Ops |

### High (remaining ~1.5 days)

| ID | What | Why | User impact | Effort | Doctrine? |
| --- | --- | --- | --- | --- | --- |
| H1 | Drop `/updates` from nav (keep redirect) | Duplicate | Clarity | S | Presentation |
| H2 | Add `/contact` to footer | Reporter path | Trust | S | Presentation |
| H3 | One Regnat Populus lockup (footer or Final Action) | Unifying principle | Emotion | S | Presentation |
| H4 | Campaign geography confirm pass on Unknown FEATURE stills | Statewide proof | Belief | Campaign time | Evidence |
| H5 | Endorsement dates/URLs when available | Reporter defense | Trust | S once supplied | Campaign |
| H6 | Restrained gold accents on dividers / policy callout only | Distinction | Polish | S | Presentation |
| H7 | Clarify Get Involved vs Volunteer labels in nav | Dual hubs | Usability | S | Presentation |
| H8 | Keep `/events` only; ignore `/campaign-calendar` in comms | Twin calendars | Clarity | S | Presentation |

### Medium (after launch)

| ID | What | Why | Effort |
| --- | --- | --- | --- |
| M1 | Merge or redirect `/campaign-calendar` → `/events` | One calendar UI | M |
| M2 | Promote FEATURE photos DRAFT → PUBLISHED | Ops honesty | S |
| M3 | On-site transcripts | A11y | M |
| M4 | Form POST smoke + confirmation UX polish | Volunteer journey | M |
| M5 | `/privacy-and-trust` → `/privacy` | Duplicate | S |
| M6 | Journey “more photos” rotate confirmed unused stills | Breadth | S |
| M7 | Public “Kelly’s Next Stops” from Campaign OS | Architecture | L (packet) |

### Future

| ID | What | Why |
| --- | --- | --- |
| F1 | Split dashboard out of public `(site)` chrome | Maintainability |
| F2 | 75-county coverage visualization | Scoreboard risk |
| F3 | Full gold design system expansion | Over-decoration risk |
| F4 | Embed Kelly-calendar app | **Rejected** by architecture |

---

## Hesitation hunt

### Top three hesitations removed

1. Get Involved / host / team soft-redirects to About (Critical CTA lie).  
2. Ambiguity about whether forensic work should enlarge the homepage — answered: **no**; register instead.  
3. Assumption that “50+ counties of media” equals “50 counties on the site” — ledger proves metadata gap.

### Top three hesitations remaining

1. Live Netlify still serves older cut.  
2. Thin confirmed geography vs archive depth.  
3. Reporter tooling (dates, press contact visibility, kit).

---

## Campaign Manager Eye

- **Reporter:** Needs contact in footer + endorsement dates; videos help.  
- **Undecided voter:** Homepage still the product; don’t add Direct Democracy to home.  
- **Volunteer:** Path restored — test signup once on staging/prod.  
- **County chair:** Journey + events; county pages OK as secondary.

## Kelly first-look

**Proud:** Honest media discipline; restored participation; forensic honesty about geography.  
**Improve:** One Regnat moment; live URL parity; confirm a few more counties when true.

---

## Launch readiness summary

| Lens | Status |
| --- | --- |
| Local public experience | Strong — confidence pass + Critical CTA fix |
| Live public URL | Blocked on Netlify publish |
| Participation path | Restored (verify after deploy) |
| Editorial honesty | Strong if county-count claims stay off |
| Craftsmanship remaining | High items H1–H8 in ~1.5 days if prioritized |
| Overall | **READY AFTER MINOR REMEDIATION** (publish + optional High polish) — same posture as confidence pass, with Critical CTA fixed |

---

## Final recommendation

Ship the Critical routing fix. Prioritize **C2 publish**, then H1–H3 and campaign H4–H5. Capture everything else in this register. Do not open a feature sprint in the last day and a half.
