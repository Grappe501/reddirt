# Kelly SOS — launch status dashboard (KELLY-DASH-1)

**Repository:** `H:\SOSWebsite\RedDirt`  
**Truth:** This repo is the **Kelly Grappe for Arkansas Secretary of State** **production site** and **campaign engine** (public `(site)`, organizer `/relational`, `/admin` workbench, Prisma/Postgres, APIs). The folder name `RedDirt` is **legacy**; ownership is **Kelly SOS**.  
**Last updated:** 2026-04-27 — **Day 4 comms + follow-up pass** (see [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md)).

---

## Clear statement (non-negotiable)

**RedDirt (this repo) = Kelly Grappe for Arkansas Secretary of State production infrastructure** — public marketing site, internal admin, database, forms/intake, comms integrations, and launch platform. It is **not** treated as a generic reusable template during the Kelly launch sprint.

## Current repo purpose

- **Public:** Kelly-branded narrative, issues, counties, events, resources, blog/stories/editorials, voter registration assistance, donate handoff, volunteer intake surfaces.
- **Engine:** Prisma/Postgres campaign data, search/RAG hooks, ingest scripts (operator machine paths), county/Pope briefing, relational organizing shell.
- **Operations:** Admin workbench (comms, email queue, social, owned media, budgets, finance, compliance, volunteers, tasks, events, GOTV, intelligence, etc.).

## In scope for launch (this sprint)

- Kelly-only **public** quality (copy, CTAs, mobile smoke, metadata).
- **Intake** → **Kelly DB** → **admin** visibility/export path documented and tested on staging.
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
| Beta-weighted (RedDirt-only) | **~73%** | [`BETA_LAUNCH_READINESS.md`](./BETA_LAUNCH_READINESS.md) — rescore after RD-4/6 |
| **Public surface (post Day 2–4)** | **~80%** | RD-1 + Day 4 public form “what happens next” expectations + comms runbook in docs |
| Full public + engine (engineering) | **~74–76%** | `npm run check` green; DB seed/migrate pending local Docker |

## Daily notes

**Day 2 (2026-04-26):** RD-1 executed on voter-visible copy: Pope briefing, calendar/events offline messages, ballot explainer, local organizing region page, priorities (new accountability pillar + section). Mobile: header `min-h-11`, drawer link “Get involved on this site.” Map: `sos-leaflet-pin`. **`npm run dev:prepare` failed** (no Postgres on 5433)—start `npm run dev:db` then re-run prepare + optional `db:seed`. **Strategic add-on (same day):** Rockefeller/keeper-of-records/sourced-contrast **research** + `strategicThemes` + **tentative** EHC **intel** file (not public events). Minimal public copy: homepage `FIGHT_FOR` + `/about` hero subtitle. Reports: [`KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md`](./KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md), [`KELLY_SOS_DAY_2_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_2_COMPLETION_REPORT.md), integration plan: [`KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md`](./KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md).

**Day 3 coordination (2026-04-26):** Codex verified root alignment with Cursor markers and switched the active lane to `RedDirt/`. `npm run check` passes when Next worker spawning is allowed; local DB is still unreachable at `127.0.0.1:5433`, so build logs DB-unavailable fallbacks. Code inspection found the Day 3 operational gap: `/api/forms` persists `Submission` and volunteer profile data, but public form submissions do not appear to create `WorkflowIntake`; `/admin/volunteers/intake` is uploaded signup-sheet intake, not the public form queue. Cursor should execute [`KELLY_SOS_NEXT_PASS_SCRIPT.md`](./KELLY_SOS_NEXT_PASS_SCRIPT.md); compression rules are in [`KELLY_SOS_DAY_3_TO_7_EXECUTION_BOARD.md`](./KELLY_SOS_DAY_3_TO_7_EXECUTION_BOARD.md).

**Day 3 implementation (2026-04-26):** Public form persistence now creates a linked `WorkflowIntake` for every successful `Submission`; `npm run typecheck` passes. A transparency vision section was added to `/priorities` for a searchable Secretary of State public-records / FOIA request library, framed as future office leadership starting with Kelly's own office. Full Day 3 smoke remains pending until Postgres is reachable and a fake form submission confirms `User` + `Submission` + `WorkflowIntake` + admin visibility. Report: [`KELLY_SOS_DAY_3_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_3_COMPLETION_REPORT.md).

**Community equity (2026-04-27):** Master plan for **Hispanic, Marshallese, and Muslim** outreach (not a side track): [`docs/campaign-ops/COMMUNITY_EQUITY_OUTREACH_MASTER_PLAN.md`](./campaign-ops/COMMUNITY_EQUITY_OUTREACH_MASTER_PLAN.md) · admin hub **`/admin/campaign-ops/community-equity`** · Calendar workflow `s4_event_faith_venue_polling_v1` for **mosque polling place** (apply to a **MEETING** after `db:seed` / deploy seed).

**Day 4 (2026-04-27):** [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md) documents the follow-up path (workbench, webhooks, env **names** only, manual 3×/day fallback). Public `FormSuccessPanel` default includes a business-day / 24h expectation blurb; volunteer form keeps its own coordinator copy (blurb suppressed there to avoid duplication). **Automatic** confirmation email for every submit is still **out of scope** until templates + keys are review-approved. Report: [`KELLY_SOS_DAY_4_COMPLETION_REPORT.md`](./KELLY_SOS_DAY_4_COMPLETION_REPORT.md). **Next:** Day 5 compliance + security pass.

## Area status (rolling)

| Area | Status |
|------|--------|
| **Public site** | **RD-1 complete** for rendered strings on `(site)` + Pope briefing; residual dev-only `TODO` comments in JSX; DB-backed pages still need **published** data + running DB for local preview. |
| **Admin / engine** | Broad surface; middleware gates `/admin` on `ADMIN_SECRET`; fine-grained RBAC not fully documented per route. |
| **Database / Prisma** | Mature schema; local/staging must run Postgres for faithful SSG and forms; builds may log Prisma connection errors if DB down (see build log). |
| **Intake / contact / volunteer** | **`POST /api/forms`** canonical; multiple public forms (`get-involved`, events suggest, host gathering, local team, story submit, direct democracy commitment, etc.). |
| **Donation / compliance** | External GoodChange default in `external-campaign.ts`; paid-for bar via policy module + env; treasurer review for live URLs. |
| **Comms / email / SMS** | **Day 4 runbook** in [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md); SendGrid/Twilio webhooks + workbench; **keys** and staging E2E still a risk. |
| **Deployment** | Netlify pattern documented in `docs/deployment.md`; env parity to be verified Day 6. |

## Known risks (rolling)

1. **Prisma/DB** unavailable during build → error spam; production must keep DB healthy.
2. **Counsel/treasurer** review of new `/priorities` accountability framing + any **sourced** opponent contrast or **long-form** Rockefeller attribution.
3. **Strategic** copy: new `/about` hero text and homepage line should get a **comms** read (Day 2 is values-only; no attack lines added on-site).
4. **Empty DB** → thin counties/blog sync.
5. **Missing integration keys** → silent feature loss.
6. **Admin breadth** — not every lane hardened for untrained users.
7. **Sister app confusion** — countyWorkbench vs RedDirt counties.

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
- [ ] Staging smoke: one fake POST with DB up → visible in admin workbench (operator proof — optional local).

## Day 4 exit criteria (comms + follow-up)

- [x] Runbook: [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md).
- [x] Public expectation copy on `FormSuccessPanel` (volunteer form opts out; has its own text).
- [ ] Steve: SLA table + auto-confirm email decision.

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
