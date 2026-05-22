# Orchestration training & copilot plan

**Goal:** Teach operators how **domains connect** — not isolated tool manuals.

---

## Roles × orchestration delivery

| Role | Copilot surface | Orchestration teaches | Escalation path |
|------|-----------------|----------------------|-----------------|
| Campaign manager | CM copilot + command center | Top 3 moves, blockers, delegation | Treasurer, compliance |
| Candidate | Candidate copilot | Briefings, safe comms boundaries | CM approval |
| Field manager | Field + county copilot | Weak counties, visit prep chain | County lead |
| Volunteer coordinator | Volunteer copilot | Segments, staffing, retention comms | CM |
| Communications lead | Comms copilot | Sequences, fatigue, ECC vs studio | CM + human send |
| Treasurer | Finance copilot | Reimbursement close workflow | Compliance |
| Intern | Intern-safe orchestrator | Safe tasks only | Supervisor |
| Volunteer | Volunteer training path | Module unlocks, event signup | Coordinator |
| County lead | County copilot | Power of 5, local events | Field manager |

---

## Progressive curriculum (orchestration-aware)

### Level 1 — What matters

- Read **executive summary** on command center (health band, period)
- Understand **one** cross-domain blocker example (e.g. sync stale → calendar → events)

### Level 2 — What to do next

- Follow **top 3 moves** with route links
- Open **recommended workflow** card (e.g. close month reimbursement)
- Complete **one** training module tied to blocker domain

### Level 3 — How domains connect

- Trace **prepare county visit** chain: county → event → volunteer → comms → candidate → hot wash
- Use **fusion tools** (county-volunteer-comms) as read-only planners

### Level 4 — Risk & escalation

- **Human gates:** mass email, GCal, finance post forbidden
- When to use **ECC** vs Campaign OS Message Studio (draft only)
- Escalate P0 blockers to CM

### Level 5 — Dashboard & memory

- Simplify dashboard when orchestration recommends
- Approve **memory candidates** only when pattern is real

---

## Training module hooks (existing registry)

Add orchestration-tagged modules in Phase 6:

| Module id (proposed) | Role | Links to workflow |
|----------------------|------|-------------------|
| `orch-101-campaign-brain` | all | Command center overview |
| `orch-102-close-month` | treasurer, CM | close-month-reimbursement |
| `orch-103-weak-county` | field, county lead | activate-weak-county |
| `orch-104-volunteer-push` | volunteer coord | launch-volunteer-push |
| `orch-105-comms-gates` | comms lead | human gates + ECC |

**Router tool:** `training-to-dashboard-unlock-router`

---

## Copilot brief enrichment (Phase 5)

Each role copilot brief gains optional section:

```text
Orchestration slice:
- Your top blocker (domain)
- Your recommended workflow id
- Safe actions today (from intern-safe or role router)
```

**Merge strategy:** Server-side full merge; client keeps lite merge for bundle size.

---

## Anti-patterns (teach explicitly)

- Running tools without reading **campaign diagnosis**
- Sending from Campaign OS studio (forbidden — use ECC)
- Storing PII in memory candidates
- Ignoring **readiness score** on workflow cards

---

**Progress:** `[██████░░░░] 65%` plan complete; modules Phase 6

---

*See `ROLE_COPILOT_SYSTEM.md`, `CAMPAIGN_OS_TRAINING_LAYER.md`.*
