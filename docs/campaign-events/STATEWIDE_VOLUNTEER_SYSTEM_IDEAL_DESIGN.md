# Statewide Volunteer System — Ideal Design

North star lifecycle: **Recruit → Intake → Profile → Assess → Train → Assign → Remind → Support → Track → Thank → Promote → Retain → Lead**

## 1. Recruitment channels

Website signup, event RSVP, host referral, county referral, candidate ask, social CTA, Power of 5, house party, email (gated), friend invite, coalition ask.

## 2. Intake fields

Identity, contact, geo (county/city/ZIP), availability, interests, skills, comfort, language, transport, training needs, role preferences, **consent/source**, comm preferences.

## 3. Profile

Volunteer ID, region, skills, availability, training status, assignments, reliability, notes, relationships, events attended, outreach completed, leadership potential.

## 4. Training (17 modules in V1 registry)

Campaign basics through data/privacy; role-specific paths for event, outreach, county lead.

## 5. Assignment types

Event setup, check-in, literature, canvass, phone/text bank, postcard, house party, driver, social, photo, data, finance helper, hot wash, captain, county captain.

## 6. Communication (human-gated)

Welcome, training reminder, assignment, event reminder, thank-you, re-engagement, urgent need, county ask, Power of 5, leadership ask — **never auto-send**.

## 7. Tracking

Accept/complete/no-show, reliability, training completion, follow-ups, leader readiness, county coverage, pipeline health.

## 8. Growth

Team lead, county captain, host promotion, recruit friends, train others, rapid response, event owner.

## AI agent roles

Campaign manager, field manager, volunteer coordinator, county lead, intern, communications lead, candidate, volunteer — each with copilot definition in `VOLUNTEER_COPILOTS.md`.

## Production architecture (target)

- **Graph:** Prisma `VolunteerProfile` + REL-2 + WorkflowIntake
- **Operations:** `/admin/volunteers` + ECC for email + field-ops capacity
- **Intelligence:** County bridge + assignment recommender + retention scorer
- **Safety:** Consent on every profile; suppression before send; no voter-file writes from volunteers
