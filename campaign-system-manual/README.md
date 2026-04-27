# Campaign System Manual

**Product:** Red Dirt Democrats — **Kelly Grappe for Arkansas Secretary of State** production site and **Campaign Operating System** (Next.js, Prisma/Postgres, public organizing surfaces, member routes, admin Workbench).  
**Lane:** `RedDirt/` only.  
**Status:** **Pass 2 complete (2A + 2B)** — engineering cross-wiring report, lifecycle workflows, 26 role manuals (23-section template), chapters 20–23, regraded readiness. **No** app code changes in manual passes.

## What this manual is

This is the **official owner’s manual** for the **Campaign Operating System**: how a statewide campaign can **start with one person**, **recruit and onboard organically**, **guide every user** through a **Guided Campaign System** and **Pathway Guide** (public language avoids calling the system “AI”), **operate the Workbench** and approvals, **track KPIs and Field Intelligence** at the right geographic layers, and **scale** to a full Arkansas operation with **transparency, competence, and people-powered** organizing.

The manual is written **as a book first** (serious, operational, executive). A future **web manual** (see `web-presentation/`) will layer navigation and search without replacing this source structure.

## Public vocabulary (approved)

Use these terms in public-facing or volunteer-facing copy:

- **Campaign Companion** — human-centered assistance and guided flows  
- **Guided Campaign System** — structured onboarding and next-step guidance  
- **Organizing Guide** — training and playbooks for field and relational work  
- **Field Intelligence** — aggregate, permissioned operational insight (not voter dossiers)  
- **Message Engine** — governed message patterns and channel packages (aligns with internal Message Content Engine; see `docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`)  
- **Campaign Operating System** — the whole: people, data boundaries, Workbench, dashboards, narrative distribution  
- **Workbench** — operator queue, tasks, comms, and review (`/admin/workbench` and related)  
- **Pathway Guide** — role and geography progression (volunteer → leader → county, etc.)

Do **not** use “AI” as the product name in public copy; internal engineering may use model-backed tools under admin guardrails (documented in technical chapters).

## How to use this repository folder

| Path | Purpose |
|------|---------|
| `MANUAL_TABLE_OF_CONTENTS.md` | Book-style TOC; expandable to 500–1000 pages |
| `MANUAL_STYLE_GUIDE.md` | Voice, structure, and alignment with site brand |
| `MANUAL_BUILD_PLAN.md` | How the manual matures in passes |
| `SYSTEM_READINESS_REPORT.md` | System maturity (0–6); **Pass 2A regrade** |
| `SYSTEM_CROSS_WIRING_REPORT.md` | **Pass 2A** engineering cross-wiring (intake, Prisma, Workbench) |
| `MANUAL_PASS_2_COMPLETION_REPORT.md` | **Pass 2** file list and next steps |
| `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` | Decisions needed to close policy gaps |
| `SYSTEM_MAP_INDEX.md` | High-level maps and Mermaid entry points |
| `ROLE_MANUAL_INDEX.md` | **26** roles; each `roles/<slug>/README.md` (Pass 2B template) |
| `chapters/` | Thematic chapters **00–19** + **20–23** (Companion, strategy, ED command, Pathway) |
| `maps/` | Diagram-first system references |
| `inventories/` | Routes, features, components, data, documentation |
| `workflows/` | End-to-end operational narratives |
| `web-presentation/` | Future site IA and design notes (no app routes in Pass 1) |

## Source of truth in code

- Application code: `H:\SOSWebsite\RedDirt\src\`  
- Prisma schema: `H:\SOSWebsite\RedDirt\prisma\schema.prisma`  
- Plans and audits: `H:\SOSWebsite\RedDirt\docs\` (especially OIS, county intel, Power of 5, message/narrative plans, `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`)

## Maintenance

- **No destructive changes** to application code from this folder.  
- **No new dependencies** for the manual.  
- Update `SYSTEM_READINESS_REPORT.md` and inventories when major systems ship.

**Last updated:** 2026-04-27 (Pass 1 scaffold).
