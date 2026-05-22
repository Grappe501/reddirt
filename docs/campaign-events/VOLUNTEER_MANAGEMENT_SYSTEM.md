# Volunteer Management System (V1)

## Routes

- `/admin/volunteers` — command center
- `/admin/volunteers/[volunteerId]` — profile + draft comms
- `/admin/volunteers/intake` — signup sheet OCR (existing)
- Event drilldown → planning tab → volunteer plan panel

## Data (`data/campaign-events/volunteers/`)

`volunteer-profiles.json`, `volunteer-teams.json`, `volunteer-assignments.json`, `volunteer-training.json`, `volunteer-observations.json`, `volunteer-imports.json`

## Libraries (`src/lib/campaign-events/volunteers/`)

| Module | Role |
|--------|------|
| `volunteer-types.ts` | Schema |
| `volunteer-storage.ts` | JSON CRUD |
| `volunteer-profile-builder.ts` | Normalize profiles |
| `volunteer-scoring.ts` | Reliability, retention, leadership |
| `volunteer-assignment-engine.ts` | Event recommendations |
| `volunteer-training-engine.ts` | Training paths |
| `volunteer-training-modules.ts` | 17 modules |
| `volunteer-progression.ts` | L1–L5 + intern/field tracks |
| `volunteer-communications-planner.ts` | Draft-only messages |
| `volunteer-copilots.ts` | 8 copilot definitions |
| `load-volunteer-bundle.ts` | Command center snapshot |
| `load-event-volunteer-context.ts` | Event drilldown context |

## Safety

- No auto email/SMS
- Human approval on assignments and sends
- Consent warnings on drafts
- No voter-file writes from volunteer tools

## Commands

```bash
npm run campaign-events:test-volunteer-system
```

## Next (V2)

Prisma sync, assignment accept UI, ECC volunteer segments, CSV import with consent review.
