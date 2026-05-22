# Copilot Task Package System

**Module:** `src/lib/agents/role-copilots/copilot-task-package-builder.ts`

## Package shape

Each `CopilotTaskPackage` includes title, why it matters, time estimate, difficulty, steps, route links, tools/training needed, human approval gates, completion criteria, escalation, and observation events to emit.

## Types

`first` · `daily` · `urgent` · `training` · `approval` · `event` · `volunteer` · `finance` · `communications` · `county` · `dashboard_setup`

## API

- `buildCopilotTaskPackage(role, type, opts?)`
- `buildFirstTaskPackage(role, skill, minutes?)`
- `buildDailyTaskPackages(role, context)`
- `buildTopThreeTaskPackages(role, context, skill, minutes?)`
- `buildTrainingTaskPackage(role, moduleId, title)`

Role-specific extras come from `role-copilot-intelligence-rules.ts`.
