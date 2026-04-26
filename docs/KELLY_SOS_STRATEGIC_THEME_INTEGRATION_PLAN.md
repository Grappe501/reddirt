# Kelly SOS — strategic theme integration plan (phased)

**Status:** Adopted Day 2 (2026-04-26) — **docs + scaffolding first**; **staged** public use.  
**Principle:** No “theme dump” on launch — integrate **by page purpose** and **by approval**.

---

## 1. Theme inventory (code + docs)

| Theme | Research doc | Editor TS (optional) | Public Day 2 |
|-------|--------------|----------------------|----------------|
| Winthrop Rockefeller / **reform tradition** | `docs/research/WINTHROP_ROCKEFELLER_REFORM_CAMPAIGN_RESEARCH.md` | `src/content/strategicThemes/rockefellerReform.ts` | **Light** (homepage / proof copy only) |
| SOS as **keeper of public record** / “civic librarian” metaphor | `docs/research/SOS_AS_KEEPER_OF_RECORDS_MESSAGING.md` | `src/content/strategicThemes/keeperOfRecords.ts` | **About** hero subtitle + snippets |
| **Opponent contrast** (sourced) | `docs/research/OPPONENT_RECORD_CONTRAST_RESEARCH.md` + `docs/legal/OPPONENT_CONTRAST_FACT_CHECK_MATRIX.md` | `src/content/strategicThemes/opponentContrast.ts` | **Not** in Day 2 body pages — **placeholders only** |
| **Extension Homemakers** calendar intel | `docs/research/ARKANSAS_EXTENSION_HOMEMAKERS_EVENT_INTELLIGENCE.md` | `src/content/events/tentativeExternalEvents.ts` | **Not** in public event merge — **admin/volunteer** |
| **Safe snippets** (all) | `docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md` | n/a | Comms, future CMS blocks |

---

## 2. Where themes should land (rollout)

| Surface | Theme(s) | Notes |
|---------|-----------|--------|
| **Homepage** | **Rockefeller-inspired** (light) + **existing** trust/integrity | One **tone** line in `homepagePremium` — **no** new sections Day 2 |
| **About / Meet Kelly** | **Keeper of the public record** | Metaphor, **not** “state librarian” title |
| **Priorities** | **Citizen power / fair elections** + accountability pillar | **Already** aligned; add **librarian** phrasing in **Day 3/4** if counsel OK |
| **Direct democracy** / **ballot initiative** | **Opponent** contrast (optional future block) | **Only** with **sourced** matrix + counsel — **not** Day 2 |
| **Events / admin** | **EHC** tentative intel | **Outreach** — **not** public campaign event claims |
| **Blog / news / editorial** | Long-form **Rockefeller** comparison, **keeper** essay | `editorial` or `blog` when Steve assigns |
| **Volunteer** internal notes | EHC + county extension targets | `tentativeExternalEvents` + field docs — **not** `(site)` |

---

## 3. What requires Steve / **legal** approval

- **Opponent** **named** in any public asset.  
- **Long** or **attributed** **Rockefeller** **quotes** in **paid** media.  
- **Any** **attack** or contrast line tied to a **bill** in **paid** or **stand-alone** attack page.  
- **Extension Homemakers** listed as if **sponsored** by the campaign.

---

## 4. Day 3 / Day 4 integration (suggested)

| Day | Action |
|-----|--------|
| **3** | Wire **1–2** `editorial` or **Substack** outlines from research docs; staff confirm **EHC** dates. |
| **4** | Optional `priorities` **QuoteBand** or second **hero** line from `keeperOfRecords`; **ballot** page **fenced** “record comparison” if matrix complete. |
| **Post-launch** | If **opponent** contrast goes live, **dedicated** `/editorial/...` with **citations** — not homepage. |

---

## 5. Firewall

- `tentativeExternalEvents.ts` **must not** be imported by `getHomepage` / `events` **merge** without explicit product decision.  
- `sos-public` still **sister** app — this plan **RedDirt**-scoped unless Steve opens a packet.
