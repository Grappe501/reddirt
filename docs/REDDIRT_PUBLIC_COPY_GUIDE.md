# RedDirt — public copy & voice guide

**Lane:** RedDirt public site (`src/app/(site)`, shared marketing components)  
**Purpose:** Keep the voter-facing site sounding like a **civic campaign people can trust**—not internal tooling docs.  
**Related:** `docs/RED_DIRT_BUILD_PROTOCOL.md`, `docs/REDDIRT_SITE_AND_ENGINE_FUNNEL_PLAN.md` (strategy; this doc is **voice** only).

---

## Public voice principles

1. **Plain language** — short sentences, concrete nouns, Arkansas examples where it helps.
2. **Warm but serious** — neighbor-to-neighbor tone; no snark, no cynicism, no “inside baseball.”
3. **Movement-oriented** — invite action (host, volunteer, listen, read) without hype.
4. **Arkansas-grounded** — counties, clerks, local rooms, regional honesty.
5. **Clear next steps** — every section should imply what to do next (link, form, or honest “check back”).
6. **Trust-forward** — election administration and public service framed as **steady, fair, explainable**—not performative.

---

## Words & phrases to avoid (public UI)

Avoid on **public pages** (headings, body copy, CTAs, error banners):

| Avoid | Why | Prefer |
|--------|-----|--------|
| Engine, OS, stack, implementation | Developer / product jargon | “how we work,” “this site,” “the campaign” |
| Packet, queue, pipeline (internal sense) | Maintainer language | “next steps,” “plan,” “follow-up” |
| Admin, operator, workbench | Staff tooling | “campaign team,” “organizer,” “field mentor” |
| Synced, mirror mode, internal | Implementation detail | “From Substack,” “preview,” “full essay” |
| Notebook (as product name) | Sounds like a dev diary | “Writing,” “essays,” “Substack” |
| Command center | War-room cliché / insider | “Take a next step,” “ways to go deeper” |
| Ingest, cron, whitelisted, CMS | Ops jargon | “trusted public feeds,” “staff review,” “coming soon” |
| Postgres, port 5433, DATABASE_URL | Breaks the fourth wall | “couldn’t load right now,” “try again” |
| Content engine, operations spine | Org-chart speak | “clear information,” “coordination,” “follow-up” |

**OK in code comments** and **non-user-facing logs**; keep them out of rendered strings.

**Legitimate uses of “administration”** — refers to the **Secretary of State’s role** (election administration, etc.), not “admin panel.”

---

## Approved CTA patterns

- **Volunteer:** “Volunteer sign-up,” “Open volunteer form,” “Join the team.”
- **Donate:** “Donate,” “Support the campaign.”
- **Learn:** “Read priorities,” “Understand the office,” “See updates from the trail.”
- **Host / local:** “Host a gathering,” “Start locally,” “Get involved.”
- **Writing:** “Read on Substack,” “Back to writing,” “Latest posts & updates.”

---

## Page-by-page notes (living doc)

| Area | Notes |
|------|--------|
| **Home hero** | Defaults in `homepage-merge.ts` — keep focus on fair office + 75 counties; CTAs stay action-clear. |
| **Four pathway cards** | `HomePathwayGateway.tsx` — public “chapters” became **sections**; field card stresses trail, not “operation.” |
| **Pathways grid** | `HomePathwaysSection` + `content/homepage.ts` — no “command center”; cards link to real routes. |
| **Movement band** | `HomeMovementSection` — eyebrow is **What guides us**, not “spine.” |
| **Proof / infrastructure band** | `homepagePremium.ts` `PROOF_SECTION` — volunteer + field + clear web + engagement; no “content engine.” |
| **Get involved (home)** | `GET_INVOLVED_SECTION` — welcoming, no “high-trust” stack-up. |
| **From the Road** | Substack framed as **writing**; anchor `#notebook` kept for bookmarks; label reads “Writing.” |
| **Blog** | Titles/eyebrows use **Writing**; no “synced”; mirror-TODO copy is voter-safe. |
| **Stories** | Archive heading names Substack + on-site stories without “permissioned archive.” |
| **Listening sessions** | “What happens next” replaces workbench / admin link on public surface. |
| **Host a gathering** | Support paragraph removes dashboard/admin UI teaser. |
| **Press coverage** | DB fallback message is public; body copy avoids “monitor” as a system name. |
| **Voter registration** | Metrics fallback with no Postgres lecture. |
| **Campaign calendar** | DB error without port numbers. |
| **Festivals (home)** | Empty state points to **events form**, not ingest/workbench. |
| **Nav / footer** | `navigation.ts` — “About Kelly,” “Kelly’s Substack,” “News & action.” |

---

## Future copy backlog

- [ ] Audit **`src/content/**`** long-form (events, toolkits) for “field awareness,” “internal calendar,” “mirror” language where it surfaces publicly.
- [ ] Align **metadata titles** (Notebook → Writing) anywhere else in SEO helpers.
- [ ] If **journey / assistant** surfaces `navLabel` strings to users, re-audit `journey.ts` for “notebook” and dev metaphors.
- [ ] Optional: rename anchor id `#notebook` on From the Road to `#writing` with redirects / in-page aliases (breaking change—coordinate).

---

## Pass history

| Pass | Focus |
|------|--------|
| **Pass 03** | Public copy sweep — homepage funnel, premium sections, blog/trail/stories, listening sessions, DB error strings, nav labels. |

*Update this doc when you ship a copy-changing PR so the next thread doesn’t reintroduce banned terms.*
