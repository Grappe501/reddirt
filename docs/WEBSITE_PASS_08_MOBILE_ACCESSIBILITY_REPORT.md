# Website Pass 08 — Mobile, accessibility, and visual density

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Reads:** `docs/WEBSITE_PASS_07_REGIONAL_PAGES_REPORT.md`; public routes for home, onboarding, county v2, organizing intelligence, regions, `/messages`, `/get-involved`, `/privacy-and-trust`.

---

## 1. Mission

Improve **phone usability** and **accessibility** across the new public organizing surfaces **without** a visual redesign or new dependencies: spacing, overflow, tap targets, contrast, headings, repetitive copy, chart/table readability, dashboard density, and obvious keyboard focus.

---

## 2. Shared primitives

| Addition | Location | Purpose |
|----------|----------|---------|
| `focusRing` | `src/lib/utils.ts` | Consistent `focus-visible` outline (aligned with `globals.css`) for custom links and controls outside `Button`. |
| `tapMinSmCompact` | `src/lib/utils.ts` | ~44px minimum interactive height on small viewports; relaxes at `sm` for dense dashboard toolbars. |

---

## 3. What changed (by surface)

### 3.1 Homepage (`HomePathwayGateway`)

- **Heading hierarchy:** “Choose a pathway” promoted from `p` to **`h2`**; pathway cards remain **`h3`** under the hero **`h1`**.
- **Tap targets + focus:** Primary chapter links, secondary links, and “Jump to more ways to help” **`button`** use `focusRing` and extra vertical padding on narrow screens.

### 3.2 Onboarding (`PowerOf5OnboardingFlow`)

- **Fixed bottom nav:** `padding-bottom` uses `max(0.75rem, env(safe-area-inset-bottom))` for home-indicator safe area.
- **Back / Next / Done:** Larger `min-height` and `min-width` on small viewports; helper text contrast slightly increased.
- **Focus:** “Get involved” link on the final screen uses `focusRing`.

### 3.3 County dashboard v2 (`PopeCountyDashboardV2View`, shells)

- **Shells:** `CountyDashboardShell` and `RegionDashboardShell` use **`px-[var(--gutter-x)]`** and **`py-6 sm:py-8`** for consistent mobile gutters and rhythm.
- **Links:** Breadcrumb / command links use **`focusRing`** and **`text-kelly-navy`** for stronger default contrast.
- **`CountyRegionalContextPanel`:** Region and state drill links updated the same way.
- **`CountyKpiStrip` (compact):** **`gap-2.5`** on the default 2-column mobile grid to reduce cramped KPI tiles.

### 3.4 State organizing intelligence (`StateOrganizingIntelligenceView`)

- **Gutters:** Match shell token (`--gutter-x`, responsive vertical padding).
- **Region cards:** `focusRing` on full-card links.
- **Readiness table:** `caption.sr-only`, **`scope="col"`** / **`scope="row"`**, increased cell padding, header contrast tweak, **`touch-pan-x`** + **`overscroll-x-contain`** on scroll wrapper; **mobile-only** hint to scroll horizontally.

### 3.5 Region dashboards

- **`RegionDashboardView`:** Back link and Pope anchor CTA — `focusRing`, improved contrast, **full-width CTA on small screens**; KPI/map row gets **`min-w-0`** wrappers to reduce flex/grid overflow.
- **`RegionOrganizingGatewayBand`:** Full-width stacked CTAs on mobile, `focusRing`, badge/helper text contrast; **repetitive “Conversations & Stories” footer copy** shortened to a single line pointing at `/messages` and the header.
- **`RegionCountyGrid` / `RegionPrimaryComparisonCards` / `RegionNextCountiesToBuildPanel`:** Stacked action rows on mobile, **`tapMinSmCompact`** on primary/secondary actions, `focusRing`, slightly looser grid gaps.
- **`RegionComparisonTable`:** Screen-reader caption, scoped headers, first column as **`th scope="row"`**, mobile scroll hint, touch-friendly scroll container, note column contrast.

### 3.6 Charts (`PowerOf5RelationalCharts`, `CountyChartPanel`)

- **Responsive grid:** **`sm:grid-cols-2`** before `lg:grid-cols-3` so single-column phones are not three cramped micro-charts.
- **Bar blocks:** Taller chart area on mobile (`h-40` / `min-h-[10rem]`, `sm` fallback to previous height); bar labels **`line-clamp-2`**, larger type, higher contrast (`text-kelly-text/70+`); track bars slightly thicker / higher contrast; decorative bars `role="presentation"`.
- **County chart grid:** **`gap-4`** between cards.

### 3.7 Conversations & Stories (`NarrativeMemberHubView`)

- **Heading levels:** Card titles that skipped **`h3`** after section **`h2`** (local prompts, listening cards, deeper P5 prompts) normalized to **`h3`**.
- **Quick links + CTAs:** `focusRing`, `tapMinSmCompact` on pills; county packet buttons stack on mobile; bring-five band uses vertical stack on small screens with larger touch-friendly controls.
- **Contrast:** Inline links shifted toward **`text-kelly-navy`**; demo notice **`leading-relaxed`** and slightly stronger body color.

### 3.8 Get involved

- **Hero actions:** All **`Button`** children **`w-full justify-center sm:w-auto`** so CTAs are easy to hit on phones without changing desktop layout.

### 3.9 Privacy & trust

- **Links:** `focusRing` + **`text-kelly-navy`** for clearer contrast on the page wash.

### 3.10 Global polish

- **`HeroBlock` (onDark):** Subtitle opacity **`/88` → `/92`** for readability on blue bands.
- **`CountySectionHeader`:** Overline **`text-kelly-slate/85`** (was `/75`).

---

## 4. Guardrails (unchanged)

- No new npm packages.
- No voter PII, auth changes, or data pipeline edits.
- No route or content-model refactors—only presentation and semantics.

---

## 5. Verification

From `RedDirt/`:

```bash
npm run check
```

Runs **`lint:all`**, **`tsc --noEmit`**, and **`next build`**.

---

## 6. Follow-ups (not in this pass)

- **Manual QA:** VoiceOver / TalkBack on `/organizing-intelligence` tables and region peer tables (scroll + header announcements).
- **Optional:** `prefers-reduced-motion` for onboarding progress bar width transition.
- **Prose links** on long-form pages (`/get-involved` body, etc.) could adopt the same `focusRing` + navy link pattern incrementally.

---

**End of report.**
