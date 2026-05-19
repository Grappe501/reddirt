# Compliance UX world-class plan

Goal: an operator with **no training** opens command center, understands status in 10 seconds, and knows the **one next action**.

## Global patterns (implemented pass 1)

- `ComplianceStatusLanguage` — Not ready / Rehearsal / Launch / Filing ready + why  
- `ComplianceDoThisNext` — single primary CTA  
- `ComplianceWhatThisMeans` — expandable plain English  
- `CompliancePhaseIndicator` — completion plan phases 1–8  
- `ComplianceProgressByArea` — lowest areas first  
- Nav: Command center first  

## Route audits

### `/admin/compliance/command-center`

| | |
|--|--|
| **Confusion** | Too many metrics; launch % vs filing red |
| **Understand first** | Am I safe to file? What one thing fixes the most? |
| **Headline** | Your compliance mission control |
| **Primary** | Do this next (dynamic) |
| **Secondary** | Open April queue |
| **Hide** | JSON paths, commit hash (in expandable) |
| **Pass 1** | Status language, coach, progress bars, route cards |

### `/admin/compliance/approval`

| | |
|--|--|
| **Confusion** | Wizard vs workbench |
| **Primary** | Open April queue |
| **Pass 2** | Link to command center; shorten checklist |

### `/admin/compliance/april26`

| | |
|--|--|
| **Confusion** | Rehearsal vs readiness |
| **Primary** | Fix bank CSV if missing |
| **Pass 2** | What this means on rehearsal card |

### `/admin/compliance/approval/april-2026-compliance-review`

| | |
|--|--|
| **Confusion** | Filter overload |
| **Primary** | Review next best item |
| **Pass 2** | Collapse advanced filters; sticky “where to start” |

### `/admin/compliance/approval/batch`

| | |
|--|--|
| **Confusion** | Why zero eligible |
| **Primary** | Read why (98% gate) |
| **Pass 2** | Near-eligible list above fold |

### `/admin/compliance/filing-readiness`

| | |
|--|--|
| **Confusion** | Red but QA passes |
| **Primary** | Fix top blocker |
| **Pass 1** | Do this next + What filing red means |

### Workbench item

| | |
|--|--|
| **Confusion** | Override, sourceUpdatePending, rule_review |
| **Primary** | Approve / needs info / reject |
| **Pass 2** | Stepper: evidence → fields → decision |

## Red / yellow / green language

- **Red** — blocked; do not file or batch  
- **Yellow** — in progress or caution; human review  
- **Green** — system checks passed; human sign-off may still apply  

## Accessibility

- Nav `aria-label="Compliance"`  
- Pass 2: focus order on command center CTAs; details/summary keyboard support  
- Pass 3: color + text labels (not color alone)  

## Mobile

- Command center grids stack at `sm`/`lg` breakpoints  
- Queue table horizontal scroll — Pass 2 card view option  

Run `npm run compliance:ai-ux-audit` for machine-readable route list.
