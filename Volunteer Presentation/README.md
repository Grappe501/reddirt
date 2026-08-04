# Volunteer Leadership Kickoff — Netlify static site

Standalone presentation for Zoom + follow-along. Separate from the full RedDirt Netlify app (`kgrappe`), which is currently blocked on Lambda deploy errors.

## Live URL

`https://kelly-volunteer-kickoff.netlify.app`

## Presenters Board

Private briefing for speakers (dense talking points + drill-downs). Not linked in public nav:

`https://kelly-volunteer-kickoff.netlify.app/presenter`

## Volunteer Management Board

Password-protected board for kickoff form signups (status, assignee, staff notes, CSV export). Not linked in public nav:

`https://kelly-volunteer-kickoff.netlify.app/manage`

### How signups get there

1. Public join forms still POST to Netlify Forms (`kickoff-signup`).
2. The same submit also dual-writes to Netlify Functions → Blobs store (`kickoff-volunteers`).
3. Optional: **Sync Netlify Forms** on the board imports older Form submissions (needs `NETLIFY_AUTH_TOKEN`).

### Netlify env vars (site UI — do not commit)

| Variable | Required | Purpose |
|---|---|---|
| `KICKOFF_MANAGE_PASSWORD` | Yes | Board login password |
| `KICKOFF_MANAGE_SECRET` | No | Token HMAC secret (defaults to password) |
| `NETLIFY_AUTH_TOKEN` | No | Personal access token for Forms sync |
| `KICKOFF_SITE_ID` | No | Defaults to this site’s ID |

Statuses: `new` → `contacted` → `placed` / `follow_up` / `declined` / `duplicate`.

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
