# Kelly Grappe for Arkansas Secretary of State — 7-day launch master build plan

**Doc ID:** KELLY-7DAY-1  
**Scope:** `H:\SOSWebsite\RedDirt` — **Kelly SOS production** site, campaign engine, admin, database, and launch platform.  
**Folder name `RedDirt` is legacy;** all sprint work assumes **Kelly Grappe for SOS** ownership.  
**Last updated:** 2026-04-26

**Related reads:** [`README.md`](../README.md) · [`RED_DIRT_BUILD_PROTOCOL.md`](./RED_DIRT_BUILD_PROTOCOL.md) · [`RED_DIRT_OPERATING_SYSTEM_MAP.md`](./RED_DIRT_OPERATING_SYSTEM_MAP.md) · [`RED_DIRT_PACKET_QUEUE.md`](./RED_DIRT_PACKET_QUEUE.md) · [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) · [`BETA_LAUNCH_READINESS.md`](./BETA_LAUNCH_READINESS.md) · [`H:\SOSWebsite\KELLY_SOS_RECLASSIFICATION_AND_MIGRATION_MAP.md`](../../KELLY_SOS_RECLASSIFICATION_AND_MIGRATION_MAP.md) · [`H:\SOSWebsite\brands\kelly-grappe-sos\LAUNCH_STATUS_REPORT.md`](../../brands/kelly-grappe-sos/LAUNCH_STATUS_REPORT.md)

---

## 1. Executive command summary

- **RedDirt = Kelly Grappe for Arkansas Secretary of State production build.** This repository is the **live** combined public website, **campaign engine**, **admin / workbench**, **Prisma/Postgres** data plane, integrations (email/SMS, webhooks, calendar, etc.), and **launch platform** for the Kelly SOS race. It is **not** a generic reusable template in this sprint.
- **Launch objective:** Ship a **deployable, demo-ready Kelly SOS** experience: trustworthy public pages, working intake into **Kelly-only** storage, operable admin for a small team, **compliance-safe** footer and policies, documented deploy path, and **no cross-lane data leakage** (AJAX / PhatLip / countyWorkbench / future template).
- **Template extraction** is **explicitly future work** — after Kelly launch stability. Do **not** scrub Kelly content or genericize the tree during this sprint.
- **Legal/data firewall:** Kelly **contacts, volunteers, finance, donors, strategy, internal workflows, and voter-adjacent operational data** stay in **Kelly-only** environments. **No shared production database** with other brands. **Per-brand** secrets and env. No mixing youth/AJAX/countyWorkbench **datasets** into Kelly workflows without a separate, legal-reviewed architecture decision.

---

## 2. Current build reality (blunt)

| Area | Status |
|------|--------|
| **Public site** | **Strong shell** — large `(site)` route map, narrative depth, editorial/blog/stories, counties hub, events, donate, get-involved. **Risk:** copy QA (RD-1), DB-empty thin states, mobile not formally audited. |
| **Admin system** | **Broad and deep** — workbench, comms, relational contacts, volunteers, finance, compliance, media, social, tasks, GOTV, intelligence. **Risk:** not every lane production-hardened; needs smoke runbook + env. |
| **Database / Prisma** | **Mature schema** (100+ models per docs). **Risk:** production must be **up** and migrated; local build can **log Prisma errors** if Postgres missing while still exiting 0 — **do not** confuse with prod health. |
| **Intake / volunteer / contact** | **`POST /api/forms`** is canonical persistence path; legacy **`/api/intake`** returns **410** toward `/api/forms`. **Risk:** spam, rate limits, OpenAI classification optional; verify end-to-end on staging with real DB. |
| **Donation / compliance** | GoodChange / external handoff patterns documented as stable in beta readiness. **Risk:** treasurer-approved paid-for line and link drift. |
| **County / field ops** | `/counties`, `/county-briefings/pope`, admin county intel. **Risk:** **countyWorkbench** is a **sister repo** — don’t merge products by accident. |
| **Comms / email / SMS** | SendGrid + Twilio in stack; comms workbench in admin. **Risk:** missing keys → silent failure; stub/fallback policy needed by Day 4. |
| **Content polish** | Good narrative; **BETA** calls out internal mirror / long-tail gaps, gate labels on briefing copy. |
| **Deployment** | Netlify + `docs/deployment.md` pattern; `npm run check` is quality gate. **Risk:** env drift between local and Netlify. |
| **Known risks** | DB empty on first deploy; missing API keys; scope creep into sister apps; duplicate public surface if `sos-public` also marketed as canonical without decision. |

---

## 3. Definition of launch-ready

Launch-ready **for Kelly SOS** means all of the following are **true** (or **documented exceptions** with owner + date):

1. **Public site runs locally** — `npm run dev:full` or documented equivalent; home and critical CTAs load.
2. **Public routes polished** — no maintainer-only language, no `H:\` paths, no embarrassing placeholders on **live** paths (RD-1 satisfied).
3. **Volunteer / contact intake works** — `POST /api/forms` succeeds on staging with validation + persistence; spam honeypot behaves.
4. **Data stores safely** — Kelly **production** Postgres only for Kelly prod; migrations applied; backups/ops understood.
5. **Admin can view / export / action submissions** — at least one **documented** path: login → intake/volunteer/relational queue → export or status change.
6. **Donate path works** or **safely links externally** — treasurer-approved URL; no broken primary CTA.
7. **Compliance footer / policy language** — paid-for line, privacy/terms/disclaimer present and accurate enough for counsel review sign-off.
8. **No cross-lane data leakage** — no AJAX/PhatLip/countyWorkbench data in Kelly DB; no accidental imports in code paths.
9. **`npm run check` passes** — or **known exceptions** logged in `KELLY_SOS_BUILD_LOG.md` with mitigation (e.g. CI DB container).
10. **Netlify / deploy path confirmed** — env var list checked against staging/prod; plugin and build command verified.
11. **Steve can demo confidently** — 10-minute script: home → issue → county or event → donate → volunteer → admin intake peek.

---

## 4. Seven-day sprint overview

| Day | Theme | Primary outcome | Files likely touched | Commands / checks | Exit criteria | Risk |
|-----|--------|-----------------|----------------------|-------------------|---------------|------|
| **1** | Canonicalization, firewall, build truth | Everyone agrees **Kelly SOS** owns this repo; baseline logs exist | `README.md`, `docs/KELLY_SOS_*`, `PROJECT_MASTER_MAP.md` (note) | `npm run lint:all`, `npm run typecheck`, `npm run check` (ideal) | Dashboard + route map + build log updated; no ownership ambiguity | Low |
| **2** | Public polish + CTAs | Launch-quality public UX and copy | `src/app/(site)/**`, `src/content/**`, `src/config/**` | `npm run build`, manual route QA | Visitor can understand, trust, act | Medium |
| **3** | Intake, DB, admin, automation | Submission → DB → admin → report is boringly reliable | `src/app/api/forms/**`, `src/lib/forms/**`, `prisma/**`, admin intake views | `prisma migrate`, `db:ping`, form POST tests | Campaign sees every submission; isolation proven | High |
| **4** | Comms + follow-up | Every submission has a follow-up path | Twilio/SendGrid routes, comms libs, templates doc | Webhook tests (staging), env audit | Confirm or stub + manual fallback documented | High |
| **5** | Compliance + security | Legal/data risk reduced | Legal pages, footer, `financial-transactions` access, `.gitignore` / secret scan | `grep` audits, role review | Checklists signed off by Steve/counsel path | High |
| **6** | Deploy + QA + demo | Production-shaped smoke green | `docs/deployment.md`, Netlify env | Full `npm run check`, mobile smoke | Steve demo script passes | Medium |
| **7** | Launch lock + next phase | Frozen package + backlog | All `KELLY_SOS_*` logs, `BETA_LAUNCH_READINESS.md` rescore | Final `npm run check` | Launch go/no-go clear; template plan **separate** | Low |

---

## 5. Daily build plans — granular detail

### Day 1 — Canonicalization, firewall, and build truth

**Goal:** Make this repo **self-aware** as Kelly SOS and eliminate confusion.

**Tasks:**

- Update **`README.md`** with a short Kelly SOS identity block (folder = Kelly production; pointer to this master plan). Keep technical quick-start accurate.
- **Verify firewall docs:** `docs/KELLY_SOS_FIREWALL_RULES.md` + root `brands/kelly-grappe-sos/`.
- **Canonical public routes:** complete `docs/KELLY_SOS_ROUTE_MAP.md` from `(site)` tree + build output.
- **CTAs + form endpoints:** document `/api/forms`, component map (Day 2 expands).
- **Admin routes:** high-level `/admin/*` map in route doc.
- **Baseline:** `npm run check` with DB up if possible; log in `KELLY_SOS_BUILD_LOG.md`.
- **Launch dashboard:** refresh `KELLY_SOS_LAUNCH_STATUS.md` with % and risks.

**Deliverables:**

- `docs/KELLY_SOS_LAUNCH_STATUS.md`
- `docs/KELLY_SOS_FIREWALL_RULES.md`
- `docs/KELLY_SOS_ROUTE_MAP.md`
- `docs/KELLY_SOS_BUILD_LOG.md`

**Exit criteria:**

- No ambiguity: **Kelly owns RedDirt** for this sprint.
- Baseline build status **recorded**.

---

### Day 2 — Public site polish and CTA completion

**Goal:** Public site is **launch-quality**.

**Tasks:**

- Audit **home**, **about**, **priorities**, **donate**, **get-involved**, **events** sample, **counties** hub, **Pope briefing** (if in scope), **voter-registration** paths.
- **Mobile** pass on home, counties, get-involved, donate.
- **Footer / compliance** — paid-for, privacy/terms links.
- **Metadata / OpenGraph** — `NEXT_PUBLIC_SITE_URL` and key layouts.
- Remove **placeholder** / internal jargon (execute **RD-1** from [`RED_DIRT_PACKET_QUEUE.md`](./RED_DIRT_PACKET_QUEUE.md)).
- **Link sweep** — internal + external; fix 404s.

**Deliverables:**

- Route QA checklist (can live in `KELLY_SOS_LAUNCH_STATUS.md` or new `docs/KELLY_SOS_PUBLIC_QA_CHECKLIST.md` if created Day 2)
- Mobile QA checklist
- CTA link report (donate, volunteer, contact)

**Exit criteria:**

- Public visitor can **understand, trust, and act**.

---

### Day 3 — Intake, database, admin workflow, automation

**Goal:** System is **operational** enough to compress Days 4–7.

**Tasks:**

- Confirm Prisma models for **Submission**, **VolunteerProfile**, **WorkflowIntake**, **RelationalContact** (exact names in `schema.prisma`).
- Confirm **Kelly-only** `DATABASE_URL` on staging/prod.
- Trace **`persistFormSubmission`** from `/api/forms` to DB.
- **Admin:** intake review UI — if gap, smallest additive PR + doc.
- **Export:** CSV or existing export — if missing, smallest safe addition or documented manual query.
- **Status fields/tags** — only if blocking ops; avoid schema churn without need.
- **Automation:** daily checklist command — e.g. `npm run check` + `db:ping` in one npm script **or** documented PowerShell one-liner in `docs/quick-start.md`.
- **Handoff:** finalize use of [`KELLY_SOS_CURSOR_CHATGPT_PROTOCOL.md`](./KELLY_SOS_CURSOR_CHATGPT_PROTOCOL.md) + [`KELLY_SOS_DAILY_STATUS_TEMPLATE.md`](./KELLY_SOS_DAILY_STATUS_TEMPLATE.md).
- **Optional:** script that appends build summary to `KELLY_SOS_BUILD_LOG.md` (non-secret).

**Deliverables:**

- Working intake path (staging proof)
- Admin review/export path (or honest gap + workaround)
- Automation checklist doc section
- Launch status report **template** (daily block)

**Exit criteria:**

- Visitor submits → campaign sees → data **isolated** → status reportable in **under 15 minutes**.

---

### Day 4 — Comms, follow-up, volunteer activation

**Goal:** Turn intake into **action**.

**Tasks:**

- Review SendGrid/Twilio **webhook** and outbound usage; list required env vars (**names only** in docs).
- If live keys unavailable: **stub mode** or “degraded but honest” UI for operators.
- **Confirmation** — auto-reply design (email/SMS) or explicit “we’ll contact you” copy.
- **Internal notification** — who gets alerted (role, email, Slack later).
- **Volunteer routing** — interest tags → admin view or segment.
- **County field routing** — if schema supports county on form, map to admin filter.
- **Manual fallback** — printable runbook: “3x daily check admin inbox.”

**Deliverables:**

- `docs/KELLY_SOS_COMMS_READINESS.md` (create if needed) or section in launch status
- Volunteer routing map
- Confirmation templates (copy only, no secrets)
- Manual fallback plan

**Exit criteria:**

- **Every submission** has a documented follow-up path within **24h** campaign SLA (define SLA with Steve).

---

### Day 5 — Compliance, security, privacy, finance firewall

**Goal:** Reduce **legal/data** risk before launch.

**Tasks:**

- Privacy policy, terms, disclaimer pages — content + links in footer.
- **Paid-for** line — treasurer-approved.
- **Donation links** — UTM + compliance.
- **Finance routes** — `/admin/financial-transactions` access controlled; no public leakage.
- **Secrets** — no keys in git; `.env.example` complete; scan recent commits (process only).
- **Cross-lane imports** — grep for `ajax`, `phatlip`, `countyWorkbench` paths in `src/` (should be none or doc-only).
- **Role-based admin** — document who can see PII vs finance.

**Deliverables:**

- Compliance checklist (append to launch status or `KELLY_SOS_COMPLIANCE_CHECKLIST.md`)
- Security checklist
- Finance firewall checklist
- Launch risk register update

**Exit criteria:**

- **Safer to launch than to stay hidden** (Steve + counsel threshold).

---

### Day 6 — Deployment, QA, demo, stress test

**Goal:** **Deployable** and **demo-ready**.

**Tasks:**

- `npm run check` on clean checkout.
- Local smoke: critical routes + **POST /api/forms** + **admin login**.
- **Netlify:** build plugin, env parity doc update.
- **Production URL** assumptions documented.
- **Mobile** smoke second pass.
- **Demo script for Steve** (10–15 min).

**Deliverables:**

- Deployment checklist
- Environment checklist (names only + where to set)
- Smoke test report row in `KELLY_SOS_BUILD_LOG.md`
- Demo script in `KELLY_SOS_LAUNCH_STATUS.md` or separate `KELLY_SOS_DEMO_SCRIPT.md`

**Exit criteria:**

- Steve opens site and can **explain** it to a donor or volunteer.

---

### Day 7 — Launch lock, cleanup, and next phase

**Goal:** Finalize **launch package**; **template extraction** documented as **later**.

**Tasks:**

- **Freeze** launch branch/tag (process decision with Steve — no destructive git).
- Final doc pass: `BETA_LAUNCH_READINESS.md` score, `KELLY_SOS_LAUNCH_STATUS.md`.
- **Known issues** list — P0/P1/P2.
- **Post-launch backlog** — features deferred.
- **Future template extraction plan** — reference `KELLY_SOS_RECLASSIFICATION_AND_MIGRATION_MAP.md`; **no execution** now.
- Confirm **no last-minute** cross-lane contamination.
- Confirm **production deploy** path and owner.

**Deliverables:**

- Final launch report (section in launch status or new doc)
- Post-launch backlog
- Future template plan pointer (1 page max)
- **Paste-back** for ChatGPT in `KELLY_SOS_NEXT_PASS_SCRIPT.md` updated to “post-launch maintenance mode”

**Exit criteria:**

- **Kelly SOS can launch**; remaining work is **listed and owned**.

---

## 6. Compression plan (Days 4–7 in one day)

**Precondition:** Day 3 **green** — intake → admin → log is reliable.

**Must be automated / documented by end of Day 3**

- One-command **quality gate** (`npm run check` + DB ping doc).
- **Daily status template** + **blocker log** discipline.
- **Known** env var **name** list for comms + DB.

**Can parallelize**

- **Track A (Comms):** Twilio/SendGrid verification + stub doc.
- **Track B (Compliance):** Footer + policies + finance route review.
- **Track C (Deploy):** Netlify env + smoke script.
- **Track D (Demo):** Steve script draft.

**Must not be rushed**

- **Treasurer/legal** sign-off on paid-for and donation language.
- **Production DB** migration + backup posture.
- **Any change** touching **finance or voter PII** without Steve awareness.

**Requires Steve decision**

- Canonical public domain vs `sos-public` (if still open).
- **Go/no-go** after smoke.
- **SLA** for volunteer response.

**Cursor without asking**

- Route/copy fixes inside `(site)` that match existing patterns.
- Doc updates, grep audits, logging build results.
- Lint-warning cleanup **only** if trivial and scoped.

**Cursor must stop and report**

- Schema migrations that could drop data.
- Any cross-repo import suggesting shared DB.
- Missing secrets that block staging verification.
- Legal/compliance copy rewrites beyond typos.

---

## 7. Cursor + ChatGPT operating system

**Protocol:** [`KELLY_SOS_CURSOR_CHATGPT_PROTOCOL.md`](./KELLY_SOS_CURSOR_CHATGPT_PROTOCOL.md)

| Artifact | Path |
|----------|------|
| Standard formats | In protocol doc |
| Build log | [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md) |
| Decision log | [`KELLY_SOS_DECISION_LOG.md`](./KELLY_SOS_DECISION_LOG.md) |
| Blocker log | [`KELLY_SOS_BLOCKER_LOG.md`](./KELLY_SOS_BLOCKER_LOG.md) |
| Daily template | [`KELLY_SOS_DAILY_STATUS_TEMPLATE.md`](./KELLY_SOS_DAILY_STATUS_TEMPLATE.md) |
| Next paste script | [`KELLY_SOS_NEXT_PASS_SCRIPT.md`](./KELLY_SOS_NEXT_PASS_SCRIPT.md) |

**Legacy alignment:** Continue updating [`RED_DIRT_PACKET_QUEUE.md`](./RED_DIRT_PACKET_QUEUE.md) and [`BETA_LAUNCH_READINESS.md`](./BETA_LAUNCH_READINESS.md) when packets complete.

---

## 8. Automation targets

### Already in repo (`package.json` and scripts)

| Target | Command / script |
|--------|------------------|
| Full quality gate | `npm run check` (= lint + `tsc --noEmit` + `next build`) |
| Lint | `npm run lint:all` |
| Typecheck | `npm run typecheck` |
| DB up (Docker) | `npm run dev:db` |
| Prisma prep | `npm run dev:prepare`, `npm run db:migrate`, `npm run db:seed`, `npm run db:studio` |
| DB ping | `npm run db:ping` |
| Nightly preflight | `npm run nightly:self-build:preflight` |
| Ingest / audits | `npm run audit:campaign-ingestion`, `reconcile:*`, `repair:*`, many `ingest:*` |
| OpenAI check | `npm run check:openai` |

### Recommended to add next (if missing)

| Target | Suggestion |
|--------|------------|
| **Route audit** | Small script: list `src/app/**/page.tsx` paths vs `next build` output |
| **Link checker** | CI job: `npx linkinator` or similar against `next start` localhost |
| **Env checker** | Script: verify required **names** exist in process.env (no value print) |
| **Form endpoint** | `curl` smoke template in docs for `POST /api/forms` |
| **Admin route smoke** | Playwright or scripted `curl` with auth cookie (staging only) |
| **Launch report** | npm script: append timestamp + `git rev-parse --short HEAD` + `npm run check` exit to `KELLY_SOS_BUILD_LOG.md` |

---

## 9. “Make it sing” opportunities (from actual repo shape)

*Cursor may propose implementations in later packets; not all in 7 days.*

1. **Homepage moments** — stronger “why Secretary of State matters” + one **trusted** voter-facing stat from `truth-snapshot` (honest empty states).
2. **Voter trust** — explainer strip linking `/explainers` + voter registration assistance.
3. **County clerk content** — Arkansas-specific clerk guidance aligned with priorities (without duplicating **countyWorkbench** portal).
4. **Volunteer flow** — progressive disclosure on `/get-involved`; clear **24h** expectation.
5. **Admin dashboard** — single “Today” panel: new submissions, upcoming events, comms queue depth.
6. **Mobile** — sticky donate CTA + tap targets on county cards.
7. **Launch demo** — 3-minute “supporter path” vs 3-minute “organizer path” scripts.
8. **Data capture** — minimal extra fields on forms that help **county** routing without friction.
9. **Internal workflows** — keyboard-first triage for inbox/intake.

---

## 10. Exact next Cursor pass

Paste the contents of **[`KELLY_SOS_NEXT_PASS_SCRIPT.md`](./KELLY_SOS_NEXT_PASS_SCRIPT.md)** into Cursor after Steve reviews this plan. It encodes **Day 1** tasks (README Kelly block, route map completion, `npm run check`, dashboard + build log updates).

---

## Final checklist for Steve

- [ ] Read §1–3 with counsel if needed  
- [ ] Confirm Day 1 **README** edit is acceptable  
- [ ] Run or delegate `npm run check` with DB up once  
- [ ] Record canonical public domain decision in [`KELLY_SOS_DECISION_LOG.md`](./KELLY_SOS_DECISION_LOG.md)  

---

*End KELLY-7DAY-1*
