# Red Dirt — packet queue (RD-QUEUE-1)

**Pilot:** ChatGPT · **Executor:** Cursor · **Protocol:** [`RED_DIRT_BUILD_PROTOCOL.md`](./RED_DIRT_BUILD_PROTOCOL.md).

Status: `pending` | `active` | `done` | `blocked`

---

## Beta-critical (P0)

| ID | Objective | Depends on | Acceptance criteria | Status |
|----|-----------|------------|---------------------|--------|
| **RD-1** | Public copy & developer-language sweep (`(site)` + `/county-briefings/pope`) | — | No repo paths, gate labels, or maintainer jargon on user-visible strings; spot-check blog mirror states; `npm run build` | pending |
| **RD-2** | Production data path for counties + Pope briefing | DB available | Published county(ies); Pope page graceful empty state + honest messaging; `npm run build` | pending |
| **RD-3** | Staging deploy checklist | RD-1, RD-2 | `docs/deployment.md` + short STAGING.md or section: env list, smoke steps; `npm run build` | pending |

## High priority (P1)

| ID | Objective | Depends on | Acceptance criteria | Status |
|----|-----------|------------|---------------------|--------|
| **RD-4** | Get-involved + forms smoke (spam, validation) | — | Documented test path; fix critical bugs; `npm run build` | pending |
| **RD-5** | Admin workbench smoke: login, comms plan list, GOTV read | env | Short operator runbook; no 500s on core routes; `npm run check` if TS touched | pending |
| **RD-6** | Mobile pass on home + counties + get-involved | RD-1 | No horizontal scroll breakers; tap targets OK; `npm run build` | pending |

## Post-beta (P2–P3)

| ID | Objective | Status |
|----|-----------|--------|
| **RD-7** | Social workbench “placeholder” cleanup (internal vs operator-only labels) | pending |
| **RD-8** | Author Studio consolidation doc + route map | pending |
| **RD-9** | PRECINCT-1 / election ingest expansion (data division) | pending |

---

## Packet template (for pilot)

```text
Packet: RD-N
Objective:
Affected paths:
Acceptance criteria:
Build/test: npm run build (npm run check if touching types/lint)
Doc updates: PROJECT_MASTER_MAP / BETA_LAUNCH_READINESS / this queue
```

**After each packet:** mark done, update [`BETA_LAUNCH_READINESS.md`](./BETA_LAUNCH_READINESS.md) score if material, append build log row.
