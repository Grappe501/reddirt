# Web manual — information architecture (Pass 2B)

## Principles

1. **Book-first** — Navigation order follows `MANUAL_TABLE_OF_CONTENTS.md` (Parts I–XX + lifecycle appendices). Chapters **20–23** are first-class: Campaign Companion, adaptive strategy, Election Day command, Pathway campaign.  
2. **Role is a first-class entry** — Stable slugs under `roles/<slug>/` (26 roles, Pass 2B).  
3. **Search** — Full-text on headings + body; facets: Part, role, workflow, **campaign phase** (0–17 from `DAY_ONE_TO_ELECTION_DAY...`), maturity 0–6 (staff).  
4. **Staff vs public** — Full `inventories/` and Prisma-deep notes in a **staff** build or auth-gated area; public build gets **redacted** excerpts only.  
5. **No secrets** — No env values, no `ADMIN` instructions, no PII samples in any public export.

## Entry points (“start here”)

| Entry | Audience | Loads |
|-------|----------|--------|
| **Start by role** | Volunteer, leader, staff | `ROLE_MANUAL_INDEX` → `roles/<slug>/` |
| **Start by workflow** | Operators, CM | `WORKFLOW_INDEX` → `workflows/*.md` |
| **Start by campaign phase** | CM, owner, leads | `DAY_ONE_TO_ELECTION_DAY_CAMPAIGN_LIFECYCLE.md` (phases 0–17) + TOC subchapters |
| **Start by system** | Engineers | `SYSTEM_CROSS_WIRING_REPORT.md` + `inventories/` |

## Top-level nav (proposed — future site)

- **Overview** (00–02)  
- **Lifecycle** (TOC: Day One launch → ED closeout; links to wf 10)  
- **Journey** (03)  
- **Roles** (26)  
- **Power of 5** (05)  
- **Dashboards & KPIs** (06, 14)  
- **Workbench** (07)  
- **Message & narrative** (08–09)  
- **Field & geography** (10–11)  
- **Principals** (12)  
- **Training** (13)  
- **Data & privacy** (15)  
- **Admin & technical** (16–18) + **Netlify/GitHub** (18 addendum)  
- **Roadmap** (19)  
- **Campaign Companion** (20)  
- **Adaptive strategy** (21)  
- **Election Day command** (22)  
- **Pathway campaign** (23)  
- **Workflows** + **inventories** (staff)  

## Dashboard-attached manual **panels** (target UX)

- **Future auth:** In-profile **drawer** or **right rail** with: primary manual slug, 3 “next reads,” link to full web manual.  
- **OIS / county:** “Field Intelligence — read the honest-data note” + link to ch. 6/11, not raw methodology in UI.  
- **Workbench:** Link to ch. 7 and `TASK_QUEUE...` SOP; never raw `WorkflowIntake.metadata` in HTML.

## Profile-attached manual chapters (configuration)

- `user.manualPrimarySlug` → default `roles/<slug>/README` when `roles[]` exists in product (future).  
- **One** primary; **ladder** links: e.g. `new-volunteer` → `power-of-5-member` → `power-team-leader` as “read up” (Pathway).

## Search / filter model

- **Global** search: title + H2 + first para.  
- **Filters:** role, part, **phase** tag, `maturity:staff-only`.  
- **Back path:** every leaf page has **breadcrumbs** + **persistent** “up” to part index (see visual notes).

**Kelly Grappe** branding: use **navy / gold** per `MANUAL_STYLE_GUIDE.md` and `globals.css` — serious, people-powered, no gimmick “AI” framing.

**Last updated:** 2026-04-27 (Pass 2B)
