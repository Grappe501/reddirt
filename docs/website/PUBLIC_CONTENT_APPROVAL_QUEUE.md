# Public content approval queue

**Master queue for public-site content integrity.**  
Every asset listed here must reach **Approved** before high-reach use (paid ads, press kits, email blasts).  
Cross-reference: [`KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md`](./KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md) · [`WEBSITE_CONTENT_INTEGRITY_AUDIT.md`](./WEBSITE_CONTENT_INTEGRITY_AUDIT.md)

**Status values**

| Status | Meaning |
|--------|---------|
| **Approved** | Kelly or designated owner signed off; safe for public site |
| **Needs Review** | On site with integrity labels; awaiting owner decision |
| **Needs Transcript Verification** | Published copy must match primary recording/document |
| **Needs Source Review** | Claim requires dated citation before promotion |
| **Missing Source** | Not publishable as a metric or factual claim |
| **Draft — Not Public** | Exists in repo but gated or internal-only |
| **Remove** | Do not publish; violates integrity rules |

---

## Meet Kelly

| Asset | Route / path | Status | Owner | Notes |
|-------|----------------|--------|-------|-------|
| About Hub (six questions) | `/about` | Needs Review | Kelly | Architecture live; executive copy awaits sign-off |
| Her Journey | `/about/journey` | Needs Review | Kelly | Manuscript arcs flagged draft |
| Community & Civic Work | `/about/community` | Needs Review | Campaign | Stand Up verified; LEARNS section gated |
| Why I'm Running | `/about/why-im-running` | Needs Review | Kelly | Election-administration claims need primary sources |
| Why Kelly (legacy redirect) | `/about/why-kelly` | Approved | Ops | Redirect only → `/about/why-im-running` |
| Talk Business Summary | `talk-business-kelly-interview-summary.ts` | Needs Transcript Verification | Campaign | Replace with transcript-accurate copy |
| Talk Business Embed | `/about#talk-business-kelly` | Needs Review | Campaign | Video id / iframe when configured |
| Chapter: Trust & Story | `/about/story` | Needs Review | Kelly | KellyChapterBody — campaign essay |
| Chapter: Business & Process | `/about/business` | Needs Source Review | Campaign | LinkedIn audit for dates/titles |
| Chapter: Forevermost | `/about/forevermost` | Needs Review | Kelly | Farm operational claims |
| Chapter: Stand Up Arkansas | `/about/stand-up-arkansas` | Approved | Kelly | standuparkansas.com |
| Chapter: LEARNS & Petitions | `/about/initiatives-petitions` | Needs Source Review | Campaign | Timeline, scope, Sherwood details |
| Chapter: Why SOS | `/about/why-secretary-of-state` | Needs Review | Kelly | Office-fit narrative |
| Chapter: Your Part | `/about/your-part` | Needs Review | Campaign | Get-involved framing |
| Trust Indicators block | `/about#trust-indicators` | Approved | Ops | External links only; pending metrics listed honestly |
| Biography manuscript | `/biography`, `chapters/*.md` | Draft — Not Public | Kelly | `PUBLIC_BIOGRAPHY_DEPTH < 4` |
| Verification matrix | `KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md` | Approved | Ops | Living document — update as claims verified |

---

## The Office (Pass 2)

| Asset | Route / path | Status | Owner | Notes |
|-------|----------------|--------|-------|-------|
| Understand the Office hub | `/understand` | Needs Review | Campaign | Three-level civic education architecture |
| Elections · Level 1 | `/office/elections` | Needs Review | Campaign | Pure civic copy — no campaign bleed in L1 |
| Elections · Level 2 | `/office/elections/why-it-matters` | Needs Review | Campaign | Stakeholder relevance |
| Elections · Level 3 | `/office/elections/full-picture` | Needs Source Review | Campaign | Kelly-brings — no unverified headcounts |
| Business & Filings · L1–L3 | `/office/business` | Needs Review | Campaign | |
| Notaries · L1–L3 | `/office/notaries` | Needs Review | Campaign | New Pass 2 area |
| Transparency & Records · L1–L3 | `/office/records` | Needs Review | Campaign | |
| Capitol & Public Safety · L1–L3 | `/office/capitol` | Needs Review | Campaign | |
| Why This Race Matters | `/office/why-this-race-matters` | Needs Review | Kelly | Campaign framing — separate from L1 |
| Office priorities | `/priorities` | Needs Review | Kelly | All pillars pending approval |

---

## Homepage & trust funnel

| Asset | Route / path | Status | Owner | Notes |
|-------|----------------|--------|-------|-------|
| Trust funnel homepage | `/` | Needs Review | Kelly | Integrity pass committed; copy sign-off pending |
| Stories archive | `/stories` | Draft — Not Public | Campaign | Hidden when illustrative stories disabled |
| Voter registration CTA | `/voter-registration` | Needs Review | Campaign | |

---

## Events & county presence (Pass 3)

| Asset | Route / path | Status | Owner | Notes |
|-------|----------------|--------|-------|-------|
| Schedule / Invite Kelly | `/schedule` | Needs Review | Campaign | |
| Counties visited counter | — | Missing Source | Operations | No public metric until verified list exists |
| County presence map | — | Missing Source | Operations | Pass 3 — not started |
| Upcoming stops | `/events` or schedule | Needs Review | Campaign | Published events only |

---

## Removed / do not publish

| Asset | Status | Reason |
|-------|--------|--------|
| Fake voter story previews | Remove | Removed from `homepage.ts` |
| Unsourced résumé bullets (800+, LEARNS on homepage) | Remove | Integrity pass |
| Victory OS metrics on public site | Remove | Internal doctrine |
| Endorsements / testimonials (unsourced) | Remove | Integrity rule |
| "One of the first" election rank claims | Remove | Forbidden in why-kelly internal notes |

---

## Workflow

1. **Writer / dev** updates copy in repo with correct status in this queue.
2. **Campaign** verifies sources; updates matrix + this queue.
3. **Kelly** approves sensitive biographical and election-administration claims.
4. **Ops** removes `ContentPendingBadge` from route only when status = **Approved**.

---

## Change log

| Date | Change |
|------|--------|
| 2026-06-10 | Initial queue — Pass 1 foundation + Pass 2 prep |
