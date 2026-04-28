# Public site alignment and admin separation — audit (Build Pass 1)

**Lane:** RedDirt · **Scope:** Routing, navigation, redirects, and crossover risk between voter-facing surfaces and **`/admin/*`** dashboards. · **Date:** audit snapshot · **No migrations; no cross-lane work.**

---

## 1. App Router shape (what owns what)

### Root (`src/app/layout.tsx`)

- Global **`html`** / **`body`**: fonts, `ThemeProvider`, `AnalyticsProvider`.
- **Public marketing chrome is not universal** — depends on nested layouts.

### Public marketing chrome (header + footer + `PublicLayoutMain` + **`AskKellyLayout`**)

Applied by **duplicate layout files** sharing the same pattern (skip link → `SiteHeader` → shim → `main` → `SiteFooter` → `AskKellyLayout`):

| Group | Layout file |
|-------|----------------|
| **(site) marketing pages** | `src/app/(site)/layout.tsx` |
| **`/organizing-intelligence/**`** | `src/app/organizing-intelligence/layout.tsx` |
| **`/county-briefings/**`** | `src/app/county-briefings/layout.tsx` |
| **`/onboarding/**`** (Power of 5) | `src/app/onboarding/layout.tsx` |

**(site)** holds the majority of intentional marketing routes (`/`, `/about`, `/priorities`, `/get-involved`, `/messages`, `/counties`, etc.).

### Public routes **outside** `(site)` but still using the marketing shell

| Area | Routes (examples) |
|------|---------------------|
| State/regional organizing intelligence | `/organizing-intelligence`, `/organizing-intelligence/regions/**`, `/organizing-intelligence/counties/[countySlug]` |
| County briefings hub + Pope drill-downs | `/county-briefings`, `/county-briefings/pope`, `/county-briefings/pope/v2` |
| Power of 5 onboarding | `/onboarding/power-of-5` |

These are **voter/supporter-facing** URLs, not staff consoles — but some copy leans operational (“dashboard,” demo tiles).

### Intentionally different public shell (`relational`)

- **`relational/*`**, **`relational/login`** use `relational/layout.tsx` — minimal chrome (relationship program), **not** full `SiteHeader` mega-nav. Documented separation; not a bug.

---

## 2. Admin / backend isolation

| Concern | Mechanism |
|---------|-----------|
| **URL prefix** | Staff tools live under **`/admin/**`** (`admin/layout.tsx`, `admin/(board)/layout.tsx`). |
| **`(board)` gate** | `requireAdminPage()` ensures admin session cookie before **`AdminBoardShell`**. |
| **Middleware** | `src/middleware.ts`: if **`ADMIN_SECRET`** is unset, requests to **`/admin/*`** except **`/admin/login`** redirect to login with **`?error=config`**. Public routes unaffected. |
| **Ask Kelly dock on marketing site** | Rendered via **`AskKellyLayout`** → **`CampaignGuideDock`** only inside the **marketing-shell** layouts listed above — **not** mounted under **`admin/layout.tsx`**, so admins do **not** get duplicate floating public Ask Kelly on top of the board chrome. |

**Promoted onboarding routes** (`/admin/ask-kelly`, `/admin/pages`, `/admin/workbench`, `/admin/orchestrator`) are reachable only behind admin gate — they should **not** appear in primary nav, footer (`footerNavGroups`), or **`primaryNavGroups`**. Grep confirms **`src/components/layout/*`** contains **no** `/admin` hrefs.

---

## 3. `src/app/api/` (summary)

Routes are **`/api/*`** (assistant, forms, webhooks, author-studio, media, gmail oauth, cron, …). These are server endpoints — **not voter pages**. Public site uses them indirectly (floating Ask Kelly → **`/api/assistant`**, **`/api/forms`**, beta feedback, etc.). No change recommended in Pass 1.

---

## 4. Redirects and aliases (`next.config.ts`)

| Source | Destination | Notes |
|--------|-------------|--------|
| Legacy / campaign trail | Various (`/`, `/understand`, `/from-the-road`, `/resources/...`) | Permanent or temporary per row |
| `/conversations` | `/messages` | Canonical Stories hub |
| **`/countyWorkbench`** | **`/county-briefings`** | Campaign alias (temporary redirect) |
| **`/distipope-briefing`** | **`/county-briefings/pope`** | Campaign alias |
| **`/dist-county-briefings`** | **`/county-briefings`** | Campaign alias |
| **`/volunteerPage`** | **`/get-involved`** | Campaign alias |

**Verification:** Visiting **`/volunteerPage`** or **`/countyWorkbench`** in production should HTTP-redirect — no duplicate content pages added for these names.

---

## 5. Public navigation audit

### Primary nav (`primaryNavGroups` in `src/config/navigation.ts`)

Flat links only — destinations are **marketing routes**: Home, About, Priorities, Counties **`/counties`**, Organize **`/organizing-intelligence`**, Conversations **`/messages`**, Get Involved **`/get-involved`**. **No `/admin*` links.**

### Footer (`footerNavGroups`)

Movement + Privacy groups — Movement links organizing intelligence, Power of 5, messages, get involved. **No admin links.**

### Mobile nav (`SiteHeader`)

Uses the same `primaryNavGroups` pattern (see `SiteHeader.tsx` / `NavDesktop`). **No grep hits** for `/admin` under `src/components/layout/`.

### CTAs worth naming

| Constant | Typical target |
|----------|----------------|
| **`countyDashboardSampleHref`** | **`/county-briefings/pope/v2`** (prototype labeling — intentional demo) |

**Alias paths** (**`/volunteerPage`**, **`/countyWorkbench`**) are redirects, not duplicate pages.

---

## 6. Highest-risk crossover issues (prioritized)

| Priority | Finding | Severity | Notes |
|----------|---------|----------|--------|
| P0 | ~~Public OIS linking to **`/admin/organizing-intelligence`**~~ | **Mitigated earlier** | Public statewide view intentionally **removed** explicit admin URLs; staff pointed to playbook. Re-verify after future edits. |
| P1 | **`/dashboard`** and **`/dashboard/leader`** on **`(site)`** | Naming confusion | Paths say “dashboard” but these are **public demo** surfaces (personal / leader Volunteer UI). Visitors may confuse with staff tools. Repair = copy/nav label pass, **not** moving routes without product sign-off. |
| P2 | **`organizing-intelligence`** copy (“OIS,” “command strip”) | Operational tone | Feels operational to some voters — still legitimate public education. Optional softer headings in a Pass 2 copy pass only. |
| P3 | **`CountyCommandHub`** CMS links **`/admin/counties/[slug]`** | Contained risk | Visible only when **`mode="admin"`** on **`/admin/counties`**; **`mode="public"`** on **`/counties`** uses cards **without** CMS column. |

---

## 7. “Scrambled / mixed surfaces” summary

Not broken routing — **mental model** overlaps:

1. **`/dashboard`** sits on the **public** `(site)` group while sounding like authenticated software.
2. **Organizing intelligence** is voter-facing education + demo metrics; language can read like an internal KPI board beside **`/priorities`** and **`/messages`** — still valid, monitor for tone.
3. **Ask Kelly dock** exposes **routes in assistant replies** (system guide intent) — some answers link **canonical** campaign URLs plus **staff** paths (**`/admin/...`**). That is intentional **inside** onboarding/docs for staff; publicly the dock does **not** hardcode **`/admin`** in `CampaignGuideDock.tsx`.

---

## 8. Immediate repair plan (recommended order — **documentation / copy-first**)

1. **Lock the routing story** — keep this audit next to **`docs/KELLY_SOS_ROUTE_MAP.md`** when updating routes (single source drift check).
2. **Pass 2 copy**: rename or subtitle **“My dashboard”** / **`/dashboard`** in UI to **Volunteer dashboard (demo)** or similar — **files:** **`src/app/(site)/dashboard/**`**, **`PersonalDashboardView`**, **`PowerOf5LeaderDashboardView`** breadcrumbs.
3. **Pass 2 eyebrows** on **`StateOrganizingIntelligenceView`** if stakeholders want less “ops jargon” — **file:** **`StateOrganizingIntelligenceView.tsx`** only.
4. **Regression grep** before releases: **`rg '/admin'`** scoped to **`src/app/(site)`**, **`organizing-intelligence`**, **`county-briefings`**, **`onboarding`** (layouts + page components).

**No migrations. No duplicate pages. No new Ask Kelly/dashboard features in Pass 1.**

---

## 9. First repair pass (recommended next commit)

Perform a **narrow copy clarification** only:

- **`/dashboard`** and **`/dashboard/leader`** page metadata + first heading: add visible **“(demo)”** or **Volunteer-facing** wording so browsers do not assume SOS staff backend.
- Optional: **`/organizing-intelligence`** H1subtitle one line clarifying **public snapshot**.

**Files likely touched in that copy pass:**

- `src/app/(site)/dashboard/page.tsx`
- `src/app/(site)/dashboard/leader/page.tsx`
- `src/components/dashboard/personal/*` (title strings)
- `src/components/dashboard/leader/PowerOf5LeaderDashboardView.tsx`

---

## 10. Route inventories (compact)

### Representative public-facing routes (`(site)` + shared marketing shell + onboarding + county briefings)

Core paths audited for this pass: **`/`**, **`/about`**, **`/priorities`**, **`/get-involved`**, **`/messages`**, **`/counties`**, **`/organizing-intelligence`**, **`/county-briefings`**, **`/county-briefings/pope`**, redirects **`/volunteerPage`**, **`/countyWorkbench`** (see **`next.config.ts`**). Full App Router enumeration: **`glob("src/app/**/page.tsx")`** in-repo (marketing + briefings + relational + onboarding + admin segments).

### Staff / admin (**all under `/admin`** except **`/admin/login`**)

Workbench, orchestrator, content, pages editor, storyteller tools, relational admin, voter model, etc.

### API

All under **`/api`** — backend contracts, not navigational “sites.”

---

## 11. Confirmation checklist (pre-deploy)

- [ ] **`PRIMARY_PUBLIC_NAV`** excludes `/admin*`
- [ ] **`next.config`** campaign aliases behave in staging
- [ ] **`ADMIN_SECRET`** set in prod so half-built admin URLs do not confuse crawlers vs real session
- [ ] Smoke test: Home → Counties → Briefings → Pope; Home → Organize Intelligence; `/volunteerPage` redirects to **`/get-involved`**

---

*End Pass 1 audit — implementation changes deferred unless product approves Copy Pass.*

---

## 12. Pass 2 — Dashboard-language cleanup (public volunteer demo routes)

**Goal:** Replace backend-sounding **“dashboard”**, **“command strip”**, **“executive strip”**, **“admin login”** wording on **public** `(site)` **`/dashboard`** + **`/dashboard/leader`** + related public copy (organizing intelligence teaser, Power of 5 onboarding route list). **Route paths unchanged.**

### Files changed

| File | Summary |
|------|---------|
| `src/app/(site)/dashboard/page.tsx` | Metadata title/description → **Volunteer preview** language. |
| `src/app/(site)/dashboard/leader/page.tsx` | Metadata → **Leadership preview** language. |
| `src/components/dashboard/personal/PersonalDashboardView.tsx` | H1, eyebrow link, subtitle — volunteer / leadership **preview** wording. |
| `src/components/dashboard/personal/GamificationPanel.tsx` | Source badge note: “demo **preview** fields.” |
| `src/components/dashboard/personal/MyTasksPanel.tsx` | JSDoc (no user-facing string change beyond comment). |
| `src/components/dashboard/leader/PowerOf5LeaderDashboardView.tsx` | Back link, H1, KPI strip title (“Leadership snapshot”), footer line (staff sign-in, no “admin”). |
| `src/components/organizing-intelligence/StateOrganizingIntelligenceView.tsx` | Pope v2 link label, field-team links, KPI strip title, pipeline intro (no “dashboard level”). |
| `src/lib/power-of-5/onboarding-demo.ts` | `DASHBOARD_PREVIEWS` labels/descriptions — preview / view language. |
| `src/components/onboarding/power-of-5/PowerOf5OnboardingFlow.tsx` | Screen 9 H2: **Route & preview map** (was “Dashboard preview”). |

### Copy patterns used

- **Volunteer preview** / **Leadership preview** (instead of “My dashboard” / “Leader dashboard”) for H1s and nav-adjacent links.
- **Leadership snapshot** (instead of “Executive strip”).
- **KPI snapshot — Power of 5 (public preview)** (instead of “KPI command strip — executive”).
- **Staff sign-in** / **campaign staff tools** (instead of “admin login” / “staff dashboards” on those public blurbs).
- Onboarding route cards: **County organizing preview**, **Region & state organizing previews**, precinct/city **“(future)”** views.

### Routes

- **`/dashboard`** and **`/dashboard/leader`** — **unchanged** (Pass 2 is copy-only).

### Public nav regression

- **`src/config/navigation.ts`** — still **no** `/admin` links in primary or footer groups (unchanged).

### Remaining public / “ops” tone (optional later)

- **`/organizing-intelligence`** body copy still uses labels like **Power of 5 Dashboard panel** (component name) and **KPI** jargon in places — acceptable for field education; further softening is optional.
- Shared **CSS/helper** names (`countyDashboardCardClass`, `@/components/county/dashboard`) are **code identifiers**, not voter-facing text.

*Pass 2 closes the highest-priority “is this the SOS backend?” confusion for the two public demo routes.*
