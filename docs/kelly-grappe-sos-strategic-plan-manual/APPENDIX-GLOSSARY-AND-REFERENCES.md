# Appendix — glossary and references

## Glossary

| Term | Meaning |
|------|---------|
| **LANE** | **[`LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md`](./LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md)** — budget, victory math, registration, county tiers, GOTV master clock |
| **RedDirt** | Kelly SOS campaign OS codebase (`RedDirt/`) |
| **County workbench** | County portal (`countyWorkbench/`) |
| **PTV** | Path to victory |
| **GOTV** | Get out the vote; **`LANE §6`** integrates all programs |
| **Tier 1 / 2 / 3** | County priority bands — **LANE §3** |
| **Lockbox** | Segregated GOTV cash — **LANE §4.3** |
| **Allocator** | Margin burden by tier — **LANE §1.2** |

## Key file references (engineering)

| Document | Path |
|----------|------|
| Project master map | `RedDirt/docs/PROJECT_MASTER_MAP.md` |
| AI build handoff | `RedDirt/docs/REDDIRT_AI_BUILD_MASTER_HANDOFF.md` |
| DB inventory | `RedDirt/docs/database-table-inventory.md` |
| Coordination protocol | `CURSOR_CODEX_COORDINATION_PROTOCOL.md` |
| County workbench master plan | `countyWorkbench/docs/COUNTY_WORKBENCH_MASTER_PLAN.md` |
| County route inventory | `countyWorkbench/docs/COUNTY_WORKBENCH_ROUTE_INVENTORY.md` |
| Campaign system manual | `RedDirt/campaign-system-manual/README.md` |
| **Strategic plan numbers lane** | **`RedDirt/docs/kelly-grappe-sos-strategic-plan-manual/LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md`** |

## Program crosswalk (includes **LANE** + **GOTV**)

| Topic | Manual part | **LANE** section | **GOTV** (**§6**) hook |
|-------|-------------|------------------|-------------------------|
| Victory + margin | 1, 3 | §1 | Scoreboard §6.4 |
| Registration | 4 | §2 | Matrix §6.2 row |
| Turnout / persuasion / youth | 5 | §1, §5 | Matrix rows |
| Relational / intel | 6 | §3, §5 | Captains, inventory |
| Comms / collateral | 7 | §4 | Creative cadence |
| Rural / counties | 8 | §3 | Tier visibility |
| Faith / communities | 9 | §3, §4 | Rides / pulpit rules |
| Mail / phones / text / doors | 10 | §4 | Contact calendar |
| GOTV / E-Day | 11 | **§6** (master) | Full |
| Listening tour | 12 | §4 | Tour ends T-21 |
| Fundraising | 13 | **§4** (budget) | Lockbox + match |
| Social | 14 | §4 | Paid % + surge |
| Institutional / LTE | 15 | §3, §5 | Party captains |
| KPIs | 16 | All | §6.4 |
| Compliance | 17 | §4 (spend risk) | E-week pack |
| Quarterly rhythm | 18 | Updates | Overlay ≤8 weeks |

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-05-08 | Initial manual |
| **1.1** | **2026-05-08** | **LANE** file; expanded parts; **GOTV** integration |
