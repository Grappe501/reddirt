# Campaign Experience Review — reporting doctrine (locked)

**Status:** LOCKED — 2026-07-28 (amended: self-critique + Campaign Manager Eye)  
**Applies to:** Public polish / launch-confidence phases (after architecture and message doctrine are frozen)  
**Does not replace:** Scoreboards, crawl logs, or typecheck evidence — those remain in an appendix  
**Supersedes for polish reports:** Short `BUILD RETURN` / PASS-FAIL-only summaries as the primary deliverable

---

## Final 48-hour filter (locked)

> **Every pass must make the site easier to trust, easier to understand, and easier to use—without making it bigger.**

If a change does not improve trust, understanding, or usability, it probably should not make the release.

---

## Guiding question

We are no longer primarily asking:

> Can we build it?

We are asking:

> Would an undecided Arkansas voter trust it?

---

## Who Burt is when reporting

Report as if speaking to the campaign manager in four hats at once:

1. Creative Director  
2. UX Lead  
3. QA Lead  
4. Release Manager  

Internal lenses (use as needed, stay grounded in what changed):

- Campaign Manager  
- Creative Director  
- UX Designer  
- Editorial Director  
- Accessibility Reviewer  
- QA Lead  
- Arkansas Voter  

---

## Permission to critique own work

Burt has explicit permission — and standing instruction — to critique his own output.

During polish, do not only report what changed. Name what **does not yet feel campaign-ready**: awkward rhythm, weak media, cold empty states, generic CTAs, text that still reads like documentation, visual monotony, or emotional flatness.

Candid self-assessment is often where the biggest quality gains come from.

---

## Four questions every report must answer

1. **What did I notice?**  
2. **Why does it matter to a voter?**  
3. **What exactly changed?**  
4. **What still doesn’t feel right?**  

During polish, “it works” is not enough.

---

## Required document title

```text
CAMPAIGN EXPERIENCE REVIEW
```

Not a bare `BUILD RETURN` as the lead section.

---

## Required narrative sections

### 1. Executive Summary

Three or four paragraphs. Refinement vs expansion. What the voter now receives. What emotional/proof work media is doing. No new claims invented in the summary.

### 2. Visitor Journey Review

Walk the homepage (and key connected pages when touched) as a first-time voter. Time the beats (five seconds, twenty seconds, one minute…). Call out weak steps.

### 3. Psychological Review

For each major section: does it increase **recognition**, **competence**, **trust**, **human connection**, and/or **motivation**? Question sections that move none of these.

### 4. Media Review (large)

Not “added N photos.” Explain selection, emotional anchor, future hero candidates, weak captions, missing visits, and how video functions in sequence (evidence vs introduction).

### 5. Copy Review

What got shorter / clearer; jargon; repetition; weakest paragraph on the site.

### 6. Visual Review

Breathing room, rhythm, text-heavy bands, CTA hierarchy, inconsistency instincts.

### 7. Candidate Presence Review

Does Kelly feel present through evidence — speaking, listening, meeting, explaining, working — not name density?

### 8. Arkansas Review

Does this feel like Arkansas (places, trail, organizations, issues, authentic photography) — or like any US campaign template?

### 9. Things that still bother me

Design instincts, not only bugs. Prefer sharp, specific discomfort. Include critique of work shipped in *this* pass when warranted.

### 10. The Three Hardest Decisions (standing)

For each pass, explain:

1. **What did I intentionally leave alone?** — and why (e.g., no HERO-quality photo available).  
2. **What was the biggest tradeoff?** — what was gained and what was spent.  
3. **What evidence would change my recommendation?** — keep recommendations falsifiable.

### 11. If we had four more hours…

Highest-impact remaining improvements for the final stretch. Not a vague “next slice.”

### 12. Campaign Manager Eye (standing)

A few paragraphs preparing Kelly for a campaign stop. Answer:

- What page would I send a newspaper reporter to first?  
- What page would I text to an undecided voter?  
- What page would I send to a volunteer prospect?  
- What page would I show a county chair?  
- What page best represents Kelly today?  

If the answers are not obvious, say so — that is a product signal.

### 13. Kelly first-look (required closer)

> If I were introducing this website to Kelly for the first time tonight, what three things would I be proud of, and what three things would I still want to improve before launch?

---

## Appendix (keep short)

Technical evidence belongs at the end:

- Branch / commits / push  
- Scoreboard (if used)  
- Typecheck / tests / crawl / screenshots / build / Netlify  
- Exact files changed  

Do not let the appendix replace the narrative.

---

## Related locks

- [`PUBLIC_SITE_EDITORIAL_DOCTRINE.md`](./PUBLIC_SITE_EDITORIAL_DOCTRINE.md)  
- [`PUBLIC_MESSAGE_PRECISION_AUDIT.md`](./PUBLIC_MESSAGE_PRECISION_AUDIT.md)  
- [`PUBLIC_CORE_MESSAGE_MAP.md`](./PUBLIC_CORE_MESSAGE_MAP.md)  
