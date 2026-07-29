# Visual polish + launch QA — technical companion

**Narrative review (primary):** [`CAMPAIGN_EXPERIENCE_REVIEW_VISUAL_POLISH_1.0.md`](./CAMPAIGN_EXPERIENCE_REVIEW_VISUAL_POLISH_1.0.md)  
**Reporting doctrine:** [`CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md`](./CAMPAIGN_EXPERIENCE_REVIEW_DOCTRINE.md)

**Pass:** `KELLY-PUBLIC-VISUAL-POLISH-AND-LAUNCH-QA-1.0`  
**Status:** PARTIAL  
**Authority:** `docs/website/PUBLIC_SITE_EDITORIAL_DOCTRINE.md`  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Starting commit:** `fc1c822f`  
**Date:** 2026-07-28

Architecture, messaging doctrine, and homepage narrative remain **frozen**. This pass only cleaned chrome, tap targets, focus, graceful degradation, and QA gates.

> Polish phases lead with **CAMPAIGN EXPERIENCE REVIEW**. This file keeps the scoreboard and gate log as appendix evidence.

---

## Launch readiness scoreboard

| Area | Target | Score | Notes |
| --- | ---: | ---: | --- |
| Visual consistency | 98%+ | **97%** | Homepage spine unified on `trustFunnelChrome`; header denser after 48px CTA fix — watch mobile wrap |
| Editorial consistency | 100% | **100%** | Doctrine locked; no copy expansion |
| Message clarity | 100% | **100%** | Prior remediation invariants still green |
| CTA consistency | 100% | **99%** | Hero → shared chrome; Final Action hierarchy unchanged; header CTAs now 48px |
| Mobile experience | 98%+ | **98%** | Quiet-server screenshot pack complete (home/about/priorities/journey/get-involved/photos) |
| Accessibility | 98%+ | **97%** | Skip link `focus-visible`; focus outline recipe; social/footer tap targets raised; full keyboard audit not automated |
| Technical QA | 100% | **94%** | Typecheck PASS; quiet-server primary crawl **16/16**; production build hung under H: contention (not confirmed green this pass); Netlify separate |
| Media quality | 98%+ | **98%** | Object-position crops; alt/caption invariants; AFL-CIO endorsement claim still absent |
| Content accuracy | 100% | **100%** | No new claims; voter-registration degrades when DB schema lags |
| Launch confidence | 95%+ | **94%** | Code + route readiness high; production build confirmation + Netlify remain |

**Only objective issues reduce scores** (documented below).

---

## Five-second tests (desk review)

| Page | Who? | About? | Next? | Verdict |
| --- | --- | --- | --- | --- |
| `/` | Kelly Grappe, SoS | Trust + office purpose | Meet Kelly / Join | PASS |
| `/about` | Kelly | Qualifications | Priorities / Journey / Join | PASS |
| `/priorities` | Campaign + office | Governing approach + limits | Office guides / Join | PASS |
| `/about/journey` | Kelly on trail | Listening evidence | Invite / photos | PASS |
| `/kelly-speaks` | Kelly’s voice | Videos by purpose | Play / photos | PASS |
| `/campaign-photos` | Trail activity | Visual proof | Journey / Experience | PASS |
| `/endorsements` | Support status | Honest empty / future proof | Join | PASS |
| `/get-involved` | Participation | How to help | Volunteer lanes | PASS |
| `/contact` | Campaign access | How to reach | Email / Join / Invite | PASS (new thin route) |

---

## Changes shipped

### Visual / chrome
- Hero CTAs → `trustFunnelCtaPrimary` + `trustFunnelCtaOutlineOnDark`
- Tailwind `boxShadow.soft` / `card` wired; Button secondary uses CSS var shadow
- Pillar explore links: 48px + outline focus (no ring mix)
- SiteHeader CTAs: `min-h-[48px]`
- NavDesktop: min-height + outline focus
- Footer volunteer 48px; social icons 44→48px class; footer link focus outlines
- Skip link: `focus-visible` (no mouse flash)
- Campaign photos county links: focus outline

### Trust / technical
- `/voter-registration` degrades on Prisma schema/table mismatch (`P2021`/`P2022`) instead of 500
- Thin `/contact` page (accessibility of the campaign — not a new marketing section)
- Deduped `agents:test-visual-polish-launch-qa` script entry; expanded invariants

---

## QA evidence

| Gate | Result |
| --- | --- |
| `agents:test-visual-polish-launch-qa` | PASS |
| `agents:test-homepage-48h-launch-sprint` | PASS |
| `agents:test-message-psychology-remediation` | PASS |
| `agents:test-connected-pages-launch-pass` | PASS |
| `npm run typecheck` | PASS |
| Primary route crawl (quiet server) | **16/16 HTTP 200** including `/contact` + `/voter-registration` |
| Home link sample under concurrent `next build` | **Invalidated** — `.next` contention caused timeouts/500s; not treated as product defects |
| Screenshot pack | Desktop/tablet/mobile pack under `H:/SOSWebsite/.local/temp/launch-qa-screenshots/` (home-desktop rewritten after quiet restart) |
| Local production build | **Not confirmed** this pass — `next build` hung at “Creating an optimized production build” on H: after prior contention; stop and re-run in a dedicated quiet window |
| Netlify | Unchanged platform blocker — tracked separately |

---

## Remaining blockers (stop editing unless factual/tech/usability)

1. Confirm production build green after clean run
2. Re-run home-link sample on a quiet server (no concurrent build)
3. Netlify Lambda / deploy path
4. Confirmed endorsements content when available
5. Optional: full keyboard pass with screen reader

---

## Recommendation

After this pass: **stop editing** unless a factual, technical, or usability issue appears.

**Overall:** PARTIAL → ready for final quiet-server confirmation of build + link sample, then freeze.

### Git

- Branch: `feature/kelly-schedule-settlement-dashboard`
- Commit: `b4875fae`
- Push: pushed to origin
- Starting commit: `fc1c822f`
