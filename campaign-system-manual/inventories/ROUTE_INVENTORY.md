# Route inventory — **Pass 2A** (extended)

**Method:** `glob` of `src/app/**/page.tsx` + admin glob + key API. **~140+** app pages. Columns: **Path** | **File** | **Access** | **System** | **Mat** = maturity 0–6 | **Class** = real (R) / prototype (P) / placeholder (PH) / technical (T) / doc (D) | **Data** | **Up** | **Down** | **Ch** = chapter | **Roles**

**Access:** P public · M member (placeholder) · A admin · T tech

---

## A. `src/app/(site)/*` — public site (sampled full list)

| Path | File | Acc | System | Mat | Class | Data | Up | Down | Ch | Roles |
|------|------|-----|--------|-----|-------|------|----|----|----|-------|
| `/` | `(site)/page.tsx` | P | Home, hero | 5 | R | `HomepageConfig` | — | CTA, forms | 3 | all |
| `/about` | `about/page.tsx` | P | Content | 5 | R | CMS blocks | — | — | 1 | all |
| `/about/[slug]` | `about/[slug]/page.tsx` | P | Subpages | 5 | R | | | | | |
| `/priorities` | `priorities/page.tsx` | P | Message | 5 | R | | | | 8,23 | |
| `/get-involved` | `get-involved/page.tsx` | P | **Volunteer** pathways, POST forms | 5 | R | `api/forms` | user action | intakes | 3,23 | new volunteer, V.C. |
| `/messages` | `messages/page.tsx` | P | **Conversations & Stories** + narrative | 4 | P | editorial | | | 8,9,23 | comms, message |
| `/counties` | `counties/page.tsx` | P | Roster | 5 | R | `County` | | | 11 | county |
| `/counties/[slug]` | `counties/[slug]/page.tsx` | P | **County command** | 5 | R | `County*`, metrics, events | | | 11,22 | county org |
| `/dashboard` | `dashboard/page.tsx` | M | **Placeholder** | 2 | PH | — | future auth | | 6,20 | all vol |
| `/dashboard/leader` | `dashboard/leader/page.tsx` | M | **Placeholder** | 2 | PH | | | | 6,20 | leader |
| `/voter-registration` | `voter-registration/page.tsx` | P | **VR** info | 5 | R | | | | 3,12 | all |
| `/resources` | `resources/page.tsx` | P | **Resources** | 5 | R | | | | 1 | all |
| `/resources/[slug]` | `resources/[slug]/page.tsx` | P | Depth | 5 | R | | | | | |
| `/events` | `events/page.tsx` | P | Events | 5 | R | `CampaignEvent` (public) | | | 10,22 | event, field |
| `/events/[slug]` | `events/[slug]/page.tsx` | P | **Event** detail | 5 | R | | | | | |
| `/blog` | `blog/page.tsx` | P | **Blog** | 5 | R | `SyncedPost`? | | | 9 | comms |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | P | Post | 5 | R | | | | | |
| `/donate` | `donate/page.tsx` | P | Donate | 4 | R | (external) | | | 12,15 | fin, compliance |
| `/privacy` | `privacy/page.tsx` | P | Policy | 5 | R | | | | 15 | all |
| `/terms` | `terms/page.tsx` | P | | 5 | R | | | | | |
| `/disclaimer` | `disclaimer/page.tsx` | P | | 5 | R | | | | | |
| `/privacy-and-trust` | `privacy-and-trust/page.tsx` | P | **Trust** | 5 | R | | | | 3,15 | all |
| `/stories` | `stories/page.tsx` | P | | 5 | R | | | | 9 | |
| `/stories/[slug]` | `stories/[slug]/page.tsx` | P | | 5 | R | | | | | |
| `/direct-democracy` | `direct-democracy/page.tsx` | P | | 5 | R | | | | | |
| `/direct-democracy/ballot-initiative-process/...` | `.../page.tsx` | P | | 5 | R | | | | 11, wf lifecycle | |
| `/civic-depth` | `civic-depth/page.tsx` | P | | 5 | R | | | | | |
| `/what-we-believe` | `what-we-believe/page.tsx` | P | | 5 | R | | | | 0,23 | |
| `/understand` | `understand/page.tsx` | P | | 5 | R | | | | | |
| `/from-the-road` | `from-the-road/page.tsx` | P | | 5 | R | | | | | |
| `/press-coverage` | `press-coverage/page.tsx` | P | | 4 | R | | | | 9,22 | comms |
| `/listening-sessions` | `listening-sessions/page.tsx` | P | | 4 | R | / forms | intakes | | 3,10 | field |
| `/host-a-gathering` | `host-a-gathering/page.tsx` | P | | 4 | R | forms | intakes | | 3, wf | |
| `/start-a-local-team` | `start-a-local-team/page.tsx` | P | | 4 | R | | | | 23,11 | field |
| `/local-organizing` | `local-organizing/page.tsx` | P | | 4 | R | | | | 10,11 | |
| `/local-organizing/[slug]` | `local-organizing/[slug]/page.tsx` | P | | 4 | R | | | | | |
| `/explainers` | `explainers/page.tsx` | P | | 5 | R | | | | 8 | |
| `/explainers/[slug]` | `explainers/[slug]/page.tsx` | P | | 5 | R | | | | | |
| `/editorial` | `editorial/page.tsx` | P | | 5 | R | | | | 9 | |
| `/editorial/[slug]` | `editorial/[slug]/page.tsx` | P | | 5 | R | | | | | |
| `/campaign-calendar` | `campaign-calendar/page.tsx` | P | | 5 | R | events | | | 22, wf | event |
| `/campaign-calendar/[slug]` | `.../page.tsx` | P | | 5 | R | | | | | |
| `/voter-registration/assistance` | `voter-registration/assistance/page.tsx` | P | | 5 | R | | | | 12,15 | |
| `/labor-and-work` | `labor-and-work/page.tsx` | P | | 4 | R | | | | | |
| *…* | (full glob count **~44** under `(site)`) | | | | | | | | | |

*Pass 2A may omit rarely visited leaf pages; full glob list is source of truth.*

---

## B. Organizing intelligence + county + onboarding

| Path | File | Acc | System | Mat | Class | Ch |
|------|------|-----|--------|-----|-------|----|
| `/organizing-intelligence` | `organizing-intelligence/page.tsx` | P | **State OIS** | 4 | P | 6,21 |
| `/organizing-intelligence/regions/{8}` | `regions/.../page.tsx` | P | **Region** | 4 | P | 6,11 |
| `/organizing-intelligence/regions/[slug]` | `regions/[slug]/page.tsx` | P | **Catch-all** | 3 | P | 6 |
| `/organizing-intelligence/counties/[countySlug]` | `counties/.../page.tsx` | P | OIS **stub** | 2 | PH | 6,11 |
| `/county-briefings` | `county-briefings/page.tsx` | P | **Briefs hub** | 4 | R | 11 |
| `/county-briefings/pope` | `pope/page.tsx` | P | Pope v1 | 4 | R | 11 |
| `/county-briefings/pope/v2` | `pope/v2/page.tsx` | P | **Pope v2** | 4 | P | 6,11 |
| `/onboarding/power-of-5` | `onboarding/power-of-5/page.tsx` | P | **P5** | 4 | P | 5,23 |

---

## C. `relational` program

| Path | File | Acc | System | Mat | Class | Ch |
|------|------|-----|--------|-----|-------|----|
| `/relational` | `relational/page.tsx` | M | **Relational** shell | 3 | P | 10,15 |
| `/relational/new` | `new/page.tsx` | M | | 3 | P | | |
| `/relational/login` | `login/page.tsx` | M | | 3 | P | | |
| `/relational/[id]` | `[id]/page.tsx` | M | | 3 | P | | |

---

## D. Admin `src/app/admin` — full **76** `page.tsx` (Pass 1 glob)

**Board shell:** `admin/(board)/…` (most). **Exception:** `admin/login`, `admin/counties`, `admin/counties/[slug]`, `admin/narrative-distribution` (root `admin` in glob).

| Path pattern | System | Mat | Class | Ch | Roles |
|-------------|--------|-----|-------|----|----|
| `/admin/login` | login | 4 | R | 16,17 | admin, owner |
| `/admin` | home board | 4 | R | 16 | admin |
| `/admin/workbench` | **unified** open work | 5 | R | 7,20 | **CM, admin** |
| `/admin/workbench/…` (social, positions, seats, festivals, email-queue, calendar, comms tree) | **Ops** | 4–5 | R | 7,8,9,16 | field, comms, message |
| `/admin/narrative-distribution` | **Narrative distribution** | 3 | P | 9,20 | comms, **NDE lead** |
| `/admin/organizing-intelligence` | OIS **stub** | 2 | PH | 6,16 | admin |
| `/admin/county-intelligence` | **County** intel | 4 | R | 11 | data, field |
| `/admin/county-profiles` | **County** | 4 | R | 11 | data |
| `/admin/gotv` | **GOTV** | 2–3 | P? | 22, wf | **GOTV lead** |
| `/admin/…` *(all other board routes; see DASHBOARD audit §18 for exhaustive table)* | mixed | 2–5 | R/P | 7–19 | *see role index* |
| `/admin/counties` | **County** roster | 4 | R | 11 | field, data |
| `/admin/counties/[slug]` | **County** editor | 4 | R | 11 | county leader* |

*County leader access: policy — technical gate is `ADMIN` session today.*

**Pass 2A:** refer to `SYSTEM_CROSS_WIRING_REPORT` **§2**; line-by-line **every** admin page in Pass 3 if needed for legal review.

---

## E. `src/app/api` (selected; **34+** `route.ts`)

| Path | T | System | Mat | Ch |
|------|---|--------|-----|----|
| `POST /api/forms` | T | **Intake** | 5 | 3,7 |
| `/api/intake` | T | | 4 | 7 |
| `/api/search` | T | **Search** RAG | 3–4 | 17,20 |
| `/api/assistant` | T | | 3–4 | 17,20* |
| `/api/author-studio/*` | T | **Internal** drafting | 3 | 17* |
| `/api/webhooks/*` | T | | 4 | 16 |
| `/api/cron/*` | T | | 4 | 16 |

*Not public **Campaign Companion**; staff/tooling in manual §17,20 (internal use only).

**Last updated:** 2026-04-27 (Pass 2A). **Source:** glob `src/app/**/page.tsx` and `DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md` §18.
