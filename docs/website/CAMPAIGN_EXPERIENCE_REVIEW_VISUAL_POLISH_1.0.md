# CAMPAIGN EXPERIENCE REVIEW

**Pass:** `KELLY-PUBLIC-VISUAL-POLISH-AND-LAUNCH-QA-1.0`  
**Authority:** [`CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md`](./CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md) · [`PUBLIC_SITE_EDITORIAL_DOCTRINE.md`](./PUBLIC_SITE_EDITORIAL_DOCTRINE.md)  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Starting commit:** `fc1c822f` · **Shipped:** `b4875fae` (report hash `d6bd24f0`)  
**Date:** 2026-07-28

---

## Executive Summary

This pass was refinement, not expansion. The homepage architecture stayed frozen. The message psychology work from earlier today stayed frozen. We did not invent new biography, new sections, or new campaign claims. The job was to make what already exists feel more like one campaign — calm, consistent, and trustworthy — and to prove the major public routes still answer when a quiet server is healthy.

What a voter gets now is clearer control chrome: buttons that belong to one system, cards that share the same corner and shadow language, tap targets that don’t feel fiddly on a phone, and focus states that behave like a serious site rather than a pile of one-off links. Photography still carries much of the human weight. Copy from the message pass already did the hard compression; this pass mostly stopped the interface from arguing with that copy.

The trail media still does more emotional work than any paragraph we could add. Primary video after Government That Works, then Meet Kelly, then Across Arkansas with Hot Springs Village and confirmed stills — that sequence remains the right spine. Polish made the spine easier to travel without changing where it goes.

What this pass did *not* finish is release theater: a clean production build on H: after earlier contention, and Netlify’s platform path. Locally, the experience is coherent. Shipping confidence is still capped by infrastructure and one quiet rebuild window.

---

## Visitor Journey Review

I arrive on `/`.

Within five seconds I know who she is: **Kelly Grappe**, for Arkansas Secretary of State, with a promise that the office belongs to the people. The hero panel is calm — gold primary, restrained secondary — not a fundraising ambush.

By twenty seconds, Government That Works tells me why this office touches my life: elections, filings, records, Capitol. The cards read as competence, not slogans. Explore links are now easier to hit; they still feel a little like “documentation exits,” but they do not break the journey.

By about a minute I can hear Kelly, if I choose to play. The video framing is short enough that it doesn’t explain the film away before I watch. That is correct.

By ninety seconds I am in Across Arkansas — Hot Springs Village as evidence of showing up, then stills from places with confirmed geography where we have it. I believe she is moving through the state *because I see it*, not because a sentence claims momentum.

Meet Kelly in the middle remains the densest text band on the homepage. After media-heavy sections, three solid paragraphs feel like homework even when they are the right homework. The CTA — Read About Kelly’s Experience — is the right invitation; the visual weight of the band still asks more reading than the photography around it.

Endorsements stay honestly empty. That is trust-positive for a careful voter and slightly cold for a casual one. News stays release-only. Final action is clear: Join, Volunteer, Priorities, Donate last. I understand how to participate.

Weakest step in the journey: the breath after primary video into Meet Kelly still feels like switching from “watch/feel” to “read/qualify” without enough visual glue. Not broken — just the place a first-time visitor might skim.

---

## Psychological Review

| Section | Recognition | Competence | Trust | Human connection | Motivation | Note |
| --- | --- | --- | --- | --- | --- | --- |
| Hero | Strong | Moderate | Strong (calm) | Soft | Soft → Meet/Join | Right opening |
| Government That Works | Soft | Strong | Strong (limits elsewhere) | Low | Soft | Competence engine |
| Primary video | Strong | Moderate | Strong | Strong | Soft | Voice = connection |
| Meet Kelly | Strong | Strong | Moderate | Moderate | Soft | Still text-forward |
| Across Arkansas | Moderate | Soft | Strong (evidence) | Strong | Soft | Method, not romance |
| Campaign photos | Soft | Soft | Strong | Strong | Soft | Proof band |
| Endorsements | Soft | Soft | Strong (honesty) | Low | Low | Empty is correct |
| News | Soft | Soft | Strong | Low | Moderate | Only if filled |
| Final action | Soft | Soft | Soft | Soft | Strong | Agency, late |

Nothing on the frozen spine fails to move at least one of these. Endorsements and News are placeholders that protect trust more than they create motivation — acceptable until confirmed content arrives.

---

## Media Review

### Why these eight homepage stills

They were curated earlier as FEATURE, homepage-candidate trail evidence: listening, greeting, festival work, door conversation, civic breakfast, labor-adjacent gathering, capital-city concourse, Peach Festival, watermelon booth. They are not a random gallery dump. They were chosen because they show Kelly *doing something* with other people, not posing alone for a brochure.

### Why not the others

Many registry stills remain Unknown geography, SUPPORTING level, or redundant with a stronger same-day frame. Launch doctrine forbids inventing place. Unknown stays Unknown. That discipline costs “fullness” and buys honesty.

### Emotional anchor

**Mena / Polk meet-and-greet** remains the emotional and Meet Kelly anchor: retail politics, table, conversation, confirmed place. It is the photograph that most clearly answers “will she represent people like me?” for a small-town voter.

### Future hero candidate

**War Memorial Stadium concourse (Little Rock)** has scale and confirmed capital geography. It is not yet a HERO-level crop for the trust-funnel hero (still locked to the existing hero media), but it is the strongest “statewide stage” still in the set if we ever open a hero still swap under doctrine.

### Captions

Most captions are factual and short enough. The AFL-CIO caption no longer claims an endorsement — necessary. A few captions still lean descriptive rather than decisive (“visits with…”) — accurate, slightly flat. The peach festival and toad-race frames carry more Arkansas specificity in the image than in the words beneath them.

### Video

The Hot Springs Village / Across Arkansas video works *because of sequence*: after governing competence and primary message, it functions as **evidence of method**, not as an introduction to who Kelly is. Primary message video earlier is voice and accountability. That order is design, not accident.

### Where another visit would strengthen the page

One more confirmed Northwest Arkansas or Delta still with locked city/county would widen the geographic story without slogans. Endorsements page still needs one real third-party statement with source before social proof can do any work.

---

## Copy Review

This polish pass did not rewrite the message spine. The shorter, clearer voice comes from the earlier psychology remediation: Meet Kelly as three purpose paragraphs; `/about` as qualifications; video intros that stop pre-explaining; Across Arkansas as method.

What still sounds like campaign infrastructure language: “Explore … →” on Government That Works cards; some office-explainer exits. Accurate, a bit CMS-like.

What still feels repetitive across the site if you binge pages: operations + LEARNS + 75 counties appear on home Meet Kelly and again on `/about` Experience — intentional depth vs preview, but a binge reader hears the echo.

**Weakest paragraph on the site (instinct):** the homepage Meet Kelly third paragraph is doing too much moral summary (“People over politics means…”) after two already-complete paragraphs. It is correct doctrine, slightly sermon-adjacent after evidence-heavy neighbors.

---

## Visual Review

The homepage breathes better between sections than it did when each CTA was a local invention. Shared card chrome and hover elevation make the photo grid and pillar cards feel related. Motion is quieter (ScrollReveal default rise reduced) — closer to calm confidence than reveal theater.

Header CTAs at 48px are more trustworthy for thumbs and slightly denser in the navy bar — watch wrap on mid-width tablets. Meet Kelly remains text-heavy beside a strong portrait; the imbalance is editorial as much as visual. Page heroes on inner routes got a slightly tighter clamp so mobile titles feel less oversized — good.

Government That Works cards still look like four siblings of the same family. That is consistency; it is also a little monotonous. Photography bands break the monotony; text cards do not.

---

## Candidate Presence Review

Yes — with a caveat.

Kelly feels present when media is doing the work: speaking (primary video), showing up (Across Arkansas), listening and working (photo band), qualifying herself in compressed prose (Meet Kelly / `/about`). She does **not** feel present on Endorsements (empty) or News (often empty). That is honesty, not absence of brand — but a voter who never plays video and skims photos will meet less of her than the site intends.

Presence is evidence-based, not name-density. Keep it that way.

---

## Arkansas Review

Mostly yes. Mena, Conway / Toad Suck, Clarksville peach festival, Cave City watermelon, Little Rock stadium, Hot Springs Village video — these are not generic swing-state stock. Filings, clerks, 75 counties, and Capitol stewardship are Arkansas-shaped office talk.

Risk of “any campaign in America”: hero gradient + gold CTAs + empty endorsements could read template if the trail media failed to load. With media on, the place specificity holds. Without media, lean harder on Government That Works and confirmed geography in copy — which we already do conservatively.

---

## Things that still bother me

- Meet Kelly still feels like a reading assignment between two visual acts.  
- Four Government That Works cards are competent and visually samey.  
- “Explore … →” text links still feel like docs, not campaign leadership.  
- Empty endorsements are honest and emotionally cold.  
- Homepage photo captions are accurate and sometimes emotionally flat.  
- Header action cluster at 48px may crowd mid-width layouts.  
- Production build was not proven green in a quiet window this pass — release confidence lags experience confidence.  
- Netlify remains a platform story sitting next to a site that already feels launch-shaped locally.

---

## If we had four more hours…

Highest-impact remaining improvements:

1. **Quiet production build + `next start` HTTP proof** — close the release gap without touching design.  
2. **Meet Kelly visual balance** — not more biography; better crop/scale rhythm so the band doesn’t feel like homework after video.  
3. **One confirmed endorsement with source** *or* leave empty and soften the band’s emotional temperature without inventing logos.  
4. **Re-check mid-width header wrap** after 48px CTA bump.  
5. **One additional confirmed-geography trail still** if Steve has an approved frame waiting.

Do not spend those hours inventing sections or rewriting the frozen narrative.

---

## If I were introducing this website to Kelly tonight

**Proud of:**

1. The site no longer asks voters to fall in love with a life story before they understand the office.  
2. Trail photography and sequenced video carry human proof better than slogans.  
3. Chrome, taps, and focus now feel like one serious statewide campaign rather than a kit of parts.

**Still want to improve before launch:**

1. Prove a clean production build and keep Netlify from defining “done.”  
2. Soften the Meet Kelly text weight relative to surrounding media.  
3. Get either one real endorsement with context — or accept emptiness and make that honesty feel intentional rather than unfinished.

---

## Technical appendix (evidence only)

| Gate | Result |
| --- | --- |
| Typecheck | PASS |
| Visual polish / 48h / message / connected tests | PASS |
| Quiet-server primary crawl | 16/16 including `/contact`, `/voter-registration` |
| Screenshots | `H:/SOSWebsite/.local/temp/launch-qa-screenshots/` |
| Production build | Not confirmed (hung under H: contention earlier) |
| Netlify | Separate platform blocker |

**Exact change themes:** `trustFunnelChrome` CTAs/cards; hero CTA alignment; header/footer/social tap targets; focus-visible skip link; calmer ScrollReveal; photo object-position; voter-registration Prisma degrade; thin `/contact`; scoreboard report + this experience review doctrine.
