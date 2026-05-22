# Event Blueprint System (Sprint 7)

**Lane:** `RedDirt/`  
**Storage:** `data/campaign-events/event-blueprints/blueprints.json`

## Purpose

Reusable templates learned from successful operations (house party, county meeting, fundraiser, speaking, volunteer event).

## Blueprint fields

- Prep timelines, materials, volunteer needs, room setup
- Messaging, risks, ideal attendance, follow-up pattern
- Source `recordId` + county for traceability

## Generation

| Trigger | Function |
|---------|----------|
| Complete hot wash (successful heuristic) | `runCampaignLearningLoop()` → `persistBlueprintFromEvent()` |
| Manual | Hot Wash → **Generate blueprint** button |

**Heuristic:** `isSuccessfulEvent()` in `event-intelligence-helpers.ts` (energy, strategic value, county enthusiasm).

## V2

LLM blueprint refinement, cross-county pattern library, planner auto-suggest from blueprint type.
