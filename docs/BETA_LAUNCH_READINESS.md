# Red Dirt — beta launch readiness (BETA-READINESS-1)

**Beta definition (this doc):** Deployable public SOS campaign site + **no embarrassing** public placeholders; core volunteer/get-involved paths work; **Pope** county story coherent; **admin** usable for a small team with env configured; **build passes**; **no internal repo paths or maintainer-only language on public pages**; mobile **acceptable**; deployment assumptions **documented**; gaps **listed**.

**Out of scope for “RedDirt beta” alone:** Full **countyWorkbench** product (separate Netlify app) — track as **sister** launch.

---

## Readiness score (estimate)

| Area | Weight | Score (0–100) | Notes |
|------|--------|-----------------|-------|
| Public site shell & home | 20% | 78 | Strong narrative; some content still “internal mirror” / long-tail gaps |
| Counties public (`/counties`) | 10% | 70 | Depends on **published** counties in DB |
| Pope briefing (`/county-briefings/pope`) | 10% | 72 | DB/ingest dependent; copy had dev-style gate labels (being cleaned) |
| Volunteer / get involved | 15% | 75 | Forms + flows; verify env + spam |
| Donate / external CTAs | 5% | 85 | GoodChange handoff pattern stable |
| Admin workbench (ops) | 15% | 68 | Broad surface; not all lanes production-hardened |
| Build / deploy | 10% | 80 | `npm run build` expected green; Netlify env docs exist |
| Mobile / a11y / perf | 10% | 65 | Not formally audited for beta |
| Data integrity / legal copy | 5% | 70 | Honest disclaimers present; ingest env-specific |

**Weighted approximate beta readiness: ~73%** for RedDirt-only beta as defined above.

---

## Component status — major areas (Phase 2 brief)

| Area | Current state | Key paths / modules | % est. | Risks / blockers | Beta ready requires | Full ops requires | P |
|------|---------------|---------------------|--------|------------------|---------------------|-------------------|---|
| Public campaign website shell | Solid layout, typography, sections | `src/app/(site)/layout.tsx`, `src/components/layout/*` | 80 | Residual copy edge cases | No dev/repo language on public pages | Full content QA + legal review nav | P0 |
| Home / county leader feel | Home + counties hub | `(site)/page.tsx`, `(site)/counties/*` | 78 | DB empty = thin counties | ≥1 compelling published county | All target counties published + intel | P0 |
| Statewide workbench (RedDirt sense) | **Admin** workbench hub, not 75-county portal | `src/app/admin/(board)/workbench/*` | 70 | Broad surface | Core routes load; smoke doc | Role-based hardening | P1 |
| 75-county countyIndex (portal) | **Sister:** `countyWorkbench` | *(outside this repo)* | — | Conflation with RedDirt | Track separately | Full portal launch | — |
| Pope County full data pack | Briefing page + engine | `county-briefings/pope`, `src/lib/county-political-profile*` | 72 | Prisma/data gaps | Graceful empty states; honest labels | Full ingest + ACS/BLS where used | P0 |
| Non-Pope county shell | `/counties/[slug]` from DB | Prisma county models | 68 | Unpublished slugs | Published records + copy | Per-county intel (admin) | P1 |
| Candidate brief system | Partially in sister app; RedDirt has intel/briefing lanes | admin county intel, pope briefing | 65 | Split brain | Pilot: Pope + one other | Unified product decision | P1 |
| Campaign / county manager pages | CM dashboard bands, workbench | `truth-snapshot`, `/admin/workbench` | 72 | Env + data | Truth snapshot non-empty in demo | Full governance workflows | P1 |
| Volunteer flow | Get involved, events, forms | `(site)/get-involved`, forms, `actions/*` | 75 | Spam, missing keys | End-to-end smoke on staging | CRM handoff if any | P0 |
| Navigation and footer | Site nav + admin nav | `content/site.ts`, admin shells | 82 | Drift | No broken links in smoke | IA sign-off | P1 |
| Public source/resource cleanup | Resources, editorial | `(site)/resources/*` | 76 | Long tail | No embarrassing stubs | Full library | P1 |
| Data generation scripts | Rich `scripts/` | `scripts/*`, `package.json` | 75 | Local paths in package.json | Ops doc only; no public H:\ leaks | CI + path portability | P2 |
| County asset/storage strategy | DB + owned media + static emits | `owned-media`, `emit:*` scripts | 70 | Privacy / batch hygiene | Document who runs what | Automated privacy scans | P1 |
| Theme / branding | Tokens, Tailwind, brand docs | `globals.css`, `docs/brand` | 85 | — | Consistent on key pages | Full design QA | P2 |
| Mobile / tablet | Responsive patterns | shared layout | 68 | Not formally audited | Key flows usable | Formal pass | P1 |
| Accessibility | Partial | components | 65 | No axe CI | Critical path keyboard | WCAG target | P2 |
| Performance | Next defaults | — | 70 | Large pages | Acceptable LCP on home | Budget + image policy | P2 |
| Build/deploy readiness | Netlify + check script | `docs/deployment.md` | 80 | Env drift | `npm run build` green | `npm run check` in CI | P0 |
| Data integrity / source confidence | Truth snapshot, ingest audit | `truth-snapshot`, audits | 72 | Stale DB | Honest metrics in admin | Full pipeline SLOs | P1 |
| Content completeness | TS content + DB | `src/content`, Prisma | 75 | Calendar/event churn | No “TBA” embarrassment on hero | Editorial calendar | P1 |
| Beta demo readiness | Combined | — | **~73** | See risks | This doc’s must-fix | Stakeholder script | P0 |
| Operational campaign readiness | Admin + comms + relational | admin routes | 68 | Staff training | Runbook for 3 roles | Full division coverage | P1 |

---

## Must-fix before beta (RedDirt)

1. **Public copy sweep:** no absolute disk paths, no “PRECINCT-1”-style gate labels on voter-facing briefing text, no “internal mirror” visible on **live** blog posts (fix content or mode).
2. **Counties:** confirm ≥1 **published** county for demo; Pope briefing loads without DB error in prod.
3. **`npm run build`** green on CI/Netlify with documented env vars (see `docs/deployment.md`).
4. **Donate / volunteer** links and forms tested on staging.

## Can wait until post-beta

- Full social workbench AI hooks hardening.
- Full 75-county **public** experience (partially in **countyWorkbench**).
- Author Studio full productization.

## Risks to timeline

- **Database empty** on first deploy → county pages empty; briefing errors.
- **Missing API keys** (OpenAI, Twilio, SendGrid) → features silently degraded.
- **Scope creep** into AJAX or countyWorkbench inside RedDirt threads.

---

## Remaining work (rough)

- **Cursor packets:** ~8–12 **RD-*** sized chunks to beta (copy, counties seed, staging checklist, admin smoke, a11y spot-check, perf baseline).
- **Calendar (aggressive):** ~3–5 weeks wall-clock with focused chunks (assumes one operator + Cursor; not a guarantee).

---

## Next actions

1. Execute **RD-1** in [`RED_DIRT_PACKET_QUEUE.md`](./RED_DIRT_PACKET_QUEUE.md).
2. Re-score this doc after each packet (especially % and must-fix list).

**Last audit:** OS map + protocol + this file created/updated in one pass; run `npm run build` and record below.

---

## Build verification log

| Date | Command | Result |
|------|---------|--------|
| *(fill on each audit)* | `npm run build` | *(pass/fail + notes)* |
