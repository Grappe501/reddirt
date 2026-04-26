# Red Dirt — Operating system map (OS-MAP-1)

**Scope:** `H:\SOSWebsite\RedDirt` only.  
**Sister apps (not this repo):** **`countyWorkbench/`** (Pope-first county portal, 75-county index, statewide `/workbench`, candidate brief) · **`ajax/`** (Jacksonville at-large — firewall from RedDirt).

**Read first:** [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md) · [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) · [`RED_DIRT_BUILD_PROTOCOL.md`](./RED_DIRT_BUILD_PROTOCOL.md).

---

## 1. What Red Dirt is

- **Public campaign site** (App Router `(site)`): narrative, counties, events, blog, resources, volunteer paths, donation handoff.
- **Campaign operating system** (`/admin`, `/relational`, APIs): Prisma/Postgres, comms workbench (email/SMS plans, sends, review), social monitoring, owned media, budgets, compliance docs, GOTV read models, relational organizing, county intelligence admin, content board.
- **Data & ingest:** election results JSON pipeline, voter file import scripts, RAG/search chunks, opposition intel tables, county profiles (DB-driven).

---

## 2. Route map (high level)

### 2.1 Public `(site)` — `src/app/(site)/`

| Area | Routes | Role |
|------|--------|------|
| Home & narrative | `/`, `/about`, `/about/[slug]`, `/what-we-believe`, `/priorities`, `/understand`, `/civic-depth` | Brand, story, pillars |
| Content | `/blog`, `/blog/[slug]`, `/editorial`, `/editorial/[slug]`, `/explainers`, `/explainers/[slug]`, `/stories`, `/stories/[slug]`, `/resources`, `/resources/[slug]` | Editorial + resource library |
| Field & volunteer | `/get-involved`, `/local-organizing`, `/local-organizing/[slug]`, `/events`, `/events/[slug]`, `/listening-sessions`, `/host-a-gathering`, `/start-a-local-team`, `/voter-registration`, `/voter-registration/assistance` | Intake, events, organizing |
| Counties (DB-backed list) | `/counties`, `/counties/[slug]` | Published county command pages from Prisma |
| Calendar & press | `/campaign-calendar`, `/campaign-calendar/[slug]`, `/from-the-road`, `/press-coverage` | Schedule, media |
| Issue depth | `/direct-democracy`, `/direct-democracy/ballot-initiative-process`, `/labor-and-work`, `/donate` | Policy + fundraising CTA |

### 2.2 Public outside `(site)` group

| Route | Role |
|-------|------|
| `/county-briefings/pope` | Dynamic Pope county **political profile** from DB models (`buildPopeCountyPoliticalProfile`) — SOS planning briefing |

### 2.3 Organizer / volunteer app

| Route | Role |
|-------|------|
| `/relational`, `/relational/login`, `/relational/new`, `/relational/[id]` | Relational organizing shell (Supabase/auth patterns per layout) |

### 2.4 Admin `(board)` — `src/app/admin/(board)/`

Workbench-style OS: homepage config, inbox-adjacent flows, **workbench** hub, **positions/seats**, **comms** (plans, segments, media, social grid), **email queue**, **tasks**, **events**, **budgets**, **financial-transactions**, **compliance-documents**, **gotv**, **intelligence**, **county-profiles**, **county-intelligence**, **relational-contacts**, **owned-media** (+ grid), **approvals** (if present), **voters/[id]/model**, co-pilot hooks as applicable.

Auth: env/session patterns in `src/lib` + admin layout (see `admin` login).

### 2.5 API routes — `src/app/api/`

Representative: **Twilio** / **Sendgrid** webhooks, **author-studio** compose/research/video, **compliance-documents** file, **conversation-monitoring** analyze, **owned-campaign-media** preview, etc. — campaign automation and integrations (not a full list in this doc; grep `src/app/api` when extending).

---

## 3. Data & Prisma

- **Schema:** `prisma/schema.prisma` — 100+ models (inventory: [`database-table-inventory.md`](./database-table-inventory.md)).
- **Migrations:** `prisma/migrations/`.
- **Seed:** `prisma/seed.ts`.

Domains include: content/synced posts, media, counties, voters, events, comms plans/sends, email workflow, budgets, compliance, opposition intel, election results, search chunks, relational contacts, etc.

---

## 4. Scripts (`scripts/` + `package.json`)

Ingest: docs, county Wikipedia, election JSON, campaign folder brain, voter file, opposition intel, calendar imports, media repair, nightly preflight. **Many default paths point at `H:\SOSWebsite\campaign information for ingestion`** — operator machines only; production Netlify build does not require those paths.

---

## 5. Styles & theme

- **Global:** `src/app/globals.css`, Tailwind (`tailwind.config.ts`).
- **Brand:** `docs/brand/`, content tone in `docs/narrative`, `docs/philosophy`.

---

## 6. Content sources

- **TS modules:** `src/content/` (events copy, site strings, etc.).
- **DB:** Prisma-backed pages (counties, blog sync, homepage config).

---

## 7. Build & deploy

- **Build:** `next build` (`npm run build`).
- **Quality:** `npm run check` = lint + `tsc --noEmit` + build.
- **Deploy:** Netlify per `docs/deployment.md` + `@netlify/plugin-nextjs`.

---

## 8. County workbench (sister repo) — boundary

| Capability | Where it lives |
|------------|----------------|
| SOS county **portal** (Pope full pack, 75-county index, statewide roll-up, candidate brief shells) | **`countyWorkbench`** repository |
| RedDirt **county command** + **Pope briefing** + admin county intel | **This repo** |

Cross-link in docs; do not duplicate the county portal inside RedDirt unless a packet explicitly merges UX.

---

## 9. Maintenance

When adding a major route or division, update: this file (brief), [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) ledger if maturity changes, [`BETA_LAUNCH_READINESS.md`](./BETA_LAUNCH_READINESS.md) if launch gaps move.
