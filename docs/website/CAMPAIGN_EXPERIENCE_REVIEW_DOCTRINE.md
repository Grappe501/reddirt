# Campaign Experience Review — reporting doctrine (locked)

**Status:** LOCKED — 2026-07-28 (craftsmanship phase)  
**Applies to:** Public polish / launch-confidence phases (after architecture and message doctrine are frozen)  
**Does not replace:** Scoreboards, crawl logs, or typecheck evidence — those remain in an appendix  
**Supersedes for polish reports:** Short `BUILD RETURN` / PASS-FAIL-only summaries as the primary deliverable

---

## Launch Principle (put at the top of every remaining review)

> **When faced with a choice between saying more and proving more, prove more.**

The site should convince through competence, transparency, and authenticity — not volume.

---

## Final 48-hour filter (locked)

> **Every pass must make the site easier to trust, easier to understand, and easier to use—without making it bigger.**

If a change does not improve trust, understanding, or usability, it probably should not make the release.

---

## Final launch mindset (locked)

Stop asking:

> What else can we add?

Start asking:

> **What would make a careful voter hesitate?**

Hunt and remove hesitations one by one: missing dates, generic wording, awkward spacing, repeated phrases, weak crops, unclear CTAs, unsupported statements. Polish without enlarging.

---

## Hesitation hunt (required every remaining pass)

Every Campaign Experience Review must list:

### Top three hesitations removed
### Top three hesitations remaining

Create a visible trend toward launch readiness. Do not hide remaining risk behind a green status.

---

## Guiding question

> Would an undecided Arkansas voter trust it?

---

## Who Burt is when reporting

Report as Creative Director, UX Lead, QA Lead, and Release Manager — with Campaign Manager, Editorial, Accessibility, and Arkansas Voter lenses as needed. During craftsmanship phase, also apply a **Reporter** lens (see below).

---

## Permission to critique own work

Name what does **not yet feel campaign-ready**. Candid self-assessment is where quality gains come from.

---

## Four questions every report must answer

1. **What did I notice?**  
2. **Why does it matter to a voter?**  
3. **What exactly changed?**  
4. **What still doesn’t feel right?**  

---

## Required document title

```text
CAMPAIGN EXPERIENCE REVIEW
```

---

## Endorsement presentation locks

1. **Coalition before categories** — First communicate: *Kelly is earning support from organizations and leaders who serve different parts of Arkansas.* Categories support that idea; visitors remember the coalition more than the labels.  
2. **Cards answer Why (quietly)** — Not campaign praise. Short factual context so unfamiliar voters understand why the endorsement matters.  
3. **Endorsement standards note** — Every `/endorsements` page includes a brief campaign endorsement policy.  
4. **Photos never imply what they don’t document** — Meeting ≠ endorsement announcement. Caption that distinction whenever moments differ.

---

## Proof chains (standing review tool)

Every major campaign claim needs a supporting chain:

**Claim → Proof (media / routes / records) → Outcome (what the visitor should believe)**

If a claim lacks a proof chain, question it or remove it.

---

## Media ledger (when media is reviewed)

For each image/video under review, ask:

> If I could only keep this media or remove it, which choice would produce the stronger site?

| Asset | Purpose | Keep | Replace Later |
| --- | --- | --- | --- |
| (id / route) | (core message reinforced) | ✅ / ⚠️ / ❌ | notes |

Nothing stays merely because it is available.

---

## Reporter pass (when transparency is reviewed)

Ask:

> If a reporter visited tonight to write an article, what questions would still require an email or phone call?

Those gaps are opportunities for transparency without promotional content (e.g. announcement dates, press contact, media kit, approved downloadable photos).

---

## Required narrative sections

### 1. Launch Principle + Executive Summary  
### 2. Visitor Journey Review  
### 3. Psychological Review  
### 4. Media Review (large) — include “does every asset earn its place?” and media ledger when applicable  
### 5. Copy Review  
### 6. Visual Review / Consistency audit notes  
### 7. Candidate Presence Review  
### 8. Arkansas Review  
### 9. Hesitation hunt — top 3 removed / top 3 remaining  
### 10. Things that still bother me  
### 11. The Three Hardest Decisions  
### 12. If we had four more hours…  
### 13. Campaign Manager Eye  
### 14. Trust Ledger  
### 15. Kelly first-look (required closer)

> If I were introducing this website to Kelly for the first time tonight, what three things would I be proud of, and what three things would I still want to improve before launch?

---

## Trust Ledger (standing)

| Item | Status |
| --- | --- |
| Unsupported claims removed | ✅ / ⚠️ / ❌ |
| Media accurately captioned | |
| Endorsements confirmed only | |
| Unknown dates left blank | |
| Unknown locations not inferred | |
| Office authority accurately described | |
| Testimonial accuracy (no invented praise) | |
| Remaining verification needed | (list) |

---

## Appendix (keep short)

Branch / commits / push · scoreboard · typecheck / tests / crawl / screenshots / build / Netlify · files changed.

---

## Related locks

- [`PUBLIC_SITE_EDITORIAL_DOCTRINE.md`](./PUBLIC_SITE_EDITORIAL_DOCTRINE.md)  
- [`REMAINING_LAUNCH_CRAFTSMANSHIP_BOARD.md`](./REMAINING_LAUNCH_CRAFTSMANSHIP_BOARD.md)  
- [`PUBLIC_MESSAGE_PRECISION_AUDIT.md`](./PUBLIC_MESSAGE_PRECISION_AUDIT.md)  
- [`PUBLIC_CORE_MESSAGE_MAP.md`](./PUBLIC_CORE_MESSAGE_MAP.md)  
- [`confirmed-endorsements.ts`](../../src/content/website/confirmed-endorsements.ts)  
