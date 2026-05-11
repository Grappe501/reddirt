# Form inventory — Volunteer Operating System & public campaign (2026-05-11)

This document lists public and field-facing forms, their routes, persistence, and operations notification posture. It complements Script 3 (native volunteer intake + centralized ops email).

## Notification standard (temporary)

Until Google Workspace campaign inboxes are fully assigned:

- **Primary ops routing** is centralized in `src/lib/campaign-ops/ops-notifications.ts`.
- Default **TO** address: `grappe4arkansas@gmail.com` (`TEMP_GLOBAL_OPS_EMAIL`).
- Optional overrides (comma-separated):
  - `OPS_NOTIFICATION_EMAIL_TO`
  - `OPS_NOTIFICATION_EMAIL_BCC`
- **Send path:** SendGrid single-mail (`sendSendGridSingleTestEmail`) when `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` are set. Submitter email is set as **Reply-To** on volunteer signup notifications.
- **Future split (documentary — not wired per-form yet):**
  - Volunteer / field → Volunteer–Field inbox
  - Events → Events inbox
  - Media → Communications inbox
  - P5 / VR → Voter registration inbox
  - Fundraising → Finance / fundraising inbox

## Admin / review targets (planned mapping)

| Entity | When |
|--------|------|
| `WorkflowIntake` | Default for `/api/forms` public submissions (queue triage). |
| `Submission` + `User` | All persisted `/api/forms` payloads. |
| `VolunteerProfile` | Volunteer signup (availability / skills / leadership). |
| `VolunteerOpsTeam` | After volunteer signup when solo team provisioning succeeds. |
| `CampaignTask` | Future: template-driven follow-ups per form type. |
| `CampaignEvent` | Community event suggestion API; event host flows. |
| `ResourceRequest` | Future: structured resource asks (vs mailto). |
| `FundraisingLead` | Future: fundraising host / lead captures. |
| `MediaOpportunity` / `SpeakingOpportunity` | Future: press / speaking intakes. |
| `TrainingCompletion` | Future: training attestations. |

---

## Inventory table

| Form name | Route / entry | Audience | Current status | Backend | Notification destination | Data model | Priority | Notes |
|-----------|---------------|----------|----------------|---------|---------------------------|------------|----------|-------|
| **Volunteer signup (native)** | `/volunteer#signup` (when `NEXT_PUBLIC_USE_NATIVE_VOLUNTEER_FORM=true`), `/get-involved#volunteer` | Public volunteers | **Shipped (Script 3)** | `POST /api/forms` → `persistFormSubmission` | `TEMP_GLOBAL_OPS_EMAIL` (+ env overrides) via `sendVolunteerSignupOpsNotification` | `User`, `VolunteerProfile`, `Commitment`, `Submission`, `WorkflowIntake`; optional `VolunteerOpsTeam` | P0 | Role, language, county/city, student, Discord interest, hosting, fundraising; P5 vs team copy on form. |
| **Volunteer signup (legacy)** | External `VOLUNTEER_SIGNUP_URL` / `buildLegacyVolunteerSignupUrl` | Public | Fallback | Squarespace / external | External tooling | N/A | P0 | Kept when native flag off; optional outline CTA when native on. |
| **Join movement** | `/get-involved#join` | Public supporters | Shipped | `POST /api/forms` | Not yet centralized to ops module | `User`, `Submission`, `WorkflowIntake` | P1 | Extend `ops-notifications` pattern in a later pass. |
| **Local team** | `/get-involved` (section) | Captains | Shipped | `POST /api/forms` | Same gap as join | `User`, `Submission`, `WorkflowIntake` | P1 | |
| **Direct democracy commitment** | `/direct-democracy` | Advocates | Shipped | `POST /api/forms` | Same gap | `User`, `Commitment`, `Submission`, `WorkflowIntake` | P1 | |
| **Story submission** | Site story form | Public storytellers | Shipped | `POST /api/forms` | Same gap | `User`, `Submission`, `WorkflowIntake` | P2 | |
| **Host gathering** | Host flows | Hosts | Shipped | `POST /api/forms` | Same gap | `User`, `Submission`, `WorkflowIntake` | P1 | Listening-session flag in structured data. |
| **Ask Kelly beta** | Invite-only beta | Beta testers | Shipped | `POST /api/forms` | Candidate workflow | `User`, `Submission`, `WorkflowIntake` | P2 | |
| **Team invitation** | Email link → server actions | Coordinators / invitees | Partial | `sendVolunteerOpsTeamInviteAction`, invitations tables | Not ops-email centralized | `VolunteerOpsTeamInvitation`, `VolunteerOpsTeam` | P0 | No SendGrid ops fan-out in this pass. |
| **Event submission** | `/api/events/suggest-community` (and admin variants) | Public / staff | Partial | Prisma event suggestion path | Not centralized | Event suggestion / calendar models | P0 | Wire ops notify in Script 4+ lane. |
| **Kelly visit request** | `mailto:` via `buildKellyStudentVisitRequestMailto` | Students / teams | **Not a form** | Client mailto | Mail client | N/A | P2 | Replace with `/api/forms` typed intake when ready. |
| **Resource request** | `getResourceRequestMailtoHref()` | Volunteers | **Not a form** | mailto | Mail client | N/A | P2 | |
| **Fundraising host signup** | TBD public route | Hosts | **Not built** | — | Ops email (future) | TBD | P2 | |
| **Fundraising lead signup** | TBD | Donor organizers | **Not built** | — | Finance inbox (future) | `FundraisingLead` (future) | P2 | |
| **Media contact submission** | TBD / press page | Press | **Not built** | — | Comms inbox | `MediaOpportunity` (future) | P2 | |
| **Speaking opportunity submission** | TBD | Organizers | **Not built** | — | Comms / scheduling | `SpeakingOpportunity` (future) | P2 | |
| **House party host signup** | Overlaps `host_gathering` | Hosts | Partial | `host_gathering` type | Extend ops notify | `Submission` | P1 | Enum includes house-party style gatherings. |
| **County party meeting submission** | Resource templates + mailto | County chairs | **Mostly docs** | mailto / future form | Ops | TBD | P2 | See volunteer resource email templates. |
| **Training completion** | TBD | Volunteers | **Not built** | — | Field inbox | `TrainingCompletion` (future) | P3 | |
| **Youth campus lead signup** | `/volunteer/resources/youth-outreach` → `/volunteer` | Students | Partial | Native volunteer + role `youth_outreach` | Ops email (volunteer path) | Same as volunteer | P1 | Role captured on native form. |
| **Women’s outreach lead signup** | Community dashboards + resources | Organizers | Partial | Native volunteer + role `womens_outreach` | Ops email | Same | P1 | |
| **Mosque polling location readiness** | `/dashboard/community/muslim/mosque-polling` (resource flows) | Community leads | Partial | Mostly UI / future API | TBD | TBD | P1 | No dedicated `/api/forms` type yet. |
| **Postcard team signup** | Toolkit + volunteer interests | Volunteers | Partial | `interests` tokens + volunteer form | Ops email | `User` / `Submission` | P2 | Uses `resource:postcard-outreach` token. |
| **Phone bank signup** | Toolkit + volunteer interests | Volunteers | Partial | Same | Ops email | Same | P2 | `resource:phone-banking`. |
| **Canvassing team signup** | TBD (GOTV lane Script 4) | Field | **Not built** | — | Field inbox | GOTV models | P0 | Script 4 scope. |

---

## Follow-ups (next passes)

1. Route **join_movement**, **local_team**, **host_gathering**, and **story** submissions through the same ops notification helper (category in subject line).
2. Replace high-volume **mailto** flows with typed `POST /api/forms` variants.
3. Add **Netlify env**: `NEXT_PUBLIC_USE_NATIVE_VOLUNTEER_FORM=true` when KellyGrappe Squarespace volunteer form is ready to stand down for primary traffic.
