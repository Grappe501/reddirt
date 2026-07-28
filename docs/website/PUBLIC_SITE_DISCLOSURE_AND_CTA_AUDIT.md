# Public site disclosure & CTA audit

**Pass:** `KELLY-PUBLIC-CONNECTED-PAGES-LAUNCH-PASS-1.0`  
**Date:** 2026-07-28  
**Lane:** RedDirt  

Rule: INLINE | EXPAND | LINK | REMOVE — one-sentence expansions prohibited except narrow legal/a11y cases.

---

## Disclosure audit

| Route | Section | Current control label | Hidden content | Decision | Replacement | Destination | Reason | Status |
|-------|---------|----------------------|----------------|----------|-------------|-------------|--------|--------|
| `/` | Live trust-funnel | — | none | — | Keep INLINE | — | No Read More on live home | DONE |
| `/` | Transcript (when published) | Read the transcript | Full transcript | EXPAND | Keep `<details>` | Video feature/card | Meaningful depth | DONE |
| `/` | Orphan OfficeExplainer | A bit more detail | ~1 sentence | REMOVE | Stay unmounted | — | One-sentence expand prohibited | DONE |
| `/about` | Launch narrative | — | none | INLINE | Full sections visible | Chapters via LINK | No draft badges | DONE |
| `/about/journey` | Prior arcs | ContentPendingBadge | Status labels | REMOVE | Replaced with trail video + photos | `/about/journey` | Pending badges removed from launch surface | DONE |
| `/priorities` | Prior framework cards | ContentPendingBadge | “pending” | REMOVE | Full pillars INLINE | `/office/*` LINK | Authority-clear substance | DONE |
| `/direct-democracy` | Circulating initiatives | `<details>` | Initiative detail | EXPAND | Keep | — | Meaningful depth | OPEN (verify copy) |
| `/volunteer/resources/faq` | FAQ | `<details>` | Answers | EXPAND | Keep | — | FAQ pattern OK | OPEN |
| `/kelly-speaks/[slug]` | Transcript | Read the transcript | Full | EXPAND | Keep | — | A11y | DONE |
| `/updates` | Placeholder card | — | “on the way” | LINK | Channel map | `/from-the-road`, `/press-coverage`, `/events` | No filler cards | DONE |
| `/endorsements` | Empty state | — | Honest empty | INLINE | Keep empty until confirmed | — | No invented logos | DONE |

---

## CTA language audit (launch-critical)

| Route | Old / generic | New preferred | Status |
|-------|---------------|---------------|--------|
| `/` hero | Meet Kelly / Join the Campaign | Keep specific | DONE |
| `/` photos | Kelly Across Arkansas | View Campaign Photos | DONE |
| `/` endorsements | — | Endorsement policy → `/endorsements` | DONE |
| `/about` close | Get involved / Email | Watch Kelly’s Message, Explore Priorities, Join | DONE |
| Footer | Volunteer sign-up (mailto via join) | Volunteer with Kelly → `getVolunteerSignupHref()` | DONE |
| Header Volunteer | getVolunteerSignupHref | Aligned with homepage | DONE |
| `/priorities` | Learn more / Why Kelly | Understand the office, Read Kelly’s Story, specific next actions | DONE |
| `/voter-registration` | Learn More | Prefer Check Your Voter Registration (verify on page) | OPEN |
| Donate | Floating gate | Still env-gated off; `/donate` intentional | DONE |

---

## Notes

- Homepage outgoing CTAs now prefer specific verbs (story, message, priorities, photos, volunteer).
- Connected-page pass continues OPEN rows on DD FAQ expanders and voter-registration CTA polish in follow-up.
