# Web manual — visual design notes (Pass 2B)

## Brand (Kelly Grappe / RedDirt)

- **Colors:** `globals.css` — `--kelly-official-navy` primary, gold accent, **fog/mist** surfaces; **no** parallel palette.  
- **Type:** League Spartan (display / section), Raleway (body) — `src/app/layout.tsx`.  
- **Dark mode:** Optional reading mode; manual long-form benefits from `html.dark` tokens.

## Layout: **large desktop, clean path, minimal endless scroll**

- **Not** a single infinite marketing scroll for the **book**.  
- **Part hub** pages: **wide** (max 1400px) two-column: **left** = part TOC (sticky), **right** = chapter intro + **“next / prev”** in **footer** of every page.  
- **Hover** **menus** (desktop): top bar with **hover**-revealed subparts (Parts I–XX + **Lifecycle**), **back** to `/manual` on logo.  
- **Mobile:** bottom **sheet** for part TOC; **back** in browser + persistent **breadcrumbs** at top.  
- **Path navigation:** **linear** “next chapter” for readers who want 500-page linear read; **lateral** links for role/workflow/phase from **index** pages.

## Role, workflow, and phase

- **Role** pages: hero = purpose one-liner; **tab** for Workbench, Tools, **Election Day**; **KPIs** in **public-safe** phrasing.  
- **Phase** pages: one **timeline** bar 0–17; **“repo support”** and **gaps** as **callouts** (design system **warning** style for **gaps**).  
- **Start by role / workflow / phase** on home: three **large** **tiles** (navy field, gold **rule** under title).

## Dashboard manual **panels** (target)

- **Slide-over** 480px, **navy** header, **gold** “open full manual” **button**; does **not** cover whole screen on **desktop** (keeps app context).  
- **In-app** link: “Open **Pathway** chapter for your role” — **not** “AI” or model names.

## Search

- **Command palette**-style (⌘K) in staff build: **filter** to **maturity:staff** and **inventories**.

## Accessibility

- Contrast: navy–gold–white meets WCAG for body; Mermaid diagrams need a text alternative under the fold.

**Last updated:** 2026-04-27 (Pass 2B)
