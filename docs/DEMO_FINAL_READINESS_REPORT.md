# Demo final readiness report — RedDirt

**Lane:** RedDirt · **Gate:** Stack Pass F · **Date:** 2026-04-27 · **Audience:** Staff running same-day stakeholder / candidate demos.

**Verdict:** **Demo-ready — Yes**, provided you stay on the **best demo path** below and verbally qualify **scaffold** versus **production-dependent** surfaces. This document aligns with **`docs/DEMO_LOCAL_READINESS.md`**, **`docs/PUBLIC_SITE_ALIGNMENT_AND_ADMIN_SEPARATION_AUDIT.md`**, and **`docs/NORTHWEST_REGION_AND_8_COUNTY_WORKBENCH_PARITY_AUDIT.md`**.

---

## What is demo-ready

| Surface | Notes |
|---------|--------|
| **Public marketing site** | Home pathway, priorities, counties hub, volunteering, narratives — stable voter-facing shells under `(site)` and allied public layouts. |
| **County briefings — Pope pilot** | Live public routes: hub + Pope briefing + Pope v2; demo/sample labeling where the UI calls for it (do not assert live field truth without data approval). |
| **`/admin/ask-kelly` — candidate command center** | Command board with **Live / Setup needed / Planned** badges; honest integration panel; county expansion panel (Pope model + eight-county **planned** queue); no mass-send actions from the console. |
| **Orchestrator** | `/admin/orchestrator` — real aggregate tiles (pending review, routed content, per-platform counts, sync health) as the **primary operational KPI** surface for content pipeline today. |
| **Workbench** | `/admin/workbench` — operational hub; CM dashboard bands (truth snapshot) as **secondary** KPI context vs orchestrator. |
| **Page content** | `/admin/pages` — draft → review → publish rhythm for public copy. |
| **Auth gate** | `/admin/*` (except login) behind session + middleware when `ADMIN_SECRET` is configured (see local demo doc). |

---

## What is honest scaffold (do not sell as finished product)

| Item | How to say it |
|------|----------------|
| **`/admin/insights`** | Placeholder route — **no** report engine, **no** charts; points to orchestrator + workbench for aggregates. |
| **Eight-county briefing parity** | **Planned build queue** — only **Pope** has public `/county-briefings/*` pages; Pulaski–Van Buren are **naming targets**, not live briefing URLs. |
| **Social workbench KPI tiles** | **Setup / environment-dependent** — headline stats may be empty until connectors and env verify. |
| **Email / SMS mass channels** | **Code + approval flows** exist; **production sends** require keys, compliance, and in-app approvals per deploy. |
| **Research / open web** | **Not** enabled as live open-web browsing (Ask Kelly console card). |
| **Candidate voter identity link** | **Staff-assisted / planned** — no self-serve voter row lookup from this console. |

---

## What is not ready (or out of scope for “live” claims)

| Item | Notes |
|------|--------|
| Full **cross-county** public briefing pages for the eight named counties | No `src/app/county-briefings/{slug}` for those yet — see parity audit. |
| **Insights / analytics product** | Not shipped; orchestrator + workbench bands only. |
| **Guaranteed** third-party **live** status | Calendar, Gmail OAuth, SendGrid, Twilio — speak in **“code paths + env”** terms unless you verify that environment. |
| **Pathway-to-victory math, rival claims, invented registration targets** | **Out of scope** for demo claims — audit rule. |

---

## Best demo path (recommended order)

1. **Public** — `/` → brief **pathway** / conversion story (donation overlay may appear once per session — expected).  
2. **About / priorities** — `/about`, `/priorities` if narrative depth is needed.  
3. **Counties** — `/counties` (public hub; **no** admin links in public `CountyCommandHub` mode).  
4. **County briefings** — `/county-briefings` → **Pope** `/county-briefings/pope` → optional **v2** `/county-briefings/pope/v2` — call out **pilot** and **sample/demo** language on v2.  
5. **Sign in** — `/admin/login` → **`/admin/ask-kelly`** — walk the **candidate command board**, **county expansion panel**, **integration status** (honest env language).  
6. **KPI truth** — `/admin/orchestrator` as **primary** live aggregate surface for the content pipeline.  
7. **Ops hub** — `/admin/workbench` (optional depth: comms, email queue, social — stay in “setup when not verified” language).  
8. **Scaffold check** — `/admin/insights` — **fast** stop to show **placeholder** honesty; contrast with orchestrator.

**Avoid:** Claiming **live** email/SMS/calendar without confirming that deployment’s env and approvals.

---

## Exact URLs to show

### Public (no admin session)

| URL | Purpose |
|-----|---------|
| `/` | Home |
| `/about` | Kelly & story |
| `/priorities` | Issue frame |
| `/counties` | 75-county explorer (public mode) |
| `/county-briefings` | Briefings hub |
| `/county-briefings/pope` | Pope pilot briefing |
| `/county-briefings/pope/v2` | Pope v2 sample dashboard |
| `/get-involved` | Volunteer / engagement |

### Admin (after login)

| URL | Purpose |
|-----|---------|
| `/admin/ask-kelly` | Candidate command console (cards + county expansion + integrations) |
| `/admin/orchestrator` | Live pipeline KPIs (primary) |
| `/admin/workbench` | Campaign workbench + CM bands |
| `/admin/pages` | Page content |
| `/admin/insights` | **Placeholder** (honest contrast) |
| `/admin/county-intelligence` | Staff county intelligence (aggregate; defaults described in UI) |

---

## Talking points (short)

- **One OS story:** Public site for voters; admin for staff — **no** admin links in primary public nav/footer (see separation audit).  
- **Review-first:** Page copy and public content change through **editor + confirmations**, not from the Ask Kelly map alone.  
- **KPIs:** **Orchestrator** = real inbound/pipeline aggregates today; **Insights** = explicit **non-product** placeholder.  
- **County story:** **Pope** is the **public model**; **eight counties** are a **documented parity queue**, not live briefing sites yet.  
- **Integrations:** We ship **rails**; **live** provider behavior is **per-environment** — verify before promising sends or OAuth.  
- **Safety:** Aggregates and routing in demo paths — **not** individual voter row browsing from the orientation console.

---

## Known risks

| Risk | Mitigation |
|------|------------|
| **`npm run check`** may log Prisma/DB warnings during static generation if `DATABASE_URL` is missing or tenant unreachable | Use valid local/prod-like env for investor-grade builds; see `DEMO_LOCAL_READINESS.md`. |
| **ESLint warnings** in repo | Pre-existing in some admin files; only block release if your change introduced errors. |
| **Public “dashboard” routes** (`/dashboard`) | Sound like internal tools — clarify **volunteer / demo** if stakeholders confuse (see separation audit P1). |
| **Organizing intelligence tone** | Public education; optional softer copy later — not a routing bug. |
| **Ask Kelly assistant** (public dock) | May mention staff routes in **guided** answers — intentional for trained users; dock UI does not hardcode admin links in chrome (see audit). |

---

## Integrity checks (this gate)

| Check | Result |
|-------|--------|
| **Public / admin leaks** (primary nav, footer, county public hub) | **Pass** — no `/admin` in `primaryNavGroups` / footer; `CountyCommandHub` public mode has no CMS/admin column (see `PUBLIC_SITE_ALIGNMENT_AND_ADMIN_SEPARATION_AUDIT.md`). |
| **Fake “live” claims** in candidate console | **Pass** — cards use **Live / Setup needed / Planned**; insights and eight-county expansion explicitly **scaffold / planned**; integration panel does not assert production connectivity. |

---

## Build verification

Run from repo:

```bash
cd RedDirt
npm run check
```

Expect: `lint:all` (warnings may exist) → `typecheck` → `next build`. **Exit code 0** = gate satisfied for CI-style readiness.

---

## Related documents

- `docs/DEMO_LOCAL_READINESS.md` — local run and URL checklist  
- `docs/NORTHWEST_REGION_AND_8_COUNTY_WORKBENCH_PARITY_AUDIT.md` — county parity facts  
- `docs/PUBLIC_SITE_ALIGNMENT_AND_ADMIN_SEPARATION_AUDIT.md` — public vs admin separation  
