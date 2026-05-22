# Volunteer System Gap Analysis

## Exists (reuse)

- Prisma volunteer/relational models
- Public `/api/forms` volunteer intake
- REL-2 admin CRM
- Signup sheet OCR intake
- Volunteer asks (canvass/phone)
- County intelligence + Power of 5 engine
- Communications V1 drafts
- Field-ops capacity CSV/JSON
- Campaign OS event planning `volunteerPlan` fields

## Missing (build)

| Item | Priority |
|------|----------|
| Unified volunteer command center | **P0** — built V1 |
| JSON/Prisma sync strategy | **P0** — V1 JSON; Prisma merge next |
| Assignment accept/decline workflow | **P1** |
| Training completion tracking UI | **P1** |
| Phone/text bank execution | **P2** (locked by design) |
| Volunteer self-serve REL entry | **P2** |
| Gamification GAME-2 | **P3** |

## Duplicated (consolidate)

- Team reach demo table vs `RelationalContact`
- Campaign OS `contacts.json` vs volunteer profiles
- Multiple volunteer doc sets vs single OS

## Launch blockers

- Hosted DB for production CRM
- Consent labeling on imports
- SMS/TCPA productization before text bank promises

## Immediate campaign value (this sprint)

- `/admin/volunteers` command center
- Event staffing recommendations on drilldown
- Training module registry + paths
- AI tools + copilots + draft comms
- Dashboard + command center panels
