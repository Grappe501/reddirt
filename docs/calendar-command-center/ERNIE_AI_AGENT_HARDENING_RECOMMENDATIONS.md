# Ernie AI Agent Hardening Recommendations

Updated: 2026-05-14

## Current hardening completed

- The Kelly agent now has an `event_coverage_plan` tool and two explicit tasks: `event_coverage_plan` and `coverage_gap_summary`.
- Coverage planning no longer treats virtual, personal, or unavailable calendar items as field events that need volunteers/materials.
- County-link audit avoids false-positive `Arkansas` county guesses from statewide phrases unless the text says `Arkansas County`.
- The agent system prompt now requires human approval for outbound, Google, email, SMS, public publishing, and volunteer assignment actions.
- The coverage page is staff-first at `/admin/calendar-command-center/coverage`; Kelly cockpit only gets light coverage status.

## Recommendations for next AI tooling pass

1. Add a durable agent run ledger.
   Store task, inputs, tool versions, output schema version, human decision, and follow-up action. This makes every recommendation auditable.

2. Add per-tool freshness metadata.
   Every file-staged tool should report `generatedAt`, source file paths, source row counts, and whether the data is stale.

3. Add confidence and citation requirements to every tool output.
   Coverage, win target, route, county fact, and media tools should return source citations or an explicit `uncited` flag.

4. Split agent actions into `read`, `prepare`, and `mutate` classes.
   Mutating actions should require a staff approval token and should never be callable from generic recommendation routes.

5. Add a policy gate before any outbound action.
   Email, SMS, Google writes, public publishing, and volunteer assignment should share one approval/checklist contract.

6. Add a weekly "coverage gaps" report.
   Produce counts for missing volunteer leads, missing table permission, missing materials, missing county links, and urgent unassigned events.

7. Improve county-link resolution with a review queue.
   The audit should write a staged candidate-link file instead of directly relinking. Staff can approve county matches later.

8. Add deterministic tests for agent tools.
   Snapshot tests should cover virtual events, personal holds, fair/festival tabling, county meetings, house parties, and debate/media anchors.

9. Add schema drift checks for live DB-critical tables.
   The agent preflight should check live columns for `counties`, `CampaignEvent`, `CalendarSource`, and cockpit tables before running DB-backed tools.

10. Add "do not invent" enforcement in tool wrappers.
    Tools should only emit values derived from DB/file inputs or explicit defaults, with default assumptions labeled.

## Current blockers

- Google lane activation is still blocked until a `CalendarSource` with a refresh token exists.
- Schedule conflicts still keep preflight yellow.
- 111 `CampaignEvent` rows remain without `countyId`; audit sample suggests many are virtual/internal/personal items, but a staffed review queue is needed.
- Existing unrelated volunteer-intake/schema edits are still in the local working tree and should be handled separately.
