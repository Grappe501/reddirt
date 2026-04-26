# Kelly SOS — Cursor + ChatGPT operating protocol (KELLY-OS-1)

**Scope:** `H:\SOSWebsite\RedDirt` = **Kelly Grappe for Arkansas Secretary of State** production codebase (folder name `RedDirt` is legacy; mental model = **Kelly SOS**).

## Division of labor

| Role | Responsibility |
|------|----------------|
| **Cursor** | Repo truth: read files, run commands, implement changes, paste **facts** (paths, errors, route lists, env *names* never values). |
| **ChatGPT** | Strategy: sequence work, draft packets/scripts, resolve tradeoffs from Steve’s intent, turn Cursor facts into **next instructions**. |
| **Steve** | Messenger: copies between tools, approves legal/compliance/destructive ops, records decisions in `KELLY_SOS_DECISION_LOG.md`. |

## Standard Cursor daily report (paste to ChatGPT)

```text
## Kelly SOS — Cursor daily report
Date (local): YYYY-MM-DD
Branch/commit: (if known)

### Done this pass
- (bullets)

### Commands run
| Command | Result |
|---------|--------|
| ... | exit code, 1-line note |

### Files touched
- path1
- path2

### Facts (no secrets)
- DATABASE_URL set: yes/no (do not paste value)
- DB reachable: yes/no
- ...

### Blockers
- (or "none")

### Recommended next pass
- 1–3 bullets
```

## Standard ChatGPT response (Steve copies to Cursor)

```text
## Kelly SOS — ChatGPT packet
Depends on: (prior report ID/date)

### Objective
(one sentence)

### Tasks (ordered)
1. ...
2. ...

### Acceptance criteria
- [ ] ...

### Quality gate
- Minimum: `npm run build` OR `npm run check` (state which)

### Doc updates
- [ ] KELLY_SOS_LAUNCH_STATUS.md
- [ ] KELLY_SOS_BUILD_LOG.md
- [ ] KELLY_SOS_BLOCKER_LOG.md / DECISION_LOG.md if applicable

### Out of scope
- (explicit)
```

## Log file locations (single source of truth)

| Log | Path |
|-----|------|
| **Build verification** | `docs/KELLY_SOS_BUILD_LOG.md` |
| **Decisions** | `docs/KELLY_SOS_DECISION_LOG.md` |
| **Blockers** | `docs/KELLY_SOS_BLOCKER_LOG.md` |
| **Daily status scratch** | `docs/KELLY_SOS_DAILY_STATUS_TEMPLATE.md` (copy section per day) |
| **Next paste script** | `docs/KELLY_SOS_NEXT_PASS_SCRIPT.md` |
| **Launch dashboard** | `docs/KELLY_SOS_LAUNCH_STATUS.md` |
| **Master plan** | `docs/KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md` |

## File change log

Maintain a short bullet list in the **Cursor daily report**; optionally append a dated subsection to `docs/KELLY_SOS_BUILD_LOG.md` when merges land.

## Firewall reminder

Do not mix **AJAX**, **PhatLip**, **countyWorkbench**, or future **generic template** data with Kelly production DB or env. See `docs/KELLY_SOS_FIREWALL_RULES.md` and `H:\SOSWebsite\brands\kelly-grappe-sos\`.

## Related legacy protocol

[`RED_DIRT_BUILD_PROTOCOL.md`](./RED_DIRT_BUILD_PROTOCOL.md) remains valid for packet discipline; **KELLY-OS-1** adds Kelly-specific logs and naming.
