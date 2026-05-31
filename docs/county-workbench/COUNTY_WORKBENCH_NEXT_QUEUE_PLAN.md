# County Workbench Next Queue Plan

Run while traveling — one pass per stop:

| Pass | Command / env | Purpose |
|------|---------------|---------|
| **C1** | `CENSUS_API_KEY` + census adapter | All-county demographics |
| **C2** | `COUNTY_SOS_IMPORT_ENABLED=1` | Registration + election history |
| **C3** | `BLS_API_KEY` | Economic indicators |
| **C4** | `COUNTY_EDUCATION_IMPORT_ENABLED=1` | Schools / ADE data |
| **C5** | `COUNTY_HEALTH_IMPORT_ENABLED=1` | Hospitals / ADH |
| **C6** | `COUNTY_LOCAL_ASSETS_IMPORT_ENABLED=1` | Chambers, fairs, festivals |
| **C7** | Local media / civic institutions manual | Media landscape |
| **C8** | Churches / nonprofits manual | Validators + coalition |
| **C9** | Message intelligence county pass | Internal message angles |
| **C10** | Debate county prep packet | Debate-useful facts |

After each pass: `npm run county:factory:all` then `npm run agents:test-county-workbench-factory`

Factory refresh chain: `county:sources:build` → `county:ingest` → `county:tables:build` → `county:profiles:compile` → `county:briefs:generate` → `county:agent:run`
