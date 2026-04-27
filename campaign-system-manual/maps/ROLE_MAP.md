# Role map

**How to read:** Campaign **org** roles (volunteer → owner) map to **product** surfaces; not 1:1 with database `User` yet.

| Org role (manual) | Typical surfaces (today) | Future |
|------------------|-------------------------|--------|
| Volunteer, P5 member | Public site, P5 onboarding | ` /dashboard` |
| Power team leader, captains | Placeholder ` /dashboard/leader` | + permissioned rosters |
| County / regional | Public OIS + county + staff admin | Refined ACL |
| Comms, message lead | `admin/workbench/comms/*`, narrative admin | MCE/NDE maturity |
| Data lead | Voter import, relational, voter model | **Restricted** always |
| CM, field, V.C. | Workbench, tasks, county, events | — |
| Owner | All + policy | — |

**Detail:** `../ROLE_MANUAL_INDEX.md` · `../roles/`

**Last updated:** 2026-04-27
