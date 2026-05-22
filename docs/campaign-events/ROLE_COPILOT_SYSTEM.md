# Role Copilot System (V1)

**Code:** `src/lib/agents/role-copilots/`  
**UI:** Training center, onboarding V2, `CampaignGuidanceStrip`, AI command center panels.

## Roles (15)

candidate · campaign_manager · treasurer · event_planner · volunteer_coordinator · volunteer · intern · field_manager · county_lead · host · social_media_lead · communications_lead · finance_helper · new_admin · operator

Each copilot includes mission, focus, first/daily/weekly tasks, training module ids, dashboard module ids, safe vs gated actions, do-not-touch, escalation, explanation style, skill/progression levels, and success metrics.

## Engine API

- `getRoleCopilot(role)` — registry lookup  
- `recommendRoleCopilot(input)` — keyword + route context  
- `buildRoleCopilotBrief(role, context)` — daily brief  
- `buildRoleFirstTasks(role, availableTime, skillLevel)` — first session tasks  
- `getRoleAllowedModules(role, level)` — progression + training unlocks (guidance only)

Human gates unchanged: no autonomous email, calendar write, approvals, or finance post.
