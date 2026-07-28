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

## 5. Kelly Speaks page structure (target IA)

Organize by **theme**, not by upload date:

| Section | Example content |
|---------|-----------------|
| Vision | Government That Works for Every Arkansan |
| Elections | County Clerk Convention forum |
| Direct Democracy | Ballot / initiative speeches |
| Small Business | Business-services speeches |
| Transparency | Accountability speeches |
| Leadership | Leadership speeches (e.g. Video 4) |
| Civic Education | Teaching / explainers |
| Campaign Trail | Momentum / community stories |
| Interviews | Press / long-form |
| Town Halls | Community forums |

Cross-page band (reusable): **Hear Directly From Kelly** — visitors hear Kelly rather than only reading about her.

Topic chips under a featured speech can **navigate deeper into the site** (video as navigation), e.g. Small Business · Election Security · County Clerks · Transparency · Capitol · Civic Education.

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

Machine-readable registry: `data/public-experience/kelly-homepage-personality-approved-videos.json`  
Phase 1C narrative: `docs/KELLY_PUBLIC_EXPERIENCE_PHASE_1C_DATABASE_PARITY.md` §15

Additional speeches should be **appended** to that registry with full classification — do not hardcode one-off embeds.

---

## 8. Launch content focus (while Track C stays closed)

Prioritize collecting and organizing into the **canonical media registry** (not one-off embed decisions):

For each new video capture:

- **What is it about?**
- **Who is it for?**
- **Which pages should surface it?**
- **Which campaign themes does it reinforce?**
- **Which photos, blog posts, and plans should appear alongside it?**

Also continue: campaign photos + captions · endorsements · press · biography · issue pages · county content · downloadables · volunteer / donation pages.

When production DB / Track C gates clear, implement the **already-approved** homepage personality experience without reopening design debates. By launch, visitors should experience interconnected stories — not isolated videos.
