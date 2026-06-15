# Phase 16 — Voter Contact & GOTV Operating System

Updated: 2026-06-15

## Mission

Unify voter contact across Field OS channels into one command center. Measure **Human Contact Index (HCI)** — the heartbeat of the final 20 weeks.

> Volunteer → Voter Contact → Commitment → Turnout. Lanes 2, 3, and 4 are won through conversations — not dashboards.

## Human Contact Index

| Component | Count |
| --------- | ----: |
| Phone calls | 0 |
| Postcards | 0 |
| Doors knocked | 0 |
| House party attendees | 0 |
| Power of 5 conversations | 0 |
| Volunteer recruits | 0 |
| Event attendees | 0 |
| **HCI total** | **0** |
| Goal | 250,000 |
| Completion | 0% |

## Three tracks

| Track | Primary measure | Progress |
| ----- | ---------------- | -------: |
| **A — Lane 2 Reactivation** | Committed / 51,051 turnout target | 0% |
| **B — Lane 3 Registration** | 0 / 50,000 | 0% |
| **C — Lane 4 Persuasion** | 0 conversations | — |

## Campaign funnel

```txt
Volunteer → Voter Contact → Commitment → Turnout
```

| Stage | Count |
| ----- | ----: |
| Volunteers active | 0 |
| Voter contacts | 0 |
| Commitments | 0 |
| Turnout targets | 0 |

## Dashboards

| Dashboard | Doc |
| --------- | --- |
| Command Center | [voter-contact-command-center.md](./voter-contact-command-center.md) |
| Lane 2 Reactivation | [lane-2-reactivation-dashboard.md](./lane-2-reactivation-dashboard.md) |
| Registration | [registration-dashboard.md](./registration-dashboard.md) |
| Persuasion | [persuasion-dashboard.md](./persuasion-dashboard.md) |
| Power of 5 Conversion | [power-of-5-conversion-dashboard.md](./power-of-5-conversion-dashboard.md) |
| Postcards | [postcard-dashboard.md](./postcard-dashboard.md) |
| Phone Banks | [phone-bank-dashboard.md](./phone-bank-dashboard.md) |
| Canvass | [canvass-dashboard.md](./canvass-dashboard.md) |
| House Parties | [house-party-dashboard.md](./house-party-dashboard.md) |
| GOTV | [gotv-dashboard.md](./gotv-dashboard.md) |

## Field data files

- `phone-banks-field.json` · `postcards-field.json` · `canvass-field.json`
- `power-of-5.json` · `house-parties.json` · `event-outcomes.json`
- `voter-contact-tracks.json` — lane rollups (update weekly)
- `relationship-assets.json` — legacy capital metrics (merged at build)

```bash
npm run campaign-brain:voter-contact:build
```
