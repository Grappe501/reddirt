# Campaign Experience Review — reporting doctrine (locked)

**Status:** LOCKED — 2026-07-28 (final-phase amendments: proof chains, Trust Ledger, hesitation mindset)  
**Applies to:** Public polish / launch-confidence phases (after architecture and message doctrine are frozen)  
**Does not replace:** Scoreboards, crawl logs, or typecheck evidence — those remain in an appendix  
**Supersedes for polish reports:** Short `BUILD RETURN` / PASS-FAIL-only summaries as the primary deliverable

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

## Guiding question

> Would an undecided Arkansas voter trust it?

---

## Who Burt is when reporting

Report as Creative Director, UX Lead, QA Lead, and Release Manager — with Campaign Manager, Editorial, Accessibility, and Arkansas Voter lenses as needed.

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

Examples:

| Claim | Proof | Outcome |
| --- | --- | --- |
| Kelly listens to Arkansans | Mena photo · Hot Springs Village video · `/about/journey` | Visitor believes the listening claim |
| Kelly has earned broad support | AFL-CIO · AEA · Progressive Arkansas Women PAC · Josh Irby | Visitor understands the coalition |
| Kelly understands the office | Government That Works · `/priorities` · authority limits | Visitor believes competence |

If a claim lacks a proof chain, question it or remove it.

---

## Required narrative sections

### 1. Executive Summary  
### 2. Visitor Journey Review  
### 3. Psychological Review  
### 4. Media Review (large) — include “does every asset earn its place?”  
### 5. Copy Review  
### 6. Visual Review  
### 7. Candidate Presence Review  
### 8. Arkansas Review  
### 9. Things that still bother me  
### 10. The Three Hardest Decisions  
### 11. If we had four more hours…  
### 12. Campaign Manager Eye  
### 13. Trust Ledger (standing)

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

### 14. Kelly first-look (required closer)

> If I were introducing this website to Kelly for the first time tonight, what three things would I be proud of, and what three things would I still want to improve before launch?

---

## Appendix (keep short)

Branch / commits / push · scoreboard · typecheck / tests / crawl / screenshots / build / Netlify · files changed.

---

## Related locks

- [`PUBLIC_SITE_EDITORIAL_DOCTRINE.md`](./PUBLIC_SITE_EDITORIAL_DOCTRINE.md)  
- [`PUBLIC_MESSAGE_PRECISION_AUDIT.md`](./PUBLIC_MESSAGE_PRECISION_AUDIT.md)  
- [`PUBLIC_CORE_MESSAGE_MAP.md`](./PUBLIC_CORE_MESSAGE_MAP.md)  
- [`confirmed-endorsements.ts`](../../src/content/website/confirmed-endorsements.ts)  
