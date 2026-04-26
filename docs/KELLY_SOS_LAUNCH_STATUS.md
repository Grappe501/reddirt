# Kelly SOS — launch status dashboard (KELLY-DASH-1)

**Repository:** `H:\SOSWebsite\RedDirt`  
**Truth:** This repo is the **Kelly Grappe for Arkansas Secretary of State** **production site** and **campaign engine** (public `(site)`, organizer `/relational`, `/admin` workbench, Prisma/Postgres, APIs). The folder name `RedDirt` is **legacy**; ownership is **Kelly SOS**.  
**Last updated:** 2026-04-26 — **Section 3 launch lock packet** ([`KELLY_SOS_SECTION_3_LAUNCH_LOCK.md`](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md)) — go/no-go table, P0/P1/P2, post-launch backlog, optional git tag. **Formal counsel/treasurer initials** still pending; **Netlify preview** smoke still recommended before apex. **Cursor next pass:** **maintenance** ([`KELLY_SOS_NEXT_PASS_SCRIPT.md`](./KELLY_SOS_NEXT_PASS_SCRIPT.md)).

---

## Clear statement (non-negotiable)

**RedDirt (this repo) = Kelly Grappe for Arkansas Secretary of State production infrastructure** — public marketing site, internal admin, database, forms/intake, comms integrations, and launch platform. It is **not** treated as a generic reusable template during the Kelly launch sprint.

## Current repo purpose

- **Public:** Kelly-branded narrative, issues, counties, events, resources, blog/stories/editorials, voter registration assistance, donate handoff, volunteer intake surfaces.
- **Engine:** Prisma/Postgres campaign data, search/RAG hooks, ingest scripts (operator machine paths), county/Pope briefing, relational organizing shell.
- **Operations:** Admin workbench (comms, email queue, social, owned media, budgets, finance, compliance, volunteers, tasks, events, GOTV, intelligence, etc.).

## In scope for launch (this sprint)

- Kelly-only **public** quality (copy, CTAs, mobile smoke, metadata).
- **Intake** → **Kelly DB** → **admin** visibility/export path documented; **local** E2E done; **hosted** `POST` smoke on **Netlify preview** still recommended before launch.
- **Compliance** footer/policies/paid-for line aligned with treasurer/counsel.
- **Deploy** path and env **names** documented; `npm run check` green with known DB caveats documented.
- **Firewall** docs and **no cross-lane** data mixing.

## Out of scope (this sprint)

- **Generic template extraction** or scrubbing Kelly content for reuse.
- **AJAX**, **PhatLip**, **countyWorkbench** product work (separate repos/deploys).
- **`sos-public`** integration decisions (monorepo reference only unless Steve opens a packet).
- Destructive git, folder moves, production Netlify setting changes without explicit approval.

## Current estimated launch readiness

| Lens | Estimate | Source |
|------|----------|--------|
| Beta-weighted (RedDirt-only) | **~74%** | [`BETA_LAUNCH_READINESS.md`](./BETA_LAUNCH_READINESS.md) — Day 5 legal/footer pass |
| **Public surface (post Day 2–5)** | **~82%** | RD-1 + comms + **Legal routes** + draft privacy/terms + disclaimer |
| Full public + engine (engineering) | **~77–78%** | `npm run check` green; staging E2E + keys still the lift |

## Daily notes

**Day 2 (2026-04-26):** RD-1 executed on voter-visible copy: Pope briefing, calendar/events offline messages, ballot explainer, local organizing region page, priorities (new accountability pillar + section). Mobile: header `min-h-11`, drawer link “Get involved on this site.” Map: `sos-leaflet-pin`. **`npm run dev:prepare` failed** (no Postgres on 5433)—start `npm run dev:db` then re-run prepare + optional `db:seed`. **Strategic add-on (same day):** Rockefeller/keeper-of-records/sourced-contrast **research** + `strategicThemes` + **tentative** EHC **intel** file (not public events). Minimal public copy: homepage `FIGHT_FOR` + `/about` hero subtitle. Reports: [`KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md`](./KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md), [`KELLY_SOS_DAY_2_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_2_COMPLETION_REPORT.md), integration plan: [`KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md`](./KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md).

**Day 3 coordination (2026-04-26):** Codex verified root alignment with Cursor markers and switched the active lane to `RedDirt/`. `npm run check` passes when Next worker spawning is allowed.

**Day 3 implementation + E2E (2026-04-26):** Public form persistence creates a linked `WorkflowIntake` for each successful `Submission`. **Local proof:** Docker Postgres on `127.0.0.1:5433`, `POST /api/forms` for **`join_movement`** and **`volunteer`** → `User`, `Submission`, `WorkflowIntake` (PENDING); **`VolunteerProfile`** for volunteer path. Logged in [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md). **`/admin/volunteers/intake`** remains uploaded-sheet intake (distinct from public JSON queue); operators use **`/admin/workbench`** open-work / `WorkflowIntake`. Report: [`KELLY_SOS_DAY_3_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_3_COMPLETION_REPORT.md).

**Community equity (2026-04-27):** Master plan for **Hispanic, Marshallese, and Muslim** outreach (not a side track): [`docs/campaign-ops/COMMUNITY_EQUITY_OUTREACH_MASTER_PLAN.md`](./campaign-ops/COMMUNITY_EQUITY_OUTREACH_MASTER_PLAN.md) · admin hub **`/admin/campaign-ops/community-equity`** · Calendar workflow `s4_event_faith_venue_polling_v1` for **mosque polling place** (apply to a **MEETING** after `db:seed` / deploy seed).

**Day 4 (2026-04-27):** [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md) documents the follow-up path (workbench, webhooks, env **names** only, manual 3×/day fallback). Public `FormSuccessPanel` default includes a business-day / 24h expectation blurb; volunteer form keeps its own coordinator copy (blurb suppressed there to avoid duplication). **Automatic** confirmation email for every submit is still **out of scope** until templates + keys are review-approved. Report: [`KELLY_SOS_DAY_4_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_4_COMPLETION_REPORT.md).

**Day 5 (2026-04-27):** Public **Legal** group in footer: `/privacy`, `/terms`, `/disclaimer` (drafts for **counsel** on privacy/terms; disclaimer uses `CAMPAIGN_POLICY_V1` paid-for line). [`KELLY_SOS_COMPLIANCE_CHECKLIST.md`](./KELLY_SOS_COMPLIANCE_CHECKLIST.md) · [`KELLY_SOS_DAY_5_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_5_COMPLETION_REPORT.md). **Comms:** SLA table filled with **operating defaults**; auto-confirm **deferred**. **Deployment** env table: `ADMIN_SECRET` + comms. **Intake:** [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md). **Next:** **Day 6** staging smoke + Netlify env parity per [`KELLY_SOS_DEMO_AND_DEPLOY.md`](./KELLY_SOS_DEMO_AND_DEPLOY.md).

## Area status (rolling)

| Area | Status |
|------|--------|
| **Public site** | **RD-1 complete** for rendered strings on `(site)` + Pope briefing; residual dev-only `TODO` comments in JSX; DB-backed pages still need **published** data + running DB for local preview. |
| **Admin / engine** | Broad surface; middleware gates `/admin` on `ADMIN_SECRET`; fine-grained RBAC not fully documented per route. |
| **Database / Prisma** | Mature schema; local/staging must run Postgres for faithful SSG and forms; builds may log Prisma connection errors if DB down (see build log). |
| **Intake / contact / volunteer** | **`POST /api/forms`** canonical; multiple public forms (`get-involved`, events suggest, host gathering, local team, story submit, direct democracy commitment, etc.). |
| **Donation / compliance** | External GoodChange default in `external-campaign.ts`; paid-for bar via policy module + env; treasurer review for live URLs. |
| **Comms / email / SMS** | **SLA defaults** in [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md) §5; auto-confirm **deferred**; keys + staging E2E still a risk. |
| **Deployment** | `docs/deployment.md` + CI **`check.yml`**; **Section 1** report done; **Netlify deploy-preview** smoke optional before apex ([`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md)). |
| **Legal / compliance** | `/privacy`, `/terms` **draft**; `/disclaimer` + paid-for; **counsel** to finalize. **Section 2:** procedure in [`KELLY_SOS_SECTION_2_DEEP_BUILD.md`](./KELLY_SOS_SECTION_2_DEEP_BUILD.md). |

## Known risks (rolling)

1. **Prisma/DB** unavailable during build → error spam; production must keep DB healthy.
2. **Counsel/treasurer** review of new `/priorities` accountability framing + any **sourced** opponent contrast or **long-form** Rockefeller attribution.
3. **Strategic** copy: new `/about` hero text and homepage line should get a **comms** read (Day 2 is values-only; no attack lines added on-site).
4. **Empty DB** → thin counties/blog sync.
5. **Missing integration keys** → silent feature loss.
6. **Admin breadth** — not every lane hardened for untrained users.
7. **Sister app confusion** — countyWorkbench vs RedDirt counties.
8. **Formal signatures** — counsel/treasurer initials on [`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md) still pending (waiver in place for technical gate).

## Post-launch backlog (Kelly SOS — maintenance)

Tracked in detail in [`KELLY_SOS_SECTION_3_LAUNCH_LOCK.md`](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md) § Post-launch backlog: **template extraction deferred**, auto-confirm email deferred, OpenAI / `sos-public` domain / RBAC hardening as separate packets. No cross-lane imports without Steve’s integration packet.

## Next six sprint days (summary)

| Day | Theme |
|-----|--------|
| **2** | Public polish, CTAs, mobile, footer/metadata, link sweep (execute RD-1). |
| **3** | Intake → DB → admin review/export; automation + handoff discipline. |
| **4** | Comms follow-up, confirmations, stubs if keys missing. |
| **5** | Compliance, security, finance access review. |
| **6** | Deploy QA, smoke tests, demo script. |
| **7** | Launch lock, known issues, backlog, template extraction **deferred** doc. |

Detail: [`KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md`](./KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md)

## Day 1 exit criteria (this pass)

- [x] Kelly SOS ownership documented in README + this file.
- [x] Firewall rules expanded.
- [x] Route / API / CTA inventory in [`KELLY_SOS_ROUTE_MAP.md`](./KELLY_SOS_ROUTE_MAP.md).
- [x] Baseline `npm run check` recorded in [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md).
- [x] Completion report: [`KELLY_SOS_DAY_1_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_1_COMPLETION_REPORT.md).

## Day 2 exit criteria

- [x] RD-1 voter-visible sweep (see polish report).
- [x] CTA / mobile spot fixes documented.
- [x] `npm run check` captured in build log.
- [x] [`KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md`](./KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md) + [`KELLY_SOS_DAY_2_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_2_COMPLETION_REPORT.md).

## Day 3 exit criteria (intake chain)

- [x] `WorkflowIntake` created for public `/api/forms` success paths (see `handlers.ts`).
- [x] **Operator proof:** [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md) run locally (DB + `npm run dev`); results in [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md). **Staging URL** smoke still follow-up for Day 6.

## Day 4 exit criteria (comms + follow-up)

- [x] Runbook: [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md).
- [x] Public expectation copy on `FormSuccessPanel` (volunteer form opts out; has its own text).
- [x] **SLA** defaults documented (Steve may edit in place); **auto-confirm** explicitly **deferred**.

## Day 5 exit criteria (compliance + security)

- [x] [`KELLY_SOS_COMPLIANCE_CHECKLIST.md`](./KELLY_SOS_COMPLIANCE_CHECKLIST.md) created; paid-for, admin gate, financial routes under `requireAdminPage` recorded.
- [x] **Legal** routes + footer; [`KELLY_SOS_DAY_5_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_5_COMPLETION_REPORT.md).
- [x] **`docs/deployment.md`** — `ADMIN_SECRET` + comms in env table.
- [x] **Cross-lane** grep: no code imports of PhatLip/AJAX; `countyWorkbench` = link/config only.
- [ ] **Counsel** — final privacy & terms copy (draft **waiver** logged in [`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md) pending formal review).

## Quick links

- [7-day master plan](./KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md)
- [Route map](./KELLY_SOS_ROUTE_MAP.md)
- [Build log](./KELLY_SOS_BUILD_LOG.md)
- [Firewall](./KELLY_SOS_FIREWALL_RULES.md)
- [Decisions](./KELLY_SOS_DECISION_LOG.md)
- [Blockers](./KELLY_SOS_BLOCKER_LOG.md)
- [Cursor ↔ ChatGPT protocol](./KELLY_SOS_CURSOR_CHATGPT_PROTOCOL.md)
- [Day 2 polish report](./KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md)
- [Day 2 completion](./KELLY_SOS_DAY_2_COMPLETION_REPORT.md)
- [Comms & follow-up (Day 4)](./KELLY_SOS_COMMS_READINESS.md)
- [Day 4 completion](./KELLY_SOS_DAY_4_COMPLETION_REPORT.md)
- [Day 5 completion](./KELLY_SOS_DAY_5_COMPLETION_REPORT.md)
- [Compliance checklist](./KELLY_SOS_COMPLIANCE_CHECKLIST.md)
- [Intake smoke](./KELLY_SOS_INTAKE_SMOKE.md)
- [Demo & deploy (Days 6–7)](./KELLY_SOS_DEMO_AND_DEPLOY.md)
- [Day 6 Section 1 report](./KELLY_SOS_DAY_6_SECTION_1_REPORT.md)
- [Section 2 deep build](./KELLY_SOS_SECTION_2_DEEP_BUILD.md)
- [Section 2 sign-off log](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md)
- [Section 3 launch lock](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md)
