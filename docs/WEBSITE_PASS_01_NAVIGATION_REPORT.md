# Website Pass 01 — Navigation & pathway cleanup

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Scope:** Public header, mobile drawer, footer, default homepage CTAs, and copy touchpoints that support the organizing-intelligence + Power of 5 pathway. Admin nav unchanged except as noted elsewhere.

---

## 1. Goals (mission)

- Send visitors clearly into the **new public system**: statewide organizing intelligence (`/organizing-intelligence`), county surfaces (`/counties`, gold-sample dashboard), relational onboarding (`/onboarding/power-of-5`), and narrative hub (`/messages`).
- **Primary CTA:** Start Power of 5. **Secondary CTA:** View County Dashboard (gold-sample shell).
- **No “AI” wording** on public surfaces reviewed for this pass (search, `(site)` app routes, onboarding metadata). The floating **Ask Kelly** guide keeps a people-first label; it is not branded as AI in UI copy.

---

## 2. Primary navigation (desktop + mobile source list)

Flat primary items (no dropdowns). Implemented in `src/config/navigation.ts` as `primaryNavGroups` with empty `items` and `groupLandingHref` per row; `NavDesktop` renders them as single links.

| Label | Path |
|--------|------|
| Home | `/` |
| About | `/about` |
| Priorities | `/priorities` |
| Counties | `/counties` |
| Organize | `/organizing-intelligence` |
| Conversations & Stories | `/messages` |
| Get Involved | `/get-involved` |

**Mobile:** `SiteHeader` drawer lists the same seven links via `allPrimaryNavItems`, then stacked CTAs (Power of 5, county dashboard, volunteer sign-up, donate).

**Deep pages** (events, news, resources, understand the office, etc.) remain on the site and are reachable via homepage pathway cards, in-page links, and site search — they are no longer duplicated in the top mega-menu.

---

## 3. Header CTAs

| Role | Label | Target | Notes |
|------|--------|--------|--------|
| Primary | Start Power of 5 | `/onboarding/power-of-5` | `powerOf5OnboardingHref` in `navigation.ts` |
| Secondary | View County Dashboard | `/county-briefings/pope/v2` | `countyDashboardSampleHref` — shared county dashboard shell; demo/seed |
| Tertiary | Donate | `siteConfig.donateHref` | Unchanged |

Compact mobile header uses short labels **Power of 5** and **County** where space is tight; full phrases appear in the drawer.

---

## 4. Footer

Two columns (was four mega-columns):

1. **Movement** — Organizing intelligence, Start Power of 5, Conversations & Stories, Volunteer & get involved (`/get-involved`).
2. **Privacy & trust** — Privacy, Terms of use, Disclaimer.

Prominent left-column button: **Start Power of 5 →** (replaces footer-first “Volunteer sign-up” button to match Pass 1 priorities; volunteer remains in the Movement list).

Donate is **not** duplicated in the footer list in this pass; it stays in the header and on content pages.

---

## 5. Homepage defaults

`src/lib/content/homepage-merge.ts` default hero and closing CTA blocks now use the same primary/secondary pair (Power of 5 + county dashboard). **Note:** If `homepageConfig` in the database already stores overrides, production may still show older labels until admin homepage is updated or reset.

---

## 6. Related routes (readiness context)

- **OIS / dashboards:** `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md` — state, region, county placeholder, `/dashboard*` placeholders, admin OIS hub.
- **Beta shell:** `docs/BETA_LAUNCH_READINESS.md` — public shell, counties, volunteer paths.
- **Build reports skimmed:** `docs/COUNTY_DASHBOARD_SHARED_SHELL_BUILD_REPORT.md`, `docs/POPE_COUNTY_DASHBOARD_V2_BUILD_REPORT.md`, `docs/NARRATIVE_PACKET_BUILDER_REPORT.md`, `docs/REGION_TAXONOMY_BUILD_REPORT.md`.

---

## 7. Files touched

| File | Change |
|------|--------|
| `src/config/navigation.ts` | New primary/footer model; `powerOf5OnboardingHref`, `countyDashboardSampleHref`; `allPrimaryNavItems` includes flat groups |
| `src/components/layout/NavDesktop.tsx` | Flat link rendering when `items.length === 0` and `groupLandingHref` set |
| `src/components/layout/SiteHeader.tsx` | CTAs; mobile drawer list + button stack |
| `src/components/layout/SiteFooter.tsx` | Movement + Privacy columns; primary footer CTA |
| `src/lib/content/homepage-merge.ts` | Default hero + `finalCta` URLs/labels |
| `src/app/onboarding/power-of-5/page.tsx` | Metadata title/description (no “prototype” in title) |
| `src/app/(site)/get-involved/page.tsx` | Onboarding link copy |
| `src/app/(site)/messages/page.tsx` | Meta description wording |

---

## 8. Verification

Run from `RedDirt/`:

```bash
npm run check
```

(Lint + `tsc --noEmit` + `next build`.)

---

## 9. Follow-ups (not in this pass)

- Watch **lg** breakpoints: seven labels + Search + three CTAs may need typography tweaks on narrow laptops.
- **Per-county** “View County Dashboard” deep link when more counties ship v2 shells (today: Pope sample).
- Optional: restore a compact **News** or **Events** entry in nav if analytics show findability issues.
