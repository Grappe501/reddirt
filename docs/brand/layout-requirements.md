# Layout requirements (non-negotiable)

## Full-bleed first

- **Edge-to-edge sections** for heroes, story bands, color fields, imagery, and CTAs.  
- No default “narrow card floating on white” template that wastes horizontal space on desktop or tablet.  
- Each breakpoint should feel **intentional**, not like a stretched phone layout.

## Structure

- **Outer:** full-width section wrapper (`width: 100%`).  
- **Inner:** content container only for **readability** (max ~1200–1300px, centered).  
- Grids **expand** with viewport; use split layouts (text + image), multi-column cards on wide screens.

## Anti-patterns

- Large empty side gutters that make the site feel like a slim column.  
- “Boxed” main column on a full white field as the default look.  
- Ignoring horizontal space on desktop.

## For implementers (Cursor / engineers)

- Start every section with a **full-width** wrapper; constrain **text measure** inside, not the section background.  
- Sticky nav: may be transparent → solid on scroll.  
- Mobile: stack; maintain **large tap targets**; cards as primary surface where helpful.
