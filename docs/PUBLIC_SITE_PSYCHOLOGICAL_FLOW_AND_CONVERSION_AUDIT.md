# Public site psychological flow and conversion audit (Pass 3)

**Lane:** RedDirt · **Audience:** planners + UX/content · **Planning-only:** no backend features · **Campaign media only** (`brand-media`, existing `public/` assets, hero video env if set).

---

## 1. Public entry flow (inventory)

### 1.1 Homepage hero (`/`)

- **`HomeExperience`** mounts **`HomeDonateFloatingGate`** first (see §5 overlay), then **`HomeJourneyShell`**: **`HomeHeroSection`** (hero copy from merged homepage config — Power of Five CTA default, county sample secondary), **`HomePathwayGateway`** (pathway cards from `content/homepage.ts`), **`HomeOrganizingConversionBand`**, **`HomeGetInvolvedSection`** (`#beat-act`).
- **Primary visual:** optional **`NEXT_PUBLIC_HERO_VIDEO_URL`** full-bleed video; otherwise legacy Squarespace-linked still (**`brandMediaFromLegacySite`**) via **`HomeHeroSection`** **`ContentImage`**.
- **`siteConfig.description`** anchors SEO/OG: SOS role framing (elections, ballot access, 75 counties).

### 1.2 First scroll / narrative beats (`content/home/journey.ts`)

Landing uses **`LANDING_JOURNEY_BEATS`**: roughly **Arrival** (hero + pathways + conversion band) → scroll to **Act** (`#beat-act`, Get Involved). Middle beats (field, voices, conviction) are defined for Journey/assistant context; much of “trail” depth encourages **`/from-the-road`** elsewhere.

### 1.3 Primary CTAs on load (before overlay dismissal)

Overlaid **Donate** is visually dominant once the overlay shows; beneath it hero CTAs (“Start Power of 5”, “View County Dashboard”) are **not visible until** overlay is dismissed — **psychological bottleneck** (Steve’s flag).

### 1.4 Mobile

- **`SiteHeader`**: burger menu + search; sticky positioning with header shim (`--site-header-shim`).
- **Overlay:** fixed full viewport **`z-[100]`** — same blocking behavior mobile/desktop; portrait + single Donate stack.
- **`AskKellyLayout`**: dock bottom-right (`CampaignGuideDock`).

### 1.5 Ask Kelly public dock (`CampaignGuideDock`)

- Opens panel with chat / beta feedback; uses **`/api/assistant`** with pathname context — **does not expose admin URLs** by hardcoding in dock shell.
- **Risk:** streamed answers can theoretically mention routes — mitigated elsewhere by system-guide policy; Pass 3 does not change assistant logic.

### 1.6 Header / footer (`navigation.ts`)

- Primary: About, Priorities, Counties, Organize (`/organizing-intelligence`), Messages, Get Involved — **no `/admin`** links.
- Footer: Movement + Privacy groups.

### 1.7 Donation overlay — technical summary

| Item | Detail |
|------|--------|
| **File** | `src/components/home/HomeDonateFloatingGate.tsx` |
| **When** | Homepage only; **shows every new session** until dismissed (`sessionStorage` key `kelly_sos_home_donate_floating_dismissed`). Not shown on revisit same session after dismiss. |
| **Close** | Top-right **`×`** button (`fixed right-3 top-3 z-[101]`), **`aria-label`**: “Close and continue to the site”; **Escape** also dismisses. |
| **Blocks navigation** | Yes — **full-viewport opaque dialog** (`role="dialog"`, `aria-modal="true"`); user cannot scroll site until dismiss or outbound Donate link (Donate navigates away; overlay remains until return — typically new load shows overlay again if session cleared). |

**Pass 3 tweak (implemented alongside this doc):** stronger close affordance + explicit **Continue to website** secondary control — see §5.

---

## 2. Visitor psychology by major zone

| Zone | Visitor may think… | Desired feeling | Desired next step | Obvious today? |
|------|---------------------|----------------|-------------------|----------------|
| **Donate overlay** | “Fundraising modal before I know who she is.” | Transparent choice: support or browse | Dismiss smoothly **or** donate | **Friction:** blocks story before Kelly intro |
| **Hero** | “Campaign slogan + organizer vibe.” | Hope, statewide inclusion | Primary CTA (Power of 5) / secondary (county sample) | **After** overlay: yes |
| **Pathway cards** | “How do I engage without overwhelm?” | Agency | Pick one pathway | Moderate |
| **Conversion band** | “Movement toward signup.” | belonging | Counties / stories | Good if scrolled |
| **Get Involved (#beat-act)** | “Concrete asks.” | Clarity | volunteer / donate / stay connected | Yes (section exists) |

---

## 3. Conversion flow map (intended narrative)

```
Land → [overlay?] → see Kelly + promise → trust (tone, specificity) →
priorities/SOS relevance → volunteer | donate | stay informed → deeper organizing (Power of 5, counties, OI).
```

**Current tension:** Overlay puts **donate-first** emotionally before **Kelly-first**. Microcopy and “Continue” reduce aggression without rebuilding the funnel.

---

## 4. Content hierarchy vs. stranger questions

| Question | Where addressed today |
|----------|----------------------|
| **Who is Kelly?** | `/about`, story content, hero panel; scattered — **hero is more movement than biography** |
| **What does she stand for?** | `movementBeliefs` on homepage sections; **`/priorities`**, **`/what-we-believe`** |
| **Why SOS?** | **site meta**, priorities, filings/election framing in splits |
| **Why transparency / user-friendly gov / tech?** | **Heard** cards, **`/priorities`**, **`/direct-democracy`**, **`/civic-depth`**, labor/filings split |
| **How support / volunteer / donate / bring others?** | **`/get-involved`**, pathway cards, donate overlay + footer donate, Power of 5 onboarding **`/onboarding/power-of-5`** |

**Gap:** First session **homepage** can feel donate-led; **Kelly’s story arc** stronger if hero + first viewport emphasize **credibility line** (“Secretary of State,” “four fair functions”) earlier — **recommended for redesign pass**, not implemented here.

---

## 5. Donation overlay audit and recommendations

### Current behavior risks

1. **Entry aggression:** Overlay appears **before** hero is visible → answers “fund us” before “who she is.”
2. **Close visibility:** `×` sits on **near-navy backdrop** (`bg-kelly-navy/80` circle) — low contrast for some users (**Steve flagged**).

### Implemented tiny fixes (Pass 3 code)

File: **`src/components/home/HomeDonateFloatingGate.tsx`**

- **Higher-contrast dismiss control** (gold border + ring + clearer glyph weight).
- **Secondary text control:** visible **Continue to website** button (same dismiss handler) placed under primary Donate CTA so non-donors have an obvious opt-out aligned with donor CTA visually.

*(Full reorder / “show once per week” / “defer to second visit” deferred to redesign pass.)*

### Further recommendations (later)

| Priority | Recommendation |
|----------|------------------|
| P1 | **Defer overlay** until first scroll or **`requestIdleCallback` / delay 2–4s** so hero headline is read first |
| P2 | **localStorage** capped frequency (“once per 7 days”) vs session-only |
| P3 | A/B softer **strip** instead of fullscreen for low bounce |
| P4 | **Inline donate** chip in hero for users who dismiss quickly |

---

## 6. Suggested homepage narrative order (future reorder)

1. **Identity line** — name + office + plain “why this job” (**one sentence**).
2. **Trust stack** — fair elections · 75 counties · transparency (movement beliefs).
3. **Proof** — Arkansas / field authenticity (still or clip from **existing** hero media).
4. **Invitation** — Get involved + single donate moment (banner or deliberate placement).
5. **Depth** — priorities, ballot access education, civic depth — **below fold**.

---

## 7. CTA strategy (concise)

- **Hero primary:** relational onboarding (`/onboarding/power-of-5`) — builds pipeline.
- **Hero secondary:** County sample (**`/county-briefings/pope/v2`**) — “see the work” without voter data.
- **Persistent:** Footer / Get Involved / donate external link — aligned with **`siteConfig.donateHref`** only.
- **Avoid** promoting **`/organizing-intelligence`** as step zero for strangers — educate first (`priorities`, `about`).

---

## 8. Where to place video/media (existing assets only)

- **Hero:** env **`NEXT_PUBLIC_HERO_VIDEO_URL`** when set — already wired.
- **About / stories:** **`from-the-road`** and story layouts use campaign photography where present.
- **No new logos** — use **`brand-media`** + **`content/media/registry`** placeholders.

---

## 9. Gating: what stays behind signup / relational depth

Already consistent with docs:

| Surface | Audience |
|---------|----------|
| **`/admin/*`** | Staff cookie session |
| **`/relational/*`** | Relational program shell |
| **Heavy OI demos** | Public URLs but **labeled demo**; future gating optional for **email capture** |
| **Volunteer previews** **`/dashboard*`** | Public demo; deepening through **Forms** **`/api/forms`** on get-involved |

**Do not expose:** voter-row tables, treasurer detail, GOTV internals on marketing nav.

---

## 10. OpenAI / Ask Kelly API — planning only (**no implementation**)

**Principles:**

- Prefer **fixed, cached** snippets for high-traffic public answers (FAQ, SOS role basics).
- **Limit** open-ended public chat token burn — rate limits, shorter context, refusal patterns for donor/voter PII.

**Ideas:**

| Pattern | Benefit |
|---------|---------|
| **Static YAML or TS “quick facts”** for “Who is Kelly / why SOS?” | Near-zero marginal cost |
| **Precomputed embeddings** only for approved **`docs/ask-kelly-public/`** excerpts | Controlled corpus |
| **System guide routing** (`ask-kelly-system-guide`) before model | Avoids hallucinated routes |
| **“Short mode”** default on public dock | Saves tokens |
| **Escalate to full retrieval** after email capture OR signed volunteer session | Fits Steve’s deepen-after-volunteer rule |

---

## 11. First redesign pass recommendation (prioritized backlog)

| Order | Focus |
|-------|--------|
| **1** | **Donate overlay timing + prominence** — first impression fairness |
| **2** | **Hero subtitle** — tighter line on SOS + trust in ≤2 sentences |
| **3** | **About funnel** — link prominently from hero for “Know Kelly” |
| **4** | **Mobile overlay** thumb reach for dismiss |
| **5** | **Ask Kelly**: keep **curated corpus** gates before expensive model churn |

---

## 12. Friction ledger (Steve priorities cross-check)

| # | Issue | Status |
|---|-------|--------|
| 1 | Donate overlay blocks entry aggressively | Mitigated minimally (better close + Continue); **full defer/delay = future** |
| 2 | Close/X hard to see | **Addressed** in Pass 3 tiny UX fix |
| 3 | Answer who/what/why/how quickly | **Partially** met by IA; **needs copy hierarchy pass** |
| 4 | SOS persona: transparent / accountable / user-friendly / modern / simple-deep | Themes present in **`movementBeliefs`**, **`heardItems`**, priorities — **strengthen sequencing** later |
| 5 | Backend detail on public | **No granular ops** in nav; OI/dashboard language softened in Pass 2 |
| 6 | Deeper workflows after signup | Fits volunteer + relational + forms — **explicit CTA layering** recommended next |
| 7 | Media | **Campaign-only paths** enforced by policy; hero uses **`brand-media` / env video** |

---

*Next step: stakeholder review → Pass 4 optional homepage section reorder mock (copy-only).*
