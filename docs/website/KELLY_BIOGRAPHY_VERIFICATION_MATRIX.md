# Kelly biography verification matrix

**Pass 1 — Meet Kelly Consolidation · Phase 1 deliverable**  
**Last updated:** 2026-06-10  
**Scope:** All Kelly biography sources in `RedDirt/` — classify every factual claim before public consolidation.

## Status labels

| Label | Meaning |
|-------|---------|
| **VERIFIED** | Public primary or third-party source confirms; safe to cite with link |
| **NEEDS SOURCE** | Plausible from internal narrative; requires dated primary citation before ads/high-reach |
| **NEEDS KELLY APPROVAL** | Biographically sensitive, election-specific, or scope unclear — Kelly must sign off |
| **REMOVE** | Unsupported, superseded, or violates content-integrity rules — do not publish |

## Source inventory

| # | Source | Path | Public today? |
|---|--------|------|---------------|
| A | Chapter bodies (live) | `src/components/about/KellyChapterBody.tsx` | Yes — `/about/[slug]` |
| B | Chapter metadata | `src/content/about/kelly-about-chapters.ts` | Yes — hub + SEO |
| C | Manuscript chapters | `src/content/biography/chapters/*.md` | Gated — `PUBLIC_BIOGRAPHY_DEPTH < 4` |
| D | Comprehensive draft | `docs/kelly-grappe-comprehensive-biography-draft-for-chatgpt-polish.md` | Internal only |
| E | Ask Kelly biography | `docs/ask-kelly-public/kelly-grappe-biography.md` | Embeddings / internal |
| F | Talk Business summary | `src/content/press/talk-business-kelly-interview-summary.ts` | Yes — `/about` |
| G | Why Kelly / Why I'm running | `src/content/about/why-kelly-page.ts` | Yes — `/about/why-im-running` |
| H | Safe snippets | `docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md` | Comms reference |
| I | Hub / KellyFullStory | `src/components/about/KellyFullStory.tsx` | Legacy — replaced on hub by six-question layout |
| J | Trust funnel home | `src/content/home/trust-funnel-home.ts` | Yes — homepage (do not rework) |

---

## Part 1 — Personal background & family

| Claim | Source(s) | Status | Notes / verification path |
|-------|-----------|--------|---------------------------|
| Kelly grew up in Selmer, Tennessee | C ch.1, D, E | NEEDS KELLY APPROVAL | Consistent across manuscript; no independent public bio link yet |
| Extended family / cousins close in childhood | C ch.1 | NEEDS KELLY APPROVAL | Literary manuscript only |
| Mother had Kelly deliver speeches at hearth | C ch.1, D | NEEDS KELLY APPROVAL | |
| 4-H public speaking | C ch.1–2 | NEEDS KELLY APPROVAL | |
| Father: State Director, Modern Woodmen of America (from 5th grade) | C ch.1 | NEEDS SOURCE | Title + dates need primary record |
| Heard Zig Ziglar through father's work | C ch.1–2 | NEEDS KELLY APPROVAL | |
| Family preview trip to Arkansas before move (Hot Springs, Hwy 7, etc.) | C ch.1 | NEEDS KELLY APPROVAL | |
| Moved mid-semester 10th grade to Arkansas | C ch.1 | NEEDS KELLY APPROVAL | |
| Sylvan Hills High School — clarinet, yearbook editor | C ch.1 | NEEDS KELLY APPROVAL | |
| Met Steve (baritone sax) in band; prom committee 11th grade | C ch.1, ch.5 | NEEDS KELLY APPROVAL | |
| Lyon College — psychology major | C ch.2–3 | NEEDS KELLY APPROVAL | |
| Foster-care observation / career pivot from therapy track | C ch.3 | NEEDS KELLY APPROVAL | Sensitive — Kelly approval required |
| Kelly & Steve married ~2018 | C, D, E | NEEDS SOURCE | Year cited in comprehensive draft; confirm |
| Daughter Grace — Kelly's adoption decision | C ch.5–6 | NEEDS KELLY APPROVAL | Highly personal |
| Rose Bud, AR — between Romance and Joy | A, C, D, E | VERIFIED | forevermostfarms.com; campaign copy |
| Steve carved "Steve and Kelly — BFF" in tree (~20 ft up now) | C ch.5 | NEEDS KELLY APPROVAL | Anecdote — optional public detail |

---

## Part 2 — Career (Alltel / Verizon)

| Claim | Source(s) | Status | Notes / verification path |
|-------|-----------|--------|---------------------------|
| ~25 years with Alltel then Verizon | A, B, F, I | NEEDS SOURCE | LinkedIn is cited path — verify dates on profile |
| Leadership / managed large teams | A, F | NEEDS SOURCE | LinkedIn + Verizon/Alltel records |
| Led Little Rock call center, 800+ people | C ch.6, D, E | NEEDS SOURCE | Specific headcount — verify with employment record |
| Trainer role — Steve in her training class (reunion) | C ch.4 | NEEDS KELLY APPROVAL | Narrative beat |
| Toastmasters / sales training | C ch.2 | NEEDS SOURCE | |
| Career maps to SOS business-services mission | A, G, H | VERIFIED | Generic office framing + safe snippets |
| LinkedIn profile URL | A, I | VERIFIED | https://www.linkedin.com/in/kelly-grappe-48b6aa51/ |

---

## Part 3 — Forevermost Farms & small business

| Claim | Source(s) | Status | Notes / verification path |
|-------|-----------|--------|---------------------------|
| Forevermost Farms — Kelly & Steve | A, C, D | VERIFIED | https://forevermostfarms.com/ |
| Started small market + farm operations | A, D, E | NEEDS KELLY APPROVAL | Confirm public wording |
| Full-time poultry/pork/turkey/quail; paused selling | A, C ch.6, D | NEEDS KELLY APPROVAL | Operational detail — verify with Kelly |
| Regenerative ranching direction (~2018) | D, E | NEEDS SOURCE | From blog summary in draft doc |
| Batch size 500–700 birds, non-GMO feed 170 mi, USDA Clinton | D, E | NEEDS SOURCE | From 2020 blog — link required |
| Dolly Parton quote at farm | About page QuoteBand | NEEDS KELLY APPROVAL | Attributed to farm posting — confirm |
| Contact: Forevermostfarms@gmail.com, (501) 690-8227 | D, E | VERIFIED | On public farm site |

---

## Part 4 — Civic & community leadership

| Claim | Source(s) | Status | Notes / verification path |
|-------|-----------|--------|---------------------------|
| Stand Up Arkansas — Kelly helps lead | A, C, D | VERIFIED | https://www.standuparkansas.com/ |
| Recruit, train, activate civic leaders | A, H | VERIFIED | Organization mission aligns |
| LEARNS Act referendum / petition work | A, C ch.7, D | NEEDS KELLY APPROVAL | Policy-sensitive; verify scope & dates |
| Sherwood duplex as temporary petition HQ (2023 summer) | A, C ch.7 | NEEDS KELLY APPROVAL | Specific address/lease — confirm before naming |
| Steve organized referendum effort first | C ch.7 | NEEDS KELLY APPROVAL | |
| Statewide initiative support philosophy | A | NEEDS KELLY APPROVAL | |
| "Volunteer-centered" / no paid signature gatherers claim | A | NEEDS KELLY APPROVAL | Legal/compliance review if asserted publicly |
| Counties visited (any count) | — | REMOVE | No verified public metric — do not invent |
| Endorsements / testimonials | — | REMOVE | Content-integrity rule |

---

## Part 5 — Why running / election administration

| Claim | Source(s) | Status | Notes / verification path |
|-------|-----------|--------|---------------------------|
| Running for Arkansas Secretary of State | Site-wide | VERIFIED | Campaign identity |
| Pressure to shift election decisions away from state law | G | NEEDS KELLY APPROVAL | Election claim — primary sources per internal notes |
| DOJ voter-list requests (May 2025) | G internal notes | NEEDS SOURCE | Do not publish until primary docs verified |
| Arkansas response on voter lists | G internal notes | NEEDS SOURCE | NCSL/primary only |
| "One of the first" / rank claims | G internal notes | REMOVE | Explicitly forbidden in why-kelly-page.ts |
| SSN / specific field release claims | G internal notes | REMOVE | Unless verified Arkansas records |
| Non-partisan administration under law | G, H | VERIFIED | Generic framing (`safe now` snippets) |
| Hold the line / Arkansas elections belong to Arkansans | G | NEEDS KELLY APPROVAL | Campaign positioning — Kelly sign-off |
| Office priorities (4 pillars) | `/priorities` | NEEDS KELLY APPROVAL | Marked pending on site |

---

## Part 6 — Media & third-party

| Claim | Source(s) | Status | Notes / verification path |
|-------|-----------|--------|---------------------------|
| Talk Business & Politics interview | F, meet-kelly-trust-indicators | VERIFIED | https://www.kark.com/capitol-view/capitol-view-barack-obamas-arkansas-visit-arkansas-sec-of-state-candidate-kelly-grappe/ (Roby Brock / Capitol View) |
| Interview summary copy (operations → SOS) | F | NEEDS SOURCE | Replace with transcript-accurate wording |
| YouTube embed for Talk Business | talk-business-media.ts | VERIFIED | When env/DB video id configured |

---

## Part 7 — Safe snippets crosswalk (selected)

| Snippet theme | Representative line | Status |
|---------------|---------------------|--------|
| Keeper of records / civic librarian | SOS duties metaphor | VERIFIED / needs cite for paid |
| Rockefeller-inspired reform | Historical name use | NEEDS SOURCE + legal review if paid |
| Opponent contrast (no name) | Petition / voter-list burden | NEEDS SOURCE + legal review |
| County clerk partnership | "Partners—I’ll treat them that way" | VERIFIED (`safe now`) |
| Outreach intel procedural | "Verify with organizers" | VERIFIED |

Full list: `docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md`

---

## Part 8 — REMOVE list (do not republish)

| Claim | Reason |
|-------|--------|
| Unsourced voter quotes / story previews | Removed in content-integrity pass — `homepage.ts` |
| "800+ employees" on homepage trust funnel | Removed — NEEDS SOURCE before any public stat |
| LEARNS/Sherwood bullets on homepage | Removed — NEEDS KELLY APPROVAL |
| Counties visited count | No verified public dataset |
| Victory OS / internal metrics on public site | Doctrine — never public |
| Fake endorsements or testimonials | Content-integrity rule |
| "One of the first" election claims | Forbidden in why-kelly internal notes |

---

## Six-question mapping (Phase 2)

| Voter question | Primary public route | Source material | Gate |
|----------------|---------------------|-----------------|------|
| Who is Kelly? | `/about`, `/about/journey` | C ch.1–3, A story | Manuscript = draft |
| What has she done? | `/about/business`, `/about/community` | A business, stand-up, forevermost | LinkedIn for dates |
| Why is she running? | `/about/why-im-running` | G | Election claims = approval |
| What has she learned? | `/about/journey` learnings | C, A | Generic OK; anecdotes gated |
| What should the office do? | `/understand`, `/priorities` | H, office pages | Campaign approval |
| Why trust her? | `/about#trust-indicators` | LinkedIn, org URLs | No invented stats |

---

## Phase 3 routes (implemented)

| Route | Purpose |
|-------|---------|
| `/about` | Executive summary — six questions + trust indicators |
| `/about/journey` | Expanded life story arcs |
| `/about/community` | Leadership & civic work |
| `/about/why-im-running` | Campaign origin (canonical) |
| `/about/why-kelly` | Redirect → `/about/why-im-running` |
| `/about/[slug]` | Legacy deep-dive chapters (unchanged) |

---

## Next actions for campaign

1. Kelly sign-off on manuscript chapters before raising `PUBLIC_BIOGRAPHY_DEPTH` to 4.
2. LinkedIn audit: confirm dates, titles, team sizes for telecom claims.
3. Transcript-accurate Talk Business summary.
4. Primary-source pack for election-administration claims on why-im-running page.
5. Approved county-visit list before Pass 3 county presence map.
6. LEARNS / Sherwood timeline document with Kelly approval.

---

## Change log

| Date | Change |
|------|--------|
| 2026-06-10 | Initial matrix — Pass 1 Phase 1 audit |
| 2026-06-10 | Phases 2–4 implemented: six-question `/about`, subpages, trust indicators |
