# Manual — Style Guide

**Purpose:** Keep the Campaign Operating System Manual **official**, **operational**, and **aligned** with the Kelly Grappe for Arkansas Secretary of State public site. This is an owner’s manual, not a blog or opinion column.

## Voice and tone

- **Clear, direct, complete sentences** — no filler, no hype, no “revolutionary” language.  
- **Operational** — who does what, by when, with which tool.  
- **Respectful of the reader** — staff, volunteers, leaders, candidate, and technical builders may use the same book with different entry points.  
- **Arkansas-rooted** — place names and geographic hierarchy where they clarify responsibility (state → region → county → local).

## Brand alignment (from codebase)

**Source of truth for visual tokens:** `H:\SOSWebsite\RedDirt\src\app\globals.css` (comments reference official brand card under `brands/kelly-grappe-sos/…`).

| Token / concept | Value / note |
|-----------------|--------------|
| Primary / authority | Navy `--kelly-official-navy` (#000066), `--brand-primary` |
| Accent / action | Gold `--kelly-official-gold` (#ca913d), `--kelly-gold-soft` |
| Text | `--kelly-ink` / `--color-text-primary` (light); dark mode tokens under `html.dark` |
| Surfaces | `--kelly-fog`, `--kelly-mist`, `--kelly-band-wash` for section bands |
| Typography | `League Spartan` — headings (`--font-heading`); `Raleway` — body (`--font-body`) |
| Dark mode | Supported via `reddirt-theme` and `.dark` on `html` (see `src/app/layout.tsx`, `ThemeProvider`) |

**Manual PDF / future web manual:** use these names and hex values for consistency; do not invent a parallel palette without owner sign-off.

**Brand feeling (narrative):** serious, trustworthy, modern, people-powered, service-oriented, transparent about data limits, **executive** without coldness.

## Vocabulary: public vs internal

- **Public / volunteer-facing:** Campaign Companion, Guided Campaign System, Organizing Guide, Field Intelligence, Message Engine (or “message support” where softer), Campaign Operating System, Workbench, Pathway Guide. **Do not** lead with “AI” in public titles or product names.  
- **Internal / admin:** May use plan, draft, segment, workflow, model-backed tools where needed; glossary maps internal term → public label.

## Structure of a role chapter (required elements)

1. What the role is  
2. Why it matters  
3. System fit (up/down hierarchy)  
4. Expectations and boundaries  
5. First actions (24h / 7d)  
6. Weekly rhythm  
7. Training path  
8. Dashboard / surfaces  
9. KPIs (honest, aggregate where public)  
10. Approval authority  
11. Escalation paths  
12. Growth to next role  
13. Local → state impact line  

## Figures and diagrams

- **Mermaid** is acceptable in repo docs where diagrams clarify flows (journey, hierarchy, approvals, rollups).  
- Prefer **flowcharts and layered maps** over decorative graphics.

## Legal and data hygiene

- No **unsourced** opposition claims.  
- No **PII** or secrets in examples, screenshots, or sample payloads.  
- Voter data: reference **policy** and **permission tiers**, not row-level detail in this manual.

## Versioning

- Date major revisions; tie release notes to git tags and `package.json` version when documenting production cuts.
