# One-off Pass 4 generator — run from campaign-system-manual: python playbooks/_gen_role_playbooks.py
# Remove after use if desired. Output: playbooks/roles/*.md (41 files)

from pathlib import Path

ROLES: list[tuple[str, str, str]] = [
    ("campaign-manager", "Campaign manager (CM)", "Owns day-to-day execution, delegation, and LQA for operations — not sole legal or treasurer authority."),
    ("candidate", "Candidate", "Owns time, public voice, and top-level tone; defers system mechanics to CM and staff leads."),
    ("owner", "Owner", "Break-glass for money, narrative in crisis, and final roster/PII policy — with treasurer and counsel on edges."),
    ("future-candidate-pipeline-lead", "Future candidate pipeline lead", "Builds long-horizon relationship bench without promising tickets or future races."),
    ("fundraising-lead", "Fundraising lead", "Sets ask rhythm, coordinates events and digital asks — all dollars flow treasurer confirmation (Pass 3H)."),
    ("call-time-manager", "Call time manager", "Schedules, scripts, and follow-up for call-time blocks — MCE/NDE as needed for public words."),
    ("grassroots-fundraising-ambassador-coordinator", "Grassroots fundraising ambassador coordinator", "Recruits and coaches ambassadors; commission/ambassador $ is *proposed* until O+T+C sign (3G legal banner)."),
    ("postcard-direct-mail-lead", "Postcard / direct mail lead", "Owns tranche plan, list hygiene handoffs, and vendor/comms alignment — T+M approve externalize."),
    ("volunteer-coordinator", "Volunteer coordinator (V.C.)", "Roster health, tasking, and follow-through — PII and consent with data steward and CM."),
    ("county-coordinator", "County coordinator", "Primary county org lead; pairs with regional/field to avoid double turf claims."),
    ("road-team-lead", "Road team lead", "Deploys in-person support across counties; logistics with advance and field."),
    ("county-party-relationship-steward", "County party relationship steward", "Steward of authentic party org relationships; no invented chair names or meeting dates (Part F, MI §25)."),
    ("rural-organizing-lead", "Rural organizing lead", "Prioritizes small-town and non-metro geographies per county plan — not stereotype copy."),
    ("county-party-meeting-scheduler", "County party meeting scheduler", "Schedules and confirms meetings with stewards; public words through NDE/MCE as needed."),
    ("surrogate-volunteer-presenter-coordinator", "Surrogate & volunteer presenter coordinator", "Trains and deploys messengers; no uncounseled claims or false credentials."),
    ("house-party-host-captain", "House party host captain", "Coaches hosts, RSVP hygiene, and ask mechanics — follow MI contact list rules (§26)."),
    ("endorsement-relationship-program-lead", "Endorsement relationship program lead", "Tracks asks and public quotes; MCE/counsel for ship — see 3D endorsement plan."),
    ("field-manager", "Field manager", "Owns turf, capacity truth, and field program cadence; pairs with V.C. and data."),
    ("sign-holder-captain", "Sign holder captain", "Recruits visibility time windows; permit and safety with visibility lead + counsel if edge."),
    ("voter-file-data-steward", "Voter file & data steward", "Access hygiene, exports, and O-only break-glass — see MI §6 and readiness matrix."),
    ("political-data-analyst", "Political data analyst", "Scenario and path support — *no* invented precinct or opponent numbers; source discipline."),
    ("calendar-travel-scheduler", "Calendar & travel scheduler", "Integrates GCal/DB expectations per 3G pipeline; candidate time with advance."),
    ("local-host-captain", "Local host captain", "Recruits and briefs local hosts for immersion; hospitality and comms with advance."),
    ("campaign-handler-advance-lead", "Campaign handler / advance lead", "Day-of execution, site safety, and candidate movement — MCE/NDE for public lines."),
    ("google-calendar-scheduler", "Google Calendar scheduler", "GCal source-of-truth steps with MI §35; no orphan public events."),
    ("social-media-lead", "Social media lead", "Executes per channel LQA; no off-platform claims that bypass compliance."),
    ("narrative-distribution-lead", "Narrative distribution lead", "Ships MCE/NDE-approved content through approved surfaces — not freelance tone."),
    ("paid-media-vendor-coordinator", "Paid media vendor coordinator", "Vendor scope, buy mechanics, and APA-style paths — T+M+C for legal edges (3C)."),
    ("communications-lead", "Communications lead", "Editorial queue and comms stack — crisis path to O per escalation doc."),
    ("faith-community-invitation-steward", "Faith & community invitation steward", "Worship and faith-adjacent visits only with local sensitivity and C on edge (MI §29)."),
    ("volunteer-fire-department-outreach-lead", "Volunteer fire department outreach lead", "Public safety and community VFD relations — no fake endorsements; advance + field."),
    ("rural-chamber-outreach-lead", "Rural chamber outreach lead", "Chamber and small-business touchpoints; regional messaging through NDE."),
    ("listening-tour-coordinator", "Listening tour coordinator", "Ballot integrity / initiative listening — neutral facilitation; no false stats (3G)."),
    ("focus-category-outreach-lead", "Focus category outreach lead", "EHC/affinity categories per focus plan — MCE/NDE for public copy."),
    ("visibility-materials-lead", "Visibility materials lead", "Signs, banners, merch logistics — T+M for $ and vendor; permit awareness."),
    ("naacp-community-relationship-steward", "NAACP & community relationship steward", "Map-first; no unverified branch claims (MI §22, 3E plan)."),
    ("campus-organizing-lead", "Campus organizing lead", "Campus chapters and student touch — youth rules and MCE/NDE (3E, MI §21)."),
    ("youth-student-coordinator", "Youth & student coordinator", "Minors, schools, and parents first — C on any edge; no public PII on minors."),
    ("training-director", "Training director", "Pathways, certification discipline, and trainer bench — no LMS product claim (readiness)."),
    ("trainer-coach", "Trainer & coach", "Delivers modules and OIS/operator attestation — peer coaching, not ad-hoc access grants."),
    ("power-of-5-leader", "Power of 5 team leader", "Leads a P5 cell: missions, consent, and honest reporting — OIS, not a separate org."),
]

def body(slug: str, display: str, hook: str) -> str:
    return f"""# Role playbook: {display}

**Slug:** `{slug}`  
**Version:** Pass 4 (2026-04-28)  
**Public language:** Organizing Guide, Guided Campaign System, Workbench, Pathway — not “AI.”


1. **Purpose** — {hook}

2. **Mission in the Guided Campaign System** — Translate strategy into *repeatable* tasks, honest KPIs, and clear handoffs; use Pathway and Workbench *when available*, paper/call SOPs when not (see `../../SYSTEM_READINESS_REPORT.md`).

3. **Stakeholder map** — You ↔ CM; parallel lines to treasurer (money), counsel (legal), data steward (PII/exports), MCE/NDE (public words). Owner = break-glass.

4. **Scope in / out** — **In:** duties in `../ROLE_PLAYBOOK_INDEX.md` for this filename. **Out:** final legal, FEC/ethics, or bank truth — those stay treasurer/counsel/owner; do not invent org facts or numbers.

5. **Non-negotiables** — No unsourced claims; PII minimal; `FinancialTransaction` **CONFIRMED** only for money truth; respect 3G commission banner until O+T+C; youth/faith/NAACP rules from MI §21–**37**.

6. **Surfaces** — Workbench tasks/operator queue, Campaign Companion and public pages as policy allows, internal Pathway checklists, email/calendar per `../DASHBOARD_ATTACHMENT_RULES.md`.

7. **Inputs** — OIS, approved scripts, `../TASK_TEMPLATE_INDEX.md` rows you own, `../TRAINING_MODULE_INDEX.md` prerequisites, and CM priorities.

8. **Outputs** — Dated handoffs, clean roster notes, export requests (not unlogged drops), and after-action for repeated failures (section 22).

9. **Cadence** — Start weekly + phase ramp (GOTV tightens to daily); set your sub-cadence with CM so nothing lives only in DMs.

10. **Pre-flight** — PII attestation; channel LQA; budget DRAFT vs CONFIRMED; NDE on public words; county/turf map if geographic.

11. **SOP (happy path)** — Intake work → decompose to tasks → execute with logs → handoff to adjacent roles → report KPIs in dashboard pack when assigned.

12. **PII & data** — Need-to-know, no screenshots of voter rows in public channels, no shadow exports. Escalate bulk export to O path (`../../MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §6, §37).

13. **Finance** — DRAFT entries for costs you initiate; only treasurer **CONFIRMS** public/spend. See `../../FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md` and 3H.

14. **Comms** — MCE/NDE govern voice; for candidate-facing lines use approved templates. Crisis → `../ESCALATION_PATHS.md`.

15. **Approvals** — `../APPROVAL_AUTHORITY_MATRIX.md` row for your work type. Do not "ship" to vendor/public before LQA.

16. **Escalation** — Stuck turf, money over threshold, legal smell, PII risk → timeboxed ping up chain per `../ESCALATION_PATHS.md`.

17. **Task templates** — Map your recurring work to `../TASK_TEMPLATE_INDEX.md` (TT-*) with CM; avoid one-off ad-hoc patterns that bypass queue.

18. **Training** — Prereq modules in `../TRAINING_MODULE_INDEX.md`; stay within `../ROLE_READINESS_MATRIX.md` level unless owner extends.

19. **KPIs** — `../ROLE_KPI_INDEX.md` row; watch for danger signals and avoid vanity counts.

20. **Dashboards** — Attach only packs listed for your role in `../DASHBOARD_ATTACHMENT_RULES.md` + operator instructions.

21. **Handoffs** — Document consumer, due date, and dependency; ping adjacent playbooks in the same `roles/` folder (see `../ROLE_PLAYBOOK_INDEX.md` for pairs).

22. **Phase behavior** — Pre-primary vs summer vs GOTV/ED: compress deadlines, add legal windows, and shrink approval latency per CM calendar.

23. **Failure modes** — Roster rot, hidden exports, "quiet" rewrites to comms, spend without T confirm — each gets an explicit fix path and CM notification.

24. **Open questions** — Track in `../../MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**37 (access, titles, PII) until owner locks policy.

25. **Sources** — `../../CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part B–H as relevant), `../../TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM.md`, 3F/3G plans by domain, and this `playbooks/` library.

**Last updated:** 2026-04-28 (Pass 4)
"""

def main() -> None:
    root = Path(__file__).resolve().parent
    out_dir = root / "roles"
    out_dir.mkdir(parents=True, exist_ok=True)
    for slug, display, hook in ROLES:
        p = out_dir / f"{slug}.md"
        p.write_text(body(slug, display, hook), encoding="utf-8")
    print(f"Wrote {len(ROLES)} files to {out_dir}")


if __name__ == "__main__":
    main()
