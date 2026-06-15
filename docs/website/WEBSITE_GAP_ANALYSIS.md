# Website Gap Analysis

**Lane:** `RedDirt/`  
**Date:** 2026-06-10  
**Builds on:** [`WEBSITE_CONTENT_INTEGRITY_AUDIT.md`](./WEBSITE_CONTENT_INTEGRITY_AUDIT.md)  
**Purpose:** Page-by-page status, approval queue, and unused repo assets — to guide the next public-site pass without touching homepage or Victory OS internals.

---

## Executive summary

The content integrity doctrine is in place. The **highest-ROI public work** is not more homepage polish — it is completing the **voter trust journey**:

```text
Homepage → Interest          (done — do not rework)
About    → Trust             (biggest gap)
Office   → Competence        (strong scaffold, needs notaries + approval pass)
County   → Presence          (missing simple public map)
Get Involved → Action        (forms work)
Invite Kelly → Participation (pathway works)
```

**Do not build next:** Victory Board, Decision Engine, Mission Brief UI (internal).  
**Do build next (in order):** Meet Kelly consolidation → SOS explainer depth → County presence map.

---

## Trust layer — page status

### `/` Homepage

| Question | Status |
|----------|--------|
| What is complete? | Trust-funnel wireframe, office explainer cards, Meet Kelly / Invite / Get Involved CTAs, verified-events-only band |
| Placeholder? | Meet Kelly band points to `/about` with draft-manuscript note |
| Campaign approval? | Hero framing (`trust-funnel-home.ts`) — generic civic + candidacy; safe for now |
| Unused assets? | Legacy `HomeExperience` / `EducateBeatSections` stacks still in repo but not primary route |

**Verdict:** Complete for this phase. **Do not touch again** until About and Office are stronger.

---

### `/about` — Meet Kelly hub

| Question | Status |
|----------|--------|
| What is complete? | Hub hero, `KellyFullStory` narrative spine, Talk Business section hook, Why I'm running block, email CTA |
| Placeholder? | Draft-manuscript banner when `PUBLIC_BIOGRAPHY_DEPTH < 4` |
| Campaign approval? | **Yes — priority queue.** All `/about/[slug]` body copy in `KellyChapterBody.tsx` contains specific claims (25 years Alltel/Verizon, 800+ teams, LEARNS 2023, Sherwood duplex, Jacksonville at-large, dark money positions). LinkedIn + external URLs cited on business chapter only. |
| Unused assets? | See [Biography asset inventory](#biography-asset-inventory-not-yet-wired-to-about) |

**Gap vs. voter questions:**

| Voter question | Covered? | Where / gap |
|----------------|----------|-------------|
| Who is Kelly? | Partial | Hub + `/about/story` — needs tighter above-the-fold arc |
| Why is she running? | Partial | `/about/why-kelly` + `/about/why-secretary-of-state` — election framing needs source verification (see internal notes in `why-kelly-page.ts`) |
| Why does she care? | Partial | Forevermost, Stand Up, petitions chapters — scattered |
| What experiences prepared her? | Strong raw material | Business, farm, civics chapters — **needs campaign sign-off** |
| What should SOS do? | Redirect | Points to `/understand` and `/priorities` (priorities now placeholder) |
| Why trust her? | Implicit | Trust framing in story chapter — no third-party endorsements (correct per doctrine) |

**Verdict:** **Most important page on the site.** Structure exists; content is **80% written but not integrity-approved**. Next pass = consolidate, verify, and promote — not invent.

---

### `/about/[slug]` — Seven chapter routes

| Slug | Complete? | Approval needed? |
|------|-----------|------------------|
| `story` | Yes (generic trust framing) | Low |
| `business` | Yes (telecom + small business) | **High** — dates, scale, LinkedIn |
| `forevermost` | Yes (farm arc) | Medium — forevermostfarms.com corroborates |
| `stand-up-arkansas` | Yes (civic org) | Medium — standuparkansas.com links |
| `initiatives-petitions` | Yes (LEARNS, Sherwood, initiatives) | **High** — dates, places, policy claims |
| `why-secretary-of-state` | Yes (office convergence) | Medium |
| `your-part` | Yes (volunteer CTA) | Low |

**Unused:** `AboutBiographyDrilldown`, `/about/deep-dive/[slug]`, `/biography` manuscript — gated off (`PUBLIC_BIOGRAPHY_DEPTH = 3`).

---

### `/about/why-kelly`

| Question | Status |
|----------|--------|
| Complete? | Golden Circle WHY/HOW/WHAT from `why-kelly-page.ts` |
| Placeholder? | No |
| Approval? | **High** — DOJ/voter-list framing; internal file lists verification requirements before public citation |
| Unused? | None |

---

### `/understand` + `/office/*` — What the Secretary of State does

| Route | Complete? | Placeholder? | Approval? |
|-------|-----------|--------------|-----------|
| `/understand` | Gateway + `OfficeUnderstandGateway` + educate beats | Partial — scaffolding note in `office-three-layer.ts` | Medium |
| `/office/elections` (+ layers 2–3) | Three-layer system (clarity → relevance → competence) | Layer 3 has Kelly-specific bullets | **High** on layer 3 |
| `/office/business` | Same pattern | Same | **High** on layer 3 |
| `/office/records` | Same | Same | Medium |
| `/office/capitol` | Same | Same | Medium |

**Gap vs. recommended explainer:**

| Topic | In nav / site? | Gap |
|-------|----------------|-----|
| Elections | Yes | Strongest area |
| Business filings | Yes | Good |
| Notaries | **Weak / buried** | Not a top-level office card — add or expand in business/records |
| State records | Yes (`/office/records`) | Good |
| Capitol responsibilities | Yes | Good |
| Why this office matters | `/office/[slug]/why-it-matters` | Exists per area — needs plain-language hub summary |

**Verdict:** **Best differentiator on the site** after About. Scaffold is excellent; needs **notaries** surfaced, layer-3 Kelly claims audited, and one **single “SOS 101”** reader path (understand → elections → business → records).

**Unused assets:** `docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md` (keeper-of-records lines), office area configs in `src/content/office/*.ts` — partially wired, not fully promoted from homepage.

---

### `/priorities`

| Question | Status |
|----------|--------|
| Complete? | Four framework pillars only |
| Placeholder? | **All four** — `Content pending campaign approval` |
| Approval? | Entire detailed prior version **removed** — awaits leadership-approved positions |
| Unused? | Previous pillar copy still in git history — do not restore without approval |

---

### `/get-involved`, `/get-involved/bring-5`, `/donate`

| Route | Complete? | Notes |
|-------|-----------|-------|
| `/get-involved` | Yes | Real forms: `JoinMovementForm`, `VolunteerForm`, invite/donate sections |
| `/get-involved/bring-5` | Yes | Relational path |
| `/donate` | Yes | External GoodChange redirect via `siteConfig.donateHref` |

**Approval:** Low — procedural copy only.

---

### `/events/request`, `/schedule`, `/events`

| Route | Complete? | Notes |
|-------|-----------|-------|
| `/events/request` | Yes | 3-layer invite pathway; real intake |
| `/schedule` | Yes | `ScheduleCampaignEventForm`; staff-review disclaimers |
| `/events` | Yes | Prisma public events + movement events merge; **TODO in code** for county map |

**Gap:** Events page explicitly notes “Optional map + county completion visualization (later; no placeholder map pins)” — aligns with county presence recommendation.

---

### `/from-the-road`, `/press-coverage`, `/blog`, `/updates`

| Route | Complete? | Approval? |
|-------|-----------|-----------|
| `/from-the-road` | Yes when feeds connected | Substack/social/trail photos — real when ingested |
| `/press-coverage` | Partial | Depends on indexed press assets |
| `/blog` | RSS/Substack | Real when feed live |
| `/updates` | Campaign updates hub | Verify each item |

**Verdict:** Support trust layer; not primary journey.

---

### `/stories`, `/stories/[slug]`

| Question | Status |
|----------|--------|
| Complete? | Hub + submission form |
| Placeholder? | Archive **hidden** (`PUBLIC_ILLUSTRATIVE_STORIES_ENABLED = false`) |
| Approval? | All `src/content/stories/index.ts` entries are **composite fiction** — do not enable without per-story verification |

---

### County presence — **largest structural gap**

| Route | What it is today | Gap |
|-------|------------------|-----|
| `/counties` | **Field command pages** — volunteer metrics, organizing tools | Wrong surface for “Kelly is showing up” narrative |
| `/counties/[slug]` | County command / intelligence (when published) | Internal field program, not voter-facing presence |
| `/county-briefings` | Planning briefs hub | Staff/candidate facing |
| `/campaign-calendar` | Public calendar filter UI | Exists; separate from simple map |
| `/events` | Upcoming stops when published | Correct data source for “upcoming” |

**What does NOT exist (recommended build):**

```text
Simple public page:
  • Arkansas Counties Visited     ← sourced from verified travel/events only
  • Upcoming Stops                ← queryPublicCampaignEvents (already exists)
  • Invite Kelly To Your Community ← links to /events/request + /schedule
```

**Data sources already in repo (admin-side, not public map):**

- `queryPublicCampaignEvents` — published calendar rows (Prisma)
- Travel ledger / reimbursement (admin) — county touch data with audit trail
- `campaign-trail-assignments` / trail photos — **visual only**, not county counts
- `organizing-intelligence` — separate product lane; do not expose on Kelly public site

**Verdict:** Build a **new lightweight route** (e.g. `/on-the-trail/counties` or expand `/from-the-road`) — not `/counties` command pages.

---

## Secondary public routes (lower priority)

| Area | Routes | Status | Note |
|------|--------|--------|------|
| Explainers | `/explainers/[slug]` | Content catalog | Generic civic OK; verify each slug |
| Editorial | `/editorial/[slug]` | Content catalog | Same |
| Resources | `/resources/[slug]`, `/volunteer/resources/*` | Volunteer ops | Real tools; not voter-first |
| Local organizing | `/local-organizing` | Scaffold | Field program |
| Civic depth | `/civic-depth` | Deep policy | Review for unsupported claims |
| Direct democracy | `/direct-democracy` | Ballot access edu | Useful; keep generic |
| Voter registration | `/voter-registration` | Real handoff | Complete |
| Privacy | `/privacy-and-trust` | Trust policy | Complete — aligns with doctrine |
| Dashboard tree | `/dashboard/**` | Volunteer/team portals | Not voter journey |
| County tools | `/counties/tools/*` | Demo/simulation | **Do not promote publicly** — seed/demo labels in code |

---

## Biography asset inventory (not yet wired to About)

These exist in-repo and can build an excellent About page **without inventing facts** — after campaign verification pass:

| Asset | Path | Status | Wired to public? |
|-------|------|--------|------------------|
| Meet Kelly chapter bodies | `src/components/about/KellyChapterBody.tsx` | Written | **Yes** — `/about/[slug]` |
| Chapter metadata | `src/content/about/kelly-about-chapters.ts` | Complete | Yes |
| Why Kelly copy | `src/content/about/why-kelly-page.ts` | Written | Yes — needs source verify |
| KellyFullStory component | `src/components/about/KellyFullStory.tsx` | Written | Yes — `/about` |
| Literary manuscript (8 chapters + epilogue) | `src/content/biography/chapters/*.md` | **Draft** | Gated — `/biography` depth 4 |
| Biography config + pillars | `src/content/biography/biography-config.ts`, `biography-narrative-pillars.ts` | Draft | Partial — drilldown gated |
| Comprehensive bio draft (docs) | `docs/kelly-grappe-comprehensive-biography-draft-for-chatgpt-polish.md` | Draft | **Not on site** — source for Ask Kelly |
| Public bio excerpt | `docs/ask-kelly-public/kelly-grappe-biography.md` | Draft | Embeddings only |
| Talk Business summary | `src/content/press/talk-business-kelly-interview-summary.ts` | Summary | `/about` block — mark “verify transcript” |
| Safe public snippets | `docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md` | Labeled safe/needs source | **Not injected** — use selectively |
| Forevermost ingest | `src/content/background/forevermost-farms.ts` | From public website | Search/assistant only |
| Campaign trail photos | `src/content/media/campaign-trail-photos.ts`, assignments | Approved photo IDs | Scattered across pages |
| YouTube / inbound video | Admin homepage config | When set | Featured on about/understand |
| LinkedIn | External | Public record | Cited on business chapter |

**Key insight:** You do **not** need new biography writing to strengthen About. You need **verification, consolidation, and hierarchy** — pull the best of `KellyChapterBody` + manuscript chapters into one approved narrative arc.

---

## Content classification summary (site-wide)

| Class | Count (approx.) | Action |
|-------|-----------------|--------|
| Real sourced + live | ~15 core routes | Maintain |
| Generic civic explanation | Office layers, homepage explainer | OK to publish |
| Written but unapproved | About chapters, office layer 3, why-kelly | **Campaign review pass** |
| Placeholder pending | Priorities (4 pillars) | Await leadership |
| Hidden unsupported | Stories archive, fake homepage quotes | Keep hidden |
| Wrong surface for voters | `/counties` command, dashboard tree | Do not promote in main nav |

---

## Recommended build order (next 3 passes)

### Pass 1 — Meet Kelly (highest ROI)

1. Campaign approval worksheet for each `KellyChapterBody` claim (dates, numbers, places).
2. Restructure `/about` hub to answer the six voter questions in **one scroll** with deep links.
3. Add education / church leadership only if sourced in manuscript or approved docs.
4. Wire Talk Business block to transcript-accurate copy when ready.
5. Keep `/biography` gated until manuscript review completes.

**Do not:** Add endorsements, voter quotes, or new statistics.

### Pass 2 — Secretary of State explainer

1. Add **Notaries** to office framework (card or business sub-section).
2. Audit layer-3 “What Kelly brings” bullets on all four office areas.
3. Create single recommended path: `/understand` → four areas → `/priorities` (when approved).
4. Pull safe snippets from `KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md` where labeled `safe now`.

**Do not:** “Protect democracy” slogans without plain-language explanation.

### Pass 3 — County presence (simple public map)

1. New route — not county workbench.
2. **Counties visited:** derive from published events + campaign-approved travel log export (no fake pins).
3. **Upcoming stops:** reuse `queryPublicCampaignEvents`.
4. **Invite Kelly:** prominent CTA to existing forms.
5. Empty states when data missing — never invent visits.

---

## Admin note (future — not this pass)

Path to Victory button placement is correct. Long-term Campaign OS nav should treat **Path to Victory as centerpiece** with operations flowing downward. No UI work required until Sprint 0 map is leadership-reviewed.

---

## Pages explicitly out of scope

- Victory OS routes (`/admin/mission-brief`, victory-board, etc.)
- `organizing-intelligence` public lane (separate product)
- `countyWorkbench` external deploy
- Dashboard / field-playbook volunteer internals

---

## Sign-off checklist (before next public deploy)

- [ ] Campaign lead reviews `KellyChapterBody.tsx` claims
- [ ] Campaign lead replaces `/priorities` placeholders
- [ ] Why Kelly election claims verified against primary sources
- [ ] Office layer-3 bullets audited
- [ ] Stories flag stays `false` until real submissions approved
- [ ] County map uses verified data only
- [ ] No new homepage changes
