# Kelly Cockpit Product Description

## What Kelly Sees First

Kelly opens a premium campaign command center, not a plain calendar. The first thing on the page is the preflight banner: it tells staff whether the cockpit is safe for preview, whether it can support real decisions, and what still blocks a green launch. Tonight, it is yellow because schedule conflicts and Google readiness remain unresolved.

Below the banner, the Tonight Snapshot turns the next stretch of calendar into a decision room: what is confirmed, what is tentative, where conflicts exist, and which items need Kelly or staff action. The week route recommendation shows the best campaign route for the week, with risk language staff can explain quickly. The map places the week across Arkansas, with route pins, county context, and visible travel pressure.

Route cards and weekend cards make the calendar feel like a campaign plan: where Kelly goes, which counties matter, how much travel is implied, and where the campaign should send local coverage if Kelly cannot attend. The Decision Needed section is the practical center of the page: approve, modify, hold, send local, or mark for staff call. The AI recommendation block is bounded by the rule that it can recommend but cannot commit, publish, sync, send, or assign without human approval.

County brief, win target, GOTV, coverage, and staffing signals make each event bigger than a date. Kelly can see whether the campaign is ready, whether a volunteer lead is missing, whether table permission is needed, whether materials are needed, and whether Google is still blocked.

## How It Works

DB-backed `CampaignEvent` rows are now the operational anchor after staged calendar promotion. Generated planning layers still live in staged JSON so staff can review and regenerate safely: route plans, coverage plans, staffing plans, callout drafts, reminder drafts, materials estimates, win targets, GOTV allocation, and agent readiness reports.

Kelly can approve, modify, hold, send local, or ask for staff follow-up from the cockpit. Staff handles the deeper work on staff pages: coverage, event drill-down, volunteer callouts, reminder drafts, materials pack lists, table permission, post-event upload, and follow-up.

## What Is Real Now

- The DB migration blocker is repaired.
- `CampaignEvent` promotion works.
- Arkansas counties are seeded.
- Coverage plans are generated for 251 events.
- Staffing plans are generated.
- Volunteer callout drafts are generated.
- Reminder drafts are generated.
- The Kelly Agent Tool Suite runs and produces readiness, missing-data, calendar intelligence, operations intelligence, and tool audit reports.
- Candidate dashboard preflight runs.

## What Remains Before Green

- Google OAuth anchor source is missing.
- Google Tentative and Confirmed smoke test has not run.
- 111 events still need county review.
- Schedule conflicts remain.
- Material allocation/reuse needs review because only 2 tablecloths and 2 pull-up banners are known while 24 table/banner uses are planned.
- Callouts and reminders are draft-only and need a staff approval workflow before any future sending system.
