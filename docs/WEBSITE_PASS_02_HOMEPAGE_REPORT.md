# Website Pass 02 — Homepage conversion upgrade

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Depends on:** `docs/WEBSITE_PASS_01_NAVIGATION_REPORT.md` (nav + default CTAs)

---

## 1. Mission

Turn `/` into a **clear front door into the organizing system**: Power of 5, statewide organizing intelligence, county command surfaces, and the volunteer message hub—without new dependencies, without public “AI” wording, and reusing existing primitives where possible.

---

## 2. Section map (above the fold → close)

| # | Section | Implementation |
|---|---------|----------------|
| 1 | **Hero — people-powered organizing** | `HomeHeroSection` + merged `hero` from `getMergedHomepageConfig()` (`homepage-merge.ts` defaults). Headline pattern: “People-Powered” + gold “Organizing”; subtitle points at statewide field work. In-panel tagline: “Neighbor to neighbor—that’s how Arkansas wins.” |
| 2 | **Three pathways** | `HomePathwayGateway.tsx`: **Build your five** (onboarding + prompts), **See your county** (OIS + workbench), **Bring this to your community** (get involved + optional scroll to “more ways to help” + sample dashboard link). |
| 3 | **Power of 5 explainer** | `HomeOrganizingConversionBand.tsx` — three `PowerOf5StepCard` blocks + CTAs to onboarding and `/organizing-intelligence`. |
| 4 | **County dashboard preview** | Same band — `CountyKpiCard` strip (demo/seed) inside `countyDashboardCardClass` container; links to Pope v2 gold sample and `/counties`. |
| 5 | **Conversations & Stories preview** | Same band — first three `storyPreviews` from `src/content/homepage.ts`; primary CTA to `/messages`. |
| 6 | **Trust / privacy promise** | Same band — `FullBleedSection` `ink-band`; reuses `TRUST_RIBBON_ITEMS` copy + links to `/privacy`, `/terms`, `/disclaimer`. |
| 7 | **Final CTA** | `CTASection` + merged `finalCta` (Power of 5 + county dashboard, overridable in admin). |
| — | **Get involved (retained)** | `HomeGetInvolvedSection` still renders after the conversion band via `afterGateway` in `HomeExperience`. |

**Removed from the arrival stack:** `HomeTrustRibbonSection` between hero and pathways (its themes now appear in the trust/privacy band). The component file remains for reuse elsewhere.

---

## 3. Components reused

- `HomeHeroSection`, `HomePathwayGateway`, `HomeJourneyShell`, `HomeExperience`, `HomeGetInvolvedSection`, `HomeDonateFloatingGate`
- `PowerOf5StepCard` (`@/components/onboarding/power-of-5`)
- `CountyKpiCard`, `countyDashboardCardClass` (`@/components/county/dashboard`)
- `CTASection`, `FullBleedSection`, `ContentContainer`, `FadeInWhenVisible`
- Content: `storyPreviews`, `TRUST_RIBBON_ITEMS`
- Config: `powerOf5OnboardingHref`, `countyDashboardSampleHref` (`navigation.ts`)

---

## 4. Files touched

| File | Change |
|------|--------|
| `src/components/home/HomeOrganizingConversionBand.tsx` | **New** — sections 3–7. |
| `src/components/home/HomeExperience.tsx` | Injects conversion band into `trailBand` before any optional `trailBand` prop. |
| `src/components/journey/HomeJourneyShell.tsx` | Drops trust ribbon from arrival; hero → pathways only. |
| `src/components/journey/HomePathwayGateway.tsx` | Three organizing pathways; `Link` for primary routes; optional `beat-act` scroll. |
| `src/components/home/sections/HomeHeroSection.tsx` | Callout line updated for organizing tone. |
| `src/lib/content/homepage-merge.ts` | Default hero + `finalCta` copy aligned with conversion mission. |
| `src/content/home/journey.ts` | Beat copy for arrival updated. |
| `src/app/(site)/page.tsx` | Home meta description emphasizes organizing routes; unused `siteConfig` import removed. |
| `docs/WEBSITE_PASS_02_HOMEPAGE_REPORT.md` | This report. |

---

## 5. Public wording guardrails

- No “AI” / artificial-intelligence branding on these surfaces.
- County preview and message hub call out **demo / seed** where appropriate (consistent with Pass 1 and hub pages).

---

## 6. Verification

From `RedDirt/`:

```bash
npm run check
```

(Lint + `tsc --noEmit` + `next build`.)

---

## 7. Follow-ups (not in this pass)

- If DB-backed `homepageConfig` overrides hero/final CTA, production may show older copy until admin homepage is saved or reset (same caveat as Pass 1).
- Optional: restore a **compact** pre-pathways credibility strip if analytics show the page needs earlier “proof” without scrolling.
- When additional counties publish v2 shells, add a second preview card or rotate the sample county callout.
