# Kelly SOS — engineering priority lock

**Updated:** 2026-06-16  
**Protect phrase:** *The next unlock is not another hub. It is one person, many participations.*

## Current truth

Coalition Command is a **usable hub** — not person-aware. Do **not** build more coalition metrics or scoreboards.

## Priority order

1. **Finish pilot smoke validation**
   - Jacksonville city path — `/election-plan/workbenches/jacksonville`
   - Grassroots & Guitar Strings event path — `/election-plan/workbenches/sherwood/events/grassroots-and-guitar-strings`
   - Auto-check: `npm run election-plan:community-workbench:pilot-smoke`
2. **PPEN A.0b — Person + Participation**
   - One human (`PpenPerson`), many participations across coalition, county, event, fundraising, communications
3. **PPEN A.0c — intake / activation**
4. **Then** coalition pathway enrollment and leadership workbenches

## Optional small pass (only if visible progress needed before A.0b)

**Coalition Pathway Nav Shell** — empty, honest sections inside each coalition workbench:

- Leadership
- Volunteer Pathways
- Events
- Fundraising Opportunities
- Help 10 Participate
- My Five
- Communications
- Relationships

### Hard rules (coalition + PPEN)

- No enrollment UI before `PpenPerson` exists
- No fake people, fake counts, or duplicated leader records
- No pathway activation until PPEN A.0b ships
- No new coalition scoreboards

## Message for Burt / agents

```text
Do not build more Coalition Command metrics.

Coalition Command is now a hub. The blocker is Person + Participation.

Next engineering priority remains:
1. Finish Jacksonville + Grassroots & Guitar Strings pilot smoke
2. Build PPEN A.0b Person + Participation
3. Build PPEN A.0c intake/activation
4. Then build coalition pathway enrollment and leadership workbenches

Optional small safe pass:
Add coalition pathway nav shells inside coalition workbenches using the existing registry:
Leadership · Volunteer Pathways · Events · Fundraising Opportunities · Help 10 · My Five · Communications · Relationships.

Hard rules:
- no fake counts
- no enrollment UI before PpenPerson
- no duplicated leaders
- no new coalition scoreboards
```

## Related docs

- [`COMMUNITY_WORKBENCH_PPEN_ROADMAP.md`](./COMMUNITY_WORKBENCH_PPEN_ROADMAP.md)
- [`PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md`](./PPEN_A0B_PARTICIPANT_IDENTITY_LAYER.md)
- [`COALITION_COMMAND_WORKBENCH_MIGRATION.md`](./COALITION_COMMAND_WORKBENCH_MIGRATION.md)
- [`COMMUNITY_WORKBENCH_V1_3_PILOT.md`](./COMMUNITY_WORKBENCH_V1_3_PILOT.md)
