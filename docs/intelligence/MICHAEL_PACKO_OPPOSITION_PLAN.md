# Michael Packo — Libertarian SOS opposition research plan

**Candidate:** Michael Packo (Libertarian), Arkansas Secretary of State 2026  
**Workbench status:** SCAFFOLD (`michael-packo-opposition-scaffold.json`)  
**Do not publish contrast** until PACKO-01 through PACKO-04 are at least PARTIAL with counsel review.

---

## Why Packo matters

- **Protest vote** lane may absorb anti-establishment energy that otherwise hurts Kelly in a plurality race  
- **Anti-mandate rhetoric** may sound clerk-friendly — risk of Kelly being outflanked on “burden” without losing integrity frame  
- **Petition/access** voters may split between Kelly (participation + integrity) and libertarian skepticism of rules  

Packo is **secondary** to county clerks week. In clerk rooms: **do not mention** unless asked.

---

## Research queue (from scaffold)

| ID | Task | Owner | Deliverable |
|----|------|-------|-------------|
| PACKO-01 | Ballot & finance filings | research | Filing summary JSON |
| PACKO-02 | Public statements (elections, mandates, counties) | research | Quote ledger + URLs |
| PACKO-03 | Bio / roles timeline | research | `michael-packo-bio-timeline.json` |
| PACKO-04 | Platform vs SOS duties | research | Issue matrix vs Kelly pillars |
| PACKO-05 | Overlap with Hammer rhetoric | strategy | Contrast map |
| PACKO-06 | Media / social harvest | retrieval | Clip candidates |
| PACKO-07 | Clerk-audience risk | strategy | When-to-mention guide |

---

## Ingest pipeline (when research returns)

1. Drop raw notes in `data/opposition/michael-packo-profile/raw/`  
2. Normalize to `michael-packo-quotes.json`, `michael-packo-bio-timeline.json`  
3. Run claims ingest — tag SUPPORTS / NEEDS_RESEARCH / BLOCKED  
4. Register modules in `kimHammerV4ModuleRegistry` pattern (new `packoModuleRegistry.ts`)  
5. Add routes under `/admin/intelligence/opponents/michael-packo/`  
6. Wire film room in `debateWarRoomP4` for third-candidate lane  

---

## Kelly positioning (draft — verify before public)

**In clerk rooms:** Stay SOS-service; Packo irrelevant unless ballot-access question.  

**In general debate:** Acknowledge ballot access; contrast **administrative readiness** and **75-county partnership**.  

**Claims gate:** No personal attacks; no unverified party-platform quotes.  

**Contrast shape (when evidence ready):**

- Kelly: implements, funds training, publishes rules  
- Hammer: writes rules, light on county implementation  
- Packo: skeptic of mandates — ask for SOS implementation plan, not slogans  

---

## Staff weekly rhythm (after clerks week)

- Monday: check PACKO-02 quote harvest  
- Wednesday: strategy review PACKO-05 overlap with Hammer traps  
- Friday: claims review any Packo social drafts  

---

## Product routes (planned)

| Route | Purpose |
|-------|---------|
| `/admin/intelligence/opponents` | Multi-candidate hub (live) |
| `/admin/intelligence/opponents/michael-packo` | Profile hub |
| `/admin/intelligence/opponents/michael-packo/quotes` | Quote ledger |
| `/admin/intelligence/opponents/michael-packo/contrast-vs-kelly` | Governed contrast |
