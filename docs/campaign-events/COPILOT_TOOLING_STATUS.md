# Copilot Tooling Status

**Updated:** AI Copilot Tooling Expansion sprint  
**Code:** `src/lib/agents/role-copilots/` · **Tools:** `sprint-copilot-tooling-tools.ts` (lifecycle `kelly_os_copilot_tooling`)

## Audit summary

| Question | Answer |
|----------|--------|
| Copilots exist? | **15** roles in `ROLE_COPILOT_REGISTRY` |
| Only definitions? | **Was** registry-only; **now** tool-backed via `copilot-intelligence-engine.ts` |
| Working engines? | `role-copilot-engine` (lookup) + `copilot-intelligence-engine` (operational briefs) |
| Dashboard modules? | Yes — per role in registry + `getRoleAllowedModules` / unlock engine |
| Training paths? | Yes — `training-path-builder` + per-role module ids |
| Next-task logic? | Yes — `copilot-task-package-builder` + role intelligence rules |
| Observation hooks? | 10 new `copilot_*` UX events |
| Tool coverage? | **35** V1 contracts (31 functional deterministic paths) |

## Per-role tooling

| Role | Intelligence rules | Dedicated tools |
|------|-------------------|---------------|
| candidate | fatigue, approvals, event prep | 3 |
| campaign_manager | blockers, staffing, delegation | 3 |
| treasurer | packet review, missing docs | 2 |
| event_planner | execution, readiness, run of show | 3 |
| volunteer_coordinator | staffing, fit, retention | 3 |
| volunteer | first task, fit | 2 |
| intern | safe task router | 1 |
| field_manager | county gaps, PO5 | 2 |
| county_lead | action planner | 1 |
| host | invite coach | 1 |
| social_media_lead | safety, content plan | 2 |
| communications_lead | audience risk, calendar | 2 |
| finance_helper | task router | 1 |
| new_admin | training gap | 1 |
| operator | system gap, sprint, demo, tool gap | 4 |

## UI surfaces

- `/admin/ai-command-center/copilots` — full command center
- `CampaignGuidanceStrip` — uses `buildCopilotIntelligenceBrief`
- Cards: `CopilotBriefCard`, `CopilotTaskPackageCard`, `CopilotTrainingRecommendationCard`, `CopilotRiskWarningCard`

## Human gates

`copilot-safe-action-router.ts` blocks forbidden autonomous patterns. Task packages mark `humanApprovalGates` and `safeOnly`.

## Tests

`npm run agents:test-copilot-tooling`
