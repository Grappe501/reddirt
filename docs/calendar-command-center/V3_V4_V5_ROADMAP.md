# Kelly Calendar V3/V4/V5 Roadmap

## V3: Working DB-Backed Campaign Calendar

V3 closes when the campaign can treat `CampaignEvent` as the operational calendar source and safely move one event through the full Google lane.

Must finish:

- Find or create the Google OAuth anchor `CalendarSource`.
- Run `calendar:google:ensure` for Kelly Tentative and Confirmed calendars.
- Run a one-event Tentative to Confirmed smoke test.
- Confirm no duplicate cockpit rows after sync/promote.
- Clean schedule conflicts enough for Kelly use.
- Build a county relink review queue for the 111 unlinked events.
- Add material allocation checks for tablecloth/banner reuse.
- Add staff approval workflow for callouts and reminders.
- Move preflight from yellow/preview toward yellow/usable or green.

## V4: Campaign Operations Around Every Event

V4 turns every event into a before/during/after campaign workflow.

Scope:

- Public scheduling intake.
- Commitment card intake.
- County vault event folders.
- Post-event workflow.
- Upload photos/videos.
- Media metadata.
- Press/social drafts.
- Staff task board.
- Local guide workflow.
- House party workflow.
- Reporting dashboard.

Acceptance: every event has coverage, staffing, materials, follow-up, county memory, and reviewable staff tasks.

## V5: AI Campaign Manager With Human Override

V5 makes the Kelly agent a campaign manager that recommends and prepares work while humans approve every consequential action.

Scope:

- Daily briefing.
- Weekly optimization.
- Custom reports.
- Predictive coverage gaps.
- Google webhook live sync.
- Event-to-media-to-follow-up memory.
- AI report builder.
- AI can recommend actions but never send, publish, commit, sync, or assign without human approval.

Human override remains required for schedule commitments, Google calendar changes, public publishing, emails/SMS, volunteer callouts, press releases, route approval, and event coverage decisions.
