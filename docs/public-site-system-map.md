# Public site system map (RedDirt)

**Packet SYS-1.** How the **public** Next.js app is structured, where interactions enter the system, and how that relates to workbenches. Cross-ref: [`workbench-build-map.md`](./workbench-build-map.md), [`system-domain-flow-map.md`](./system-domain-flow-map.md), [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md). **Orchestration (CM-1):** [`campaign-manager-orchestration-map.md`](./campaign-manager-orchestration-map.md), [`incoming-work-matrix.md`](./incoming-work-matrix.md).

---

## 1. Public site inventory (route group `(site)`)

| Area / pattern | File(s) | Purpose |
|----------------|---------|--------|
| **Shell** | `src/app/(site)/layout.tsx` | Public header (`SiteHeader`), `PublicLayoutMain`, footer, **`AskKellyLayout`** (campaign guide dock), skip link. **Intentionally separate from** `/admin` (comment in file). |
| **Root layout** | `src/app/layout.tsx` | Root HTML, fonts, `AnalyticsProvider` — no public nav (children only). |
| **Home** | `src/app/(site)/page.tsx` | `HomeExperience` + merged homepage config. |
| **About / meet** | `(site)/about/*`, `understand`, `what-we-believe` | Biography, office explainer, values. |
| **Priorities & civic** | `priorities`, `civic-depth`, `direct-democracy/*` | Policy / ballot education. |
| **News & stories** | `from-the-road`, `press-coverage`, `stories/*`, `editorial`, `blog/*` | Content surfaces (some may pull CMS/content helpers). |
| **Events** | `events`, `campaign-calendar`, `campaign-calendar/[slug]` | Public event hub & calendar. |
| **Get involved** | `get-involved`, `host-a-gathering`, `listening-sessions`, `start-a-local-team` | Join/volunteer/gathering flows (forms). |
| **Voter registration** | `voter-registration`, `voter-registration/assistance` | `VoterRegistrationCenter`, county metrics from voter file. |
| **Local & labor** | `local-organizing/*`, `labor-and-work` | County/organizing content. |
| **Resources & explainers** | `resources/*`, `explainers/*` | Toolkits, deep pages. |
| **Donate** | `donate` | Explains external GoodChange (see `config/site.ts` + `config/external-campaign.ts`). |
| **County command (public)** | `counties`, `counties/[slug]` | County public pages. |
| **Navigation** | `src/config/navigation.ts` | `primaryNavGroups`, footer; drives `SiteHeader` / `NavDesktop`. |
| **Site config** | `src/config/site.ts` | Titles, URLs, donate href. |

**API routes (public-relevant):**

| Route | File | Role |
|-------|------|------|
| Forms (canonical intake) | `src/app/api/forms/route.ts` | `POST` → `persistFormSubmission` in `src/lib/forms/handlers.ts` |
| Intake (legacy) | `src/app/api/intake/route.ts` | 410 / points to `/api/forms` |
| Search | `src/app/api/search/route.ts` | `SearchChunk` + optional OpenAI answer |
| Assistant | `src/app/api/assistant/route.ts` | Campaign guide chat (RAG/grounding) |
| Analytics | `src/app/api/analytics/route.ts` | Event tracking |

**Legacy note:** `GET/POST /api/intake` explicitly says to use `POST /api/forms` (see `api/intake/route.ts`).

---

## 2. Public site framework

- **Layout:** Fixed header with resize observer setting `--site-header-h` for layout shim (`SiteHeader` + `globals.css` variables). Main content in `#main-content` with `PublicLayoutMain`.
- **Data loading:** Many pages are **static or server components**; voter registration and county pages use Prisma for published counties + `lib/voter-file/queries` for snapshots/rollups.
- **Content merge:** e.g. `getMergedHomepageConfig` in `src/lib/content/homepage-merge` for the home experience.
- **Search:** `src/components/search/SearchDialog.tsx` in header; hits `POST /api/search` (`src/lib/openai/search.ts`, `SearchChunk`).
- **Guide / “Ask”:** `AskKellyLayout` + `CampaignGuideDock` pattern — assistant API (`/api/assistant`) with rate limits, optional streaming (see route).
- **Forms:** `src/lib/forms/schemas.ts` (Zod), `validate.ts`, `handlers.ts` — single persistence path to `User` + `Submission` (+ `VolunteerProfile` / `Commitment` for certain types). **No** `WorkflowIntake` creation in `handlers.ts` (verified by inspection).

---

## 3. Public interaction points (entry → backend)

| Entry | Where | What it does | Expected ops / workbench link |
|-------|--------|--------------|--------------------------------|
| **Join / volunteer / local team / host / democracy forms** | Components under `src/components/forms/*`, pages e.g. `get-involved`, `host-a-gathering` | `fetch` to **`POST /api/forms`** with typed payload | **User** + **Submission** rows; optional **VolunteerProfile**; **classifyIntake** if OpenAI configured. **WorkflowIntake** is *not* auto-created here — staff workflows that need intake are created elsewhere (e.g. social analytics, conversation routing — see `conversation-monitoring-actions`, `workbench-social-actions`). |
| **Suggest a community event** | `SuggestCommunityEventForm` on `(site)/events` + **server action** `src/app/(site)/events/suggest-community-event-action.ts` | **Not** `/api/forms` — creates **`ArkansasFestivalIngest`** for staff review (`workbench/festivals`) | Second, parallel public→ops path; important for integration discipline. |
| **Story submission** | Form + handler branch in `handlers.ts` | `Submission` type story + user | Review/content workflows; not automatically email workflow. |
| **Voter registration center** | `voter-registration/*` + `VoterRegistrationCenter` | Educates, links to SOS tools; may show **county metrics** from DB | Ties to **VoterFileSnapshot** / `CountyVoterMetrics` — **admin** has **voter import**; optional **User ↔ VoterRecord** link in schema for assistance. |
| **Search (⌘K)** | `SearchDialog` | Semantic/keyword over ingested **docs** | Grounding for assistant; **ingest** script populates `SearchChunk` — not voter PII. |
| **Assistant dock** | `AskKellyLayout` / guide | Chat with site content | OpenAI; no direct CRM write. |
| **Donate** | `donate` + `siteConfig.donateHref` | Redirect / explain external **GoodChange** | Fundraising off-site; not stored in this handler path. |
| **Events (public)** | `events`, `campaign-calendar` | List/detail public events | **CampaignEvent** in DB (admin); public may RSVP depending on implementation — check event components for `EventSignup` if extending. |
| **County public pages** | `counties/[slug]` | County narrative + command data | Same **County** model as workbench filters; public vs admin `counties` routes differ (`(site)/counties` vs `admin/counties`). |

---

## 4. Public → operations flow (today)

- **User / contact spine:** `User` (email, phone, county, zip) is upserted from most form posts (`handlers.ts`). This is the natural join key to **Comms** (`CommunicationThread` by email/phone), **email workflow** (optional `userId` on `EmailWorkflowItem`), and **VolunteerProfile**.
- **Intake queue:** `WorkflowIntake` often originates from **admin** or **analytics/conv monitoring** (e.g. `createWorkflowIntake` in `conversation-monitoring-actions.ts`, analytics in `workbench-social-actions.ts`), **not** from a single automatic hook on every public `Submission`. **Gap:** many `Submission` rows are not mirrored to `WorkflowIntake` unless a process creates them.
- **Comms / threads / sends:** **Staff-driven** Gmail, Twilio, SendGrid, workbench UIs — bridge from public is **indirect** (same person in `User` / thread).
- **Email workflow queue:** `EmailWorkflowItem` — E-1/E-2; **no** public route posts directly to it; future triggers would link from thread/intake/monitoring.
- **Tasks / events:** `CampaignEvent`, `CampaignTask` — created from calendar HQ, templates, social, etc.; public “suggest event” uses **`suggestCommunityEventAction`** → **`ArkansasFestivalIngest`** (see `suggest-community-event-action.ts`), then **workbench festivals** for promotion — distinct from `/api/forms`.
- **Content / review:** Admin **review-queue**, **content**, **editorial** — public site consumes published content; **connect is publish pipeline**, not live sync.
- **Voter data:** Ingestion pipeline in `prisma` (`VoterFileSnapshot`, `VoterRecord`, `CountyVoterMetrics`) + admin **voter-import**; public pages **read** metrics where implemented.

**Honest gaps:** End-to-end “public form → `WorkflowIntake` → `CommunicationPlan`” is **not** one automatic pipeline in `handlers.ts`; it is **patterned in pieces** in admin and social/monitoring. **Email workflow** is still **workbench-originated** for creation (manual or future triggers).

---

## 5. Risks / gaps

- **Two intake concepts:** `Submission` (all forms) vs `WorkflowIntake` (ops queue) — without a clear rule, operators may look in the wrong place.
- **No single “operations hub”** listing new submissions vs intakes vs email queue (called out in `workbench-build-map.md`).
- **Assistant + search** are **read-mostly** for visitors; they don’t create `Submission` (by design) — if product wants “suggested follow-up,” it must be a new, explicit bridge.
- **PII in search corpus:** Ingestion should stay **docs-only**; `openai/README` warns server-only use.

---

## 6. Fast path — tighten the public / admin loop

1. **Document** the rule: which form types get a `WorkflowIntake` (if any) and when — or add **one** admin action “Promote submission → intake” if automation is rejected.
2. **Surface** recent `Submission` count or list on workbench (reuse DTO pattern) so operators see public entries without SQL.
3. **Link** public-facing **county** and **voter** education pages in admin county picker help text (copy-only, no feature).
4. **Email workflow:** on future trigger design, prefer **`User` / thread / plan** FKs already on `EmailWorkflowItem` (see handoff doc).

---

*Last updated: Packet SYS-1.*
