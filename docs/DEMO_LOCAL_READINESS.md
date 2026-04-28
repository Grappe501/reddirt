# Local demo readiness (RedDirt)

**Audience:** Staff demoing to stakeholders (e.g. candidate, partner orgs). **Rule:** Describe what the code does; do not claim live provider connectivity without checking env in that environment.

---

## Quick start

```bash
cd RedDirt
npm install
npm run dev
```

Default app URL is typically `http://localhost:3000` (see terminal output).

---

## Public site (voter-facing)

| Step | URL / action |
|------|----------------|
| Home | `/` — hero, pathway chooser, conversion bands, Get Involved. Donation overlay may appear once per **browser session** until dismissed. |
| Kelly & priorities | `/about`, `/priorities` |
| Counties | `/counties`, `/county-briefings` (Pope pilot + hub) |
| Volunteer | `/get-involved` |
| Donate | `/donate` (or configured external GoodChange URL via env) |

---

## Admin (after sign-in)

| Step | URL |
|------|-----|
| Login | `/admin/login` |
| Candidate command console | `/admin/ask-kelly` — command board, integration status, research posture (planned), onboarding walkthrough |
| Website content | `/admin/pages`, `/admin/homepage` |
| Command center (orchestrator) | `/admin/orchestrator` |
| Workbench | `/admin/workbench`, `/admin/workbench/social`, `/admin/workbench/comms` |
| County intel (staff) | `/admin/county-intelligence` |

---

## Integrations — how to speak about them

- **SendGrid / Twilio:** Code paths and webhooks exist; **production sends** require valid API keys, sender IDs, and compliance approval in that deploy.  
- **Google Calendar / Gmail OAuth:** Flows and UI hooks exist; **“live”** means OAuth completed and env vars set for that environment (see `.env.example`).  
- **Insights / reports:** `/admin/insights` is a **placeholder** — aggregate reporting is **planned**, not a finished analytics product.  
- **Research / open web:** **Not** enabled as live browsing; future tools should be curated and controlled (see Ask Kelly console card).

---

## County parity

Eight-county expansion vs Pope: see `docs/NORTHWEST_REGION_AND_8_COUNTY_WORKBENCH_PARITY_AUDIT.md`.

---

## Production check (before investor-style demos)

```bash
npm run check
```

Expect existing ESLint warnings in some admin files; **fix only** if your change introduced them. Build may log Prisma/DB noise if the database URL is missing—resolve env for a clean static generation if required.
