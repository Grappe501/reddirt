# Debate week — next-level upgrade plan (deep analysis)

**Date:** 2026-06-03  
**Primary audience this round:** Arkansas county clerks, election commissioners, quorum courts  
**Candidates in field:** Kelly Grappe (D), Kim Hammer (R), Michael Packo (Libertarian, scaffold)

---

## Executive summary

The workbench is already strong on **Hammer structure** (v4 hub, bill playbooks, P4 war room, claims gate). To become the tool Kelly spends **all** prep time in, we must optimize for **one audience at a time**, **one day at a time**, and **evidence discipline** — not more modules.

**Shipped in this tranche (P5 county-clerk week):**

- `countyClerkSevenDayPrepPath.ts` — 7 days × ordered readings × clerk positioning × superiority angles
- `/admin/intelligence/county-clerk-week` — full path + contrast + Packo scaffold
- `NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE=county_clerks` — clerk-first nav via `debate-week-nav.ts`
- Michael Packo opposition **scaffold** + opponents hub
- Hub integration (`V7CountyClerkPrepPath`)

**Still the binding constraint:** retrieval tasks OPEN, thin clips, NEEDS_RESEARCH claims. UI depth ahead of evidence — close the gap or Kelly risks overclaiming in clerk rooms.

---

## Strategic goal: “the only app Kelly opens”

| Habit | What we built | What’s next |
|-------|----------------|-------------|
| Morning: “what do I read today?” | 7-day path with minutes + extract goals | Push notification / email digest (P6) |
| Before event: pocket answers | Day 6 live card + claims red lines | Printable PDF one-pager (P6) |
| When Hammer speaks | Trap matrix + cross-exam bank | Verified clip timestamps (P5 evidence) |
| After event | Memory + claims ingest | Clerk quote institutional memory (P6) |
| Third candidate | Packo scaffold | Full Packo module parity with Hammer (P7) |

---

## County clerks — positioning architecture

### What clerks reward

- Specific SOS offers: hotline, implementation calendar, training dollars, respect for statutory roles
- Candidates who **listened** and remember county name next visit
- Honesty when evidence is incomplete

### What clerks punish

- Culture-war openers, unfunded mandate hand-waving, Heritage-style rankings without county math
- Opponent-bashing without implementation alternative
- Unverified fraud statistics

### Hammer — where we want him (trap lanes)

1. **Authorship without implementation** — “I wrote the bills” → funding line items per county  
2. **2025 fresh start** → 2021 six-bill package continuity  
3. **#1 ranking** → clerk workload + open research questions  
4. **Poll watcher transparency** → who trains, who pays disputes  
5. **Petition fraud** → show cases that justified each rule change  

### Kelly — superiority (job fit, not smear)

- SOS as **service** to 75 counties equally  
- **Implementation plan** vs legislative authorship  
- **Claims gate** discipline vs opponent paraphrase  
- **County burden vocabulary** (actors: clerk, commissioners, quorum court)  

See `HAMMER_VS_KELLY_CLERK_MATRIX` in `countyClerkSevenDayPrepPath.ts` and `COUNTY_CLERK_EVENT_FRAME` in `kellyOpponentContrastPlaybook.ts`.

---

## Seven-day path (operator summary)

| Day | Focus | Kelly outcome |
|-----|--------|----------------|
| 1 | SOS as service | Three pillars without opponent-first language |
| 2 | 2021 pattern | Continuity narrative with verified act numbers |
| 3 | Trap setup | Implementation questions memorized |
| 4 | Fair contrast | Acknowledge strength → SOS administrator gap |
| 5 | Bill drills | SB250 / HB1457 / SB291 30s answers |
| 6 | Live clerks week | Listen 40% / pledge 40% / contrast 20% |
| 7 | Debrief + Packo watch | Verified follow-up; assign Packo retrieval |

Full detail: `/admin/intelligence/county-clerk-week`.

---

## Michael Packo — opposition research plan

**Status:** SCAFFOLD only (`data/opposition/michael-packo-profile/michael-packo-opposition-scaffold.json`).

### Phase A — Identity & ballot (PACKO-01, PACKO-03)

- Arkansas ethics / SOS filing  
- Campaign finance if applicable  
- Bio timeline JSON  

### Phase B — Issue harvest (PACKO-02, PACKO-04)

- Quotes on mandates, county authority, petition access  
- Libertarian platform vs SOS statutory duties  
- Issue matrix vs Kelly three pillars  

### Phase C — Field strategy (PACKO-05, PACKO-07)

- When Packo rhetoric **helps** Kelly (anti-unfunded-mandate) vs **splits** clerk coalition  
- Rule: **no Packo elevation in clerk rooms** unless asked  

### Phase D — Media (PACKO-06)

- Clips/quotes into film room with same governance as Hammer  

### Phase E — Product (P7)

- Routes: `/admin/intelligence/opponents/michael-packo/*`  
- Registry modules mirroring Hammer KH layers  
- Contrast-vs-Kelly page with claims gate  

See also: `docs/intelligence/MICHAEL_PACKO_OPPOSITION_PLAN.md`.

---

## Upgrade tranches (P5–P8)

### P5 — Evidence closure (highest ROI)

- [ ] Complete retrieval tasks (target: 7/7 COMPLETE for debate anchors)  
- [ ] Verbatim quote ledger with Arkleg + news URLs  
- [ ] Act-text verification pass on all 29 bills  
- [ ] Second opponent clip minimum for film room  
- [ ] County clerk testimonial capture (permissioned) → memory ledger  

### P6 — Kelly daily habit layer

- [ ] Morning “Day N” email/push from 7-day path  
- [ ] Printable clerk-room pocket card (claims-safe)  
- [ ] Progress tracker: Kelly marks day complete  
- [ ] Staff dashboard: which counties visited, follow-ups due  

### P7 — Packo + multi-candidate

- [ ] Full Packo profile ingest  
- [ ] Opponents hub v2 with side-by-side readiness scores  
- [ ] Three-way debate simulator (Hammer / Packo / Kelly)  

### P8 — Scale & performance

- [ ] Edge-cache v4 hub packet on Netlify  
- [ ] Route consolidation: thin wrappers → registry only  
- [ ] Offline PWA slice for debate day (read-only packet)  

---

## Hardening pass findings

1. **Launch mode** skips heavy loaders — good for Netlify; ensure clerk-week routes stay launch-safe.  
2. **Claims ledger** must gate every clerk-room line — Day 6 success metric is zero NEEDS_RESEARCH spoken.  
3. **“Against the people”** framing — replace with **burden on clerks/voters** (governance-safe).  
4. **KH-0B narratives** — many still scaffolds; deepen county-dollar stories per bill.  
5. **Nav duplication** — `getDebateWeekNavItems()` fixes clerk week; audit Campaign OS full sidebar overlap.  

---

## Netlify deploy checklist

```toml
NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE = "opposition_debate"
NEXT_PUBLIC_DEBATE_PRIMARY_AUDIENCE = "county_clerks"
```

Run before deploy:

```bash
npm run agents:test-debate-intelligence-county-week
npm run typecheck
```

---

## Success metrics (one week)

- Kelly completes 7-day path (self-reported or staff-tracked)  
- ≥3 county clerk follow-ups scheduled from Day 6  
- Zero public lines from NEEDS_RESEARCH queue  
- Packo PACKO-01–04 at PARTIAL minimum before any contrast ad  
- Hammer trapped on implementation question in ≥1 joint event (staff debrief note)  
