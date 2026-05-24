# Phase 4D — Role Copilot Orchestration Network Handoff

**Lane:** RedDirt  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Sprint:** Campaign Orchestration Intelligence — Phase 4D  
**North star:** How does this improve the AI's understanding of the entire campaign?

---

## What was built

Phase 4D adds a role-based orchestration layer so the campaign AI can explain what each role needs today, which tools they should use, what approvals apply, and what each role's work teaches CampaignState.

| Piece | Status |
|-------|--------|
| Campaign role registry | ✅ |
| Role briefing engine | ✅ |
| Role tool router | ✅ |
| Role workflow planner | ✅ |
| Role training engine | ✅ |
| Role learning prompts | ✅ |
| `CampaignState.roleCopilots` | ✅ |
| Read-only API | ✅ |
| Dashboard panel | ✅ |
| `agents:test-role-copilot-network` | ✅ |

---

## Role registry

Canonical roles:

campaign_manager, candidate, communications_director, field_director, volunteer_coordinator, finance_director, compliance_lead, scheduler, county_lead, digital_director, research_director, data_director, content_director, event_lead, operations_lead.

Each role defines mission, daily responsibilities, owned domains, related sections, primary/secondary tools, required inputs, produced outputs, prepared decisions, approval boundaries, restricted actions, training needs, and how the role teaches CampaignState.

---

## Briefing engine

`role-briefing-engine.ts` builds deterministic briefings from CampaignState, cross-domain dependencies, tool routes, workflows, and learning prompts.

Each briefing includes:

- executive summary
- top 3 priorities
- blockers, risks, opportunities
- recommended tools
- recommended workflows
- cross-domain dependencies
- pending approvals
- relevant lessons
- learning prompts
- done-when checklist

---

## Tool router

`role-tool-router.ts` maps unified agent tools to each role by primary tools, secondary tools, and owned domains. Routes include recommended tools, blocked tools, approval-required tools, a tool sequence, and what the role's tool use teaches the campaign.

---

## Workflow planner

`role-workflow-planner.ts` creates non-executing role workflows for:

- campaign manager daily command
- candidate prep
- county visit prep
- comms readiness
- volunteer push
- event prep and hot wash
- finance review
- compliance review
- deployment readiness review
- knowledge gap review

Every workflow has `canExecuteNow: false`.

---

## Training engine

`role-training-engine.ts` returns current assumed level, recommended training module, next lesson, safety reminder, practice task, and done-when criteria for each role.

Levels:

1. Understands dashboard
2. Uses role briefing
3. Uses tools safely
4. Records feedback and lessons
5. Improves the campaign map

---

## Learning prompts

`role-learning-prompts.ts` emits structured role prompts for observations, feedback, lessons, and workflow outcomes. Strategic or sensitive prompts require approval before memory promotion.

---

## CampaignState integration

```typescript
campaignState.roleCopilots = {
  roles,
  activeRoleBriefing,
  roleBriefings,
  roleToolRoutes,
  roleWorkflows,
  roleTraining,
  roleLearningPrompts,
  safetySummary,
}
```

Reasoning can surface role pending approvals and active role briefing needs.

---

## Dashboard integration

`/admin/orchestration` → **Role Copilot Network**

Shows role selector links, active role briefing, top priorities, recommended tools, workflows, training level, learning prompts, and approval boundaries.

No unsafe execution controls.

---

## API route

`GET /api/agents/role-copilot-state?role=campaign_manager&period=2026-04`

Read-only. Returns role briefing, tools, workflows, training, learning prompts, safety boundaries, and role summary list.

---

## Tests run

| Command | Result |
|---------|--------|
| `npm run agents:test-role-copilot-network` | PASS |
| `npm run agents:test-continuous-optimization` | PASS |
| `npm run agents:test-cross-domain-orchestrator` | PASS |
| `npm run agents:test-orchestration-feedback-loop` | PASS |
| `npm run agents:test-agent-tooling-brain` | PASS |
| `npm run agents:test-campaign-knowledge` | PASS |
| `npm run agents:test-orchestration-state` | PASS |
| `npm run agents:test-orchestration-plan` | PASS |
| `npm run typecheck` | PASS |
| `NODE_OPTIONS=--max-old-space-size=8192 npm run build` | PASS |
| `npx prisma migrate status` | PASS |

Final full command run:

```bash
npm run agents:test-role-copilot-network
npm run agents:test-continuous-optimization
npm run agents:test-cross-domain-orchestrator
npm run agents:test-orchestration-feedback-loop
npm run agents:test-agent-tooling-brain
npm run agents:test-campaign-knowledge
npm run agents:test-orchestration-state
npm run agents:test-orchestration-plan
npm run typecheck
NODE_OPTIONS=--max-old-space-size=8192 npm run build
npx prisma migrate status
```

---

## Migration status

No migration required. Phase 4D is typed read-only orchestration state, API, dashboard presentation, and tests. `npx prisma migrate status` reported: Database schema is up to date.

---

## Build status

Build passed with `NODE_OPTIONS=--max-old-space-size=8192 npm run build`. Existing lint warnings remain outside this slice.

---

## Known blockers

- Role selector is API-link based in V1 rather than interactive client-side filtering inside the panel.
- Role permission enforcement is advisory; routes remain read-only.
- Role outcome marking should later write directly into the Phase 3B feedback store.

---

## Next recommended sprint

Role-scoped packet review and outcome capture:

- Mark role workflows accepted/rejected/completed/failed.
- Filter cross-domain packets by role.
- Promote role learning prompts into a dedicated review queue.

---

## Safety

- No auto-send email/SMS
- No Google Calendar write
- No finance post or reimbursement submit
- No voter/contact export
- No sensitive memory auto-approval
- No production mutation
- Role workflows are preparation-only and human-gated
