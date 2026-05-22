# County Dashboard Modules

**Registry:** `src/lib/agents/dashboard-builder/dashboard-component-registry.ts`

## Blocks (V2)

| Block ID | Purpose |
|----------|---------|
| `county_priority_list` | Top weak counties |
| `county_action_package` | Per-county operational package |
| `county_power_of_five_gaps` | Relational organizing gaps |
| `county_registration_progress` | Registration planning targets |
| `county_volunteer_gap` | Volunteer recruitment needs |
| `county_event_recommendation` | Next event geography |
| `county_comms_prompt` | Communications angles (draft only) |
| `candidate_county_briefing` | Candidate prep before county events |
| `intern_county_tasks` | Safe intern research tasks |
| `field_manager_county_plan` | Daily statewide field plan |

Use in **Dashboard builder** (`/admin/ai-command-center/dashboard-builder`) after training unlocks or role progression.

## Test

`npm run agents:test-county-copilots`
