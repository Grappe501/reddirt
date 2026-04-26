# Kelly SOS — next pass script for Cursor

**Current slice:** **Section 2 — counsel/treasurer gates + hosted preview smoke + demo**  
**Active repo:** `H:\SOSWebsite\RedDirt`  
**Updated:** 2026-04-26 (Section 1 complete: `deployment.md`, `check.yml`, Section 1 report; apex domain route parity ambiguous — use deploy preview for smoke.)

Paste this block into Cursor.

```text
ACTIVE PROJECT:
Kelly Grappe for Arkansas Secretary of State — RedDirt repo.
This is the Kelly SOS production system: public site + admin + database + workflows.

ACTIVE SLICE:
Section 2 — finalize privacy/terms with counsel; treasurer on donate/paid-for; run KELLY_SOS_INTAKE_SMOKE against Netlify deploy preview base URL; Steve demo walkthrough per KELLY_SOS_DEMO_AND_DEPLOY.md § Day 7.

HARD RULES:
- No deletes.
- No repo moves.
- No template extraction.
- No AJAX / PhatLip / countyWorkbench work.
- Kelly-only contacts, volunteers, finance, strategy, DB, env.
- No unsourced opponent claims.
- No secrets in chat, docs, commits, screenshots, logs, or code.
- Do not rewrite legal copy beyond typos and structure unless Steve/counsel approves.

READ FIRST:
- docs/KELLY_SOS_DAY_6_SECTION_1_REPORT.md (what Section 1 already delivered)
- docs/KELLY_SOS_DEMO_AND_DEPLOY.md (§ Launch lock)
- docs/KELLY_SOS_COMPLIANCE_CHECKLIST.md
- docs/KELLY_SOS_INTAKE_SMOKE.md (set $base to deploy preview)
- docs/deployment.md

OBJECTIVE:
Close human gates; prove intake on a **non-production** Netlify URL; prepare Day 7 demo and go/no-go.

TASKS:
1) Counsel sign-off or edits on /privacy and /terms (drafts).
2) Treasurer confirmation on paid-for line and external donate links.
3) From Netlify: open **deploy preview** URL → run intake smoke ($base) → log KELLY_SOS_BUILD_LOG.md.
4) Optional: mobile spot-check on preview (home, get-involved, donate, legal).
5) Update KELLY_SOS_LAUNCH_STATUS known risks after decisions.

QUALITY GATE:
- npm run check (local or CI)
- Hosted preview smoke logged

After Cursor: Steve — Day 7 launch lock per KELLY_SOS_DEMO_AND_DEPLOY.md.
```

*Day 5 script (archived): compliance work shipped 2026-04-27 — see `KELLY_SOS_DAY_5_COMPLETION_REPORT.md`.*
