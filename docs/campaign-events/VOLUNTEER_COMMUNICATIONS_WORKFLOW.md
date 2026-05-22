# Volunteer Communications Workflow

**Draft only** — `volunteer-communications-planner.ts`

## Workflows

welcome, training_reminder, event_assignment, event_reminder, thank_you, urgent_need, power_of_five, county_ask, leadership_ask

## Gates (every send)

1. Human approval (`humanApprovalRequired: true`)
2. Consent/source review (`consentWarning` when unknown)
3. Suppression check via ECC before SendGrid send
4. No autonomous outreach

## Integration

- Profile page shows 3 sample drafts
- Production send: `/admin/communications` + Email Command Center
- Template variable merge in planner; operator edits before send

## Safety note (shown in UI)

`VOLUNTEER_COMMS_SAFETY_NOTE` — displayed on volunteer command center.
