# Kelly SOS — next pass script for Cursor

**Current slice:** **Day 5 — compliance, security, privacy, finance firewall**  
**Active repo:** `H:\SOSWebsite\RedDirt`  
**Updated:** 2026-04-27 (Day 4 complete: comms runbook + public form follow-up copy).

Paste this block into Cursor.

```text
ACTIVE PROJECT:
Kelly Grappe for Arkansas Secretary of State — RedDirt repo.
This is the Kelly SOS production system: public site + admin + database + workflows.

ACTIVE SLICE:
Day 5 from docs/KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md.

HARD RULES:
- No deletes.
- No repo moves.
- No template extraction.
- No AJAX / PhatLip / countyWorkbench work.
- Kelly-only contacts, volunteers, finance, strategy, DB, env.
- No unsourced opponent claims.
- No secrets in chat, docs, commits, screenshots, logs, or code.
- Do not rewrite legal copy beyond typos and structure unless Steve/counsel approves.
- Do not revert Codex/Steve changes unless explicitly instructed.

READ FIRST:
- docs/KELLY_SOS_7_DAY_LAUNCH_MASTER_BUILD_PLAN.md (Day 5 section)
- docs/KELLY_SOS_COMMS_READINESS.md (Day 4 done)
- docs/KELLY_SOS_FIREWALL_RULES.md
- docs/KELLY_SOS_ROUTE_MAP.md
- src/components/layout/SiteFooter.tsx (or policy links)
- docs/deployment.md

CURRENT FACTS:
- Day 1–2 public polish and Day 3 WorkflowIntake bridge are in place.
- Day 4: comms runbook + form success “what happens next” blurb (volunteer form keeps its own copy).
- /api/forms + WorkflowIntake + workbench open-work is the operator path.
- Grep for cross-lane imports should stay clean in src/.

OBJECTIVE:
Reduce legal/data risk: policies + footer + paid-for + finance route access + env hygiene documentation.

TASKS (pick smallest safe diffs):
1) Footer / policies — confirm privacy, terms, disclaimer links resolve; no 404s on live paths.
2) Paid-for line — verify treasurer/counsel alignment with env and SiteFooter.
3) Donation — external handoff URL pattern documented; UTM if required by ops.
4) Admin finance — /admin/financial-transactions and related routes: middleware/secret pattern; no public leakage.
5) .env.example — complete names for production; no real values.
6) Cross-lane grep — ajax, phatlip, countyWorkbench in src/ (doc-only is OK).
7) Optional: append KELLY_SOS_COMPLIANCE_CHECKLIST.md or a section in KELLY_SOS_LAUNCH_STATUS.md
8) Docs: KELLY_SOS_DAY_5_COMPLETION_REPORT.md, KELLY_SOS_BUILD_LOG.md row, BETA_LAUNCH_READINESS rescore if material.

QUALITY GATE:
- npm run check (or npm run build + typecheck if check too heavy).

COMPLETION:
- List files, commands, counsel/treasurer follow-ups for Steve.
```

After Cursor finishes, Codex should review and gate **Day 6** (deploy smoke + demo script).
