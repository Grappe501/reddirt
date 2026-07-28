# Homepage forward plan (Ernie)

**Status:** DECISIONS LOCKED — 2026-07-28  
**Baseline:** [`HOMEPAGE_CURRENT_STATE_ASSESSMENT.md`](./HOMEPAGE_CURRENT_STATE_ASSESSMENT.md)  
**Shell canon:** Keep trust-funnel architecture; upgrade section content in slices below.  
**Build auth:** `KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0` (AUTHORIZED 2026-07-28) upgrades `/` narrative and opens **two approved homepage videos** below. Prior Slice 5 “stills only” lock is overridden for those IDs only.

**Launch message (everything on `/` must reinforce):**

> Kelly Grappe is a trusted, accessible leader who is traveling Arkansas, listening to people, and prepared to serve as Secretary of State.

---

## Locked decisions

### 1. Stack destiny — HYBRID

- [ ] Keep trust-funnel as public canon (polish / resequence only)
- [ ] Replace trust-funnel with a new homepage architecture
- [x] **Hybrid** (keep funnel shell; swap named sections)

**Decision:** HYBRID  

**Reasoning:** The trust-funnel already answers who Kelly is, why she is running, trust, stance, and next action. Keep the architecture for launch. Change content inside bands as assets mature (photos, endorsements, news) without a homepage rewrite.

---

### 2. Track C / video / photo trail on `/` — STILLS ONLY

- [ ] Stay OFF until Track C gate opens (no stills either)
- [x] **Allow stills only** from campaign-photo registry (no personality video)
- [ ] Open Track C homepage personality / Shorts / approved embeds

**Decision:** STILLS ONLY  

**Do not implement while Track C is CLOSED:**

- Homepage personality video
- Shorts carousel
- Autoplay
- Embedded media strip

**Approved still categories (when curated):** endorsement, campaign trail, listening, community interaction photos from the campaign-photo registry. No embedded personality media until Track C officially opens.

---

### 3. Admin homepage merge — KEEP UNUSED ON `/`

- [ ] Reattach to `/` so `/admin/homepage` drives public home
- [x] **Keep unused** on `/` (admin board for other hubs / future only)
- [ ] Retire / document as legacy

**Decision:** KEEP UNUSED ON `/`  

**Reasoning:** Launch homepage stays code-controlled. Dynamic homepage editing is unnecessary deploy risk. Admin homepage config may serve other surfaces; revisit CMS-driven home after launch.

---

### 4. CTA / first impression — ALIGN VOLUNTEER + DELAY DONATE GATE

- [x] Align header Volunteer with in-page `getVolunteerSignupHref`
- [x] Delay / remove `HomeDonateFloatingGate` for launch
- [ ] Leave as-is for launch

**Decision:** Align Volunteer destinations; remove or delay floating donation gate.  

**Reasoning:** Home should build trust, credibility, and relationship before asking for money. Volunteer is lower-friction and fits grassroots messaging. Floating donate can return later if analytics support it.

---

### 5. Biography — HOME PREVIEW / ABOUT FULL

- [x] Keep Meet Kelly **preview** on home (short bio, trust indicators, leadership summary)
- [x] Full biography depth on `/about` (story, timeline, family, campaign history, accomplishments)
- [ ] Dump full bio onto home

**Decision:** Homepage entices; `/about` carries the complete story.  

**Note:** Replace the “draft manuscript” badge with an approved short preview when copy is ready — do not overwhelm home with full biography.

---

### 6. Dynamic bands — EXPAND CAREFULLY

- [ ] Keep On the Road as sole live band
- [x] **Expand carefully** for launch

**Decision:** For launch, allow:

| Band | Status |
|------|--------|
| On the Road | Keep / improve |
| Latest Campaign Photos | Add (registry stills; curated) |
| Latest News / Campaign Updates | Add (lightweight; no full CMS) |

**Keep disabled until after launch / Track C:**

- Shorts
- Personality video
- AI-generated content
- Social feeds
- Live feeds

---

## Launch implementation order

### Slice 1 — Homepage polish — **DONE** (`KELLY-HOMEPAGE-POLISH-SLICE-1.0`)

- CTA consistency (Volunteer header = `getVolunteerSignupHref`)
- Delay `HomeDonateFloatingGate` (off unless `NEXT_PUBLIC_HOME_DONATE_FLOATING_GATE=true`)
- Section spacing / typography / responsive refinements
- Accessibility: focus rings, reduced-motion hero still, Meet Kelly concise without draft badge
- Proof: `npm run agents:test-homepage-polish-slice1`

### Slice 2 — Campaign photography — **DONE** (`KELLY-HOMEPAGE-PHOTOS-SLICE-2.0`)

**Ernie brief:** [`HOMEPAGE_PHOTOS_SLICE_2_ERNIE_BRIEF.md`](./HOMEPAGE_PHOTOS_SLICE_2_ERNIE_BRIEF.md)  
**Report:** [`HOMEPAGE_PHOTOS_SLICE_2_REPORT.md`](./HOMEPAGE_PHOTOS_SLICE_2_REPORT.md)

- 8 curated FEATURE stills · `homepageCandidate: true`
- File-backed selector `homepage-campaign-photos.ts`
- Latest Campaign Photos band + Meet Kelly still (Mena/Polk)
- Hero unchanged (no HERO-quality still)
- Proof: `npm run agents:test-homepage-photos-slice2`

### Slice 3 — Endorsement integration

Trust-building endorsement band with links to supporting content where appropriate. No unsourced claims.

### Slice 4 — News integration

Lightweight “Latest Campaign Updates” section maintainable without making `getMergedHomepageConfig` drive `/`.

### Slice 5 — Track C (future; blocked)

Only after Netlify production smoke, database validation, and Track C gate open. Then implement approved homepage videos:

- `eKVz5pFJxtk` — This Office Belongs to the People!
- `aO712RsR0pQ` — Creating the Ripples in Hot Springs Village

---

## Explicit non-goals (until Slice 5 / post-launch)

- No Track C personality UI, Shorts, or autoplay on `/`
- No `getMergedHomepageConfig` on the launch-critical `/` path
- No inventing counties, quotes, résumé claims, or opponent contrast on home
- No treating Pass 02 / narrative wireframe docs as current render
- No full CMS homepage editing for launch

---

## Philosophy

Features that do not reinforce the launch message (homepage CMS, embedded Shorts, advanced editorial tooling) wait until after launch. That ships a polished, trustworthy public site sooner and preserves a clean path for later enhancements.
