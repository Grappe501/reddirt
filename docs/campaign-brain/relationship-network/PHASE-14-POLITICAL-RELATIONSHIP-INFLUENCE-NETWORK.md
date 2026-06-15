# Phase 14 — Political Relationship & Influence Network

> **Relationships, not endorsements.** Who can move people, money, volunteers, credibility, and introductions?

Updated: 2026-06-15

## Mission

Build the statewide relationship map that identifies, tracks, and activates political, civic, community, faith, labor, and organizational leaders.

## Headline metrics

| Metric | Current |
| ------ | ------: |
| Statewide relationship score | **0%** |
| Current officials engaged | 0 / 0 |
| Former officials engaged | 0 / 0 |
| Leadership meetings completed | 0 |
| Introductions generated | 0 |
| Counties with influence | 0 / 75 |

## Objectives

| # | System | Output |
| - | ------ | ------ |
| 1 | Arkansas Power Map | [`arkansas-power-map.md`](./arkansas-power-map.md) |
| 2 | Current Officials | [`current-elected-officials.json`](../../../data/campaign-brain/current-elected-officials.json) |
| 3 | Former Officials | [`former-elected-officials.json`](../../../data/campaign-brain/former-elected-officials.json) |
| 4 | Candidate Partnerships | [`candidate-partnership-network.md`](./candidate-partnership-network.md) |
| 5 | Introduction Program | [`leadership-introduction-program.md`](./leadership-introduction-program.md) |
| 6 | County Influence | [`county-influence-inventory.md`](./county-influence-inventory.md) |
| 7 | Meeting Tracker | [`leadership-meeting-dashboard.md`](./leadership-meeting-dashboard.md) |
| 8 | County Relationship Score | [`county-influence-inventory.json`](../../../data/campaign-brain/county-influence-inventory.json) |
| 9 | Activation Workflow | [`relationship-activation-workflow.md`](./relationship-activation-workflow.md) |
| 10 | Election Plan | `/election-plan` → **Political Relationships** |

## Standard ask package

Every face-to-face meeting uses [`standard-ask-package.md`](./standard-ask-package.md).

## Build

```bash
npm run campaign-brain:relationship-network:build
npm run campaign-brain:build
npm run election-plan:build
```
