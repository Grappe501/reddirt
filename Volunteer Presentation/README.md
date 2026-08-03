# Volunteer Leadership Kickoff — Netlify static site

Standalone presentation for Zoom + follow-along. Separate from the full RedDirt Netlify app (`kgrappe`), which is currently blocked on Lambda deploy errors.

## Live URL (after deploy)

`https://kelly-volunteer-kickoff.netlify.app`

## Local

```bash
cd "Volunteer Presentation"
npm install
npm run dev
```

## Deploy to Netlify

```bash
cd "Volunteer Presentation"
npm install
npm run build
npx netlify sites:create --name kelly-volunteer-kickoff --manual
# or link an existing site:
npx netlify link
npm run netlify:deploy
```

Signups land in **Netlify → Forms → kickoff-signup** (CSV export). When RedDirt production deploys are healthy again, these can be imported into WorkflowIntake.

## Relationship to RedDirt

The full Next.js experience remains at `/volunteer-kickoff` in RedDirt for local/dev. This static site is the shareable public URL for the meeting until `kgrappe` can publish again.
