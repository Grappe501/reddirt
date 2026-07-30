# Kelly Speaks — Media Library Architecture

**Status:** Canonical architecture doctrine (documentation only)  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Related:** Phase 1C §15 · `data/public-experience/kelly-homepage-personality-approved-videos.json`  
**Track C:** **CLOSED** — no homepage personality implementation authorized until the Track C gate opens  

---

## 1. Intent — living documentary

This is bigger than a campaign brochure site. RedDirt should feel like a **living documentary** of Kelly’s campaign.

Every major page should answer two questions:

1. **What does Kelly believe?**
2. **Can I see her saying or doing it?**

That pairing (belief + evidence in her own voice or actions) is more persuasive than pages of text alone.

Visitors must not experience a pile of random YouTube embeds. They should feel Kelly is **walking alongside** them: policy → photo → speech → volunteer story → county visit → another issue.

Every speech is a **content module** in a structured **Kelly Media Library**, connected through a **Campaign Story Engine** / **Campaign Content Graph** — not a generic “Videos” dump.

**Library page names (locked preferences):**

| Prefer | Avoid |
|--------|--------|
| **Kelly Speaks** | “Videos” |
| **Kelly In Her Own Words** | Generic “Media” |

These may be one hub with two entry titles, or sibling pages that share the same registry — do not invent a third competing video dump.

---

## 2. Track C lock (do not reopen video decisions casually)

```text
Track C: CLOSED
Reason: Database parity / production intake gate remains unresolved for Track C entry.
No homepage personality implementation authorized.
```

**Approved homepage video canon is locked.** Do not revisit homepage video choices unless Steve explicitly changes direction.

### Homepage canon (locked)

| Role | YouTube ID | Title | Homepage slot | Placement / purpose |
|------|------------|-------|---------------|---------------------|
| Primary campaign message | `eKVz5pFJxtk` | This Office Belongs to the People! | `home.message.primary` | After Four Pillars / Leadership band — primary campaign message |
| Personality / momentum | `aO712RsR0pQ` | Creating the Ripples in Hot Springs Village | `home.personality.primary` | Kelly Across Arkansas · personality · community · momentum |

### Locked presentation rules

```text
✓ youtube-nocookie embeds
✓ click-to-play
✓ reusable campaign media assets
✓ contextual placement
✓ transcript-ready
✓ searchable metadata
✓ reusable throughout the website
✓ no homepage implementation until Track C opens
```

---

## 3. Classification doctrine (every speech)

Before any embed or slot assignment, classify:

| Dimension | Purpose |
|-----------|---------|
| **Message** | What this speech advances |
| **Audience** | Who it is for |
| **Emotional function** | How it should land (inspirational, credentialing, instructional, …) |
| **Page** | Where the full or featured treatment lives |
| **Exact slot** | Typed placement key (no ad-hoc strings in components) |

Example intelligence record shape:

```text
Media Type: Leadership Speech
Category: Campaign Speech
Primary Theme: Leadership
Secondary Themes: Government · Transparency · Public Service · Elections · Business · Community
Audience: General Public
Length: (xx:xx)
Suggested Emotion: Inspirational
Placement Priority: High
Homepage Eligible: Yes | No | Excerpt only
Transcript: Available | Pending
Featured: Yes | No
```

---

## 4. Content module (not a bare embed)

Each module should eventually carry:

- Title · YouTube ID · Transcript · Summary · Pull quote  
- Topics · Counties mentioned · Office responsibilities covered  
- Audience · Related pages · Suggested placements  
- Thumbnail / custom poster · Chapter markers (future)  
- Related photos · Post-view CTA  

Future UI module (Track C / follow-on — **not built in this pass**):

```text
<CampaignVideoCard />

Inputs:
  videoId · headline · summary · pullQuote · topics · transcript · cta
  suggestedReading · relatedPhotos · relatedEvents · relatedIssues · relatedPages
```

**Rule:** Do **not** scatter raw `<iframe>` embeds across the codebase. One reusable `CampaignVideoCard` backed by the media registry owns styling, accessibility, captions, transcripts, related links, analytics, and future enhancements. The same approved video ID can appear on many pages without duplicating configuration.

### CampaignVideoCard chrome (locked pattern)

```text
-------------------------------------------------------
[ Large Video Thumbnail / custom poster preferred ]

Video Title
Brief introduction explaining why this video matters.

▶ Watch   (click-to-play · youtube-nocookie · no autoplay)

Topics
• Elections · Transparency · Small Business · County Government …

Related
Read the Plan → · Meet Kelly → · Related Photos → · Transcript →
-------------------------------------------------------
```

Default card behavior: **Approved for Public Site** only when operator-gated · captions enabled when available · custom campaign poster preferred over generic YouTube thumb.

---

## 4A. Campaign Story Engine

Videos are not isolated. Each speech module should connect to related campaign reality:

```text
Speech
  → Related campaign photos
  → Related speeches (e.g. County Clerk forum)
  → Blog / article
  → Election / issue plan
  → Volunteer opportunity
  → Related news
  → Donate / action
```

Everything reinforces everything else. The engine’s job is to make those links explicit in metadata so pages can compose them without hardcoding one-off embeds.

---

## 4B. Campaign Content Graph (target)

Longer-term RedDirt capability: a **Campaign Content Graph** where assets are first-class nodes:

```text
Speech → Issue → County → Photos → Event → Blog → Volunteer story
  → Press release → Podcast → Social post → Fundraising → Action
```

Then major pages become richer automatically by walking approved edges — still operator-gated for public publication.

---

## 4C. Policy-page closer — “Hear Kelly Explain It”

Every major policy page should end the same way (continuity across the site):

```text
---------------------------------
Hear Kelly Explain It

[ Video — click-to-play campaign chrome ]

"Pull quote from Kelly."

Topics Covered
✔ Transparency · Elections · Business · County Clerks · Civic Education …

Read the full plan →
---------------------------------
```

Prefer showing Kelly talking over another block of campaign copy. Reusable band names:

- **Hear Directly From Kelly** (general / Meet Kelly)
- **Hear Kelly Explain It** (policy / issue closers)

---

## 4E. Placement question (site-wide strategy)

Instead of asking “Where do we embed this video?”, ask:

> **What visitor question does this video answer?**

| Visitor question | Typical placement |
|------------------|-------------------|
| Who is Kelly? | Meet Kelly |
| What does the Secretary of State do? | What the Office Does |
| How will she work with counties? | County Partnerships / Secure Elections |
| Why is transparency important? | Transparency page |
| What is her vision? | Homepage (locked canon) and Our Plan |
| Why volunteer? | Get Involved |

Every video stays tied to a **purpose**, not a random slot.

### Canonical metadata fields (catalog each speech)

| Field | Purpose |
|-------|---------|
| Video ID | YouTube reference |
| Title | Public display title |
| Summary | Short description / why it matters |
| Featured Quote | Highlight for the page |
| Topics | Search and filtering |
| Office Responsibilities | SOS duties covered |
| Counties Mentioned | Geographic tagging |
| Audience | Voters, businesses, county officials, nonprofits, etc. |
| Related Pages | Where it should appear |
| Transcript | Accessibility and search |
| Related Photos | Gallery integration |
| Related Events | Campaign context |

---

## 4D. Kelly In Her Own Words (hub page)

Prefer this title over generic “Media.” Organize like a documentary index:

| Section |
|---------|
| Vision for Arkansas |
| Elections |
| Small Business |
| Transparency |
| County Clerks |
| Capitol |
| Civic Education |
| Public Service |
| Community |
| Interviews |
| Town Halls |
| Campaign Trail |
| Major Speeches |

Each section contains: featured video · transcript · key quotes · related issues · related plans · related photos · related blogs · related events.

**Kelly Speaks** and **Kelly In Her Own Words** share the same canonical registry; IA may present one or both entry points without duplicating asset records.

---

## 5. Kelly Speaks / Kelly In Her Own Words library categories

Organize by **theme**, not by upload date. Searchable library; other pages pull featured modules from the **same registry**:

| Section / category |
|--------------------|
| Vision for Arkansas |
| Elections & Election Administration |
| Business & Nonprofits |
| Transparency & Government Accountability |
| County Partnerships |
| Community Visits |
| Town Halls |
| Interviews |
| Candidate Forums |
| Campaign Trail |
| Major Speeches |
| Leadership |
| Direct Democracy |
| Civic Education |
| Public Service |
| Capitol |

Cross-page bands: **Hear Directly From Kelly** · **Hear Kelly Explain It**. Topic chips under a featured speech can navigate deeper into the site (video as navigation).

---

## 6. Page borrowing pattern

| Page | Borrows |
|------|---------|
| Homepage | Locked message + personality canon (when Track C opens) |
| Business Services | Short business-related speech |
| Election Security / Secure Elections | County Clerk Convention (full treatment) |
| Meet Kelly | Leadership speech |
| Direct Democracy | Ballot initiative speech |
| Volunteer | Motivational campaign speech |
| Our Plan / What the Office Does | Topic-matched modules |
| County pages | Statewide election-admin or trail modules as appropriate |

---

## 7. Registered assets in this packet (source of truth for IDs)

Machine-readable video registry (current slice): `data/public-experience/kelly-homepage-personality-approved-videos.json`  
Phase 1C narrative: `docs/KELLY_PUBLIC_EXPERIENCE_PHASE_1C_DATABASE_PARITY.md` §15  
Broader registry doctrine: `docs/CAMPAIGN_MEDIA_REGISTRY.md`

Additional speeches should be **appended** to the registry with review status — do not hardcode one-off embeds. Placement can wait until Tagged + Placement Approved.

---

## 7A. Review status pipeline (required as the library grows)

Ingest fast; place carefully. Every video (and later every public asset) carries a **review status** so placement is not forced at import time:

| Status | Meaning |
|--------|---------|
| **Imported** | Added to the registry |
| **Transcript Complete** | Transcript attached |
| **Tagged** | Topics, counties, and audiences identified |
| **Placement Approved** | Assigned to one or more website locations / slots |
| **Homepage Eligible** | Approved for homepage use (still subject to locked homepage canon) |
| **Featured** | Highlighted as a primary campaign asset |

Rules:

- **Imported** alone is enough to preserve the asset; it is **not** enough to ship on a page.
- Homepage locked canon (`eKVz5pFJxtk`, `aO712RsR0pQ`) is already Placement Approved + Homepage Eligible — do not reopen casually.
- Provisional imports (e.g. Video 8) stay at Imported / Review Required until tagging completes.

---

## 8. Launch content focus (while Track C stays closed)

Prioritize collecting and organizing into the **Campaign Media Registry** (not one-off embed decisions):

For each new video capture:

- **What is it about?**
- **Who is it for?**
- **Which pages should surface it?**
- **Which campaign themes does it reinforce?**
- **Which photos, blog posts, and plans should appear alongside it?**
- **What is its review status?**

Also continue: campaign photos + captions · endorsements · press · biography · issue pages · county content · downloadables · volunteer / donation pages.

When production DB / Track C gates clear, implement the **already-approved** homepage personality experience without reopening design debates. By launch, visitors should experience interconnected stories — not isolated videos.
