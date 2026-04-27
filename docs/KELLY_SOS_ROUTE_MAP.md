# Kelly SOS — route, API, and CTA map (KELLY-RTE-1)

**App:** Kelly Grappe for Arkansas Secretary of State (`RedDirt/`).  
**Method:** Day 1 filesystem + config audit (`src/app/**`, `src/config/**`, `src/middleware.ts`).  
**Last updated:** 2026-04-26 (**Day 2** polish + strategic theme **docs/scaffolding** pass).

**Strategic theme content (not new routes):** `src/content/strategicThemes/`, `src/content/events/tentativeExternalEvents.ts` (external intel only), research under `docs/research/`, `docs/legal/OPPONENT_CONTRAST_FACT_CHECK_MATRIX.md`, `docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md`, `docs/KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md`. See also [`KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md`](./KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md) Day 2 add-on table.

**Day 2 CTA inventory:** Mobile drawer link is **“Get involved on this site”** (not internal ops jargon). Calendar metadata no longer says “operations system.” **sos-public-only** paths (`/meet-kelly`, `/volunteer`, `/contact`, `/county-clerks`, etc.) are documented in [`KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md`](./KELLY_SOS_DAY_2_PUBLIC_POLISH_REPORT.md).

**Legend — launch status (engineering estimate, not legal sign-off):**

- **ready** — structurally sound; minor copy QA may remain.
- **needs polish** — RD-1 copy, data-dependent richness, or mobile pass.
- **data-dependent** — needs DB/seed content for full experience.
- **unknown** — requires manual QA.

**SEO/meta:** Pages with `export const metadata` in `page.tsx` are marked **page metadata**; others may inherit from `layout.tsx` — noted **layout** where applicable.

---

## A. Public and semi-public routes

### A.1 `(site)` — primary public site

| Route | File path | Purpose | Launch status | CTA? | Form? | SEO | Notes |
|-------|-----------|---------|---------------|------|-------|-----|-------|
| `/` | `src/app/(site)/page.tsx` | Home | needs polish | Y | N | layout + merge | DB merges homepage config |
| `/about` | `src/app/(site)/about/page.tsx` | About hub | needs polish | Y | N | page metadata | Kelly story |
| `/about/[slug]` | `src/app/(site)/about/[slug]/page.tsx` | About chapters | needs polish | Y | N | dynamic | SSG paths |
| `/priorities` | `src/app/(site)/priorities/page.tsx` | Issue priorities | needs polish | Y | N | page metadata | SOS-focused |
| `/what-we-believe` | `src/app/(site)/what-we-believe/page.tsx` | Values | needs polish | Y | N | page metadata | |
| `/understand` | `src/app/(site)/understand/page.tsx` | Office explainer | needs polish | Y | N | page metadata | |
| `/civic-depth` | `src/app/(site)/civic-depth/page.tsx` | Civic depth | needs polish | Y | N | unknown | |
| `/donate` | `src/app/(site)/donate/page.tsx` | Donate explainer + external CTA | ready | Y | N | page metadata | GoodChange default |
| `/get-involved` | `src/app/(site)/get-involved/page.tsx` | Volunteer + stay connected | ready | Y | **Y** | page metadata | `JoinMovementForm`, `VolunteerForm` → `/api/forms` |
| `/privacy` | `src/app/(site)/privacy/page.tsx` | Privacy (draft; counsel) | needs polish | Y | N | page metadata | Legal footer |
| `/terms` | `src/app/(site)/terms/page.tsx` | Terms of use (draft; counsel) | needs polish | Y | N | page metadata | Legal footer |
| `/disclaimer` | `src/app/(site)/disclaimer/page.tsx` | Disclaimer (campaign / not SoS) | needs polish | Y | N | page metadata | Legal footer; uses `CAMPAIGN_POLICY_V1` line |
| `/listening-sessions` | `src/app/(site)/listening-sessions/page.tsx` | Listening sessions | needs polish | Y | **Y** | page metadata | `HostGatheringForm` |
| `/host-a-gathering` | `src/app/(site)/host-a-gathering/page.tsx` | Host gathering | needs polish | Y | **Y** | page metadata | `HostGatheringForm` |
| `/start-a-local-team` | `src/app/(site)/start-a-local-team/page.tsx` | Local team | needs polish | Y | **Y** | page metadata | `LocalTeamForm` |
| `/local-organizing` | `src/app/(site)/local-organizing/page.tsx` | Organizing hub | data-dependent | Y | N | unknown | |
| `/local-organizing/[slug]` | `src/app/(site)/local-organizing/[slug]/page.tsx` | Regional hubs | data-dependent | Y | N | dynamic | |
| `/events` | `src/app/(site)/events/page.tsx` | Events list | data-dependent | Y | **Y** | page metadata | `SuggestCommunityEventForm` |
| `/events/[slug]` | `src/app/(site)/events/[slug]/page.tsx` | Event detail | data-dependent | Y | N | dynamic | |
| `/campaign-calendar` | `src/app/(site)/campaign-calendar/page.tsx` | Calendar | data-dependent | Y | N | unknown | DB-backed |
| `/campaign-calendar/[slug]` | `src/app/(site)/campaign-calendar/[slug]/page.tsx` | Calendar entry | data-dependent | Y | N | dynamic | |
| `/voter-registration` | `src/app/(site)/voter-registration/page.tsx` | VR center | needs polish | Y | N | unknown | may use DB counties |
| `/voter-registration/assistance` | `src/app/(site)/voter-registration/assistance/page.tsx` | VR assistance | needs polish | Y | N | page metadata | |
| `/counties` | `src/app/(site)/counties/page.tsx` | Counties hub | data-dependent | Y | N | unknown | Prisma |
| `/counties/[slug]` | `src/app/(site)/counties/[slug]/page.tsx` | County command | data-dependent | Y | N | dynamic | |
| `/direct-democracy` | `src/app/(site)/direct-democracy/page.tsx` | Direct democracy | needs polish | Y | **Y** | unknown | `DirectDemocracyCommitmentForm` |
| `/direct-democracy/ballot-initiative-process` | `src/app/(site)/direct-democracy/ballot-initiative-process/page.tsx` | Process explainer | needs polish | Y | N | page metadata | |
| `/labor-and-work` | `src/app/(site)/labor-and-work/page.tsx` | Legacy movement page / SOS scope note | needs polish | ? | N | unknown | file comment: SOS focus |
| `/blog` | `src/app/(site)/blog/page.tsx` | Blog hub | data-dependent | Y | N | unknown | synced posts |
| `/blog/[slug]` | `src/app/(site)/blog/[slug]/page.tsx` | Blog post | data-dependent | Y | N | dynamic | |
| `/editorial` | `src/app/(site)/editorial/page.tsx` | Editorial hub | needs polish | Y | N | unknown | |
| `/editorial/[slug]` | `src/app/(site)/editorial/[slug]/page.tsx` | Editorial article | needs polish | Y | N | dynamic | |
| `/explainers` | `src/app/(site)/explainers/page.tsx` | Explainers hub | ready | Y | N | unknown | |
| `/explainers/[slug]` | `src/app/(site)/explainers/[slug]/page.tsx` | Explainer | ready | Y | N | dynamic | |
| `/stories` | `src/app/(site)/stories/page.tsx` | Stories hub | needs polish | Y | **Y** | unknown | `StorySubmissionForm` |
| `/stories/[slug]` | `src/app/(site)/stories/[slug]/page.tsx` | Story | needs polish | Y | N | dynamic | |
| `/resources` | `src/app/(site)/resources/page.tsx` | Resources | needs polish | Y | N | page metadata | |
| `/resources/[slug]` | `src/app/(site)/resources/[slug]/page.tsx` | Resource article | needs polish | Y | N | dynamic | |
| `/from-the-road` | `src/app/(site)/from-the-road/page.tsx` | Media / trail | needs polish | Y | N | unknown | embeds env-driven |
| `/press-coverage` | `src/app/(site)/press-coverage/page.tsx` | Press | data-dependent | Y | N | unknown | DB graceful degrade |

### A.2 Public outside `(site)` group

| Route | File path | Purpose | Launch status | CTA? | Form? | SEO | Notes |
|-------|-----------|---------|---------------|------|-------|-----|-------|
| `/county-briefings/pope` | `src/app/county-briefings/pope/page.tsx` | Pope county briefing | data-dependent | Y | N | unknown | DB/intel |

### A.3 Relational organizer (semi-public; auth patterns)

| Route | File path | Purpose | Launch status | CTA? | Form? | SEO | Notes |
|-------|-----------|---------|---------------|------|-------|-----|-------|
| `/relational` | `src/app/relational/page.tsx` | Relational hub | unknown | Y | unknown | unknown | organizer-facing |
| `/relational/login` | `src/app/relational/login/page.tsx` | Login | unknown | N | **Y**? | unknown | |
| `/relational/new` | `src/app/relational/new/page.tsx` | New record flow | unknown | Y | unknown | unknown | |
| `/relational/[id]` | `src/app/relational/[id]/page.tsx` | Contact card | unknown | Y | unknown | unknown | sensitive |

---

## B. Admin / internal routes

**Global gate:** `src/middleware.ts` — for `/admin` paths **except** `/admin/login`, if `ADMIN_SECRET` is unset, redirect to `/admin/login?error=config`. Fine-grained RBAC per route **not** fully cataloged here → treat as **operator trust** until Day 5 review.

| Route | File path | Purpose | Sensitive data risk | Auth / RBAC (obvious) | Launch status | Notes |
|-------|-----------|---------|---------------------|----------------------|---------------|-------|
| `/admin` | `src/app/admin/(board)/page.tsx` | Admin home | medium | ADMIN_SECRET + login | needs polish | |
| `/admin/login` | `src/app/admin/login/page.tsx` | Admin login | low | public form | ready | |
| `/admin/homepage` | `src/app/admin/(board)/homepage/page.tsx` | Homepage config | medium | admin | needs polish | DB |
| `/admin/content` | `src/app/admin/(board)/content/page.tsx` | Content board | medium | admin | needs polish | |
| `/admin/content-graph` | `src/app/admin/(board)/content-graph/page.tsx` | Content graph | medium | admin | unknown | |
| `/admin/pages` | `src/app/admin/(board)/pages/page.tsx` | Pages list | medium | admin | unknown | |
| `/admin/pages/[pageKey]` | `src/app/admin/(board)/pages/[pageKey]/page.tsx` | Page editor | medium | admin | unknown | |
| `/admin/blog` | `src/app/admin/(board)/blog/page.tsx` | Blog admin | medium | admin | unknown | |
| `/admin/blog/[slug]` | `src/app/admin/(board)/blog/[slug]/page.tsx` | Blog post admin | medium | admin | unknown | |
| `/admin/editorial` | `src/app/admin/(board)/editorial/page.tsx` | Editorial admin | medium | admin | unknown | |
| `/admin/stories` | `src/app/admin/(board)/stories/page.tsx` | Stories admin | medium | admin | unknown | |
| `/admin/explainers` | `src/app/admin/(board)/explainers/page.tsx` | Explainers admin | medium | admin | unknown | |
| `/admin/inbox` | `src/app/admin/(board)/inbox/page.tsx` | Inbox | **high** (PII) | admin | unknown | comms |
| `/admin/inbox/[id]` | `src/app/admin/(board)/inbox/[id]/page.tsx` | Inbox thread | **high** | admin | unknown | |
| `/admin/feed` | `src/app/admin/(board)/feed/page.tsx` | Feed | medium | admin | unknown | |
| `/admin/review-queue` | `src/app/admin/(board)/review-queue/page.tsx` | Review | medium | admin | unknown | |
| `/admin/media` | `src/app/admin/(board)/media/page.tsx` | Media | medium | admin | unknown | |
| `/admin/media-library` | `src/app/admin/(board)/media-library/page.tsx` | Media library | medium | admin | unknown | |
| `/admin/media-monitor` | `src/app/admin/(board)/media-monitor/page.tsx` | Media monitor | medium | admin | unknown | |
| `/admin/owned-media` | `src/app/admin/(board)/owned-media/page.tsx` | Owned media | **high** | admin | unknown | campaign assets |
| `/admin/owned-media/[id]` | `src/app/admin/(board)/owned-media/[id]/page.tsx` | Asset detail | **high** | admin | unknown | |
| `/admin/owned-media/grid` | `src/app/admin/(board)/owned-media/grid/page.tsx` | Grid | **high** | admin | unknown | |
| `/admin/owned-media/batches` | `src/app/admin/(board)/owned-media/batches/page.tsx` | Batches | **high** | admin | unknown | |
| `/admin/owned-media/batches/[batchId]` | `src/app/admin/(board)/owned-media/batches/[batchId]/page.tsx` | Batch | **high** | admin | unknown | |
| `/admin/tasks` | `src/app/admin/(board)/tasks/page.tsx` | Tasks | medium | admin | unknown | |
| `/admin/events` | `src/app/admin/(board)/events/page.tsx` | Events admin | medium | admin | unknown | |
| `/admin/events/[id]` | `src/app/admin/(board)/events/[id]/page.tsx` | Event admin | medium | admin | unknown | |
| `/admin/events/community-suggestions` | `src/app/admin/(board)/events/community-suggestions/page.tsx` | Community suggestions | medium | admin | unknown | |
| `/admin/asks` | `src/app/admin/(board)/asks/page.tsx` | Asks | medium | admin | unknown | |
| `/admin/distribution` | `src/app/admin/(board)/distribution/page.tsx` | Distribution | medium | admin | unknown | |
| `/admin/orchestrator` | `src/app/admin/(board)/orchestrator/page.tsx` | Orchestrator | medium | admin | unknown | |
| `/admin/platforms` | `src/app/admin/(board)/platforms/page.tsx` | Platforms | medium | admin | unknown | |
| `/admin/settings` | `src/app/admin/(board)/settings/page.tsx` | Settings | **high** | admin | unknown | |
| `/admin/settings/platforms` | `src/app/admin/(board)/settings/platforms/page.tsx` | Platform settings | **high** | admin | unknown | |
| `/admin/budgets` | `src/app/admin/(board)/budgets/page.tsx` | Budgets | **high** | admin | unknown | finance |
| `/admin/budgets/[id]` | `src/app/admin/(board)/budgets/[id]/page.tsx` | Budget detail | **high** | admin | unknown | |
| `/admin/financial-transactions` | `src/app/admin/(board)/financial-transactions/page.tsx` | Transactions | **high** | admin | unknown | compliance |
| `/admin/compliance-documents` | `src/app/admin/(board)/compliance-documents/page.tsx` | Compliance docs | **high** | admin | unknown | |
| `/admin/gotv` | `src/app/admin/(board)/gotv/page.tsx` | GOTV | **high** | admin | unknown | |
| `/admin/intelligence` | `src/app/admin/(board)/intelligence/page.tsx` | Intelligence | **high** | admin | unknown | |
| `/admin/county-intelligence` | `src/app/admin/(board)/county-intelligence/page.tsx` | County intel | **high** | admin | unknown | |
| `/admin/county-profiles` | `src/app/admin/(board)/county-profiles/page.tsx` | County profiles | **high** | admin | unknown | |
| `/admin/counties` | `src/app/admin/counties/page.tsx` | Counties admin | medium | admin | unknown | |
| `/admin/counties/[slug]` | `src/app/admin/counties/[slug]/page.tsx` | County admin | medium | admin | unknown | |
| `/admin/relational-contacts` | `src/app/admin/(board)/relational-contacts/page.tsx` | Relational CRM | **high** | admin | unknown | PII |
| `/admin/relational-contacts/[id]` | `src/app/admin/(board)/relational-contacts/[id]/page.tsx` | Contact | **high** | admin | unknown | |
| `/admin/volunteers/intake` | `src/app/admin/(board)/volunteers/intake/page.tsx` | Volunteer intake | **high** | admin | unknown | |
| `/admin/volunteers/intake/[documentId]` | `src/app/admin/(board)/volunteers/intake/[documentId]/page.tsx` | Intake doc | **high** | admin | unknown | |
| `/admin/voter-import` | `src/app/admin/(board)/voter-import/page.tsx` | Voter import | **high** | admin | unknown | voter file |
| `/admin/voters/[id]/model` | `src/app/admin/(board)/voters/[id]/model/page.tsx` | Voter model | **high** | admin | unknown | |
| `/admin/insights` | `src/app/admin/(board)/insights/page.tsx` | Insights | medium | admin | unknown | |
| `/admin/workbench` | `src/app/admin/(board)/workbench/page.tsx` | Workbench hub | medium | admin | needs polish | |
| `/admin/workbench/calendar` | `src/app/admin/(board)/workbench/calendar/page.tsx` | Calendar HQ | medium | admin | unknown | |
| `/admin/workbench/email-queue` | `src/app/admin/(board)/workbench/email-queue/page.tsx` | Email queue | **high** | admin | unknown | |
| `/admin/workbench/email-queue/[id]` | `src/app/admin/(board)/workbench/email-queue/[id]/page.tsx` | Queue item | **high** | admin | unknown | |
| `/admin/workbench/comms` | `src/app/admin/(board)/workbench/comms/page.tsx` | Comms | **high** | admin | unknown | |
| `/admin/workbench/comms/plans` | `src/app/admin/(board)/workbench/comms/plans/page.tsx` | Plans | **high** | admin | unknown | |
| `/admin/workbench/comms/plans/new` | `src/app/admin/(board)/workbench/comms/plans/new/page.tsx` | New plan | **high** | admin | unknown | |
| `/admin/workbench/comms/plans/[id]` | `src/app/admin/(board)/workbench/comms/plans/[id]/page.tsx` | Plan | **high** | admin | unknown | |
| `/admin/workbench/comms/plans/[id]/segments/[segmentId]` | `.../segments/[segmentId]/page.tsx` | Segment | **high** | admin | unknown | |
| `/admin/workbench/comms/media` | `src/app/admin/(board)/workbench/comms/media/page.tsx` | Comms media | medium | admin | unknown | |
| `/admin/workbench/comms/media/[id]` | `src/app/admin/(board)/workbench/comms/media/[id]/page.tsx` | Media item | medium | admin | unknown | |
| `/admin/workbench/comms/broadcasts` | `src/app/admin/(board)/workbench/comms/broadcasts/page.tsx` | Broadcasts | **high** | admin | unknown | |
| `/admin/workbench/comms/broadcasts/new` | `src/app/admin/(board)/workbench/comms/broadcasts/new/page.tsx` | New broadcast | **high** | admin | unknown | |
| `/admin/workbench/comms/broadcasts/[id]` | `src/app/admin/(board)/workbench/comms/broadcasts/[id]/page.tsx` | Broadcast | **high** | admin | unknown | |
| `/admin/workbench/social` | `src/app/admin/(board)/workbench/social/page.tsx` | Social workbench | medium | admin | unknown | |
| `/admin/workbench/festivals` | `src/app/admin/(board)/workbench/festivals/page.tsx` | Festivals | medium | admin | unknown | |
| `/admin/workbench/positions` | `src/app/admin/(board)/workbench/positions/page.tsx` | Positions | medium | admin | unknown | |
| `/admin/workbench/positions/[positionId]` | `src/app/admin/(board)/workbench/positions/[positionId]/page.tsx` | Position | medium | admin | unknown | |
| `/admin/workbench/seats` | `src/app/admin/(board)/workbench/seats/page.tsx` | Seats | medium | admin | unknown | |

---

## C. API routes

| Route | File path | Purpose | R/W campaign DB? | Integration dependency | Launch risk | Notes |
|-------|-----------|---------|------------------|------------------------|-------------|-------|
| `/api/forms` | `src/app/api/forms/route.ts` | Form POST intake | **W** | Postgres | **P0** | canonical public intake |
| `/api/intake` | `src/app/api/intake/route.ts` | Legacy pointer | N | — | low | 410 → `/api/forms` |
| `/api/analytics` | `src/app/api/analytics/route.ts` | Analytics | likely W | — | medium | |
| `/api/search` | `src/app/api/search/route.ts` | Search/RAG | **R** | OpenAI optional | medium | |
| `/api/assistant` | `src/app/api/assistant/route.ts` | Assistant | **R** | OpenAI, DB | medium | |
| `/api/webhooks/sendgrid` | `src/app/api/webhooks/sendgrid/route.ts` | SendGrid | **W** | SendGrid | **P0** | verify signatures prod |
| `/api/webhooks/twilio` | `src/app/api/webhooks/twilio/route.ts` | Twilio | **W** | Twilio | **P0** | |
| `/api/conversation-monitoring/analyze` | `src/app/api/conversation-monitoring/analyze/route.ts` | Analyze | likely **R/W** | OpenAI optional | medium | |
| `/api/compliance-documents/[id]/file` | `src/app/api/compliance-documents/[id]/file/route.ts` | File download | **R** | auth | **high** | sensitive |
| `/api/owned-campaign-media/[id]/file` | `src/app/api/owned-campaign-media/[id]/file/route.ts` | Media file | **R** | auth | high | |
| `/api/owned-campaign-media/[id]/preview` | `src/app/api/owned-campaign-media/[id]/preview/route.ts` | Preview | **R** | auth | medium | |
| `/api/calendar/google/callback` | `src/app/api/calendar/google/callback/route.ts` | OAuth callback | **W** | Google | medium | |
| `/api/calendar/google/webhook` | `src/app/api/calendar/google/webhook/route.ts` | Webhook | **W** | Google | medium | |
| `/api/calendar/google/cron-sync` | `src/app/api/calendar/google/cron-sync/route.ts` | Cron sync | **W** | Google | medium | |
| `/api/gmail/oauth/start` | `src/app/api/gmail/oauth/start/route.ts` | Gmail OAuth | — | Google | medium | |
| `/api/gmail/oauth/callback` | `src/app/api/gmail/oauth/callback/route.ts` | Gmail callback | **W** | Google | medium | |
| `/api/cron/comms-broadcasts` | `src/app/api/cron/comms-broadcasts/route.ts` | Cron | **W** | cron secret | high | |
| `/api/cron/festivals-ingest` | `src/app/api/cron/festivals-ingest/route.ts` | Cron | **W** | cron | medium | |
| `/api/cron/festivals-coverage` | `src/app/api/cron/festivals-coverage/route.ts` | Cron | **W** | cron | medium | |
| `/api/cron/media-monitor` | `src/app/api/cron/media-monitor/route.ts` | Cron | **W** | cron, APIs | medium | |
| `/api/planning/suggest-dates` | `src/app/api/planning/suggest-dates/route.ts` | Planning | **R**? | OpenAI? | low | |
| `/api/planning/calendar-availability` | `src/app/api/planning/calendar-availability/route.ts` | Availability | **R** | calendar | low | |
| `/api/author-studio/compose/draft` | `src/app/api/author-studio/compose/draft/route.ts` | Author Studio | **R/W** | OpenAI | medium | |
| `/api/author-studio/compose/rewrite` | `src/app/api/author-studio/compose/rewrite/route.ts` | Author Studio | **R/W** | OpenAI | medium | |
| `/api/author-studio/research/internal` | `src/app/api/author-studio/research/internal/route.ts` | Research | **R** | OpenAI | medium | |
| `/api/author-studio/research/web` | `src/app/api/author-studio/research/web/route.ts` | Research | **R** | OpenAI/web | medium | |
| `/api/author-studio/package/create-tasks` | `src/app/api/author-studio/package/create-tasks/route.ts` | Package | **W** | — | medium | |
| `/api/author-studio/package/export` | `src/app/api/author-studio/package/export/route.ts` | Export | **R** | — | medium | |
| `/api/author-studio/transform/platform-pack` | `src/app/api/author-studio/transform/platform-pack/route.ts` | Transform | **R/W** | — | medium | |
| `/api/author-studio/video/analyze-transcript` | `src/app/api/author-studio/video/analyze-transcript/route.ts` | Video | **R/W** | OpenAI | medium | |
| `/api/author-studio/video/build-cut-plan` | `src/app/api/author-studio/video/build-cut-plan/route.ts` | Video | **R/W** | OpenAI | medium | |
| `/api/author-studio/video/generate-captions` | `src/app/api/author-studio/video/generate-captions/route.ts` | Video | **R/W** | OpenAI | medium | |
| `/api/author-studio/visuals/generate-images` | `src/app/api/author-studio/visuals/generate-images/route.ts` | Visuals | **R/W** | OpenAI | medium | |
| `/api/author-studio/visuals/generate-prompts` | `src/app/api/author-studio/visuals/generate-prompts/route.ts` | Visuals | **R/W** | OpenAI | medium | |

---

## D. CTA / link inventory (config-driven + defaults)

**Source:** `src/config/site.ts`, `src/config/external-campaign.ts`, `src/config/social.ts`, `src/components/layout/CampaignPaidForBar.tsx`.

| Kind | Where defined | Default / pattern | Notes |
|------|---------------|-------------------|-------|
| **Donate (external)** | `resolvePublicDonateHref()` | GoodChange `goodchange.app/donate/commi-h8` | Override `NEXT_PUBLIC_DONATE_EXTERNAL_URL` |
| **Legacy public site** | `getLegacyPublicSiteUrl()` | `https://www.kellygrappe.com` | `NEXT_PUBLIC_LEGACY_SITE_URL` |
| **Volunteer / join** | `getVolunteerSignupHref()`, `getJoinCampaignHref()` | `/get-involved#volunteer` | `NEXT_PUBLIC_VOLUNTEER_SIGNUP_URL`, `NEXT_PUBLIC_JOIN_CAMPAIGN_URL` |
| **Stay connected** | `STAY_CONNECTED_HREF` | `/get-involved#join` | |
| **Campaign blog** | `getCampaignBlogUrl()` | Substack kellygrappesos | `NEXT_PUBLIC_CAMPAIGN_BLOG_URL` |
| **Contact mailto** | `getContactMailto()` | `kelly@kellygrappe.com` | `NEXT_PUBLIC_CONTACT_EMAIL` |
| **Site URL / OG** | `siteConfig.url` | `https://kgrappe.netlify.app` (default) | `NEXT_PUBLIC_SITE_URL` |
| **Social** | `getPublicSocialLinks()` | Facebook, Instagram, … | `NEXT_PUBLIC_SOCIAL_*` |
| **Paid-for / committee** | `CampaignPaidForBar` | policy + `NEXT_PUBLIC_COMMITTEE_SITE_URL` | |

**Placeholder / broken risk (Day 2 verify):**

- Any **env-overridden** URL left empty in staging.
- **Substack / GoodChange** URL changes on vendor side — re-verify before launch.
- **Relational** and **admin** paths should not be linked from public nav as if they were voter FAQ pages (IA check).

---

## E. Day 1 grep — cross-lane code references

- **`src/` TypeScript:** **No** matches for `AJAX`, `PhatLip`, `phatlip`, `countyWorkbench`, or `county-workbench` in runtime code (sister apps only in **`docs/`** and master plans — OK).
- **Kelly / Grappe / Secretary of State:** Widespread in `src/` — expected for Kelly SOS product.

---

## Summaries (for ChatGPT / status)

| Surface | Count (approx.) |
|---------|-----------------|
| Public `(site)` `page.tsx` | 37 |
| Other public `page.tsx` (county-briefings, relational) | 5 |
| Admin `page.tsx` | 70 |
| API `route.ts` | 34 |
