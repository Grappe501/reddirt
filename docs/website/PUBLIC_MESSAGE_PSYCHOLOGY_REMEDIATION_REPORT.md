# Message psychology remediation — BUILD RETURN

**Pass:** `KELLY-PUBLIC-MESSAGE-PSYCHOLOGY-REMEDIATION-1.0`  
**Status:** PARTIAL  
**Date:** 2026-07-28

## 1. Starting branch and commit

- Branch: `feature/kelly-schedule-settlement-dashboard`
- Starting commit: `887527c3`

## 2. Exact files changed

- `src/content/about/about-launch.ts`
- `src/app/(site)/about/page.tsx`
- `src/content/home/trust-funnel-home.ts`
- `src/components/home/trust-funnel/TrustFunnelFinalActionSection.tsx`
- `src/content/about/across-arkansas-journey.ts`
- `src/content/website/priorities-launch.ts`
- `src/app/(site)/about/journey/page.tsx`
- `src/app/(site)/campaign-photos/page.tsx`
- `src/app/(site)/kelly-speaks/page.tsx`
- `src/app/(site)/get-involved/page.tsx`
- `src/content/media/campaign-photo-registry.ts` (AFL-CIO caption/endorsement claim)
- `src/content/media/public-media-collections.ts`
- `docs/website/PUBLIC_MESSAGE_PRECISION_AUDIT.md` (new)
- `docs/website/PUBLIC_CORE_MESSAGE_MAP.md` (new)
- `docs/website/PUBLIC_MESSAGE_PSYCHOLOGY_REMEDIATION_REPORT.md` (this file)
- `scripts/test-message-psychology-remediation.ts` (new)
- `package.json` (npm script)

## 3. Public message precision audit

`docs/website/PUBLIC_MESSAGE_PRECISION_AUDIT.md` — full route × section table with Keep/Cut/Rewrite/Status.

## 4. Homepage psychological sequence

Recognition (hero) → Relevance/Competence (Government That Works) → Authenticity (primary video) → Character/Competence (Meet Kelly) → Evidence (Across Arkansas + photos) → Trust shell (endorsements) → Momentum (news) → Agency (final action).

## 5. Homepage copy reductions

- Hero support tightened to calm competence (25w).
- Meet Kelly rebuilt as three paragraphs (~154w); CTA → “Read About Kelly’s Experience”.
- Primary video frame shortened (no pre-explain).
- Across Arkansas method language; removed statewide romance.
- Final CTA hierarchy: Join → Volunteer → Priorities (+ Donate last).

## 6. `/about` before-and-after structure

**Before:** Opening + “Her story” memoir chapters + Why SoS + Leadership + Across AR + soft Values + “Continue the story”.  
**After:** Opening (100–140) → Experience That Prepared Her → Why SoS → How Kelly Leads → Across AR (short) → What She Will Bring → three onward CTAs.

## 7. Personal-story content removed

- Chronological / family memoir framing on `/about` main spine
- “Continue the story” / “Read Kelly’s Story” CTA language on primary paths
- Soft “What guides her” virtue block without office linkage
- Across Arkansas momentum / “across the state” exaggeration

## 8. Relevant biography content retained

- Telecom operations (~25 years Alltel/Verizon)
- Stand Up Arkansas / LEARNS petition organizing
- Forevermost / small-market filer experience
- Rose Bud life context (one sentence, purpose-bound)
- Equal service for 75 counties; office limits honesty

## 9. Unsupported claims removed or flagged

- AFL-CIO endorsement claim removed from public caption/SEO/extended; notes gate to `/endorsements`
- Endorsements pages remain empty-honest

## 10. Repetition removed across routes

- Message map: `docs/website/PUBLIC_CORE_MESSAGE_MAP.md`
- Priorities closing no longer duplicates video CTA + memoir CTA
- Journey points to Experience, not full story

## 11–15. Priority / journey / video / captions / CTAs

See audit table; journey intro 84w; video intros shortened; homepage captions tightened; CTA hierarchy updated.

## 16. Route-purpose map

As authorized in the brief (unchanged intent; copy aligned).

## 17. Core-message consistency map

`docs/website/PUBLIC_CORE_MESSAGE_MAP.md`

## 18. Final word counts by section (verified by test)

| Surface | Words |
| --- | --- |
| Hero body | 25 |
| Meet Kelly total | 154 |
| About opening | 107 |
| About full (copy modules) | 702 |
| Journey intro | 84 |

## 19–21. Screenshots

**Not completed this pass** — remaining launch blocker.

## 22. Accessibility proof

**Not re-run this pass** — copy-only changes; prior a11y work not invalidated by design.

## 23–25. Route crawl / broken links / forms

**Not completed this pass** — defer to final launch QA. Phase 1C / connected-page form destination invariants still green via existing tests.

## 26. Typecheck

PASS (`npm run typecheck`)

## 27. Tests

- `agents:test-message-psychology-remediation` PASS
- `agents:test-homepage-48h-launch-sprint` PASS
- `agents:test-connected-pages-launch-pass` PASS

## 28–29. Local production build / HTTP

**Not completed this pass** (message remediation prioritized).

## 30. Netlify status

Unchanged: production `kgrappe` Lambda deploy blocked; separate from this copy pass. See `docs/website/PUBLIC_SITE_LAUNCH_STATUS.md`.

## 31. Remaining launch blockers

1. Desktop/tablet/mobile screenshot review  
2. Local production build + HTTP proof  
3. Full route crawl + broken-link check  
4. Form smoke / a11y re-check  
5. Netlify production path  
6. Confirmed endorsements (content)  
7. Transcripts / Shorts inventory (media)

## 32–33. Git

Filled at commit time.

## 34. Recommendation

**MESSAGE REMEDIATION REQUIRED** is cleared for copy/psychology.  
**READY FOR FINAL LAUNCH QA** for remaining technical gates (screenshots, build, crawl, Netlify).
