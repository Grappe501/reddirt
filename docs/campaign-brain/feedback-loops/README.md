# Feedback Loops

| Artifact | Purpose |
| -------- | ------- |
| [Event learning](./event-learning.md) | Predicted vs actual event scores |
| [Captured opportunity](../measurement/captured-opportunity.md) | Execution vs potential |

## Workflow

1. Brain recommends event (predicted score)
2. Field team executes
3. Log outcome in `data/campaign-brain/event-outcomes.json`
4. Update `data/campaign-brain/captured-progress.json`
5. `npm run campaign-brain:build`
