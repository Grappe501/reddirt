# Kelly SOS — Day 2 public polish & QA report

**Date:** 2026-04-26  
**Sprint:** Kelly Grappe for Arkansas Secretary of State — Day 2

## Route coverage note (RedDirt vs checklist)

Some routes from the Day 2 prompt exist on **`sos-public`**, not in **`RedDirt`**. This repo maps as follows:

| Requested route | In RedDirt? | Actual / equivalent |
|-----------------|------------|---------------------|
| `/` | Yes | `/` |
| `/about` | Yes | `/about` (nav label “Meet Kelly” → `/about`) |
| `/meet-kelly` | **No** | Use **`/about`** and “Meet Kelly” nav group |
| `/priorities` | Yes | `/priorities` |
| `/get-involved` | Yes | `/get-involved` |
| `/donate` | Yes | `/donate` |
| `/volunteer` | **No** (dedicated page) | **`/get-involved#volunteer`** or `getJoinCampaignHref()` |
| `/contact` | **No** (dedicated page) | **`/get-involved#join`**, mailto via `getContactMailto()`, footer |
| `/county-clerks` | **No** | **`/counties`**, **`/voter-registration`**, explainers |
| `/elections` | **No** | **`/events`**, **`/voter-registration`**, editorial/explainers |
| `/ballot-access` | **No** | **`/direct-democracy`**, **`/direct-democracy/ballot-initiative-process`** |
| `/voting-rights` | **No** | **`/priorities`**, **`/civic-depth`**, **`/explainers`** |
| `/counties` | Yes | `/counties` |
| `/county-briefings/pope` | Yes | `/county-briefings/pope` |
| `/voter-registration` | Yes | `/voter-registration`, `/voter-registration/assistance` |
| `/events` | Yes | `/events` |
| `/blog` | Yes | `/blog` (writing hub) |

## Route-by-route QA table

| Route | Headline / first screen | CTA | Mobile | A11y / notes | Launch status | Files touched (Day 2) |
|-------|-------------------------|-----|--------|--------------|---------------|----------------------|
| `/` | Strong journey/home | Donate/volunteer/nav | OK baseline | Header shim pattern | needs polish (content QA) | — |
| `/about` | Kelly story | Get involved | OK | — | needs polish | — |
| `/priorities` | Office priorities + new accountability section | Get involved, visit, explainers | OK | New copy block | **improved** | `(site)/priorities/page.tsx` |
| `/get-involved` | Volunteer + join forms | Forms, donate elsewhere | OK | Forms present | ready | — |
| `/donate` | Donate narrative | External GoodChange | OK | — | ready | — |
| `/counties` | County hub | Data-dependent | OK | DB for list | data-dependent | — |
| `/county-briefings/pope` | Pope briefing | kellygrappe.com link | OK | Removed jargon | **improved** | `county-briefings/pope/page.tsx` |
| `/voter-registration` | VR center | Links/forms | OK | Graceful DB down | needs polish | — |
| `/events` | Events + suggest | Suggest form | OK | County offline msg | **improved** | `(site)/events/page.tsx` |
| `/blog` | Writing list | Substack | OK | Mirror preview OK | ready | — |
| `/campaign-calendar` | Live calendar | Filters | OK | Filter offline msg | **improved** | `(site)/campaign-calendar/page.tsx` |
| `/campaign-calendar/[slug]` | Event detail | RSVP patterns | OK | Error copy | **improved** | `(site)/campaign-calendar/[slug]/page.tsx` |
| `/local-organizing/[slug]` | Regional hub | CTAs | OK | Removed “Script 5”, placeholder heading | **improved** | `(site)/local-organizing/[slug]/page.tsx` |
| `/direct-democracy/ballot-initiative-process` | Process explainer | Links | OK | Softer “database” wording | **improved** | ballot-initiative-process `page.tsx` |

## CTA audit

| CTA | Config | Day 2 change |
|-----|--------|--------------|
| Donate | `siteConfig.donateHref` / GoodChange | No URL change (treasurer-owned) |
| Volunteer | `getJoinCampaignHref()` → `/get-involved#volunteer` default | None |
| Join / stay connected | `/get-involved#join` | None |
| Substack | `getCampaignBlogUrl()` | None |
| Social | `getPublicSocialLinks()` | None |
| Mobile drawer | “Get involved on this site” | **Fixed** label (was “Command HQ · this site”) |

## Mobile / accessibility

- Mobile header: **`min-h-11`** on Volunteer, Donate, Search, Menu (better tap targets).
- Map markers: CSS class renamed **`sos-leaflet-pin`** (no “reddirt” in public DOM class for pins).

## Remaining public polish (honest)

- **`(site)` JSX comments** still contain `TODO(Script 5)` — **not rendered** to users; remove in a future cleanup pass if desired.
- **Blog** `INTERNAL_MIRROR_TODO` is an enum value; **user-visible** text is already voter-safe (“preview… read on Substack”).
- **Full mobile pass** on every long page not completed—Day 2 focused on header + RD-1 strings.
- **Opposition specifics:** Priorities now frame accountability vs. insider shortcuts; **line-item bill attacks** belong in editorial/intel with citations—**not** added as unverified lists on `/priorities`.

## Day 2 add-on: strategic content system (2026-04-26)

**Scaffolding (not a full site theming pass):** research docs, `src/content/strategicThemes/*`, `src/content/events/tentativeExternalEvents.ts`, integration + snippet docs. **EHC / opponent intel** is **not** merged into the public `events` feed.

| Deliverable | Path / note |
|-------------|-------------|
| Rockefeller / reform research | `docs/research/WINTHROP_ROCKEFELLER_REFORM_CAMPAIGN_RESEARCH.md` |
| SOS “keeper of records” (metaphor) | `docs/research/SOS_AS_KEEPER_OF_RECORDS_MESSAGING.md` |
| Opponent record (internal name; public copy remains name-free) | `docs/research/OPPONENT_RECORD_CONTRAST_RESEARCH.md` |
| Fact-check matrix | `docs/legal/OPPONENT_CONTRAST_FACT_CHECK_MATRIX.md` |
| Extension Homemakers intel | `docs/research/ARKANSAS_EXTENSION_HOMEMAKERS_EVENT_INTELLIGENCE.md` |
| Integration plan | `docs/KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md` |
| Safe copy snippets (labeled) | `docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md` |
| Public copy (minimal) | `src/content/home/homepagePremium.ts` (one `FIGHT_FOR` line); `src/app/(site)/about/page.tsx` (PageHero subtitle — keeper-of-records frame) |

**Requires Steve / legal before paid or named contrast:** long Rockefeller quotes, opponent name on site, specific bill-attack lines, EHC as “campaign events.”

**Day 3/4:** editorial wiring, optional priorities/QuoteBand, complete FC matrix with enrolled acts + votes.

## Intentionally not changed

- Admin-only components and workbench copy.
- `sos-public` repo (per hard rules).
- Production Netlify settings.
- `external-campaign.ts` default URLs (no treasurer confirmation to change).
- No merge of `tentativeExternalEvents` into public `events` list.

## Route launch readiness score (subjective)

**~78%** public-facing (up from ~73% program baseline), assuming DB available for dynamic routes.
