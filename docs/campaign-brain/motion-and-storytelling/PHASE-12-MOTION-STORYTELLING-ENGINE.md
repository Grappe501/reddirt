# Phase 12 — Motion & Storytelling Engine

> **The Arkansas Presence Strategy** · MOTION = MOMENTUM

Updated: 2026-06-15

## Mission

Build visibility, storytelling, and presence systems that make the campaign appear **active, growing, and connected** to communities across Arkansas every day.

The objective is not social media. The objective is **visible statewide motion**.

By Election Day, when someone asks *"Has Kelly been to my area?"* the answer should almost always be **yes**.

---

## Headline metrics

| Metric | Current |
| ------ | ------: |
| Arkansas Presence Score | **0%** |
| September Readiness | **0%** |
| Counties covered | **0 / 75** |
| Cities covered | 0 |
| Total stops | 0 |
| Stories published | 0 (0 pending) |

---

## Objectives (10 systems)

| # | System | Output |
| - | ------ | ------ |
| 1 | Arkansas Presence Tracker | [`presence-dashboard.md`](./presence-dashboard.md) |
| 2 | Arkansas Presence Map | [`arkansas-presence-map.json`](../../../data/campaign-brain/arkansas-presence-map.json) |
| 3 | County Visit Archive | [`county-visit-archive/`](./county-visit-archive/) |
| 4 | Story Pipeline | [`story-pipeline-dashboard.md`](./story-pipeline-dashboard.md) |
| 5 | Community Story Categories | [`community-story-categories.md`](./community-story-categories.md) |
| 6 | Social Media Resume | [`social-media-resume.md`](./social-media-resume.md) |
| 7 | Content Inventory | [`content-library-dashboard.md`](./content-library-dashboard.md) |
| 8 | Story-First Event Workflow | [`story-first-event-workflow.md`](./story-first-event-workflow.md) |
| 9 | Local Algorithm Strategy | [`local-algorithm-playbook.md`](./local-algorithm-playbook.md) |
| 10 | September Readiness | [`september-readiness-dashboard.md`](./september-readiness-dashboard.md) |

Election plan tab: **Motion & Storytelling** → `/election-plan`

---

## Build

```bash
npm run campaign-brain:motion:build
npm run campaign-brain:build
npm run election-plan:build
```

Field input: [`presence-stops.json`](../../../data/campaign-brain/presence-stops.json)
