# Volunteer Leadership Kickoff — Netlify static site

Standalone presentation for Zoom + follow-along. Separate from the full RedDirt Netlify app (`kgrappe`), which is currently blocked on Lambda deploy errors.

## Live URL

`https://kelly-volunteer-kickoff.netlify.app`

## Presenters Board

Private briefing for speakers (dense talking points + drill-downs). Not linked in public nav:

`https://kelly-volunteer-kickoff.netlify.app/presenter`

## Volunteer Management Board

### Kelly DB admin (source of truth)

Kickoff forms POST to RedDirt `POST /api/forms` (`formType: volunteer_kickoff`) and create `WorkflowIntake`.

- Triage board: `https://kgrappe.netlify.app/admin/workbench/volunteer-kickoff`
- Activation board: `https://kgrappe.netlify.app/election-plan/operators/volunteer-intake`

Optional Vite override for the API origin: `VITE_REDDIRT_FORMS_URL` (defaults to `https://kgrappe.netlify.app`).

### Netlify mirror board (backup)

Password-protected Blobs mirror for on-site triage. Not linked in public nav:

`https://kelly-volunteer-kickoff.netlify.app/manage`

### How signups get there

1. Join forms POST to RedDirt `/api/forms` → User / Submission / WorkflowIntake (Kelly DB).
2. Same submit also mirrors to Netlify Forms (`kickoff-signup`) and Blobs (best effort).
3. Optional: **Sync Netlify Forms** on `/manage` imports older Form-only submissions (needs `NETLIFY_AUTH_TOKEN`).

### Netlify env vars for `/manage` (site UI — do not commit)

| Variable | Required | Purpose |
|---|---|---|
| `KICKOFF_MANAGE_PASSWORD` | Yes | Board login password |
| `KICKOFF_MANAGE_SECRET` | No | Token HMAC secret (defaults to password) |
| `NETLIFY_AUTH_TOKEN` | No | Personal access token for Forms sync |
| `KICKOFF_SITE_ID` | No | Defaults to this site’s ID |

Statuses on the Blobs mirror: `new` → `contacted` → `placed` / `follow_up` / `declined` / `duplicate`.

RedDirt intake statuses use WorkflowIntake (`PENDING`, `IN_REVIEW`, `CONVERTED`, …).

## Local

```bash
cd "Volunteer Presentation"
npm install
npm run dev
```

Functions need `netlify dev` (or a production deploy) for the manage board and signup capture.

## Deploy

```bash
cd "Volunteer Presentation"
npm install
npm run build
npx netlify link
npm run netlify:deploy
```

## Relationship to RedDirt

The full Next.js experience remains at `/volunteer-kickoff` in RedDirt for local/dev. This static site is the shareable public URL for the meeting until `kgrappe` can publish again.
