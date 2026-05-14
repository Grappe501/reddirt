# Calendar System Capabilities

| Feature | Route/File | Code Complete % | Operational Complete % | Current Status | Blocker | Next Action |
|---|---|---:|---:|---|---|---|
| Candidate cockpit | `/admin/calendar-command-center/kelly` | 90% | 75% | Loads cockpit, preflight, route cards, map, decisions, coverage signals, win/GOTV panels, and AI recommendation. | Yellow preflight, conflicts, Google not ready. | Clear conflicts and run Google smoke. |
| DB-backed calendar promotion | `npm run calendar:promote-staged-to-db` | 90% | 80% | Staged items promote to `CampaignEvent`; counties are seeded and many rows link. | 111 events still need county review. | Build county relink review queue. |
| Week View | `/admin/calendar-command-center/week` | 75% | 60% | Monday-Sunday board and route context exist. | Hour-level detail and conflict cleanup remain. | Move toward hour view after conflicts are resolved. |
| Weekend route cards | `weekend-route-plans-2026.json` | 80% | 65% | Route cards show weekend plans, risk, mileage, and county opportunities. | Source dates and travel validation incomplete. | Verify fair/festival dates and route assumptions. |
| Map | Kelly cockpit / week view | 65% | 50% | Pins and approximate county routing render. | Some events lack county/location. | Relink counties and enrich locations. |
| Coverage planning | `/admin/calendar-command-center/coverage` | 85% | 75% | Coverage plans generated for every promoted event. | Volunteer leads, table permission, and material reuse remain. | Staff review queue for gaps. |
| Event staffing/callouts/reminders | Event drill-down + staged JSON | 80% | 65% | Staffing plans, callout drafts, reminder drafts, and pack lists exist. | Draft-only; no staff approval workflow yet. | Add approval statuses and review controls. |
| GOTV/field ops | `/admin/calendar-command-center/gotv`, `/field-ops` | 75% | 55% | 5,000 commitment allocation and volunteer capacity models build. | Real volunteer counts and local guide assignments need import. | Fill county field ops inputs. |
| Win target model | `data/election/kelly-win-target-scenario-v1.json` | 70% | 50% | Statewide/county target scenario builds for planning. | Needs official SOS-grade and campaign-verified data. | Import verified election and registration data. |
| Kelly Agent Tool Suite | `npm run agent:tool-suite` | 85% | 70% | Self-audit, missing data, calendar intel, ops intel, and capability validation run. | Google and operational data gaps keep suite yellow. | Close top missing-data items and rerun suite. |
| Google lanes | `calendar:google:*` | 65% | 20% | Scripts exist for ensure/sync/promote. | OAuth anchor missing; no smoke run. | Find anchor, ensure calendars, sync one test. |
| Reporting system | `docs/calendar-command-center/CAMPAIGN_REPORTING_SYSTEM_DESIGN.md` | 15% | 5% | Design documented. | Report builder not implemented. | Build saved definitions and CSV/JSON exports. |
| Media/county vault | County vault docs + media metadata | 20% | 10% | Knowledge-index lane exists. | Media/event folders and metadata incomplete. | Add post-event media folder readiness check. |

## Readiness Blockers To Green

1. Google OAuth anchor source missing.
2. Google lane smoke test not run.
3. 111 `CampaignEvent` rows missing county link.
4. Schedule conflicts remain.
5. Material allocation/reuse check needed because only 2 tablecloths and 2 banners are known while 24 table/banner uses are planned.
6. Callouts/reminders are drafts and need staff approval workflow.

## Path To Green

1. Find or create Google OAuth anchor `CalendarSource`.
2. Run `npm run calendar:google:ensure`.
3. Run `npm run calendar:google:sync-kelly`.
4. Smoke one event Tentative to Confirmed and confirm no duplicate rows.
5. Build county relink review queue and resolve enough critical events.
6. Build material allocation/reuse check.
7. Make callout/reminder approval statuses clear.
8. Rerun `npm run agent:tool-suite`.
9. Rerun `npm run agent:preflight`.
