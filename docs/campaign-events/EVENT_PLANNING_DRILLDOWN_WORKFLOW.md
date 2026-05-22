# Event planning drilldown workflow

**Route:** `/admin/campaign-events/[recordId]`  
**Primary UI:** Planning workbook (default tab)

## Operator flow

1. Open event from workbench or travel log.
2. Review **readiness score** and **next best action**.
3. Work sections in order (collapsible):
   - Overview → Run of show → Materials → Volunteers → Contacts → Candidate brief → CM brief → Budget
4. Use **Generate draft** helpers (deterministic V1) — then edit and **Save** each section.
5. Use legacy tabs for hot wash, approval history, and communication.

## Persistence

Planning data is stored on the ledger record as `factCard._eventPlanning` (JSON). No vector DB. Human save per section.

## Safety

- No autonomous email, calendar write, or approval decisions from this page.
- Volunteer reminders are scaffold text only.

## Related

- [`RUN_OF_SHOW_SYSTEM.md`](./RUN_OF_SHOW_SYSTEM.md)
- [`EVENT_BRIEFING_AGENT_TOOLS.md`](./EVENT_BRIEFING_AGENT_TOOLS.md)
