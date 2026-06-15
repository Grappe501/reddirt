# Chapter 5 — The 50,000 New Voter Plan

> **Status:** Generated — 75 county registration dashboards
> **Document:** Arkansas Plurality Victory Plan
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT
> **Part:** II — The Electoral Math
> **Generated:** 2026-06-14

---

## Core message

> 50,000 registrations statewide = **2,500/week** or **358/day** over 20 weeks.

---

## Statewide registration dashboard

| Field | Value |
| ----- | ----: |
| Statewide goal | **50,000** |
| Current registrations | — (DB not connected) |
| Gap remaining | **50,000** |
| Weekly target | **2,500** / week |
| Daily target | **358** / day |

*Summary:* [`statewide-registration-summary.json`](./statewide-registration-summary.json)

**Regenerate:** `npm run strategic-plan:chapter-05:build`

---

## Goal source

Goals are loaded from `CountyCampaignStats.registrationGoal` when available. Until DB backfill, goals are **allocated proportionally by Lane 2 recovery potential** (sum = 50,000). Merged into `data/election/arkansas-voter-registration-goals.normalized.json` for win-target builds.

---

## Top 10 counties by registration goal

| County | Goal | Weekly @ 20 wk | Daily |
| ------ | ---: | -------------: | ----: |
| Pulaski | 10,584 | 530 | 76 |
| Benton | 7,183 | 360 | 52 |
| Washington | 5,462 | 274 | 40 |
| Saline | 2,666 | 134 | 20 |
| Faulkner | 2,365 | 119 | 17 |
| Sebastian | 1,857 | 93 | 14 |
| Garland | 1,832 | 92 | 14 |
| Craighead | 1,768 | 89 | 13 |
| Jefferson | 1,710 | 86 | 13 |
| Lonoke | 1,651 | 83 | 12 |

---

## Per-county files

Each county file in [`counties/`](./counties/) includes:

- Registration dashboard (goal, gap, source)
- Weekly / daily / monthly pace targets
- Youth opportunity (estimated graduating seniors)
- Lane 2 context from Chapter 4

---

## Before week plans

Do **not** populate Weeks 1–20 until event calendars are merged (fairs, festivals, chambers, faith, clerks). See [BUILD_ORDER.md](../../BUILD_ORDER.md).
