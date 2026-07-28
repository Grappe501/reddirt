# Kelly Speaks — Media Library Architecture

**Status:** Canonical architecture doctrine (documentation only)  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Related:** Phase 1C §15 · `data/public-experience/kelly-homepage-personality-approved-videos.json`  
**Track C:** **CLOSED** — no homepage personality implementation authorized until the Track C gate opens  

---

## 1. Intent

Visitors must not experience a pile of random YouTube embeds. They should feel they are walking through **Kelly’s story, leadership, and vision**.

Every speech is a **content module** in a structured **Kelly Media Library**, surfaced on pages where it reinforces the topic — not a generic “Videos” dump.

**Page name (locked preference):** **Kelly Speaks** — not “Videos,” not “Media.”

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

Prioritize collecting and organizing:

- Videos (classified into this library as Steve sends them)  
- Campaign photos with captions and metadata  
- Endorsements · Press · Biography · Issue pages  
- County-specific content · Downloadables · Volunteer / donation pages  

When production DB / Track C gates clear, implement the **already-approved** homepage personality experience without reopening design debates.
