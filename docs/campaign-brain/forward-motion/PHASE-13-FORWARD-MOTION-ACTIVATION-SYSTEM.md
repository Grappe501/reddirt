# Phase 13 — Forward Motion Activation System

> **Backward proof** (Phase 12) + **Forward motion** (Phase 13) = perceived statewide momentum.

Updated: 2026-06-15

## Mission

Build the system that **announces, promotes, activates, and measures** Kelly's upcoming campaign stops.

Every verified stop becomes an activation package:

Campaign Brain event → Mobilize → Facebook → news release → graphics → phone bank → postcards → canvass/door hangers (future) → post-event story workflow

## Hard rules

- **No live emails sent**
- **No live Facebook event publishing**
- **No live Mobilize publishing** unless existing human-approval workflow
- **No automatic press release distribution**
- **No voter-level PII** in generated docs
- **No 20-week schedule lock**
- Everything is **draft / review / activation-ready**

## Why forward motion matters

Arkansas is a relationship state. Voters need to repeatedly encounter evidence Kelly is **showing up in communities like theirs** — including **before** she arrives.

## Queue summary

| Metric | Count |
| ------ | ----: |
| Upcoming stops (90d horizon) | 79 |
| Next 7 days | 14 |
| Kelly assignment | 45 |
| Verified | 73 |

## Objectives

| # | System | Location |
| - | ------ | -------- |
| 1 | Forward Motion Hub | This file |
| 2 | Activation Queue | [`upcoming-stops-activation-queue.json`](../../../data/campaign-brain/upcoming-stops-activation-queue.json) |
| 3 | Weekly Packet | [`weekly-forward-motion-packet.md`](./weekly-forward-motion-packet.md) |
| 4 | News Releases | [`news-releases/`](./news-releases/) |
| 5 | Social Graphics | [`social-graphics/`](./social-graphics/) · [`social-graphics-request-queue.json`](../../../data/campaign-brain/social-graphics-request-queue.json) |
| 6 | Facebook Drafts | [`facebook-events/`](./facebook-events/) |
| 7 | Mobilize Drafts | [`mobilize/`](./mobilize/) |
| 8 | Phone Banks | [`phone-bank-invitations/`](./phone-bank-invitations/) |
| 9 | Postcards | [`postcards/`](./postcards/) |
| 10 | Canvass / Door Hangers | [`canvass-door-hangers/`](./canvass-door-hangers/) |
| 11 | Story Capture | [`story-capture/`](./story-capture/) |
| 12 | Election Plan | `/election-plan` → **Forward Motion** tab |

## Build

```bash
npm run campaign-brain:forward-motion
npm run campaign-brain:build
npm run election-plan:build
```
