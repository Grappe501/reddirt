# Website Content Integrity Audit

**Lane:** `RedDirt/`  
**Date:** 2026-06-10  
**Scope:** Public-facing site overhaul — real content or clearly marked pending only  
**Out of scope (unchanged):** Victory OS doctrine, `victory-map-v1.json`, Decision Engine, Mission Generator, calendar logic, campaign scoring, admin Path to Victory button

**Homepage as-built (2026-07-28):** [`HOMEPAGE_CURRENT_STATE_ASSESSMENT.md`](./HOMEPAGE_CURRENT_STATE_ASSESSMENT.md) — trust-funnel is live canon; Ernie forward plan in [`HOMEPAGE_FORWARD_PLAN.md`](./HOMEPAGE_FORWARD_PLAN.md).

---

## Summary

Public homepage and core pages were restructured for trust, clarity, and campaign professionalism. Unsupported marketing (fake voter quotes, unsourced résumé bullets on homepage, detailed unapproved policy pillars) was removed or gated behind integrity labels.

---

## Pages changed

| Route | Change | Primary classification |
|-------|--------|------------------------|
| `/` (homepage) | Restructured trust-funnel wireframe: hero, office explainer, Meet Kelly, Invite Kelly, Get Involved, events (verified only) | Mixed: generic civic + real CTAs |
| `/about` | Draft-manuscript notice when biography depth &lt; 4 | Placeholder pending |
| `/priorities` | Replaced long policy essay with four framework pillars, all marked pending | Placeholder pending |
| `/schedule` | Invite/share-event copy aligned to real form workflow | Real sourced (form exists) |
| `/events/request` | Lead copy simplified — no staged-politics claims | Real sourced |
| `/stories` | Illustrative archive hidden; submission form retained | Hidden + real form |
| `/get-involved` | Unchanged structure (forms, real actions) | Real sourced |

---

## Placeholder content

| Location | Label | Notes |
|----------|-------|-------|
| `/priorities` — all four pillars | Content pending campaign approval | Elections, Business Services, Transparency, Civic Participation framework only |
| `/about` — manuscript banner | Draft section — not public-ready | Shown when `PUBLIC_BIOGRAPHY_DEPTH` &lt; 4 |
| `/` — Meet Kelly band | Draft section — not public-ready | Long-form chapters not on public site |
| `/stories` | Source needed before publication | `PUBLIC_ILLUSTRATIVE_STORIES_ENABLED = false` |
| `HomeAcrossArkansasVoices` (legacy home sections) | Source needed before publication | Fake quote cards removed from `storyPreviews` |

---

## Sections hidden (missing source)

| Content | Reason | Restore when |
|---------|--------|--------------|
| Homepage résumé bullets (Verizon 800+, LEARNS, Sherwood HQ) | Specific claims belong on Meet Kelly after campaign approval — not repeated on homepage | Campaign approves résumé copy for homepage or `/about` essays |
| `storyPreviews` fake voter quotes | Invented testimonials | Real verified stories submitted and approved |
| `src/content/stories/*` illustrative archive | Composite neighbor voices — not verified | Set `PUBLIC_ILLUSTRATIVE_STORIES_ENABLED = true` after per-story approval |
| Priorities page detailed policy grids (training kits, FOIA library, dark money, etc.) | Unapproved platform detail | Campaign leadership locks office priorities copy |

---

## Content needing campaign approval

1. **Meet Kelly `/about` essays** — KellyFullStory and `/about/[slug]` chapters (depth 3) still contain career and civic claims; verify before paid media.
2. **Why Kelly `/about/why-kelly`** — election-administration framing; internal verification notes in source file.
3. **Office area pages** (`/office/*`) — may still reference Verizon/LEARNS in layer copy; not changed in this pass.
4. **Priorities framework** — replace placeholders with approved positions.
5. **Illustrative stories** — enable flag only with sourced submissions.

---

## Classification by page (public sentences)

### Homepage `/`

- **Real sourced:** Kelly Grappe candidacy framing, donate/volunteer/invite/form links, published events when calendar returns rows
- **Generic civic:** Office explainer cards (elections, business, records, capitol)
- **Placeholder pending:** Meet Kelly band note about draft manuscript
- **Removed:** Competence bullets (Verizon 800+, call center), listening bullets (LEARNS/Sherwood specifics), fake voter story cards

### `/priorities`

- **Placeholder pending:** Entire detailed policy page replaced by framework
- **Removed:** Opponent contrast paragraphs, unverified platform commitments

### `/schedule` + `/events/request`

- **Real sourced:** Existing `ScheduleCampaignEventForm` and invite pathway; staff-review disclaimers

### Navigation

- **Real sourced:** Added `/schedule` under Events and Get Involved
- **Not added:** No public link to `/admin/mission-brief`

---

## Admin (unchanged)

- Path to Victory button remains at `/admin/ai-command-center` → `/admin/mission-brief` (doctrine-locked placeholder)
- No Victory OS doctrine exposed on public routes

---

## Validation

- `npm run typecheck` — pre-existing Victory OS errors in unrelated modules; verify no new errors in website files on commit
- `npm run check` / full build — blocked by pre-existing typecheck failures outside this slice

---

## Files touched (website slice)

- `src/content/website/content-integrity.ts` (new)
- `src/components/content/ContentPendingBadge.tsx` (new)
- `src/content/home/trust-funnel-home.ts`
- `src/components/home/HomeTrustFunnelWireframe.tsx`
- `src/components/home/trust-funnel/TrustFunnelHero.tsx`
- `src/components/home/trust-funnel/TrustFunnelMeetKellySection.tsx` (new)
- `src/components/home/trust-funnel/TrustFunnelInviteKellySection.tsx` (new)
- `src/components/home/HomeAcrossArkansasVoices.tsx`
- `src/content/homepage.ts`
- `src/content/events/invite-kelly.ts`
- `src/config/navigation.ts`
- `src/lib/content/public-catalog.ts`
- `src/app/(site)/priorities/page.tsx`
- `src/app/(site)/schedule/page.tsx`
- `src/app/(site)/about/page.tsx`
- `src/app/(site)/stories/page.tsx`
- `docs/website/WEBSITE_CONTENT_INTEGRITY_AUDIT.md` (this file)
