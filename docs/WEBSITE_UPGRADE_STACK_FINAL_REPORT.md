# Website upgrade stack — final QA report (PASS 10)

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Scope:** Launch QA after WEBSITE_PASS_01–09; stack verification, guardrails, Netlify posture, and recommended next steps.

---

## 1. Read-in summary (PASS 01–09)

| Pass | Focus | Canonical doc |
|------|--------|----------------|
| 01 | Flat public nav, header CTAs (Power of 5, Pope v2 sample), footer, pathway to OIS / counties / messages / get-involved | `docs/WEBSITE_PASS_01_NAVIGATION_REPORT.md` |
| 02 | Homepage conversion band, pathways, trust strip, final CTA defaults | `docs/WEBSITE_PASS_02_HOMEPAGE_REPORT.md` |
| 03 | `/get-involved` seven-pathway grid, captain deep-link, no new form/API behavior | `docs/WEBSITE_PASS_03_GET_INVOLVED_REPORT.md` |
| 04 | County intelligence catalog, `/counties` tier filters, command strip on `/counties/[slug]` | `docs/WEBSITE_PASS_04_COUNTY_STANDARDIZATION_REPORT.md` |
| 05 | `/privacy-and-trust` + footer/search discovery | `docs/WEBSITE_PASS_05_PRIVACY_TRUST_REPORT.md` |
| 06 | `/messages` hub upgrade; **no** duplicate `/conversations` page | `docs/WEBSITE_PASS_06_CONVERSATIONS_STORIES_REPORT.md` |
| 07 | Regional OIS gateways, demo/preview labeling, county/OIS links on region grids | `docs/WEBSITE_PASS_07_REGIONAL_PAGES_REPORT.md` |
| 08 | Mobile/a11y density (focus rings, tap targets, tables, charts) | `docs/WEBSITE_PASS_08_MOBILE_ACCESSIBILITY_REPORT.md` |
| 09 | SEO/metadata/OG for home, onboarding, OIS, Pope v2, counties, messages, get-involved, trust, regions, placeholders | `docs/WEBSITE_PASS_09_SEO_METADATA_REPORT.md` |

---

## 2. NETLIFY_GITHUB_READINESS_REPORT.md

**Status:** **Not present** in the repo (searched `RedDirt/` and parent `SOSWebsite/`).

**Substitute source of truth:**

- `netlify.toml` — build command `bash scripts/netlify-build.sh`, Node 20, `NODE_OPTIONS` heap, `@netlify/plugin-nextjs`.
- `scripts/netlify-build.sh` — requires **`DATABASE_URL`** (or **`NETLIFY_DATABASE_URL`** mapped to it); runs Prisma generate/migrate (and optional seed per script); blocks localhost DB URLs; validates `postgresql://` / `postgres://` prefix.

---

## 3. npm scripts (requested)

| Script | In `package.json`? | Notes |
|--------|-------------------|--------|
| `npm run lint` | **Yes** (`next lint`) | |
| `npm run typecheck` | **Yes** (`tsc --noEmit`) | |
| `npm run check` | **Yes** | Runs `lint:all` + `typecheck` + `build` (i.e. **includes** a full `next build`). |
| `npm run build` | **Yes** (`next build`) | |

**Note:** Running `lint`, `typecheck`, `check`, and `build` in sequence **duplicates** work: `check` already runs lint, typecheck, and build. For CI, `npm run check` alone is sufficient.

---

## 4. Checks run (PASS 10)

| Check | Agent result | Notes |
|-------|----------------|-------|
| `npm run lint` | **Not captured** | Automated terminal stdout was empty in this environment. **Run locally** in `RedDirt/` for authoritative logs. |
| `npm run typecheck` | **Not captured** | Same as above. |
| `npm run check` | **Not captured** | Same as above. |
| `npm run build` | **Not captured** | Same as above. |
| IDE diagnostics (`read_lints` on `src/`) | **PASS (clean)** | No linter issues reported for `RedDirt/src` at report time. |

**Recommended one-liner (from `H:\SOSWebsite\RedDirt`):**

```bash
npm run check
```

---

## 5. Route & IA verification (static + code review)

| Requirement | Result | Evidence / notes |
|-------------|--------|------------------|
| Public nav works | **PASS** | `src/config/navigation.ts` — seven flat `primaryNavGroups`; `NavDesktop` + `SiteHeader` use same list. |
| Mobile nav works | **PASS** | `SiteHeader` drawer: `allPrimaryNavItems`, stacked CTAs (Power of 5, county sample, volunteer, donate). |
| Homepage CTAs work | **PASS** | Pathways: `powerOf5OnboardingHref`, `/organizing-intelligence`, `/counties`, `getInvolvedPathwaysHref`, `countyDashboardSampleHref` in `HomePathwayGateway.tsx`; header matches `navigation.ts`. |
| Onboarding route | **PASS** | `src/app/onboarding/power-of-5/page.tsx` exists. |
| Organizing intelligence | **PASS** | `src/app/organizing-intelligence/page.tsx`; counties placeholder `counties/[countySlug]`; admin hub `admin/(board)/organizing-intelligence`. |
| Pope v2 route | **PASS** | `src/app/county-briefings/pope/v2/page.tsx`. |
| Region routes | **PASS** | Eight static region pages under `organizing-intelligence/regions/*` + dynamic `[slug]` placeholder. |
| Conversations / messages | **PASS** | Canonical **`/messages`** (`src/app/(site)/messages/page.tsx`). **PASS 10 additive:** permanent redirect **`/conversations` → `/messages`** in `next.config.ts` so legacy/bookmark URLs resolve without a duplicate page. |
| Get involved | **PASS** | `src/app/(site)/get-involved/page.tsx`. |
| Privacy page | **PASS** | `src/app/(site)/privacy/page.tsx`; trust companion `/privacy-and-trust` per Pass 05. |
| No public “AI” wording | **PASS (review)** | Grep on `src/app/(site)` and `src/components/layout`: **no** `AI` / artificial-intelligence matches. Public search uses “semantic” / “keyword-only,” not “AI.” Admin-only surfaces still say AI where tooling is explicit (expected, out of scope for public guardrail). |
| Demo / preview data labeled | **PASS (aligned with passes)** | Region gateway band, KPI/source badges, Pass 07/09 copy — demo/seed/placeholder called out in builders and UI patterns documented in PASS 07–09. |
| No broken imports | **PASS (IDE)** | `read_lints` clean on `src/`; full confirmation via local `npm run typecheck` / `npm run build`. |
| No secrets staged | **Manual** | Agent could not rely on `git` output in this environment. **Steve:** run `git status` / `git diff` and confirm no `.env`, keys, or tokens are staged. |

---

## 6. Pass / fail (overall)

| Area | Verdict |
|------|---------|
| Documentation read-in (PASS 01–09) | **PASS** |
| Script inventory | **PASS** |
| Automated CLI checks in agent environment | **INCONCLUSIVE** (no log capture) — **treat as blocker until local `npm run check` is green** |
| Public route / nav / guardrail review | **PASS** (with local build confirmation recommended) |
| Netlify config present | **PASS** (`netlify.toml` + `netlify-build.sh`) |

---

## 7. Remaining blockers

1. **Authoritative CI:** Run `npm run check` (or `lint` + `typecheck` + `build`) on a dev machine/CI runner and attach logs to the release record.
2. **Netlify production:** Ensure **`DATABASE_URL`** (or Neon-linked **`NETLIFY_DATABASE_URL`**) is set and **not** localhost; confirm migrations succeed in `netlify-build.sh`.
3. **Homepage CMS overrides:** PASS 01–02 note DB-backed `homepageConfig` may override default hero/final CTA until admin is updated — not a code defect, but a **content** sync item for launch.
4. **Dedicated Netlify/GitHub readiness memo:** `NETLIFY_GITHUB_READINESS_REPORT.md` is still **missing** if you want a single checklist doc for repo + Netlify + GitHub settings.

---

## 8. Netlify readiness (condensed)

- **Build:** `bash scripts/netlify-build.sh` (Linux on Netlify).
- **Deps:** Node **20**; plugin **`@netlify/plugin-nextjs`**.
- **Database:** **Required** at build time for Prisma; script rejects local Docker URLs.
- **Optional runtime:** `OPENAI_*` and other keys per feature — not required for static marketing paths but may affect search/ingest features.

---

## 9. Next recommended stack (post-launch)

1. **Wire CI** to run `npm run check` on every PR touching `RedDirt/`.
2. **Add** `NETLIFY_GITHUB_READINESS_REPORT.md` (branch protection, env var inventory, preview vs production DB).
3. **Smoke tests:** Playwright or similar for `/`, `/organizing-intelligence`, `/messages`, `/get-involved`, `/onboarding/power-of-5`, `/county-briefings/pope/v2`, one region URL, `/privacy`.
4. **Personal / leader dashboards:** Flesh out `/dashboard` and `/dashboard/leader` (placeholders exist) when auth scope is defined.
5. **Operator OIS:** Evolve `/admin/organizing-intelligence` from placeholder to queues/exports per execution board — without public voter exposure.

---

## 10. Files changed (PASS 10 only)

| File | Change |
|------|--------|
| `next.config.ts` | Added **`/conversations` → `/messages`** permanent redirect (canonical hub). |
| `docs/WEBSITE_UPGRADE_STACK_FINAL_REPORT.md` | This report. |

---

## 11. Git (if clean — run locally)

Per mission: **do not commit** unless Steve explicitly asks.

**Steve should run:**

```bash
cd H:\SOSWebsite\RedDirt
git status --short
git diff --stat
```

Agent environment did not return `git` stdout; paste results into the release thread if needed.

---

## 12. Sign-off

- **PASS 10 documentation:** complete with the caveats in §4 and §7.  
- **Stack upgrade narrative:** consolidated from WEBSITE_PASS_01–09; **Netlify** readiness inferred from repo config absent a separate readiness markdown.
