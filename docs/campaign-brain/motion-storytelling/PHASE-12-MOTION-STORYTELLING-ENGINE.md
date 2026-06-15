# Phase 12 — Motion & Storytelling Engine

> **MOTION = MOMENTUM** · Build a visible public record, not viral posts.

Updated: 2026-06-15

## Objective

When an undecided voter asks *"Who is this candidate?"* in September or October, they should see **six months of proof** — not campaign ads.

Kelly's advantage: she is **actually traveling Arkansas**. This layer tracks motion and turns every stop into a **social media resume**.

---

## Presence metrics

| Metric | Current |
| ------ | ------: |
| Counties visited | **0 / 75** |
| Cities visited | 0 |
| Stops completed | 0 |
| Miles traveled | 0 |
| Stories published | 0 |
| September readiness | **0%** |

---

## Components

| # | System | Doc / data |
| - | ------ | ---------- |
| 1 | Presence Tracker | [`presence-tracker.md`](./presence-tracker.md) · [`presence-stops.json`](../../../data/campaign-brain/presence-stops.json) |
| 2 | Arkansas Presence Map | `/election-plan` → **Motion & Presence** tab |
| 3 | Story Pipeline | [`story-pipeline.md`](./story-pipeline.md) |
| 4 | Substack Workflow | [`substack-workflow.md`](./substack-workflow.md) |
| 5 | Social Media Resume | [`../social-media/social-media-resume-dashboard.md`](../social-media/social-media-resume-dashboard.md) |
| 6 | Local Spotlight Library | [`local-spotlight-library.md`](./local-spotlight-library.md) |
| 7 | County Visit Archive | [`county-visit-archive.md`](./county-visit-archive.md) |
| 8 | Media Asset Tracker | [`media-asset-tracker.md`](./media-asset-tracker.md) |
| 9 | Story → Mobilize | [`story-to-mobilize-workflow.md`](./story-to-mobilize-workflow.md) |
| 10 | September Readiness | [`september-persuasion-readiness.md`](./september-persuasion-readiness.md) |

---

## 1000 Arkansas Stories

North star: **1000 Arkansas Stories** (not 1000 generic posts).

By Election Day: 75 counties represented · hundreds of local people · hundreds of businesses · hundreds of community stories.

---

## Build

```bash
npm run campaign-brain:motion:build
npm run campaign-brain:build
npm run election-plan:build
```
