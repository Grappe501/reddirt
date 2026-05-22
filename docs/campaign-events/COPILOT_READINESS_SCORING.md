# Copilot Readiness Scoring

**Module:** `src/lib/agents/role-copilots/copilot-readiness-scorer.ts`

## Dimensions (0–100)

- roleReadiness
- trainingReadiness
- dashboardReadiness
- taskReadiness
- riskReadiness
- autonomyReadiness
- **overall** (average)

## Labels

`getting_started` · `building_skills` · `operational` · `expert`

## Outputs

- `safeNow` — actions user can take today
- `needsTrainingFirst` — module ids
- `needsSupervisor` — gated workflows
- `tooAdvancedModules` — locked dashboard blocks
- `hiddenUntilLater` — do-not-touch until trained

**Note:** Guidance only — not permission enforcement.
